# GCP Backend Deployment Guide for Ozarx

This guide provides comprehensive instructions for deploying the Ozarx backend to a Google Cloud Platform (GCP) VM with all necessary dependencies and configurations.

## Prerequisites

1. **GCP VM Instance** with:
   - OS: Ubuntu 20.04 LTS or newer
   - Machine type: e2-medium or higher (2 vCPUs, 4GB RAM minimum)
   - Boot disk: 20GB or more
   - Firewall rules: Allow HTTP (80), HTTPS (443), and SSH (22)

2. **Domain Setup** (Optional but recommended)
   - Point your domain (e.g., `api.ozarx.in`) to the VM's external IP
   - SSL certificate will be automatically configured

3. **SSH Access**
   - SSH key pair for secure access to your VM
   - VM's external IP address

## Quick Deployment

### Option 1: One-Command Deployment

```bash
# Set your VM IP and run the quick deployment
VM_IP=your-vm-external-ip ./gcp-quick-deploy.sh
```

### Option 2: Full Deployment with SSL

```bash
# Set your VM IP and domain
VM_IP=your-vm-external-ip DOMAIN=api.ozarx.in ./gcp-backend-deploy.sh
```

## Manual Step-by-Step Deployment

### Step 1: Prepare Your Local Environment

1. **Clone the repository** (if not already done):
   ```bash
   git clone https://github.com/your-username/job-portal-platform.git
   cd job-portal-platform
   ```

2. **Set up environment variables**:
   ```bash
   export VM_IP=your-vm-external-ip
   export DOMAIN=api.ozarx.in  # Optional
   export SSH_KEY=~/.ssh/gcp_key  # Your SSH key path
   ```

### Step 2: Create Production Environment

```bash
# Run the production environment setup
./gcp-production-env.sh
```

This will create:
- Production environment configuration
- PM2 ecosystem configuration
- Nginx configuration
- SSL setup scripts
- Monitoring scripts

### Step 3: Deploy to GCP VM

```bash
# Deploy the backend
./gcp-backend-deploy.sh
```

### Step 4: Configure SSL Certificate

```bash
# SSH to your VM and setup SSL
ssh -i ~/.ssh/gcp_key ubuntu@$VM_IP

# Run SSL setup
sudo ./ssl-setup.sh api.ozarx.in admin@ozarx.in
```

## Environment Variables Setup

After deployment, set these environment variables on your VM:

```bash
# SSH to your VM
ssh -i ~/.ssh/gcp_key ubuntu@$VM_IP

# Set environment variables
export GOOGLE_CLIENT_ID="your_google_client_id"
export GOOGLE_CLIENT_SECRET="your_google_client_secret"
export OPENAI_API_KEY="your_openai_api_key"

# Optional payment configurations
export STRIPE_SECRET_KEY="your_stripe_secret_key"
export RAZORPAY_KEY_ID="your_razorpay_key_id"
export RAZORPAY_KEY_SECRET="your_razorpay_key_secret"

# Restart the application
pm2 restart ozarx-api
```

## Project Structure

```
/var/www/ozarx/
├── backend/                 # Backend application
│   ├── server.js           # Main server file
│   ├── .env                # Environment variables
│   └── ...
├── ecosystem.config.js     # PM2 configuration
├── nginx-ozarx-api.conf    # Nginx configuration
└── logs/                   # Application logs
```

## Services Configuration

### PM2 Process Manager

- **Application**: `ozarx-api`
- **Mode**: Cluster mode (utilizes all CPU cores)
- **Auto-restart**: Enabled
- **Memory limit**: 1GB per process
- **Logs**: `/var/log/pm2/`

### Nginx Reverse Proxy

- **Port**: 80 (HTTP) → 443 (HTTPS redirect)
- **SSL**: Let's Encrypt certificates
- **Security headers**: Enabled
- **Gzip compression**: Enabled
- **File upload limit**: 50MB

### SSL Configuration

- **Provider**: Let's Encrypt
- **Auto-renewal**: Enabled
- **Protocols**: TLS 1.2, TLS 1.3
- **Security**: A+ rating configuration

## Monitoring and Maintenance

### Check Service Status

```bash
# PM2 status
pm2 status

# Nginx status
sudo systemctl status nginx

# View logs
pm2 logs ozarx-api
sudo tail -f /var/log/nginx/access.log
```

### Restart Services

```bash
# Restart backend
pm2 restart ozarx-api

# Restart Nginx
sudo systemctl restart nginx

# Restart all services
pm2 restart all
```

