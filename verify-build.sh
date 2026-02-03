#!/bin/bash

# Build verification script for Render deployment

echo "=========================================="
echo "Checking Render Deployment Requirements"
echo "=========================================="
echo ""

# Check Node version
echo "✓ Node.js version:"
node --version
echo ""

# Check npm/pnpm
echo "✓ Package manager:"
if command -v pnpm &> /dev/null; then
    echo "  Using pnpm: $(pnpm --version)"
else
    echo "  Using npm: $(npm --version)"
fi
echo ""

# Check dependencies
echo "✓ Checking dependencies..."
if [ -f "package-lock.json" ]; then
    echo "  Found package-lock.json"
elif [ -f "pnpm-lock.yaml" ]; then
    echo "  Found pnpm-lock.yaml"
fi
echo ""

# Build
echo "Building Next.js app..."
npm run build
echo ""

# Check build output
if [ -d ".next" ]; then
    echo "✓ Build successful! .next folder created"
else
    echo "✗ Build failed! No .next folder"
    exit 1
fi
echo ""

echo "=========================================="
echo "Ready for Render deployment!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Go to https://render.com/dashboard"
echo "2. Click '+ New' → 'Web Service'"
echo "3. Select 'Deploy from source code'"
echo "4. Upload this project folder as ZIP"
echo "5. Add environment variables"
echo "6. Click 'Deploy'"
