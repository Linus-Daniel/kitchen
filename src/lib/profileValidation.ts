import { z } from 'zod';

// Base validation schemas
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name cannot exceed 50 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required');

export const phoneSchema = z
  .string()
  .optional()
  .refine((phone) => {
    if (!phone) return true; // Optional field
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 15;
  }, 'Phone number must be between 10-15 digits');

export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(128, 'Password cannot exceed 128 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number');

export const businessNameSchema = z
  .string()
  .min(2, 'Business name must be at least 2 characters')
  .max(100, 'Business name cannot exceed 100 characters')
  .optional();

export const businessDescriptionSchema = z
  .string()
  .max(500, 'Business description cannot exceed 500 characters')
  .optional();

export const businessCategorySchema = z
  .enum(['restaurant', 'fast-food', 'cafe', 'bakery', 'dessert', 'beverage', 'other'])
  .optional();

export const addressSchema = z.object({
  street: z.string().min(1, 'Street address is required').max(100, 'Street address cannot exceed 100 characters').optional(),
  city: z.string().min(1, 'City is required').max(50, 'City cannot exceed 50 characters').optional(),
  state: z.string().min(1, 'State is required').max(50, 'State cannot exceed 50 characters').optional(),
  zipCode: z.string().min(3, 'ZIP code must be at least 3 characters').max(10, 'ZIP code cannot exceed 10 characters').optional(),
  country: z.string().min(1, 'Country is required').max(50, 'Country cannot exceed 50 characters').optional(),
});

export const preferencesSchema = z.object({
  newsletter: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  orderUpdates: z.boolean().optional(),
  promotions: z.boolean().optional(),
});

// Complete profile validation schemas for different user types
export const userProfileSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']).optional(),
  address: addressSchema.optional(),
  preferences: preferencesSchema.optional(),
});

export const vendorProfileSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  businessName: businessNameSchema,
  businessDescription: businessDescriptionSchema,
  businessCategory: businessCategorySchema,
  address: addressSchema.optional(),
  preferences: preferencesSchema.optional(),
});

export const adminProfileSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  address: addressSchema.optional(),
  preferences: preferencesSchema.optional(),
});

// Password change validation
export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, 'Password confirmation is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Password reset validation
export const passwordResetSchema = z.object({
  email: emailSchema,
});

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, 'Password confirmation is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Address validation
export const addressFormSchema = z.object({
  label: z.string().min(1, 'Address label is required').max(50, 'Label cannot exceed 50 characters'),
  street: z.string().min(1, 'Street address is required').max(100, 'Street address cannot exceed 100 characters'),
  city: z.string().min(1, 'City is required').max(50, 'City cannot exceed 50 characters'),
  state: z.string().min(1, 'State is required').max(50, 'State cannot exceed 50 characters'),
  zipCode: z.string().min(3, 'ZIP code must be at least 3 characters').max(10, 'ZIP code cannot exceed 10 characters'),
  country: z.string().min(1, 'Country is required').max(50, 'Country cannot exceed 50 characters'),
  type: z.enum(['home', 'work', 'other']),
  isDefault: z.boolean(),
});

// File upload validation
export const avatarUploadSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File size cannot exceed 5MB')
    .refine((file) => file.type.startsWith('image/'), 'File must be an image')
    .refine((file) => ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type), 
      'File must be JPEG, PNG, WebP, or GIF'),
});

// Security validation functions
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function validateProfileRole(userRole: string, targetRole: string): boolean {
  // Admin can access any profile
  if (userRole === 'admin') return true;
  
  // Users can only access their own profile type
  return userRole === targetRole;
}

export function validateEmailDomain(email: string): boolean {
  const domain = email.split('@')[1];
  
  // Block known disposable email domains
  const blockedDomains = [
    '10minutemail.com',
    'guerrillamail.com',
    'mailinator.com',
    'temp-mail.org',
    'throwaway.email',
  ];
  
  return !blockedDomains.includes(domain);
}

export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Use at least 8 characters');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include lowercase letters');
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include uppercase letters');
  }

  // Number check
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include numbers');
  }

  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include special characters');
  }

  // Common patterns check
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /abc123/i,
    /admin/i,
  ];

  if (commonPatterns.some(pattern => pattern.test(password))) {
    score = Math.max(0, score - 2);
    feedback.push('Avoid common passwords and patterns');
  }

  return {
    isValid: score >= 3,
    score,
    feedback,
  };
}

export function validateBusinessData(data: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate business name length and content
  if (data.businessName) {
    if (data.businessName.length < 2) {
      errors.push('Business name must be at least 2 characters');
    }
    if (data.businessName.length > 100) {
      errors.push('Business name cannot exceed 100 characters');
    }
    if (!/^[a-zA-Z0-9\s&'-]+$/.test(data.businessName)) {
      errors.push('Business name contains invalid characters');
    }
  }

  // Validate business description
  if (data.businessDescription && data.businessDescription.length > 500) {
    errors.push('Business description cannot exceed 500 characters');
  }

  // Validate business category
  const validCategories = ['restaurant', 'fast-food', 'cafe', 'bakery', 'dessert', 'beverage', 'other'];
  if (data.businessCategory && !validCategories.includes(data.businessCategory)) {
    errors.push('Invalid business category');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateAddressData(data: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  const requiredFields = ['label', 'street', 'city', 'state', 'zipCode', 'country'];
  
  for (const field of requiredFields) {
    if (!data[field] || typeof data[field] !== 'string' || data[field].trim().length === 0) {
      errors.push(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
    }
  }

  // Validate ZIP code format
  if (data.zipCode && !/^[0-9A-Z\s-]{3,10}$/i.test(data.zipCode)) {
    errors.push('Invalid ZIP code format');
  }

  // Validate address type
  const validTypes = ['home', 'work', 'other'];
  if (data.type && !validTypes.includes(data.type)) {
    errors.push('Invalid address type');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Rate limiting helper for profile updates
export function createRateLimiter(maxAttempts: number, windowMs: number) {
  const attempts = new Map<string, { count: number; resetTime: number }>();

  return function isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const userAttempts = attempts.get(identifier);

    if (!userAttempts || now > userAttempts.resetTime) {
      attempts.set(identifier, { count: 1, resetTime: now + windowMs });
      return false;
    }

    if (userAttempts.count >= maxAttempts) {
      return true;
    }

    userAttempts.count++;
    return false;
  };
}

// Profile update rate limiter (5 updates per hour)
export const profileUpdateRateLimiter = createRateLimiter(5, 60 * 60 * 1000);

// Password change rate limiter (3 attempts per hour)
export const passwordChangeRateLimiter = createRateLimiter(3, 60 * 60 * 1000);