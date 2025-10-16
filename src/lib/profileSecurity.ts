import { NextRequest } from 'next/server';
import { ErrorResponse } from './errorHandler';
import { profileUpdateRateLimiter, passwordChangeRateLimiter, validateEmailDomain } from './profileValidation';
import { logger } from './logger';

interface SecurityContext {
  userId: string;
  userRole: string;
  userEmail: string;
  ipAddress: string;
}

export function getSecurityContext(req: NextRequest, user: any): SecurityContext {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const ipAddress = forwarded ? forwarded.split(',')[0] : realIp || 'unknown';

  return {
    userId: user._id.toString(),
    userRole: user.role,
    userEmail: user.email,
    ipAddress,
  };
}

export function validateProfileUpdateSecurity(
  context: SecurityContext,
  updateData: any
): void {
  // Rate limiting check
  if (profileUpdateRateLimiter(context.userId)) {
    logger.warn('Profile update rate limit exceeded', {
      userId: context.userId,
      ipAddress: context.ipAddress,
    });
    throw new ErrorResponse('Too many profile updates. Please try again later.', 429);
  }

  // Email domain validation if email is being updated
  if (updateData.email && updateData.email !== context.userEmail) {
    if (!validateEmailDomain(updateData.email)) {
      logger.warn('Blocked disposable email domain', {
        userId: context.userId,
        email: updateData.email,
        ipAddress: context.ipAddress,
      });
      throw new ErrorResponse('Please use a valid email address', 400);
    }
  }

  // Prevent role escalation attempts
  if (updateData.role && updateData.role !== context.userRole) {
    if (context.userRole !== 'admin') {
      logger.warn('Unauthorized role change attempt', {
        userId: context.userId,
        currentRole: context.userRole,
        attemptedRole: updateData.role,
        ipAddress: context.ipAddress,
      });
      throw new ErrorResponse('Unauthorized: Cannot change user role', 403);
    }
  }

  // Validate business data integrity for vendors
  if (context.userRole === 'vendor' || updateData.role === 'vendor') {
    validateVendorBusinessData(updateData, context);
  }

  logger.info('Profile update security validation passed', {
    userId: context.userId,
    ipAddress: context.ipAddress,
  });
}

export function validatePasswordChangeSecurity(
  context: SecurityContext,
  currentPassword: string,
  newPassword: string
): void {
  // Rate limiting check for password changes
  if (passwordChangeRateLimiter(context.userId)) {
    logger.warn('Password change rate limit exceeded', {
      userId: context.userId,
      ipAddress: context.ipAddress,
    });
    throw new ErrorResponse('Too many password change attempts. Please try again later.', 429);
  }

  // Prevent using email as password
  if (newPassword.toLowerCase().includes(context.userEmail.toLowerCase().split('@')[0])) {
    throw new ErrorResponse('Password cannot contain your email address', 400);
  }

  // Prevent reusing current password
  if (currentPassword === newPassword) {
    throw new ErrorResponse('New password must be different from current password', 400);
  }

  logger.info('Password change security validation passed', {
    userId: context.userId,
    ipAddress: context.ipAddress,
  });
}

export function validateAddressSecurity(
  context: SecurityContext,
  addressData: any
): void {
  // Check for suspicious address patterns
  const suspiciousPatterns = [
    /test\s*address/i,
    /fake\s*address/i,
    /123\s*fake\s*st/i,
    /nowhere/i,
  ];

  const fullAddress = `${addressData.street} ${addressData.city} ${addressData.state}`;
  
  if (suspiciousPatterns.some(pattern => pattern.test(fullAddress))) {
    logger.warn('Suspicious address pattern detected', {
      userId: context.userId,
      address: fullAddress,
      ipAddress: context.ipAddress,
    });
    throw new ErrorResponse('Please provide a valid address', 400);
  }

  // Validate ZIP code format based on country
  if (addressData.country === 'Nigeria') {
    if (addressData.zipCode && !/^\d{6}$/.test(addressData.zipCode)) {
      throw new ErrorResponse('Nigerian postal codes must be 6 digits', 400);
    }
  }

  logger.info('Address security validation passed', {
    userId: context.userId,
    ipAddress: context.ipAddress,
  });
}

export function validateAvatarUploadSecurity(
  context: SecurityContext,
  file: File
): void {
  // File size check (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    throw new ErrorResponse('File size cannot exceed 5MB', 400);
  }

  // MIME type validation
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedMimeTypes.includes(file.type)) {
    logger.warn('Invalid file type uploaded', {
      userId: context.userId,
      fileType: file.type,
      ipAddress: context.ipAddress,
    });
    throw new ErrorResponse('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed', 400);
  }

  // Check file extension
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
  if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
    throw new ErrorResponse('Invalid file extension', 400);
  }

  logger.info('Avatar upload security validation passed', {
    userId: context.userId,
    fileName: file.name,
    fileSize: file.size,
    ipAddress: context.ipAddress,
  });
}

