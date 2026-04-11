import { pool } from "@/lib/db"
import { hashPassword } from "@/lib/auth-utils"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { email, newPassword } = await request.json()

    // Users can only reset their own password
    if (email !== session.user.email) {
      return NextResponse.json({ error: "You can only reset your own password" }, { status: 403 })
    }

    // Verify password strength
    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    // Check if user exists
    const userResult = await pool.query("SELECT id FROM users WHERE email = $1", [email])

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Hash and update password
    const hashedPassword = await hashPassword(newPassword)
    await pool.query("UPDATE users SET password_hash = $1, updated_at = NOW() WHERE email = $2", [
      hashedPassword,
      email,
    ])

    return NextResponse.json({ message: "Password reset successfully" })
  } catch (error) {
    console.error("Password reset error:", error)
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 })
  }
}
