// src/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://backend-ie0pgclfa-shamseers-projects-613ceea2.vercel.app', // Updated backend URL
});

export const registerUser = (userData) => API.post('/auth/register', userData);
