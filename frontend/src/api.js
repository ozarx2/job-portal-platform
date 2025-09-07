// src/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://job-portal-platform-m7ahktt1o-shamseers-projects-613ceea2.vercel.app', // Change to your backend URL
});

export const registerUser = (userData) => API.post('/auth/register', userData);
