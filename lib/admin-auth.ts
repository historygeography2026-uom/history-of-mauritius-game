import { NextResponse } from "next/server"
import { validAdminTokens } from "@/app/api/admin/login/route"

/**
 * Verify admin session from request cookies.
 * Extracts the admin-session token and validates it against the in-memory token store.
 * Returns null if valid, or a 401 NextResponse if invalid.
 */
export function verifyAdminToken(request: Request): NextResponse | null {
  const cookieHeader = request.headers.get("cookie")
  const tokenMatch = cookieHeader?.match(/admin-session=([^;]+)/)
  const token = tokenMatch?.[1]

  if (!token || !validAdminTokens.has(token)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  return null
}
