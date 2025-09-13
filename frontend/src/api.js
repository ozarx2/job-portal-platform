// src/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Updated backend URL
});

export const registerUser = (userData) => API.post('/auth/register', userData);
