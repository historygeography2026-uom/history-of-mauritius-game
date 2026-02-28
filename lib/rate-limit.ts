/**
 * Simple in-memory rate limiter
 * For production, use Redis-based rate limiting
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

/**
 * Check if a request exceeds rate limit
 * @param identifier - Unique identifier (IP, user ID, etc.)
 * @param limit - Max requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns true if within limit, false if exceeded
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 5,
  windowMs: number = 60 * 1000 // 1 minute default
): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(identifier)

  if (!entry || now > entry.resetTime) {
    // Reset or create new entry
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    })
    return true
  }

  if (entry.count >= limit) {
    return false
  }

  entry.count++
  return true
}

/**
 * Clear rate limit entry
 */
export function clearRateLimit(identifier: string) {
  rateLimitMap.delete(identifier)
}

/**
 * Get client IP address from request
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown"
  return ip.trim()
}

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}, 10 * 60 * 1000)
