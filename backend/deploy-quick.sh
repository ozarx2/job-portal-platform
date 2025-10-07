#!/bin/bash

# Quick Deployment Script for GCP VM
# Minimal deployment without backups and health checks

echo "🚀 Quick deployment to GCP VM..."

# Configuration - UPDATE THESE VALUES
REMOTE_USER="your-username"  # Replace with your GCP VM username
REMOTE_HOST="your-vm-ip"     # Replace with your GCP VM IP
REMOTE_PATH="/home/$REMOTE_USER/backend"

# Stop existing server
echo "🛑 Stopping existing server..."
ssh $REMOTE_USER@$REMOTE_HOST "cd $REMOTE_PATH && pkill -f 'node server.js' 2>/dev/null || true"

# Sync files
echo "📤 Syncing files..."
rsync -avz --delete \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '.env' \
    --exclude 'uploads' \
    --exclude '*.log' \
    ./ $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/

# Install dependencies
echo "📦 Installing dependencies..."
ssh $REMOTE_USER@$REMOTE_HOST "cd $REMOTE_PATH && npm install --production"

# Start server
echo "🚀 Starting server..."
ssh $REMOTE_USER@$REMOTE_HOST "cd $REMOTE_PATH && nohup node server.js > server.log 2>&1 &"

echo "✅ Quick deployment completed!"
echo "🔗 Server: http://$REMOTE_HOST:5000"

