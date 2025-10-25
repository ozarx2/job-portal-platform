// Centralized API Client with CORS handling
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.ozarx.in/api';

// CORS Proxy for Vercel deployments
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

// Function to get API URL with CORS proxy for Vercel
const getApiUrl = () => {
  const isVercel = window.location.hostname.includes('vercel.app');
  
  console.log('🔍 CORS Debug Info:');
  console.log('📍 Current hostname:', window.location.hostname);
  console.log('🌐 Is Vercel:', isVercel);
  console.log('🔗 API Base URL:', API_BASE_URL);
  
  if (isVercel) {
    // Use CORS proxy for Vercel deployments
    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(API_BASE_URL)}`;
    console.log('🔄 Using CORS Proxy:', proxyUrl);
    return proxyUrl;
  }
  
  // Use direct API for local development
  console.log('🏠 Using Direct API:', API_BASE_URL);
  return API_BASE_URL;
};

// Create axios instance with CORS handling
const apiClient = axios.create({
  baseURL: getApiUrl(),
  withCredentials: false, // Disable credentials for CORS proxy
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
});

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
      console.error('🚨 CORS Error detected!');
      console.error('📍 Current origin:', window.location.origin);
      console.error('💡 Frontend CORS fix applied. If issues persist, backend CORS configuration needs updating.');
    }
    return Promise.reject(error);
  }
);

// Helper function to make API calls with proper CORS handling
export const makeApiCall = async (method, endpoint, data = null, headers = {}) => {
  const config = {
    method,
    url: endpoint,
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...headers
    }
  };

  if (data) {
    config.data = data;
  }

  return apiClient(config);
};

// Convenience methods
export const apiGet = (endpoint, headers = {}) => makeApiCall('GET', endpoint, null, headers);
export const apiPost = (endpoint, data, headers = {}) => makeApiCall('POST', endpoint, data, headers);
export const apiPut = (endpoint, data, headers = {}) => makeApiCall('PUT', endpoint, data, headers);
export const apiDelete = (endpoint, headers = {}) => makeApiCall('DELETE', endpoint, null, headers);

export default apiClient;
