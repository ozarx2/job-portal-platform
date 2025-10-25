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
if (typeof import !== 'undefined' && import.meta && import.meta.env) {
  import.meta.env.VITE_API_BASE_URL = API_BASE_URL;
}

// Override axios defaults to use the CORS proxy
if (isVercel) {
  // Set default base URL for all axios instances
  axios.defaults.baseURL = API_BASE_URL;
  
  // Override axios methods to ensure CORS proxy is used
  const originalGet = axios.get;
  const originalPost = axios.post;
  const originalPut = axios.put;
  const originalDelete = axios.delete;
  
  axios.get = function(url, config = {}) {
    if (url.includes('api.ozarx.in')) {
      const proxiedUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;
      console.log('🔄 GET request proxied:', proxiedUrl);
      return originalGet.call(this, proxiedUrl, config);
    }
    return originalGet.call(this, url, config);
  };
  
  axios.post = function(url, data, config = {}) {
    if (url.includes('api.ozarx.in')) {
      const proxiedUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;
      console.log('🔄 POST request proxied:', proxiedUrl);
      return originalPost.call(this, proxiedUrl, data, config);
    }
    return originalPost.call(this, url, data, config);
  };
  
  axios.put = function(url, data, config = {}) {
    if (url.includes('api.ozarx.in')) {
      const proxiedUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;
      console.log('🔄 PUT request proxied:', proxiedUrl);
      return originalPut.call(this, proxiedUrl, data, config);
    }
    return originalPut.call(this, url, data, config);
  };
  
  axios.delete = function(url, config = {}) {
    if (url.includes('api.ozarx.in')) {
      const proxiedUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;
      console.log('🔄 DELETE request proxied:', proxiedUrl);
      return originalDelete.call(this, proxiedUrl, config);
    }
    return originalDelete.call(this, url, config);
  };
}

console.log('✅ API Configuration loaded:', API_BASE_URL);
