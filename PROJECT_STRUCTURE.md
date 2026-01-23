# Project Structure

This document describes the organized structure of the Healthcare Management System.

## 📁 Directory Structure

```
health/
├── apps/                          # Applications
│   ├── api/                       # Backend API (oRPC server)
│   │   ├── src/
│   │   │   ├── index.ts           # API server entry point
│   │   │   ├── procedures.ts     # oRPC middleware (pub, authed, orgAuthed)
│   │   │   └── routers/          # API route handlers
│   │   │       ├── index.ts      # Router composition
│   │   │       ├── patients.ts   # Patient management
│   │   │       ├── appointments.ts
│   │   │       ├── ehr.ts        # Electronic Health Records
│   │   │       ├── prescriptions.ts
│   │   │       ├── billing-healthcare.ts
│   │   │       ├── lab.ts
│   │   │       ├── pharmacy.ts
│   │   │       ├── compliance.ts
│   │   │       ├── claims.ts
│   │   │       ├── telemedicine.ts
│   │   │       └── analytics.ts
│   │   ├── tests/                 # API tests
│   │   │   ├── setup.ts
│   │   │   ├── patients.test.ts
│   │   │   ├── appointments.test.ts
│   │   │   ├── ehr.test.ts
│   │   │   ├── prescriptions.test.ts
│   │   │   ├── compliance.test.ts
│   │   │   ├── integration.test.ts
│   │   │   ├── hl7.test.ts
│   │   │   ├── edi.test.ts
│   │   │   └── rxnorm.test.ts
│   │   └── package.json
│   │
│   └── web/                       # Frontend (TanStack Start)
│       ├── src/
│       │   ├── app.tsx           # App root
│       │   ├── lib/
│       │   │   └── api.ts        # oRPC client setup
│       │   ├── components/       # React components
│       │   │   ├── ui/           # Reusable UI components
│       │   │   │   ├── button.tsx
│       │   │   │   ├── input.tsx
│       │   │   │   ├── modal.tsx
│       │   │   │   ├── data-table.tsx
│       │   │   │   ├── select.tsx
│       │   │   │   └── textarea.tsx
│       │   │   ├── patients/     # Patient components
│       │   │   ├── appointments/
│       │   │   ├── ehr/         # EHR components
│       │   │   ├── prescriptions/
│       │   │   ├── billing/
│       │   │   ├── lab/
│       │   │   ├── telemedicine/
│       │   │   ├── analytics/
│       │   │   └── charts/
│       │   └── routes/          # File-based routing
│       │       ├── __root.tsx
│       │       ├── index.tsx     # Dashboard
│       │       ├── patients/
│       │       ├── appointments/
│       │       ├── billing/
│       │       ├── lab/
│       │       ├── analytics/
│       │       └── compliance/
│       ├── app.config.ts
│       └── package.json
│
├── packages/                      # Shared packages
│   ├── core/                      # Core business logic
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   │   └── better-auth.ts
│   │   │   ├── integrations/     # External API integrations
│   │   │   │   ├── hl7.ts
│   │   │   │   ├── edi.ts
│   │   │   │   ├── rxnorm.ts
│   │   │   │   ├── drugbank.ts
│   │   │   │   ├── drug-interactions.ts
│   │   │   │   └── telemedicine.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── storage/                   # Database layer
│       ├── src/
│       │   └── db/
│       │       └── schema/        # Drizzle schemas
│       │           ├── index.ts
│       │           ├── auth.schema.ts
│       │           ├── billing.schema.ts
│       │           └── healthcare/ # Healthcare schemas
│       │               ├── index.ts
│       │               ├── patients.schema.ts
│       │               ├── appointments.schema.ts
│       │               ├── ehr.schema.ts
│       │               ├── prescriptions.schema.ts
│       │               ├── billing.schema.ts
│       │               ├── lab.schema.ts
│       │               ├── pharmacy.schema.ts
│       │               └── compliance.schema.ts
│       ├── drizzle.config.ts
│       └── package.json
│
├── docs/                          # Documentation
│   ├── HEALTHCARE_ARCHITECTURE.md
│   ├── COMPLETE_FEATURE_LIST.md
│   ├── FINAL_IMPLEMENTATION.md
│   └── ...
│
├── scripts/                       # Utility scripts
│   └── setup.sh
│
├── .github/                       # CI/CD
│   └── workflows/
│       └── ci.yml
│
├── docker-compose.yml             # Docker setup
├── Dockerfile.api
├── Dockerfile.web
├── nginx.conf
├── package.json                   # Root package.json (workspaces)
├── tsconfig.json                  # TypeScript config
├── .gitignore
└── README.md
```

## 📦 Package Organization

### Workspace Packages

1. **@healthcare-saas/api** (`apps/api`)
   - Backend API server
   - oRPC router definitions
   - API endpoints and handlers

2. **@healthcare-saas/web** (`apps/web`)
   - Frontend application
   - TanStack Start with SSR
   - React components and routes

3. **@healthcare-saas/core** (`packages/core`)
   - Shared business logic
   - Authentication
   - External integrations (HL7, EDI, RxNorm, etc.)

4. **@healthcare-saas/storage** (`packages/storage`)
   - Database schemas (Drizzle ORM)
   - Database migrations
   - Storage utilities

## 🔗 Import Paths

All packages use the `@healthcare-saas/*` namespace:

```typescript
// In API
import * as schema from '@healthcare-saas/storage/db/schema';
import { auth } from '@healthcare-saas/core/auth/better-auth';

// In Web
import type { AppRouter } from '@healthcare-saas/api';
```

## 🧪 Testing Structure

- **Unit Tests**: `apps/api/tests/*.test.ts`
- **Integration Tests**: `apps/api/tests/integration.test.ts`
- **Test Setup**: `apps/api/tests/setup.ts`

## 📊 Code Coverage

The project is organized for optimal code coverage:

- **API Routes**: All routers have corresponding test files
- **Components**: Frontend components are organized by feature
- **Schemas**: Database schemas are grouped by domain
- **Integrations**: External integrations are isolated in `packages/core`

## 🚀 Running the Application

```bash
# Install dependencies
bun install

# Run development servers
bun run dev          # Runs both API and web
bun run dev:api     # API only (port 3001)
bun run dev:web     # Web only (port 3000)

# Build for production
bun run build

# Run tests
bun run test
bun run test:coverage
```

## 📝 Notes

- All files are in the root `health/` directory (no `saas-starter` subfolder)
- Package references use `@healthcare-saas/*` namespace
- TypeScript paths are configured in `tsconfig.json`
- Workspaces are managed via root `package.json`
