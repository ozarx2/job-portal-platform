# Local Development Setup

This guide will help you set up the Job Portal backend for local development.

## 🚀 Quick Start

### 1. Setup Environment
```bash
# Windows
npm run setup:local

# Unix/Linux/Mac
npm run setup:local:unix
```

### 2. Start Local Development Server
```bash
# Option 1: Basic local server
npm run start:local

# Option 2: Development mode with environment variable
npm run start:dev

# Option 3: With auto-reload (requires nodemon)
npm run dev
```

## 🔧 Configuration

### Environment Variables
The local development uses `env.local` file which contains:
- **Server Configuration**: Port 5000, Development mode
- **Database**: MongoDB Atlas connection
- **CORS**: Configured for localhost origins
- **Email**: Gmail SMTP configuration

### CORS Origins (Local Development)
The local server allows these origins:
- `http://localhost:3000` (React default)
- `http://localhost:5173` (Vite default)
- `http://localhost:8080` (Alternative)
- `http://127.0.0.1:*` (IP-based localhost)

## 🌐 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Key Endpoints
- **Health Check**: `GET http://localhost:5000/health`
- **Development Info**: `GET http://localhost:5000/dev-info`
- **Jobs**: `GET http://localhost:5000/api/jobs`
- **Authentication**: `POST http://localhost:5000/api/auth/login`

## 🛠️ Frontend Configuration

Update your frontend's API configuration:

```javascript
// In your frontend code (React/Vue/etc.)
const API_BASE_URL = 'http://localhost:5000/api';

// Example fetch
fetch(`${API_BASE_URL}/jobs`)
  .then(response => response.json())
  .then(data => console.log(data));
```

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check if your frontend origin is in the allowed origins list
   - Look at the console for "CORS blocked origin" messages

2. **Connection Timeout**
   - Ensure backend is running on port 5000
   - Check firewall settings
   - Verify frontend is pointing to `http://localhost:5000`

3. **Database Connection**
   - MongoDB Atlas connection is configured
   - Check internet connectivity
   - Verify database credentials

### Debug Commands

```bash
# Test backend connectivity
curl http://localhost:5000/health

# Test jobs endpoint
curl http://localhost:5000/api/jobs

# Check development info
curl http://localhost:5000/dev-info
```

## 📝 Development Scripts

| Script | Description |
|--------|-------------|
| `npm run start:local` | Start local development server |
| `npm run start:dev` | Start with NODE_ENV=development |
| `npm run dev` | Start with auto-reload (nodemon) |
| `npm run setup:local` | Setup local environment (Windows) |
| `npm run setup:local:unix` | Setup local environment (Unix) |

## 🔄 Switching Between Modes

### Production Mode
```bash
npm start  # Uses server.js and production config
```

### Local Development Mode
```bash
npm run start:local  # Uses server-local.js and local config
```

## 📁 File Structure

```
backend/
├── server.js          # Production server
├── server-local.js    # Local development server
├── env.local          # Local environment template
├── .env               # Environment variables (created by setup)
├── package.json       # Updated with local scripts
└── README-LOCAL.md    # This file
```

## 🚨 Important Notes

1. **Environment File**: The `env.local` file contains sensitive information. Never commit it to version control.

2. **Database**: Local development uses the same MongoDB Atlas database as production. Be careful with test data.

3. **Email**: Email functionality uses real Gmail SMTP. Test emails will be sent to real addresses.

4. **CORS**: Local server has relaxed CORS settings for development convenience.

## 🆘 Getting Help

If you encounter issues:
1. Check the console output for error messages
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed (`npm install`)
4. Check if port 5000 is available and not blocked by firewall

Happy coding! 🎉
