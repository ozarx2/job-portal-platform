# Domain and SSL Setup for api.ozarx.in

## 🌐 Domain Configuration

### Step 1: Point Domain to GCP VM

1. **Get your GCP VM's External IP:**
   ```bash
   # On your GCP VM
   curl -s ifconfig.me
   ```

2. **Configure DNS Records:**
   - Go to your domain registrar (GoDaddy, Namecheap, etc.)
   - Add an A record:
     - **Name:** `api`
     - **Type:** `A`
     - **Value:** `YOUR_VM_EXTERNAL_IP`
     - **TTL:** `300` (5 minutes)

3. **Verify DNS Propagation:**
   ```bash
   # Check if domain points to your VM
   nslookup api.ozarx.in
   dig api.ozarx.in
   ```

### Step 2: SSL Certificate Setup

#### 2.1 Install Certbot (if not already installed)
```bash
sudo apt install certbot python3-certbot-nginx -y
```

#### 2.2 Get SSL Certificate
```bash
# Make sure your domain is pointing to your VM first
sudo certbot --nginx -d api.ozarx.in
```

#### 2.3 Verify SSL Certificate
```bash
# Test SSL certificate
curl -I https://api.ozarx.in

# Check certificate details
openssl s_client -connect api.ozarx.in:443 -servername api.ozarx.in
```

### Step 3: Configure Auto-Renewal

#### 3.1 Setup Cron Job
```bash
# Add to crontab
sudo crontab -e

# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

#### 3.2 Test Renewal
```bash
# Test certificate renewal
sudo certbot renew --dry-run
```

## 🔧 Troubleshooting

### Common Issues:

1. **Domain not resolving:**
   - Check DNS propagation: `nslookup api.ozarx.in`
   - Wait for DNS propagation (up to 24 hours)
   - Verify A record is correct

2. **SSL certificate fails:**
   - Ensure domain points to your VM
   - Check if port 80 is accessible
   - Verify Nginx is running

3. **API not accessible:**
   - Check GCP firewall rules
   - Verify PM2 is running
   - Test locally: `curl http://localhost:5000/api/health`

### Debug Commands:

```bash
# Check domain resolution
nslookup api.ozarx.in
dig api.ozarx.in

# Check SSL certificate
curl -I https://api.ozarx.in
openssl s_client -connect api.ozarx.in:443

# Check services
pm2 status
sudo systemctl status nginx
sudo nginx -t

# Check firewall
sudo ufw status
sudo netstat -tlnp | grep :5000
```

## 📊 Monitoring

### Health Checks:
```bash
# API Health Check
curl https://api.ozarx.in/api/health

# SSL Test
curl -I https://api.ozarx.in

# PM2 Status
pm2 status
pm2 logs ozarx-api
```

### Log Files:
- **PM2 Logs:** `pm2 logs ozarx-api`
- **Nginx Logs:** `sudo tail -f /var/log/nginx/error.log`
- **System Logs:** `sudo journalctl -f`

## 🚀 Final Verification

After setup, your API should be accessible at:
- **Main API:** `https://api.ozarx.in/api`
- **Health Check:** `https://api.ozarx.in/health`
- **API Docs:** `https://api.ozarx.in/api-docs`

Test with:
```bash
curl https://api.ozarx.in/api/health
```







