import { z } from 'zod'

const envSchema = z.object({
  // App Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_NAME: z.string().default('KitchenMode'),
  NEXT_PUBLIC_BASE_URL: z.string().url(),
  
  // Database
  MONGODB_URI: z.string().min(1, 'MongoDB URI is required'),
  
  // JWT Configuration
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_EXPIRES_TIME: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT refresh secret must be at least 32 characters').optional(),
  JWT_REFRESH_EXPIRES_TIME: z.string().default('30d'),
  
  // Payment
  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: z.string().startsWith('pk_'),
  PAYSTACK_SECRET_KEY: z.string().startsWith('sk_'),
  
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  
  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  SMTP_USER: z.string().email().optional(),
  SMTP_PASS: z.string().optional(),
  
  // Redis
  REDIS_URL: z.string().url().optional(),
  
  // Security
  CORS_ORIGIN: z.string().url().default('http://localhost:3000'),
  RATE_LIMIT_MAX: z.string().transform(Number).pipe(z.number().int().positive()).default('100'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).pipe(z.number().int().positive()).default('900000'),
  ENCRYPTION_KEY: z.string().length(32, 'Encryption key must be exactly 32 characters').optional(),
  
  // Monitoring
  SENTRY_DSN: z.string().url().optional(),
})

export type Env = z.infer<typeof envSchema>

class ConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConfigError'
  }
}

function validateEnv(): Env {
  try {
    const parsed = envSchema.parse(process.env)
    return parsed
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join('\n')
      
      throw new ConfigError(
        `Environment validation failed:\n${missingVars}\n\nPlease check your .env.local file.`
      )
    }
    throw error
  }
}

// Validate environment variables at startup
export const env = validateEnv()

// Helper function to check if we're in production
export const isProduction = env.NODE_ENV === 'production'
export const isDevelopment = env.NODE_ENV === 'development'
export const isTest = env.NODE_ENV === 'test'

// Export individual config sections for cleaner imports
export const dbConfig = {
  uri: env.MONGODB_URI,
}

export const jwtConfig = {
  secret: env.JWT_SECRET,
  expiresIn: env.JWT_EXPIRES_TIME,
  refreshSecret: env.JWT_REFRESH_SECRET,
  refreshExpiresIn: env.JWT_REFRESH_EXPIRES_TIME,
}

export const cloudinaryConfig = {
  cloudName: env.CLOUDINARY_CLOUD_NAME,
  apiKey: env.CLOUDINARY_API_KEY,
  apiSecret: env.CLOUDINARY_API_SECRET,
}

export const emailConfig = {
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  user: env.SMTP_USER,
  pass: env.SMTP_PASS,
}

export const securityConfig = {
  corsOrigin: env.CORS_ORIGIN,
  rateLimitMax: env.RATE_LIMIT_MAX,
  rateLimitWindowMs: env.RATE_LIMIT_WINDOW_MS,
  encryptionKey: env.ENCRYPTION_KEY,
}

export const paystackConfig = {
  publicKey: env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
  secretKey: env.PAYSTACK_SECRET_KEY,
}