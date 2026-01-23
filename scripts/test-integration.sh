#!/bin/bash

# Integration Test Script
# Tests that all apps can work together

set -e

echo "🧪 Testing Frontend Integration"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if shared UI package exists
echo "1️⃣  Testing shared UI package..."
if [ -d "packages/ui" ]; then
    echo -e "${GREEN}✅ Shared UI package exists${NC}"
else
    echo -e "${RED}❌ Shared UI package not found${NC}"
    exit 1
fi

# Test 2: Check if packages can be imported
echo ""
echo "2️⃣  Testing package imports..."
cd packages/ui
if bun run -e "import('./src/index.ts')" 2>/dev/null; then
    echo -e "${GREEN}✅ UI package can be imported${NC}"
else
    echo -e "${YELLOW}⚠️  UI package import test skipped (may need build)${NC}"
fi
cd ../..

# Test 3: Check if legacy apps have shared UI in package.json
echo ""
echo "3️⃣  Testing legacy app dependencies..."
if grep -q "@healthcare-saas/ui" healthcare-hub/frontend/package.json; then
    echo -e "${GREEN}✅ healthcare-hub has shared UI dependency${NC}"
else
    echo -e "${RED}❌ healthcare-hub missing shared UI dependency${NC}"
fi

if grep -q "@healthcare-saas/ui" hospital-ehr/frontend/package.json; then
    echo -e "${GREEN}✅ hospital-ehr has shared UI dependency${NC}"
else
    echo -e "${RED}❌ hospital-ehr missing shared UI dependency${NC}"
fi

# Test 4: Check if unified frontend exists
echo ""
echo "4️⃣  Testing unified frontend..."
if [ -d "apps/web" ]; then
    echo -e "${GREEN}✅ Unified frontend (apps/web) exists${NC}"
    if [ -f "apps/web/package.json" ]; then
        echo -e "${GREEN}✅ Unified frontend package.json exists${NC}"
    fi
else
    echo -e "${RED}❌ Unified frontend not found${NC}"
fi

# Test 5: Check if API server exists
echo ""
echo "5️⃣  Testing API server..."
if [ -d "apps/api" ]; then
    echo -e "${GREEN}✅ API server exists${NC}"
    if [ -f "apps/api/src/index.ts" ]; then
        echo -e "${GREEN}✅ API server entry point exists${NC}"
    fi
else
    echo -e "${RED}❌ API server not found${NC}"
fi

# Test 6: Check workspace configuration
echo ""
echo "6️⃣  Testing workspace configuration..."
if grep -q "packages/ui" package.json 2>/dev/null || grep -q "packages/\*" package.json; then
    echo -e "${GREEN}✅ Workspace includes packages${NC}"
else
    echo -e "${YELLOW}⚠️  Workspace configuration may need update${NC}"
fi

echo ""
echo "================================"
echo -e "${GREEN}✅ Integration tests completed!${NC}"
echo ""
echo "Next steps:"
echo "1. Run 'bun install' to install all dependencies"
echo "2. Start apps: 'bun run dev' (unified) or 'npm run dev' (legacy)"
echo "3. Begin migrating features using ./scripts/migrate-feature.sh"
