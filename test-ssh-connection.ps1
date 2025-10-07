# Test SSH Connection to GCP VM
# Replace YOUR_VM_IP with your actual VM IP address

param(
    [Parameter(Mandatory=$true)]
    [string]$VM_IP,
    
    [string]$SSH_KEY = "~/.ssh/gcp_key",
    [string]$USER = "ubuntu"
)

Write-Host "🔍 Testing SSH connection to $VM_IP..." -ForegroundColor Blue

# Test basic SSH connection
try {
    $result = ssh -i $SSH_KEY -o ConnectTimeout=10 -o BatchMode=yes "$USER@$VM_IP" 'echo "SSH connection successful"'
    if ($result -eq "SSH connection successful") {
        Write-Host "✅ SSH connection successful!" -ForegroundColor Green
        
        # Test PM2 status
        Write-Host "🔍 Checking PM2 status..." -ForegroundColor Blue
        ssh -i $SSH_KEY "$USER@$VM_IP" 'pm2 status'
        
        # Test Nginx status
        Write-Host "🔍 Checking Nginx status..." -ForegroundColor Blue
        ssh -i $SSH_KEY "$USER@$VM_IP" 'sudo systemctl status nginx --no-pager'
        
        # Test API health
        Write-Host "🔍 Testing API health..." -ForegroundColor Blue
        ssh -i $SSH_KEY "$USER@$VM_IP" 'curl -f http://localhost:5000/api/health 2>/dev/null || echo "API not responding"'
        
    } else {
        Write-Host "❌ SSH connection failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ SSH connection error: $_" -ForegroundColor Red
}

Write-Host "`n📋 Useful commands:" -ForegroundColor Yellow
Write-Host "ssh -i $SSH_KEY $USER@$VM_IP" -ForegroundColor Cyan
Write-Host "ssh -i $SSH_KEY $USER@$VM_IP 'pm2 logs ozarx-api'" -ForegroundColor Cyan
Write-Host "ssh -i $SSH_KEY $USER@$VM_IP 'pm2 restart ozarx-api'" -ForegroundColor Cyan