function validateVendorBusinessData(updateData: any, context: SecurityContext): void {
  // Ensure vendor-specific fields are provided if role is vendor
  if (updateData.role === 'vendor' || context.userRole === 'vendor') {
    if (updateData.businessName && updateData.businessName.length < 2) {
      throw new ErrorResponse('Business name must be at least 2 characters', 400);
    }

    // Check for potential business name conflicts (basic check)
    if (updateData.businessName) {
      const suspiciousBusinessNames = [
        /test\s*business/i,
        /fake\s*restaurant/i,
        /temp\s*cafe/i,
      ];

      if (suspiciousBusinessNames.some(pattern => pattern.test(updateData.businessName))) {
        logger.warn('Suspicious business name detected', {
          userId: context.userId,
          businessName: updateData.businessName,
          ipAddress: context.ipAddress,
        });
        throw new ErrorResponse('Please provide a valid business name', 400);
      }
    }
  }
}

export function logProfileActivity(
  action: string,
  context: SecurityContext,
  additionalData?: Record<string, any>
): void {
  logger.info(`Profile activity: ${action}`, {
    userId: context.userId,
    userRole: context.userRole,
    ipAddress: context.ipAddress,
    timestamp: new Date().toISOString(),
    ...additionalData,
  });
}

export function detectSuspiciousActivity(
  context: SecurityContext,
  activityType: string,
  frequency: number,
  timeWindow: number = 60000 // 1 minute
): boolean {
  // This is a simple implementation - in production you'd use Redis or a database
  const key = `${context.userId}_${activityType}`;
  const now = Date.now();
  
  // In a real implementation, you'd store this in a persistent store
  // For now, this is just a placeholder that always returns false
  // You should implement proper suspicious activity detection based on your needs
  
  if (frequency > 10) { // More than 10 activities per minute
    logger.warn('Suspicious activity detected', {
      userId: context.userId,
      activityType,
      frequency,
      ipAddress: context.ipAddress,
    });
    return true;
  }

  return false;
}

export function sanitizeProfileData(data: any): any {
  const sanitized = { ...data };

  // Remove any potentially dangerous fields
  delete sanitized._id;
  delete sanitized.__v;
  delete sanitized.password;
  delete sanitized.passwordResetToken;
  delete sanitized.passwordResetExpires;
  delete sanitized.emailVerificationToken;

  // Sanitize string fields
  const stringFields = ['name', 'businessName', 'businessDescription'];
  stringFields.forEach(field => {
    if (sanitized[field] && typeof sanitized[field] === 'string') {
      sanitized[field] = sanitized[field].trim().replace(/[<>]/g, '');
    }
  });

  // Sanitize address fields
  if (sanitized.address) {
    const addressFields = ['street', 'city', 'state', 'zipCode', 'country'];
    addressFields.forEach(field => {
      if (sanitized.address[field] && typeof sanitized.address[field] === 'string') {
        sanitized.address[field] = sanitized.address[field].trim().replace(/[<>]/g, '');
      }
    });
  }

  return sanitized;
}

export function validateSessionSecurity(req: NextRequest, user: any): void {
  const userAgent = req.headers.get('user-agent') || '';
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const ipAddress = forwarded ? forwarded.split(',')[0] : realIp || 'unknown';

  // Basic bot detection
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
  ];

  if (botPatterns.some(pattern => pattern.test(userAgent))) {
    logger.warn('Bot access attempt to profile endpoint', {
      userId: user._id,
      userAgent,
      ipAddress,
    });
    throw new ErrorResponse('Automated access not allowed', 403);
  }

  // Check for required headers
  if (!req.headers.get('authorization')) {
    throw new ErrorResponse('Authorization header required', 401);
  }
}

// Export a comprehensive security validator function
export function validateProfileSecurity(
  req: NextRequest,
  user: any,
  operation: 'update' | 'password_change' | 'address' | 'avatar',
  data?: any
): SecurityContext {
  const context = getSecurityContext(req, user);
  
  // Validate session security
  validateSessionSecurity(req, user);
  
  // Operation-specific validation
  switch (operation) {
    case 'update':
      validateProfileUpdateSecurity(context, data);
      break;
    case 'password_change':
      validatePasswordChangeSecurity(context, data.currentPassword, data.newPassword);
      break;
    case 'address':
      validateAddressSecurity(context, data);
      break;
    case 'avatar':
      validateAvatarUploadSecurity(context, data);
      break;
  }

  return context;
}