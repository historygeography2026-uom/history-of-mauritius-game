import { pool } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie")
  if (!cookieHeader?.includes("admin-session=")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await pool.query(
      "SELECT id, name FROM subjects ORDER BY name"
    )
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching subjects:", error)
    return NextResponse.json({ error: "Failed to fetch subjects" }, { status: 500 })
  }
}
