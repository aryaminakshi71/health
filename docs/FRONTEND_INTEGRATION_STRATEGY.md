# Frontend Integration Strategy

## 📊 Current State Analysis

### Existing Frontend Applications

1. **`apps/web`** (TanStack Start) - **NEW UNIFIED FRONTEND**
   - Technology: TanStack Start, oRPC, React
   - Port: 3000
   - Status: ✅ Latest implementation with full healthcare features
   - Features: Patients, Appointments, EHR, Billing, Lab, Pharmacy, Compliance, Analytics

2. **`healthcare-hub/frontend`** (Next.js)
   - Technology: Next.js 14, React, Tailwind CSS
   - Port: 3001
   - Status: ⚠️ Existing application
   - Features: Healthcare management platform

3. **`hospital-ehr/frontend`** (Next.js)
   - Technology: Next.js 14, React, Tailwind CSS
   - Port: Default (3000)
   - Status: ⚠️ Existing application
   - Features: Hospital EHR system

4. **`autism-ecosystem-app-full-final/frontend`**
   - Technology: Unknown
   - Status: ⚠️ Separate project
   - Features: Autism therapy management

5. **`suraksha-platform/`** (Multiple Apps)
   - `asha-app/` - ASHA worker mobile app
   - `patient-app/` - Patient mobile app
   - `web-portal/` - Clinic web portal
   - Status: ⚠️ Maternal health platform

---

## 🎯 Integration Strategy Options

### Option 1: Unified Frontend (Recommended) ⭐

**Approach**: Migrate all features into `apps/web` (TanStack Start)

**Pros**:
- ✅ Single codebase, easier maintenance
- ✅ Shared components and utilities
- ✅ Unified authentication
- ✅ Better code coverage
- ✅ Type-safe APIs with oRPC
- ✅ Modern tech stack (TanStack Start)

**Cons**:
- ⚠️ Requires migration effort
- ⚠️ Need to port existing features

**Implementation**:
```
apps/web/ (TanStack Start - Main Frontend)
├── src/
│   ├── routes/
│   │   ├── healthcare-hub/     # Migrated from healthcare-hub
│   │   ├── hospital-ehr/       # Migrated from hospital-ehr
│   │   ├── autism/             # Migrated from autism-ecosystem
│   │   └── suraksha/           # Migrated from suraksha-platform
│   └── components/
│       ├── shared/             # Shared components
│       └── healthcare/        # Healthcare-specific
```

---

### Option 2: Micro-Frontends Architecture

**Approach**: Keep separate apps, integrate via Module Federation or routing

**Pros**:
- ✅ Independent deployment
- ✅ Team autonomy
- ✅ Gradual migration

**Cons**:
- ⚠️ Complex setup
- ⚠️ Shared state management challenges
- ⚠️ Multiple build processes

**Implementation**:
```
apps/
├── web/              # Main shell (TanStack Start)
├── healthcare-hub/  # Micro-frontend (Next.js)
├── hospital-ehr/     # Micro-frontend (Next.js)
└── autism/          # Micro-frontend
```

---

### Option 3: Shared Component Library

**Approach**: Extract shared components, keep apps separate

**Pros**:
- ✅ Code reuse
- ✅ Independent apps
- ✅ Gradual adoption

**Cons**:
- ⚠️ Still multiple codebases
- ⚠️ Version management complexity

**Implementation**:
```
packages/
├── ui/              # Shared UI components
├── core/            # Business logic
└── storage/         # Database
```

---

## 🏆 Recommended Approach: **Unified Frontend with Module Migration**

### Phase 1: Shared Component Library (Week 1-2)

1. **Create shared UI package**
   ```bash
   packages/ui/
   ├── src/
   │   ├── components/    # Reusable components
   │   ├── hooks/         # Shared hooks
   │   └── utils/         # Utilities
   └── package.json
   ```

2. **Extract common components from all apps**
   - Buttons, Inputs, Modals, Tables
   - Forms, Charts, Layouts

### Phase 2: Feature Migration (Week 3-8)

**Priority Order**:
1. ✅ **apps/web** - Already complete (keep as base)
2. 🔄 **healthcare-hub** - Migrate unique features
3. 🔄 **hospital-ehr** - Migrate EHR-specific features
4. 🔄 **autism-ecosystem** - Migrate autism-specific features
5. 🔄 **suraksha-platform** - Migrate maternal health features

### Phase 3: Route Organization (Week 9-10)

Organize routes by domain:
```
apps/web/src/routes/
├── /                          # Main dashboard
├── /patients                  # Patient management
├── /appointments              # Appointments
├── /ehr                       # Electronic Health Records
├── /billing                   # Billing & Revenue
├── /lab                       # Laboratory
├── /pharmacy                  # Pharmacy
├── /analytics                 # Analytics
├── /compliance                # Compliance
├── /autism/                   # Autism ecosystem features
│   ├── /schedules
│   ├── /aac
│   └── /therapy
└── /suraksha/                 # Maternal health
    ├── /asha
    ├── /patients
    └── /clinic
```

---

## 📋 Migration Checklist

### For Each Frontend Application:

- [ ] **Audit Features**
  - [ ] List all unique features
  - [ ] Identify shared features
  - [ ] Document dependencies

