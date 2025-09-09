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
const agentApplicationsRoute = require('./routes/agentApplications'); // spelling fixed
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const swaggerRoutes = require('./swagger');
const reportsRoute = require('./routes/reports');
const crmRoutes = require('./routes/crm');
const leadRoutes = require('./routes/leadRoutes');



// If using Express with cors middleware
const staticAllowedOrigins = [
  'http://localhost:5173',
  'https://ozarx.in',
  'https://www.ozarx.in',
  // Add your Vercel frontend preview/production domains explicitly if known
  'https://job-portal-platform-one.vercel.app',
  'https://job-portal-platform-two.vercel.app',
  'https://job-portal-platform-three.vercel.app',
  'https://job-portal-platform-four.vercel.app',
  'https://job-portal-platform-five.vercel.app',
  'https://job-portal-platform-six.vercel.app',
  'https://job-portal-platform-seven.vercel.app',

];
const envAllowedOrigins = (process.env.FRONTEND_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
const allowedOrigins = [...new Set([...staticAllowedOrigins, ...envAllowedOrigins])];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // For development, allow localhost with any port
    if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    // Log blocked origins for debugging
    console.log('CORS blocked origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // 24 hours
};

// Global CORS headers (belt-and-suspenders). Ensures headers on 404/500 too.
app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;
  
  // Check if origin is allowed
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    res.header('Access-Control-Allow-Origin', requestOrigin);
    res.header('Vary', 'Origin');
  } else if (process.env.NODE_ENV === 'development' && requestOrigin && requestOrigin.includes('localhost')) {
    res.header('Access-Control-Allow-Origin', requestOrigin);
    res.header('Vary', 'Origin');
  }
  
  // Set CORS headers
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Max-Age', '86400');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  
  next();
});

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Mount routes
app.all('/api/ping', (req, res) => {
  res.json({ ok: true, method: req.method, path: req.path });
});
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/agent-applications', agentApplicationsRoute); // ✅ separated
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api-docs', swaggerRoutes);
app.use('/api/reports', reportsRoute);
app.use('/api/crm', crmRoutes);
app.use('/api/leads', leadRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('API is running');
});

// Vercel serverless: export handler
module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (e) {
    console.error('DB connect error:', e.message);
  }
  return app(req, res);
};

// Local dev: start server only when executed directly
if (require.main === module) {
  connectDB().catch(() => {});
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
}
