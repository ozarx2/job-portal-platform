const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
connectDB();

const express = require('express');
const cors = require('cors');

const app = express();

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
const cors = require('cors');
app.use(cors({
  origin: [
    'http://localhost:5173',     // Development
    'https://ozarx.in',          // Production
    'https://www.ozarx.in'       // If you use www subdomain
   
  ],
  credentials: true
}));

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
