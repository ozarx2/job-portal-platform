const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// ------------------- Security Headers -------------------
app.use((req, res, next) => {
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.removeHeader('X-Powered-By');
  next();
});

// ------------------- Allowed Origins -------------------
const allowedOrigins = [
  'https://ozarx.in',
  'https://www.ozarx.in',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

// ------------------- CORS + Preflight -------------------
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (!origin || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET,POST,PUT,DELETE,PATCH,OPTIONS,HEAD'
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type,Authorization,X-Requested-With,Accept,Origin'
    );

    if (req.method === 'OPTIONS') return res.sendStatus(204); // preflight
    return next();
  } else {
    console.log('❌ CORS blocked origin:', origin);
    return res.status(403).send('Not allowed by CORS');
  }
});

// ------------------- Body Parser -------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ------------------- Example Routes -------------------
app.get('/', (req, res) => {
  res.json({ message: 'Job Portal API is running!', status: 'OK', timestamp: new Date() });
});

// ------------------- MongoDB -------------------
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ------------------- Start Server -------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
