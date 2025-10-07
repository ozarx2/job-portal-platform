const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ------------------- Security Headers -------------------
app.use((req, res, next) => {
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.removeHeader('X-Powered-By');
  next();
});

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

// ------------------- Body Parser -------------------
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ------------------- Basic Routes -------------------
app.get('/', (req, res) => {
  res.json({ 
    message: 'Job Portal API is running!', 
    status: 'OK', 
    timestamp: new Date(),
    version: '1.0.0'
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

// ------------------- Test API Routes -------------------
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

// ------------------- Error Handling -------------------
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// ------------------- MongoDB Connection -------------------
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB connected successfully');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

// ------------------- Start Server -------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for: ${allowedOrigins.join(', ')}`);
});

