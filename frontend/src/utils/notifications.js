/**
 * Centralized notification utilities for consistent error handling and user feedback
 */

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Notification categories for better organization
export const NOTIFICATION_CATEGORIES = {
  VALIDATION: 'validation',
  NETWORK: 'network',
  AUTH: 'auth',
  FORM: 'form',
  UPLOAD: 'upload',
  GENERAL: 'general'
};

// Pre-defined notification messages
export const NOTIFICATION_MESSAGES = {
  // Validation messages
  VALIDATION: {
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_PHONE: 'Please enter a valid phone number',
    PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
    PASSWORDS_DONT_MATCH: 'Passwords do not match',
    INVALID_URL: 'Please enter a valid URL',
    INVALID_LINKEDIN: 'Please enter a valid LinkedIn profile URL',
    INVALID_GITHUB: 'Please enter a valid GitHub profile URL',
    FILE_TOO_LARGE: 'File size exceeds the maximum allowed limit',
    INVALID_FILE_TYPE: 'Invalid file type. Please select a valid file.',
    FORM_INCOMPLETE: 'Please fill in all required fields'
  },
  
  // Network messages
  NETWORK: {
    CONNECTION_ERROR: 'Unable to connect to the server. Please check your internet connection.',
    TIMEOUT: 'Request timed out. Please try again.',
    SERVER_ERROR: 'Server error occurred. Please try again later.',
    NOT_FOUND: 'The requested resource was not found.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    FORBIDDEN: 'Access denied. You do not have permission to perform this action.'
  },
  
  // Authentication messages
  AUTH: {
    LOGIN_SUCCESS: 'Successfully logged in',
    LOGIN_FAILED: 'Invalid email or password',
    LOGOUT_SUCCESS: 'Successfully logged out',
    REGISTRATION_SUCCESS: 'Account created successfully',
    REGISTRATION_FAILED: 'Failed to create account',
    PASSWORD_RESET_SENT: 'Password reset email sent',
    PASSWORD_RESET_FAILED: 'Failed to send password reset email',
    EMAIL_VERIFICATION_SENT: 'Verification email sent',
    EMAIL_VERIFICATION_FAILED: 'Failed to send verification email',
    TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
    ACCOUNT_VERIFIED: 'Account verified successfully',
    ACCOUNT_VERIFICATION_FAILED: 'Account verification failed'
  },
  
  // Form messages
  FORM: {
    SUBMIT_SUCCESS: 'Form submitted successfully',
    SUBMIT_FAILED: 'Failed to submit form',
    SAVE_SUCCESS: 'Changes saved successfully',
    SAVE_FAILED: 'Failed to save changes',
    UPDATE_SUCCESS: 'Updated successfully',
    UPDATE_FAILED: 'Failed to update',
    DELETE_SUCCESS: 'Deleted successfully',
    DELETE_FAILED: 'Failed to delete',
    LOAD_SUCCESS: 'Data loaded successfully',
    LOAD_FAILED: 'Failed to load data'
  },
  
  // Upload messages
  UPLOAD: {
    UPLOAD_SUCCESS: 'File uploaded successfully',
    UPLOAD_FAILED: 'Failed to upload file',
    UPLOAD_PROGRESS: 'Uploading file...',
    FILE_TOO_LARGE: 'File size exceeds maximum limit of 10MB',
    INVALID_FILE_TYPE: 'Invalid file type. Please select a PDF, DOC, or DOCX file.',
    NO_FILE_SELECTED: 'Please select a file to upload'
  },
  
  // General messages
  GENERAL: {
    LOADING: 'Loading...',
    PROCESSING: 'Processing...',
    SUCCESS: 'Operation completed successfully',
    ERROR: 'An error occurred. Please try again.',
    WARNING: 'Please review your input',
    INFO: 'Information updated',
    CONFIRM_DELETE: 'Are you sure you want to delete this item?',
    CONFIRM_ACTION: 'Are you sure you want to proceed?'
  }
};

/**
 * Create a notification object
 * @param {string} type - Notification type (success, error, warning, info)
 * @param {string} message - Notification message
 * @param {string} category - Notification category
 * @param {object} options - Additional options
 * @returns {object} - Notification object
 */
export const createNotification = (type, message, category = NOTIFICATION_CATEGORIES.GENERAL, options = {}) => {
  return {
    id: Date.now() + Math.random(),
    type,
    message,
    category,
    timestamp: new Date(),
    duration: options.duration || (type === NOTIFICATION_TYPES.ERROR ? 8000 : 5000),
    dismissible: options.dismissible !== false,
    action: options.action || null,
    ...options
  };
};

/**
 * Create success notification
 * @param {string} message - Success message
 * @param {object} options - Additional options
 * @returns {object} - Success notification object
 */
export const createSuccessNotification = (message, options = {}) => {
  return createNotification(NOTIFICATION_TYPES.SUCCESS, message, options.category, options);
};

/**
 * Create error notification
 * @param {string} message - Error message
 * @param {object} options - Additional options
 * @returns {object} - Error notification object
 */
