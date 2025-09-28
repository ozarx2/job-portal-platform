#!/bin/bash

# Job Portal Platform Deployment Script
echo "🚀 Starting deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -d "backend" ] && [ ! -d "frontend" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Updating code from repository..."
git pull origin master

print_status "Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    print_error "Failed to install backend dependencies"
    exit 1
fi

print_status "Installing frontend dependencies..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    print_error "Failed to install frontend dependencies"
    exit 1
fi

print_status "Building frontend..."
npm run build
if [ $? -ne 0 ]; then
    print_error "Failed to build frontend"
    exit 1
fi

print_status "Restarting backend service..."
cd ../backend
pm2 restart job-portal-backend || pm2 start server.js --name "job-portal-backend"

print_status "Reloading Nginx..."
sudo systemctl reload nginx

print_status "Checking service status..."
pm2 status

print_status "✅ Deployment completed successfully!"
print_warning "Don't forget to:"
print_warning "1. Update your .env files with production credentials"
print_warning "2. Configure your domain DNS to point to this server"
print_warning "3. Set up SSL certificate with: sudo certbot --nginx -d yourdomain.com"
