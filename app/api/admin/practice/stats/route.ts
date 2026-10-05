import { pool } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/admin-auth"

async function requireAdmin(request: Request): Promise<NextResponse | null> {
  return verifyAdminToken(request)
}

/**
 * Admin Practice Stats API
 *
 * ?view=overview     → aggregate counts (total sessions, students, attempts, accuracy)
 * ?view=learners     → per-student stats table
 * ?view=units        → per-unit stats table
 * ?view=hard-questions&unit=N → most-missed questions for a unit
 * ?view=learner-detail&student_id=N → single student drill-down
 */
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  const { searchParams } = new URL(request.url)
  const view = searchParams.get("view") || "overview"

  try {
    switch (view) {
      case "overview":
        return await getOverview()
      case "learners":
        return await getLearnerStats()
      case "units":
        return await getUnitStats()
      case "learner-units":
        return await getLearnerUnitStats(searchParams.get("range"))
      case "timeline":
        return await getPracticeTimeline(searchParams.get("range"), searchParams.get("grade"))
      case "hard-questions":
        return await getHardQuestions(searchParams.get("unit"))
      case "learner-detail":
        return await getLearnerDetail(searchParams.get("student_id"))
      case "wrong-answers":
        return await getWrongAnswers(
          searchParams.get("grade"),
          searchParams.get("unit"),
          searchParams.get("range"),
          searchParams.get("question_type"),
          parseInt(searchParams.get("min_attempts") || "1")
        )
      case "wrong-answer-detail":
        return await getWrongAnswerDetail(searchParams.get("question_id"))
      default:
        return NextResponse.json({ error: `Unknown view: ${view}` }, { status: 400 })
    }
  } catch (error: any) {
    console.error("[admin/practice/stats] Error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}

async function getOverview() {
  const [sessionsResult, attemptsResult, studentsResult, accuracyResult, inactiveResult] = await Promise.all([
    pool.query("SELECT COUNT(*) AS total_sessions FROM practice_sessions"),
    pool.query("SELECT COUNT(*) AS total_attempts FROM practice_attempts"),
    pool.query("SELECT COUNT(DISTINCT student_id) AS unique_students FROM practice_sessions"),
    pool.query("SELECT ROUND(AVG(is_correct::int) * 100) AS avg_accuracy FROM practice_attempts"),
    pool.query(`
      SELECT COUNT(DISTINCT student_id) AS inactive_count
      FROM practice_sessions
      WHERE student_id NOT IN (
        SELECT DISTINCT student_id FROM practice_attempts
        WHERE attempted_at > NOW() - INTERVAL '7 days'
      )
    `),
  ])

  // Most and least practiced units
  const unitsResult = await pool.query(`
    SELECT pu.unit_no, pu.unit_name, COUNT(ps.id) AS session_count
    FROM practice_units pu
    LEFT JOIN practice_sessions ps ON ps.unit_id = pu.id
    WHERE pu.is_active = true
    GROUP BY pu.id
    ORDER BY session_count DESC
  `)

  const unitRows = unitsResult.rows
  const mostPracticed = unitRows.length > 0 ? unitRows[0] : null
  const leastPracticed = unitRows.length > 0 ? unitRows[unitRows.length - 1] : null

  return NextResponse.json({
    total_sessions: parseInt(sessionsResult.rows[0].total_sessions),
    total_attempts: parseInt(attemptsResult.rows[0].total_attempts),
    unique_students: parseInt(studentsResult.rows[0].unique_students),
    avg_accuracy: parseInt(accuracyResult.rows[0].avg_accuracy) || 0,
    inactive_students_7d: parseInt(inactiveResult.rows[0].inactive_count) || 0,
    most_practiced_unit: mostPracticed,
    least_practiced_unit: leastPracticed,
  })
}

async function getLearnerStats() {
  const result = await pool.query(`
    SELECT
      u.id, u.name, u.email,
      COUNT(DISTINCT pa.id) AS total_attempts,
      COUNT(DISTINCT ps.id) AS total_sessions,
      COUNT(DISTINCT pa.unit_id) AS units_attempted,
      ROUND(AVG(pa.is_correct::int) * 100) AS accuracy_pct,
      MAX(pa.attempted_at) AS last_activity
    FROM users u
    JOIN practice_attempts pa ON pa.student_id = u.id
    JOIN practice_sessions ps ON ps.student_id = u.id
    GROUP BY u.id
    ORDER BY last_activity DESC NULLS LAST
  `)

  return NextResponse.json(result.rows)
}

async function getUnitStats() {
  const result = await pool.query(`
    WITH attempts_agg AS (
      SELECT unit_id,
             COUNT(DISTINCT student_id) AS unique_students,
             COUNT(id) AS total_attempts,
             ROUND(AVG(is_correct::int) * 100) AS avg_accuracy
      FROM practice_attempts
      GROUP BY unit_id
    ),
    sessions_agg AS (
      SELECT unit_id, COUNT(id) AS total_sessions
      FROM practice_sessions
      GROUP BY unit_id
    ),
    questions_agg AS (
      SELECT unit_id, COUNT(id) AS question_count
      FROM practice_questions
      WHERE is_active = true
      GROUP BY unit_id
    )
    SELECT
      pu.id, pu.unit_no, pu.unit_name,
      COALESCE(aa.unique_students, 0)::int AS unique_students,
      COALESCE(aa.total_attempts, 0)::int AS total_attempts,
      COALESCE(aa.avg_accuracy, 0)::int AS avg_accuracy,
      COALESCE(sa.total_sessions, 0)::int AS total_sessions,
      COALESCE(qa.question_count, 0)::int AS question_count
    FROM practice_units pu
    LEFT JOIN attempts_agg aa ON aa.unit_id = pu.id
    LEFT JOIN sessions_agg sa ON sa.unit_id = pu.id
    LEFT JOIN questions_agg qa ON qa.unit_id = pu.id
    WHERE pu.is_active = true
    ORDER BY pu.unit_no
  `)

  return NextResponse.json(result.rows)
}

async function getHardQuestions(unitParam: string | null) {
  if (!unitParam) {
    return NextResponse.json({ error: "unit query param is required" }, { status: 400 })
  }

  const unitId = Number(unitParam)
  if (isNaN(unitId)) {
    return NextResponse.json({ error: "unit must be a number" }, { status: 400 })
  }

  const result = await pool.query(`
    SELECT
      pq.id, pq.question_text, pq.question_type,
      COUNT(pa.id) AS total_attempts,
      ROUND(AVG(pa.is_correct::int) * 100) AS accuracy_pct,
      COUNT(DISTINCT pa.student_id) AS unique_students
    FROM practice_questions pq
    JOIN practice_attempts pa ON pa.question_id = pq.id
    WHERE pq.unit_id = $1
    GROUP BY pq.id
    HAVING COUNT(pa.id) >= 1
    ORDER BY accuracy_pct ASC, total_attempts DESC
    LIMIT 20
  `, [unitId])

  return NextResponse.json(result.rows)
}

async function getLearnerDetail(studentIdParam: string | null) {
  if (!studentIdParam) {
    return NextResponse.json({ error: "student_id query param is required" }, { status: 400 })
  }

  const studentId = Number(studentIdParam)
  if (isNaN(studentId)) {
    return NextResponse.json({ error: "student_id must be a number" }, { status: 400 })
  }

  // Student info
  const userResult = await pool.query(
    "SELECT id, name, email FROM users WHERE id = $1",
    [studentId]
  )
  if (userResult.rows.length === 0) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 })
  }

  // Per-unit accuracy
  const unitAccuracy = await pool.query(`
    SELECT
      pu.unit_no, pu.unit_name,
      COUNT(pa.id) AS total_attempts,
      ROUND(AVG(pa.is_correct::int) * 100) AS accuracy_pct
    FROM practice_units pu
    JOIN practice_attempts pa ON pa.unit_id = pu.id AND pa.student_id = $1
    GROUP BY pu.id
    ORDER BY pu.unit_no
  `, [studentId])

  // Recent sessions
  const sessions = await pool.query(`
    SELECT
      ps.id, ps.started_at, ps.ended_at, ps.exit_reason,
      pu.unit_no, pu.unit_name,
      COALESCE(array_length(ps.questions_served, 1), 0) AS questions_count,
      COUNT(pa.id) AS answers_given,
      ROUND(AVG(pa.is_correct::int) * 100) AS session_accuracy
    FROM practice_sessions ps
    JOIN practice_units pu ON ps.unit_id = pu.id
    LEFT JOIN practice_attempts pa ON pa.session_id = ps.id
    WHERE ps.student_id = $1
    GROUP BY ps.id, pu.id
    ORDER BY ps.started_at DESC
    LIMIT 20
  `, [studentId])

  // Daily activity (last 30 days)
  const dailyActivity = await pool.query(`
    SELECT
      DATE(attempted_at) AS day,
      COUNT(*) AS attempts,
      ROUND(AVG(is_correct::int) * 100) AS accuracy_pct
    FROM practice_attempts
    WHERE student_id = $1
      AND attempted_at > NOW() - INTERVAL '30 days'
    GROUP BY day
    ORDER BY day
  `, [studentId])

  return NextResponse.json({
    student: userResult.rows[0],
    unit_accuracy: unitAccuracy.rows,
    recent_sessions: sessions.rows,
    daily_activity: dailyActivity.rows,
  })
}

