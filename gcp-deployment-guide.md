# GCP Backend Deployment Guide

## 🚀 Deploy Backend to Google Cloud Platform

### Prerequisites
- GCP account with billing enabled
- GCP VM instance (Ubuntu 20.04+ recommended)
- Domain `api.ozarx.in` pointing to your VM's external IP
- SSH access to your GCP VM

### Step 1: Prepare Your Local Machine

#### 1.1 Create Deployment Package
```bash
# Create a deployment directory
mkdir ozarx-backend-deployment
cd ozarx-backend-deployment

# Copy backend files
cp -r ../backend .
cp ../ecosystem.config.js .
cp ../nginx-ozarx-api.conf .
cp ../backend-env.production .
cp ../setup-production.sh .
cp ../deploy.sh .
cp ../ssl-setup.sh .
```

#### 1.2 Create GCP Deployment Script
```bash
# Create deployment script
nano deploy-to-gcp.sh
```

### Step 2: GCP VM Setup

#### 2.1 Connect to Your VM
```bash
# Replace with your VM's external IP
gcloud compute ssh --zone=YOUR_ZONE YOUR_VM_NAME
# OR
ssh -i ~/.ssh/gcp_key user@YOUR_VM_IP
```

#### 2.2 Initial Server Setup
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

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y

# Create project directory
sudo mkdir -p /var/www/ozarx
sudo chown -R $USER:$USER /var/www/ozarx
```

### Step 3: Upload Your Backend Code

#### 3.1 Method 1: Using SCP (Recommended)
```bash
# From your local machine
scp -r backend/ user@YOUR_VM_IP:/var/www/ozarx/
scp ecosystem.config.js user@YOUR_VM_IP:/var/www/ozarx/
scp nginx-ozarx-api.conf user@YOUR_VM_IP:/var/www/ozarx/
scp backend-env.production user@YOUR_VM_IP:/var/www/ozarx/
scp *.sh user@YOUR_VM_IP:/var/www/ozarx/
```

#### 3.2 Method 2: Using Git
```bash
# On your GCP VM
cd /var/www/ozarx
git clone https://github.com/ozarx2/job-portal-platform.git .
# Copy only backend files
cp -r backend/* .
```

### Step 4: Configure Environment

#### 4.1 Setup Environment Variables
```bash
# On your GCP VM
cd /var/www/ozarx/backend
cp ../backend-env.production .env

# Edit environment variables
nano .env
```

#### 4.2 Install Dependencies
```bash
cd /var/www/ozarx/backend
npm install --production
```

### Step 5: Configure Nginx

#### 5.1 Setup Nginx Configuration
```bash
# Copy Nginx config
sudo cp /var/www/ozarx/nginx-ozarx-api.conf /etc/nginx/sites-available/ozarx-api
sudo ln -sf /etc/nginx/sites-available/ozarx-api /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t
```

#### 5.2 Start Nginx
```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 6: Setup SSL Certificate

#### 6.1 Get SSL Certificate
```bash
# Make sure your domain points to this server first
sudo certbot --nginx -d api.ozarx.in
```

### Step 7: Start Your Backend Service

#### 7.1 Start with PM2
```bash
cd /var/www/ozarx
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 7.2 Verify Deployment
```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs ozarx-api

# Test API
curl https://api.ozarx.in/api/health
```

### Step 8: Configure Firewall

#### 8.1 GCP Firewall Rules
```bash
# Allow HTTP and HTTPS traffic
gcloud compute firewall-rules create allow-http-https \
    --allow tcp:80,tcp:443 \
    --source-ranges 0.0.0.0/0 \
    --description "Allow HTTP and HTTPS traffic"
```

### Step 9: Monitoring and Maintenance

#### 9.1 Useful Commands
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs ozarx-api

# Restart service
pm2 restart ozarx-api

# Check Nginx status
sudo systemctl status nginx

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
```

#### 9.2 Auto-deployment Script
```bash
# Create auto-deployment script
nano /var/www/ozarx/auto-deploy.sh
```

### Troubleshooting

#### Common Issues:
1. **Port 5000 not accessible**: Check GCP firewall rules
2. **SSL errors**: Verify domain DNS settings
3. **PM2 not starting**: Check environment variables
4. **Nginx errors**: Check configuration syntax

#### Debug Commands:
```bash
# Check if ports are listening
sudo netstat -tlnp | grep :5000

# Check PM2 logs
pm2 logs ozarx-api --lines 50

# Test API locally
curl http://localhost:5000/api/health

# Check Nginx configuration
sudo nginx -t
```

### Security Checklist

- ✅ SSL certificate installed
- ✅ Firewall configured (only ports 22, 80, 443)
- ✅ PM2 running with proper permissions
- ✅ Environment variables secured
- ✅ Database connections encrypted
- ✅ CORS properly configured

Your backend API will be available at: `https://api.ozarx.in/api`







