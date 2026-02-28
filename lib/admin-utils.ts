import { cookies } from "next/headers"

/**
 * Verify if user has admin session cookie
 * This is a basic check - in production, you might want to use NextAuth roles
 */
export async function verifyAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get("admin-session")
    return !!adminSession?.value
  } catch (error) {
    console.error("[verifyAdminSession] Error:", error)
    return false
  }
}

/**
 * Export admin session validity check for client-side use
 */
export async function checkAdminAuthorization(): Promise<{
  isAuthorized: boolean
  message?: string
}> {
  const isValid = await verifyAdminSession()
  if (!isValid) {
    return {
      isAuthorized: false,
      message: "Admin session expired. Please log in again.",
    }
  }
  return { isAuthorized: true }
}
