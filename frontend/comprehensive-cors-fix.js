// Comprehensive CORS Configuration for Backend
const cors = require('cors');

// Enhanced CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    // Define allowed origins
    const allowedOrigins = process.env.FRONTEND_ORIGINS ? 
      process.env.FRONTEND_ORIGINS.split(',').map(origin => origin.trim()) : [
        'https://ozarx.in',
        'https://www.ozarx.in',
        'https://job-portal-platform-git-master-shamseers-projects-613ceea2.vercel.app',
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
        'http://localhost:5000',
        // Add your Vercel deployment URLs here
        'https://job-portal-platform.vercel.app',
        'https://ozarx-frontend.vercel.app'
      ];
    
    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      console.log('CORS: Allowing origin:', origin);
      callback(null, true);
    } else {
      console.log('CORS: Blocked origin:', origin);
      console.log('CORS: Allowed origins:', allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies and authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma',
    'X-API-Key',
    'X-Auth-Token'
  ],
  exposedHeaders: [
    'Authorization',
    'X-Total-Count',
    'X-Page-Count'
  ],
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  maxAge: 86400 // Cache preflight response for 24 hours
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
});

// Additional middleware to handle CORS errors gracefully
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    res.status(403).json({
      error: 'CORS Error',
      message: 'Origin not allowed',
      origin: req.headers.origin,
      allowedOrigins: process.env.FRONTEND_ORIGINS ? 
        process.env.FRONTEND_ORIGINS.split(',') : [
          'https://ozarx.in',
          'https://www.ozarx.in',
          'http://localhost:5173'
        ]
    });
  } else {
    next(err);
  }
});
