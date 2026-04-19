import { pool } from "@/lib/db"
import { hashPassword } from "@/lib/auth-utils"
import { verifyAdminToken } from "@/lib/admin-auth"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const authError = verifyAdminToken(request)
  if (authError) return authError

  try {
    const result = await pool.query(
      `SELECT id, name, email, created_at, updated_at
       FROM users
       ORDER BY created_at DESC`
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("[admin/users] Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const authError = verifyAdminToken(request)
  if (authError) return authError

  try {
    const { userId, newPassword } = await request.json()
    const normalizedUserId = Number(userId)

    if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0) {
      return NextResponse.json({ error: "A valid userId is required" }, { status: 400 })
    }

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    const userResult = await pool.query(
      "SELECT id, email, name FROM users WHERE id = $1",
      [normalizedUserId]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const passwordHash = await hashPassword(newPassword)

    await pool.query(
      "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2",
      [passwordHash, normalizedUserId]
    )

    return NextResponse.json({
      message: "Password replaced successfully",
      user: userResult.rows[0],
    })
  } catch (error) {
    console.error("[admin/users] Error replacing password:", error)
    return NextResponse.json({ error: "Failed to replace password" }, { status: 500 })
  }
}