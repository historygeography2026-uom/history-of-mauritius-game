import { pool } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/admin-auth"

/**
 * Admin Game-Mode Wrong Answers API
 *
 * ?view=wrong-answers&subject=history|geography&level=1|2|3&range=7d|30d&question_type=..&min_attempts=N
 *     → most-missed game questions (same row shape as practice wrong-answers)
 * ?view=wrong-answer-detail&question_id=N
 *     → per-question stats + wrong answer distribution
 *
 * Matching attempts store { wrong_pairs: [{left,right}], gave_up }. They are
 * exploded so each wrong pair is counted individually, which keeps the
 * "most common wrong answer" meaningful instead of grouping whole attempts.
 */

const QUESTION_TYPES = ["mcq", "matching", "fill", "reorder", "truefalse"]

// Per-wrong-attempt answer expression (explodes matching wrong pairs)
const EXPLODED_WRONG_ANSWERS = (source: string) => `
  SELECT f.question_id, f.student_id, f.attempted_at,
         CASE WHEN f.question_type = 'matching'
              THEN COALESCE(pair.value, '"(Gave up)"'::jsonb)
              ELSE f.student_answer
         END AS answer
  FROM ${source} f
  LEFT JOIN LATERAL jsonb_array_elements(
    CASE WHEN f.question_type = 'matching'
          AND jsonb_typeof(f.student_answer->'wrong_pairs') = 'array'
         THEN f.student_answer->'wrong_pairs'
         ELSE '[]'::jsonb
    END
  ) AS pair(value) ON true
  WHERE NOT f.is_correct
`

