import { NextRequest, NextResponse } from 'next/server'
import { emailVerificationService } from '@/lib/email-verification'
import { validateRequest } from '@/lib/validations'
import { emailVerificationSchema } from '@/lib/validations/auth'
import { logger } from '@/lib/logger'
import connectDB from '@/lib/db'
import { rateLimit, createRateLimitResponse } from '@/lib/security'

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    // Rate limiting for email verification
    const rateLimitResult = await rateLimit(req, 10, 15 * 60 * 1000) // 10 attempts per 15 minutes
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult)
    }

    const validatedData = await validateRequest(req, emailVerificationSchema)
    const { token } = validatedData

    logger.info('Email verification attempt', {
      ip: req.ip,
      userAgent: req.headers.get('user-agent'),
    })

    const result = await emailVerificationService.verifyEmail(token)

    if (result.success) {
      logger.info('Email verification successful', {
        userId: result.userId,
        ip: req.ip,
      })

      return NextResponse.json({
        success: true,
        message: result.message,
        data: {
          verified: true,
          userId: result.userId,
        },
      })
    } else {
      logger.warn('Email verification failed', {
        message: result.message,
        ip: req.ip,
      })

      return NextResponse.json({
        success: false,
        error: result.message,
      }, { status: 400 })
    }
  } catch (error) {
    logger.error('Email verification API error', {
      error: error.message,
      stack: error.stack,
      ip: req.ip,
    })

    if (error.name === 'ValidationError') {
      return NextResponse.json({
        success: false,
        error: 'Invalid verification data',
        details: error.errors,
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Email verification failed',
      message: 'An error occurred during email verification',
    }, { status: 500 })
  }
}

// Resend verification email
export async function PUT(req: NextRequest) {
  try {
    await connectDB()

    // Rate limiting for resend verification
    const rateLimitResult = await rateLimit(req, 3, 60 * 60 * 1000) // 3 attempts per hour
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult)
    }

    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email is required',
      }, { status: 400 })
    }

    logger.info('Resend verification email request', {
      email,
      ip: req.ip,
    })

    const result = await emailVerificationService.resendVerificationEmail(email)

    return NextResponse.json({
      success: result.success,
      message: result.message,
    }, { status: result.success ? 200 : 400 })
  } catch (error) {
    logger.error('Resend verification email API error', {
      error: error.message,
      ip: req.ip,
    })

    return NextResponse.json({
      success: false,
      error: 'Failed to resend verification email',
    }, { status: 500 })
  }
}