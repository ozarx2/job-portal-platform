import axios from 'axios';

// Use GCP backend API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Fallback API URL for when primary API is down
const FALLBACK_API_URL = import.meta.env.VITE_FALLBACK_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000, // Increased to 30 seconds for heavy operations
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for auth
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Application endpoints
  async getApplications(filters = {}) {
    return this.client.get('/applications', { params: filters });
  }

  async getMyApplications() {
    return this.client.get('/applications/me');
  }

  async getEmployerApplications() {
    return this.client.get('/applications/employer');
  }

  async applyForJob(jobId) {
    return this.client.post('/applications/apply', { jobId });
  }

  async updateApplicationStatus(id, status) {
    // Try multiple endpoints to find the working one
    try {
      return await this.client.patch(`/applications/${id}`, { status });
    } catch (error) {
      if (error.response?.status === 404) {
        // Try CRM leads endpoint as fallback
        return await this.client.put(`/crm/leads/${id}`, { status });
      }
      throw error;
    }
  }

  async getSelectedApplications() {
    return this.client.get('/applications/selected');
  }

  // Job endpoints
  async getJobs(filters = {}) {
    try {
      return await this.client.get('/jobs', { params: filters });
    } catch (error) {
      if (error.response?.status === 502) {
        console.warn('Primary API down, trying fallback...');
        // Try fallback API
        const fallbackClient = axios.create({
          baseURL: FALLBACK_API_URL,
          timeout: 30000, // Increased to 30 seconds for heavy operations
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        // Add auth token if available
        const token = localStorage.getItem('token');
        if (token) {
          fallbackClient.defaults.headers.Authorization = `Bearer ${token}`;
        }
        
        return await fallbackClient.get('/jobs', { params: filters });
      }
      throw error;
    }
  }

  async getEmployerJobs() {
    console.log('🔍 API Service - Making request to /jobs/employer');
    console.log('🔍 API Base URL:', this.client.defaults.baseURL);
    console.log('🔍 Request headers:', this.client.defaults.headers);
    return this.client.get('/jobs/employer');
  }

  async createJob(jobData) {
    return this.client.post('/jobs', jobData);
  }

  async updateJob(id, jobData) {
    return this.client.put(`/jobs/${id}`, jobData);
  }

  async deleteJob(id) {
    return this.client.delete(`/jobs/${id}`);
  }

  // User endpoints
  async getCurrentUser() {
    return this.client.get('/auth/me');
  }

  async updateUserProfile(userData) {
    return this.client.put('/users/update', userData);
  }

  async uploadResume(formData) {
    return this.client.post('/users/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  // Admin endpoints
  async getUsers(filters = {}) {
    return this.client.get('/admin/users', { params: filters });
  }

  async createUser(userData) {
    return this.client.post('/admin/users', userData);
  }

  async updateUser(id, userData) {
    return this.client.put(`/admin/users/${id}`, userData);
  }

  async deleteUser(id) {
    return this.client.delete(`/admin/users/${id}`);
  }

  async getAdminApplications() {
    return this.client.get('/admin/applications');
  }

  // CRM endpoints
  async getLeads(filters = {}) {
    return this.client.get('/crm/leads', { params: filters });
  }

  async updateLead(id, data) {
    return this.client.put(`/crm/leads/${id}`, data);
  }

  async deleteLead(id) {
    return this.client.delete(`/crm/leads/${id}`);
  }

  async getCrmSummary() {
    return this.client.get('/crm/admin/summary');
  }

  async collectEmail(leadId, emailData) {
    return this.client.put(`/crm/leads/${leadId}/collect-email`, emailData);
  }

  async convertToPreUser(leadId, userData) {
    return this.client.post(`/crm/leads/${leadId}/convert-to-preuser`, userData);
  }

  async uploadLeads(formData) {
    return this.client.post('/crm/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  // Company endpoints
  async getCompanies() {
    return this.client.get('/companies');
  }

  async getUserCompanies() {
    return this.client.get('/companies/user');
  }

  // Candidate search endpoints
  async searchCandidates(searchParams) {
    return this.client.get('/candidates/search', { params: searchParams });
  }

  async getCandidate(candidateId) {
    return this.client.get(`/candidates/${candidateId}`);
  }

  async contactCandidate(candidateId, messageData) {
    return this.client.post(`/candidates/${candidateId}/contact`, messageData);
  }

  async createCompany(companyData) {
    return this.client.post('/companies', companyData);
  }

  async updateCompany(companyId, companyData) {
    return this.client.put(`/companies/${companyId}`, companyData);
  }

  async deleteCompany(companyId) {
    return this.client.delete(`/companies/${companyId}`);
  }

  async getCompany(companyId) {
    return this.client.get(`/companies/${companyId}`);
  }

  // Job CRUD operations
  async updateJob(jobId, jobData) {
    return this.client.put(`/jobs/${jobId}`, jobData);
  }

  async deleteJob(jobId) {
    return this.client.delete(`/jobs/${jobId}`);
  }

  async getJob(jobId) {
    return this.client.get(`/jobs/${jobId}`);
  }

  async postJob(jobData) {
    return this.client.post('/jobs', jobData);
  }

  // Onboarding endpoints
  async submitOnboarding(formData) {
    return this.client.post('/onboarding/submit', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  // Reports endpoints
  async getReportsSummary(filters = {}) {
    return this.client.get('/reports/summary', { params: filters });
  }

  async getShortlistedLeads() {
    return this.client.get('/crm/leads?status=Shortlisted');
  }

  // Onboarding endpoints
  async submitOnboarding(formData) {
    return this.client.post('/onboarding/submit', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  async submitSimpleOnboarding(formData) {
    return this.client.post('/onboarding/simple-submit', formData);
  }

  async getOnboardingStatus() {
    return this.client.get('/onboarding/status');
  }

  async getCandidateOnboarding(userId) {
    return this.client.get(`/onboarding/candidate/${userId}`);
  }

  async uploadOnboardingDocument(onboardingId, formData) {
    return this.client.post(`/onboarding/${onboardingId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  async uploadDocument(formData) {
    return this.client.post('/onboarding/upload-document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  // Email endpoints
  async sendForgotPassword(email) {
    return this.client.post('/email/forgot-password', { email });
  }

  async sendResetPassword(token, password) {
    return this.client.post('/email/reset-password', { token, password });
  }

  async subscribeNewsletter(email) {
    return this.client.post('/email/newsletter/subscribe', { email });
  }

  // Reports endpoints
  async getReportsSummary(filters = {}) {
    return this.client.get('/reports/summary', { params: filters });
  }

  async getConversionAnalytics() {
    return this.client.get('/reports/conversion-analytics');
  }

  // Utility methods
  async testConnection() {
    try {
      await this.client.get('/health');
      return { success: true, message: 'API connection successful' };
    } catch (error) {
      return { 
        success: false, 
        message: `API connection failed: ${error.message}` 
      };
    }
  }

  async testApplicationUpdate(appId, testStatus = 'Test Status') {
    try {
      const response = await this.updateApplicationStatus(appId, testStatus);
      return { 
        success: true, 
        message: 'Application update test successful',
        data: response.data 
      };
    } catch (error) {
      return { 
        success: false, 
        message: `Application update test failed: ${error.response?.data?.message || error.message}`,
        status: error.response?.status
      };
    }
  }

  // Assisted Hiring Service endpoints
  async getServicePackages() {
    return this.client.get('/assisted-hiring/packages');
  }

  async requestAssistedHiring(jobId, servicePackage) {
    return this.client.post('/assisted-hiring/request', {
      jobId,
      servicePackage
    });
  }

  async createPaymentIntent(serviceId) {
    return this.client.post(`/assisted-hiring/${serviceId}/payment-intent`);
  }

  async confirmPayment(serviceId, paymentIntentId) {
    return this.client.post(`/assisted-hiring/${serviceId}/confirm-payment`, {
      paymentIntentId
    });
  }

  // Razorpay payment methods
  async createRazorpayOrder(serviceId) {
    return this.client.post(`/assisted-hiring/${serviceId}/create-razorpay-order`);
  }

  async verifyRazorpayPayment(serviceId, orderId, paymentId, signature) {
    return this.client.post(`/assisted-hiring/${serviceId}/verify-razorpay-payment`, {
      orderId,
      paymentId,
      signature
    });
  }

  async getMyServices() {
    return this.client.get('/assisted-hiring/my-services');
  }

  async getServiceDetails(serviceId) {
    return this.client.get(`/assisted-hiring/${serviceId}`);
  }

  async updateServiceStatus(serviceId, status, notes) {
    return this.client.put(`/assisted-hiring/${serviceId}/update-status`, {
      status,
      notes
    });
  }

  async addServiceNote(serviceId, note) {
    return this.client.post(`/assisted-hiring/${serviceId}/add-note`, {
      note
    });
  }

  async getAllServices() {
    return this.client.get('/assisted-hiring/admin/all');
  }
}

export default new ApiService();
