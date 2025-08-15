#!/bin/bash

echo "🔧 Setting up FC Tinder server..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18 if not already installed
if ! command -v node &> /dev/null; then
    echo "📥 Installing Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PM2 for process management (alternative to systemd)
echo "📥 Installing PM2..."
sudo npm install -g pm2

# Create app directory if it doesn't exist
echo "📁 Setting up application directory..."
mkdir -p /home/ubuntu/fc_tinder

# Set proper permissions
echo "🔐 Setting permissions..."
sudo chown -R ubuntu:ubuntu /home/ubuntu/fc_tinder

echo "✅ Server setup complete!"
echo "📋 Next steps:"
echo "1. Upload your code to /home/ubuntu/fc_tinder"
echo "2. Run: chmod +x deploy.sh && ./deploy.sh"
