import { pool } from "@/lib/db"
import { NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/admin-auth"

/**
 * GET /api/admin/export-csv?type=exam|practice|all
 * Exports student data as CSV.
 * Requires admin authentication.
 */
export async function GET(request: Request) {
  const authError = verifyAdminToken(request)
  if (authError) return authError

  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") || "all"

  try {
    const now = new Date()
    const timestamp = now.toISOString().replace(/[-:]/g, "").replace("T", "_").slice(0, 15)
    let csvContent = ""
    let filename = ""

    if (type === "exam" || type === "all") {
      // Exam/Game leaderboard data
      const examResult = await pool.query(`
        SELECT 
          lb.player_name AS "Student Name",
          COALESCE(s.name, 'N/A') AS "Subject",
          COALESCE(l.level_number::text, 'N/A') AS "Level",
          lb.total_points AS "Points",
          lb.stars_earned AS "Stars",
          lb.questions_completed AS "Questions Completed",
          lb.total_questions AS "Total Questions",
          CASE WHEN lb.timed_out THEN 'Yes' ELSE 'No' END AS "Timed Out",
          TO_CHAR(lb.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS') AS "Date Played"
        FROM leaderboard lb
        LEFT JOIN subjects s ON lb.subject_id = s.id
        LEFT JOIN levels l ON lb.level_id = l.id
        ORDER BY lb.created_at DESC
      `)

      if (type === "all") {
        csvContent += "=== EXAM / GAME RESULTS ===\n"
      }
      if (examResult.rows.length > 0) {
        const headers = Object.keys(examResult.rows[0])
        csvContent += headers.join(",") + "\n"
        for (const row of examResult.rows) {
          csvContent += headers.map(h => escapeCsvField(row[h])).join(",") + "\n"
        }
      } else {
        csvContent += "No exam data found.\n"
      }
    }

    if (type === "practice" || type === "all") {
      // Practice session summary per student per unit
      const practiceResult = await pool.query(`
        SELECT 
          u.name AS "Student Name",
          u.email AS "Email",
          pu.unit_name AS "Unit",
          COUNT(DISTINCT ps.id)::int AS "Total Sessions",
          COUNT(pa.id)::int AS "Questions Attempted",
          SUM(CASE WHEN pa.is_correct THEN 1 ELSE 0 END)::int AS "Correct Answers",
          CASE 
            WHEN COUNT(pa.id) > 0 
            THEN ROUND(SUM(CASE WHEN pa.is_correct THEN 1 ELSE 0 END)::numeric / COUNT(pa.id) * 100, 1)
            ELSE 0 
          END AS "Accuracy %",
          TO_CHAR(MIN(ps.started_at) AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI') AS "First Session",
          TO_CHAR(MAX(ps.started_at) AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI') AS "Last Session"
        FROM practice_sessions ps
        JOIN users u ON ps.student_id = u.id
        JOIN practice_units pu ON ps.unit_id = pu.id
        LEFT JOIN practice_attempts pa ON pa.session_id = ps.id
        GROUP BY u.id, u.name, u.email, pu.unit_name, pu.unit_no
        ORDER BY u.name, pu.unit_no
      `)

      if (type === "all") {
        csvContent += "\n\n=== PRACTICE SESSION RESULTS ===\n"
      }
      if (practiceResult.rows.length > 0) {
        const headers = Object.keys(practiceResult.rows[0])
        csvContent += headers.join(",") + "\n"
        for (const row of practiceResult.rows) {
          csvContent += headers.map(h => escapeCsvField(row[h])).join(",") + "\n"
        }
      } else {
        csvContent += "No practice data found.\n"
      }
    }

    if (type === "exam") filename = `exam_results_${timestamp}.csv`
    else if (type === "practice") filename = `practice_results_${timestamp}.csv`
    else filename = `all_student_data_${timestamp}.csv`

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("[admin/export-csv] Error:", error)
    return NextResponse.json({ error: "Failed to export CSV" }, { status: 500 })
  }
}

function escapeCsvField(value: any): string {
  if (value === null || value === undefined) return ""
  const str = String(value)
  // Wrap in quotes if it contains comma, quote, or newline
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}