async function getLearnerUnitStats(range: string | null) {
  const p = range || 'all'
  let dateFilter = ''
  if (p === '7d') {
    dateFilter = `WHERE pa.attempted_at > NOW() - INTERVAL '7 days'`
  } else if (p === '30d') {
    dateFilter = `WHERE pa.attempted_at > NOW() - INTERVAL '30 days'`
  }

  const result = await pool.query(`
    SELECT
      u.name as learner_name,
      pu.unit_no,
      pu.unit_name,
      COUNT(pa.id) as attempts
    FROM users u
    JOIN practice_attempts pa ON u.id = pa.student_id
    JOIN practice_units pu ON pa.unit_id = pu.id
    ${dateFilter}
    GROUP BY u.name, pu.unit_no, pu.unit_name
    ORDER BY u.name, pu.unit_no
  `)
  
  return NextResponse.json(result.rows)
}

async function getPracticeTimeline(range: string | null, grade: string | null = null) {
  const p = range || 'all'
  
  let dateExpression = `TO_CHAR(pa.attempted_at, 'YYYY-MM-DD')`
  let dateFilter = ''
  let numDays = 0
  
  if (p === '7d') {
    dateFilter = `AND pa.attempted_at > NOW() - INTERVAL '7 days'`
    numDays = 7
  } else if (p === '30d') {
    dateFilter = `AND pa.attempted_at > NOW() - INTERVAL '30 days'`
    numDays = 30
  } else if (p === 'all') {
    dateExpression = `TO_CHAR(DATE_TRUNC('month', pa.attempted_at), 'YYYY-MM')`
  }

  let gradeFilter = ''
  if (grade === '4') {
    gradeFilter = 'AND pu.unit_no BETWEEN 11 AND 16'
  } else if (grade === '5') {
    gradeFilter = 'AND pu.unit_no BETWEEN 1 AND 5'
  } else if (grade === '6') {
    gradeFilter = 'AND pu.unit_no BETWEEN 6 AND 10'
  }

  const sql = `
    SELECT
      ${dateExpression} as day,
      COUNT(pa.id)::int as attempts,
      COUNT(CASE WHEN pu.unit_no BETWEEN 11 AND 16 THEN 1 END)::int as grade4_attempts,
      COUNT(CASE WHEN pu.unit_no BETWEEN 1 AND 5 THEN 1 END)::int as grade5_attempts,
      COUNT(CASE WHEN pu.unit_no BETWEEN 6 AND 10 THEN 1 END)::int as grade6_attempts
    FROM practice_attempts pa
    JOIN practice_units pu ON pa.unit_id = pu.id
    WHERE pa.attempted_at IS NOT NULL ${dateFilter} ${gradeFilter}
    GROUP BY ${dateExpression}
    ORDER BY day DESC
  `
  const result = await pool.query(sql)
  const rows = result.rows

  // If fixed daily range (7d or 30d), fill in missing dates with 0 so the line chart is always smooth and continuous
  if (numDays > 0) {
    const dayMap = new Map<string, any>()
    rows.forEach(r => dayMap.set(r.day, r))

    const filledRows: any[] = []
    const now = new Date()
    for (let i = 0; i < numDays; i++) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dayStr = d.toISOString().slice(0, 10) // YYYY-MM-DD
      if (dayMap.has(dayStr)) {
        filledRows.push(dayMap.get(dayStr))
      } else {
        filledRows.push({
          day: dayStr,
          attempts: 0,
          grade4_attempts: 0,
          grade5_attempts: 0,
          grade6_attempts: 0,
        })
      }
    }
    return NextResponse.json(filledRows)
  }
  
  return NextResponse.json(rows)
}

