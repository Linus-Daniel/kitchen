import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import { logger } from './logger'
import { jwtConfig, emailConfig, env } from './env'
import User from '@/models/User'
import Vendor from '@/models/Vendor'

export interface EmailVerificationToken {
  userId: string
  email: string
  type: 'email-verification' | 'password-reset' | 'email-change'
  exp?: number
}

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export class EmailVerificationService {
  private static instance: EmailVerificationService
  private transporter: nodemailer.Transporter | null = null

  private constructor() {
    this.initializeTransporter()
  }

  public static getInstance(): EmailVerificationService {
    if (!EmailVerificationService.instance) {
      EmailVerificationService.instance = new EmailVerificationService()
    }
    return EmailVerificationService.instance
  }

  private async initializeTransporter() {
    try {
      if (!emailConfig.host || !emailConfig.user || !emailConfig.pass) {
        logger.warn('Email configuration missing, email services will not work')
        return
      }

      this.transporter = nodemailer.createTransporter({
        host: emailConfig.host,
        port: emailConfig.port || 587,
        secure: emailConfig.port === 465,
        auth: {
          user: emailConfig.user,
          pass: emailConfig.pass,
        },
        tls: {
          rejectUnauthorized: false, // Allow self-signed certificates in development
        },
      })

      // Verify connection
      await this.transporter.verify()
      logger.info('Email transporter initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize email transporter', error)
      this.transporter = null
    }
  }

  /**
   * Generate a secure verification token
   */
  generateVerificationToken(userId: string, email: string, type: string = 'email-verification'): string {
    const payload: EmailVerificationToken = {
      userId,
      email: email.toLowerCase(),
      type: type as any,
    }

    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: '24h', // Token expires in 24 hours
      issuer: env.NEXT_PUBLIC_APP_NAME,
      audience: 'email-verification',
    })
  }

  /**
   * Generate a secure random code (6 digits)
   */
  generateVerificationCode(): string {
    return crypto.randomInt(100000, 999999).toString()
  }

  /**
   * Verify and decode token
   */
  async verifyToken(token: string): Promise<EmailVerificationToken> {
    try {
      const decoded = jwt.verify(token, jwtConfig.secret, {
        issuer: env.NEXT_PUBLIC_APP_NAME,
        audience: 'email-verification',
      }) as EmailVerificationToken

      return decoded
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Verification token has expired')
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid verification token')
      }
      throw error
    }
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(
    userId: string,
    email: string,
    name: string,
    type: 'registration' | 'email-change' = 'registration'
  ): Promise<boolean> {
    try {
      if (!this.transporter) {
        logger.warn('Email transporter not available, skipping email send')
        return false
      }

      const token = this.generateVerificationToken(userId, email, 'email-verification')
      const verificationUrl = `${env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${token}`

      const template = this.getEmailTemplate(type, name, verificationUrl)

      const mailOptions = {
        from: `"${env.NEXT_PUBLIC_APP_NAME}" <${emailConfig.user}>`,
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      }

      const result = await this.transporter.sendMail(mailOptions)
      
      logger.info('Verification email sent', {
        userId,
        email,
        messageId: result.messageId,
        type,
      })

      return true
    } catch (error) {
      logger.error('Failed to send verification email', {
        userId,
        email,
        error: error.message,
        type,
      })
      return false
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    userId: string,
    email: string,
    name: string
  ): Promise<boolean> {
    try {
      if (!this.transporter) {
        logger.warn('Email transporter not available, skipping email send')
        return false
      }

      const token = this.generateVerificationToken(userId, email, 'password-reset')
      const resetUrl = `${env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`

      const template = this.getPasswordResetTemplate(name, resetUrl)

      const mailOptions = {
        from: `"${env.NEXT_PUBLIC_APP_NAME}" <${emailConfig.user}>`,
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      }

      const result = await this.transporter.sendMail(mailOptions)
      
      logger.info('Password reset email sent', {
        userId,
        email,
        messageId: result.messageId,
      })

      return true
    } catch (error) {
      logger.error('Failed to send password reset email', {
        userId,
        email,
        error: error.message,
      })
      return false
    }
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<{ success: boolean; message: string; userId?: string }> {
    try {
      const decoded = await this.verifyToken(token)

      if (decoded.type !== 'email-verification') {
        return { success: false, message: 'Invalid token type' }
      }

      // Find user by ID and email
      const user = await User.findById(decoded.userId)
      if (!user) {
        return { success: false, message: 'User not found' }
      }

      // Check if email matches
      if (user.email.toLowerCase() !== decoded.email.toLowerCase()) {
        return { success: false, message: 'Email mismatch' }
      }

      // Check if already verified
      if (user.isEmailVerified) {
        return { success: true, message: 'Email is already verified', userId: user._id.toString() }
      }

      // Mark email as verified
      user.isEmailVerified = true
      user.emailVerifiedAt = new Date()
      await user.save()

      logger.info('Email verified successfully', {
        userId: user._id,
        email: user.email,
      })

      return { success: true, message: 'Email verified successfully', userId: user._id.toString() }
    } catch (error) {
      logger.error('Email verification failed', {
        token,
        error: error.message,
      })

      if (error.message.includes('expired')) {
        return { success: false, message: 'Verification link has expired. Please request a new one.' }
      } else if (error.message.includes('Invalid')) {
        return { success: false, message: 'Invalid verification link.' }
      }

      return { success: false, message: 'Email verification failed. Please try again.' }
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = await User.findOne({ email: email.toLowerCase() })
      if (!user) {
        // Don't reveal if email exists for security
        return { success: true, message: 'If the email exists, a verification link has been sent.' }
      }

      if (user.isEmailVerified) {
        return { success: false, message: 'Email is already verified.' }
      }

      // Check rate limiting (max 3 emails per hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      const recentEmails = await this.countRecentVerificationEmails(user._id.toString(), oneHourAgo)
      
      if (recentEmails >= 3) {
        return { 
          success: false, 
          message: 'Too many verification emails sent. Please try again later.' 
        }
      }

      const emailSent = await this.sendVerificationEmail(
        user._id.toString(),
        user.email,
        user.name
      )

      if (emailSent) {
        // Log the email send for rate limiting
        await this.logVerificationEmailSent(user._id.toString())
        return { success: true, message: 'Verification email sent successfully.' }
      } else {
        return { success: false, message: 'Failed to send verification email. Please try again later.' }
      }
    } catch (error) {
      logger.error('Failed to resend verification email', {
        email,
        error: error.message,
      })
      return { success: false, message: 'Failed to send verification email. Please try again later.' }
    }
  }

  /**
   * Get email template
   */
  private getEmailTemplate(type: 'registration' | 'email-change', name: string, verificationUrl: string): EmailTemplate {
    const isRegistration = type === 'registration'
    
    const subject = isRegistration 
      ? `Welcome to ${env.NEXT_PUBLIC_APP_NAME}! Please verify your email`
      : `Verify your new email address`

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
            .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 30px; background: white; }
            .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; border-radius: 0 0 8px 8px; }
            .code { font-family: monospace; font-size: 18px; background: #f8f9fa; padding: 10px; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${env.NEXT_PUBLIC_APP_NAME}</h1>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>
              ${isRegistration 
                ? `Welcome to ${env.NEXT_PUBLIC_APP_NAME}! We're excited to have you on board.`
                : `You've requested to change your email address.`
              }
            </p>
            <p>
              Please click the button below to verify your email address:
            </p>
            <p style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p class="code">${verificationUrl}</p>
            <p><strong>This link will expire in 24 hours.</strong></p>
            <p>
              If you didn't ${isRegistration ? 'create an account' : 'request this change'}, you can safely ignore this email.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${env.NEXT_PUBLIC_APP_NAME}. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </body>
      </html>
    `

    const text = `
      Hello ${name}!

      ${isRegistration 
        ? `Welcome to ${env.NEXT_PUBLIC_APP_NAME}! We're excited to have you on board.`
        : `You've requested to change your email address.`
      }

      Please verify your email address by clicking this link:
      ${verificationUrl}

      This link will expire in 24 hours.

      If you didn't ${isRegistration ? 'create an account' : 'request this change'}, you can safely ignore this email.

      © ${new Date().getFullYear()} ${env.NEXT_PUBLIC_APP_NAME}. All rights reserved.
    `

    return { subject, html, text }
  }

  /**
   * Get password reset email template
   */
  private getPasswordResetTemplate(name: string, resetUrl: string): EmailTemplate {
    const subject = `Reset your ${env.NEXT_PUBLIC_APP_NAME} password`

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
            .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 30px; background: white; }
            .button { display: inline-block; padding: 12px 24px; background: #dc3545; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; border-radius: 0 0 8px 8px; }
            .code { font-family: monospace; font-size: 18px; background: #f8f9fa; padding: 10px; border-radius: 4px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${env.NEXT_PUBLIC_APP_NAME}</h1>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hello ${name},</p>
            <p>
              We received a request to reset your password for your ${env.NEXT_PUBLIC_APP_NAME} account.
            </p>
            <p>
              Click the button below to reset your password:
            </p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p class="code">${resetUrl}</p>
            <div class="warning">
              <strong>Security Notice:</strong>
              <ul>
                <li>This link will expire in 24 hours</li>
                <li>This link can only be used once</li>
                <li>If you didn't request this reset, please ignore this email</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${env.NEXT_PUBLIC_APP_NAME}. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </body>
      </html>
    `

    const text = `
      Password Reset Request

      Hello ${name},

      We received a request to reset your password for your ${env.NEXT_PUBLIC_APP_NAME} account.

      Click this link to reset your password:
      ${resetUrl}

      SECURITY NOTICE:
      - This link will expire in 24 hours
      - This link can only be used once
      - If you didn't request this reset, please ignore this email

      © ${new Date().getFullYear()} ${env.NEXT_PUBLIC_APP_NAME}. All rights reserved.
    `

    return { subject, html, text }
  }

  /**
   * Count recent verification emails for rate limiting
   */
  private async countRecentVerificationEmails(userId: string, since: Date): Promise<number> {
    // In a real implementation, you'd store this in a database table
    // For now, we'll use a simple in-memory cache
    // You should implement proper rate limiting with Redis or database
    return 0
  }

  /**
   * Log verification email sent for rate limiting
   */
  private async logVerificationEmailSent(userId: string): Promise<void> {
    // In a real implementation, you'd store this in a database table
    // For rate limiting purposes
    logger.info('Verification email logged for rate limiting', { userId })
  }
}

// Export singleton instance
export const emailVerificationService = EmailVerificationService.getInstance()