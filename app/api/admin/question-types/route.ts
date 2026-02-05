import { pool } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const result = await pool.query(
      "SELECT id, name FROM question_types ORDER BY name"
    )
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching question types:", error)
    return NextResponse.json({ error: "Failed to fetch question types" }, { status: 500 })
  }
}
