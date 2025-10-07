#!/bin/bash

# Production Setup Script for Ozarx API on GCP VM
echo "🚀 Setting up Ozarx API for production on GCP VM..."

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

# Create project directory
echo "📁 Creating project directory..."
sudo mkdir -p /var/www/ozarx
sudo chown -R $USER:$USER /var/www/ozarx

# Copy project files (assuming you're running this from project root)
echo "📁 Copying project files..."
cp -r backend /var/www/ozarx/
cp ecosystem.config.js /var/www/ozarx/
cp nginx-ozarx-api.conf /var/www/ozarx/
cp deploy.sh /var/www/ozarx/
cp ssl-setup.sh /var/www/ozarx/

# Install backend dependencies only
echo "📦 Installing backend dependencies..."
cd /var/www/ozarx/backend
npm install --production

# Setup Nginx configuration
echo "🌐 Setting up Nginx..."
sudo cp /var/www/ozarx/nginx-ozarx-api.conf /etc/nginx/sites-available/ozarx-api
sudo ln -sf /etc/nginx/sites-available/ozarx-api /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Setup PM2
echo "🔄 Setting up PM2..."
cd /var/www/ozarx
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Setup firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Create log directories
echo "📝 Creating log directories..."
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

# Start services
echo "🔄 Starting services..."
sudo systemctl start nginx
sudo systemctl enable nginx

echo "✅ Production setup completed!"
echo ""
echo "🔧 Next steps:"
echo "1. Point your domain api.ozarx.in to this server's IP"
echo "2. Run: sudo certbot --nginx -d api.ozarx.in"
echo "3. Test your API at: https://api.ozarx.in/api"
echo ""
echo "📊 Useful commands:"
echo "- Check PM2 status: pm2 status"
echo "- View logs: pm2 logs ozarx-api"
echo "- Restart API: pm2 restart ozarx-api"
echo "- Check Nginx: sudo nginx -t"
echo "- View Nginx logs: sudo tail -f /var/log/nginx/error.log"
