import { pool } from "@/lib/db"
import { NextResponse } from "next/server"

/**
 * Student API — List active practice units with question counts.
 * Open for testing (authentication optional).
 */
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT pu.id, pu.unit_no, pu.unit_name,
             COUNT(pq.id) FILTER (WHERE pq.is_active = true) AS question_count
      FROM practice_units pu
      LEFT JOIN practice_questions pq ON pq.unit_id = pu.id
      WHERE pu.is_active = true
      GROUP BY pu.id
      ORDER BY pu.unit_no
    `)

    return NextResponse.json(result.rows)
  } catch (error: any) {
    console.error("[practice/units] Error:", error)
    return NextResponse.json({ error: "Failed to fetch practice units" }, { status: 500 })
  }
}
