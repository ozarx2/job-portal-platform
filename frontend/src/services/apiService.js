import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.ozarx.in/api';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
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
    return this.client.get('/jobs', { params: filters });
  }

  async getEmployerJobs() {
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

  // Company endpoints
  async getCompanies() {
    return this.client.get('/companies');
  }

  async createCompany(companyData) {
    return this.client.post('/companies', companyData);
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
}

export default new ApiService();
