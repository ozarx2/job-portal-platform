// src/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Local backend server
});

export const registerUser = (userData) => API.post('/auth/register', userData);
export const loginUser = (userData) => API.post('/auth/login', userData);
export const googleAuth = (token, role) => API.post('/auth/google', { token, role });
export const getJobs = () => API.get('/jobs');
