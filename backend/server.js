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
  
  // Fix Cross-Origin-Opener-Policy for Google OAuth and window.postMessage
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  
  res.removeHeader('X-Powered-By');
  next();
});

// ------------------- CORS Duplicate Prevention -------------------
app.use((req, res, next) => {
  // Prevent duplicate CORS headers by removing them if they exist
  res.removeHeader('Access-Control-Allow-Origin');
  res.removeHeader('Access-Control-Allow-Credentials');
  res.removeHeader('Access-Control-Allow-Methods');
  res.removeHeader('Access-Control-Allow-Headers');
  next();
});

// ------------------- CORS Configuration -------------------
// Get allowed origins from environment variable or use defaults
const corsOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : [
      'https://ozarx.in',
      'https://www.ozarx.in',
      'https://job-portal-platform-git-master-shamseers-projects-613ceea2.vercel.app',
      'http://ec2-15-134-104-170.ap-southeast-2.compute.amazonaws.com:3000',
      'http://ec2-15-134-104-170.ap-southeast-2.compute.amazonaws.com:5173'
    ];

// Remove duplicates from origins array
const allowedOrigins = [...new Set(corsOrigins)];

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
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
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

// ------------------- API Routes -------------------
// Import and use route files
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const companyRoutes = require('./routes/company');
const applicationRoutes = require('./routes/applications');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const leadRoutes = require('./routes/leadRoutes');
const crmRoutes = require('./routes/crm');
const reportRoutes = require('./routes/reports');
const documentRoutes = require('./routes/documents');
const onboardingRoutes = require('./routes/onboarding');
const emailRoutes = require('./routes/email');
const aiRoutes = require('./routes/ai');
const assistedHiringRoutes = require('./routes/assistedHiring');
const aggregatedJobsRoutes = require('./routes/aggregatedJobs');
const agentApplicationsRoutes = require('./routes/agentApplications');
const adminDocumentsRoutes = require('./routes/adminDocuments');
const simpleOnboardingRoutes = require('./routes/simpleOnboarding');
const cronRoutes = require('./routes/cron');
const candidateRoutes = require('./routes/candidates');
const skillRoutes = require('./routes/skills');

// Use routes - Mount them one by one with error handling
try {
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes loaded');
  
  app.use('/api/jobs', jobRoutes);
  console.log('✅ Jobs routes loaded');
  
  app.use('/api/companies', companyRoutes);
  console.log('✅ Company routes loaded');
  
  app.use('/api/applications', applicationRoutes);
  console.log('✅ Application routes loaded');
  
  app.use('/api/users', userRoutes);
  console.log('✅ User routes loaded');
  
  app.use('/api/admin', adminRoutes);
  console.log('✅ Admin routes loaded');
  
  app.use('/api/leads', leadRoutes);
  console.log('✅ Lead routes loaded');
  
  app.use('/api/crm', crmRoutes);
  console.log('✅ CRM routes loaded');
  
  app.use('/api/reports', reportRoutes);
  console.log('✅ Report routes loaded');
  
  app.use('/api/documents', documentRoutes);
  console.log('✅ Document routes loaded');
  
  app.use('/api/onboarding', onboardingRoutes);
  console.log('✅ Onboarding routes loaded');
  
  app.use('/api/email', emailRoutes);
  console.log('✅ Email routes loaded');
  
  app.use('/api/ai', aiRoutes);
  console.log('✅ AI routes loaded');
  
  app.use('/api/assisted-hiring', assistedHiringRoutes);
  console.log('✅ Assisted hiring routes loaded');
  
  app.use('/api/aggregated-jobs', aggregatedJobsRoutes);
  console.log('✅ Aggregated jobs routes loaded');
  
  app.use('/api/agent-applications', agentApplicationsRoutes);
  console.log('✅ Agent applications routes loaded');
  
  app.use('/api/admin-documents', adminDocumentsRoutes);
  console.log('✅ Admin documents routes loaded');
  
  app.use('/api/simple-onboarding', simpleOnboardingRoutes);
  console.log('✅ Simple onboarding routes loaded');
  
  app.use('/api/cron', cronRoutes);
  console.log('✅ Cron routes loaded');
  
  app.use('/api/candidates', candidateRoutes);
  console.log('✅ Candidate routes loaded');
  
  app.use('/api/skills', skillRoutes);
  console.log('✅ Skill routes loaded');
} catch (error) {
  console.error('❌ Error mounting routes:', error.message);
  throw error;
}

// ------------------- Error Handling -------------------
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// ------------------- MongoDB Connection -------------------
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 30000, // 30 seconds
  socketTimeoutMS: 45000, // 45 seconds
  bufferCommands: false, // Disable mongoose buffering
  maxPoolSize: 10, // Maintain up to 10 socket connections
  family: 4 // Use IPv4, skip trying IPv6
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
  console.log(`🔧 CORS Origins from env: ${process.env.CORS_ORIGINS || 'Using defaults'}`);
  console.log(`🔧 Duplicates removed: ${corsOrigins.length} -> ${allowedOrigins.length} origins`);
  console.log(`📋 Available endpoints:`);
  console.log(`   - POST /api/crm/leads/import (CRM leads import)`);
  console.log(`   - GET /api/crm/leads (Get leads)`);
  console.log(`   - POST /api/auth/login (Authentication)`);
  console.log(`   - GET /api/jobs (Jobs)`);
  console.log(`   - And many more...`);
});

module.exports = app;