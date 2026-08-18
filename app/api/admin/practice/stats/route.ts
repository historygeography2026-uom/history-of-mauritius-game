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
        return await getLearnerUnitStats()
      case "hard-questions":
        return await getHardQuestions(searchParams.get("unit"))
      case "learner-detail":
        return await getLearnerDetail(searchParams.get("student_id"))
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
    SELECT
      pu.id, pu.unit_no, pu.unit_name,
      COUNT(DISTINCT pa.student_id) AS unique_students,
      COUNT(pa.id) AS total_attempts,
      ROUND(AVG(pa.is_correct::int) * 100) AS avg_accuracy,
      COUNT(DISTINCT ps.id) AS total_sessions,
      (SELECT COUNT(*) FROM practice_questions pq WHERE pq.unit_id = pu.id AND pq.is_active = true) AS question_count
    FROM practice_units pu
    LEFT JOIN practice_attempts pa ON pa.unit_id = pu.id
    LEFT JOIN practice_sessions ps ON ps.unit_id = pu.id
    WHERE pu.is_active = true
    GROUP BY pu.id
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

async function getLearnerUnitStats() {
  const result = await pool.query(`
    SELECT
      u.name as learner_name,
      pu.unit_name,
      COUNT(pa.id) as attempts
    FROM users u
    JOIN practice_attempts pa ON u.id = pa.student_id
    JOIN practice_units pu ON pa.unit_id = pu.id
    GROUP BY u.name, pu.unit_name
    ORDER BY u.name, pu.unit_name
  `)
  
  return NextResponse.json(result.rows)
}
