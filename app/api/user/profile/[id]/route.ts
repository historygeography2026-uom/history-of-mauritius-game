import { auth } from "@/lib/auth"
import { pool } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    // Only allow users to fetch their own profile
    if (!session?.user?.id || session.user.id !== params.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await pool.query("SELECT id, name, email, image, created_at, updated_at FROM users WHERE id = $1", [
      params.id,
    ])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}
