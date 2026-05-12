import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createAdminSessionToken, ADMIN_SESSION_COOKIE } from "@/lib/admin-auth"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export default async function AdminGoogleAuthPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect("/admin?error=google_no_session")
  }

  const allowedEmails = (process.env.ADMIN_GOOGLE_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  const email = session.user.email.toLowerCase()

  if (allowedEmails.length === 0 || !allowedEmails.includes(email)) {
    redirect("/admin?error=google_not_admin")
  }

  const displayName = session.user.name || session.user.email
  const token = createAdminSessionToken(displayName)

  const cookieStore = await cookies()
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  })

  redirect("/admin?google_login=1")
}