export const createErrorNotification = (message, options = {}) => {
  return createNotification(NOTIFICATION_TYPES.ERROR, message, options.category, options);
};

/**
 * Create warning notification
 * @param {string} message - Warning message
 * @param {object} options - Additional options
 * @returns {object} - Warning notification object
 */
export const createWarningNotification = (message, options = {}) => {
  return createNotification(NOTIFICATION_TYPES.WARNING, message, options.category, options);
};

/**
 * Create info notification
 * @param {string} message - Info message
 * @param {object} options - Additional options
 * @returns {object} - Info notification object
 */
export const createInfoNotification = (message, options = {}) => {
  return createNotification(NOTIFICATION_TYPES.INFO, message, options.category, options);
};

/**
 * Handle API errors and convert to user-friendly notifications
 * @param {Error} error - API error object
 * @param {object} options - Additional options
 * @returns {object} - Error notification object
 */
export const handleApiError = (error, options = {}) => {
  let message = NOTIFICATION_MESSAGES.GENERAL.ERROR;
  let category = NOTIFICATION_CATEGORIES.NETWORK;

  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case 400:
        message = data.message || data.msg || 'Invalid request. Please check your input.';
        category = NOTIFICATION_CATEGORIES.VALIDATION;
        break;
      case 401:
        message = data.message || data.msg || NOTIFICATION_MESSAGES.AUTH.TOKEN_EXPIRED;
        category = NOTIFICATION_CATEGORIES.AUTH;
        break;
      case 403:
        message = data.message || data.msg || NOTIFICATION_MESSAGES.NETWORK.FORBIDDEN;
        category = NOTIFICATION_CATEGORIES.AUTH;
        break;
      case 404:
        message = data.message || data.msg || NOTIFICATION_MESSAGES.NETWORK.NOT_FOUND;
        category = NOTIFICATION_CATEGORIES.NETWORK;
        break;
      case 422:
        message = data.message || data.msg || 'Validation failed. Please check your input.';
        category = NOTIFICATION_CATEGORIES.VALIDATION;
        break;
      case 500:
        message = data.message || data.msg || NOTIFICATION_MESSAGES.NETWORK.SERVER_ERROR;
        category = NOTIFICATION_CATEGORIES.NETWORK;
        break;
      default:
        message = data.message || data.msg || 'An error occurred. Please try again.';
    }
  } else if (error.request) {
    // Network error
    message = NOTIFICATION_MESSAGES.NETWORK.CONNECTION_ERROR;
    category = NOTIFICATION_CATEGORIES.NETWORK;
  } else {
    // Other error
    message = error.message || NOTIFICATION_MESSAGES.GENERAL.ERROR;
  }

  return createErrorNotification(message, { category, ...options });
};

/**
 * Handle validation errors and convert to user-friendly notifications
 * @param {object} errors - Validation errors object
 * @param {object} options - Additional options
 * @returns {array} - Array of error notification objects
 */
export const handleValidationErrors = (errors, options = {}) => {
  if (!errors || typeof errors !== 'object') {
    return [createErrorNotification(NOTIFICATION_MESSAGES.VALIDATION.FORM_INCOMPLETE, options)];
  }

  const errorMessages = Object.values(errors);
  return errorMessages.map(message => 
    createErrorNotification(message, { 
      category: NOTIFICATION_CATEGORIES.VALIDATION,
      ...options 
    })
  );
};

/**
 * Create notification for form submission result
 * @param {boolean} success - Whether submission was successful
 * @param {string} customMessage - Custom message (optional)
 * @param {object} options - Additional options
 * @returns {object} - Notification object
 */
export const createFormSubmissionNotification = (success, customMessage = null, options = {}) => {
  const message = customMessage || (success ? 
    NOTIFICATION_MESSAGES.FORM.SUBMIT_SUCCESS : 
    NOTIFICATION_MESSAGES.FORM.SUBMIT_FAILED
  );
  
  return createNotification(
    success ? NOTIFICATION_TYPES.SUCCESS : NOTIFICATION_TYPES.ERROR,
    message,
    NOTIFICATION_CATEGORIES.FORM,
    options
  );
};

/**
 * Create notification for file upload result
 * @param {boolean} success - Whether upload was successful
 * @param {string} filename - Name of the uploaded file (optional)
 * @param {object} options - Additional options
 * @returns {object} - Notification object
 */
export const createUploadNotification = (success, filename = null, options = {}) => {
  const message = success ? 
    `${NOTIFICATION_MESSAGES.UPLOAD.UPLOAD_SUCCESS}${filename ? `: ${filename}` : ''}` :
    NOTIFICATION_MESSAGES.UPLOAD.UPLOAD_FAILED;
  
  return createNotification(
    success ? NOTIFICATION_TYPES.SUCCESS : NOTIFICATION_TYPES.ERROR,
    message,
    NOTIFICATION_CATEGORIES.UPLOAD,
    options
  );
};






