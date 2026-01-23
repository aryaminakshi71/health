# Healthcare Management System - Architecture

## 🏗️ System Architecture

This is a **unified, modern healthcare management system** built with cutting-edge technologies. All legacy Next.js applications have been removed and consolidated into a single, integrated application.

## 📐 Technology Stack

### Frontend
- **TanStack Start**: Full-stack React framework with SSR + client-side rendering
- **TanStack Router**: File-based routing with type safety
- **TanStack Query**: Server state management with oRPC integration
- **React 18**: Modern React with concurrent features

### Backend
- **oRPC**: Type-safe API layer with automatic OpenAPI spec generation
- **Better Auth**: Authentication and multi-organization management
- **Bun**: Fast runtime and package manager
- **PostgreSQL**: Primary database (via Neon serverless)

### Database & ORM
- **Drizzle ORM**: Type-safe database queries
- **PostgreSQL**: Relational database
- **Neon**: Serverless PostgreSQL hosting

### State Management
- **@orpc/tanstack-query**: Integrated state management with automatic caching
- **TanStack Query**: Client-side state management

## 🏛️ Architecture Principles

### 1. Single Unified Application
- **One Frontend**: `apps/web` (TanStack Start)
- **One Backend**: `apps/api` (oRPC server)
- **One Database**: PostgreSQL with Drizzle ORM
- **No Legacy Code**: All Next.js apps removed/archived

### 2. Type Safety End-to-End
- oRPC provides type-safe APIs from backend to frontend
- Drizzle ORM provides type-safe database queries
- TypeScript throughout the entire stack
- Automatic OpenAPI spec generation

### 3. Modern Authentication
- Better Auth for session management
- Multi-organization support
- Role-based access control (RBAC)
- Region-specific compliance

### 4. Compliance-First Design
- HIPAA (USA)
- GDPR (Europe)
- NDHM (India)
- Sharia (Dubai/UAE)

## 📁 Project Structure

```
health/
├── apps/
│   ├── api/              # oRPC API Server (Backend)
│   │   ├── src/
│   │   │   ├── index.ts           # Server entry point
│   │   │   ├── procedures.ts     # oRPC middleware (pub, authed, orgAuthed, complianceAudited)
│   │   │   └── routers/          # API route handlers
│   │   │       ├── index.ts      # Router composition
│   │   │       ├── patients.ts
│   │   │       ├── appointments.ts
│   │   │       ├── ehr.ts
│   │   │       ├── prescriptions.ts
│   │   │       ├── billing-healthcare.ts
│   │   │       ├── lab.ts
│   │   │       ├── pharmacy.ts
│   │   │       ├── compliance.ts
│   │   │       ├── claims.ts
│   │   │       ├── telemedicine.ts
│   │   │       └── analytics.ts
│   │   └── tests/                # API tests
│   │
│   └── web/              # TanStack Start Frontend
│       ├── src/
│       │   ├── app.tsx           # App root
│       │   ├── lib/
│       │   │   └── api.ts        # oRPC client setup
│       │   ├── components/       # React components
│       │   │   ├── ui/           # Reusable UI components
│       │   │   ├── patients/
│       │   │   ├── appointments/
│       │   │   ├── ehr/
│       │   │   ├── prescriptions/
│       │   │   ├── billing/
│       │   │   ├── lab/
│       │   │   ├── telemedicine/
│       │   │   └── analytics/
│       │   └── routes/           # File-based routing
│       │       ├── __root.tsx
│       │       ├── index.tsx    # Dashboard
│       │       ├── patients/
│       │       ├── appointments/
│       │       ├── billing/
│       │       ├── lab/
│       │       ├── analytics/
│       │       └── compliance/
│       └── app.config.ts
│
├── packages/
│   ├── core/              # Core business logic
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   │   └── better-auth.ts    # Better Auth configuration
│   │   │   └── integrations/         # External API integrations
│   │   │       ├── hl7.ts            # HL7 integration
│   │   │       ├── edi.ts            # EDI 837/835
│   │   │       ├── rxnorm.ts         # RxNorm API
│   │   │       ├── drugbank.ts       # DrugBank API
│   │   │       ├── drug-interactions.ts
│   │   │       └── telemedicine.ts
│   │   └── package.json
│   │
│   ├── storage/           # Database layer
│   │   ├── src/
│   │   │   └── db/
│   │   │       └── schema/            # Drizzle schemas
│   │   │           ├── index.ts
│   │   │           ├── auth.schema.ts
│   │   │           ├── billing.schema.ts
│   │   │           └── healthcare/    # Healthcare schemas
│   │   │               ├── index.ts
│   │   │               ├── patients.schema.ts
│   │   │               ├── appointments.schema.ts
│   │   │               ├── ehr.schema.ts
│   │   │               ├── prescriptions.schema.ts
│   │   │               ├── billing.schema.ts
│   │   │               ├── lab.schema.ts
│   │   │               ├── pharmacy.schema.ts
│   │   │               └── compliance.schema.ts
│   │   ├── drizzle.config.ts
│   │   └── package.json
│   │
│   └── ui/                # Shared UI components
│       ├── src/
│       │   ├── components/
│       │   ├── hooks/
│       │   └── utils/
│       └── package.json
│
├── docs/                  # Documentation
├── scripts/               # Utility scripts
├── archive/               # Archived legacy apps (for reference)
├── package.json           # Root package.json (workspaces)
├── tsconfig.json          # TypeScript config
└── README.md
```

