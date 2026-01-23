# Setup Instructions

## ⚠️ Important: Manual Setup Required

Due to sandbox restrictions, please run these commands manually in your terminal.

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd /Users/aryaminakshi/Developer/health
bun install
```

This will install all dependencies for:
- `apps/api` (oRPC backend)
- `apps/web` (TanStack Start frontend)
- `packages/core` (Better Auth, integrations)
- `packages/storage` (Drizzle ORM)
- `packages/ui` (Shared UI components)

### 2. Configure Environment Variables

The `.env` file has been created with default values. **You must update it with your actual configuration:**

```bash
# Edit .env file
nano .env
# or
code .env
```

**Required Changes:**
1. **DATABASE_URL**: Update with your PostgreSQL connection string
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/healthcare
   ```

2. **BETTER_AUTH_SECRET**: Generate a secure random string (minimum 32 characters)
   ```bash
   # Generate a secure secret
   openssl rand -base64 32
   ```
   Then update in `.env`:
   ```env
   BETTER_AUTH_SECRET=<generated-secret>
   ```

3. **Database Setup**: Ensure PostgreSQL is running and create the database
   ```bash
   # If using local PostgreSQL
   createdb healthcare
   # Or use your PostgreSQL client to create the database
   ```

### 3. Set Up Database

```bash
# Generate Drizzle migrations
bun run db:generate

# Apply migrations to database
bun run db:push
```

**Note**: Make sure `DATABASE_URL` in `.env` is correct before running these commands.

### 4. Start Development Servers

```bash
# Start both frontend and backend
bun run dev
```

This will start:
- 🌐 **Frontend**: http://localhost:3000 (TanStack Start)
- 🔌 **Backend API**: http://localhost:3001 (oRPC Server)

Or start them separately:

```bash
# Terminal 1: Backend
bun run dev:api

# Terminal 2: Frontend
bun run dev:web
```

## 🎯 Verify Installation

### Check API Server
```bash
curl http://localhost:3001/health
```

### Check OpenAPI Spec
```bash
curl http://localhost:3001/openapi.json
```

### Check Frontend
Open http://localhost:3000 in your browser

## 🐛 Troubleshooting

### Issue: `bun install` fails
**Solution**: Make sure Bun is installed and up to date
```bash
curl -fsSL https://bun.sh/install | bash
```

### Issue: Database connection error
**Solution**: 
1. Verify PostgreSQL is running: `pg_isready`
2. Check `DATABASE_URL` format: `postgresql://user:password@host:port/database`
3. Ensure database exists: `createdb healthcare`

### Issue: Port already in use
**Solution**: Change ports in `.env`:
```env
PORT=3002  # For API
```
And in `apps/web/app.config.ts`:
```typescript
server: {
  port: 3001,  // For frontend
}
```

### Issue: `drizzle-kit` command not found
**Solution**: Dependencies not installed. Run `bun install` first.

### Issue: Better Auth errors
**Solution**: 
1. Ensure `BETTER_AUTH_SECRET` is set (min 32 characters)
2. Check `BETTER_AUTH_URL` matches your frontend URL
3. Verify database tables are created (run `bun run db:push`)

## 📚 Next Steps

Once setup is complete:

1. **Access the Application**
   - Frontend: http://localhost:3000
   - API: http://localhost:3001
   - OpenAPI Docs: http://localhost:3001/openapi.json

2. **Explore the Codebase**
   - Frontend routes: `apps/web/src/routes/`
   - API routers: `apps/api/src/routers/`
   - Database schemas: `packages/storage/src/db/schema/`

3. **Read Documentation**
   - [README.md](./README.md) - Project overview
   - [Architecture](./docs/ARCHITECTURE.md) - System architecture
   - [Modern Stack](./docs/MODERN_STACK.md) - Technology stack

## ✅ Setup Checklist

- [ ] Dependencies installed (`bun install`)
- [ ] `.env` file configured with actual values
- [ ] PostgreSQL database created
- [ ] Database migrations applied (`bun run db:push`)
- [ ] Development servers started (`bun run dev`)
- [ ] Frontend accessible at http://localhost:3000
- [ ] API accessible at http://localhost:3001

---

**Need Help?** Check the [Setup Guide](./docs/SETUP_GUIDE.md) for detailed instructions.
