#!/bin/bash

# GCP Backend Deployment Script
# Run this script to deploy your backend to GCP VM

echo "🚀 Starting GCP Backend Deployment..."

# Configuration
VM_IP="YOUR_VM_IP_HERE"  # Replace with your GCP VM's external IP
VM_USER="YOUR_USERNAME"   # Replace with your VM username
SSH_KEY="~/.ssh/gcp_key"  # Replace with your SSH key path

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if VM_IP is set
if [ "$VM_IP" = "YOUR_VM_IP_HERE" ]; then
    print_error "Please set your VM_IP in the script first!"
    exit 1
fi

# Check if SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    print_warning "SSH key not found at $SSH_KEY"
    print_warning "Please update the SSH_KEY variable in the script"
fi

echo "📦 Preparing deployment package..."

# Create deployment directory
mkdir -p gcp-deployment
cd gcp-deployment

# Copy backend files
print_status "Copying backend files..."
cp -r ../backend .
cp ../ecosystem.config.js .
cp ../nginx-ozarx-api.conf .
cp ../backend-env.production .
cp ../setup-production.sh .
cp ../deploy.sh .
cp ../ssl-setup.sh .

# Create deployment package
print_status "Creating deployment package..."
tar -czf ozarx-backend.tar.gz backend/ ecosystem.config.js nginx-ozarx-api.conf backend-env.production *.sh

echo "📤 Uploading to GCP VM..."

# Upload to GCP VM
scp -i "$SSH_KEY" ozarx-backend.tar.gz $VM_USER@$VM_IP:/tmp/

# Execute deployment on VM
print_status "Executing deployment on GCP VM..."
ssh -i "$SSH_KEY" $VM_USER@$VM_IP << 'EOF'
    echo "🔧 Setting up backend on GCP VM..."
    
    # Extract deployment package
    cd /tmp
    tar -xzf ozarx-backend.tar.gz
    
    # Create project directory
    sudo mkdir -p /var/www/ozarx
    sudo chown -R $USER:$USER /var/www/ozarx
    
    # Move files to project directory
    mv backend /var/www/ozarx/
    mv ecosystem.config.js /var/www/ozarx/
    mv nginx-ozarx-api.conf /var/www/ozarx/
    mv backend-env.production /var/www/ozarx/
    mv *.sh /var/www/ozarx/
    
    # Make scripts executable
    chmod +x /var/www/ozarx/*.sh
    
    # Setup environment
    cd /var/www/ozarx/backend
    cp ../backend-env.production .env
    
    # Install dependencies
    npm install --production
    
    # Setup Nginx
    sudo cp /var/www/ozarx/nginx-ozarx-api.conf /etc/nginx/sites-available/ozarx-api
    sudo ln -sf /etc/nginx/sites-available/ozarx-api /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test Nginx configuration
    sudo nginx -t
    
    # Start Nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    
    # Start PM2
    cd /var/www/ozarx
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup
    
    echo "✅ Backend deployment completed!"
    echo "🌍 API should be available at: http://$HOSTNAME:5000"
    echo "🔧 Next step: Setup SSL certificate with: sudo certbot --nginx -d api.ozarx.in"
EOF

print_status "Deployment completed!"
print_warning "Next steps:"
echo "1. Point your domain api.ozarx.in to your VM's IP: $VM_IP"
echo "2. SSH to your VM and run: sudo certbot --nginx -d api.ozarx.in"
echo "3. Test your API: curl https://api.ozarx.in/api/health"

# Cleanup
cd ..
rm -rf gcp-deployment

print_status "GCP Backend Deployment Complete! 🎉"







