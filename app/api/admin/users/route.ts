import { pool } from "@/lib/db"
import { hashPassword } from "@/lib/auth-utils"
import { verifyAdminToken } from "@/lib/admin-auth"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const authError = verifyAdminToken(request)
  if (authError) return authError

  try {
    const result = await pool.query(
      `SELECT
         u.id,
         u.name,
         u.email,
         (u.password_hash IS NOT NULL) AS has_password,
         COALESCE(
           ARRAY_AGG(DISTINCT a.provider) FILTER (WHERE a.provider IS NOT NULL),
           ARRAY[]::TEXT[]
         ) AS providers,
         u.created_at,
         u.updated_at,
         MAX(up.last_attempted_at) AS last_seen
       FROM users u
       LEFT JOIN accounts a ON a.user_id = u.id
       LEFT JOIN user_progress up ON up.user_id = u.id
       GROUP BY u.id, u.name, u.email, u.password_hash, u.created_at, u.updated_at
       ORDER BY u.created_at DESC`
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("[admin/users] Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const authError = verifyAdminToken(request)
  if (authError) return authError

  try {
    const { name, email, password } = await request.json()

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 })
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [normalizedEmail])
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "A user with that email already exists" }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING id, name, email, created_at, updated_at`,
      [name?.trim() || null, normalizedEmail, passwordHash]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error("[admin/users] Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const authError = verifyAdminToken(request)
  if (authError) return authError

  try {
    const { userId } = await request.json()
    const normalizedUserId = Number(userId)

    if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0) {
      return NextResponse.json({ error: "A valid userId is required" }, { status: 400 })
    }

    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id, email",
      [normalizedUserId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "User deleted successfully", user: result.rows[0] })
  } catch (error) {
    console.error("[admin/users] Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
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
      `SELECT u.id, u.email, u.name,
              (u.password_hash IS NOT NULL) AS has_password,
              EXISTS (
                SELECT 1 FROM accounts a
                WHERE a.user_id = u.id AND a.provider != 'credentials'
              ) AS is_oauth_only_check
       FROM users u WHERE u.id = $1`,
      [normalizedUserId]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Prevent setting a password on a pure OAuth account that has never had one
    // (Admin can still reset if the account originally had a password_hash)
    if (!userResult.rows[0].has_password) {
      return NextResponse.json(
        { error: "This account uses Google sign-in and does not have a password. Password reset is not applicable." },
        { status: 422 }
      )
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