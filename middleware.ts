import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  // List of public routes that don't require authentication
  const publicRoutes = [
    "/auth/login",
    "/auth/sign-up",
    "/auth/sign-up-success",
    "/auth/forgot-password",
    "/auth/callback",
  ]
  
  const isPublicRoute = publicRoutes.some((route) => request.nextUrl.pathname.startsWith(route))
  const isApiRoute = request.nextUrl.pathname.startsWith("/api/")
  const isStaticAsset = /\.(svg|png|jpg|jpeg|gif|webp|ico|js|css)$/.test(request.nextUrl.pathname)

  // Basic origin validation for state-changing requests (POST, PUT, DELETE)
  const stateChangingMethods = ["POST", "PUT", "DELETE", "PATCH"]
  if (stateChangingMethods.includes(request.method) && isApiRoute) {
    const origin = request.headers.get("origin")
    const referer = request.headers.get("referer")
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    
    // Allow from same origin or no origin (some clients don't send it)
    const hasValidOrigin = 
      !origin || 
      origin.startsWith(appUrl) ||
      (referer && referer.startsWith(appUrl))
    
    if (!hasValidOrigin) {
      console.warn(`[CSRF] Blocked request from origin: ${origin}`)
      return NextResponse.json(
        { error: "Request blocked for security reasons" },
        { status: 403 }
      )
    }
  }

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

