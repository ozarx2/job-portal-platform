#!/bin/bash

# Create GCP Deployment Package
# This script creates a complete deployment package for your backend

echo "📦 Creating GCP Deployment Package..."

# Create deployment directory
DEPLOY_DIR="ozarx-gcp-deployment"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

echo "📁 Copying backend files..."
cp -r backend $DEPLOY_DIR/

echo "📁 Copying configuration files..."
cp ecosystem.config.js $DEPLOY_DIR/
cp nginx-ozarx-api.conf $DEPLOY_DIR/
cp backend-env.production $DEPLOY_DIR/
cp setup-production.sh $DEPLOY_DIR/
cp deploy.sh $DEPLOY_DIR/
cp ssl-setup.sh $DEPLOY_DIR/
cp quick-deploy.sh $DEPLOY_DIR/

echo "📁 Copying deployment scripts..."
cp gcp-vm-setup.sh $DEPLOY_DIR/
cp deploy-to-gcp.sh $DEPLOY_DIR/

echo "📁 Creating deployment instructions..."
cat > $DEPLOY_DIR/README.md << 'EOF'
# Ozarx Backend GCP Deployment Package

## Quick Start

### 1. Upload to GCP VM
```bash
# Upload the entire package to your VM
scp -r ozarx-gcp-deployment/ user@YOUR_VM_IP:/tmp/
```

### 2. Setup on GCP VM
```bash
# SSH to your VM
ssh user@YOUR_VM_IP

# Run initial setup
cd /tmp/ozarx-gcp-deployment
chmod +x *.sh
./gcp-vm-setup.sh
```

### 3. Deploy Backend
```bash
# Move files to project directory
sudo mkdir -p /var/www/ozarx
sudo chown -R $USER:$USER /var/www/ozarx
cp -r backend /var/www/ozarx/
cp ecosystem.config.js /var/www/ozarx/
cp nginx-ozarx-api.conf /var/www/ozarx/
cp backend-env.production /var/www/ozarx/backend/.env
cp *.sh /var/www/ozarx/

# Install dependencies
cd /var/www/ozarx/backend
npm install --production

# Setup Nginx
sudo cp /var/www/ozarx/nginx-ozarx-api.conf /etc/nginx/sites-available/ozarx-api
sudo ln -sf /etc/nginx/sites-available/ozarx-api /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl start nginx
sudo systemctl enable nginx

# Start backend with PM2
cd /var/www/ozarx
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4. Setup SSL
```bash
# After domain is pointing to your VM
sudo certbot --nginx -d api.ozarx.in
```

### 5. Test Deployment
```bash
# Test API
curl https://api.ozarx.in/api/health

# Check PM2 status
pm2 status

# View logs
pm2 logs ozarx-api
```

## Files Included

- `backend/` - Your backend application
- `ecosystem.config.js` - PM2 configuration
- `nginx-ozarx-api.conf` - Nginx configuration
- `backend-env.production` - Environment variables
- `*.sh` - Deployment scripts
- `README.md` - This file

## Environment Variables

Make sure to update the environment variables in `backend-env.production`:
- Database connection
- Email configuration
- API keys
- Domain settings

## Troubleshooting

- Check PM2 status: `pm2 status`
- View logs: `pm2 logs ozarx-api`
- Check Nginx: `sudo nginx -t`
- Test API: `curl http://localhost:5000/api/health`
EOF

echo "📦 Creating deployment archive..."
tar -czf ozarx-backend-gcp.tar.gz $DEPLOY_DIR/

echo "✅ Deployment package created!"
echo "📁 Package location: ozarx-backend-gcp.tar.gz"
echo "📁 Unpacked directory: $DEPLOY_DIR/"
echo ""
echo "🚀 Next steps:"
echo "1. Upload ozarx-backend-gcp.tar.gz to your GCP VM"
echo "2. Extract: tar -xzf ozarx-backend-gcp.tar.gz"
echo "3. Follow instructions in README.md"
echo ""
echo "📊 Package contents:"
ls -la $DEPLOY_DIR/







