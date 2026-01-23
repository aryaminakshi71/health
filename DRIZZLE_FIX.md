# ✅ Fixed Drizzle Kit Commands

## Issue
```
error: unknown command 'generate'
(Did you mean generate:pg?)
```

## Solution
Updated drizzle-kit commands to use the PostgreSQL-specific versions:

- `drizzle-kit generate` → `drizzle-kit generate:pg`
- `drizzle-kit push` → `drizzle-kit push:pg`

## Updated Files
- ✅ `packages/storage/package.json` - Updated scripts

## Try Again

```bash
bun run db:generate
```

This should work now!