### Update Application

```bash
# Pull latest changes
cd /var/www/ozarx
git pull origin main

# Install new dependencies
cd backend
npm install --production

# Restart application
pm2 restart ozarx-api
```

## Security Features

### Firewall Configuration

```bash
# Check firewall status
sudo ufw status

# Allow only necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80   # HTTP
sudo ufw allow 443  # HTTPS
```

### Security Headers

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Rate Limiting

- **Window**: 15 minutes
- **Max requests**: 100 per window
- **Configuration**: Built into the application

## Troubleshooting

### Common Issues

1. **Port 5000 not accessible**:
   ```bash
   # Check if backend is running
   pm2 status
   
   # Check firewall
   sudo ufw status
   
   # Check if port is in use
   sudo netstat -tlnp | grep :5000
   ```

2. **SSL certificate issues**:
   ```bash
   # Check certificate status
   sudo certbot certificates
   
   # Renew certificate manually
   sudo certbot renew
   
   # Test SSL configuration
   sudo nginx -t
   ```

3. **Database connection issues**:
   ```bash
   # Check environment variables
   cat /var/www/ozarx/backend/.env | grep MONGO_URI
   
   # Test database connection
   node -e "require('mongoose').connect(process.env.MONGO_URI).then(() => console.log('Connected')).catch(console.error)"
   ```

4. **High memory usage**:
   ```bash
   # Check memory usage
   pm2 monit
   
   # Restart if needed
   pm2 restart ozarx-api
   ```

### Log Files

- **Application logs**: `/var/log/pm2/ozarx-api.log`
- **Error logs**: `/var/log/pm2/ozarx-api-error.log`
- **Nginx access**: `/var/log/nginx/access.log`
- **Nginx error**: `/var/log/nginx/error.log`

## Performance Optimization

### System Optimization

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install monitoring tools
sudo apt install htop iotop nethogs

# Monitor system resources
htop
```

### Application Optimization

1. **PM2 Cluster Mode**: Automatically utilizes all CPU cores
2. **Memory Management**: Auto-restart on memory limit
3. **Gzip Compression**: Reduces bandwidth usage
4. **Connection Pooling**: Optimized database connections

## Backup and Recovery

### Database Backup

```bash
# MongoDB backup (if using local MongoDB)
mongodump --uri="your_mongodb_uri" --out=/backup/mongodb/

# Application backup
tar -czf /backup/ozarx-$(date +%Y%m%d).tar.gz /var/www/ozarx/
```

### Recovery

```bash
# Restore application
tar -xzf /backup/ozarx-YYYYMMDD.tar.gz -C /

# Restart services
pm2 restart ozarx-api
sudo systemctl restart nginx
```

## Scaling

### Horizontal Scaling

1. **Load Balancer**: Use GCP Load Balancer
2. **Multiple VMs**: Deploy to multiple VM instances
3. **Database**: Use MongoDB Atlas or Cloud SQL

### Vertical Scaling

1. **Increase VM specs**: More CPU/RAM
2. **Optimize PM2**: Adjust cluster settings
3. **Database optimization**: Index optimization

## Cost Optimization

### VM Sizing

- **Development**: e2-micro (1 vCPU, 1GB RAM)
- **Production**: e2-medium (2 vCPU, 4GB RAM)
- **High Traffic**: e2-standard-4 (4 vCPU, 16GB RAM)

### Monitoring Costs

```bash
# Check resource usage
htop
df -h
free -h

# Monitor with PM2
pm2 monit
```

## Support and Maintenance

### Regular Maintenance Tasks

1. **Weekly**: Check service status and logs
2. **Monthly**: Update system packages
3. **Quarterly**: Review security configurations
4. **Annually**: Update SSL certificates (auto-renewal handles this)

### Support Commands

```bash
# Quick health check
curl -f https://api.ozarx.in/health

# Full system status
./monitor-backend.sh

# Emergency restart
pm2 restart all && sudo systemctl restart nginx
```

## Conclusion

This deployment setup provides:

- ✅ **Production-ready configuration**
- ✅ **SSL/TLS encryption**
- ✅ **Process management with PM2**
- ✅ **Reverse proxy with Nginx**
- ✅ **Security headers and rate limiting**
- ✅ **Auto-scaling and monitoring**
- ✅ **Easy maintenance and updates**

Your Ozarx backend is now ready for production use on GCP! 🚀
