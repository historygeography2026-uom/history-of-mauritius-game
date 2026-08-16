import { pool } from "@/lib/db"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

/**
 * Student API — List active practice units with question counts.
 * Requires authentication.
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized. Please log in to access Practice Mode." }, { status: 401 })
  }

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
