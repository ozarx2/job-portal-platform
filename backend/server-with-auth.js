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
app.use(express.urlencoded({ extended: true }));

// ------------------- Import Models -------------------
const User = require('./models/User');
const Lead = require('./models/Lead');
const Job = require('./models/Job');
const Application = require('./models/Application');
const CallLog = require('./models/CallLog');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verifyToken = require('./middleware/verifyToken');
const verifyAdmin = require('./middleware/verifyAdmin');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// ------------------- Basic Routes -------------------
app.get('/', (req, res) => {
  res.json({ 
    message: 'Server with Auth running!', 
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

// ------------------- Authentication Routes -------------------
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log('Login attempt for:', email);
    
    if (!email || !password) {
      return res.status(400).json({ msg: 'Email and password are required' });
    }

    const foundUser = await User.findOne({ email });
    if (!foundUser) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    if (!foundUser.password || typeof foundUser.password !== 'string') {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: foundUser._id, role: foundUser.role }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ 
      token, 
      user: {
        id: foundUser._id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Internal Server Error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    console.log('Register attempt for:', email);
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role: role || 'candidate' });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ 
      token, 
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ msg: err.message });
  }
});

// ------------------- Google OAuth Routes -------------------
app.get('/api/auth/google', (req, res) => {
  res.json({ 
    message: 'Google OAuth endpoint',
    clientId: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set',
    note: 'Configure Google OAuth in Google Cloud Console'
  });
});

app.post('/api/auth/google', async (req, res) => {
  const { token } = req.body;
  try {
    // This is a placeholder - implement Google token verification
    res.json({ 
      message: 'Google OAuth login',
      token: 'placeholder_token',
      user: { name: 'Google User', email: 'user@gmail.com', role: 'candidate' }
    });
  } catch (err) {
    console.error('Google OAuth error:', err);
    res.status(500).json({ msg: 'Google OAuth failed' });
  }
});

// ------------------- Other API Routes -------------------
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

// ------------------- CRM/Leads Routes -------------------
app.get('/api/crm/leads', verifyToken, async (req, res) => {
  try {
    const user = req.user;
    const { page = 1, limit = 20, status, agentId } = req.query;

    const filter = { isDeleted: { $ne: true } };

    // Agents see only their leads
    if (user.role === 'agent') {
      filter.agent = user.id;
    } else if (agentId) {
      filter.agent = agentId; // Admin filter
    }

    if (status) filter.status = status;

    const leads = await Lead.find(filter)
      .populate('agent', 'name email phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await Lead.countDocuments(filter);

    res.json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: leads,
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
  } catch (err) {
    console.error('Error fetching leads:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
  }
});

app.post('/api/crm/leads', async (req, res) => {
  try {
    const lead = await Lead.create(req.body);
    res.status(201).json({ success: true, data: lead });
  } catch (err) {
    console.error('Lead creation error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

app.put('/api/crm/leads/:id', verifyToken, async (req, res) => {
  try {
    const user = req.user;
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    // Agent can only update their leads
    if (user.role === 'agent' && lead.agent.toString() !== user.id) {
      return res.status(403).json({ success: false, message: 'Not your lead' });
    }

    const updates = req.body;
    Object.assign(lead, updates);
    await lead.save();

    res.json({ success: true, data: lead });
  } catch (err) {
    console.error('Lead update error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

app.delete('/api/crm/leads/:id', verifyToken, async (req, res) => {
  try {
    const user = req.user;
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    // Agent can only delete their leads
    if (user.role === 'agent' && lead.agent.toString() !== user.id) {
      return res.status(403).json({ success: false, message: 'Not your lead' });
    }

    lead.isDeleted = true;
    await lead.save();

    res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (err) {
    console.error('Lead deletion error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/crm/leads/count', verifyToken, async (req, res) => {
  try {
    const user = req.user;
    const matchFilter = { isDeleted: { $ne: true } };

    // Agents see only their leads count
    if (user.role === 'agent') {
      matchFilter.agent = user.id;
    }

    const counts = await Lead.aggregate([
      { $match: matchFilter },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    res.json({ success: true, data: counts });
  } catch (err) {
    console.error('Lead count error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get leads with agents only
app.get('/api/crm/leads/with-agents', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const filter = { isDeleted: false, agent: { $ne: null } };
    if (status) filter.status = status;

    const leads = await Lead.find(filter)
      .populate('agent', 'name email role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Lead.countDocuments(filter);

    res.json({ 
      success: true, 
      total, 
      data: leads,
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
  } catch (err) {
    console.error('Leads with agents fetch error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message,
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
  }
});

app.get('/api/applications', (req, res) => {
  res.json({ 
    message: 'Applications endpoint working',
    data: [],
    count: 0,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// ------------------- Admin Dashboard Routes -------------------
app.get('/api/admin/users', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({}, 'name email role createdAt');
    res.json({
      success: true,
      data: users,
      count: users.length,
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
  } catch (err) {
    console.error('Admin users error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/admin/jobs', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const jobs = await Job.find().populate('postedBy', 'email name');
    res.json({
      success: true,
      data: jobs,
      count: jobs.length,
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
  } catch (err) {
    console.error('Admin jobs error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/admin/applications', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('candidate', 'name email')
      .populate('job', 'title')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: applications,
      count: applications.length,
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
  } catch (err) {
    console.error('Admin applications error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/admin/summary', verifyToken, async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin only' });
    }

    // Get total counts
    const totalUsers = await User.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();
    const totalLeads = await Lead.countDocuments({ isDeleted: { $ne: true } });

    // Get users by role
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Get leads by status
    const leadsByStatus = await Lead.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get leads by agent
    const leadsByAgent = await Lead.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: '$agent', count: { $sum: 1 } } }
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const recentJobs = await Job.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const recentApplications = await Application.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const recentLeads = await Lead.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo },
      isDeleted: { $ne: true }
    });

    res.json({
      success: true,
      data: {
        totals: {
          users: totalUsers,
          jobs: totalJobs,
          applications: totalApplications,
          leads: totalLeads
        },
        usersByRole,
        leadsByStatus,
        leadsByAgent,
        recent: {
          users: recentUsers,
          jobs: recentJobs,
          applications: recentApplications,
          leads: recentLeads
        }
      },
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
  } catch (err) {
    console.error('Admin summary error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/admin/dashboard', verifyToken, async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin only' });
    }

    // Get comprehensive dashboard data
    const [
      totalUsers,
      totalJobs,
      totalApplications,
      totalLeads,
      usersByRole,
      leadsByStatus,
      recentUsers,
      recentJobs,
      recentApplications,
      recentLeads
    ] = await Promise.all([
      User.countDocuments(),
      Job.countDocuments(),
      Application.countDocuments(),
      Lead.countDocuments({ isDeleted: { $ne: true } }),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      Lead.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
      Job.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
      Application.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
      Lead.countDocuments({ 
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        isDeleted: { $ne: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalJobs,
          totalApplications,
          totalLeads
        },
        breakdown: {
          usersByRole,
          leadsByStatus
        },
        recentActivity: {
          users: recentUsers,
          jobs: recentJobs,
          applications: recentApplications,
          leads: recentLeads
        },
        timestamp: new Date()
      },
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
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
  console.log(`🚀 Server with Auth running on port ${PORT}`);
  console.log(`🌐 CORS enabled for: ${allowedOrigins.join(', ')}`);
  console.log(`🔐 Auth endpoints: /api/auth/login, /api/auth/register, /api/auth/google`);
});
