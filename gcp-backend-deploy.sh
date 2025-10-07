#!/bin/bash

# GCP Backend Deployment Script for Ozarx
# This script sets up and deploys the backend to a GCP VM

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VM_IP="${VM_IP:-}"
VM_USER="${VM_USER:-ubuntu}"
SSH_KEY="${SSH_KEY:-~/.ssh/gcp_key}"
DOMAIN="${DOMAIN:-api.ozarx.in}"
PROJECT_DIR="/var/www/ozarx"

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

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    if [ -z "$VM_IP" ]; then
        print_error "VM_IP environment variable is not set!"
        print_info "Usage: VM_IP=your-vm-ip ./gcp-backend-deploy.sh"
        exit 1
    fi
    
    if [ ! -f "$SSH_KEY" ]; then
        print_error "SSH key not found at $SSH_KEY"
        print_info "Please ensure your SSH key exists or update SSH_KEY variable"
        exit 1
    fi
    
    print_status "Prerequisites check passed"
}

# Create deployment package
create_deployment_package() {
    print_info "Creating deployment package..."
    
    # Create temporary directory
    TEMP_DIR=$(mktemp -d)
    DEPLOY_DIR="$TEMP_DIR/ozarx-backend"
    
    # Copy backend files
    mkdir -p "$DEPLOY_DIR"
    cp -r backend "$DEPLOY_DIR/"
    cp ecosystem.config.js "$DEPLOY_DIR/"
    cp nginx-ozarx-api.conf "$DEPLOY_DIR/"
    cp backend-env.production "$DEPLOY_DIR/"
    cp gcp-vm-setup.sh "$DEPLOY_DIR/"
    cp ssl-setup.sh "$DEPLOY_DIR/"
    
    # Create deployment scripts
    cat > "$DEPLOY_DIR/install.sh" << 'EOF'
#!/bin/bash
set -e

echo "🔧 Installing Ozarx Backend on GCP VM..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install Certbot for SSL
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

    cat > "$DEPLOY_DIR/deploy.sh" << 'EOF'
#!/bin/bash
set -e

echo "🚀 Deploying Ozarx Backend..."

# Stop existing services
pm2 stop ozarx-api 2>/dev/null || true
sudo systemctl stop nginx 2>/dev/null || true

# Copy files to project directory
cp -r backend /var/www/ozarx/
cp ecosystem.config.js /var/www/ozarx/
cp nginx-ozarx-api.conf /var/www/ozarx/
cp backend-env.production /var/www/ozarx/

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

# Start services
sudo systemctl start nginx
sudo systemctl enable nginx

cd /var/www/ozarx
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "✅ Backend deployment completed!"
echo "🌍 API should be available at: http://$(curl -s ifconfig.me):5000"
EOF

    # Make scripts executable
    chmod +x "$DEPLOY_DIR"/*.sh
    
    # Create deployment package
    cd "$TEMP_DIR"
    tar -czf ozarx-backend-deploy.tar.gz ozarx-backend/
    
    print_status "Deployment package created: $TEMP_DIR/ozarx-backend-deploy.tar.gz"
    echo "$TEMP_DIR/ozarx-backend-deploy.tar.gz"
}

# Deploy to GCP VM
deploy_to_vm() {
    local package_path="$1"
    
    print_info "Deploying to GCP VM: $VM_IP"
    
    # Upload package to VM
    print_info "Uploading deployment package..."
    scp -i "$SSH_KEY" "$package_path" "$VM_USER@$VM_IP:/tmp/"
    
    # Execute deployment on VM
    print_info "Executing deployment on GCP VM..."
    ssh -i "$SSH_KEY" "$VM_USER@$VM_IP" << EOF
        set -e
        
        echo "🔧 Setting up Ozarx Backend on GCP VM..."
        
        # Extract deployment package
        cd /tmp
        tar -xzf ozarx-backend-deploy.tar.gz
        cd ozarx-backend
        
        # Run installation if needed
        if [ ! -d "/var/www/ozarx" ]; then
            echo "📦 Running initial setup..."
            ./install.sh
        fi
        
        # Deploy application
        echo "🚀 Deploying application..."
        ./deploy.sh
        
        # Cleanup
        cd /tmp
        rm -rf ozarx-backend ozarx-backend-deploy.tar.gz
        
        echo "✅ Deployment completed successfully!"
EOF
    
    print_status "Deployment completed!"
}

# Setup SSL certificate
setup_ssl() {
    print_info "Setting up SSL certificate..."
    
    ssh -i "$SSH_KEY" "$VM_USER@$VM_IP" << EOF
        echo "🔒 Setting up SSL certificate for $DOMAIN..."
        
        # Update nginx config for domain
        sudo sed -i "s/api\.ozarx\.in/$DOMAIN/g" /etc/nginx/sites-available/ozarx-api
        
        # Test nginx config
        sudo nginx -t
        
        # Restart nginx
        sudo systemctl restart nginx
        
        # Get SSL certificate
        sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
        
        echo "✅ SSL certificate setup completed!"
EOF
    
    print_status "SSL certificate setup completed!"
}

# Test deployment
test_deployment() {
    print_info "Testing deployment..."
    
    # Test API endpoint
    local api_url="https://$DOMAIN/api"
    print_info "Testing API endpoint: $api_url"
    
    if curl -f -s "$api_url" > /dev/null; then
        print_status "API is responding correctly!"
    else
        print_warning "API test failed. Checking HTTP endpoint..."
        local http_url="http://$VM_IP:5000/api"
        if curl -f -s "$http_url" > /dev/null; then
            print_warning "API is running on HTTP but SSL might not be configured yet"
        else
            print_error "API is not responding. Please check the deployment logs."
        fi
    fi
}

# Main deployment function
main() {
    echo "🚀 Starting GCP Backend Deployment for Ozarx..."
    echo "================================================"
    
    check_prerequisites
    
    local package_path=$(create_deployment_package)
    
    deploy_to_vm "$package_path"
    
    # Ask user if they want to setup SSL
    read -p "Do you want to setup SSL certificate for $DOMAIN? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        setup_ssl
    else
        print_warning "Skipping SSL setup. You can run it later with:"
        print_info "ssh -i $SSH_KEY $VM_USER@$VM_IP 'sudo certbot --nginx -d $DOMAIN'"
    fi
    
    test_deployment
    
    # Cleanup
    rm -rf "$(dirname "$package_path")"
    
    print_status "🎉 GCP Backend Deployment Complete!"
    print_info "Your API should be available at: https://$DOMAIN/api"
    print_info "Health check: https://$DOMAIN/health"
    
    echo ""
    print_info "Useful commands:"
    echo "  - Check PM2 status: ssh -i $SSH_KEY $VM_USER@$VM_IP 'pm2 status'"
    echo "  - View logs: ssh -i $SSH_KEY $VM_USER@$VM_IP 'pm2 logs ozarx-api'"
    echo "  - Restart service: ssh -i $SSH_KEY $VM_USER@$VM_IP 'pm2 restart ozarx-api'"
    echo "  - Check nginx: ssh -i $SSH_KEY $VM_USER@$VM_IP 'sudo systemctl status nginx'"
}

# Run main function
main "$@"
