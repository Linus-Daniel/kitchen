export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  custom?: (value: any) => string | null;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string;
}

export class Validator {
  static validateField(value: any, rule: ValidationRule): string | null {
    // Required validation
    if (rule.required && (value === null || value === undefined || value === '')) {
      return 'This field is required';
    }

    // Skip other validations if field is empty and not required
    if (!rule.required && (value === null || value === undefined || value === '')) {
      return null;
    }

    // String validations
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        return `Minimum length is ${rule.minLength} characters`;
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        return `Maximum length is ${rule.maxLength} characters`;
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        return 'Invalid format';
      }
    }

    // Number validations
    if (typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        return `Minimum value is ${rule.min}`;
      }
      if (rule.max !== undefined && value > rule.max) {
        return `Maximum value is ${rule.max}`;
      }
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value);
    }

    return null;
  }

  static validateObject(data: any, schema: ValidationSchema): ValidationErrors {
    const errors: ValidationErrors = {};

    for (const [field, rule] of Object.entries(schema)) {
      const value = data[field];
      const error = this.validateField(value, rule);
      
      if (error) {
        errors[field] = error;
      }
    }

    return errors;
  }

  static isValid(errors: ValidationErrors): boolean {
    return Object.keys(errors).length === 0;
  }
}

// Common validation patterns
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  url: /^https?:\/\/.+/,
  zipCode: /^\d{5}(-\d{4})?$/,
};

// Common validation schemas
export const CommonSchemas = {
  user: {
    name: { required: true, minLength: 2, maxLength: 50 },
    email: { required: true, pattern: ValidationPatterns.email },
    phone: { required: true, pattern: ValidationPatterns.phone },
    password: { 
      required: true, 
      minLength: 8,
      pattern: ValidationPatterns.password,
      custom: (value: string) => {
        if (!value.match(/[a-z]/)) return 'Password must contain at least one lowercase letter';
        if (!value.match(/[A-Z]/)) return 'Password must contain at least one uppercase letter';
        if (!value.match(/\d/)) return 'Password must contain at least one number';
        return null;
      }
    },
  },
  
  product: {
    name: { required: true, minLength: 2, maxLength: 100 },
    description: { required: true, minLength: 10, maxLength: 1000 },
    price: { required: true, min: 0.01, max: 10000 },
    category: { required: true },
    cookTime: { required: true, minLength: 3, maxLength: 50 },
  },

  address: {
    street: { required: true, minLength: 5, maxLength: 100 },
    city: { required: true, minLength: 2, maxLength: 50 },
    state: { required: true, minLength: 2, maxLength: 50 },
    zipCode: { required: true, pattern: ValidationPatterns.zipCode },
  },

  order: {
    shippingAddress: { required: true },
    paymentMethod: { required: true },
    itemsPrice: { required: true, min: 0.01 },
    totalPrice: { required: true, min: 0.01 },
  },
};

// Form validation hook helper
export function useValidation<T>(schema: ValidationSchema) {
  const validate = (data: T): ValidationErrors => {
    return Validator.validateObject(data, schema);
  };

  const validateField = (field: string, value: any): string | null => {
    const rule = schema[field];
    if (!rule) return null;
    return Validator.validateField(value, rule);
  };

  return { validate, validateField, isValid: Validator.isValid };
}