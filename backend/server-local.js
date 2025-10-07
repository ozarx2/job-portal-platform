const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ------------------- Development Headers -------------------
app.use((req, res, next) => {
  // More permissive headers for local development
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Relaxed X-Frame-Options for local development
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Disable HSTS for local development
  // res.removeHeader('Strict-Transport-Security');
  res.removeHeader('X-Powered-By');
  
  // Add CORS headers manually for development
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  
  next();
});

// ------------------- CORS Configuration for Local Development -------------------
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  // Add your production origins if needed
  'https://ozarx.in',
  'https://www.ozarx.in'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      console.log('💡 Add this origin to allowedOrigins array in server-local.js');
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

// ------------------- Development Routes -------------------
app.get('/', (req, res) => {
  res.json({ 
    message: 'Job Portal API - Local Development Mode', 
    status: 'OK', 
    timestamp: new Date(),
    version: '1.0.0-local',
    environment: 'development',
    cors: {
      allowedOrigins: allowedOrigins,
      message: 'CORS configured for local development'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date(),
    environment: 'development'
  });
});

// Development info endpoint
app.get('/dev-info', (req, res) => {
  res.json({
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,
    mongodb: process.env.MONGO_URI ? 'Connected' : 'Not configured',
    cors: {
      allowedOrigins: allowedOrigins
    },
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
} catch (error) {
  console.error('❌ Error mounting routes:', error.message);
  throw error;
}

// ------------------- Error Handling -------------------
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message,
    environment: 'development'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    environment: 'development'
  });
});

// ------------------- MongoDB Connection -------------------
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('✅ MongoDB connected successfully');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

// ------------------- Start Server -------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Local Development Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for local development origins:`);
  allowedOrigins.forEach(origin => {
    console.log(`   - ${origin}`);
  });
  console.log(`📋 Available endpoints:`);
  console.log(`   - GET  / (API info)`);
  console.log(`   - GET  /health (Health check)`);
  console.log(`   - GET  /dev-info (Development info)`);
  console.log(`   - POST /api/auth/login (Authentication)`);
  console.log(`   - GET  /api/jobs (Jobs)`);
  console.log(`   - And many more...`);
  console.log(`\n💡 Frontend should connect to: http://localhost:${PORT}/api`);
});

module.exports = app;
