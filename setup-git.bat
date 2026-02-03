@echo off
REM Initialize Git repository
cd /d "c:\Users\Abdallah Peerally\Desktop\his geo\history-of-mauritius-game v07012026"

REM Initialize git
git init

REM Add all files
git add .

REM Initial commit
git commit -m "Initial commit: History of Mauritius Game"

echo.
echo ===================================
echo Git initialization complete!
echo ===================================
echo.
echo Next steps:
echo 1. Go to https://github.com and create a new repository
echo 2. Copy the repository URL
echo 3. Run: git remote add origin YOUR-REPO-URL
echo 4. Run: git branch -M main
echo 5. Run: git push -u origin main
echo.
pause
