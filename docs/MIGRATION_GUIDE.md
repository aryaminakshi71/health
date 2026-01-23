# Frontend Migration Guide

## Quick Start: Using Shared UI Package

### Step 1: Install Shared UI in Legacy Apps

The shared UI package is already added to `package.json` files. Install dependencies:

```bash
# Install all workspace dependencies
bun install

# Or install in specific app
cd healthcare-hub/frontend && npm install
cd ../../hospital-ehr/frontend && npm install
```

### Step 2: Import Shared Components

Replace local components with shared ones:

**Before:**
```typescript
import { Button } from '@/components/ui/button';
```

**After:**
```typescript
import { Button } from '@healthcare-saas/ui';
```

### Step 3: Update Component Usage

Shared components have the same API, so minimal changes needed:

```typescript
// Works the same way
<Button variant="primary" onClick={handleClick}>
  Click me
</Button>
```

---

## Migration Examples

### Example 1: Migrating a Button Component

**Original (healthcare-hub):**
```typescript
// components/ui/button.tsx (local)
import { Button } from '@/components/ui/button';
```

**Migrated:**
```typescript
// Use shared package
import { Button } from '@healthcare-saas/ui';
```

### Example 2: Migrating a Form Component

**Original:**
```typescript
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
```

**Migrated:**
```typescript
import { Button, Input } from '@healthcare-saas/ui';
```

### Example 3: Gradual Migration with Re-export

Create a bridge file for gradual migration:

```typescript
// components/shared/index.ts
export { Button, Input, Modal, Table } from '@healthcare-saas/ui';

// Use in components
import { Button } from '@/components/shared';
```

---

## Feature Migration Process

### Using the Migration Script

```bash
# Migrate a specific feature
./scripts/migrate-feature.sh <feature-name> <source-app>

# Example: Migrate dashboard from healthcare-hub
./scripts/migrate-feature.sh dashboard healthcare-hub/frontend
```

### Manual Migration Steps

1. **Identify Feature Components**
   ```bash
   # Find all files related to a feature
   find healthcare-hub/frontend -name "*dashboard*" -type f
   ```

2. **Copy to Unified Frontend**
   ```bash
   # Create target directory
   mkdir -p apps/web/src/routes/dashboard
   
   # Copy files
   cp healthcare-hub/frontend/app/dashboard/page.tsx apps/web/src/routes/dashboard/
   ```

3. **Update Imports**
   - Replace local UI imports with `@healthcare-saas/ui`
   - Update API calls to use oRPC client
   - Update routing to TanStack Router

4. **Test**
   - Verify component renders
   - Test functionality
   - Check API integration

---

## API Migration

### From Axios/Fetch to oRPC

**Before (healthcare-hub):**
```typescript
import axios from 'axios';

const response = await axios.get('/api/patients');
const patients = response.data;
```

**After (unified frontend):**
```typescript
import { orpc } from '@/lib/api';

const { data: patients } = useQuery(
  orpc.patients.list({ limit: 50 })
);
```

---

## Testing Integration

### Run Integration Tests

```bash
./scripts/test-integration.sh
```

### Manual Testing Checklist

- [ ] Shared UI package installs correctly
- [ ] Components render in legacy apps
- [ ] Unified frontend loads
- [ ] API server responds
- [ ] No import errors
- [ ] Styling works correctly

---

## Common Issues & Solutions

### Issue: Module not found

**Solution:**
```bash
# Reinstall dependencies
bun install
cd healthcare-hub/frontend && npm install
```

### Issue: Type errors

**Solution:**
- Ensure TypeScript paths are configured
- Check `tsconfig.json` includes shared package
- Restart TypeScript server

### Issue: Styling differences

**Solution:**
- Shared components use Tailwind CSS
- Ensure Tailwind is configured in legacy apps
- Check for CSS conflicts

---

## Migration Priority

1. **High Priority** (Week 1-2)
   - Shared UI components (Button, Input, Modal)
   - Common layouts
   - Navigation components

2. **Medium Priority** (Week 3-4)
   - Dashboard features
   - Patient management
   - Appointment scheduling

3. **Low Priority** (Week 5-6)
   - Specialized features
   - Analytics components
   - Reports

---

## Next Steps

1. ✅ Install shared UI package
2. 🔄 Start replacing components one by one
3. 🔄 Migrate features gradually
4. 🔄 Test after each migration
5. 🔄 Update documentation

---

## Resources

- [Integration Strategy](./FRONTEND_INTEGRATION_STRATEGY.md)
- [Project Structure](../PROJECT_STRUCTURE.md)
- [Shared UI Package](../packages/ui/)
