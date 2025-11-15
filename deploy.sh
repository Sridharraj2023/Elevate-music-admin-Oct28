#!/bin/bash

# Deployment script for Elevate Admin Frontend
# This script deploys the updated frontend to the server

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/Sridharraj2023/Elevate-music-admin-Oct28.git"
DEPLOY_DIR="$HOME/Elevate_Admin_Frontend"
BACKUP_DIR="$HOME/Elevate_Admin_Frontend_backup_$(date +%Y%m%d_%H%M%S)"
OLD_DIR="$HOME/Elevate_Admin_Frontend_S26"

echo -e "${GREEN}Starting deployment process...${NC}"

# Step 1: Backup existing deployment if it exists
if [ -d "$DEPLOY_DIR" ]; then
    echo -e "${YELLOW}Backing up existing deployment...${NC}"
    cp -r "$DEPLOY_DIR" "$BACKUP_DIR"
    echo -e "${GREEN}Backup created at: $BACKUP_DIR${NC}"
fi

# Step 2: Clone or update repository
if [ -d "$DEPLOY_DIR" ]; then
    echo -e "${YELLOW}Updating existing repository...${NC}"
    cd "$DEPLOY_DIR"
    git fetch origin
    git reset --hard origin/main
    git clean -fd
else
    echo -e "${YELLOW}Cloning repository...${NC}"
    git clone "$REPO_URL" "$DEPLOY_DIR"
    cd "$DEPLOY_DIR"
fi

# Step 3: Navigate to frontend directory
if [ ! -d "frontend" ]; then
    echo -e "${RED}Error: frontend directory not found in repository${NC}"
    exit 1
fi

cd frontend

# Step 4: Check for .env file
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file from template...${NC}"
    cat > .env << EOF
# API Configuration
VITE_API_URL=http://172.234.201.117:5000/api
EOF
    echo -e "${GREEN}Created .env with API URL: http://172.234.201.117:5000/api${NC}"
fi

# Step 5: Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

# Step 6: Build the application
echo -e "${YELLOW}Building application...${NC}"
npm run build

# Step 7: Check if build was successful
if [ ! -d "dist" ]; then
    echo -e "${RED}Error: Build failed - dist directory not found${NC}"
    exit 1
fi

echo -e "${GREEN}Build completed successfully!${NC}"
echo -e "${GREEN}Build output is in: $DEPLOY_DIR/frontend/dist${NC}"

# Step 8: Display next steps
echo -e "\n${YELLOW}=== Next Steps ===${NC}"
echo -e "1. Update .env file if needed: $DEPLOY_DIR/frontend/.env"
echo -e "2. Configure nginx to serve from: $DEPLOY_DIR/frontend/dist"
echo -e "3. Restart nginx: sudo systemctl restart nginx"
echo -e "4. Test the application"

echo -e "\n${GREEN}Deployment script completed!${NC}"

