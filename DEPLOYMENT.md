# Healthcare SaaS - Deployment Guide

## Quick Deploy

### 1. Prerequisites

- Bun 1.0+
- Node.js 18+
- PostgreSQL 14+
- Cloudflare account

### 2. Environment Setup

```bash
# Copy environment template
cp .env.production.example .env

# Edit with your values
nano .env
```

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - 32+ character secret key
- `ENCRYPTION_KEY` - 32-byte key for PHI encryption
- `SENTRY_DSN` - For error monitoring

### 3. Database Setup

```bash
# Run migrations
bun run db:migrate

# (Optional) Seed test data
bun run db:seed
```

### 4. Deploy

```bash
# Full deployment
bun run deploy

# Or step by step:
bun run db:migrate
bun test
bun run build
bun run cloudflare:deploy
```

## Cloudflare Workers Setup

### 1. Install Wrangler

```bash
npm install -g wrangler
```

### 2. Configure Wrangler

Create `wrangler.toml`:

```toml
name = "healthcare-api"
main = "apps/api/src/index.ts"
compatibility_date = "2024-01-01"

[vars]
NODE_ENV = "production"

# Enable necessary bindings
[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-namespace-id"

[[d1_databases]]
binding = "DATABASE"
database_name = "healthcare"
database_id = "your-database-id"
```

### 3. Deploy

```bash
bun run wrangler deploy
```

## Monitoring

### Sentry Setup

1. Create a Sentry project
2. Add `SENTRY_DSN` to environment
3. Deploy with release tagging

### Health Checks

```bash
# API health check
curl https://your-api.workers.dev/api/health

# GraphQL playground
https://your-api.workers.dev/api/graphql
```

## Rollback

```bash
# View deployments
wrangler deployments list

# Rollback to previous deployment
wrangler deployments revert <deployment-id>
```

## Troubleshooting

### Database Connection Issues

1. Verify `DATABASE_URL` format
2. Check firewall rules
3. Ensure SSL certificate is valid

### Authentication Errors

1. Verify `BETTER_AUTH_SECRET` is set
2. Check CORS origins in `CORS_ORIGIN`
3. Review session cookies

### Rate Limiting

If seeing 429 errors:
1. Check `RATE_LIMIT_MAX_REQUESTS`
2. Consider increasing limits for API routes
3. Implement client-side rate limiting
