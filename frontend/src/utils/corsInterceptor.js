// CORS Interceptor - Global solution for all API calls
// This intercepts all axios calls and applies CORS proxy when needed

import axios from 'axios';

// Store original axios methods
const originalAxios = axios.create;

// CORS Proxy configuration
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.ozarx.in/api';

// Function to get API URL with CORS proxy
const getApiUrl = (url) => {
  const isVercel = window.location.hostname.includes('vercel.app');
  
  if (isVercel && url.includes('api.ozarx.in')) {
    return `${CORS_PROXY}${encodeURIComponent(url)}`;
  }
  
  return url;
};

// Override axios.create to intercept all API calls
axios.create = function(config) {
  const instance = originalAxios.call(this, config);
  
  // Intercept requests
  instance.interceptors.request.use(
    (config) => {
      if (config.baseURL) {
        config.baseURL = getApiUrl(config.baseURL);
      }
      if (config.url && config.url.includes('api.ozarx.in')) {
        config.url = getApiUrl(config.url);
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  return instance;
};

// Override axios methods to handle CORS
const originalGet = axios.get;
const originalPost = axios.post;
const originalPut = axios.put;
const originalDelete = axios.delete;

axios.get = function(url, config = {}) {
  const newUrl = getApiUrl(url);
  return originalGet.call(this, newUrl, config);
};

axios.post = function(url, data, config = {}) {
  const newUrl = getApiUrl(url);
  return originalPost.call(this, newUrl, data, config);
};

axios.put = function(url, data, config = {}) {
  const newUrl = getApiUrl(url);
  return originalPut.call(this, newUrl, data, config);
};

axios.delete = function(url, config = {}) {
  const newUrl = getApiUrl(url);
  return originalDelete.call(this, newUrl, config);
};

// Export the modified axios
export default axios;
