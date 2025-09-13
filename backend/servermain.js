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
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const swaggerRoutes = require('./swagger');
const agentApplicationsRoute = require('./routes/agentApplications'); // Added the missing 'i'
const reportsRoute = require('./routes/reports');
const crmRoutes = require('./routes/crm');
const leadRoutes = require('./routes/leadRoutes');

// Temporary fix - NOT recommended for production
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false // Must be false when origin is '*'
}));


// Middleware
//app.use(cors({
 // origin: 'http://localhost:5173',//
 // methods: ['GET', 'POST', 'PUT', 'DELETE'],
  //credentials: true
//}));//
//app.use(express.json()); //

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/applications', agentApplicationsRoute);
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
