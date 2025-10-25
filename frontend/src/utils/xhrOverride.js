// XMLHttpRequest Override for CORS
// This is the most aggressive approach to catch ALL HTTP requests

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
const isVercel = window.location.hostname.includes('vercel.app');

if (isVercel) {
  console.log('🔧 Applying XMLHttpRequest override for CORS');
  
  // Store original XMLHttpRequest
  const OriginalXHR = window.XMLHttpRequest;
  
  // Override XMLHttpRequest
  window.XMLHttpRequest = function() {
    const xhr = new OriginalXHR();
    const originalOpen = xhr.open;
    
    xhr.open = function(method, url, ...args) {
      if (url && url.includes('api.ozarx.in')) {
        const proxiedUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;
        console.log('🔄 XHR proxied:', url, '->', proxiedUrl);
        return originalOpen.call(this, method, proxiedUrl, ...args);
      }
      return originalOpen.call(this, method, url, ...args);
    };
    
    return xhr;
  };
  
  // Copy static properties
  Object.setPrototypeOf(window.XMLHttpRequest, OriginalXHR);
  Object.setPrototypeOf(window.XMLHttpRequest.prototype, OriginalXHR.prototype);
}
