# HTTPS Setup Guide for GCP VM API

## 🚨 **Current Issue**
Your frontend (served over HTTPS on Vercel) is trying to connect to your GCP VM API over HTTP, which browsers block for security reasons.

## ✅ **Frontend Changes Made**
All frontend URLs have been updated from `http://35.192.180.25:5000` to `https://35.192.180.25:5000`

## 🔧 **Backend HTTPS Setup Options**

### **Option 1: Quick Setup with Nginx + Let's Encrypt (Recommended)**

Run this on your GCP VM:

```bash
# 1. Update system
sudo apt update

# 2. Install Nginx
sudo apt install nginx -y

# 3. Install Certbot for Let's Encrypt
sudo apt install certbot python3-certbot-nginx -y

# 4. Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 5. Configure firewall
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw --force enable

# 6. Create Nginx configuration
sudo tee /etc/nginx/sites-available/job-portal-api << EOF
server {
    listen 80;
    server_name 35.192.180.25;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# 7. Enable the site
sudo ln -s /etc/nginx/sites-available/job-portal-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 8. Get SSL certificate
sudo certbot --nginx -d 35.192.180.25 --non-interactive --agree-tos --email your-email@example.com
```

### **Option 2: Alternative - Use a Domain Name**

If you have a domain name, you can:

1. Point your domain to your GCP VM IP
2. Use the domain name instead of IP address
3. Get SSL certificate for the domain

### **Option 3: Self-Signed Certificate (Development Only)**

```bash
# Generate self-signed certificate
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/nginx-selfsigned.key \
    -out /etc/ssl/certs/nginx-selfsigned.crt

# Configure Nginx for HTTPS
sudo tee /etc/nginx/sites-available/job-portal-api << EOF
server {
    listen 443 ssl;
    server_name 35.192.180.25;

    ssl_certificate /etc/ssl/certs/nginx-selfsigned.crt;
    ssl_certificate_key /etc/ssl/private/nginx-selfsigned.key;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
```

## 🧪 **Testing Your Setup**

After setting up HTTPS:

1. **Test API directly:**
   ```bash
   curl -k https://35.192.180.25:5000/api/jobs
   ```

2. **Check browser console** for any remaining mixed content errors

3. **Test login functionality** in your frontend

## 🔍 **Troubleshooting**

### If you get SSL certificate errors:
- For Let's Encrypt: Make sure your VM's firewall allows HTTP/HTTPS traffic
- For self-signed: Browsers will show security warnings (expected for development)

### If API still doesn't work:
- Check if your Node.js app is running on port 5000
- Verify Nginx is running: `sudo systemctl status nginx`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`

## 📋 **Next Steps**

1. **Choose your preferred option** (Let's Encrypt recommended)
2. **Run the setup commands** on your GCP VM
3. **Test the connection** from your frontend
4. **Deploy your updated frontend** to Vercel

Your frontend is now ready to work with HTTPS! 🎉
