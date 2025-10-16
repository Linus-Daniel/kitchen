import { z } from 'zod'

// Order status enum
export const orderStatuses = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'out-for-delivery',
  'delivered',
  'cancelled',
  'refunded',
] as const

export const orderStatusSchema = z.enum(orderStatuses)

// Payment method enum
export const paymentMethods = [
  'paystack',
  'cash',
  'bank-transfer',
  'wallet',
] as const

export const paymentMethodSchema = z.enum(paymentMethods)

// Payment status enum
export const paymentStatuses = [
  'pending',
  'processing',
  'completed',
  'failed',
  'cancelled',
  'refunded',
] as const

export const paymentStatusSchema = z.enum(paymentStatuses)

// Delivery type enum
export const deliveryTypes = [
  'pickup',
  'delivery',
  'dine-in',
] as const

export const deliveryTypeSchema = z.enum(deliveryTypes)

// Order item schema
export const orderItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  name: z
    .string()
    .min(1, 'Product name is required')
    .max(100, 'Product name must not exceed 100 characters'),
  price: z
    .number()
    .min(0.01, 'Price must be at least $0.01')
    .max(10000, 'Price cannot exceed $10,000'),
  quantity: z
    .number()
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1')
    .max(100, 'Quantity cannot exceed 100'),
  selectedOptions: z
    .array(z.object({
      name: z.string().min(1, 'Option name is required'),
      price: z.number().min(0, 'Option price cannot be negative'),
    }))
    .max(10, 'Cannot have more than 10 options per item')
    .optional()
    .default([]),
  notes: z
    .string()
    .max(200, 'Notes must not exceed 200 characters')
    .optional(),
})

// Shipping address schema
export const shippingAddressSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must not exceed 50 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must not exceed 50 characters'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number'),
  street: z
    .string()
    .min(1, 'Street address is required')
    .min(5, 'Street address must be at least 5 characters')
    .max(100, 'Street address must not exceed 100 characters'),
  city: z
    .string()
    .min(1, 'City is required')
    .max(50, 'City must not exceed 50 characters'),
  state: z
    .string()
    .min(1, 'State is required')
    .max(50, 'State must not exceed 50 characters'),
  zipCode: z
    .string()
    .min(1, 'ZIP code is required')
    .regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code'),
  country: z
    .string()
    .min(1, 'Country is required')
    .max(50, 'Country must not exceed 50 characters'),
  instructions: z
    .string()
    .max(300, 'Delivery instructions must not exceed 300 characters')
    .optional(),
})

// Create order schema
export const createOrderSchema = z.object({
  items: z
    .array(orderItemSchema)
    .min(1, 'At least one item is required')
    .max(50, 'Cannot have more than 50 items in an order'),
  deliveryType: deliveryTypeSchema,
  paymentMethod: paymentMethodSchema,
  shippingAddress: shippingAddressSchema.optional(),
  scheduledDelivery: z
    .string()
    .datetime('Scheduled delivery must be a valid datetime')
    .refine(date => new Date(date) > new Date(), {
      message: 'Scheduled delivery must be in the future',
    })
    .optional(),
  notes: z
    .string()
    .max(500, 'Order notes must not exceed 500 characters')
    .optional(),
  couponCode: z
    .string()
    .max(50, 'Coupon code must not exceed 50 characters')
    .optional(),
}).refine(data => {
  // Require shipping address for delivery orders
  if (data.deliveryType === 'delivery' && !data.shippingAddress) {
    return false
  }
  return true
}, {
  message: 'Shipping address is required for delivery orders',
  path: ['shippingAddress'],
})

// Update order schema
export const updateOrderSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  status: orderStatusSchema.optional(),
  trackingNumber: z
    .string()
    .max(100, 'Tracking number must not exceed 100 characters')
    .optional(),
  estimatedDelivery: z
    .string()
    .datetime('Estimated delivery must be a valid datetime')
    .optional(),
  notes: z
    .string()
    .max(500, 'Notes must not exceed 500 characters')
    .optional(),
})

