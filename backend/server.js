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
  'https://job-portal-platform-git-master-shamseers-projects-613ceea2.vercel.app'
];
const envAllowedOrigins = (process.env.FRONTEND_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
const allowedOrigins = [...new Set([...staticAllowedOrigins, ...envAllowedOrigins])];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow server-to-server or curl
    const isAllowed =
      allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin);
    if (isAllowed) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Mount routes
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
