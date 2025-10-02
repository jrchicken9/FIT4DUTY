#!/usr/bin/env bash
set -euo pipefail

# Timestamp
TS="$(date +%Y%m%d_%H%M%S)"
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKUPS_DIR="$ROOT_DIR/backups"

mkdir -p "$BACKUPS_DIR"

# Optional: capture env file if present (without failing if missing)
if [ -f "$ROOT_DIR/.env" ]; then
  cp "$ROOT_DIR/.env" "$BACKUPS_DIR/.env.$TS.backup"
fi

# Create a zip archive of the project excluding heavy/volatile folders
ZIP_NAME="app_backup_$TS.zip"
cd "$ROOT_DIR"

# Note: -x patterns are relative to the current directory
zip -r "$BACKUPS_DIR/$ZIP_NAME" . \
  -x "node_modules/*" \
  -x "backups/*" \
  -x ".git/*" \
  -x ".expo/*" \
  -x "*.log" \
  -x "ios/build/*" \
  -x "android/app/build/*"

echo "Backup created: $BACKUPS_DIR/$ZIP_NAME"

