# Quick Start Guide

## 🚀 Get Started in 4 Steps

### 1. Install Dependencies
```bash
bun install
```

### 2. Configure Environment
```bash
# Edit .env file with your database URL and secrets
nano .env
```

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Secure random string (min 32 chars)

### 3. Set Up Database
```bash
# Create database (if not exists)
createdb healthcare

# Generate and apply migrations
bun run db:generate
bun run db:push
```

### 4. Start Development
```bash
bun run dev
```

**Access:**
- Frontend: http://localhost:3000
- API: http://localhost:3001
- OpenAPI: http://localhost:3001/openapi.json

---

## 📝 Environment Variables

Create `.env` file:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/healthcare
BETTER_AUTH_SECRET=<generate-with-openssl-rand-base64-32>
BETTER_AUTH_URL=http://localhost:3000
PORT=3001
VITE_PUBLIC_API_URL=http://localhost:3001
```

---

## 🎯 That's It!

Your healthcare management system is now running with:
- ✅ TanStack Start frontend
- ✅ oRPC backend
- ✅ Better Auth authentication
- ✅ PostgreSQL database
- ✅ Type-safe end-to-end

---

For detailed setup, see [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)
