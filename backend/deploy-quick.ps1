# Quick PowerShell Deployment Script for GCP VM
# Minimal deployment without backups and health checks

param(
    [Parameter(Mandatory=$true)]
    [string]$RemoteHost,
    
    [Parameter(Mandatory=$true)]
    [string]$RemoteUser,
    
    [Parameter(Mandatory=$false)]
    [string]$RemotePath = "/home/$RemoteUser/backend",
    
    [Parameter(Mandatory=$false)]
    [string]$SshKey = ""
)

Write-Host "🚀 Quick deployment to GCP VM..." -ForegroundColor Blue

# Build SSH command
$sshCmd = "ssh"
if ($SshKey) {
    $sshCmd += " -i `"$SshKey`""
}

# Stop existing server
Write-Host "🛑 Stopping existing server..." -ForegroundColor Yellow
& $sshCmd "$RemoteUser@$RemoteHost" "cd $RemotePath && pkill -f 'node server.js' 2>/dev/null || true"

# Create temporary archive
$tempArchive = "temp-deploy.tar.gz"
Write-Host "📦 Creating deployment archive..." -ForegroundColor Yellow

try {
    & tar -czf $tempArchive --exclude='node_modules' --exclude='.git' --exclude='.env' --exclude='uploads' --exclude='*.log' .
    if ($LASTEXITCODE -ne 0) {
        throw "tar failed"
    }
} catch {
    # Fallback to PowerShell compression
    $filesToCompress = Get-ChildItem -Recurse | Where-Object { 
        $_.FullName -notmatch 'node_modules|\.git|\.env|uploads|.*\.log' 
    }
    Compress-Archive -Path $filesToCompress -DestinationPath "$tempArchive.zip" -Force
    Rename-Item "$tempArchive.zip" $tempArchive
}

# Copy and extract
Write-Host "📤 Uploading files..." -ForegroundColor Yellow
$scpCmd = "scp"
if ($SshKey) {
    $scpCmd += " -i `"$SshKey`""
}

& $scpCmd $tempArchive "$RemoteUser@$RemoteHost`:~/"
& $sshCmd "$RemoteUser@$RemoteHost" "cd $RemotePath; tar -xzf ~/temp-deploy.tar.gz; rm ~/temp-deploy.tar.gz"

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
& $sshCmd "$RemoteUser@$RemoteHost" "cd $RemotePath; npm install --production"

# Start server
Write-Host "🚀 Starting server..." -ForegroundColor Yellow
& $sshCmd "$RemoteUser@$RemoteHost" "cd $RemotePath; nohup node server.js > server.log 2>&1 `&"

# Clean up
Remove-Item $tempArchive -ErrorAction SilentlyContinue

Write-Host "✅ Quick deployment completed!" -ForegroundColor Green
Write-Host "🔗 Server: http://$RemoteHost:5000" -ForegroundColor Yellow
