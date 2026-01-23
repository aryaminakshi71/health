# Deployment Guide

## 🚀 Production Deployment

This guide covers deploying the healthcare management system to production.

---

## Prerequisites

- Bun runtime installed
- PostgreSQL database (Neon, AWS RDS, or self-hosted)
- Domain name with SSL certificate
- Environment variables configured

---

## Deployment Options

### Option 1: Docker Deployment

#### Build and Run

```bash
# Build all services
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Environment Variables

Create a `.env` file:

```bash
cp .env.example .env
# Edit .env with your production values
```

#### Database Migrations

```bash
# Run migrations
docker-compose exec api bun run db:push
```

---

### Option 2: Cloudflare Workers (Edge Deployment)

#### Setup

1. Install Wrangler CLI:
```bash
bun add -g wrangler
```

2. Login to Cloudflare:
```bash
wrangler login
```

3. Deploy:
```bash
wrangler deploy
```

#### Configuration

Create `wrangler.toml`:

```toml
name = "healthcare-api"
main = "apps/api/src/index.ts"
compatibility_date = "2024-01-01"

[env.production]
vars = { DATABASE_URL = "your-neon-connection-string" }
```

---

### Option 3: AWS Deployment

#### Using AWS App Runner

1. Build Docker image
2. Push to ECR
3. Create App Runner service
4. Configure environment variables
5. Deploy

#### Using AWS Lambda (Serverless)

1. Package API as Lambda function
2. Configure API Gateway
3. Set up RDS or Aurora Serverless
4. Deploy with Serverless Framework

---

### Option 4: Vercel/Netlify (Frontend) + Railway (Backend)

#### Frontend (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Backend (Railway)

1. Connect GitHub repository
2. Railway auto-detects Bun
3. Set environment variables
4. Deploy

---

## Database Setup

### Neon (Recommended for Serverless)

1. Create Neon project
2. Get connection string
3. Set `DATABASE_URL` environment variable
4. Run migrations:
```bash
bun run db:push
```

### AWS RDS

1. Create PostgreSQL instance
2. Configure security groups
3. Set up connection string
4. Run migrations

### Self-Hosted PostgreSQL

1. Install PostgreSQL 16+
2. Create database and user
3. Configure firewall rules
4. Set connection string
5. Run migrations

---

## Environment Configuration

### Required Variables

```bash
# Database
DATABASE_URL=postgresql://...

# Authentication
BETTER_AUTH_SECRET=strong-random-secret
BETTER_AUTH_URL=https://yourdomain.com

# Site
VITE_PUBLIC_SITE_URL=https://yourdomain.com
VITE_API_URL=https://api.yourdomain.com
```

### Optional Variables

```bash
# Email
RESEND_API_KEY=...

# Storage
R2_BUCKET_NAME=...
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...

# External APIs
RXNORM_API_KEY=...
DRUGBANK_API_KEY=...
```

---

## Security Checklist

- [ ] Strong `BETTER_AUTH_SECRET` (32+ characters)
- [ ] SSL/TLS certificates configured
- [ ] Database connection encrypted
- [ ] Environment variables secured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Audit logging enabled
- [ ] Backup strategy in place
- [ ] Disaster recovery plan
- [ ] HIPAA compliance verified (if USA)
- [ ] GDPR compliance verified (if Europe)

---

## Monitoring & Logging

### Application Monitoring

- Set up error tracking (Sentry, Rollbar)
- Configure application logs
- Set up uptime monitoring
- Configure alerting

### Database Monitoring

- Monitor connection pool
- Track query performance
- Set up slow query alerts
- Monitor disk usage

### Compliance Monitoring

- Audit log retention (6 years for HIPAA)
- Access log monitoring
- Breach detection alerts
- Compliance report generation

---

## Backup Strategy

### Database Backups

```bash
# Automated daily backups
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup-20240101.sql
```

### File Backups

- Configure R2 lifecycle policies
- Set up automated backups
- Test restore procedures

---

## Scaling

### Horizontal Scaling

- Use load balancer
- Deploy multiple API instances
- Use connection pooling
- Configure database read replicas

### Vertical Scaling

- Increase database instance size
- Add more CPU/memory to API servers
- Optimize database queries
- Add caching layer (Redis)

---

## Performance Optimization

1. **Database Indexing**
   - Ensure all foreign keys indexed
   - Add indexes for frequent queries
   - Monitor query performance

2. **Caching**
   - Implement Redis for session storage
   - Cache frequently accessed data
   - Use CDN for static assets

3. **API Optimization**
   - Implement pagination
   - Use database query optimization
   - Minimize N+1 queries

---

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check connection string
   - Verify firewall rules
   - Check database status

2. **Authentication Issues**
   - Verify BETTER_AUTH_SECRET
   - Check session configuration
   - Verify cookie settings

3. **CORS Errors**
   - Check allowed origins
   - Verify API URL configuration
   - Check headers

---

## Support

For deployment issues, check:
- Application logs
- Database logs
- Network logs
- Error tracking service

---

**Last Updated:** 2024-01-XX
