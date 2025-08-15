#!/bin/bash

echo "🚀 Starting FC Tinder deployment..."

# Get current user and directory
CURRENT_USER=$(whoami)
CURRENT_DIR=$(pwd)
echo "👤 Current user: $CURRENT_USER"
echo "📁 Current directory: $CURRENT_DIR"

# Build frontend
echo "📦 Building frontend..."
cd front
npm install
npm run build
cd ..

# Build backend
echo "🔧 Building backend..."
npm install
npm run build:backend

# Copy frontend build to backend directory
echo "📁 Copying frontend build..."
mkdir -p dist/front
cp -r front/dist/* dist/front/

# Set proper permissions
echo "🔐 Setting permissions..."
sudo chown -R $CURRENT_USER:$CURRENT_USER dist/
chmod +x dist/index.js

# Update service file with correct working directory
echo "⚙️ Updating service file..."
sed -i "s|WorkingDirectory=.*|WorkingDirectory=$CURRENT_DIR|" fc-tinder.service

# Install systemd service
echo "⚙️ Installing systemd service..."
sudo cp fc-tinder.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable fc-tinder

# Restart service
echo "🔄 Restarting service..."
sudo systemctl restart fc-tinder

# Check status
echo "📊 Service status:"
sudo systemctl status fc-tinder --no-pager

echo "✅ Deployment complete!"
echo "🌐 Your app should be available at: http://ashokafc.hardiksrivastava.com"