- [ ] **Component Extraction**
  - [ ] Extract reusable components to `packages/ui`
  - [ ] Update imports in source apps
  - [ ] Test components in isolation

- [ ] **Route Migration**
  - [ ] Create routes in `apps/web/src/routes/`
  - [ ] Migrate page components
  - [ ] Update navigation

- [ ] **API Integration**
  - [ ] Ensure all APIs are in `apps/api/src/routers/`
  - [ ] Update oRPC client calls
  - [ ] Test API endpoints

- [ ] **State Management**
  - [ ] Migrate to TanStack Query
  - [ ] Remove old state management
  - [ ] Update hooks

- [ ] **Styling**
  - [ ] Standardize on Tailwind CSS
  - [ ] Create design system
  - [ ] Update component styles

- [ ] **Testing**
  - [ ] Write tests for migrated features
  - [ ] Update E2E tests
  - [ ] Verify functionality

---

## 🛠️ Implementation Plan

### Step 1: Create Shared UI Package

```bash
# Create packages/ui
mkdir -p packages/ui/src/{components,hooks,utils}
```

**File Structure**:
```
packages/ui/
├── src/
│   ├── components/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── modal.tsx
│   │   ├── table.tsx
│   │   └── index.ts
│   ├── hooks/
│   │   └── index.ts
│   └── utils/
│       └── index.ts
├── package.json
└── tsconfig.json
```

### Step 2: Update Workspace Configuration

**Root `package.json`**:
```json
{
  "workspaces": [
    "apps/*",
    "packages/*"
],
  "scripts": {
    "dev": "bun run dev:api & bun run dev:web",
    "dev:legacy": "bun run dev:healthcare-hub & bun run dev:hospital-ehr",
    "dev:healthcare-hub": "cd healthcare-hub/frontend && npm run dev",
    "dev:hospital-ehr": "cd hospital-ehr/frontend && npm run dev"
  }
}
```

### Step 3: Migration Script

Create migration helper:
```typescript
// scripts/migrate-feature.ts
// Helper script to migrate features from legacy apps
```

---

## 🔄 Migration Process for Each App

### Healthcare Hub → apps/web

**Features to Migrate**:
- Dashboard components
- Patient management UI
- Appointment scheduling UI
- Analytics charts

**Steps**:
1. Copy unique components to `apps/web/src/components/`
2. Create routes in `apps/web/src/routes/`
3. Update API calls to use oRPC
4. Test and verify

### Hospital EHR → apps/web

**Features to Migrate**:
- EHR viewer/editor
- Clinical notes
- Vital signs tracking
- Lab results display

**Steps**:
1. Merge with existing EHR routes
2. Enhance with features from hospital-ehr
3. Update components
4. Test integration

### Autism Ecosystem → apps/web

**Features to Migrate**:
- Visual schedules
- AAC tools
- Therapy data collection
- Goal tracking

**Steps**:
1. Create `/autism` route group
2. Migrate components
3. Create API routes if needed
4. Integrate with main app

### Suraksha Platform → apps/web

**Features to Migrate**:
- ASHA worker interface
- Patient tracking
- Maternal health records
- NDHM integration

**Steps**:
1. Create `/suraksha` route group
2. Migrate ASHA app features
3. Migrate patient app features
4. Integrate clinic portal

---

## 📦 Shared Package Structure

```
packages/
├── ui/                    # Shared UI components
│   ├── components/
│   ├── hooks/
│   └── utils/
├── core/                  # Business logic (existing)
│   ├── auth/
│   └── integrations/
└── storage/               # Database (existing)
    └── db/
        └── schema/
```

---

## 🚀 Quick Start Integration

### 1. Install Dependencies

```bash
# Install all dependencies
bun install

# Install legacy app dependencies
cd healthcare-hub/frontend && npm install
cd ../../hospital-ehr/frontend && npm install
```

### 2. Run All Apps (Development)

```bash
# Run unified frontend + API
bun run dev

# Or run legacy apps alongside
bun run dev:legacy
```

### 3. Start Migration

```bash
# Create shared UI package
mkdir -p packages/ui/src/{components,hooks,utils}

# Begin migrating components
# Start with most-used components first
```

---

## 📊 Integration Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| **Phase 1** | Week 1-2 | Create shared UI package, extract common components |
| **Phase 2** | Week 3-4 | Migrate healthcare-hub features |
| **Phase 3** | Week 5-6 | Migrate hospital-ehr features |
| **Phase 4** | Week 7-8 | Migrate autism-ecosystem features |
| **Phase 5** | Week 9-10 | Migrate suraksha-platform features |
| **Phase 6** | Week 11-12 | Testing, cleanup, documentation |

---

## ✅ Success Criteria

- [ ] All features accessible from single app (`apps/web`)
- [ ] Shared component library in use
- [ ] All APIs unified in `apps/api`
- [ ] No duplicate code
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Legacy apps can be deprecated

---

## 🎯 Next Steps

1. **Review this strategy** with the team
2. **Prioritize features** to migrate first
3. **Create shared UI package**
4. **Start with healthcare-hub migration** (easiest)
5. **Gradually migrate other apps**

---

## 📝 Notes

- Keep legacy apps running during migration
- Migrate one feature at a time
- Test thoroughly after each migration
- Update documentation as you go
- Consider feature flags for gradual rollout
