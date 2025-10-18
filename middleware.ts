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

    // Skip role-based checks for auth pages to prevent redirect loops
    const isAuthPage = [
      '/login',
      '/register',
      '/vendor/login',
      '/vendor/register',
      '/forgot-password'
    ].some(path => request.nextUrl.pathname.startsWith(path))

    if (isAuthPage) {
      return NextResponse.next()
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
      const pathname = request.nextUrl.pathname
      
      // Get token from the withAuth wrapper - it should be available on req.nextauth.token
      const token = (request as any).nextauth?.token

      // Admin routes
      if (pathname.startsWith('/admin') && token?.role !== 'admin') {
        return NextResponse.redirect(new URL('/login?callbackUrl=' + encodeURIComponent(pathname), request.url))
      }

      // Vendor routes
      if (pathname.startsWith('/vendor') && token?.role !== 'vendor') {
        return NextResponse.redirect(new URL('/vendor/login?callbackUrl=' + encodeURIComponent(pathname), request.url))
      }

      // Account routes (any authenticated user)
      if (pathname.startsWith('/account') && !token) {
        return NextResponse.redirect(new URL('/login?callbackUrl=' + encodeURIComponent(pathname), request.url))
      }

      // Checkout route (any authenticated user)
      if (pathname.startsWith('/checkout') && !token) {
        return NextResponse.redirect(new URL('/login?callbackUrl=' + encodeURIComponent(pathname), request.url))
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
        const pathname = req.nextUrl.pathname

        // Allow access to public routes
        const isPublicRoute = [
          '/',
          '/login',
          '/register',
          '/forgot-password',
          '/vendor/login',
          '/vendor/register',
          '/api/auth',
          '/api/health',
          '/api/products',
          '/api/search',
          '/api/register',
          '/api/login',
          '/api/vendors/register',
          '/api/vendors/login'
        ].some(path => pathname.startsWith(path))

        if (isPublicRoute) return true

        // Check role-based access for protected routes
        if (pathname.startsWith('/vendor')) {
          return token?.role === 'vendor'
        }

        if (pathname.startsWith('/admin')) {
          return token?.role === 'admin'
        }

        if (pathname.startsWith('/account') || pathname.startsWith('/checkout')) {
          return !!token
        }

        // For protected API routes, require authentication
        if (pathname.startsWith('/api/')) {
          if (pathname.startsWith('/api/vendors/')) {
            return token?.role === 'vendor'
          }
          if (pathname.startsWith('/api/admin/')) {
            return token?.role === 'admin'
          }
          return !!token
        }

        // For other routes, require authentication
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