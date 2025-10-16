import { z } from 'zod'
import { NextRequest } from 'next/server'

// Generic pagination schema
export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform(val => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(1000)),
  limit: z
    .string()
    .optional()
    .default('20')
    .transform(val => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(100)),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
})

// Generic ID validation
export const mongoIdSchema = z
  .string()
  .min(1, 'ID is required')
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format')

// File upload validation
export const fileUploadSchema = z.object({
  file: z.any().refine(
    (file) => file instanceof File,
    'File is required'
  ).refine(
    (file) => file.size <= 5 * 1024 * 1024, // 5MB
    'File size must be less than 5MB'
  ),
  type: z.enum(['avatar', 'product', 'document']).optional().default('product'),
})

// Image validation
export const imageValidationSchema = z.object({
  file: z.any().refine(
    (file) => file instanceof File,
    'Image file is required'
  ).refine(
    (file) => file.size <= 5 * 1024 * 1024, // 5MB
    'Image size must be less than 5MB'
  ).refine(
    (file) => ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type),
    'File must be a valid image (JPEG, PNG, WebP, or GIF)'
  ),
})

// Search query validation
export const searchSchema = z.object({
  q: z
    .string()
    .max(100, 'Search query must not exceed 100 characters')
    .optional(),
  filters: z.record(z.any()).optional(),
  ...paginationSchema.shape,
})

// Date range validation
export const dateRangeSchema = z.object({
  startDate: z
    .string()
    .datetime('Start date must be a valid datetime')
    .optional(),
  endDate: z
    .string()
    .datetime('End date must be a valid datetime')
    .optional(),
}).refine(data => {
  if (data.startDate && data.endDate && new Date(data.startDate) > new Date(data.endDate)) {
    return false
  }
  return true
}, {
  message: 'Start date cannot be after end date',
  path: ['startDate'],
})

// API response wrapper schema
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    message: z.string().optional(),
    error: z.string().optional(),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      pages: z.number(),
    }).optional(),
  })

// Generic validation error
export class ValidationError extends Error {
  public statusCode = 400
  public errors: Record<string, string[]>

  constructor(errors: Record<string, string[]>) {
    super('Validation failed')
    this.name = 'ValidationError'
    this.errors = errors
  }
}

// Validation helper function
export async function validateRequest<T>(
  req: NextRequest,
  schema: z.ZodSchema<T>,
  source: 'body' | 'query' | 'params' = 'body'
): Promise<T> {
  try {
    let data: any

    switch (source) {
      case 'body':
        data = await req.json()
        break
      case 'query':
        data = Object.fromEntries(req.nextUrl.searchParams.entries())
        break
      case 'params':
        // Extract params from URL (would need to be implemented based on routing)
        data = {}
        break
      default:
        throw new Error('Invalid validation source')
    }

    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {}
      
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        if (!errors[path]) {
          errors[path] = []
        }
        errors[path].push(err.message)
      })
      
      throw new ValidationError(errors)
    }
    throw error
  }
}

// Middleware for automatic validation
export function withValidation<T>(schema: z.ZodSchema<T>, source: 'body' | 'query' | 'params' = 'body') {
  return async (req: NextRequest) => {
    try {
      const validatedData = await validateRequest(req, schema, source)
      // Attach validated data to request for later use
      ;(req as any).validatedData = validatedData
      return validatedData
    } catch (error) {
      if (error instanceof ValidationError) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Validation failed',
            details: error.errors,
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }
      throw error
    }
  }
}

// Common validation patterns
export const commonPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  url: /^https?:\/\/.+/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  hexColor: /^#[0-9A-F]{6}$/i,
  mongoObjectId: /^[0-9a-fA-F]{24}$/,
}

// Sanitization helpers
export function sanitizeHtml(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim()
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase()
}

// Export all validation schemas
export * from './auth'
export * from './product'
export * from './order'

// Type exports
export type PaginationInput = z.infer<typeof paginationSchema>
export type SearchInput = z.infer<typeof searchSchema>
export type DateRangeInput = z.infer<typeof dateRangeSchema>
export type FileUploadInput = z.infer<typeof fileUploadSchema>
export type ImageValidationInput = z.infer<typeof imageValidationSchema>