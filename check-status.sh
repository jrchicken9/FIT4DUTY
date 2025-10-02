#!/bin/bash

# Check Status Script - Shows current state without making changes
echo "📊 Git Status Check"

echo ""
echo "🔍 Local Changes:"
if [[ -z $(git status --porcelain) ]]; then
    echo "✅ No local changes"
else
    echo "📝 Local changes detected:"
    git status --short
fi

echo ""
echo "🌐 Remote Status:"
git fetch origin --quiet
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
    echo "✅ Local and remote are in sync"
else
    echo "⚠️  Local and remote are different:"
    echo "   Local:  $LOCAL"
    echo "   Remote: $REMOTE"
    echo ""
    echo "📈 Commits ahead: $(git rev-list --count origin/main..HEAD)"
    echo "📉 Commits behind: $(git rev-list --count HEAD..origin/main)"
fi

echo ""
echo "🎯 Current Branch: $(git branch --show-current)"
echo "📍 Remote URL: $(git remote get-url origin)"
