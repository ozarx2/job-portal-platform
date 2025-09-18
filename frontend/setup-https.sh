#!/bin/bash

set -euo pipefail

# GCP VM HTTPS Setup Script
# Run this on your GCP VM to set up HTTPS with Let's Encrypt

DOMAIN="${1:-api.ozarx.in}"
EMAIL="${2:-your-email@example.com}"

echo "Setting up HTTPS for ${DOMAIN}..."

# Update system
sudo apt update

# Install Nginx
sudo apt install nginx -y

# Install Certbot for Let's Encrypt
sudo apt install certbot python3-certbot-nginx -y

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# NOTE: Configure TCP 80/443 in GCP VPC firewall. Skipping ufw here.

# Create Nginx configuration for your API
sudo tee /etc/nginx/sites-available/job-portal-api << EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

    # ACME challenge endpoint for Certbot
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

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
sudo ln -sf /etc/nginx/sites-available/job-portal-api /etc/nginx/sites-enabled/job-portal-api
sudo rm -f /etc/nginx/sites-enabled/default || true
sudo nginx -t
sudo systemctl reload nginx

echo "Nginx configured. Now getting SSL certificate..."

# Obtain & install SSL certificate for DOMAIN
sudo certbot --nginx -d "${DOMAIN}" --non-interactive --agree-tos --email "${EMAIL}"

# Add HSTS header (optional but recommended)
CONF="/etc/nginx/sites-enabled/job-portal-api"
if ! grep -q "Strict-Transport-Security" "${CONF}" 2>/dev/null; then
  sudo sed -i "/ssl_certificate_key/a \\    add_header Strict-Transport-Security \"max-age=31536000; includeSubDomains; preload\" always;" "${CONF}" || true
  sudo nginx -t && sudo systemctl reload nginx
fi

echo "HTTPS setup complete!"
echo "Your API will be available at: https://${DOMAIN}"
