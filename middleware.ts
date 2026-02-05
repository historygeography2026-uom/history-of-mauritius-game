import { auth as nextAuthMiddleware } from "@/lib/auth"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  // List of public routes that don't require authentication
  const publicRoutes = [
    "/auth/login",
    "/auth/sign-up",
    "/auth/sign-up-success",
    "/auth/callback",
  ]
  
  const isPublicRoute = publicRoutes.some((route) => request.nextUrl.pathname.startsWith(route))
  const isApiRoute = request.nextUrl.pathname.startsWith("/api/")
  const isStaticAsset = /\.(svg|png|jpg|jpeg|gif|webp|ico|js|css)$/.test(request.nextUrl.pathname)

  // Always allow public routes, API routes, and static assets
  if (isPublicRoute || isApiRoute || isStaticAsset) {
    return NextResponse.next()
  }

  // For protected routes, we can't use auth() in middleware due to Edge Runtime limitations
  // The client-side SessionProvider will handle redirects for protected content
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
