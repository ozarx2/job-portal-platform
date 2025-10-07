// Quick CORS fix for production
// Add this to your backend/server.js CORS configuration

const cors = require('cors');

// Production CORS configuration
const corsOptions = {
  origin: [
    'https://job-portal-platform-git-master-shamseers-projects-613ceea2.vercel.app',
    'https://ozarx.in',
    'https://www.ozarx.in',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

// Use this in your server.js
app.use(cors(corsOptions));







