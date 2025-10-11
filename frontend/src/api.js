// src/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.ozarx.in/api', // Production API
  withCredentials: true, // keep if you’re using cookies/sessions
  headers: {
    'Content-Type': 'application/json'
    // ❌ Removed all Access-Control-Allow-* headers
  },
}).then(console.log)
  .catch(console.error);

// Auth endpoints
export const registerUser = (userData) => API.post('/auth/register', userData);
export const loginUser = (userData) => API.post('/auth/login', userData);
export const googleAuth = (token, role) => API.post('/auth/google', { token, role });
export const getCurrentUser = () => API.get('/auth/me');
export const forgotPassword = (email) => API.post('/auth/forgot-password', { email });
export const resetPassword = (token, password) => API.post('/auth/reset-password', { token, password });
export const resendVerification = (email) => API.post('/auth/resend-verification', { email });
export const preUserLogin = (credentials) => API.post('/auth/preuser-login', credentials);

// Job endpoints
export const getJobs = () => API.get('/jobs');
export const getEmployerJobs = () => API.get('/jobs/employer');
export const getActiveJobs = () => API.get('/jobs/active');
export const createJob = (jobData) => API.post('/jobs', jobData);
export const updateJob = (id, jobData) => API.put(`/jobs/${id}`, jobData);
export const deleteJob = (id) => API.delete(`/jobs/${id}`);

// Application endpoints
export const getApplications = (filters = {}) => API.get('/applications', { params: filters });
export const getMyApplications = () => API.get('/applications/me');
export const getEmployerApplications = () => API.get('/applications/employer');
export const getSelectedApplications = () => API.get('/applications/selected');
export const applyForJob = (jobId) => API.post('/applications/apply', { jobId });
export const updateApplicationStatus = (id, status) => API.patch(`/applications/${id}`, { status });

// Company endpoints
export const getCompanies = () => API.get('/companies');
export const createCompany = (companyData) => API.post('/companies', companyData);
export const updateCompany = (id, companyData) => API.put(`/companies/${id}`, companyData);
export const deleteCompany = (id) => API.delete(`/companies/${id}`);

// User endpoints
export const updateUser = (userData) => API.put('/users/update', userData);
export const uploadResume = (formData) =>
  API.post('/users/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
export const updateUserProfile = (formData) =>
  API.put('/users/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

// Admin endpoints
export const getUsers = (filters = {}) => API.get('/admin/users', { params: filters });
export const createUser = (userData) => API.post('/admin/users', userData);
export const updateUserAdmin = (id, userData) => API.put(`/admin/users/${id}`, userData);
export const deleteUser = (id) => API.delete(`/admin/users/${id}`);
export const getAdminApplications = () => API.get('/admin/applications');

// CRM endpoints
export const getLeads = (filters = {}) => API.get('/crm/leads', { params: filters });
export const updateLead = (id, data) => API.put(`/crm/leads/${id}`, data);
export const deleteLead = (id) => API.delete(`/crm/leads/${id}`);
export const getCrmSummary = () => API.get('/crm/admin/summary');
export const uploadLeads = (formData) =>
  API.post('/crm/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
export const collectEmail = (leadId, emailData) =>
  API.put(`/crm/leads/${leadId}/collect-email`, emailData);
export const convertToPreUser = (leadId, userData) =>
  API.post(`/crm/leads/${leadId}/convert-to-preuser`, userData);

// Onboarding endpoints
export const submitOnboarding = (formData) =>
  API.post('/onboarding/submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
export const submitSimpleOnboarding = (formData) =>
  API.post('/onboarding/simple-submit', formData);
export const getOnboardingStatus = () => API.get('/onboarding/status');
export const getCandidateOnboarding = (userId) => API.get(`/onboarding/candidate/${userId}`);
export const uploadOnboardingDocument = (onboardingId, formData) =>
  API.post(`/onboarding/${onboardingId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
export const uploadDocument = (formData) =>
  API.post('/onboarding/upload-document', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

// Reports endpoints
export const getReportsSummary = (filters = {}) => API.get('/reports/summary', { params: filters });
export const getConversionAnalytics = () => API.get('/reports/conversion-analytics');

// Email endpoints
export const sendForgotPassword = (email) => API.post('/email/forgot-password', { email });
export const sendResetPassword = (token, password) => API.post('/email/reset-password', { token, password });
export const subscribeNewsletter = (email) => API.post('/email/newsletter/subscribe', { email });

// Health check
export const healthCheck = () => API.get('/health');
