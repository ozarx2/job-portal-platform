const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');

const express = require('express');
const cors = require('cors');

const app = express();

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const jobRoutes = require('./routes/jobs');
const authRoutes = require('./routes/auth');
const applicationRoutes = require('./routes/applications');
const agentApplicationsRoute = require('./routes/agentApplications');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const swaggerRoutes = require('./swagger');
const reportsRoute = require('./routes/reports');
const crmRoutes = require('./routes/crm');
const leadRoutes = require('./routes/leadRoutes');

// Allowed origins
const staticAllowedOrigins = [
  'http://localhost:5173',
  'https://ozarx.in',
  'https://www.ozarx.in',
  // Your actual Vercel frontend URLs
  'https://frontend-7qkk5avoc-shamseers-projects-613ceea2.vercel.app',
  // Your actual Vercel backend URLs
  'https://job-portal-platform-pkmykvr3u-shamseers-projects-613ceea2.vercel.app',
  'https://job-portal-platform-8cea0ab5v-shamseers-projects-613ceea2.vercel.app',
  'https://job-portal-platform-566hzkltl-shamseers-projects-613ceea2.vercel.app',
  'https://job-portal-platform-46a241auj-shamseers-projects-613ceea2.vercel.app',
  'https://job-portal-platform-m5wnyiuim-shamseers-projects-613ceea2.vercel.app',
  'https://job-portal-platform-l4cx3po9j-shamseers-projects-613ceea2.vercel.app',
  'https://job-portal-platform-ei2pb73ul-shamseers-projects-613ceea2.vercel.app',
  'https://job-portal-platform-q9m3s0yba-shamseers-projects-613ceea2.vercel.app',
  'https://job-portal-platform-r601p8mgq-shamseers-projects-613ceea2.vercel.app',
  'https://job-portal-platform-d335m23ao-shamseers-projects-613ceea2.vercel.app',
  'https://job-portal-platform-gu3bebxfh-shamseers-projects-613ceea2.vercel.app',
  'https://job-portal-platform-kldrsabc0-shamseers-projects-613ceea2.vercel.app',
  'https://job-portal-platform-84tgcxhhm-shamseers-projects-613ceea2.vercel.app',
  'https://job-portal-platform-syatc9ie4-shamseers-projects-613ceea2.vercel.app',
  'https://job-portal-platform-1zy6f1qhn-shamseers-projects-613ceea2.vercel.app',
  'https://job-portal-platform-a4llox6uy-shamseers-projects-613ceea2.vercel.app',
  'https://job-portal-platform-g59teqqmt-shamseers-projects-613ceea2.vercel.app',
  'https://job-portal-platform-8umh0bi3e-shamseers-projects-613ceea2.vercel.app',
  'https://job-portal-platform-p6zs6vlfb-shamseers-projects-613ceea2.vercel.app',
  'https://job-portal-platform-1t0gpaens-shamseers-projects-613ceea2.vercel.app',
];

const envAllowedOrigins = (process.env.FRONTEND_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const allowedOrigins = [...new Set([...staticAllowedOrigins, ...envAllowedOrigins])];

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // For development, allow localhost with any port
    if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    // Allow all Vercel deployments (this handles the wildcard matching)
    if (origin.endsWith('.vercel.app') || origin.endsWith('.vercel.com')) {
      return callback(null, true);
    }
    
     // Allow your specific project deployments (pattern matching)
     if (origin.includes('job-portal-platform') && origin.includes('shamseers-projects-613ceea2.vercel.app')) {
       return callback(null, true);
     }
     
     // Allow your frontend project deployments
     if (origin.includes('frontend') && origin.includes('shamseers-projects-613ceea2.vercel.app')) {
       return callback(null, true);
     }
    
    // Log blocked origins for debugging
    console.log('CORS blocked origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true, // Changed to true if you need cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'X-File-Name'
  ],
  maxAge: 86400 // 24 hours
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Mount routes
app.all('/api/ping', (req, res) => {
  res.json({ 
    ok: true, 
    method: req.method, 
    path: req.path,
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/agent-applications', agentApplicationsRoute);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api-docs', swaggerRoutes);
app.use('/api/reports', reportsRoute);
app.use('/api/crm', crmRoutes);
app.use('/api/leads', leadRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({
    message: 'API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Database connection singleton for serverless
let isConnected = false;

// Vercel serverless handler
module.exports = async (req, res) => {
  try {
    // Only connect if not already connected (prevents multiple connections)
    if (!isConnected) {
      await connectDB();
      isConnected = true;
    }
  } catch (error) {
    console.error('DB connect error:', error.message);
    // Don't fail the request if DB connection fails
  }
  
  return app(req, res);
};

// Local development server
if (require.main === module) {
  const startServer = async () => {
    try {
      await connectDB();
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => {
        console.log(`✅ Server running on port ${PORT}`);
        console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🔗 Allowed origins: ${allowedOrigins.join(', ')}`);
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error.message);
      process.exit(1);
    }
  };
  
  startServer();
}
