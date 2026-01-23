# Quick Start: Frontend Integration

## ✅ What's Been Done

1. **Shared UI Package Created** (`packages/ui/`)
   - Button, Input, Modal, Table components
   - Ready to use across all apps

2. **Legacy Apps Updated**
   - Added `@healthcare-saas/ui` dependency
   - Created bridge files for easy migration
   - Updated TypeScript configs

3. **Migration Tools Created**
   - `scripts/migrate-feature.sh` - Feature migration helper
   - `scripts/test-integration.sh` - Integration testing
   - `scripts/migrate-dashboard.sh` - Dashboard migration example

4. **Example Migration**
   - Created `/healthcare-hub-dashboard` route in unified frontend
   - Demonstrates integration pattern

---

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
# Install workspace dependencies (may need to run manually due to permissions)
cd /Users/aryaminakshi/Developer/health
bun install

# For legacy apps (if using npm)
cd healthcare-hub/frontend && npm install
cd ../../hospital-ehr/frontend && npm install
```

### Step 2: Test Integration

```bash
# Run integration tests
./scripts/test-integration.sh
```

### Step 3: Start Using Shared UI

**In healthcare-hub/frontend:**
```typescript
// Option 1: Direct import
import { Button } from '@healthcare-saas/ui';

// Option 2: Via bridge (easier migration)
import { Button } from '@/components/shared';
```

**In hospital-ehr/frontend:**
```typescript
// Option 1: Direct import
import { Button } from '@healthcare-saas/ui';

// Option 2: Via bridge
import { Button } from '@/components/shared';
```

### Step 4: Start Apps

```bash
# Unified frontend + API
bun run dev

# Or run legacy apps separately
cd healthcare-hub/frontend && npm run dev  # Port 3001
cd hospital-ehr/frontend && npm run dev   # Port 3000 (default)
```

---

## 📝 Migration Example

### Before (healthcare-hub):
```typescript
import { Button } from '@/components/ui/Button';
```

### After (using shared UI):
```typescript
import { Button } from '@healthcare-saas/ui';
// or
import { Button } from '@/components/shared';
```

The component API is the same, so minimal code changes needed!

---

## 🔄 Next Steps

1. **Replace Components Gradually**
   - Start with most-used components (Button, Input)
   - Test after each replacement
   - Move to less-used components

2. **Migrate Features**
   - Use `./scripts/migrate-feature.sh` to migrate features
   - Start with dashboard (easiest)
   - Then move to patient management, etc.

3. **Test Integration**
   - Run `./scripts/test-integration.sh` regularly
   - Test in both legacy and unified apps
   - Verify all features work

---

## 📚 Documentation

- [Integration Strategy](./FRONTEND_INTEGRATION_STRATEGY.md) - Full strategy
- [Migration Guide](./MIGRATION_GUIDE.md) - Detailed migration steps
- [Integration Status](../INTEGRATION_STATUS.md) - Current status

---

## ⚠️ Important Notes

- **Permissions**: You may need to run `bun install` manually due to sandbox restrictions
- **Legacy Apps**: Can continue running during migration
- **Gradual Migration**: Replace components one at a time
- **Testing**: Test thoroughly after each change

---

**Status**: ✅ Ready to begin migration!
