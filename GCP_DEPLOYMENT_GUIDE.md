# GCP VM Deployment Guide

## Prerequisites

1. **GCP VM Instance** - Create a VM instance with:
   - OS: Ubuntu 20.04 LTS or newer
   - Machine type: e2-medium or higher
   - Boot disk: 20GB or more
   - Firewall: Allow HTTP (80) and HTTPS (443) traffic

2. **Domain Setup** (Optional but recommended)
   - Point your domain to the VM's external IP
   - Set up SSL certificate (Let's Encrypt)

## Step 1: Connect to Your GCP VM

```bash
# Connect via SSH (replace with your VM's external IP)
gcloud compute ssh your-vm-name --zone=your-zone

# Or use regular SSH
ssh username@your-vm-external-ip
```

## Step 2: Install Required Software

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx (for reverse proxy)
sudo apt install nginx -y

# Install Git
sudo apt install git -y

# Install MongoDB (if not using cloud)
sudo apt install mongodb -y
```

## Step 3: Clone and Setup Project

```bash
# Clone your repository
git clone https://github.com/your-username/job-portal-platform.git
cd job-portal-platform

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Step 4: Environment Configuration

### Backend Environment
```bash
# Copy the template and edit
cp backend/env_template.txt backend/.env
nano backend/.env
```

**Required environment variables:**
```env
PORT=5000
MONGO_URI=mongodb+srv://ozarxhr:KBfbR0EsisP4I4or@cluster0.hzykio1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=b28571735fab77c48b368b09bf547939fef6ee05c31a52504905dccef5c9545aa898a8dbcc9bf6eac573b43db31b0a2a8cd0bbf581387a85682ff1e058a00673
EMAIL_USER=ozarxhr@gmail.com
EMAIL_PASS=v6Jc54@19731973
EMAIL_FROM="Ozarx HR ozarxhr@gmail.com"

# Add your actual credentials:
GOOGLE_CLIENT_ID=your_actual_google_client_id
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret
OPENAI_API_KEY=your_actual_openai_api_key

FRONTEND_ORIGINS=https://yourdomain.com,http://your-vm-ip
SESSION_SECRET=b28571735fab77c48b368b09bf547939fef6ee05c31a52504905dccef5c9545aa898a8dbcc9bf6eac573b43db31b0a2a8cd0bbf581387a85682ff1e058a00673
```

### Frontend Environment
```bash
# Copy the template and edit
cp frontend/env_backup.txt frontend/.env
nano frontend/.env
```

**Required environment variables:**
```env
VITE_API_URL=https://yourdomain.com/api
VITE_API_BASE_URL=https://yourdomain.com/api
VITE_NODE_ENV=production
```

## Step 5: Build Frontend

```bash
cd frontend
npm run build
```

## Step 6: Configure Nginx

Create Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/job-portal
```

**Nginx configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend (React build)
    location / {
        root /home/username/job-portal-platform/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
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

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/job-portal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Step 7: Setup SSL (Optional but Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Step 8: Start Services with PM2

```bash
# Start backend with PM2
cd /home/username/job-portal-platform/backend
pm2 start server.js --name "job-portal-backend"

# Save PM2 configuration
pm2 save
pm2 startup
```

## Step 9: Configure Firewall

```bash
# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw enable
```

## Step 10: Test Deployment

1. **Check if services are running:**
   ```bash
   pm2 status
   sudo systemctl status nginx
   ```

2. **Test the application:**
   - Visit `http://your-vm-ip` or `https://yourdomain.com`
   - Check API endpoints: `http://your-vm-ip/api/`

## Step 11: Setup Auto-Deployment (Optional)

Create a deployment script:

```bash
nano deploy.sh
```

**Deployment script:**
```bash
#!/bin/bash
cd /home/username/job-portal-platform
git pull origin master
cd backend
npm install
cd ../frontend
npm install
npm run build
pm2 restart job-portal-backend
sudo systemctl reload nginx
echo "Deployment completed!"
```

Make it executable:
```bash
chmod +x deploy.sh
```

## Monitoring and Maintenance

### View Logs
```bash
# PM2 logs
pm2 logs job-portal-backend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Restart Services
```bash
# Restart backend
pm2 restart job-portal-backend

# Restart Nginx
sudo systemctl restart nginx
```

### Update Application
```bash
# Run deployment script
./deploy.sh
```

## Troubleshooting

1. **Port 5000 not accessible:**
   - Check if backend is running: `pm2 status`
   - Check firewall: `sudo ufw status`

2. **Frontend not loading:**
   - Check if build exists: `ls frontend/dist`
   - Check Nginx configuration: `sudo nginx -t`

3. **API calls failing:**
   - Check backend logs: `pm2 logs job-portal-backend`
   - Verify environment variables in `.env`

## Security Considerations

1. **Update system regularly:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Configure firewall properly:**
   ```bash
   sudo ufw status
   ```

3. **Use environment variables for secrets:**
   - Never commit `.env` files
   - Use strong passwords and API keys

4. **Regular backups:**
   - Backup your database
   - Backup your application code
   - Backup your SSL certificates

## Performance Optimization

1. **Enable Gzip compression in Nginx**
2. **Use CDN for static assets**
3. **Monitor resource usage:**
   ```bash
   htop
   pm2 monit
   ```

This guide should help you deploy your job portal platform to GCP VM successfully!
