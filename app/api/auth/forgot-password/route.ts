import { pool } from "@/lib/db"
import { hashPassword } from "@/lib/auth-utils"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, name, newPassword } = await request.json()

    // Validate input
    if (!email || !name || !newPassword) {
      return NextResponse.json(
        { error: "Email, name, and new password are required" },
        { status: 400 }
      )
    }

    // Validate password length
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    // Look up user by email
    const userResult = await pool.query(
      "SELECT id, name, password_hash FROM users WHERE email = $1",
      [email]
    )

    if (userResult.rows.length === 0) {
      // Don't reveal whether the email exists
      return NextResponse.json(
        { error: "If an account with that email and name exists, the password has been reset." },
        { status: 200 }
      )
    }

    const user = userResult.rows[0]

    // Verify the name matches (case-insensitive)
    if (!user.name || user.name.toLowerCase().trim() !== name.toLowerCase().trim()) {
      // Don't reveal whether the email exists or what name is on file
      return NextResponse.json(
        { error: "If an account with that email and name exists, the password has been reset." },
        { status: 200 }
      )
    }

    // Check that this is a credentials account (has a password_hash)
    if (!user.password_hash) {
      return NextResponse.json(
        { error: "This account uses Google or Facebook login. Password reset is not available." },
        { status: 400 }
      )
    }

    // Hash and update password
    const hashedPassword = await hashPassword(newPassword)
    await pool.query(
      "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2",
      [hashedPassword, user.id]
    )

    return NextResponse.json({ success: true, message: "Password reset successfully! You can now log in." })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { error: "Failed to reset password. Please try again." },
      { status: 500 }
    )
  }
}
