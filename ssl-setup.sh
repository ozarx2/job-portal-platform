#!/bin/bash

# SSL Certificate Setup Script for api.ozarx.in
echo "🔒 Setting up SSL certificate for api.ozarx.in..."

# Check if domain is pointing to this server
echo "🌐 Checking domain resolution..."
DOMAIN_IP=$(dig +short api.ozarx.in)
SERVER_IP=$(curl -s ifconfig.me)

echo "Domain IP: $DOMAIN_IP"
echo "Server IP: $SERVER_IP"

if [ "$DOMAIN_IP" != "$SERVER_IP" ]; then
    echo "⚠️  WARNING: Domain api.ozarx.in is not pointing to this server!"
    echo "Please update your DNS records first."
    exit 1
fi

# Install Certbot if not already installed
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing Certbot..."
    sudo apt install certbot python3-certbot-nginx -y
fi

# Get SSL certificate
echo "🔒 Obtaining SSL certificate..."
sudo certbot --nginx -d api.ozarx.in --non-interactive --agree-tos --email ozarxhr@gmail.com

# Test certificate
echo "🧪 Testing SSL certificate..."
sudo certbot certificates

# Setup auto-renewal
echo "🔄 Setting up auto-renewal..."
sudo crontab -l | grep -v certbot > /tmp/crontab_backup
echo "0 12 * * * /usr/bin/certbot renew --quiet" >> /tmp/crontab_backup
sudo crontab /tmp/crontab_backup

echo "✅ SSL certificate setup completed!"
echo "🌍 Your API is now available at: https://api.ozarx.in/api"
echo "🔍 Test SSL: curl -I https://api.ozarx.in/api"







