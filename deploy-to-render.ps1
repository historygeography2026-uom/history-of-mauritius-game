# Deploy to Render - Direct Upload from VS Code
# Run this script in VS Code Terminal to create deployment package

Write-Host "================================================"
Write-Host "MAURITIUS GAME - RENDER DEPLOYMENT"
Write-Host "================================================"
Write-Host ""

# Project path
$projectPath = "c:\Users\Abdallah Peerally\Desktop\his geo\history-of-mauritius-game v07012026"
$deployDir = "$projectPath\deploy"
$zipFile = "$deployDir\mauritius-game-deploy.zip"

Write-Host "✓ Project: $projectPath"
Write-Host ""

# Step 1: Create deploy directory
if (-not (Test-Path $deployDir)) {
    New-Item -ItemType Directory -Path $deployDir | Out-Null
    Write-Host "✓ Created deploy directory"
} else {
    Write-Host "✓ Deploy directory already exists"
}

# Step 2: Remove old ZIP if exists
if (Test-Path $zipFile) {
    Remove-Item $zipFile -Force
    Write-Host "✓ Removed old deployment ZIP"
}

# Step 3: Create ZIP file
Write-Host "⏳ Creating ZIP file (this may take 1-2 minutes)..."
Write-Host ""

try {
    Set-Location $projectPath
    
    $filesToZip = @("app", "components", "hooks", "lib", "public", "scripts", "styles", ".env.render", ".gitignore", "Dockerfile", "middleware.ts", "next-env.d.ts", "next.config.mjs", "package.json", "pnpm-lock.yaml", "postcss.config.mjs", "tsconfig.json", "render.yaml")
    
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    
    $zipStream = New-Object System.IO.FileStream($zipFile, [System.IO.FileMode]::Create)
    $zipArchive = New-Object System.IO.Compression.ZipArchive($zipStream, [System.IO.Compression.ZipArchiveMode]::Create)
    
    foreach ($item in $filesToZip) {
        if (Test-Path $item) {
            if ((Get-Item $item).PSIsContainer) {
                Get-ChildItem -Path $item -Recurse -File | ForEach-Object {
                    $itemPath = $_.FullName
                    $relativePath = $itemPath.Substring($projectPath.Length + 1)
                    $zipEntry = $zipArchive.CreateEntry($relativePath)
                    [System.IO.File]::WriteAllBytes($zipEntry.Open(), [System.IO.File]::ReadAllBytes($itemPath))
                }
            } else {
                $zipEntry = $zipArchive.CreateEntry($item)
                [System.IO.File]::WriteAllBytes($zipEntry.Open(), [System.IO.File]::ReadAllBytes($item))
            }
        }
    }
    
    $zipArchive.Dispose()
    $zipStream.Dispose()
    
    Write-Host "✓ ZIP file created successfully!"
    Write-Host ""
    
}
catch {
    Write-Host "✗ Error creating ZIP: $_"
    exit 1
}

# Step 4: Display ZIP info
$zipFileInfo = Get-Item $zipFile
$zipSizeMB = [math]::Round($zipFileInfo.Length / 1MB, 2)

Write-Host "================================================"
Write-Host "DEPLOYMENT PACKAGE READY"
Write-Host "================================================"
Write-Host ""
Write-Host "📦 ZIP File:"
Write-Host "   Path: $zipFile"
Write-Host "   Size: $zipSizeMB MB"
Write-Host ""

# Step 5: Instructions
Write-Host "================================================"
Write-Host "DEPLOYMENT INSTRUCTIONS"
Write-Host "================================================"
Write-Host ""
Write-Host "1. Go to https://render.com/dashboard"
Write-Host "2. Click '+ New' > 'Web Service'"
Write-Host "3. Click 'Deploy from source code'"
Write-Host "4. Click 'Upload from computer'"
Write-Host "5. Select your ZIP file:"
Write-Host "   $zipFile"
Write-Host ""
Write-Host "6. Configure in Render:"
Write-Host "   • Name: mauritius-game-app"
Write-Host "   • Environment: Node"
Write-Host "   • Region: Singapore"
Write-Host "   • Build Command: npm run build"
Write-Host "   • Start Command: npm run start"
Write-Host "   • Instance: Standard ($7/month)"
Write-Host ""
Write-Host "7. Click 'Create Web Service'"
Write-Host "8. Add environment variables:"
Write-Host "   • DATABASE_URL (from PostgreSQL)"
Write-Host "   • NEXT_PUBLIC_SUPABASE_URL"
Write-Host "   • NEXT_PUBLIC_SUPABASE_ANON_KEY"
Write-Host "   • GOOGLE_CLIENT_ID"
Write-Host "   • GOOGLE_CLIENT_SECRET"
Write-Host "   • FACEBOOK_APP_ID"
Write-Host "   • FACEBOOK_APP_SECRET"
Write-Host ""
Write-Host "9. Click 'Deploy'"
Write-Host "10. Watch build logs (5-10 minutes)"
Write-Host ""
Write-Host "✓ Done! App will be live at unique Render URL"
Write-Host ""
Write-Host "================================================"
Write-Host ""
Write-Host "💡 TIP: Keep the ZIP file for future deployments"
Write-Host ""
Write-Host "To update your app later:"
Write-Host "1. Make code changes locally"
Write-Host "2. Run this script again"
Write-Host "3. Upload new ZIP to Render"
Write-Host "4. Render will redeploy automatically"
Write-Host ""
Write-Host "================================================"
