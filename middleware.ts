import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from 'next-auth/middleware'
import { rateLimit, createRateLimitResponse, addSecurityHeaders, handleCORS } from './src/lib/security'

export default withAuth(
  async function middleware(request: NextRequest) {
    // Handle CORS preflight requests
    const corsResponse = handleCORS(request)
    if (corsResponse) {
      return corsResponse
    }

    // Check for protected routes
    const isProtectedRoute = [
      '/admin',
      '/vendor',
      '/account',
      '/checkout'
    ].some(path => request.nextUrl.pathname.startsWith(path))

    // Role-based access control
    if (isProtectedRoute) {
      const token = request.nextauth?.token
      const pathname = request.nextUrl.pathname

      // Admin routes
      if (pathname.startsWith('/admin') && token?.role !== 'admin') {
        return NextResponse.redirect(new URL('/login?callbackUrl=' + pathname, request.url))
      }

      // Vendor routes
      if (pathname.startsWith('/vendor') && token?.role !== 'vendor') {
        return NextResponse.redirect(new URL('/login?callbackUrl=' + pathname, request.url))
      }

      // Account routes (any authenticated user)
      if (pathname.startsWith('/account') && !token) {
        return NextResponse.redirect(new URL('/login?callbackUrl=' + pathname, request.url))
      }

      // Checkout route (any authenticated user)
      if (pathname.startsWith('/checkout') && !token) {
        return NextResponse.redirect(new URL('/login?callbackUrl=' + pathname, request.url))
      }
    }

    // Apply rate limiting to API routes
    if (request.nextUrl.pathname.startsWith('/api')) {
      // More strict rate limiting for auth endpoints
      const isAuthEndpoint = [
        '/api/login',
        '/api/register',
        '/api/auth/forgot-password',
        '/api/auth/reset-password',
      ].some(path => request.nextUrl.pathname.startsWith(path))

      const maxRequests = isAuthEndpoint ? 5 : 100
      const windowMs = isAuthEndpoint ? 15 * 60 * 1000 : 15 * 60 * 1000 // 15 minutes

      const rateLimitResult = await rateLimit(request, maxRequests, windowMs)
      
      if (!rateLimitResult.success) {
        return createRateLimitResponse(rateLimitResult)
      }
    }

    // Continue with the request
    const response = NextResponse.next()

    // Add security headers to all responses
    return addSecurityHeaders(response)
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public routes
        const isPublicRoute = [
          '/',
          '/login',
          '/register',
          '/forgot-password',
          '/api/auth',
          '/api/health',
          '/api/products',
          '/api/search'
        ].some(path => req.nextUrl.pathname.startsWith(path))

        if (isPublicRoute) return true

        // For protected routes, require authentication
        return !!token
      }
    }
  }
)

export const config = {
  matcher: [
    // Match all request paths except static files and images
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
}