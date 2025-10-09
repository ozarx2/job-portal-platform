import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://ec2-15-134-104-170.ap-southeast-2.compute.amazonaws.com/api';

const aggregatedJobService = {
  // Search aggregated jobs
  searchJobs: async (searchParams) => {
    try {
      const params = new URLSearchParams({
        search: searchParams.searchTerm || '',
        location: searchParams.location || '',
        jobType: searchParams.jobType || '',
        experience: searchParams.experience || '',
        page: searchParams.page || 1,
        limit: searchParams.limit || 20
      });

      const response = await axios.get(`${API_BASE_URL}/aggregated-jobs?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error searching aggregated jobs:', error);
      throw error;
    }
  },

  // Advanced search with filters
  advancedSearch: async (searchData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/aggregated-jobs/search`, searchData);
      return response.data;
    } catch (error) {
      console.error('Error in advanced aggregated search:', error);
      throw error;
    }
  },

  // Get available sources
  getSources: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/aggregated-jobs/sources`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sources:', error);
      throw error;
    }
  }
};

export default aggregatedJobService;
















