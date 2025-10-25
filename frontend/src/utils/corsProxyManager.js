// CORS Proxy Manager - Handles multiple proxy services with fallback
// This ensures we have a working CORS proxy even if one service is down

const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/',
  'https://thingproxy.freeboard.io/fetch/'
];

let currentProxyIndex = 0;

export const getCorsProxy = () => {
  return CORS_PROXIES[currentProxyIndex];
};

export const getNextCorsProxy = () => {
  currentProxyIndex = (currentProxyIndex + 1) % CORS_PROXIES.length;
  console.log(`🔄 Switching to CORS proxy ${currentProxyIndex + 1}: ${CORS_PROXIES[currentProxyIndex]}`);
  return CORS_PROXIES[currentProxyIndex];
};

export const getProxiedUrl = (url) => {
  const proxy = getCorsProxy();
  return `${proxy}${encodeURIComponent(url)}`;
};

export const handleProxyError = (error) => {
  if (error.message.includes('CORS') || error.code === 'ERR_NETWORK' || error.code === 'ERR_TUNNEL_CONNECTION_FAILED') {
    console.log('🔄 CORS proxy failed, trying next one...');
    return getNextCorsProxy();
  }
  return getCorsProxy();
};

// Test proxy and switch if needed
export const testProxy = async (url) => {
  try {
    const proxiedUrl = getProxiedUrl(url);
    const response = await fetch(proxiedUrl, { method: 'HEAD' });
    if (!response.ok) {
      console.log('🔄 Proxy test failed, switching...');
      return getNextCorsProxy();
    }
    return getCorsProxy();
  } catch (error) {
    console.log('🔄 Proxy test error, switching...');
    return getNextCorsProxy();
  }
};
