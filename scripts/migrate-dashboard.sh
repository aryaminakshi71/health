#!/bin/bash

# Migrate Dashboard Feature from healthcare-hub to apps/web
# This is an example migration script

set -e

echo "🚀 Migrating Dashboard Feature"
echo "================================"
echo ""

SOURCE="healthcare-hub/frontend/app/dashboard"
TARGET="apps/web/src/routes/dashboard-legacy"

# Create target directory
mkdir -p "$TARGET"

echo "📁 Copying dashboard files..."
if [ -f "$SOURCE/page.tsx" ]; then
    cp "$SOURCE/page.tsx" "$TARGET/page.tsx"
    echo "✅ Copied page.tsx"
else
    echo "⚠️  Dashboard page not found"
fi

# Copy related components
if [ -d "healthcare-hub/frontend/components/analytics" ]; then
    mkdir -p "apps/web/src/components/analytics-legacy"
    cp -r healthcare-hub/frontend/components/analytics/* apps/web/src/components/analytics-legacy/ 2>/dev/null || true
    echo "✅ Copied analytics components"
fi

echo ""
echo "📝 Next steps:"
echo "1. Update imports in $TARGET/page.tsx"
echo "   - Replace local imports with @healthcare-saas/ui"
echo "   - Update API calls to use oRPC"
echo "2. Test the migrated dashboard"
echo "3. Update routing in apps/web"
echo ""
echo "✅ Migration files copied to $TARGET"
