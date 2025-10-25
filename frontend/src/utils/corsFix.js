// Direct CORS Fix - Override environment variables
// This is a more reliable approach than interceptors

// CORS Proxy for Vercel deployments
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
const ORIGINAL_API_URL = 'https://api.ozarx.in/api';

// Check if we're on Vercel
const isVercel = window.location.hostname.includes('vercel.app');

if (isVercel) {
  console.log('🔧 CORS Fix: Detected Vercel environment');
  console.log('🔄 Applying CORS proxy to all API calls');
  
  // Override the environment variable
  const proxiedUrl = `${CORS_PROXY}${encodeURIComponent(ORIGINAL_API_URL)}`;
  
  // Store the original URL for reference
  window.ORIGINAL_API_URL = ORIGINAL_API_URL;
  window.CORS_PROXY_URL = proxiedUrl;
  
  // Override import.meta.env.VITE_API_BASE_URL
  if (typeof import !== 'undefined' && import.meta && import.meta.env) {
    import.meta.env.VITE_API_BASE_URL = proxiedUrl;
  }
  
  console.log('✅ CORS proxy applied:', proxiedUrl);
} else {
  console.log('🏠 Local development - using direct API');
}
