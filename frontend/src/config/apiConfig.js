// API Configuration with CORS Fix
// This overrides the environment variable approach

import axios from 'axios';

// CORS Proxy for Vercel deployments
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
const ORIGINAL_API_URL = 'https://api.ozarx.in/api';

// Check if we're on Vercel
const isVercel = window.location.hostname.includes('vercel.app');

// Get the correct API URL
export const getApiUrl = () => {
  if (isVercel) {
    const proxiedUrl = `${CORS_PROXY}${encodeURIComponent(ORIGINAL_API_URL)}`;
    console.log('🔧 CORS Fix: Using proxy for Vercel');
    console.log('🔄 Proxy URL:', proxiedUrl);
    return proxiedUrl;
  }
  
  console.log('🏠 Local development: Using direct API');
  return ORIGINAL_API_URL;
};

// Export the API URL
export const API_BASE_URL = getApiUrl();

// Override the environment variable
// Note: import.meta.env is read-only in production, so we'll use a different approach

// Override axios defaults to use the CORS proxy
if (isVercel) {
  console.log('🔧 Applying CORS proxy to axios defaults');
  
  // Set default base URL for all axios instances
  axios.defaults.baseURL = API_BASE_URL;
  
  // Add request interceptor to handle CORS proxy
  axios.interceptors.request.use(
    (config) => {
      if (config.url && config.url.includes('api.ozarx.in')) {
        const proxiedUrl = `${CORS_PROXY}${encodeURIComponent(config.url)}`;
        console.log('🔄 Request proxied:', config.url, '->', proxiedUrl);
        config.url = proxiedUrl;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  // Override axios methods directly to ensure ALL calls are proxied
  const originalGet = axios.get;
  const originalPost = axios.post;
  const originalPut = axios.put;
  const originalDelete = axios.delete;
  
  axios.get = function(url, config = {}) {
    if (url && url.includes('api.ozarx.in')) {
      const proxiedUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;
      console.log('🔄 GET proxied:', url, '->', proxiedUrl);
      return originalGet.call(this, proxiedUrl, config);
    }
    return originalGet.call(this, url, config);
  };
  
  axios.post = function(url, data, config = {}) {
    if (url && url.includes('api.ozarx.in')) {
      const proxiedUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;
      console.log('🔄 POST proxied:', url, '->', proxiedUrl);
      return originalPost.call(this, proxiedUrl, data, config);
    }
    return originalPost.call(this, url, data, config);
  };
  
  axios.put = function(url, data, config = {}) {
    if (url && url.includes('api.ozarx.in')) {
      const proxiedUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;
      console.log('🔄 PUT proxied:', url, '->', proxiedUrl);
      return originalPut.call(this, proxiedUrl, data, config);
    }
    return originalPut.call(this, url, data, config);
  };
  
  axios.delete = function(url, config = {}) {
    if (url && url.includes('api.ozarx.in')) {
      const proxiedUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;
      console.log('🔄 DELETE proxied:', url, '->', proxiedUrl);
      return originalDelete.call(this, proxiedUrl, config);
    }
    return originalDelete.call(this, url, config);
  };
}

console.log('✅ API Configuration loaded:', API_BASE_URL);
