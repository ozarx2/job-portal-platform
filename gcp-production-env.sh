#!/bin/bash

# GCP Production Environment Setup Script
# This script creates the production environment configuration

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Get VM IP from user
get_vm_ip() {
    if [ -z "$VM_IP" ]; then
        read -p "Enter your GCP VM's external IP address: " VM_IP
    fi
    echo "$VM_IP"
}

# Create production environment file
create_production_env() {
    local vm_ip="$1"
    local domain="${DOMAIN:-api.ozarx.in}"
    
    print_info "Creating production environment configuration..."
    
    cat > backend/.env.production << EOF
# Production Environment Configuration
NODE_ENV=production
PORT=5000

# Database Configuration
MONGO_URI=mongodb+srv://ozarxhr:KBfbR0EsisP4I4or@cluster0.hzykio1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# JWT Configuration
JWT_SECRET=b28571735fab77c48b368b09bf547939fef6ee05c31a52504905dccef5c9545aa898a8dbcc9bf6eac573b43db31b0a2a8cd0bbf581387a85682ff1e058a00673
SESSION_SECRET=b28571735fab77c48b368b09bf547939fef6ee05c31a52504905dccef5c9545aa898a8dbcc9bf6eac573b43db31b0a2a8cd0bbf581387a85682ff1e058a00673

# Email Configuration
EMAIL_USER=ozarxhr@gmail.com
EMAIL_PASS=v6Jc54@19731973
EMAIL_FROM="Ozarx HR ozarxhr@gmail.com"

# Google OAuth Configuration
GOOGLE_CLIENT_ID=\${GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET=\${GOOGLE_CLIENT_SECRET}

# OpenAI Configuration
OPENAI_API_KEY=\${OPENAI_API_KEY}

# CORS Configuration
FRONTEND_ORIGINS=https://ozarx.in,https://www.ozarx.in,https://job-portal-platform-git-master-shamseers-projects-613ceea2.vercel.app,http://$vm_ip,https://$domain

# Payment Configuration (Optional)
STRIPE_SECRET_KEY=\${STRIPE_SECRET_KEY}
STRIPE_PUBLISHABLE_KEY=\${STRIPE_PUBLISHABLE_KEY}
STRIPE_WEBHOOK_SECRET=\${STRIPE_WEBHOOK_SECRET}

RAZORPAY_KEY_ID=\${RAZORPAY_KEY_ID}
RAZORPAY_KEY_SECRET=\${RAZORPAY_KEY_SECRET}
RAZORPAY_WEBHOOK_SECRET=\${RAZORPAY_WEBHOOK_SECRET}

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=/var/log/pm2/ozarx-api.log

# Security Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Health Check Configuration
HEALTH_CHECK_ENABLED=true
HEALTH_CHECK_PATH=/health
EOF

    print_status "Production environment file created: backend/.env.production"
}

# Create PM2 ecosystem configuration
create_pm2_config() {
    print_info "Creating PM2 ecosystem configuration..."
    
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'ozarx-api',
    script: './backend/server.js',
    cwd: '/var/www/ozarx',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/pm2/ozarx-api-error.log',
    out_file: '/var/log/pm2/ozarx-api-out.log',
    log_file: '/var/log/pm2/ozarx-api.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF

    print_status "PM2 ecosystem configuration created"
}

# Create Nginx configuration
create_nginx_config() {
    local domain="${DOMAIN:-api.ozarx.in}"
    
    print_info "Creating Nginx configuration for $domain..."
    
    cat > nginx-ozarx-api.conf << EOF
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name $domain;
    return 301 https://\$server_name\$request_uri;
}

# HTTPS Configuration
server {
    listen 443 ssl http2;
    server_name $domain;

    # SSL Configuration (will be updated by Certbot)
    ssl_certificate /etc/letsencrypt/live/$domain/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$domain/privkey.pem;
    
    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # API Routes
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
        proxy_send_timeout 300s;
    }

    # Health Check
    location /health {
        proxy_pass http://localhost:5000/health;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # API Documentation
    location /api-docs {
        proxy_pass http://localhost:5000/api-docs;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # File upload size limit
    client_max_body_size 50M;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF

    print_status "Nginx configuration created for $domain"
}

# Create SSL setup script
create_ssl_setup_script() {
    local domain="${DOMAIN:-api.ozarx.in}"
    
    print_info "Creating SSL setup script..."
    
    cat > ssl-setup.sh << 'EOF'
#!/bin/bash

# SSL Setup Script for Ozarx API
set -e

DOMAIN="${1:-api.ozarx.in}"
EMAIL="${2:-admin@ozarx.in}"

echo "🔒 Setting up SSL certificate for $DOMAIN..."

# Update nginx configuration for domain
sudo sed -i "s/api\.ozarx\.in/$DOMAIN/g" /etc/nginx/sites-available/ozarx-api

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx

# Get SSL certificate
sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $EMAIL

# Setup auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

echo "✅ SSL certificate setup completed for $DOMAIN!"
echo "🔒 Certificate will auto-renew every 90 days"
EOF

    chmod +x ssl-setup.sh
    print_status "SSL setup script created"
}

# Create monitoring script
create_monitoring_script() {
    print_info "Creating monitoring script..."
    
    cat > monitor-backend.sh << 'EOF'
#!/bin/bash

# Backend Monitoring Script
echo "🔍 Ozarx Backend Status Check"
echo "=============================="

# Check PM2 status
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "📈 PM2 Monitoring:"
pm2 monit --no-interaction

echo ""
echo "📝 Recent Logs:"
pm2 logs ozarx-api --lines 20

echo ""
echo "🌐 Nginx Status:"
sudo systemctl status nginx --no-pager

echo ""
echo "💾 System Resources:"
echo "Memory Usage:"
free -h
echo ""
echo "Disk Usage:"
df -h
echo ""
echo "CPU Usage:"
top -bn1 | grep "Cpu(s)"
EOF

    chmod +x monitor-backend.sh
    print_status "Monitoring script created"
}

# Main function
main() {
    echo "🔧 Setting up GCP Production Environment for Ozarx Backend"
    echo "=========================================================="
    
    local vm_ip=$(get_vm_ip)
    local domain="${DOMAIN:-api.ozarx.in}"
    
    print_info "VM IP: $vm_ip"
    print_info "Domain: $domain"
    
    create_production_env "$vm_ip"
    create_pm2_config
    create_nginx_config
    create_ssl_setup_script
    create_monitoring_script
    
    print_status "🎉 Production environment setup completed!"
    
    echo ""
    print_info "Next steps:"
    echo "1. Update your DNS to point $domain to $vm_ip"
    echo "2. Run the deployment script: ./gcp-backend-deploy.sh"
    echo "3. Setup SSL certificate: ssh -i ~/.ssh/gcp_key ubuntu@$vm_ip 'sudo ./ssl-setup.sh $domain'"
    echo ""
    print_info "Environment variables to set on your VM:"
    echo "  - GOOGLE_CLIENT_ID"
    echo "  - GOOGLE_CLIENT_SECRET"
    echo "  - OPENAI_API_KEY"
    echo "  - STRIPE_SECRET_KEY (optional)"
    echo "  - RAZORPAY_KEY_ID (optional)"
}

# Run main function
main "$@"
