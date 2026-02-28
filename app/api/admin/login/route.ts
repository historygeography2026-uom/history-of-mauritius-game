import { NextResponse } from "next/server"
import crypto from "crypto"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

/**
 * Admin login endpoint
 * Validates credentials stored in environment variables
 * Returns a secure token for session management
 */
export async function POST(request: Request) {
  try {
    // Rate limiting: max 5 attempts per IP per minute
    const clientIp = getClientIp(request)
    if (!checkRateLimit(clientIp, 5, 60 * 1000)) {
      console.warn(`[admin/login] Rate limit exceeded for IP: ${clientIp}`)
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { username, password } = body

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      )
    }

    // Get admin credentials from environment variables
    const adminUsername = process.env.ADMIN_USERNAME
    const adminPassword = process.env.ADMIN_PASSWORD
    const adminUsername2 = process.env.ADMIN_USERNAME_2
    const adminPassword2 = process.env.ADMIN_PASSWORD_2

    if (!adminUsername || !adminPassword) {
      console.error("[admin/login] Admin credentials not configured in environment")
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      )
    }

    // Check against first admin account
    const isValidAdmin1 =
      username.toUpperCase() === adminUsername.toUpperCase() &&
      password === adminPassword

    // Check against second admin account (if configured)
    const isValidAdmin2 =
      adminUsername2 && adminPassword2 &&
      username.toUpperCase() === adminUsername2.toUpperCase() &&
      password === adminPassword2

    if (!isValidAdmin1 && !isValidAdmin2) {
      console.warn(
        `[admin/login] Failed login attempt for username: ${username.substring(0, 2)}***`
      )
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      )
    }

    // Generate a secure admin token (for optional additional validation)
    const adminToken = crypto.randomBytes(32).toString("hex")
    const displayName = isValidAdmin1 ? adminUsername : adminUsername2

    // Set secure httpOnly cookie with token
    const response = NextResponse.json(
      {
        success: true,
        username: displayName?.toUpperCase(),
        message: "Admin login successful",
      },
      { status: 200 }
    )

    // Set secure cookie (httpOnly prevents JavaScript access)
    response.cookies.set({
      name: "admin-session",
      value: adminToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    })

    return response
  } catch (error) {
    console.error("[admin/login] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * Verify admin session
 */
export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie")
    const hasAdminSession = cookieHeader?.includes("admin-session=")

    if (!hasAdminSession) {
      return NextResponse.json(
        { authenticated: false, error: "Not authenticated" },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { authenticated: true, message: "Admin session valid" },
      { status: 200 }
    )
  } catch (error) {
    console.error("[admin/verify] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
