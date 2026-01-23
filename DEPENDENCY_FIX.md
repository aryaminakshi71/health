# Dependency Fix Guide

## Issue
`bun install` fails with:
```
error: No version matching "^0.4.0" found for specifier "@orpc/tanstack-query"
error: No version matching "^0.4.0" found for specifier "@orpc/client"
```

## ✅ Solution Applied

I've updated all `package.json` files to use `"latest"` instead of `"^0.4.0"`:

- ✅ `package.json` (root)
- ✅ `apps/web/package.json`  
- ✅ `apps/api/package.json`

## Try Installing Again

```bash
bun install
```

## If That Still Fails

### Option 1: Check Available Versions

```bash
# Check what versions exist
bun pm ls @orpc/client
bun pm ls @orpc/server  
bun pm ls @orpc/tanstack-query
```

### Option 2: Use Specific Version

If you find a working version (e.g., `0.3.0`), update package.json:

```json
{
  "@orpc/server": "0.3.0",
  "@orpc/client": "0.3.0",
  "@orpc/tanstack-query": "0.3.0"
}
```

### Option 3: Switch to tRPC (Recommended Alternative)

If oRPC packages don't exist or are unstable, we can switch to **tRPC** which is well-established:

**Benefits:**
- ✅ Mature and stable
- ✅ Excellent TypeScript support
- ✅ Great TanStack Query integration
- ✅ Active community

**To switch to tRPC, I can:**
1. Update all package.json files
2. Update API server code
3. Update frontend client code
4. Maintain the same type-safe architecture

Let me know if you'd like me to switch to tRPC!

## Current Status

- ✅ Package versions updated to "latest"
- ⏳ Waiting for `bun install` to complete
- ⏳ If it fails, we'll switch to tRPC
