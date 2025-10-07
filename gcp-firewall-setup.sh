#!/bin/bash

# GCP Firewall Rules Setup
# Run this to configure GCP firewall rules for your backend

echo "🔥 Setting up GCP Firewall Rules..."

# Get current project
PROJECT_ID=$(gcloud config get-value project)
echo "📋 Current GCP Project: $PROJECT_ID"

# Create firewall rule for HTTP
echo "🌐 Creating HTTP firewall rule..."
gcloud compute firewall-rules create allow-http \
    --allow tcp:80 \
    --source-ranges 0.0.0.0/0 \
    --target-tags http-server \
    --description "Allow HTTP traffic"

# Create firewall rule for HTTPS
echo "🔒 Creating HTTPS firewall rule..."
gcloud compute firewall-rules create allow-https \
    --allow tcp:443 \
    --source-ranges 0.0.0.0/0 \
    --target-tags https-server \
    --description "Allow HTTPS traffic"

# Create firewall rule for SSH
echo "🔑 Creating SSH firewall rule..."
gcloud compute firewall-rules create allow-ssh \
    --allow tcp:22 \
    --source-ranges 0.0.0.0/0 \
    --target-tags ssh-server \
    --description "Allow SSH access"

# Create firewall rule for backend API (port 5000)
echo "🚀 Creating API firewall rule..."
gcloud compute firewall-rules create allow-api \
    --allow tcp:5000 \
    --source-ranges 0.0.0.0/0 \
    --target-tags api-server \
    --description "Allow API traffic on port 5000"

echo "✅ Firewall rules created successfully!"
echo ""
echo "📋 Created rules:"
echo "- allow-http (port 80)"
echo "- allow-https (port 443)"
echo "- allow-ssh (port 22)"
echo "- allow-api (port 5000)"
echo ""
echo "🔧 To apply tags to your VM:"
echo "gcloud compute instances add-tags YOUR_VM_NAME --tags=http-server,https-server,ssh-server,api-server --zone=YOUR_ZONE"
echo ""
echo "📊 To list firewall rules:"
echo "gcloud compute firewall-rules list"







