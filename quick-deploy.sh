#!/bin/bash

# Quick deployment script - Run this on the server
# Usage: bash quick-deploy.sh

set -e

echo "🚀 Starting quick deployment..."

# Configuration
REPO_URL="https://github.com/Sridharraj2023/Elevate-music-admin-Oct28.git"
DEPLOY_DIR="$HOME/Elevate_Admin_Frontend"

# Step 1: Clone or update repository
if [ -d "$DEPLOY_DIR" ]; then
    echo "📦 Updating repository..."
    cd "$DEPLOY_DIR"
    git fetch origin
    git reset --hard origin/main
    git clean -fd
else
    echo "📦 Cloning repository..."
    git clone "$REPO_URL" "$DEPLOY_DIR"
    cd "$DEPLOY_DIR"
fi

# Step 2: Navigate to frontend
cd frontend

# Step 3: Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file..."
    echo "VITE_API_URL=http://172.234.201.117:5000/api" > .env
    echo "✅ Created .env with API URL: http://172.234.201.117:5000/api"
fi

# Step 4: Install and build
echo "📥 Installing dependencies..."
npm install

echo "🔨 Building application..."
npm run build

# Step 5: Verify build
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo "✅ Build successful!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Update nginx to serve from: $DEPLOY_DIR/frontend/dist"
    echo "2. Reload nginx: sudo systemctl reload nginx"
    echo "3. Test the application"
else
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