/**
 * Tier 1 — Most Missed Questions (Global)
 * Returns questions ranked by wrong-answer popularity with filters.
 */
async function getWrongAnswers(
  grade: string | null,
  unit: string | null,
  range: string | null,
  questionType: string | null,
  minAttempts: number
) {
  const conditions: string[] = ['NOT pa.is_correct']
  const params: any[] = []
  let paramIdx = 1

  // Grade filter
  if (grade === '4') {
    conditions.push('pu.unit_no BETWEEN 11 AND 16')
  } else if (grade === '5') {
    conditions.push('pu.unit_no BETWEEN 1 AND 5')
  } else if (grade === '6') {
    conditions.push('pu.unit_no BETWEEN 6 AND 10')
  }

  // Unit filter
  if (unit) {
    conditions.push(`pq.unit_id = $${paramIdx}`)
    params.push(Number(unit))
    paramIdx++
  }

  // Date range filter
  if (range === '7d') {
    conditions.push(`pa.attempted_at > NOW() - INTERVAL '7 days'`)
  } else if (range === '30d') {
    conditions.push(`pa.attempted_at > NOW() - INTERVAL '30 days'`)
  }

  // Question type filter
  if (questionType && ['mcq', 'matching', 'fill', 'reorder', 'truefalse'].includes(questionType)) {
    conditions.push(`pq.question_type = $${paramIdx}`)
    params.push(questionType)
    paramIdx++
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  // Min attempts threshold param
  params.push(minAttempts || 1)
  const minAttemptsParamIdx = paramIdx

  const sql = `
    WITH wrong_agg AS (
      SELECT
        pq.id AS question_id,
        pq.question_text,
        pq.question_type,
        pu.unit_no,
        pu.unit_name,
        COUNT(pa.id) AS wrong_count,
        COUNT(DISTINCT COALESCE(pa.student_id::text, pa.guest_token::text)) AS unique_wrong_students
      FROM practice_attempts pa
      JOIN practice_questions pq ON pa.question_id = pq.id
      JOIN practice_units pu ON pq.unit_id = pu.id
      ${whereClause}
      GROUP BY pq.id, pu.id
      HAVING COUNT(pa.id) >= $${minAttemptsParamIdx}
    ),
    total_agg AS (
      SELECT
        question_id,
        COUNT(*) AS total_attempts
      FROM practice_attempts
      GROUP BY question_id
    ),
    top_wrong AS (
      SELECT
        pa.question_id,
        pa.student_answer,
        COUNT(*) AS answer_freq,
        ROW_NUMBER() OVER (PARTITION BY pa.question_id ORDER BY COUNT(*) DESC) AS rn
      FROM practice_attempts pa
      JOIN practice_questions pq ON pa.question_id = pq.id
      JOIN practice_units pu ON pq.unit_id = pu.id
      ${whereClause}
      GROUP BY pa.question_id, pa.student_answer
    )
    SELECT
      wa.question_id,
      wa.question_text,
      wa.question_type,
      wa.unit_no,
      wa.unit_name,
      wa.wrong_count,
      wa.unique_wrong_students,
      COALESCE(ta.total_attempts, 0)::int AS total_attempts,
      CASE WHEN COALESCE(ta.total_attempts, 0) > 0
        THEN ROUND(100.0 * wa.wrong_count / ta.total_attempts)
        ELSE 0
      END AS error_rate_pct,
      tw.student_answer AS most_common_wrong_answer,
      tw.answer_freq AS most_common_wrong_count
    FROM wrong_agg wa
    LEFT JOIN total_agg ta ON ta.question_id = wa.question_id
    LEFT JOIN top_wrong tw ON tw.question_id = wa.question_id AND tw.rn = 1
    ORDER BY wa.wrong_count DESC
    LIMIT 50
  `

  const result = await pool.query(sql, params)
  return NextResponse.json(result.rows)
}

/**
 * Tier 2 — Wrong Answer Distribution (Per-Question)
 * Shows what students actually answered wrong, grouped by answer.
 */
async function getWrongAnswerDetail(questionIdParam: string | null) {
  if (!questionIdParam) {
    return NextResponse.json({ error: 'question_id is required' }, { status: 400 })
  }

  const questionId = Number(questionIdParam)
  if (isNaN(questionId)) {
    return NextResponse.json({ error: 'question_id must be a number' }, { status: 400 })
  }

  // Get question info
  const questionResult = await pool.query(
    `SELECT pq.id, pq.question_text, pq.question_type, pq.answer_data,
            pu.unit_no, pu.unit_name
     FROM practice_questions pq
     JOIN practice_units pu ON pq.unit_id = pu.id
     WHERE pq.id = $1`,
    [questionId]
  )

  if (questionResult.rows.length === 0) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 })
  }

  const question = questionResult.rows[0]

  // Get wrong answer distribution
  const distributionResult = await pool.query(
    `SELECT
       pa.student_answer,
       COUNT(*) AS frequency,
       ROUND(100.0 * COUNT(*) / NULLIF(SUM(COUNT(*)) OVER(), 0)) AS pct,
       MIN(pa.attempted_at) AS first_seen,
       MAX(pa.attempted_at) AS last_seen
     FROM practice_attempts pa
     WHERE pa.question_id = $1 AND NOT pa.is_correct
     GROUP BY pa.student_answer
     ORDER BY frequency DESC
     LIMIT 20`,
    [questionId]
  )

  // Get overall stats for this question
  const statsResult = await pool.query(
    `SELECT
       COUNT(*) AS total_attempts,
       COUNT(*) FILTER (WHERE is_correct) AS correct_count,
       COUNT(*) FILTER (WHERE NOT is_correct) AS wrong_count,
       COUNT(DISTINCT COALESCE(student_id::text, guest_token::text)) AS unique_students,
       COUNT(DISTINCT COALESCE(student_id::text, guest_token::text)) FILTER (WHERE NOT is_correct) AS students_wrong,
       COUNT(DISTINCT COALESCE(student_id::text, guest_token::text)) FILTER (WHERE is_correct) AS students_correct
     FROM practice_attempts
     WHERE question_id = $1`,
    [questionId]
  )


  return NextResponse.json({
    question: {
      id: question.id,
      question_text: question.question_text,
      question_type: question.question_type,
      answer_data: question.answer_data,
      unit_no: question.unit_no,
      unit_name: question.unit_name,
    },
    stats: statsResult.rows[0],
    wrong_answer_distribution: distributionResult.rows,
  })
}
