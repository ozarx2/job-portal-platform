#!/bin/bash

# Script to deploy backend fixes to GCP
echo "🚀 Deploying backend fixes to GCP..."

# Navigate to project directory
cd /var/www/ozarx

# Stop the current backend
echo "⏹️ Stopping current backend..."
pm2 stop ozarx-api

# Update the backend files
echo "📁 Updating backend files..."
# Copy the updated server.js (you'll need to upload this file to your VM)

# Install any new dependencies
echo "📦 Installing dependencies..."
npm install

# Start the backend with new configuration
echo "▶️ Starting backend..."
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Check status
echo "📊 Checking backend status..."
pm2 status

# Test the API
echo "🧪 Testing API endpoints..."
curl -s http://localhost:5000/api/health || echo "❌ Health check failed"
curl -s http://localhost:5000/ || echo "❌ Root endpoint failed"

echo "✅ Backend deployment complete!"
echo "🌍 Your API should now respond to /api/health"







