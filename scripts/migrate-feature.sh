#!/bin/bash

# Feature Migration Helper Script
# Helps migrate features from legacy apps to unified frontend

set -e

FEATURE_NAME=$1
SOURCE_APP=$2
TARGET_APP="apps/web"

if [ -z "$FEATURE_NAME" ] || [ -z "$SOURCE_APP" ]; then
  echo "Usage: ./scripts/migrate-feature.sh <feature-name> <source-app>"
  echo "Example: ./scripts/migrate-feature.sh patient-dashboard healthcare-hub/frontend"
  exit 1
fi

echo "🚀 Migrating feature: $FEATURE_NAME from $SOURCE_APP to $TARGET_APP"

# Create feature directory in target app
FEATURE_DIR="$TARGET_APP/src/routes/$FEATURE_NAME"
mkdir -p "$FEATURE_DIR"

echo "✅ Created feature directory: $FEATURE_DIR"

# Find source files
SOURCE_FILES=$(find "$SOURCE_APP" -type f \( -name "*.tsx" -o -name "*.ts" \) | grep -i "$FEATURE_NAME" || true)

if [ -z "$SOURCE_FILES" ]; then
  echo "⚠️  No source files found for feature: $FEATURE_NAME"
  exit 1
fi

echo "📁 Found source files:"
echo "$SOURCE_FILES"

echo ""
echo "📝 Next steps:"
echo "1. Copy relevant files to $FEATURE_DIR"
echo "2. Update imports to use @healthcare-saas/ui"
echo "3. Update API calls to use oRPC"
echo "4. Test the migrated feature"
echo "5. Update navigation/routing"
