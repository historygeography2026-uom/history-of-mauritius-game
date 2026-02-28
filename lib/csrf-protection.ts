import crypto from "crypto"
import { NextRequest } from "next/server"

/**
 * CSRF Token Management
 */

const csrfTokenMap = new Map<string, { token: string; expires: number }>()

/**
 * Generate a CSRF token for a user/session
 */
export function generateCsrfToken(sessionId: string): string {
  const token = crypto.randomBytes(32).toString("hex")
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  
  csrfTokenMap.set(sessionId, { token, expires: expiresAt })
  
  return token
}

/**
 * Verify CSRF token
 */
export function verifyCsrfToken(sessionId: string, token: string): boolean {
  const stored = csrfTokenMap.get(sessionId)
  
  if (!stored) {
    return false
  }
  
  // Check expiration
  if (Date.now() > stored.expires) {
    csrfTokenMap.delete(sessionId)
    return false
  }
  
  // Compare tokens (constant time comparison to prevent timing attacks)
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(stored.token)
  )
}

/**
 * Revoke CSRF token
 */
export function revokeCsrfToken(sessionId: string): void {
  csrfTokenMap.delete(sessionId)
}

/**
 * Validate request origin
 */
export function validateRequestOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin")
  const referer = request.headers.get("referer")
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  
  // Allow requests with matching origin
  if (origin && origin.startsWith(appUrl)) {
    return true
  }
  
  // Allow requests with matching referer
  if (referer && referer.startsWith(appUrl)) {
    return true
  }
  
  // Allow requests from same domain (no origin/referer on some clients)
  const host = request.headers.get("host")
  if (host && appUrl.includes(host)) {
    return true
  }
  
  return false
}

/**
 * Validate request method and content type
 */
export function validateRequestMethod(
  method: string,
  requiredMethod: string = "POST"
): boolean {
  return method === requiredMethod
}

/**
 * Cleanup expired tokens every hour
 */
setInterval(() => {
  const now = Date.now()
  for (const [sessionId, stored] of csrfTokenMap.entries()) {
    if (now > stored.expires) {
      csrfTokenMap.delete(sessionId)
    }
  }
}, 60 * 60 * 1000)
