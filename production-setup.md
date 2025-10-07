# Production Setup Guide for GCP VM

## 🚀 Production Deployment for https://api.ozarx.in/api

### Prerequisites
- GCP VM instance running Ubuntu/Debian
- Domain `api.ozarx.in` pointing to your VM's IP
- SSL certificate for HTTPS
- Node.js 18+ and npm installed
- Nginx installed
- PM2 for process management

### 1. Server Setup

#### Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install MongoDB (if not using cloud)
sudo apt install mongodb -y
```

### 2. Project Setup

#### Clone and Install
```bash
# Navigate to your project directory
cd /var/www/ozarx

# Install backend dependencies
cd backend
npm install --production

# Install frontend dependencies
cd ../frontend
npm install
npm run build
```

### 3. Environment Configuration

#### Backend Environment (.env)
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://ozarxhr:KBfbR0EsisP4I4or@cluster0.hzykio1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=b28571735fab77c48b368b09bf547939fef6ee05c31a52504905dccef5c9545aa898a8dbcc9bf6eac573b43db31b0a2a8cd0bbf581387a85682ff1e058a00673

# Email Configuration
EMAIL_USER=ozarxhr@gmail.com
EMAIL_PASS=v6Jc54@19731973
EMAIL_FROM="Ozarx HR ozarxhr@gmail.com"

# Frontend URL
FRONTEND_URL=https://ozarx.in
FRONTEND_ORIGINS=https://ozarx.in,https://www.ozarx.in

# API Base URL
API_BASE_URL=https://api.ozarx.in/api

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### 4. Nginx Configuration

#### Create Nginx Config
```bash
sudo nano /etc/nginx/sites-available/ozarx-api
```

#### Nginx Configuration Content
```nginx
server {
    listen 80;
    server_name api.ozarx.in;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.ozarx.in;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/api.ozarx.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.ozarx.in/privkey.pem;
    
    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # API Routes
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Health Check
    location /health {
        proxy_pass http://localhost:5000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static Files (if serving frontend from same server)
    location / {
        root /var/www/ozarx/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # File upload size limit
    client_max_body_size 50M;
}
```

### 5. SSL Certificate Setup

#### Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

#### Get SSL Certificate
```bash
sudo certbot --nginx -d api.ozarx.in
```

### 6. PM2 Configuration

#### Create PM2 Ecosystem File
```bash
nano /var/www/ozarx/ecosystem.config.js
```

#### PM2 Configuration Content
```javascript
module.exports = {
  apps: [{
    name: 'ozarx-api',
    script: './backend/server.js',
    cwd: '/var/www/ozarx',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/pm2/ozarx-api-error.log',
    out_file: '/var/log/pm2/ozarx-api-out.log',
    log_file: '/var/log/pm2/ozarx-api.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

### 7. Deployment Scripts

#### Create Deployment Script
```bash
nano /var/www/ozarx/deploy.sh
```

#### Deployment Script Content
```bash
#!/bin/bash

# Production Deployment Script for Ozarx API
echo "🚀 Starting production deployment..."

# Navigate to project directory
cd /var/www/ozarx

# Pull latest changes (if using git)
# git pull origin main

# Install/update dependencies
echo "📦 Installing dependencies..."
cd backend
npm install --production
cd ../frontend
npm install
npm run build

# Restart PM2 processes
echo "🔄 Restarting services..."
pm2 restart ozarx-api

# Reload Nginx
echo "🌐 Reloading Nginx..."
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Deployment completed successfully!"
echo "🌍 API is now available at: https://api.ozarx.in/api"
```

### 8. System Service Setup

#### Create Systemd Service
```bash
sudo nano /etc/systemd/system/ozarx-api.service
```

#### Systemd Service Content
```ini
[Unit]
Description=Ozarx API Server
After=network.target

[Service]
Type=forking
User=www-data
WorkingDirectory=/var/www/ozarx
ExecStart=/usr/bin/pm2 start ecosystem.config.js
ExecReload=/usr/bin/pm2 reload ecosystem.config.js
ExecStop=/usr/bin/pm2 stop ecosystem.config.js
Restart=always

[Install]
WantedBy=multi-user.target
```

### 9. Firewall Configuration

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22
sudo ufw enable
```

### 10. Monitoring and Logs

#### View Logs
```bash
# PM2 logs
pm2 logs ozarx-api

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u ozarx-api -f
```

### 11. Health Checks

#### API Health Check
```bash
curl -k https://api.ozarx.in/api/health
```

#### SSL Test
```bash
curl -I https://api.ozarx.in/api
```

### 12. Backup Strategy

#### Database Backup
```bash
# MongoDB backup (if using local MongoDB)
mongodump --uri="mongodb://localhost:27017/ozarx" --out=/backup/mongodb/$(date +%Y%m%d)
```

#### Application Backup
```bash
# Backup application files
tar -czf /backup/ozarx-$(date +%Y%m%d).tar.gz /var/www/ozarx
```

### 13. Security Checklist

- ✅ SSL certificate installed and configured
- ✅ Firewall configured (only ports 22, 80, 443 open)
- ✅ PM2 running with proper user permissions
- ✅ Nginx security headers configured
- ✅ Environment variables secured
- ✅ Database connections encrypted
- ✅ File upload limits configured
- ✅ CORS properly configured
- ✅ Rate limiting implemented (optional)

### 14. Performance Optimization

#### Nginx Caching
```nginx
# Add to server block
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

#### PM2 Monitoring
```bash
# Install PM2 monitoring
pm2 install pm2-server-monit
```

### 15. Troubleshooting

#### Common Issues
1. **Port 5000 not accessible**: Check firewall and PM2 status
2. **SSL errors**: Verify certificate installation
3. **Database connection**: Check MongoDB connection string
4. **Email not working**: Verify email credentials
5. **CORS errors**: Check FRONTEND_ORIGINS configuration

#### Debug Commands
```bash
# Check PM2 status
pm2 status

# Check Nginx configuration
sudo nginx -t

# Check SSL certificate
sudo certbot certificates

# Check system resources
htop
df -h
```

This setup will give you a production-ready API server at `https://api.ozarx.in/api` with proper SSL, monitoring, and security configurations.







