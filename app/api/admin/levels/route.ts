import { pool } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
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
