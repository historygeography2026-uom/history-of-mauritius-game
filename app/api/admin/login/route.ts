import { NextResponse } from "next/server"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"
import {
  clearAdminSessionCookie,
  createAdminSessionToken,
  getAdminSessionToken,
  getAdminSessionPayload,
  setAdminSessionCookie,
  verifyAdminToken,
} from "@/lib/admin-auth"

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
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Get admin credentials from environment variables
    const adminEmail1 = process.env.ADMIN_EMAIL_1
    const adminPassword = process.env.ADMIN_PASSWORD
    const adminEmail2 = process.env.ADMIN_EMAIL_2
    const adminPassword2 = process.env.ADMIN_PASSWORD_2

    // Fall back to username-based check if ADMIN_EMAIL_1 is not configured
    const adminUsername = process.env.ADMIN_USERNAME
    const adminUsername2 = process.env.ADMIN_USERNAME_2

    if (!adminPassword) {
      console.error("[admin/login] Admin credentials not configured in environment")
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      )
    }

    const normalizedInput = email.toLowerCase().trim()

    // If email env vars are configured, match by email
    // Otherwise fall back to matching the submitted value against usernames (backward compat)
    const isValidAdmin1 = adminEmail1
      ? normalizedInput === adminEmail1.toLowerCase().trim() && password === adminPassword
      : adminUsername
        ? normalizedInput === adminUsername.toLowerCase() && password === adminPassword
        : false

    const isValidAdmin2 =
      adminPassword2 &&
      (adminEmail2
        ? normalizedInput === adminEmail2.toLowerCase().trim() && password === adminPassword2
        : adminUsername2
          ? normalizedInput === adminUsername2.toLowerCase() && password === adminPassword2
          : false)

    if (!isValidAdmin1 && !isValidAdmin2) {
      console.warn(
        `[admin/login] Failed login attempt for email: ${normalizedInput.substring(0, 3)}***`
      )
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    const displayName = isValidAdmin1
      ? (adminEmail1 || adminUsername || email)
      : (adminEmail2 || adminUsername2 || email)
    const adminToken = createAdminSessionToken(displayName?.toUpperCase() || email.toUpperCase())

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
    setAdminSessionCookie(response, adminToken)

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
    const authError = verifyAdminToken(request)
    if (authError) {
      return NextResponse.json(
        { authenticated: false, error: "Not authenticated" },
        { status: authError.status }
      )
    }

    const payload = getAdminSessionPayload(request)

    const response = NextResponse.json(
      { authenticated: true, username: payload?.username ?? null, message: "Admin session valid" },
      { status: 200 }
    )

    const token = getAdminSessionToken(request)
    if (token) {
      setAdminSessionCookie(response, token)
    }

    return response
  } catch (error) {
    console.error("[admin/verify] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  const response = NextResponse.json(
    { success: true, message: "Admin logout successful" },
    { status: 200 }
  )

  clearAdminSessionCookie(response)
  return response
}
