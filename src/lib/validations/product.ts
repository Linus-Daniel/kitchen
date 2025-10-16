import { z } from 'zod'

// Product categories enum
export const productCategories = [
  'appetizers',
  'main-course',
  'desserts',
  'beverages',
  'salads',
  'soups',
  'seafood',
  'vegetarian',
  'vegan',
  'gluten-free',
  'dairy-free',
  'spicy',
  'healthy',
  'comfort-food',
] as const

export const productCategorySchema = z.enum(productCategories)

// Dietary restrictions enum
export const dietaryRestrictions = [
  'vegetarian',
  'vegan',
  'gluten-free',
  'dairy-free',
  'nut-free',
  'halal',
  'kosher',
  'keto',
  'low-carb',
  'high-protein',
] as const

export const dietaryRestrictionSchema = z.enum(dietaryRestrictions)

// Product option schema
export const productOptionSchema = z.object({
  name: z
    .string()
    .min(1, 'Option name is required')
    .max(50, 'Option name must not exceed 50 characters'),
  price: z
    .number()
    .min(0, 'Option price cannot be negative')
    .max(1000, 'Option price cannot exceed $1,000'),
})

// Product creation schema
export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, 'Product name is required')
    .min(2, 'Product name must be at least 2 characters')
    .max(100, 'Product name must not exceed 100 characters')
    .transform(name => name.trim()),
  description: z
    .string()
    .min(1, 'Product description is required')
    .min(10, 'Product description must be at least 10 characters')
    .max(1000, 'Product description must not exceed 1,000 characters')
    .transform(desc => desc.trim()),
  price: z
    .number()
    .min(0.01, 'Price must be at least $0.01')
    .max(10000, 'Price cannot exceed $10,000')
    .transform(price => Math.round(price * 100) / 100), // Round to 2 decimal places
  category: productCategorySchema,
  cookTime: z
    .string()
    .min(1, 'Cook time is required')
    .regex(/^\d+\s*(min|mins|minutes|hour|hours|hr|hrs)$/i, 'Cook time must be in format like "30 mins" or "1 hour"')
    .max(50, 'Cook time must not exceed 50 characters'),
  ingredients: z
    .array(z.string().min(1, 'Ingredient cannot be empty').max(100, 'Ingredient must not exceed 100 characters'))
    .min(1, 'At least one ingredient is required')
    .max(50, 'Cannot have more than 50 ingredients'),
  dietary: z
    .array(dietaryRestrictionSchema)
    .max(10, 'Cannot have more than 10 dietary restrictions')
    .optional()
    .default([]),
  options: z
    .array(productOptionSchema)
    .max(20, 'Cannot have more than 20 options')
    .optional()
    .default([]),
  image: z
    .string()
    .url('Image must be a valid URL')
    .optional(),
  images: z
    .array(z.string().url('Each image must be a valid URL'))
    .max(10, 'Cannot have more than 10 images')
    .optional()
    .default([]),
  isAvailable: z.boolean().default(true),
  rating: z
    .number()
    .min(0, 'Rating cannot be negative')
    .max(5, 'Rating cannot exceed 5')
    .optional()
    .default(0),
  stock: z
    .number()
    .int('Stock must be a whole number')
    .min(0, 'Stock cannot be negative')
    .max(10000, 'Stock cannot exceed 10,000')
    .optional()
    .default(0),
  tags: z
    .array(z.string().min(1).max(30))
    .max(20, 'Cannot have more than 20 tags')
    .optional()
    .default([]),
})

// Product update schema (all fields optional except ID)
export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string().min(1, 'Product ID is required'),
})

// Product search/filter schema
export const productSearchSchema = z.object({
  q: z.string().max(100, 'Search query must not exceed 100 characters').optional(),
  category: productCategorySchema.optional(),
  dietary: z.array(dietaryRestrictionSchema).optional(),
  minPrice: z
    .number()
    .min(0, 'Minimum price cannot be negative')
    .max(10000, 'Minimum price cannot exceed $10,000')
    .optional(),
  maxPrice: z
    .number()
    .min(0, 'Maximum price cannot be negative')
    .max(10000, 'Maximum price cannot exceed $10,000')
    .optional(),
  rating: z
    .number()
    .min(0, 'Rating cannot be negative')
    .max(5, 'Rating cannot exceed 5')
    .optional(),
  availability: z.boolean().optional(),
  tags: z.array(z.string().min(1).max(30)).optional(),
  sortBy: z.enum(['name', 'price', 'rating', 'createdAt', 'popularity']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z
    .number()
    .int('Page must be a whole number')
    .min(1, 'Page must be at least 1')
    .max(1000, 'Page cannot exceed 1000')
    .optional()
    .default(1),
  limit: z
    .number()
    .int('Limit must be a whole number')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .optional()
    .default(20),
}).refine(data => {
  if (data.minPrice && data.maxPrice && data.minPrice > data.maxPrice) {
    return false
  }
  return true
}, {
  message: 'Minimum price cannot be greater than maximum price',
  path: ['minPrice'],
})

// Product review schema
export const productReviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  rating: z
    .number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  comment: z
    .string()
    .min(1, 'Review comment is required')
    .min(10, 'Review comment must be at least 10 characters')
    .max(500, 'Review comment must not exceed 500 characters')
    .transform(comment => comment.trim()),
  title: z
    .string()
    .min(1, 'Review title is required')
    .max(100, 'Review title must not exceed 100 characters')
    .transform(title => title.trim())
    .optional(),
})

// Inventory update schema
export const inventoryUpdateSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  stock: z
    .number()
    .int('Stock must be a whole number')
    .min(0, 'Stock cannot be negative')
    .max(10000, 'Stock cannot exceed 10,000'),
  lowStockThreshold: z
    .number()
    .int('Low stock threshold must be a whole number')
    .min(0, 'Low stock threshold cannot be negative')
    .max(1000, 'Low stock threshold cannot exceed 1,000')
    .optional(),
})

// Bulk product operation schema
export const bulkProductOperationSchema = z.object({
  productIds: z
    .array(z.string().min(1, 'Product ID cannot be empty'))
    .min(1, 'At least one product ID is required')
    .max(100, 'Cannot operate on more than 100 products at once'),
  operation: z.enum(['delete', 'activate', 'deactivate', 'updateCategory', 'updatePrice']),
  data: z.record(z.any()).optional(), // Additional data based on operation
})

// Type exports
export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type ProductSearchInput = z.infer<typeof productSearchSchema>
export type ProductReviewInput = z.infer<typeof productReviewSchema>
export type InventoryUpdateInput = z.infer<typeof inventoryUpdateSchema>
export type BulkProductOperationInput = z.infer<typeof bulkProductOperationSchema>
export type ProductCategory = z.infer<typeof productCategorySchema>
export type DietaryRestriction = z.infer<typeof dietaryRestrictionSchema>
export type ProductOption = z.infer<typeof productOptionSchema>