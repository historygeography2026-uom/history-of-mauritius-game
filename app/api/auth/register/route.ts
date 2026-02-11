import { NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { hashPassword } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    const client = await pool.connect()

    try {
      // Check if user already exists
      const existingUser = await client.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
      )

      if (existingUser.rows.length > 0) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 400 }
        )
      }

      // Hash password
      const passwordHash = await hashPassword(password)

      // Create new user (snake_case columns to match DB schema)
      const result = await client.query(
        'INSERT INTO users (email, name, password_hash, email_verified, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW(), NOW()) RETURNING id, email, name',
        [email, name, passwordHash]
      )

      const newUser = result.rows[0]

      return NextResponse.json(
        {
          message: "User created successfully",
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
          },
        },
        { status: 201 }
      )
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("[auth/register] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
