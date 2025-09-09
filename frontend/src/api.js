// src/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://backend-4q3sj2orb-shamseers-projects-613ceea2.vercel.app', // Updated backend URL
});

export const registerUser = (userData) => API.post('/auth/register', userData);
