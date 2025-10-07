#!/bin/bash

# Quick Deployment Script for Backend API Only
# Run this on your GCP VM after initial setup

echo "🚀 Quick deployment for backend API..."

# Navigate to project directory
cd /var/www/ozarx

# Update backend code (if using git)
# git pull origin main

# Install/update dependencies
echo "📦 Installing dependencies..."
cd backend
npm install --production

# Copy environment file
echo "🔧 Setting up environment..."
cp ../backend-env.production .env

# Restart PM2 processes
echo "🔄 Restarting API service..."
pm2 restart ozarx-api

# Reload Nginx
echo "🌐 Reloading Nginx..."
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Backend API deployment completed!"
echo "🌍 API is now available at: https://api.ozarx.in/api"
echo "🔍 Health check: https://api.ozarx.in/health"
echo "📚 API docs: https://api.ozarx.in/api-docs"







