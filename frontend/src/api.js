// src/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://api.ozarx.in/api', // Using your domain with proper SSL
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth endpoints
export const registerUser = (userData) => API.post('/auth/register', userData);
export const loginUser = (credentials) => API.post('/auth/login', credentials);
export const getCurrentUser = () => API.get('/auth/me');

// Job endpoints
export const getJobs = () => API.get('/jobs');
export const getJobById = (id) => API.get(`/jobs/${id}`);
export const createJob = (jobData) => API.post('/jobs', jobData);
export const updateJob = (id, jobData) => API.put(`/jobs/${id}`, jobData);
export const deleteJob = (id) => API.delete(`/jobs/${id}`);

// Application endpoints
export const applyForJob = (applicationData) => API.post('/applications/apply', applicationData);
export const getMyApplications = () => API.get('/applications/me');
export const getApplicationsForJob = (jobId) => API.get(`/applications/job/${jobId}`);

// User endpoints
export const updateUserProfile = (userData) => API.put('/users/update', userData);
export const uploadResume = (formData) => API.post('/users/resume', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Admin endpoints
export const getAllUsers = () => API.get('/admin/users');
export const getAllApplications = () => API.get('/admin/applications');
