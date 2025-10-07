const express = require('express');
require('dotenv').config();

const app = express();

// Basic middleware
app.use(express.json());

// Simple routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Ultra minimal server running!', 
    status: 'OK', 
    timestamp: new Date()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime()
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Ultra minimal server running on port ${PORT}`);
});


