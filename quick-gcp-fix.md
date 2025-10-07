# 🚀 Quick GCP Backend Fix

## **Issue**: CORS errors from Vercel frontend to GCP backend

## **Solution**: Update backend CORS configuration

### **Step 1: SSH to your GCP VM**
```bash
ssh user@YOUR_VM_IP
```

### **Step 2: Check backend status**
```bash
# Check if backend is running
pm2 status

# Check logs
pm2 logs ozarx-api
```

### **Step 3: If backend is not running, start it**
```bash
cd /var/www/ozarx
pm2 start ecosystem.config.js
pm2 save
```

### **Step 4: Update CORS configuration**
```bash
# Edit server.js to include Vercel domain
nano backend/server.js

# Find the CORS configuration and update it to include:
# 'https://job-portal-platform-git-master-shamseers-projects-613ceea2.vercel.app'
```

### **Step 5: Restart backend**
```bash
pm2 restart ozarx-api
```

### **Step 6: Test API**
```bash
# Test locally
curl http://localhost:5000/api/health

# Test from external
curl https://api.ozarx.in/api/health
```

### **Step 7: Check Nginx**
```bash
# Check Nginx status
sudo systemctl status nginx

# Restart if needed
sudo systemctl restart nginx
```

## **Expected Result**
- ✅ API responds at `https://api.ozarx.in/api/health`
- ✅ CORS headers include Vercel domain
- ✅ Frontend can connect to backend
- ✅ No more CORS errors in browser console







