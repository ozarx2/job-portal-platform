const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ------------------- CORS Configuration -------------------
const allowedOrigins = [
  'https://ozarx.in',
  'https://www.ozarx.in',
  'https://job-portal-platform-git-master-shamseers-projects-613ceea2.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Basic middleware
app.use(express.json());

// Simple routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Server with CORS running!', 
    status: 'OK', 
    timestamp: new Date()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime()
  });
});

// Test API endpoints for frontend
app.get('/api/jobs', (req, res) => {
  res.json({ 
    message: 'Jobs endpoint working',
    data: [],
    count: 0
  });
});

app.get('/api/companies', (req, res) => {
  res.json({ 
    message: 'Companies endpoint working',
    data: [],
    count: 0
  });
});

app.get('/api/crm/leads', (req, res) => {
  res.json({ 
    message: 'Leads endpoint working',
    data: [],
    count: 0
  });
});

app.get('/api/applications', (req, res) => {
  res.json({ 
    message: 'Applications endpoint working',
    data: [],
    count: 0
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server with CORS running on port ${PORT}`);
  console.log(`🌐 CORS enabled for: ${allowedOrigins.join(', ')}`);
});


