# Healthcare Management System

A comprehensive, type-safe healthcare management system built for hospitals and clinics of all sizes with built-in multi-region compliance (HIPAA, GDPR, NDHM, Sharia).

## 🏗️ Architecture

Built on modern, type-safe technologies:

- **TanStack Start**: Full-stack React framework with SSR + client-side rendering
- **oRPC**: Type-safe APIs with automatic OpenAPI spec generation
- **Better Auth**: Authentication and multi-organization management
- **Bun**: Fast runtime and package manager
- **PostgreSQL + Drizzle ORM + Neon**: Serverless database layer
- **@orpc/tanstack-query**: Integrated state management

## ✨ Features

### Core Healthcare Modules
- **Patient Management**: Demographics, medical history, insurance, consent management
- **Electronic Health Records (EHR)**: Clinical notes, diagnoses, vital signs, medications
- **Appointment Scheduling**: Multi-provider scheduling, reminders, telemedicine support
- **Billing & Revenue Cycle**: Claims, invoicing, multi-currency support
- **Laboratory & Imaging**: Test orders, result management, DICOM support
- **Pharmacy Management**: Prescriptions, inventory, drug interactions
- **Compliance & Audit**: Comprehensive audit logging for all regions

### Multi-Region Compliance
- **USA**: HIPAA compliance with encryption, audit logs, and breach detection
- **Europe**: GDPR compliance with consent management and right to erasure
- **India**: NDHM integration with Health ID and PHR sync
- **Dubai/UAE**: Sharia-compliant features with gender-appropriate assignments

## 🚀 Quick Start

### Prerequisites

- Bun >= 1.0.0
- PostgreSQL database (local or Neon serverless)
- Node.js 18+ (for some tooling)

### Installation

```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up database
bun run db:generate
bun run db:push

# Start development server
bun run dev
```

### Environment Variables

Create a `.env` file with:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/healthcare

# Better Auth
BETTER_AUTH_SECRET=your-secret-key-change-this-in-production
BETTER_AUTH_URL=http://localhost:3000

# API Server
PORT=3001
HOST=0.0.0.0

# Frontend
VITE_PUBLIC_SITE_URL=http://localhost:3000
VITE_PUBLIC_API_URL=http://localhost:3001

# External APIs (Optional)
RXNORM_API_KEY=
DRUGBANK_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_API_KEY=
TWILIO_API_SECRET=
ZOOM_API_KEY=
ZOOM_API_SECRET=
ZOOM_ACCOUNT_ID=
```

## 📁 Project Structure

```
health/
├── apps/
│   ├── api/              # oRPC API server (Backend)
│   │   └── src/
│   │       ├── index.ts           # API server entry point
│   │       ├── procedures.ts     # oRPC middleware (pub, authed, orgAuthed, complianceAudited)
│   │       └── routers/          # API route handlers
│   │           ├── index.ts      # Router composition
│   │           ├── patients.ts   # Patient management
│   │           ├── appointments.ts
│   │           ├── ehr.ts        # Electronic Health Records
│   │           ├── prescriptions.ts
│   │           ├── billing-healthcare.ts
│   │           ├── lab.ts
│   │           ├── pharmacy.ts
│   │           ├── compliance.ts
│   │           ├── claims.ts
│   │           ├── telemedicine.ts
│   │           └── analytics.ts
│   │
│   └── web/              # TanStack Start frontend (Frontend)
│       ├── src/
│       │   ├── app.tsx           # App root
│       │   ├── lib/
│       │   │   └── api.ts        # oRPC client setup
│       │   ├── components/       # React components
│       │   │   ├── ui/           # Reusable UI components
│       │   │   ├── patients/      # Patient components
│       │   │   ├── appointments/
│       │   │   ├── ehr/          # EHR components
│       │   │   ├── prescriptions/
│       │   │   ├── billing/
│       │   │   ├── lab/
│       │   │   ├── telemedicine/
│       │   │   └── analytics/
│       │   └── routes/           # File-based routing
│       │       ├── __root.tsx
│       │       ├── index.tsx     # Dashboard
│       │       ├── patients/
│       │       ├── appointments/
│       │       ├── billing/
│       │       ├── lab/
│       │       ├── analytics/
│       │       └── compliance/
│       └── app.config.ts
│
├── packages/             # Shared packages
│   ├── core/              # Core business logic
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   │   └── better-auth.ts
│   │   │   └── integrations/     # External API integrations
│   │   │       ├── hl7.ts
│   │   │       ├── edi.ts
│   │   │       ├── rxnorm.ts
│   │   │       ├── drugbank.ts
│   │   │       ├── drug-interactions.ts
│   │   │       └── telemedicine.ts
│   │   └── package.json
│   │
│   ├── storage/           # Database layer
│   │   ├── src/
│   │   │   └── db/
│   │   │       └── schema/        # Drizzle schemas
│   │   │           ├── index.ts
│   │   │           ├── auth.schema.ts
│   │   │           ├── billing.schema.ts
│   │   │           └── healthcare/ # Healthcare schemas
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
├── package.json           # Root package.json (workspaces)
├── tsconfig.json          # TypeScript config
└── README.md
```

## 🔐 Authentication & Authorization

The system uses Better Auth with three levels of access:

- **Public (`pub`)**: No authentication required (patient portals, appointment booking)
- **Authenticated (`authed`)**: Requires valid user session (personal records)
- **Organization-Authenticated (`orgAuthed`)**: Requires org membership (staff operations)
- **Compliance-Audited (`complianceAudited`)**: Adds region-specific audit logging

## 🏥 Healthcare Modules

### Patient Management

```typescript
// List patients
const { data } = useQuery(
  orpc.patients.list({ 
    search: 'John',
    limit: 50 
  })
);

