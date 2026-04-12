import { NextRequest, NextResponse } from "next/server"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: max 3 requests per IP per hour to reduce endpoint abuse
    const clientIp = getClientIp(request)
    if (!checkRateLimit(clientIp + ":forgot-password", 3, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      )
    }

    return NextResponse.json(
      {
        error: "Password reset is temporarily disabled for safety. Please ask a parent, teacher, or the site admin to help you reset your password.",
      },
      { status: 403 }
    )
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { error: "Failed to reset password. Please try again." },
      { status: 500 }
    )
  }
}
