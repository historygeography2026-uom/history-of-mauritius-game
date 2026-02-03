# Simple Deploy to Render Script

Write-Host "================================================"
Write-Host "MAURITIUS GAME - RENDER DEPLOYMENT"
Write-Host "================================================"
Write-Host ""

$projectPath = "c:\Users\Abdallah Peerally\Desktop\his geo\history-of-mauritius-game v07012026"
$deployDir = "$projectPath\deploy"
$zipFile = "$deployDir\mauritius-game-deploy.zip"

Write-Host "Project: $projectPath"
Write-Host ""

# Create deploy directory
if (-not (Test-Path $deployDir)) {
    New-Item -ItemType Directory -Path $deployDir | Out-Null
}

Write-Host "Creating ZIP file..."

# Remove old ZIP
if (Test-Path $zipFile) {
    Remove-Item $zipFile -Force
}

# Create ZIP using PowerShell
Set-Location $projectPath
Add-Type -AssemblyName System.IO.Compression.FileSystem

$files = @("app", "components", "hooks", "lib", "public", "scripts", "styles", "Dockerfile", "middleware.ts", "next-env.d.ts", "next.config.mjs", "package.json", "pnpm-lock.yaml", "postcss.config.mjs", "tsconfig.json", "render.yaml", ".env.render", ".gitignore")

$compression = [System.IO.Compression.CompressionLevel]::Optimal
[System.IO.Compression.ZipFile]::CreateFromDirectory("$projectPath", "$zipFile", $compression, $false)

Write-Host "ZIP file created!"
Write-Host ""

$zipSize = [math]::Round((Get-Item $zipFile).Length / 1MB, 2)

Write-Host "================================================"
Write-Host "READY FOR DEPLOYMENT"
Write-Host "================================================"
Write-Host ""
Write-Host "ZIP File Location:"
Write-Host "  $zipFile"
Write-Host ""
Write-Host "Size: $zipSize MB"
Write-Host ""
Write-Host "================================================"
Write-Host "NEXT STEPS"
Write-Host "================================================"
Write-Host ""
Write-Host "1. Go to https://render.com/dashboard"
Write-Host "2. Click '+ New' > 'Web Service'"
Write-Host "3. Select 'Deploy from source code'"
Write-Host "4. Choose 'Upload from computer'"
Write-Host "5. Select the ZIP file above"
Write-Host ""
Write-Host "Configuration:"
Write-Host "  Name: mauritius-game-app"
Write-Host "  Environment: Node"
Write-Host "  Region: Singapore"
Write-Host "  Build: npm run build"
Write-Host "  Start: npm start"
Write-Host "  Plan: Standard"
Write-Host ""
Write-Host "7. Add Environment Variables:"
Write-Host "   DATABASE_URL (from Render PostgreSQL)"
Write-Host "   NEXT_PUBLIC_SUPABASE_URL"
Write-Host "   NEXT_PUBLIC_SUPABASE_ANON_KEY"
Write-Host "   GOOGLE_CLIENT_ID"
Write-Host "   GOOGLE_CLIENT_SECRET"
Write-Host "   FACEBOOK_APP_ID"
Write-Host "   FACEBOOK_APP_SECRET"
Write-Host ""
Write-Host "8. Click 'Create Web Service'"
Write-Host "9. Wait for build (5-10 minutes)"
Write-Host ""
Write-Host "Your app will be LIVE!"
Write-Host ""
Write-Host "================================================"