export async function GET(request: NextRequest) {
  const authError = await verifyAdminToken(request)
  if (authError) return authError

  const { searchParams } = new URL(request.url)
  const view = searchParams.get("view") || "wrong-answers"

  try {
    if (view === "wrong-answers") {
      return await getWrongAnswers(
        searchParams.get("subject"),
        searchParams.get("level"),
        searchParams.get("range"),
        searchParams.get("question_type"),
        parseInt(searchParams.get("min_attempts") || "1")
      )
    }
    if (view === "wrong-answer-detail") {
      return await getWrongAnswerDetail(searchParams.get("question_id"))
    }
    return NextResponse.json({ error: `Unknown view: ${view}` }, { status: 400 })
  } catch (error) {
    console.error("[admin/game-wrong-answers] Error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}

async function getWrongAnswers(
  subject: string | null,
  level: string | null,
  range: string | null,
  questionType: string | null,
  minAttempts: number
) {
  const conditions: string[] = []
  const params: any[] = []

  if (subject === "history" || subject === "geography") {
    params.push(subject)
    conditions.push(`s.name = $${params.length}`)
  }
  if (level && ["1", "2", "3"].includes(level)) {
    params.push(Number(level))
    conditions.push(`l.level_number = $${params.length}`)
  }
  if (range === "7d") conditions.push(`ga.attempted_at > NOW() - INTERVAL '7 days'`)
  else if (range === "30d") conditions.push(`ga.attempted_at > NOW() - INTERVAL '30 days'`)
  if (questionType && QUESTION_TYPES.includes(questionType)) {
    params.push(questionType)
    conditions.push(`qt.name = $${params.length}`)
  }

  params.push(Number.isFinite(minAttempts) && minAttempts > 0 ? minAttempts : 1)
  const minIdx = params.length
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""

  const sql = `
    WITH filtered AS (
      SELECT ga.question_id, ga.student_id, ga.student_answer, ga.is_correct, ga.attempted_at,
             q.question_text, qt.name AS question_type, s.name AS subject, l.level_number
      FROM game_attempts ga
      JOIN questions q       ON ga.question_id = q.id
      JOIN question_types qt ON q.question_type_id = qt.id
      JOIN subjects s        ON q.subject_id = s.id
      JOIN levels l          ON q.level_id = l.id
      ${where}
    ),
    agg AS (
      SELECT question_id, question_text, question_type, subject, level_number,
             COUNT(*) FILTER (WHERE NOT is_correct)                    AS wrong_count,
             COUNT(*)                                                  AS total_attempts,
             COUNT(DISTINCT student_id) FILTER (WHERE NOT is_correct)  AS unique_wrong_students
      FROM filtered
      GROUP BY question_id, question_text, question_type, subject, level_number
      HAVING COUNT(*) FILTER (WHERE NOT is_correct) >= $${minIdx}
    ),
    exploded AS (${EXPLODED_WRONG_ANSWERS("filtered")}),
    top_wrong AS (
      SELECT question_id, answer, COUNT(*) AS answer_freq,
             ROW_NUMBER() OVER (PARTITION BY question_id ORDER BY COUNT(*) DESC) AS rn
      FROM exploded
      GROUP BY question_id, answer
    )
    SELECT a.question_id, a.question_text, a.question_type,
           a.level_number AS unit_no,
           INITCAP(a.subject) || ' · Level ' || a.level_number AS unit_name,
           a.subject, a.level_number,
           a.wrong_count, a.unique_wrong_students,
           a.total_attempts::int AS total_attempts,
           CASE WHEN a.total_attempts > 0 THEN ROUND(100.0 * a.wrong_count / a.total_attempts) ELSE 0 END AS error_rate_pct,
           tw.answer AS most_common_wrong_answer,
           tw.answer_freq AS most_common_wrong_count
    FROM agg a
    LEFT JOIN top_wrong tw ON tw.question_id = a.question_id AND tw.rn = 1
    ORDER BY a.wrong_count DESC
    LIMIT 200
  `

  const result = await pool.query(sql, params)
  return NextResponse.json(result.rows)
}

async function getWrongAnswerDetail(questionIdParam: string | null) {
  const questionId = Number(questionIdParam)
  if (!questionIdParam || !Number.isInteger(questionId) || questionId <= 0) {
    return NextResponse.json({ error: "question_id must be a positive integer" }, { status: 400 })
  }

  const qRes = await pool.query(
    `SELECT q.id, q.question_text, qt.name AS question_type, s.name AS subject, l.level_number
     FROM questions q
     JOIN question_types qt ON q.question_type_id = qt.id
     JOIN subjects s        ON q.subject_id = s.id
     JOIN levels l          ON q.level_id = l.id
     WHERE q.id = $1`,
    [questionId]
  )
  if (qRes.rows.length === 0) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 })
  }
  const q = qRes.rows[0]

  // Build answer_data in the same shape the dashboard already understands
  let answerData: any = null
  switch (q.question_type) {
    case "mcq": {
      const r = await pool.query(
        `SELECT option_text FROM mcq_options WHERE question_id = $1 AND is_correct = true ORDER BY option_order`,
        [questionId]
      )
      answerData = { correct_answer: r.rows.map((x) => x.option_text).join(" / ") }
      break
    }
    case "truefalse": {
      const r = await pool.query(`SELECT correct_answer FROM truefalse_answers WHERE question_id = $1`, [questionId])
      answerData = { correct_answer: Boolean(r.rows[0]?.correct_answer) }
      break
    }
    case "fill": {
      const r = await pool.query(`SELECT answer_text FROM fill_answers WHERE question_id = $1`, [questionId])
      answerData = { answers: r.rows.map((x) => x.answer_text) }
      break
    }
    case "matching": {
      const r = await pool.query(
        `SELECT left_item, right_item FROM matching_pairs WHERE question_id = $1 ORDER BY pair_order`,
        [questionId]
      )
      answerData = { pairs: r.rows.map((x) => ({ left: x.left_item, right: x.right_item })) }
      break
    }
    case "reorder": {
      const r = await pool.query(
        `SELECT item_text, correct_position FROM reorder_items WHERE question_id = $1 ORDER BY correct_position`,
        [questionId]
      )
      answerData = { items: r.rows.map((x) => ({ text: x.item_text, correct_position: x.correct_position })) }
      break
    }
  }

  const [distribution, stats] = await Promise.all([
    pool.query(
      `WITH filtered AS (
         SELECT ga.*, $2::text AS question_type FROM game_attempts ga WHERE ga.question_id = $1
       ),
       exploded AS (${EXPLODED_WRONG_ANSWERS("filtered")})
       SELECT answer AS student_answer,
              COUNT(*) AS frequency,
              ROUND(100.0 * COUNT(*) / NULLIF(SUM(COUNT(*)) OVER(), 0)) AS pct,
              MIN(attempted_at) AS first_seen,
              MAX(attempted_at) AS last_seen
       FROM exploded
       GROUP BY answer
       ORDER BY frequency DESC
       LIMIT 20`,
      [questionId, q.question_type]
    ),
    pool.query(
      `SELECT COUNT(*) AS total_attempts,
              COUNT(*) FILTER (WHERE is_correct)     AS correct_count,
              COUNT(*) FILTER (WHERE NOT is_correct) AS wrong_count,
              COUNT(DISTINCT student_id)             AS unique_students,
              COUNT(DISTINCT student_id) FILTER (WHERE NOT is_correct) AS students_wrong,
              COUNT(DISTINCT student_id) FILTER (WHERE is_correct)     AS students_correct
       FROM game_attempts
       WHERE question_id = $1`,
      [questionId]
    ),
  ])

  return NextResponse.json({
    question: {
      id: q.id,
      question_text: q.question_text,
      question_type: q.question_type,
      answer_data: answerData,
      unit_no: q.level_number,
      unit_name: `${q.subject.charAt(0).toUpperCase()}${q.subject.slice(1)} · Level ${q.level_number}`,
    },
    stats: stats.rows[0],
    wrong_answer_distribution: distribution.rows,
  })
}
