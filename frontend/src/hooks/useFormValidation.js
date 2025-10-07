/**
 * Custom hook for form validation and error handling
 */

import { useState, useCallback, useEffect } from 'react';
import { validateField, validateForm, isFormValid, sanitizeFormData } from '../utils/validation';
import { handleApiError, handleValidationErrors, createFormSubmissionNotification } from '../utils/notifications';

/**
 * Custom hook for form validation
 * @param {object} initialFormData - Initial form data
 * @param {array} requiredFields - Array of required field names
 * @param {object} options - Additional options
 * @returns {object} - Form validation utilities
 */
export const useFormValidation = (initialFormData = {}, requiredFields = [], options = {}) => {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Validate single field
  const validateSingleField = useCallback((fieldName, value) => {
    const error = validateField(fieldName, value, formData);
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[fieldName] = error;
      } else {
        delete newErrors[fieldName];
      }
      return newErrors;
    });
    return error;
  }, [formData]);

  // Handle input change
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate field if it's been touched or if submit was attempted
    if (touched[name] || submitAttempted) {
      validateSingleField(name, fieldValue);
    }
  }, [touched, submitAttempted, validateSingleField]);

  // Handle file input change
  const handleFileChange = useCallback((e) => {
    const { name, files } = e.target;
    const file = files[0] || null;
    
    setFormData(prev => ({
      ...prev,
      [name]: file
    }));

    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate file if it's been touched or if submit was attempted
    if (touched[name] || submitAttempted) {
      validateSingleField(name, file);
    }
  }, [touched, submitAttempted, validateSingleField]);

  // Handle blur event (validate field when user leaves it)
  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    validateSingleField(name, value);
  }, [validateSingleField]);

  // Validate entire form
  const validateEntireForm = useCallback(() => {
    const newErrors = validateForm(formData, requiredFields);
    setErrors(newErrors);
    setSubmitAttempted(true);
    
    // Mark all required fields as touched
    const newTouched = { ...touched };
    requiredFields.forEach(field => {
      newTouched[field] = true;
    });
    setTouched(newTouched);
    
    return Object.keys(newErrors).length === 0;
  }, [formData, requiredFields, touched]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
    setTouched({});
    setSubmitAttempted(false);
    setIsSubmitting(false);
  }, [initialFormData]);

  // Update form data
  const updateFormData = useCallback((newData) => {
    setFormData(prev => ({
      ...prev,
      ...newData
    }));
  }, []);

  // Get sanitized form data
  const getSanitizedData = useCallback(() => {
    return sanitizeFormData(formData);
  }, [formData]);

  // Check if form is valid
  const isValid = isFormValid(formData, requiredFields) && Object.keys(errors).length === 0;

  // Get field error
  const getFieldError = useCallback((fieldName) => {
    return errors[fieldName] || null;
  }, [errors]);

  // Check if field has error
  const hasFieldError = useCallback((fieldName) => {
    return !!(errors[fieldName] && (touched[fieldName] || submitAttempted));
  }, [errors, touched, submitAttempted]);

  // Get field classes for styling
  const getFieldClasses = useCallback((fieldName, baseClasses = '') => {
    const hasError = hasFieldError(fieldName);
    const errorClasses = hasError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';
    return `${baseClasses} ${errorClasses}`.trim();
  }, [hasFieldError]);

  // Submit form with validation
  const submitForm = useCallback(async (submitFunction, options = {}) => {
    setIsSubmitting(true);
    setSubmitAttempted(true);

    try {
      // Validate form before submission
      const isFormValid = validateEntireForm();
      if (!isFormValid) {
        throw new Error('Form validation failed');
      }

      // Sanitize form data
      const sanitizedData = getSanitizedData();
      
      // Call submit function
      const result = await submitFunction(sanitizedData);
      
      // Handle success
      if (options.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (error) {
      // Handle error
      if (options.onError) {
        options.onError(error);
      }
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [validateEntireForm, getSanitizedData]);

  // Create notification for submission result
  const createSubmissionNotification = useCallback((success, customMessage = null) => {
    return createFormSubmissionNotification(success, customMessage, {
      category: options.category || 'form'
    });
  }, [options.category]);

  // Handle API error and create notification
  const handleApiErrorWithNotification = useCallback((error) => {
    return handleApiError(error, {
      category: options.category || 'form'
    });
  }, [options.category]);

  // Handle validation errors and create notifications
  const handleValidationErrorsWithNotifications = useCallback(() => {
    return handleValidationErrors(errors, {
      category: options.category || 'validation'
    });
  }, [errors, options.category]);

  return {
    // Form data
    formData,
    setFormData: updateFormData,
    
    // Validation state
    errors,
    setErrors,
    touched,
    isValid,
    isSubmitting,
    submitAttempted,
    
    // Event handlers
    handleInputChange,
    handleFileChange,
    handleBlur,
    
    // Validation functions
    validateField: validateSingleField,
    validateForm: validateEntireForm,
    getFieldError,
    hasFieldError,
    getFieldClasses,
    
    // Form utilities
    resetForm,
    submitForm,
    getSanitizedData,
    
    // Notification helpers
    createSubmissionNotification,
    handleApiErrorWithNotification,
    handleValidationErrorsWithNotifications
  };
};

export default useFormValidation;




