/**
 * Enhanced validation middleware for better error handling
 */

const validationRules = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s'-]+$/,
    message: {
      required: 'Name is required',
      minLength: 'Name must be at least 2 characters',
      maxLength: 'Name must not exceed 50 characters',
      pattern: 'Name can only contain letters, spaces, hyphens, and apostrophes'
    }
  },
  
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: {
      required: 'Email is required',
      pattern: 'Please enter a valid email address'
    }
  },
  
  password: {
    required: true,
    minLength: 8,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    message: {
      required: 'Password is required',
      minLength: 'Password must be at least 8 characters',
      maxLength: 'Password must not exceed 128 characters',
      pattern: 'Password must contain uppercase, lowercase, number, and special character'
    }
  },
  
  phone: {
    required: false,
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    message: {
      pattern: 'Please enter a valid phone number'
    }
  },
  
  role: {
    required: true,
    enum: ['candidate', 'employer', 'agent', 'admin'],
    message: {
      required: 'Please select a role',
      enum: 'Invalid role selected'
    }
  },
  
  companyName: {
    required: false,
    minLength: 2,
    maxLength: 100,
    message: {
      minLength: 'Company name must be at least 2 characters',
      maxLength: 'Company name must not exceed 100 characters'
    }
  },
  
  jobTitle: {
    required: true,
    minLength: 3,
    maxLength: 100,
    message: {
      required: 'Job title is required',
      minLength: 'Job title must be at least 3 characters',
      maxLength: 'Job title must not exceed 100 characters'
    }
  },
  
  jobDescription: {
    required: true,
    minLength: 20,
    maxLength: 5000,
    message: {
      required: 'Job description is required',
      minLength: 'Job description must be at least 20 characters',
      maxLength: 'Job description must not exceed 5000 characters'
    }
  },
  
  location: {
    required: false,
    minLength: 2,
    maxLength: 100,
    message: {
      minLength: 'Location must be at least 2 characters',
      maxLength: 'Location must not exceed 100 characters'
    }
  }
};

/**
 * Validate a single field
 */
const validateField = (fieldName, value, rule) => {
  if (!rule) return null;

  // Required validation
  if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
    return rule.message.required;
  }

  // Skip other validations if field is empty and not required
  if (!value || (typeof value === 'string' && !value.trim())) {
    return null;
  }

  // String validations
  if (typeof value === 'string') {
    const trimmedValue = value.trim();
    
    // Length validations
    if (rule.minLength && trimmedValue.length < rule.minLength) {
      return rule.message.minLength;
    }
    if (rule.maxLength && trimmedValue.length > rule.maxLength) {
      return rule.message.maxLength;
    }
    
    // Pattern validation
    if (rule.pattern && !rule.pattern.test(trimmedValue)) {
      return rule.message.pattern;
    }
    
    // Enum validation
    if (rule.enum && !rule.enum.includes(trimmedValue)) {
      return rule.message.enum;
    }
  }

  return null;
};

/**
 * Create validation middleware
 */
const createValidationMiddleware = (fieldsToValidate) => {
  return (req, res, next) => {
    const errors = {};
    
    fieldsToValidate.forEach(fieldName => {
      const rule = validationRules[fieldName];
      const value = req.body[fieldName];
      
      const error = validateField(fieldName, value, rule);
      if (error) {
        errors[fieldName] = error;
      }
    });
    
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
        errorCount: Object.keys(errors).length
      });
    }
    
    next();
  };
};

/**
 * Sanitize request body
 */
const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    const sanitized = {};
    
    Object.keys(req.body).forEach(key => {
      const value = req.body[key];
      
      if (typeof value === 'string') {
        // Trim whitespace and remove excessive spaces
        sanitized[key] = value.trim().replace(/\s+/g, ' ');
      } else if (typeof value === 'number') {
        sanitized[key] = value;
      } else if (Array.isArray(value)) {
        // Sanitize array elements
        sanitized[key] = value.map(item => 
          typeof item === 'string' ? item.trim().replace(/\s+/g, ' ') : item
        ).filter(item => item);
      } else {
        sanitized[key] = value;
      }
    });
    
    req.body = sanitized;
  }
  
  next();
};

// Specific validation middlewares
const validateRegistration = createValidationMiddleware(['name', 'email', 'password', 'role']);
const validateLogin = createValidationMiddleware(['email', 'password']);
const validateJobCreation = createValidationMiddleware(['title', 'description', 'location']);
const validateCompanyCreation = createValidationMiddleware(['name']);

// Enhanced error handler
const handleValidationError = (error, req, res, next) => {
  if (error.name === 'ValidationError') {
    const errors = {};
    
    Object.keys(error.errors).forEach(field => {
      errors[field] = error.errors[field].message;
    });
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
      errorCount: Object.keys(errors).length
    });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ${error.path}: ${error.value}`,
      errors: {
        [error.path]: `Invalid ${error.path} format`
      }
    });
  }
  
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
      errors: {
        [field]: `${field} is already in use`
      }
    });
  }
  
  next(error);
};

module.exports = {
  validateField,
  createValidationMiddleware,
  sanitizeBody,
  validateRegistration,
  validateLogin,
  validateJobCreation,
  validateCompanyCreation,
  handleValidationError,
  validationRules
};






