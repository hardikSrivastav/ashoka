#!/bin/bash

echo "🚀 Starting FC Tinder deployment..."

# Get current user and directory
CURRENT_USER=$(whoami)
CURRENT_DIR=$(pwd)
echo "👤 Current user: $CURRENT_USER"
echo "📁 Current directory: $CURRENT_DIR"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "front" ]; then
  echo "❌ Error: Please run this script from the project root directory"
  exit 1
fi

# Build frontend
echo "📦 Building frontend..."
cd front
if ! npm install; then
  echo "❌ Frontend npm install failed"
  exit 1
fi
if ! npm run build; then
  echo "❌ Frontend build failed"
  exit 1
fi
cd ..

# Build backend
echo "🔧 Building backend..."
if ! npm install; then
  echo "❌ Backend npm install failed"
  exit 1
fi
if ! npm run build:backend; then
  echo "❌ Backend build failed"
  exit 1
fi

# Copy frontend build to backend directory
echo "📁 Copying frontend build..."
mkdir -p dist/front
cp -r front/dist/* dist/front/

# Set proper permissions
echo "🔐 Setting permissions..."
sudo chown -R $CURRENT_USER:$CURRENT_USER dist/
chmod +x dist/index.js

# Update service file with correct working directory and ensure port 80
echo "⚙️ Updating service file..."
sudo cp fc-tinder.service /etc/systemd/system/
sudo sed -i "s|WorkingDirectory=.*|WorkingDirectory=$CURRENT_DIR|" /etc/systemd/system/fc-tinder.service
sudo sed -i "s|ExecStart=.*|ExecStart=/usr/bin/node $CURRENT_DIR/dist/index.js|" /etc/systemd/system/fc-tinder.service
sudo sed -i "s|Environment=PORT=.*|Environment=PORT=80|" /etc/systemd/system/fc-tinder.service

# Install systemd service
echo "⚙️ Installing systemd service..."
sudo systemctl daemon-reload
sudo systemctl enable fc-tinder

# Stop service if running
echo "🛑 Stopping existing service..."
sudo systemctl stop fc-tinder

# Start service
echo "🔄 Starting service..."
sudo systemctl start fc-tinder

# Wait a moment for service to start
sleep 3

# Check status
echo "📊 Service status:"
sudo systemctl status fc-tinder --no-pager

# Check if service is running
if sudo systemctl is-active --quiet fc-tinder; then
  echo "✅ Service is running successfully!"
  echo "🌐 Your app should be available at: http://ashokafc.hardiksrivastava.com"
  echo "🔍 Check logs with: sudo journalctl -u fc-tinder -f"
else
  echo "❌ Service failed to start. Check logs with: sudo journalctl -u fc-tinder -n 50"
  exit 1
fi

echo "✅ Deployment complete!"
