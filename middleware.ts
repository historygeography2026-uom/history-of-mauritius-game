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
    const host = request.headers.get("host")
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${host}` || "http://localhost:3000"
    
    // Parse URLs to compare just the hostname
    const getHostname = (url: string | null): string | null => {
      if (!url) return null
      try {
        return new URL(url.startsWith("http") ? url : `https://${url}`).hostname
      } catch {
        return null
      }
    }
    
    const appHostname = getHostname(appUrl)
    const originHostname = getHostname(origin)
    const refererHostname = getHostname(referer)
    const requestHostname = host ? host.split(":")[0] : null
    
    // Allow from same origin, no origin (some clients don't send it), or matching hostname
    const hasValidOrigin = 
      !origin || // No origin header (trusted)
      originHostname === appHostname || // Same hostname
      originHostname === requestHostname || // Request hostname matches app
      (referer && refererHostname === appHostname) || // Referer hostname matches
      (referer && refererHostname === requestHostname) // Referer hostname matches request
    
    console.log("[CSRF Check]", {
      method: request.method,
      path: request.nextUrl.pathname,
      origin,
      originHostname,
      referer,
      refererHostname,
      appUrl,
      appHostname,
      host,
      requestHostname,
      hasValidOrigin,
    })
    
    if (!hasValidOrigin) {
      console.warn(`[CSRF] Blocked request - Origin: ${origin}, Referer: ${referer}, Host: ${host}`)
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

