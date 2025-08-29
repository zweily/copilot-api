#!/bin/bash
# copilot-api installation script for Linux/Mac

set -e

echo "🚀 Installing copilot-api v0.6.1..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    echo "Please install Node.js from https://nodejs.org/ and try again."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not installed."
    echo "Please install npm and try again."
    exit 1
fi

echo "📦 Installing copilot-api globally via npm..."
npm install -g copilot-api@0.6.1

echo "✅ Installation complete!"
echo ""
echo "🎉 You can now use copilot-api with the following commands:"
echo ""
echo "  • copilot-api auth --help"
echo "  • copilot-api start --help"
echo ""
echo "🔗 For proxy support:"
echo "  • copilot-api auth --proxy-url socks5://127.0.0.1:1080"
echo ""
echo "🎯 For Claude Code integration:"
echo "  • copilot-api start --claude-code"
echo ""
echo "📚 Documentation: https://github.com/zweily/copilot-api"
