import crypto from "crypto"
import { NextResponse } from "next/server"

export const ADMIN_SESSION_COOKIE = "admin-session"

type AdminSessionPayload = {
  username: string
  exp?: number
}

function getAdminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.NEXTAUTH_SECRET || null
}

function signPayload(encodedPayload: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(encodedPayload).digest("base64url")
}

function decodePayload(encodedPayload: string): AdminSessionPayload | null {
  try {
    const decoded = Buffer.from(encodedPayload, "base64url").toString("utf8")
    const payload = JSON.parse(decoded) as AdminSessionPayload
    if (
      !payload.username ||
      (payload.exp !== undefined && typeof payload.exp !== "number")
    ) {
      return null
    }
    return payload
  } catch {
    return null
  }
}

export function getAdminSessionToken(request: Request) {
  const cookieHeader = request.headers.get("cookie")
  const tokenMatch = cookieHeader?.match(new RegExp(`${ADMIN_SESSION_COOKIE}=([^;]+)`))
  return tokenMatch?.[1] ?? null
}

export function setAdminSessionCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  })
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  })
}

export function createAdminSessionToken(username: string) {
  const secret = getAdminSessionSecret()
  if (!secret) {
    throw new Error("Admin session secret is not configured")
  }

  const payload: AdminSessionPayload = {
    username,
  }

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url")
  const signature = signPayload(encodedPayload, secret)
  return `${encodedPayload}.${signature}`
}

/**
 * Verify admin session from request cookies.
 * Extracts the admin-session token and validates its signature.
 * Returns null if valid, or a 401 NextResponse if invalid.
 */
export function verifyAdminToken(request: Request): NextResponse | null {
  const token = getAdminSessionToken(request)

  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  const secret = getAdminSessionSecret()
  if (!secret) {
    console.error("[admin-auth] Missing ADMIN_SESSION_SECRET or NEXTAUTH_SECRET")
    return NextResponse.json(
      { error: "Admin session is not configured" },
      { status: 500 }
    )
  }

  const [encodedPayload, signature] = token.split(".")
  if (!encodedPayload || !signature) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  const expectedSignature = signPayload(encodedPayload, secret)
  const signatureBuffer = Buffer.from(signature)
  const expectedSignatureBuffer = Buffer.from(expectedSignature)

  if (
    signatureBuffer.length !== expectedSignatureBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  ) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  const payload = decodePayload(encodedPayload)
  if (!payload) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  return null
}
