// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  ME: `${API_BASE_URL}/auth/me`,
  GOOGLE_AUTH: `${API_BASE_URL}/auth/google`,
  FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
  RESEND_VERIFICATION: `${API_BASE_URL}/auth/resend-verification`,
  PREUSER_LOGIN: `${API_BASE_URL}/auth/preuser-login`,
  
  // Job endpoints
  JOBS: `${API_BASE_URL}/jobs`,
  EMPLOYER_JOBS: `${API_BASE_URL}/jobs/employer`,
  ACTIVE_JOBS: `${API_BASE_URL}/jobs/active`,
  
  // Company endpoints
  COMPANIES: `${API_BASE_URL}/companies`,
  
  // Application endpoints
  APPLICATIONS: `${API_BASE_URL}/applications`,
  APPLY: `${API_BASE_URL}/applications/apply`,
  EMPLOYER_APPLICATIONS: `${API_BASE_URL}/applications/employer`,
  MY_APPLICATIONS: `${API_BASE_URL}/applications/me`,
  SELECTED_APPLICATIONS: `${API_BASE_URL}/applications/selected`,
  PROFILE_STATUS: `${API_BASE_URL}/applications/profile-status`,
  
  // User endpoints
  UPDATE_USER: `${API_BASE_URL}/users/update`,
  UPLOAD_RESUME: `${API_BASE_URL}/users/resume`,
  USER_PROFILE: `${API_BASE_URL}/users/profile`,
  
  // Admin endpoints
  ADMIN_USERS: `${API_BASE_URL}/admin/users`,
  ADMIN_APPLICATIONS: `${API_BASE_URL}/admin/applications`,
  ADMIN_CREATE_USER: `${API_BASE_URL}/admin/users`,
  ADMIN_UPDATE_USER: `${API_BASE_URL}/admin/users`,
  ADMIN_DELETE_USER: `${API_BASE_URL}/admin/users`,
  
  // CRM endpoints
  CRM_LEADS: `${API_BASE_URL}/crm/leads`,
  CRM_UPLOAD: `${API_BASE_URL}/crm/upload`,
  CRM_SUMMARY: `${API_BASE_URL}/crm/admin/summary`,
  COLLECT_EMAIL: `${API_BASE_URL}/crm/leads/collect-email`,
  CONVERT_TO_PREUSER: `${API_BASE_URL}/crm/leads/convert-to-preuser`,
  
  // Onboarding endpoints
  ONBOARDING_SUBMIT: `${API_BASE_URL}/onboarding/submit`,
  ONBOARDING_SIMPLE_SUBMIT: `${API_BASE_URL}/onboarding/simple-submit`,
  ONBOARDING_STATUS: `${API_BASE_URL}/onboarding/status`,
  ONBOARDING_CANDIDATE: `${API_BASE_URL}/onboarding/candidate`,
  ONBOARDING_UPLOAD_DOCUMENT: `${API_BASE_URL}/onboarding/upload-document`,
  ONBOARDING_DOCUMENTS: `${API_BASE_URL}/onboarding/documents`,
  
  // Reports endpoints
  REPORTS_SUMMARY: `${API_BASE_URL}/reports/summary`,
  CONVERSION_ANALYTICS: `${API_BASE_URL}/reports/conversion-analytics`,
  
  // Email endpoints
  EMAIL_FORGOT_PASSWORD: `${API_BASE_URL}/email/forgot-password`,
  EMAIL_RESET_PASSWORD: `${API_BASE_URL}/email/reset-password`,
  EMAIL_NEWSLETTER: `${API_BASE_URL}/email/newsletter/subscribe`,
  
  // Aggregated Jobs endpoints
  AGGREGATED_JOBS: `${API_BASE_URL}/aggregated-jobs`,
  AGGREGATED_JOBS_SEARCH: `${API_BASE_URL}/aggregated-jobs/search`,
  AGGREGATED_JOBS_SOURCES: `${API_BASE_URL}/aggregated-jobs/sources`,
  
  // Assisted Hiring endpoints
  ASSISTED_HIRING_PACKAGES: `${API_BASE_URL}/assisted-hiring/packages`,
  ASSISTED_HIRING_REQUEST: `${API_BASE_URL}/assisted-hiring/request`,
  ASSISTED_HIRING_PAYMENT: `${API_BASE_URL}/assisted-hiring/payment-intent`,
  ASSISTED_HIRING_CONFIRM: `${API_BASE_URL}/assisted-hiring/confirm-payment`,
  ASSISTED_HIRING_MY_SERVICES: `${API_BASE_URL}/assisted-hiring/my-services`,
  ASSISTED_HIRING_ADMIN_ALL: `${API_BASE_URL}/assisted-hiring/admin/all`,
  
  // Health check
  HEALTH: `${API_BASE_URL}/health`,
};

export default API_ENDPOINTS; 