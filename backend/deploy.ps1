# PowerShell Deployment Script for GCP VM
# This script deploys the latest backend code to GCP VM using existing SSH connection

param(
    [Parameter(Mandatory=$true)]
    [string]$RemoteHost,
    
    [Parameter(Mandatory=$true)]
    [string]$RemoteUser,
    
    [Parameter(Mandatory=$false)]
    [string]$RemotePath = "/home/$RemoteUser/backend",
    
    [Parameter(Mandatory=$false)]
    [string]$SshKey = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$Quick = $false
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$White = "White"

Write-Host "🚀 Starting deployment to GCP VM..." -ForegroundColor $Blue

Write-Host "📋 Deployment Configuration:" -ForegroundColor $Blue
Write-Host "  Remote Host: $RemoteHost" -ForegroundColor $White
Write-Host "  Remote User: $RemoteUser" -ForegroundColor $White
Write-Host "  Remote Path: $RemotePath" -ForegroundColor $White
Write-Host "  Quick Mode: $Quick" -ForegroundColor $White

# Check if required files exist
Write-Host "`n🔍 Checking local files..." -ForegroundColor $Yellow
if (-not (Test-Path "server.js")) {
    Write-Host "❌ server.js not found!" -ForegroundColor $Red
    exit 1
}

if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json not found!" -ForegroundColor $Red
    exit 1
}

Write-Host "✅ All required files found" -ForegroundColor $Green

# Build SSH command
$sshCmd = "ssh"
if ($SshKey) {
    $sshCmd += " -i `"$SshKey`""
}

# Test SSH connection
Write-Host "`n🔌 Testing SSH connection..." -ForegroundColor $Yellow
try {
    $testResult = & $sshCmd -o ConnectTimeout=10 -o BatchMode=yes "$RemoteUser@$RemoteHost" "echo 'SSH connection successful'"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ SSH connection successful" -ForegroundColor $Green
    } else {
        Write-Host "❌ SSH connection failed" -ForegroundColor $Red
        exit 1
    }
} catch {
    Write-Host "❌ SSH connection failed: $($_.Exception.Message)" -ForegroundColor $Red
    exit 1
}

if (-not $Quick) {
    # Create backup of existing deployment
    Write-Host "`n💾 Creating backup of existing deployment..." -ForegroundColor $Yellow
    & $sshCmd "$RemoteUser@$RemoteHost" "cd $RemotePath && tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz . --exclude='node_modules' --exclude='backup-*.tar.gz' 2>/dev/null || echo 'No existing deployment to backup'"
}

# Stop the existing server
Write-Host "`n🛑 Stopping existing server..." -ForegroundColor $Yellow
& $sshCmd "$RemoteUser@$RemoteHost" "cd $RemotePath && pkill -f 'node server.js' || echo 'No existing server process found'"

# Create remote directory if it doesn't exist
Write-Host "`n📁 Creating remote directory..." -ForegroundColor $Yellow
& $sshCmd "$RemoteUser@$RemoteHost" "mkdir -p $RemotePath"

# Sync files to remote server using scp
Write-Host "`n📤 Syncing files to remote server..." -ForegroundColor $Yellow

# Create a temporary archive of files to sync
$tempArchive = "temp-deploy.tar.gz"
Write-Host "Creating temporary archive..." -ForegroundColor $White

# Use tar to create archive (if available) or use PowerShell compression
try {
    # Try using tar first (available in Windows 10/11)
    & tar -czf $tempArchive --exclude='node_modules' --exclude='.git' --exclude='backup-*.tar.gz' --exclude='.env' --exclude='uploads' --exclude='*.log' .
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Archive created using tar" -ForegroundColor $Green
    } else {
        throw "tar failed"
    }
} catch {
    # Fallback to PowerShell compression
    Write-Host "Using PowerShell compression..." -ForegroundColor $White
    $filesToCompress = Get-ChildItem -Recurse | Where-Object { 
        $_.FullName -notmatch 'node_modules|\.git|backup-.*\.tar\.gz|\.env|uploads|.*\.log' 
    }
    Compress-Archive -Path $filesToCompress -DestinationPath "$tempArchive.zip" -Force
    Rename-Item "$tempArchive.zip" $tempArchive
}

# Copy archive to remote server
$scpCmd = "scp"
if ($SshKey) {
    $scpCmd += " -i `"$SshKey`""
}

& $scpCmd $tempArchive "$RemoteUser@$RemoteHost`:~/"

# Extract archive on remote server
Write-Host "Extracting files on remote server..." -ForegroundColor $White
& $sshCmd "$RemoteUser@$RemoteHost" "cd $RemotePath && tar -xzf ~/temp-deploy.tar.gz && rm ~/temp-deploy.tar.gz"

# Clean up local archive
Remove-Item $tempArchive -ErrorAction SilentlyContinue

# Install dependencies on remote server
Write-Host "`n📦 Installing dependencies on remote server..." -ForegroundColor $Yellow
& $sshCmd "$RemoteUser@$RemoteHost" "cd $RemotePath && npm install --production"

# Set up environment file if it doesn't exist
Write-Host "`n⚙️ Setting up environment configuration..." -ForegroundColor $Yellow
& $sshCmd "$RemoteUser@$RemoteHost" "cd $RemotePath && if [ ! -f .env ]; then cp env.production.template .env 2>/dev/null || echo 'Please create .env file manually'; fi"

# Set proper permissions
Write-Host "`n🔐 Setting proper permissions..." -ForegroundColor $Yellow
& $sshCmd "$RemoteUser@$RemoteHost" "cd $RemotePath && chmod +x server.js && chmod 644 package.json"

# Start the server
Write-Host "`n🚀 Starting server..." -ForegroundColor $Yellow
& $sshCmd "$RemoteUser@$RemoteHost" "cd $RemotePath && nohup node server.js > server.log 2>&1 & echo \$! > server.pid"

# Wait a moment for server to start
Start-Sleep -Seconds 3

# Check if server is running
Write-Host "`n🔍 Checking server status..." -ForegroundColor $Yellow
$serverStatus = & $sshCmd "$RemoteUser@$RemoteHost" "cd $RemotePath && ps aux | grep 'node server.js' | grep -v grep || echo 'Server process not found'"
Write-Host "Server Status: $serverStatus" -ForegroundColor $White

# Test server health
Write-Host "`n🏥 Testing server health..." -ForegroundColor $Yellow
$healthCheck = & $sshCmd "$RemoteUser@$RemoteHost" "curl -s http://localhost:5000/health || echo 'Health check failed'"
Write-Host "Health Check: $healthCheck" -ForegroundColor $White

Write-Host "`n✅ Deployment completed successfully!" -ForegroundColor $Green
Write-Host "`n📋 Next steps:" -ForegroundColor $Blue
Write-Host "  1. Update .env file on remote server with your configuration" -ForegroundColor $White
Write-Host "  2. Check server logs: ssh $RemoteUser@$RemoteHost 'cd $RemotePath && tail -f server.log'" -ForegroundColor $White
Write-Host "  3. Test endpoints: curl http://$RemoteHost:5000/health" -ForegroundColor $White

Write-Host "`n🔗 Server URL: http://$RemoteHost:5000" -ForegroundColor $Yellow

