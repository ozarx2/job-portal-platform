// Fixed CORS Configuration for Backend
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.FRONTEND_ORIGINS ? 
      process.env.FRONTEND_ORIGINS.split(',') : [
        'https://ozarx.in',
        'https://www.ozarx.in',
        'https://job-portal-platform-git-master-shamseers-projects-613ceea2.vercel.app',
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
        'http://localhost:5000' // Add this if your frontend is served from the same domain
      ];
    
    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies and authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Additional CORS headers for preflight requests
app.options('*', cors(corsOptions));
