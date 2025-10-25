# 🚨 CORS Error Fix Guide

## Problem
Your frontend deployed on Vercel (`https://job-portal-platform-git-master-shamseers-projects-613ceea2.vercel.app`) cannot access the backend API (`https://api.ozarx.in/api`) due to CORS policy restrictions.

## Error Message
```
Access to XMLHttpRequest at 'https://api.ozarx.in/api/crm/leads' from origin 'https://job-portal-platform-git-master-shamseers-projects-613ceea2.vercel.app' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## 🔧 Solutions

### Solution 1: Update Backend CORS Configuration (RECOMMENDED)

**Step 1: Access your backend server**
```bash
# SSH into your GCP VM or server where the backend is running
ssh your-username@your-server-ip
```

**Step 2: Update the CORS_ORIGINS environment variable**
```bash
# Edit the environment file
nano .env

# Add your Vercel domain to CORS_ORIGINS
CORS_ORIGINS=https://ozarx.in,https://www.ozarx.in,https://job-portal-platform-git-master-shamseers-projects-613ceea2.vercel.app
```

**Step 3: Restart the backend server**
```bash
# If using PM2
pm2 restart ozarx-backend

# If using systemd
sudo systemctl restart ozarx-backend

# If running directly
pkill -f node
npm start
```

### Solution 2: Quick Backend Fix (Temporary)

If you have access to the backend code, update the server.js file:

```javascript
// In backend/server.js, update the CORS origins
const corsOrigins = corsOriginsEnv 
  ? corsOriginsEnv.split(',').map(origin => origin.trim()).filter(origin => origin.length > 0)
  : [
      'https://ozarx.in',
      'https://www.ozarx.in',
      'https://job-portal-platform-git-master-shamseers-projects-613ceea2.vercel.app', // ✅ Add this
      'http://localhost:3000',
      'http://localhost:5173'
    ];
```

### Solution 3: Frontend Proxy (Temporary Workaround)

If you cannot access the backend immediately, you can use a CORS proxy:

```javascript
// Update your API base URL temporarily
const API_BASE_URL = 'https://cors-anywhere.herokuapp.com/https://api.ozarx.in/api';
```

## 🔍 Verification

After implementing the fix:

1. **Check backend logs** for CORS configuration:
   ```
   🌐 CORS enabled for: https://ozarx.in, https://www.ozarx.in, https://job-portal-platform-git-master-shamseers-projects-613ceea2.vercel.app
   ```

2. **Test API endpoints** from browser console:
   ```javascript
   fetch('https://api.ozarx.in/api/crm/leads', {
     method: 'GET',
     headers: {
       'Authorization': 'Bearer your-token'
     }
   })
   .then(response => response.json())
   .then(data => console.log('✅ CORS Fixed!', data))
   .catch(error => console.error('❌ Still CORS Error:', error));
   ```

## 📋 Required Backend Changes

The backend server needs to include these headers in responses:

```
Access-Control-Allow-Origin: https://job-portal-platform-git-master-shamseers-projects-613ceea2.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
Access-Control-Allow-Credentials: true
```

## 🚀 Deployment Steps

1. **Update backend CORS configuration**
2. **Restart backend server**
3. **Test the frontend application**
4. **Verify all API endpoints work**

## 📞 Contact

If you need help implementing this fix, contact the backend administrator with this information:
- **Frontend URL**: `https://job-portal-platform-git-master-shamseers-projects-613ceea2.vercel.app`
- **Required Action**: Add this URL to the `CORS_ORIGINS` environment variable
- **Backend Server**: `https://api.ozarx.in/api`
