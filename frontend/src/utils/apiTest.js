// API Connection Test Utility
import { getJobs, loginUser } from '../api.js';

export const testAPIConnection = async () => {
  try {
    console.log('Testing API connection to GCP VM...');
    
    // Test basic connectivity
    const response = await getJobs();
    console.log('✅ API Connection successful!');
    console.log('Response:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ API Connection failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused - check if your GCP VM is running and accessible');
    } else if (error.code === 'ENOTFOUND') {
      console.error('Host not found - check your IP address');
    } else if (error.response) {
      console.error('Server responded with error:', error.response.status, error.response.data);
    }
    
    return { success: false, error: error.message };
  }
};

// Test login functionality
export const testLogin = async (credentials) => {
  try {
    const response = await loginUser(credentials);
    console.log('✅ Login test successful!');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Login test failed:', error.message);
    return { success: false, error: error.message };
  }
};
