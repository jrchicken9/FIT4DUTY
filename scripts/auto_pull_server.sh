#!/bin/bash

# Auto-Pull Server Script for Desktop PC
# This script continuously monitors GitHub and pulls updates
# Run this on your desktop PC to keep the server up to date

PROJECT_DIR="/path/to/your/project"  # Change this to your actual project path
GITHUB_REPO="https://github.com/jrchicken9/rork-fit4duty.git"
BRANCH="main"
CHECK_INTERVAL=30  # Check every 30 seconds

echo "🚀 Starting Auto-Pull Server Monitor..."
echo "📁 Project Directory: $PROJECT_DIR"
echo "🔗 GitHub Repo: $GITHUB_REPO"
echo "⏱️  Check Interval: $CHECK_INTERVAL seconds"
echo ""

cd "$PROJECT_DIR" || {
    echo "❌ Error: Could not navigate to project directory"
    exit 1
}

# Function to check for updates
check_for_updates() {
    echo "🔍 Checking for updates... ($(date))"
    
    # Fetch latest changes from GitHub
    git fetch origin $BRANCH
    
    # Check if local is behind remote
    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse origin/$BRANCH)
    
    if [ "$LOCAL" != "$REMOTE" ]; then
        echo "🔄 Updates found! Pulling latest changes..."
        
        # Stash any local changes (if any)
        git stash
        
        # Pull latest changes
        git pull origin $BRANCH
        
        # Install any new dependencies
        echo "📦 Installing dependencies..."
        npm install
        
        # Restart the Expo server
        echo "🔄 Restarting Expo server..."
        pkill -f "expo start"
        sleep 2
        
        # Start Expo server with tunnel
        echo "🚀 Starting Expo server with tunnel..."
        npx expo start --tunnel &
        
        echo "✅ Server updated and restarted!"
        echo "🌐 Your app is now live with latest changes"
        echo ""
    else
        echo "✅ No updates found"
    fi
}

# Function to start Expo server
start_expo_server() {
    echo "🚀 Starting Expo server with tunnel..."
    npx expo start --tunnel &
    echo "✅ Expo server started in background"
    echo "🌐 Your app is now accessible via tunnel"
    echo ""
}

# Function to handle script interruption
cleanup() {
    echo ""
    echo "🛑 Stopping auto-pull monitor..."
    pkill -f "expo start"
    echo "✅ Cleanup complete"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start the Expo server initially
start_expo_server

# Main loop - continuously check for updates
echo "🔄 Starting auto-pull loop..."
while true; do
    check_for_updates
    sleep $CHECK_INTERVAL
done