// Order search/filter schema
export const orderSearchSchema = z.object({
  q: z.string().max(100, 'Search query must not exceed 100 characters').optional(),
  status: z.array(orderStatusSchema).optional(),
  paymentStatus: z.array(paymentStatusSchema).optional(),
  deliveryType: z.array(deliveryTypeSchema).optional(),
  customerId: z.string().optional(),
  vendorId: z.string().optional(),
  dateFrom: z
    .string()
    .datetime('Date from must be a valid datetime')
    .optional(),
  dateTo: z
    .string()
    .datetime('Date to must be a valid datetime')
    .optional(),
  minAmount: z
    .number()
    .min(0, 'Minimum amount cannot be negative')
    .optional(),
  maxAmount: z
    .number()
    .min(0, 'Maximum amount cannot be negative')
    .optional(),
  sortBy: z.enum(['createdAt', 'totalAmount', 'status', 'deliveryDate']).optional().default('createdAt'),
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
  if (data.dateFrom && data.dateTo && new Date(data.dateFrom) > new Date(data.dateTo)) {
    return false
  }
  if (data.minAmount && data.maxAmount && data.minAmount > data.maxAmount) {
    return false
  }
  return true
}, {
  message: 'Invalid date or amount range',
})

// Order cancellation schema
export const cancelOrderSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  reason: z
    .string()
    .min(1, 'Cancellation reason is required')
    .max(300, 'Cancellation reason must not exceed 300 characters'),
  refundRequested: z.boolean().default(false),
})

// Order refund schema
export const refundOrderSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  amount: z
    .number()
    .min(0.01, 'Refund amount must be at least $0.01')
    .max(10000, 'Refund amount cannot exceed $10,000'),
  reason: z
    .string()
    .min(1, 'Refund reason is required')
    .max(300, 'Refund reason must not exceed 300 characters'),
  refundMethod: z.enum(['original', 'wallet', 'bank-transfer']).default('original'),
})

// Order tracking update schema
export const orderTrackingSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  status: orderStatusSchema,
  location: z
    .string()
    .max(100, 'Location must not exceed 100 characters')
    .optional(),
  notes: z
    .string()
    .max(200, 'Notes must not exceed 200 characters')
    .optional(),
  estimatedArrival: z
    .string()
    .datetime('Estimated arrival must be a valid datetime')
    .optional(),
})

// Order rating schema
export const orderRatingSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  rating: z
    .number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  comment: z
    .string()
    .max(500, 'Comment must not exceed 500 characters')
    .optional(),
  deliveryRating: z
    .number()
    .int('Delivery rating must be a whole number')
    .min(1, 'Delivery rating must be at least 1')
    .max(5, 'Delivery rating cannot exceed 5')
    .optional(),
  itemRatings: z
    .array(z.object({
      productId: z.string().min(1, 'Product ID is required'),
      rating: z
        .number()
        .int('Rating must be a whole number')
        .min(1, 'Rating must be at least 1')
        .max(5, 'Rating cannot exceed 5'),
      comment: z
        .string()
        .max(200, 'Comment must not exceed 200 characters')
        .optional(),
    }))
    .max(50, 'Cannot rate more than 50 items')
    .optional(),
})

// Type exports
export type OrderItem = z.infer<typeof orderItemSchema>
export type ShippingAddress = z.infer<typeof shippingAddressSchema>
export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>
export type OrderSearchInput = z.infer<typeof orderSearchSchema>
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>
export type RefundOrderInput = z.infer<typeof refundOrderSchema>
export type OrderTrackingInput = z.infer<typeof orderTrackingSchema>
export type OrderRatingInput = z.infer<typeof orderRatingSchema>
export type OrderStatus = z.infer<typeof orderStatusSchema>
export type PaymentMethod = z.infer<typeof paymentMethodSchema>
export type PaymentStatus = z.infer<typeof paymentStatusSchema>
export type DeliveryType = z.infer<typeof deliveryTypeSchema>