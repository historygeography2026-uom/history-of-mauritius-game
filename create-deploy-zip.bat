@echo off
REM Deploy to Render - ZIP Upload Method
REM This script creates a ZIP file ready for Render upload

echo.
echo ========================================
echo RENDER DEPLOYMENT - ZIP CREATION
echo ========================================
echo.

setlocal enabledelayedexpansion

REM Define paths
set PROJECT_DIR=c:\Users\Abdallah Peerally\Desktop\his geo\history-of-mauritius-game v07012026
set DEPLOY_DIR=%PROJECT_DIR%\deploy
set ZIP_FILE=%DEPLOY_DIR%\mauritius-game-deploy.zip

REM Create deploy directory
if not exist "%DEPLOY_DIR%" mkdir "%DEPLOY_DIR%"
echo ✓ Created deploy directory

REM Check if 7-Zip is installed, else use PowerShell
where 7z >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ Using 7-Zip to create archive...
    cd /d "%PROJECT_DIR%"
    7z a -r "%ZIP_FILE%" ^
        app components hooks lib public scripts styles ^
        .env.render .gitignore .next Dockerfile middleware.ts ^
        next-env.d.ts next.config.mjs package.json pnpm-lock.yaml ^
        postcss.config.mjs tsconfig.json render.yaml -x!node_modules -x!.git -x!.next
) else (
    echo ✓ Using PowerShell to create archive...
    powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory('%PROJECT_DIR%', '%ZIP_FILE%')"
)

if exist "%ZIP_FILE%" (
    echo.
    echo ✓ ZIP file created successfully!
    echo.
    echo Location: %ZIP_FILE%
    echo File size: 
    for /F "usebackq" %%A in ('%ZIP_FILE%') do (
        set SIZE=%%~zA
        set /A SIZE_MB=!SIZE!/1048576
        echo !SIZE_MB! MB
    )
) else (
    echo.
    echo ✗ Failed to create ZIP file
    exit /b 1
)

echo.
echo ========================================
echo NEXT STEPS:
echo ========================================
echo.
echo 1. Go to https://render.com/dashboard
echo 2. Click "+ New" ^> "Web Service"
echo 3. Select "Deploy from source code"
echo 4. Choose "Upload from computer"
echo 5. Upload: %ZIP_FILE%
echo.
echo 6. Configure settings:
echo    Name: mauritius-game-app
echo    Environment: Node
echo    Region: Singapore
echo    Build: npm run build
echo    Start: npm run start
echo.
echo 7. Add environment variables
echo 8. Click Deploy
echo.
echo ========================================
echo.
pause
