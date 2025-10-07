const express = require('express');
const mongoose = require('mongoose');
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
    message: 'Server with MongoDB running!', 
    status: 'OK', 
    timestamp: new Date(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// MongoDB connection test endpoint
app.get('/api/mongodb-status', (req, res) => {
  const status = {
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name,
    connected: mongoose.connection.readyState === 1
  };
  
  res.json({
    message: 'MongoDB connection status',
    status: status
  });
});

// Test API endpoints for frontend
app.get('/api/jobs', (req, res) => {
  res.json({ 
    message: 'Jobs endpoint working',
    data: [],
    count: 0,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/api/companies', (req, res) => {
  res.json({ 
    message: 'Companies endpoint working',
    data: [],
    count: 0,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/api/crm/leads', (req, res) => {
  res.json({ 
    message: 'Leads endpoint working',
    data: [],
    count: 0,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/api/applications', (req, res) => {
  res.json({ 
    message: 'Applications endpoint working',
    data: [],
    count: 0,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// ------------------- MongoDB Connection -------------------
console.log('🔗 Attempting to connect to MongoDB...');
console.log('📊 MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Not set');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB connected successfully');
  console.log('📊 Database:', mongoose.connection.name);
  console.log('🌐 Host:', mongoose.connection.host);
}).catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
});

// MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('🟢 MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.error('🔴 MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🟡 MongoDB disconnected');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server with MongoDB running on port ${PORT}`);
  console.log(`🌐 CORS enabled for: ${allowedOrigins.join(', ')}`);
});


