#!/bin/bash

# GCP VM Deployment Script for Ozarx Job Portal Backend
# This script deploys the latest backend code to GCP VM

echo "🚀 Starting deployment to GCP VM..."

# Configuration
REMOTE_USER="your-username"  # Replace with your GCP VM username
REMOTE_HOST="your-vm-ip"     # Replace with your GCP VM IP
REMOTE_PATH="/home/$REMOTE_USER/backend"
LOCAL_PATH="."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Deployment Configuration:${NC}"
echo -e "  Remote Host: $REMOTE_HOST"
echo -e "  Remote User: $REMOTE_USER"
echo -e "  Remote Path: $REMOTE_PATH"
echo -e "  Local Path: $LOCAL_PATH"

# Check if required files exist
echo -e "\n${YELLOW}🔍 Checking local files...${NC}"
if [ ! -f "server.js" ]; then
    echo -e "${RED}❌ server.js not found!${NC}"
    exit 1
fi

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All required files found${NC}"

# Create backup of existing deployment
echo -e "\n${YELLOW}💾 Creating backup of existing deployment...${NC}"
ssh $REMOTE_USER@$REMOTE_HOST "cd $REMOTE_PATH && tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz . --exclude='node_modules' --exclude='backup-*.tar.gz' 2>/dev/null || echo 'No existing deployment to backup'"

# Stop the existing server
echo -e "\n${YELLOW}🛑 Stopping existing server...${NC}"
ssh $REMOTE_USER@$REMOTE_HOST "cd $REMOTE_PATH && pkill -f 'node server.js' || echo 'No existing server process found'"

# Create remote directory if it doesn't exist
echo -e "\n${YELLOW}📁 Creating remote directory...${NC}"
ssh $REMOTE_USER@$REMOTE_HOST "mkdir -p $REMOTE_PATH"

# Sync files to remote server (excluding node_modules and other unnecessary files)
echo -e "\n${YELLOW}📤 Syncing files to remote server...${NC}"
rsync -avz --delete \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'backup-*.tar.gz' \
    --exclude '.env' \
    --exclude 'uploads' \
    --exclude '*.log' \
    $LOCAL_PATH/ $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/

# Install dependencies on remote server
echo -e "\n${YELLOW}📦 Installing dependencies on remote server...${NC}"
ssh $REMOTE_USER@$REMOTE_HOST "cd $REMOTE_PATH && npm install --production"

# Set up environment file
echo -e "\n${YELLOW}⚙️ Setting up environment configuration...${NC}"
ssh $REMOTE_USER@$REMOTE_HOST "cd $REMOTE_PATH && if [ ! -f .env ]; then cp .env.example .env; echo 'Please update .env file with your configuration'; fi"

# Set proper permissions
echo -e "\n${YELLOW}🔐 Setting proper permissions...${NC}"
ssh $REMOTE_USER@$REMOTE_HOST "cd $REMOTE_PATH && chmod +x server.js && chmod 644 package.json"

# Start the server using PM2 (if available) or nohup
echo -e "\n${YELLOW}🚀 Starting server...${NC}"
ssh $REMOTE_USER@$REMOTE_HOST "cd $REMOTE_PATH && if command -v pm2 >/dev/null 2>&1; then pm2 start server.js --name 'ozarx-backend'; else nohup node server.js > server.log 2>&1 & echo \$! > server.pid; fi"

# Wait a moment for server to start
sleep 3

# Check if server is running
echo -e "\n${YELLOW}🔍 Checking server status...${NC}"
ssh $REMOTE_USER@$REMOTE_HOST "cd $REMOTE_PATH && if command -v pm2 >/dev/null 2>&1; then pm2 status; else ps aux | grep 'node server.js' | grep -v grep || echo 'Server process not found'; fi"

# Test server health
echo -e "\n${YELLOW}🏥 Testing server health...${NC}"
ssh $REMOTE_USER@$REMOTE_HOST "curl -s http://localhost:5000/health || echo 'Health check failed'"

echo -e "\n${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "\n${BLUE}📋 Next steps:${NC}"
echo -e "  1. Update .env file on remote server with your configuration"
echo -e "  2. Check server logs: ssh $REMOTE_USER@$REMOTE_HOST 'cd $REMOTE_PATH && tail -f server.log'"
echo -e "  3. Monitor server: ssh $REMOTE_USER@$REMOTE_HOST 'cd $REMOTE_PATH && pm2 monit' (if using PM2)"
echo -e "  4. Test endpoints: curl http://$REMOTE_HOST:5000/health"

echo -e "\n${YELLOW}🔗 Server URL: http://$REMOTE_HOST:5000${NC}"

