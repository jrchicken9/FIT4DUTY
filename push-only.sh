#!/bin/bash

# Push-Only Script - Only pushes to GitHub without pulling updates
echo "🚀 Push-Only Mode - Only sending changes to GitHub"

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

# Force push to GitHub (overwrites remote with local changes)
echo "⬆️  Force pushing to GitHub (overwrites remote changes)..."
git push origin main --force

echo "✅ Push complete! Your local changes are now on GitHub."
echo "⚠️  Note: This overwrote any remote changes. Use with caution!"
