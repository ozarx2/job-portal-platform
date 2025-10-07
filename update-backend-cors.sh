#!/bin/bash

# Script to update backend CORS configuration on GCP
echo "🔧 Updating backend CORS configuration..."

# Navigate to project directory
cd /var/www/ozarx

# Stop the current backend
pm2 stop ozarx-api

# Pull latest changes (if using git)
# git pull origin master

# Copy the updated server.js to backend directory
# (You'll need to upload the updated server.js to your VM)

# Install any new dependencies
npm install

# Start the backend with new configuration
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Check status
pm2 status

echo "✅ Backend CORS configuration updated!"
echo "🌍 Your API should now accept requests from Vercel frontend"







