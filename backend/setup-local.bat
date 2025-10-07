@echo off
echo 🚀 Setting up Job Portal Backend for Local Development...
echo.

echo 📋 Copying environment configuration...
copy env.local .env
if %errorlevel% neq 0 (
    echo ❌ Failed to copy environment file
    pause
    exit /b 1
)

echo ✅ Environment configuration copied successfully
echo.

echo 📦 Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully
echo.

echo 🎯 Local development setup complete!
echo.
echo 💡 Available commands:
echo    npm run start:local    - Start local development server
echo    npm run start:dev      - Start with development environment
echo    npm run dev            - Start with auto-reload (requires nodemon)
echo.
echo 🌐 Your backend will be available at: http://localhost:5000
echo 📋 API endpoints will be at: http://localhost:5000/api
echo.
echo 🚀 Starting local development server...
echo.
npm run start:local

pause
