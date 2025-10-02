#!/bin/bash

# Quick GitHub Update Script
echo "🚀 Starting GitHub update process..."

# Check for changes
if [[ -z $(git status --porcelain) ]]; then
    echo "✅ No changes to commit"
    exit 0
fi

# Show what files changed
echo "📝 Files changed:"
git status --short

# Get commit message from user
echo ""
read -p "💬 Enter commit message: " commit_message

# Add all changes
echo "📦 Adding files..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "$commit_message"

# Push to GitHub (force push to overwrite remote changes)
echo "⬆️  Force pushing to GitHub (overwrites remote changes)..."
git push origin main --force

echo "✅ Update complete! Your changes are now on GitHub."
echo "⚠️  Note: This overwrote any remote changes. Use with caution!"
