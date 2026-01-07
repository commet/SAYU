#!/bin/bash

echo "🚀 SAYU Deployment Script"
echo "========================"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI is not installed"
    echo "Install it from: https://docs.railway.app/develop/cli"
    exit 1
fi

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo "❌ Not logged in to Railway"
    echo "Run: railway login"
    exit 1
fi

echo "✅ Railway CLI is ready"

# Deploy backend
echo "📦 Deploying backend..."
cd backend
railway up --detach || echo "Backend deployment initiated"

# Wait a moment
sleep 5

# Deploy frontend
echo "🎨 Deploying frontend..."
cd ../frontend
railway up --detach || echo "Frontend deployment initiated"

echo ""
echo "🎉 Deployment initiated!"
echo ""
echo "Next steps:"
echo "1. Open Railway dashboard: https://railway.app/"
echo "2. Configure environment variables for both services"
echo "3. Set up database (PostgreSQL) and Redis if needed"
echo "4. Test your deployed application"
echo ""
echo "📋 Check DEPLOYMENT_COMMANDS.md for detailed instructions"