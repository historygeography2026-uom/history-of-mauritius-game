# GitHub Setup Script for VS Code
# This script initializes Git and pushes to GitHub

Write-Host "================================================"
Write-Host "GitHub & Render Deployment Setup"
Write-Host "================================================"
Write-Host ""

# Step 1: Navigate to project
$projectPath = "c:\Users\Abdallah Peerally\Desktop\his geo\history-of-mauritius-game v07012026"
Set-Location $projectPath
Write-Host "✓ Project directory: $projectPath"
Write-Host ""

# Step 2: Check if git is installed
Write-Host "Checking Git installation..."
try {
    $gitVersion = & "C:\Program Files\Git\cmd\git.exe" --version
    Write-Host "✓ Git installed: $gitVersion"
} catch {
    Write-Host "✗ Git not found. Please install from https://git-scm.com"
    exit 1
}
Write-Host ""

# Step 3: Initialize Git
Write-Host "Initializing Git repository..."
& "C:\Program Files\Git\cmd\git.exe" init
Write-Host "✓ Git initialized"
Write-Host ""

# Step 4: Configure Git (optional but recommended)
Write-Host "Configuring Git user..."
& "C:\Program Files\Git\cmd\git.exe" config user.email "your-email@example.com"
& "C:\Program Files\Git\cmd\git.exe" config user.name "Your Name"
Write-Host "✓ Git user configured (update your email/name above)"
Write-Host ""

# Step 5: Add all files
Write-Host "Adding files to Git..."
& "C:\Program Files\Git\cmd\git.exe" add .
Write-Host "✓ Files added"
Write-Host ""

# Step 6: Initial commit
Write-Host "Creating initial commit..."
& "C:\Program Files\Git\cmd\git.exe" commit -m "Initial commit: History of Mauritius Game - Ready for Render deployment"
Write-Host "✓ Commit created"
Write-Host ""

# Step 7: Instructions for GitHub
Write-Host "================================================"
Write-Host "NEXT STEPS:"
Write-Host "================================================"
Write-Host ""
Write-Host "1. Go to https://github.com/new"
Write-Host "2. Create repository 'history-of-mauritius-game'"
Write-Host "3. Copy the repository URL (HTTPS)"
Write-Host "4. Run these commands:"
Write-Host ""
Write-Host '   & "C:\Program Files\Git\cmd\git.exe" remote add origin YOUR-REPO-URL'
Write-Host '   & "C:\Program Files\Git\cmd\git.exe" branch -M main'
Write-Host '   & "C:\Program Files\Git\cmd\git.exe" push -u origin main'
Write-Host ""
Write-Host "5. Authenticate when prompted"
Write-Host ""
Write-Host "================================================"
