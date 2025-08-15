#!/bin/bash

echo "🏥 Health Check for FC Tinder..."

# Check if service is running
echo "📊 Checking service status..."
sudo systemctl is-active fc-tinder

# Check if port 80 is listening
echo "🔌 Checking if port 80 is listening..."
sudo netstat -tlnp | grep :80

# Test the application
echo "🌐 Testing application..."
curl -s -o /dev/null -w "%{http_code}" http://localhost/api/health

echo ""
echo "✅ Health check complete!"
