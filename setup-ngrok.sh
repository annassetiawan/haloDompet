#!/bin/bash

# HaloDompet - Ngrok Setup Script
# This script helps you install and configure ngrok for iPhone testing

set -e

echo "🚀 HaloDompet - Ngrok Setup"
echo "======================================"
echo ""

# Check if ngrok is already installed
if command -v ngrok &> /dev/null; then
    echo "✅ Ngrok already installed!"
    ngrok version
    echo ""
else
    echo "⚠️  Ngrok not found. Installing..."
    echo ""

    # Detect OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "📦 Installing ngrok for Linux..."
        curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
        echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
        sudo apt update && sudo apt install ngrok -y
        echo "✅ Ngrok installed via apt!"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "📦 Installing ngrok for macOS..."
        if command -v brew &> /dev/null; then
            brew install ngrok/ngrok/ngrok
            echo "✅ Ngrok installed via Homebrew!"
        else
            echo "❌ Homebrew not found. Install manually from https://ngrok.com/download"
            exit 1
        fi
    else
        echo "❌ Unsupported OS. Download manually from https://ngrok.com/download"
        exit 1
    fi
fi

echo ""
echo "======================================"
echo "📝 Next Steps:"
echo "======================================"
echo ""
echo "1. Sign up for free ngrok account:"
echo "   👉 https://dashboard.ngrok.com/signup"
echo ""
echo "2. Get your authtoken:"
echo "   👉 https://dashboard.ngrok.com/get-started/your-authtoken"
echo ""
echo "3. Authenticate ngrok (run this command):"
echo "   👉 ngrok authtoken YOUR_TOKEN_HERE"
echo ""
echo "4. Start dev server with ngrok:"
echo "   👉 npm run dev:ngrok"
echo ""
echo "5. Open ngrok URL on your iPhone Safari!"
echo ""
echo "======================================"
echo "📚 Documentation: NGROK_SETUP.md"
echo "======================================"
