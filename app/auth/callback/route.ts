import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// OAuth callbacks are handled by NextAuth at /api/auth/callback/*
// This route exists only as a fallback redirect
export async function GET(request: NextRequest) {
  const redirectTo = new URL(request.url).searchParams.get("redirectTo") || "/"
  return NextResponse.redirect(new URL(redirectTo, request.url))
}
