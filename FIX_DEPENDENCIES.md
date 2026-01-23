# Fixing Dependency Issues

## Issue: oRPC Package Versions

The error shows that `@orpc/client@^0.4.0` and `@orpc/tanstack-query@^0.4.0` don't exist.

## Solution

I've updated all `package.json` files to use `"latest"` instead of `"^0.4.0"` for oRPC packages.

### Updated Files:
- ✅ `package.json` (root)
- ✅ `apps/web/package.json`
- ✅ `apps/api/package.json`

## Next Steps

1. **Try installing again:**
   ```bash
   bun install
   ```

2. **If that doesn't work, try with specific versions:**
   ```bash
   # Check what versions are available
   bun pm ls @orpc/client
   bun pm ls @orpc/server
   bun pm ls @orpc/tanstack-query
   ```

3. **Alternative: Use npm to check versions:**
   ```bash
   npm view @orpc/client versions
   npm view @orpc/server versions
   npm view @orpc/tanstack-query versions
   ```

4. **If oRPC packages don't exist, we may need to:**
   - Use an alternative type-safe RPC solution
   - Or set up oRPC manually if it's a new/unpublished package

## Alternative: Use tRPC Instead

If oRPC isn't available, we can switch to **tRPC** which is a well-established type-safe RPC solution:

```json
{
  "@trpc/server": "^10.0.0",
  "@trpc/client": "^10.0.0",
  "@trpc/react-query": "^10.0.0"
}
```

Let me know if you'd like me to switch to tRPC or if you have the correct oRPC package versions.
