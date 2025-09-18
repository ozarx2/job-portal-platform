#!/bin/bash

# GCP VM HTTPS Setup Script
# Run this on your GCP VM to set up HTTPS with Let's Encrypt

echo "Setting up HTTPS for your GCP VM..."

# Update system
sudo apt update

# Install Nginx
sudo apt install nginx -y

# Install Certbot for Let's Encrypt
sudo apt install certbot python3-certbot-nginx -y

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Configure firewall
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw --force enable

# Create Nginx configuration for your API
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

# Enable the site
sudo ln -s /etc/nginx/sites-available/job-portal-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

echo "Nginx configured. Now getting SSL certificate..."

# Get SSL certificate (replace with your domain if you have one)
sudo certbot --nginx -d 35.192.180.25 --non-interactive --agree-tos --email your-email@example.com

echo "HTTPS setup complete!"
echo "Your API will be available at: https://35.192.180.25"