## 🔐 Authentication Flow

### Better Auth Integration

1. **User Login**: Better Auth handles authentication
2. **Session Token**: Stored in cookie (`better-auth.session_token`)
3. **oRPC Middleware**: `authed` procedure verifies session
4. **Context**: User information added to request context
5. **Organization**: `orgAuthed` procedure adds organization context

### Procedure Types

- **`pub`**: Public procedures (no authentication)
- **`authed`**: Requires valid user session
- **`orgAuthed`**: Requires organization membership
- **`complianceAudited`**: Adds region-specific audit logging

## 🌍 Multi-Region Compliance

### HIPAA (USA)
- Automatic audit logging for PHI access
- Encryption at rest and in transit
- 6-year audit log retention
- Breach detection

### GDPR (Europe)
- Consent management
- Right to erasure
- Data portability
- Privacy impact assessments

### NDHM (India)
- Health ID (ABHA) integration
- PHR sync
- FHIR R4 compliance
- Regional language support

### Sharia (Dubai)
- Gender-appropriate assignments
- Prayer time scheduling
- Halal compliance
- Islamic calendar

## 🔄 Data Flow

```
Frontend (TanStack Start)
    ↓
oRPC Client (@orpc/tanstack-query)
    ↓
API Server (oRPC)
    ↓
Better Auth (Session Verification)
    ↓
oRPC Procedures (pub/authed/orgAuthed)
    ↓
Drizzle ORM
    ↓
PostgreSQL (Neon)
```

## 🚀 Deployment Architecture

### Development
- Frontend: `localhost:3000` (TanStack Start)
- Backend: `localhost:3001` (oRPC server)
- Database: Local PostgreSQL or Neon

### Production
- Frontend: Cloudflare Workers / Pages
- Backend: Cloudflare Workers
- Database: Neon (serverless PostgreSQL)
- Storage: Cloudflare R2

## 📊 Key Features

### Healthcare Modules
- Patient Management
- Electronic Health Records (EHR)
- Appointment Scheduling
- Billing & Revenue Cycle
- Laboratory & Imaging
- Pharmacy Management
- Telemedicine
- Analytics & Reporting

### External Integrations
- RxNorm API (drug information)
- DrugBank API (drug interactions)
- HL7 (healthcare interoperability)
- EDI 837/835 (claims processing)
- Zoom/Twilio (telemedicine)

## 🔒 Security

- End-to-end type safety
- Row-level security in database
- Encryption at rest and in transit
- Comprehensive audit logging
- Role-based access control
- Region-specific compliance

## 📈 Scalability

- Serverless architecture
- Edge deployment (Cloudflare)
- Database connection pooling
- Caching with TanStack Query
- Optimistic updates
- Background job processing

---

**Last Updated**: 2024-01-23
