#!/bin/bash

# Quick Push Script for MacBook
# This script quickly commits and pushes your changes to GitHub
# Run this after making changes on your MacBook

echo "🚀 Quick Push to GitHub"
echo ""

# Check if there are any changes to commit
if git diff-index --quiet HEAD --; then
    echo "✅ No changes to commit"
    echo "💡 Make some changes first, then run this script again"
    exit 0
fi

# Show what files have changed
echo "📝 Files changed:"
git status --porcelain | sed 's/^/  /'
echo ""

# Ask for commit message
echo "💬 Enter a commit message (or press Enter for default):"
read -r commit_message

# Use default message if none provided
if [ -z "$commit_message" ]; then
    commit_message="Update: $(date '+%Y-%m-%d %H:%M:%S')"
fi

# Add all changes
echo "📦 Adding changes..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "$commit_message"

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Successfully pushed to GitHub!"
echo "🖥️  Your desktop PC will automatically pull these changes"
echo "🌐 Your app will be updated on the server shortly"
echo ""
echo "📊 Latest commit: $(git log -1 --oneline)"
