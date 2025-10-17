import { NextRequest, NextResponse } from 'next/server'
import { securityConfig } from './env'

// Rate limiting store (in production, use Redis)
class RateLimitStore {
  private store = new Map<string, { count: number; resetTime: number }>()

  async get(key: string): Promise<{ count: number; resetTime: number } | null> {
    const data = this.store.get(key)
    if (!data) return null
    
    // Clean up expired entries
    if (Date.now() > data.resetTime) {
      this.store.delete(key)
      return null
    }
    
    return data
  }

  async set(key: string, value: { count: number; resetTime: number }): Promise<void> {
    this.store.set(key, value)
  }

  async increment(key: string): Promise<{ count: number; resetTime: number }> {
    const existing = await this.get(key)
    
    if (!existing) {
      const resetTime = Date.now() + securityConfig.rateLimitWindowMs
      const data = { count: 1, resetTime }
      await this.set(key, data)
      return data
    }
    
    existing.count += 1
    await this.set(key, existing)
    return existing
  }

  // Clean up expired entries periodically
  cleanup(): void {
    const now = Date.now()
    for (const [key, data] of this.store.entries()) {
      if (now > data.resetTime) {
        this.store.delete(key)
      }
    }
  }
}

const rateLimitStore = new RateLimitStore()

// Cleanup expired entries every 5 minutes
setInterval(() => rateLimitStore.cleanup(), 5 * 60 * 1000)

export async function rateLimit(
  req: NextRequest,
  maxRequests = securityConfig.rateLimitMax,
  windowMs = securityConfig.rateLimitWindowMs
): Promise<{ success: boolean; limit: number; remaining: number; resetTime: number }> {
  // Get client IP
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown'
  
  // Create rate limit key
  const key = `rate_limit:${ip}:${req.nextUrl.pathname}`
  
  try {
    const data = await rateLimitStore.increment(key)
    
    const remaining = Math.max(0, maxRequests - data.count)
    
    return {
      success: data.count <= maxRequests,
      limit: maxRequests,
      remaining,
      resetTime: data.resetTime,
    }
  } catch (error) {
    console.error('Rate limiting error:', error)
    // On error, allow the request but log the issue
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      resetTime: Date.now() + windowMs,
    }
  }
}

export function createRateLimitResponse(
  result: { success: boolean; limit: number; remaining: number; resetTime: number }
): NextResponse {
  const headers = new Headers({
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
  })

  if (!result.success) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: `Too many requests. You can make ${result.limit} requests per ${Math.floor(
          securityConfig.rateLimitWindowMs / 1000 / 60
        )} minutes.`,
      },
      { status: 429, headers }
    )
  }

  return NextResponse.next({
    request: {
      headers: new Headers({
        ...Object.fromEntries(headers.entries()),
      }),
    },
  })
}

// Security headers middleware
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent XSS attacks
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // HTTPS enforcement
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
  
  // Referrer policy
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.paystack.co;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' data: https: blob:;
      font-src 'self' https://fonts.gstatic.com;
      connect-src 'self' https://api.paystack.co https://res.cloudinary.com;
      frame-src https://js.paystack.co;
    `.replace(/\s+/g, ' ').trim()
  )

  return response
}

// CORS configuration
export function handleCORS(req: NextRequest): NextResponse | null {
  const origin = req.headers.get('origin')
  const allowedOrigins = [
    securityConfig.corsOrigin,
    'http://localhost:3000',
    'http://localhost:3001',
  ]

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 })
    
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    }
    
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    response.headers.set('Access-Control-Max-Age', '86400')
    
    return response
  }

  return null
}

// Input sanitization helpers
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = {} as T
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key as keyof T] = sanitizeInput(value) as T[keyof T]
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key as keyof T] = sanitizeObject(value) as T[keyof T]
    } else {
      sanitized[key as keyof T] = value
    }
  }
  
  return sanitized
}

// MongoDB injection prevention
export function preventMongoInjection<T>(query: T): T {
  if (typeof query !== 'object' || query === null) return query
  
  const sanitized = {} as T
  
  for (const [key, value] of Object.entries(query)) {
    // Remove operators that could be dangerous
    if (key.startsWith('$')) continue
    
    if (typeof value === 'object' && value !== null) {
      sanitized[key as keyof T] = preventMongoInjection(value) as T[keyof T]
    } else {
      sanitized[key as keyof T] = value
    }
  }
  
  return sanitized
}