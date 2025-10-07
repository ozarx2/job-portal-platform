#!/bin/bash

# GCP VM Initial Setup Script
# Run this on your GCP VM after creating it

echo "🔧 Setting up GCP VM for Ozarx Backend..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
echo "📦 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt install nginx -y

# Install Certbot for SSL
echo "📦 Installing Certbot..."
sudo apt install certbot python3-certbot-nginx -y

# Install additional tools
echo "📦 Installing additional tools..."
sudo apt install -y curl wget git unzip

# Create project directory
echo "📁 Creating project directory..."
sudo mkdir -p /var/www/ozarx
sudo chown -R $USER:$USER /var/www/ozarx

# Create log directories
echo "📝 Creating log directories..."
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

# Setup firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Get VM's external IP
EXTERNAL_IP=$(curl -s ifconfig.me)
echo "🌐 Your VM's external IP is: $EXTERNAL_IP"

echo "✅ GCP VM setup completed!"
echo ""
echo "🔧 Next steps:"
echo "1. Point your domain api.ozarx.in to this IP: $EXTERNAL_IP"
echo "2. Upload your backend code to /var/www/ozarx/"
echo "3. Run the deployment script"
echo ""
echo "📊 Useful commands:"
echo "- Check system status: systemctl status nginx"
echo "- View logs: journalctl -f"
echo "- Check disk space: df -h"
echo "- Check memory: free -h"







