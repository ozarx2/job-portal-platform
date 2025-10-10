/**
 * Centralized validation utilities for all forms
 */

// Validation rules
export const validationRules = {
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
  
  confirmPassword: {
    required: true,
    message: {
      required: 'Please confirm your password',
      mismatch: 'Passwords do not match'
    }
  },
  
  phone: {
    required: false,
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    message: {
      pattern: 'Please enter a valid phone number'
    }
  },
  
  experience: {
    required: false,
    type: 'number',
    min: 0,
    max: 50,
    message: {
      type: 'Experience must be a valid number',
      min: 'Experience cannot be negative',
      max: 'Experience cannot exceed 50 years'
    }
  },
  
  salary: {
    required: false,
    pattern: /^[\d,.-]+$/,
    message: {
      pattern: 'Please enter a valid salary format (e.g., 50000 or 50,000-70,000)'
    }
  },
  
  companyName: {
    required: true,
    minLength: 2,
    maxLength: 100,
    message: {
      required: 'Company name is required',
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
  },
  
  skills: {
    required: false,
    message: {
      format: 'Skills should be separated by commas'
    }
  },
  
  website: {
    required: false,
    pattern: /^https?:\/\/.+/,
    message: {
      pattern: 'Please enter a valid URL starting with http:// or https://'
    }
  },
  
  linkedin: {
    required: false,
    pattern: /^https?:\/\/(www\.)?linkedin\.com\/in\/.+/,
    message: {
      pattern: 'Please enter a valid LinkedIn profile URL'
    }
  },
  
  github: {
    required: false,
    pattern: /^https?:\/\/(www\.)?github\.com\/.+/,
    message: {
      pattern: 'Please enter a valid GitHub profile URL'
    }
  },
  
  bio: {
    required: false,
    maxLength: 1000,
    message: {
      maxLength: 'Bio must not exceed 1000 characters'
    }
  }
};

/**
 * Validate a single field
 * @param {string} fieldName - Name of the field
 * @param {any} value - Value to validate
 * @param {object} formData - Complete form data for cross-field validation
 * @returns {string|null} - Error message or null if valid
 */
export const validateField = (fieldName, value, formData = {}) => {
  const rule = validationRules[fieldName];
  if (!rule) return null;

  // Required validation
  if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
    return rule.message.required;
  }

  // Skip other validations if field is empty and not required
  if (!value || (typeof value === 'string' && !value.trim())) {
    return null;
  }

  // Type validation
  if (rule.type === 'number') {
    const numValue = Number(value);
    if (isNaN(numValue)) {
      return rule.message.type;
    }
    if (rule.min !== undefined && numValue < rule.min) {
      return rule.message.min;
    }
    if (rule.max !== undefined && numValue > rule.max) {
      return rule.message.max;
    }
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
  }

  // Cross-field validation
  if (fieldName === 'confirmPassword' && formData.password && value !== formData.password) {
    return rule.message.mismatch;
  }

  return null;
};

/**
 * Validate entire form
 * @param {object} formData - Form data to validate
 * @param {array} fieldsToValidate - Array of field names to validate (optional, validates all if not provided)
 * @returns {object} - Object with field names as keys and error messages as values
 */
export const validateForm = (formData, fieldsToValidate = null) => {
  const errors = {};
  const fields = fieldsToValidate || Object.keys(formData);
  
  fields.forEach(fieldName => {
    const error = validateField(fieldName, formData[fieldName], formData);
    if (error) {
      errors[fieldName] = error;
    }
  });
  
  return errors;
};

/**
 * Check if form is valid
 * @param {object} formData - Form data to validate
 * @param {array} requiredFields - Array of required field names
 * @returns {boolean} - True if form is valid
 */
export const isFormValid = (formData, requiredFields = []) => {
  const errors = validateForm(formData);
  
  // Check if all required fields are present and valid
  for (const field of requiredFields) {
    if (validationRules[field]?.required) {
      if (!formData[field] || (typeof formData[field] === 'string' && !formData[field].trim())) {
        return false;
      }
    }
    if (errors[field]) {
      return false;
    }
  }
  
  return Object.keys(errors).length === 0;
};

/**
 * Sanitize form data
 * @param {object} formData - Form data to sanitize
 * @returns {object} - Sanitized form data
 */
export const sanitizeFormData = (formData) => {
  const sanitized = {};
  
  Object.keys(formData).forEach(key => {
    const value = formData[key];
    
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
  
  return sanitized;
};

/**
 * Get validation summary for display
 * @param {object} errors - Validation errors object
 * @returns {object} - Summary with count and messages
 */
export const getValidationSummary = (errors) => {
  const errorCount = Object.keys(errors).length;
  const errorMessages = Object.values(errors);
  
  return {
    hasErrors: errorCount > 0,
    errorCount,
    errorMessages,
    summary: errorCount === 0 
      ? 'Form is valid' 
      : `${errorCount} field${errorCount === 1 ? '' : 's'} need${errorCount === 1 ? 's' : ''} attention`
  };
};











