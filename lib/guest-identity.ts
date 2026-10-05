/**
 * Guest Identity — Anonymous User Tracking
 *
 * Generates and persists a UUID in localStorage so anonymous users
 * can be tracked across sessions without requiring login.
 * Registered users don't need this — they use their student_id.
 */

const GUEST_TOKEN_KEY = "hg_guest_token"

/**
 * Get or create a persistent guest token.
 * Returns null if localStorage is unavailable (SSR).
 */
export function getGuestToken(): string | null {
  if (typeof window === "undefined") return null

  try {
    let token = localStorage.getItem(GUEST_TOKEN_KEY)
    if (!token) {
      token = crypto.randomUUID()
      localStorage.setItem(GUEST_TOKEN_KEY, token)
    }
    return token
  } catch {
    // localStorage blocked (private browsing, etc.)
    return null
  }
}
