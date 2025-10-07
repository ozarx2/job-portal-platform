import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class OnboardingService {
  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/onboarding`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Start onboarding process for selected candidate
  async startOnboarding(applicationId, data) {
    try {
      console.log('OnboardingService - Starting onboarding:', {
        applicationId,
        data
      });
      
      const response = await this.client.post('/', {
        applicationId,
        ...data
      });
      
      console.log('OnboardingService - Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('OnboardingService - Error starting onboarding:', error);
      console.error('OnboardingService - Error response:', error.response?.data);
      throw error;
    }
  }

  // Get candidate's onboarding data
  async getCandidateOnboarding(candidateId, status = null) {
    try {
      const params = status ? { status } : {};
      const response = await this.client.get(`/candidate/${candidateId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching candidate onboarding:', error);
      throw error;
    }
  }

  // Get company onboarding data (for HR/Admin)
  async getCompanyOnboarding(companyId, status = null) {
    try {
      const params = status ? { status } : {};
      const response = await this.client.get(`/company/${companyId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching company onboarding:', error);
      throw error;
    }
  }

  // Update onboarding step status
  async updateStepStatus(onboardingId, step, status, data = {}) {
    try {
      const response = await this.client.put(`/${onboardingId}/step`, {
        step,
        status,
        data
      });
      return response.data;
    } catch (error) {
      console.error('Error updating step status:', error);
      throw error;
    }
  }

  // Upload documents for onboarding
  async uploadDocuments(onboardingId, documents, documentType) {
    try {
      const formData = new FormData();
      documents.forEach(doc => {
        formData.append('documents', doc);
      });
      formData.append('documentType', documentType);

      const response = await axios.post(
        `${API_BASE_URL}/onboarding/${onboardingId}/documents`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000, // 30 seconds for file uploads
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading documents:', error);
      throw error;
    }
  }

  // Add notes to onboarding
  async addNote(onboardingId, content) {
    try {
      const response = await this.client.post(`/${onboardingId}/notes`, {
        content
      });
      return response.data;
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  }

  // Get onboarding statistics
  async getOnboardingStats(companyId) {
    try {
      const response = await this.client.get(`/stats/${companyId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching onboarding stats:', error);
      throw error;
    }
  }
}

export default new OnboardingService();
