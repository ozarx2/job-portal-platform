# GCP VM Deployment Guide

## Prerequisites

1. **SSH Access**: Ensure you have SSH access to your GCP VM
2. **Node.js**: Node.js 18+ installed on the VM
3. **PM2** (Optional): For process management
4. **MongoDB**: MongoDB running on the VM or MongoDB Atlas connection

## Quick Deployment

### 1. Update Configuration

Edit the deployment scripts with your VM details:

```bash
# Edit deploy.sh or deploy-quick.sh
REMOTE_USER="your-username"  # Your GCP VM username
REMOTE_HOST="your-vm-ip"     # Your GCP VM external IP
```

### 2. Run Deployment

```bash
# Make scripts executable
chmod +x deploy.sh deploy-quick.sh

# Quick deployment (recommended for updates)
./deploy-quick.sh

# Or full deployment with backups
./deploy.sh
```

## Manual Deployment Steps

### 1. Connect to VM
```bash
ssh your-username@your-vm-ip
```

### 2. Stop Existing Server
```bash
cd /home/your-username/backend
pkill -f 'node server.js'
# Or if using PM2: pm2 stop ozarx-backend
```

### 3. Backup Current Deployment (Optional)
```bash
tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz . --exclude='node_modules'
```

### 4. Update Code
```bash
# From your local machine
rsync -avz --delete \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '.env' \
    --exclude 'uploads' \
    ./ your-username@your-vm-ip:/home/your-username/backend/
```

### 5. Install Dependencies
```bash
ssh your-username@your-vm-ip "cd /home/your-username/backend && npm install --production"
```

### 6. Configure Environment
```bash
ssh your-username@your-vm-ip "cd /home/your-username/backend && cp env.production.template .env"
# Then edit .env with your configuration
```

### 7. Start Server

#### Option A: Using PM2 (Recommended)
```bash
ssh your-username@your-vm-ip "cd /home/your-username/backend && pm2 start ecosystem.config.js"
```

#### Option B: Using nohup
```bash
ssh your-username@your-vm-ip "cd /home/your-username/backend && nohup node server.js > server.log 2>&1 &"
```

## Environment Configuration

### Required Environment Variables

```bash
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://localhost:27017/ozarx_production
JWT_SECRET=your-super-secure-jwt-secret-key-here
```

### Optional Environment Variables

```bash
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Process Management

### Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start ecosystem.config.js

# Monitor
pm2 monit

# View logs
pm2 logs ozarx-backend

# Restart
pm2 restart ozarx-backend

# Stop
pm2 stop ozarx-backend

# Save PM2 configuration
pm2 save
pm2 startup
```

### Using systemd (Alternative)

Create `/etc/systemd/system/ozarx-backend.service`:

```ini
[Unit]
Description=Ozarx Backend API
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/home/your-username/backend
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=5000

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable ozarx-backend
sudo systemctl start ozarx-backend
sudo systemctl status ozarx-backend
```

## Monitoring and Logs

### View Logs
```bash
# PM2 logs
pm2 logs ozarx-backend

# Direct log file
tail -f server.log

# System logs (if using systemd)
sudo journalctl -u ozarx-backend -f
```

### Health Check
```bash
curl http://localhost:5000/health
curl http://your-vm-ip:5000/health
```

## Security Considerations

### 1. Firewall Configuration
```bash
# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 5000  # For direct API access
```

### 2. SSL/TLS Setup (Recommended)
Use nginx as reverse proxy with SSL:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Environment Security
- Never commit `.env` files
- Use strong JWT secrets
- Enable MongoDB authentication
- Use HTTPS in production

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   sudo lsof -i :5000
   sudo kill -9 <PID>
   ```

2. **Permission denied**
   ```bash
   chmod +x server.js
   chown -R your-username:your-username /home/your-username/backend
   ```

3. **MongoDB connection failed**
   - Check MongoDB service: `sudo systemctl status mongod`
   - Check connection string in `.env`
   - Verify firewall settings

4. **Module not found**
   ```bash
   rm -rf node_modules package-lock.json
   npm install --production
   ```

### Performance Optimization

1. **Enable gzip compression**
2. **Use PM2 cluster mode** for multiple instances
3. **Set up Redis** for session storage
4. **Configure MongoDB indexes**
5. **Use CDN** for static files

## Backup Strategy

### Database Backup
```bash
# MongoDB backup
mongodump --db ozarx_production --out /backup/mongodb/$(date +%Y%m%d)

# Restore
mongorestore --db ozarx_production /backup/mongodb/20240101/ozarx_production
```

### Application Backup
```bash
# Create backup
tar -czf backup-$(date +%Y%m%d).tar.gz . --exclude='node_modules' --exclude='logs'

# Restore
tar -xzf backup-20240101.tar.gz
```

## Updates and Maintenance

### Regular Updates
1. Test changes locally
2. Create backup of production
3. Deploy using deployment script
4. Monitor logs and health
5. Rollback if issues occur

### Monitoring
- Set up health checks
- Monitor server resources
- Track application logs
- Set up alerts for failures

## Support

For issues or questions:
1. Check logs first
2. Verify environment configuration
3. Test endpoints manually
4. Check server resources (CPU, memory, disk)
5. Review firewall and network settings

