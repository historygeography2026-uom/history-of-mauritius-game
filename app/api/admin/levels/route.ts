import { pool } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/admin-auth"

export async function GET(request: NextRequest) {
  const authError = verifyAdminToken(request)
  if (authError) return authError

  try {
    const result = await pool.query(
      "SELECT id, level_number FROM levels ORDER BY level_number"
    )
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching levels:", error)
    return NextResponse.json({ error: "Failed to fetch levels" }, { status: 500 })
  }
}
