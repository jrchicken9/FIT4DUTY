#!/bin/bash

# Expo Clean Script - Kills all Expo processes and starts a fresh one
echo "🧹 Cleaning up Expo processes..."

# Kill all expo processes
echo "🛑 Stopping all Expo processes..."
pkill -f "expo start" 2>/dev/null
pkill -f "npm exec expo" 2>/dev/null

# Wait a moment for processes to fully stop
sleep 2

# Check if any expo processes are still running
if pgrep -f "expo" > /dev/null; then
    echo "⚠️  Some Expo processes are still running. Force killing..."
    pkill -9 -f "expo" 2>/dev/null
fi

# Verify all processes are stopped
if pgrep -f "expo" > /dev/null; then
    echo "❌ Failed to stop all Expo processes"
    exit 1
else
    echo "✅ All Expo processes stopped"
fi

# Start fresh Expo server
echo "🚀 Starting fresh Expo development server..."
npx expo start --clear
