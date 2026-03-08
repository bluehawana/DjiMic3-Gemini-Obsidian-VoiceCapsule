#!/bin/bash
# Activate Voice Capsule Dashboard
# This script replaces the simple UI with the full dashboard

set -e

echo "🚀 Activating Voice Capsule Dashboard..."

# Check if running on VPS
if [ ! -d "/opt/DjiMic3-Gemini-Obsidian-VoiceCapsule" ]; then
    echo "❌ Error: Not running on VPS. Run this script on your server."
    exit 1
fi

cd /opt/DjiMic3-Gemini-Obsidian-VoiceCapsule/web-app

# Backup current index.html
echo "📦 Backing up current index.html..."
if [ -f "static/index.html" ]; then
    cp static/index.html static/index.html.backup
    echo "✅ Backup created: static/index.html.backup"
fi

# Replace with dashboard
echo "🔄 Activating dashboard..."
cp static/dashboard.html static/index.html

# Install boto3 for R2 support
echo "📦 Installing R2 dependencies..."
source venv/bin/activate
pip install boto3

# Restart service
echo "🔄 Restarting Voice Capsule service..."
sudo systemctl restart voice-capsule

# Wait for service to start
sleep 3

# Check status
if systemctl is-active --quiet voice-capsule; then
    echo "✅ Dashboard activated successfully!"
    echo ""
    echo "🌐 Access your dashboard at:"
    echo "   http://mic3.bluehawana.com/dashboard"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Configure R2 storage (optional) - see DASHBOARD.md"
    echo "   2. Upload your first recording"
    echo "   3. Explore the mind map view"
    echo ""
    echo "💡 To revert to simple UI:"
    echo "   cp static/index.html.backup static/index.html"
    echo "   sudo systemctl restart voice-capsule"
else
    echo "❌ Service failed to start. Check logs:"
    echo "   sudo journalctl -u voice-capsule -n 50"
    exit 1
fi
