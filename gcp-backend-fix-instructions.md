# 🔧 GCP Backend Fix Instructions

## **Issue**: Backend returns "Route not found" for `/api/health`

## **Solution**: Add missing health route and update backend

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

### **Step 4: Update server.js**
You need to add the health route to your `backend/server.js` file:

```javascript
// Add this after the root health check
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Job Portal API is running!', 
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});
```

### **Step 5: Update CORS configuration**
Make sure your CORS includes the Vercel domain:

```javascript
app.use(cors({
  origin: [
    'https://job-portal-platform-git-master-shamseers-projects-613ceea2.vercel.app',
    'https://ozarx.in',
    'https://www.ozarx.in',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
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

✅ **Jobs Endpoint**: `https://api.ozarx.in/api/jobs` should return job listings

✅ **CORS Fixed**: No more CORS errors in browser console

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







