import crypto from "crypto"
import { NextResponse } from "next/server"

const ADMIN_SESSION_COOKIE = "admin-session"
const ADMIN_SESSION_TTL_SECONDS = 24 * 60 * 60

type AdminSessionPayload = {
  username: string
  exp: number
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
    if (!payload.username || typeof payload.exp !== "number") {
      return null
    }
    return payload
  } catch {
    return null
  }
}

export function createAdminSessionToken(username: string) {
  const secret = getAdminSessionSecret()
  if (!secret) {
    throw new Error("Admin session secret is not configured")
  }

  const payload: AdminSessionPayload = {
    username,
    exp: Math.floor(Date.now() / 1000) + ADMIN_SESSION_TTL_SECONDS,
  }

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url")
  const signature = signPayload(encodedPayload, secret)
  return `${encodedPayload}.${signature}`
}

/**
 * Verify admin session from request cookies.
 * Extracts the admin-session token and validates its signature and expiry.
 * Returns null if valid, or a 401 NextResponse if invalid.
 */
export function verifyAdminToken(request: Request): NextResponse | null {
  const cookieHeader = request.headers.get("cookie")
  const tokenMatch = cookieHeader?.match(new RegExp(`${ADMIN_SESSION_COOKIE}=([^;]+)`))
  const token = tokenMatch?.[1]

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
  if (!payload || payload.exp <= Math.floor(Date.now() / 1000)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  return null
}