// Create patient
await orpc.patients.create.mutate({
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: '1990-01-01',
  gender: 'male',
  // ... other fields
});
```

### Appointments

```typescript
// Schedule appointment
await orpc.appointments.create.mutate({
  patientId: patient.id,
  providerId: doctor.id,
  scheduledAt: '2024-01-15T10:00:00Z',
  appointmentType: 'consultation',
  duration: 30,
});
```

### Electronic Health Records

```typescript
// Create clinical note
await orpc.ehr.createNote.mutate({
  patientId: patient.id,
  appointmentId: appointment.id,
  noteType: 'soap',
  subjective: 'Patient reports...',
  objective: 'Vital signs stable...',
  assessment: 'Diagnosis: ...',
  plan: 'Treatment plan: ...',
});
```

## 🌍 Region-Specific Compliance

### HIPAA (USA)

- Automatic audit logging for all PHI access
- Encryption at rest and in transit
- 6-year audit log retention
- Breach detection and notification

### GDPR (Europe)

- Consent management system
- Right to erasure (data deletion)
- Data portability exports
- Privacy impact assessments

### NDHM (India)

- Health ID (ABHA) integration
- PHR sync with NDHM
- FHIR R4 compliance
- Regional language support

### Sharia (Dubai)

- Gender-appropriate staff assignments
- Prayer time scheduling
- Halal compliance tracking
- Islamic calendar support

## 📊 Database Schema

The system uses Drizzle ORM with PostgreSQL. Key tables include:

- `patients` - Patient demographics and medical information
- `appointments` - Appointment scheduling
- `clinical_notes` - EHR documentation
- `vital_signs` - Patient vital signs
- `diagnoses` - Patient diagnoses with ICD-10 codes
- `compliance_audit_logs` - Comprehensive audit trail
- `consent_records` - Consent management

See `docs/HEALTHCARE_ARCHITECTURE.md` for complete schema documentation.

## 🧪 Development

```bash
# Type checking
bun run typecheck

# Linting
bun run lint

# Database migrations
bun run db:generate  # Generate migration
bun run db:push      # Apply migration

# Database studio (visual editor)
bun run db:studio

# Run tests
bun run test
bun run test:coverage
```

## 🚀 Running the Application

```bash
# Install dependencies
bun install

# Start development servers (API + Web)
bun run dev

# Or run separately
bun run dev:api    # API server on port 3001
bun run dev:web   # Web frontend on port 3000
```

## 📚 Documentation

- [Healthcare Architecture](./docs/HEALTHCARE_ARCHITECTURE.md) - Comprehensive architecture guide
- [Complete Feature List](./docs/COMPLETE_FEATURE_LIST.md) - All implemented features
- [Project Structure](./PROJECT_STRUCTURE.md) - Project organization
- [Setup Guide](./docs/SETUP_GUIDE.md) - Detailed setup instructions

## 🔒 Security

- End-to-end type safety with oRPC
- Row-level security in database
- Encryption at rest and in transit
- Comprehensive audit logging
- Role-based access control (RBAC)

## 🚢 Deployment

The application is designed to deploy on:

- **Cloudflare Workers** (edge deployment)
- **Neon PostgreSQL** (serverless database)
- **Cloudflare R2** (file storage)

See `DEPLOYMENT.md` for detailed instructions.

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please read the contributing guidelines first.

---

Built with ❤️ for healthcare providers worldwide
