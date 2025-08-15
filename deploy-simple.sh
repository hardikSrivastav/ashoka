#!/bin/bash

echo "🚀 FC Tinder - Simple Deployment"
echo "=================================="

# Make sure we're in the right directory
if [ ! -f "deploy.sh" ]; then
  echo "❌ Please run this from the project root directory"
  exit 1
fi

# Make deploy.sh executable
chmod +x deploy.sh

# Run the deployment
./deploy.sh

echo ""
echo "🎉 If everything worked, your app should be running at:"
echo "   http://ashokafc.hardiksrivastava.com"
echo ""
echo "📋 Useful commands:"
echo "   Check status: sudo systemctl status fc-tinder"
echo "   View logs: sudo journalctl -u fc-tinder -f"
echo "   Restart: sudo systemctl restart fc-tinder"
echo "   Stop: sudo systemctl stop fc-tinder"
