// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://backend-ie0pgclfa-shamseers-projects-613ceea2.vercel.app/api';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  ME: `${API_BASE_URL}/auth/me`,
  
  // Job endpoints
  JOBS: `${API_BASE_URL}/jobs`,
  EMPLOYER_JOBS: `${API_BASE_URL}/jobs/employer`,
  
  // Application endpoints
  APPLICATIONS: `${API_BASE_URL}/applications`,
  APPLY: `${API_BASE_URL}/applications/apply`,
  EMPLOYER_APPLICATIONS: `${API_BASE_URL}/applications/employer`,
  MY_APPLICATIONS: `${API_BASE_URL}/applications/me`,
  
  // User endpoints
  UPDATE_USER: `${API_BASE_URL}/users/update`,
  UPLOAD_RESUME: `${API_BASE_URL}/users/resume`,
  
  // Admin endpoints
  ADMIN_USERS: `${API_BASE_URL}/admin/users`,
  ADMIN_APPLICATIONS: `${API_BASE_URL}/admin/applications`,
};

export default API_ENDPOINTS; 