import { pool } from "@/lib/db"
import { NextResponse } from "next/server"

/**
 * Student API — List Grade 4 practice units with question counts.
 * unit_no 11-16 = History & Geography, 17-24 = Science.
 * Open to all students & visitors (login not required).
 */
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT pu.id, pu.unit_no, pu.unit_name,
             COUNT(pq.id) FILTER (WHERE pq.is_active = true) AS question_count
      FROM practice_units pu
      LEFT JOIN practice_questions pq ON pq.unit_id = pu.id
      WHERE pu.is_active = true AND pu.unit_no BETWEEN 11 AND 24
      GROUP BY pu.id
      ORDER BY pu.unit_no
    `)

    return NextResponse.json(result.rows)
  } catch (error: any) {
    console.error("[g4/units] Error:", error)
    return NextResponse.json({ error: "Failed to fetch Grade 4 practice units" }, { status: 500 })
  }
}
