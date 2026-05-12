import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createAdminSessionToken, setAdminSessionCookie } from "@/lib/admin-auth"

/**
 * GET /admin/google-auth
 * Called after Google OAuth completes. Checks if the user's email is in
 * ADMIN_GOOGLE_EMAILS, issues an admin session cookie, and redirects.
 * Must be a Route Handler (not a Server Component page) because
 * cookies().set() is only allowed in Route Handlers in Next.js 15.
 */
export async function GET() {
  const baseUrl =
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"

  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.redirect(new URL("/admin?error=google_no_session", baseUrl))
  }

  const allowedEmails = (process.env.ADMIN_GOOGLE_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  const email = session.user.email.toLowerCase()

  if (allowedEmails.length === 0 || !allowedEmails.includes(email)) {
    return NextResponse.redirect(new URL("/admin?error=google_not_admin", baseUrl))
  }

  const displayName = session.user.name || session.user.email
  const token = createAdminSessionToken(displayName)

  const response = NextResponse.redirect(new URL("/admin?google_login=1", baseUrl))
  setAdminSessionCookie(response, token)

  return response
}
