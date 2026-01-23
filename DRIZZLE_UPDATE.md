# ✅ Updated Drizzle Kit

## Changes Made

1. **Updated drizzle-kit version**: `^0.20.0` → `^0.31.8` (matches AssetLayer)
2. **Kept commands as-is**: `drizzle-kit generate` (newer version supports this)

## Updated Files
- ✅ `packages/storage/package.json` - Updated drizzle-kit version

## Next Steps

1. **Reinstall dependencies:**
   ```bash
   bun install
   ```

2. **Try generating migrations:**
   ```bash
   bun run db:generate
   ```

The newer version (0.31.8) should support the `generate` command without the `:pg` suffix.
