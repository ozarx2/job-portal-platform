# 🔧 CORS Fix for ozarx.in Domain

## **Issue**: CORS errors from `https://ozarx.in` to `https://api.ozarx.in`

## **Solution**: Update backend CORS configuration

### **Step 1: SSH to your GCP VM**
```bash
ssh user@YOUR_VM_IP
```

### **Step 2: Navigate to project directory**
```bash
cd /var/www/ozarx
```

### **Step 3: Stop current backend**
```bash
pm2 stop ozarx-api
```

### **Step 4: Update server.js CORS configuration**
Edit `backend/server.js` and update the CORS configuration:

```javascript
app.use(cors({
  origin: [
    'https://ozarx.in',
    'https://www.ozarx.in',
    'https://job-portal-platform-git-master-shamseers-projects-613ceea2.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
```

### **Step 5: Add health route (if not already added)**
```javascript
// API Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Job Portal API is running!', 
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});
```

### **Step 6: Restart backend**
```bash
pm2 start ecosystem.config.js
pm2 save
```

### **Step 7: Test API**
```bash
# Test locally
curl http://localhost:5000/api/health

# Test externally
curl https://api.ozarx.in/api/health

# Test jobs endpoint
curl https://api.ozarx.in/api/jobs
```

### **Step 8: Check status**
```bash
pm2 status
pm2 logs ozarx-api
```

## **Expected Results**

✅ **API Health Check**: `https://api.ozarx.in/api/health` should return:
```json
{
  "message": "Job Portal API is running!",
  "status": "OK",
  "timestamp": "2024-01-02T10:30:00.000Z",
  "version": "1.0.0"
}
```

✅ **CORS Fixed**: No more CORS errors from `https://ozarx.in`

✅ **Jobs Endpoint**: `https://api.ozarx.in/api/jobs` should return job listings

## **Quick Commands**

```bash
# Check if backend is running
pm2 status

# View logs
pm2 logs ozarx-api

# Restart backend
pm2 restart ozarx-api

# Test API
curl https://api.ozarx.in/api/health
```

## **Browser Test**

After the fix, visit `https://ozarx.in` and check:
- ✅ No CORS errors in browser console
- ✅ Jobs load successfully
- ✅ Login/registration works
- ✅ All API calls succeed







