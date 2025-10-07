#!/bin/bash

echo "🚀 Setting up Job Portal Backend for Local Development..."
echo

echo "📋 Copying environment configuration..."
cp env.local .env
if [ $? -ne 0 ]; then
    echo "❌ Failed to copy environment file"
    exit 1
fi

echo "✅ Environment configuration copied successfully"
echo

echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo

echo "🎯 Local development setup complete!"
echo
echo "💡 Available commands:"
echo "   npm run start:local    - Start local development server"
echo "   npm run start:dev      - Start with development environment"
echo "   npm run dev            - Start with auto-reload (requires nodemon)"
echo
echo "🌐 Your backend will be available at: http://localhost:5000"
echo "📋 API endpoints will be at: http://localhost:5000/api"
echo
echo "🚀 Starting local development server..."
echo
npm run start:local
