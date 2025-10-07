#!/bin/bash

# Quick GCP Deployment Script for Ozarx Backend
# One-command deployment to GCP VM

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Configuration
VM_IP="${VM_IP:-}"
VM_USER="${VM_USER:-ubuntu}"
SSH_KEY="${SSH_KEY:-~/.ssh/gcp_key}"
DOMAIN="${DOMAIN:-api.ozarx.in}"

# Check if VM_IP is provided
if [ -z "$VM_IP" ]; then
    print_error "VM_IP environment variable is required!"
    print_info "Usage: VM_IP=your-vm-ip ./gcp-quick-deploy.sh"
    print_info "Or: VM_IP=your-vm-ip DOMAIN=your-domain.com ./gcp-quick-deploy.sh"
    exit 1
fi

print_info "🚀 Quick Deploying Ozarx Backend to GCP VM: $VM_IP"
print_info "Domain: $DOMAIN"
print_info "User: $VM_USER"

# Create deployment package
print_info "📦 Creating deployment package..."

TEMP_DIR=$(mktemp -d)
DEPLOY_DIR="$TEMP_DIR/ozarx-backend"

mkdir -p "$DEPLOY_DIR"

# Copy backend files
cp -r backend "$DEPLOY_DIR/"
cp ecosystem.config.js "$DEPLOY_DIR/"
cp nginx-ozarx-api.conf "$DEPLOY_DIR/"
cp backend-env.production "$DEPLOY_DIR/"

# Create quick setup script
cat > "$DEPLOY_DIR/quick-setup.sh" << 'EOF'
#!/bin/bash
set -e

echo "🚀 Quick Setup for Ozarx Backend..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Install additional tools
sudo apt install -y curl wget git unzip

# Create project directory
sudo mkdir -p /var/www/ozarx
sudo chown -R $USER:$USER /var/www/ozarx

# Create log directories
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

# Setup firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

echo "✅ System setup completed!"
EOF

# Create deployment script
cat > "$DEPLOY_DIR/deploy.sh" << EOF
#!/bin/bash
set -e

echo "🚀 Deploying Ozarx Backend..."

# Stop existing services
pm2 stop ozarx-api 2>/dev/null || true
sudo systemctl stop nginx 2>/dev/null || true

# Copy files
cp -r backend /var/www/ozarx/
cp ecosystem.config.js /var/www/ozarx/
cp nginx-ozarx-api.conf /var/www/ozarx/
cp backend-env.production /var/www/ozarx/

# Setup environment
cd /var/www/ozarx/backend
cp ../backend-env.production .env

# Update domain in nginx config
sudo sed -i "s/api\.ozarx\.in/$DOMAIN/g" /var/www/ozarx/nginx-ozarx-api.conf

# Install dependencies
npm install --production

# Setup Nginx
sudo cp /var/www/ozarx/nginx-ozarx-api.conf /etc/nginx/sites-available/ozarx-api
sudo ln -sf /etc/nginx/sites-available/ozarx-api /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Start services
sudo systemctl start nginx
sudo systemctl enable nginx

cd /var/www/ozarx
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "✅ Backend deployment completed!"
echo "🌍 API should be available at: http://$VM_IP:5000"
echo "🔧 Next step: Setup SSL with: sudo certbot --nginx -d $DOMAIN"
EOF

# Make scripts executable
chmod +x "$DEPLOY_DIR"/*.sh

# Create deployment package
cd "$TEMP_DIR"
tar -czf ozarx-backend-quick.tar.gz ozarx-backend/

print_status "Deployment package created"

# Upload and deploy
print_info "📤 Uploading to GCP VM..."

scp -i "$SSH_KEY" ozarx-backend-quick.tar.gz "$VM_USER@$VM_IP:/tmp/"

print_info "🔧 Executing deployment on GCP VM..."

ssh -i "$SSH_KEY" "$VM_USER@$VM_IP" << EOF
    set -e
    
    echo "🔧 Setting up Ozarx Backend on GCP VM..."
    
    # Extract package
    cd /tmp
    tar -xzf ozarx-backend-quick.tar.gz
    cd ozarx-backend
    
    # Run setup if needed
    if [ ! -d "/var/www/ozarx" ]; then
        echo "📦 Running initial setup..."
        ./quick-setup.sh
    fi
    
    # Deploy application
    echo "🚀 Deploying application..."
    DOMAIN="$DOMAIN" ./deploy.sh
    
    # Cleanup
    cd /tmp
    rm -rf ozarx-backend ozarx-backend-quick.tar.gz
    
    echo "✅ Quick deployment completed!"
EOF

# Cleanup
rm -rf "$TEMP_DIR"

print_status "🎉 Quick deployment completed!"
print_info "Your API should be available at: http://$VM_IP:5000"
print_warning "Next steps:"
echo "1. Point your domain $DOMAIN to $VM_IP"
echo "2. Setup SSL certificate:"
echo "   ssh -i $SSH_KEY $VM_USER@$VM_IP 'sudo certbot --nginx -d $DOMAIN'"
echo "3. Test your API: curl https://$DOMAIN/api/health"

print_info "Useful commands:"
echo "  - Check status: ssh -i $SSH_KEY $VM_USER@$VM_IP 'pm2 status'"
echo "  - View logs: ssh -i $SSH_KEY $VM_USER@$VM_IP 'pm2 logs ozarx-api'"
echo "  - Restart: ssh -i $SSH_KEY $VM_USER@$VM_IP 'pm2 restart ozarx-api'"
