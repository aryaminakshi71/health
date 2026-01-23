# HOSPITAL EHR - COMPLETE TECHNICAL ARCHITECTURE
## Database Schema, APIs, Workflows, Integrations

---

## TABLE OF CONTENTS

1. System Architecture Overview
2. Database Schema (Complete)
3. API Endpoints (100+)
4. User Roles & Permissions
5. Core Workflows
6. Module Specifications
7. Integration Points
8. Technology Stack
9. Deployment Architecture
10. Performance & Scalability

---

## 1. SYSTEM ARCHITECTURE OVERVIEW

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                         │
├─────────────────────────────────────────────────────────┤
│  Web Browser          │  Mobile (PWA)   │  Tablets      │
│  (Doctor, Staff)      │  (Nurses, Docs) │  (Bedside)    │
└──────────────┬────────┴────────┬────────┴────────────────┘
               │                 │
               └─────────┬───────┘
                         │ HTTPS REST APIs
┌─────────────────────────▼────────────────────────────────┐
│           API GATEWAY & LOAD BALANCER                    │
│  (Authentication, Rate Limiting, Request Routing)       │
└─────────────────────────┬────────────────────────────────┘
                         │
┌─────────────────────────▼────────────────────────────────┐
│              BACKEND MICROSERVICES                       │
├─────────────────────────────────────────────────────────┤
│ • Patient Service          • Pharmacy Service           │
│ • OPD Service              • Billing Service            │
│ • IPD Service              • Insurance Service          │
│ • Lab Service              • Reporting Service          │
│ • Imaging Service          • Authentication Service     │
└─────────────────────────┬────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼──────┐  ┌──────▼───────┐  ┌───▼────────┐
│  PostgreSQL  │  │   Redis      │  │  S3/File   │
│  (Primary    │  │  (Cache +    │  │  Storage   │
│   Database)  │  │   Sessions)  │  │  (Images)  │
└──────────────┘  └──────────────┘  └────────────┘

External Integrations:
├─ Insurance APIs (HDFC, Axa, ICICI)
├─ Lab Equipment APIs
├─ Pharmacy Suppliers
├─ NDHM APIs
└─ SMS/Email Gateways
```

### Tech Stack Decision

```
Frontend:
  - React.js (web admin, doctor portal)
  - React Native or PWA (nurse/bedside app)
  - TypeScript (type safety)
  - Tailwind CSS (styling)

Backend:
  - Node.js/Express.js (REST APIs)
  - TypeScript (maintainability)
  - PostgreSQL (relational data)
  - Redis (caching, sessions)
  - Bull (job queue for background tasks)

Infrastructure:
  - AWS (EC2, RDS, S3, CloudFront)
  - Docker (containerization)
  - GitHub Actions (CI/CD)

Key Libraries:
  - Passport.js (authentication)
  - Joi (validation)
  - TypeORM (database ORM)
  - Jest (testing)
  - Winston (logging)
```

---

## 2. COMPLETE DATABASE SCHEMA

### Core Tables

```sql
-- PATIENTS
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mrn VARCHAR(50) UNIQUE NOT NULL,  -- Medical Record Number
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  date_of_birth DATE NOT NULL,
  age INT GENERATED ALWAYS AS (EXTRACT(YEAR FROM AGE(date_of_birth))) STORED,
  gender ENUM('MALE', 'FEMALE', 'OTHER') NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  occupation VARCHAR(100),
  blood_group ENUM('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'),
  
  -- Emergency contact
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  
  -- Insurance
  primary_insurance_id UUID REFERENCES insurance_companies(id),
  primary_insurance_number VARCHAR(100),
  
  -- Medical info
  allergies TEXT,
  chronic_conditions TEXT,
  previous_surgeries TEXT,
  current_medications TEXT,
  
  -- Health ID (NDHM)
  health_id VARCHAR(50),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  INDEX idx_mrn (mrn),
  INDEX idx_phone (phone),
  INDEX idx_health_id (health_id)
);

-- PATIENT VISITS (parent table for OPD/IPD/Emergency)
CREATE TABLE patient_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  visit_type ENUM('OPD', 'IPD', 'EMERGENCY', 'FOLLOW_UP'),
  visit_date TIMESTAMP DEFAULT NOW(),
  chief_complaint TEXT,
  
  -- Status tracking
  status ENUM('REGISTERED', 'WAITING', 'IN_CONSULTATION', 'COMPLETED', 'ADMITTED'),
  
  -- Assigned doctor
  assigned_doctor_id UUID REFERENCES doctors(id),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_patient_id (patient_id),
  INDEX idx_visit_date (visit_date)
);

-- OPD CONSULTATIONS
CREATE TABLE opd_consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID NOT NULL REFERENCES patient_visits(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  doctor_id UUID NOT NULL REFERENCES doctors(id),
  
  -- Consultation details
  chief_complaint TEXT NOT NULL,
  history TEXT,
  examination_findings TEXT,
  diagnosis TEXT NOT NULL,
  treatment_plan TEXT,
  notes TEXT,
  
  -- Vital signs
  temperature DECIMAL(4,2),
  heart_rate INT,
  blood_pressure_systolic INT,
  blood_pressure_diastolic INT,
  respiratory_rate INT,
  weight_kg DECIMAL(5,2),
  height_cm INT,
  
  -- Consultation metadata
  consultation_start_time TIMESTAMP DEFAULT NOW(),
  consultation_end_time TIMESTAMP,
  duration_minutes INT GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (consultation_end_time - consultation_start_time))/60
  ) STORED,
  
  -- Follow-up
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,
  follow_up_notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_doctor_id (doctor_id),
  INDEX idx_patient_id (patient_id),
  INDEX idx_consultation_date (consultation_start_time)
);

-- PRESCRIPTIONS
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID REFERENCES opd_consultations(id),
  ipd_admission_id UUID REFERENCES ipd_admissions(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  doctor_id UUID NOT NULL REFERENCES doctors(id),
  
  -- Prescription details
  prescribed_date TIMESTAMP DEFAULT NOW(),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_patient_id (patient_id)
);

-- PRESCRIPTION ITEMS
CREATE TABLE prescription_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID NOT NULL REFERENCES prescriptions(id),
  medicine_id UUID NOT NULL REFERENCES medicines(id),
  
  -- Dosage
  dose_quantity DECIMAL(10,2) NOT NULL,
  dose_unit VARCHAR(50) NOT NULL,  -- mg, ml, tab, cap, etc.
  frequency VARCHAR(100) NOT NULL,  -- Once daily, Twice daily, etc.
  duration_days INT NOT NULL,
  instructions TEXT,
  
  -- Status
  status ENUM('PRESCRIBED', 'DISPENSED', 'COMPLETED'),
  dispensed_date TIMESTAMP,
  dispensed_by UUID REFERENCES pharmacy_staff(id),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_prescription_id (prescription_id)
);

-- MEDICINES (PHARMACY INVENTORY)
CREATE TABLE medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  generic_name VARCHAR(200),
  form VARCHAR(50),  -- Tablet, Capsule, Liquid, Injection
  strength VARCHAR(50),  -- 250mg, 500mg, etc.
  
  -- Supplier info
  supplier_id UUID REFERENCES suppliers(id),
  
  -- Stock management
  current_stock INT DEFAULT 0,
  reorder_level INT,
  reorder_quantity INT,
  
  -- Pricing
  cost_per_unit DECIMAL(10,2),
  selling_price DECIMAL(10,2),
  
  -- Tracking
  batch_number VARCHAR(100),
  expiry_date DATE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_name (name),
  INDEX idx_expiry_date (expiry_date)
);

-- IPD ADMISSIONS
CREATE TABLE ipd_admissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  admission_date TIMESTAMP DEFAULT NOW(),
  discharge_date TIMESTAMP,
  
  -- Room & Bed
  room_id UUID REFERENCES rooms(id),
  bed_id UUID REFERENCES beds(id),
  
  -- Doctor
  admitted_by UUID NOT NULL REFERENCES doctors(id),
  primary_doctor_id UUID REFERENCES doctors(id),
  
  -- Admission details
  reason_for_admission TEXT NOT NULL,
  diagnosis TEXT,
  icd_codes TEXT,  -- International Classification of Diseases
  
  -- Type
  admission_type ENUM('ROUTINE', 'EMERGENCY', 'URGENT'),
  
  -- Status
  status ENUM('ACTIVE', 'DISCHARGED', 'TRANSFERRED', 'DECEASED'),
  
  -- Discharge info
  discharge_summary TEXT,
  discharge_advice TEXT,
  
  -- Financial
  estimated_cost DECIMAL(12,2),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_patient_id (patient_id),
  INDEX idx_admission_date (admission_date),
  INDEX idx_status (status)
);

-- IPD DAILY NOTES
CREATE TABLE ipd_daily_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_id UUID NOT NULL REFERENCES ipd_admissions(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  
  note_date DATE NOT NULL,
  note_type ENUM('DOCTOR_NOTE', 'NURSE_NOTE', 'CARE_PLAN'),
  
  -- Vital signs
  temperature DECIMAL(4,2),
  heart_rate INT,
  blood_pressure_systolic INT,
  blood_pressure_diastolic INT,
  respiratory_rate INT,
  oxygen_saturation INT,
  
  -- Notes
  observations TEXT,
  status TEXT,
  plan TEXT,
  
  entered_by UUID NOT NULL REFERENCES users(id),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_admission_id (admission_id),
  INDEX idx_note_date (note_date)
);

-- BEDS & ROOMS
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number VARCHAR(50) UNIQUE NOT NULL,
  floor INT,
  bed_count INT,
  room_type ENUM('GENERAL', 'SEMI_PRIVATE', 'PRIVATE', 'ICU', 'HDU'),
  rate_per_day DECIMAL(10,2),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE beds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id),
  bed_number VARCHAR(50) NOT NULL,
  status ENUM('AVAILABLE', 'OCCUPIED', 'MAINTENANCE'),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_room_id (room_id),
  INDEX idx_status (status)
);

-- LABORATORY TESTS
CREATE TABLE lab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID REFERENCES patient_visits(id),
  ipd_admission_id UUID REFERENCES ipd_admissions(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  
  -- Test details
  test_name VARCHAR(200) NOT NULL,
  test_code VARCHAR(50),
  test_category VARCHAR(100),  -- Hematology, Biochemistry, Microbiology, etc.
  
  -- Ordering
  ordered_by UUID REFERENCES doctors(id),
  order_date TIMESTAMP DEFAULT NOW(),
  
  -- Sample
  sample_type VARCHAR(100),  -- Blood, Urine, etc.
  sample_collected_date TIMESTAMP,
  sample_collected_by UUID REFERENCES lab_staff(id),
  
  -- Results
  result_value TEXT,
  result_unit VARCHAR(50),
  reference_range TEXT,
  is_abnormal BOOLEAN,
  result_date TIMESTAMP,
  reported_by UUID REFERENCES lab_staff(id),
  
  -- Status
  status ENUM('ORDERED', 'SAMPLE_COLLECTED', 'PROCESSING', 'COMPLETED', 'REPORTED'),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_patient_id (patient_id),
  INDEX idx_result_date (result_date)
);

-- IMAGING / RADIOLOGY
CREATE TABLE imaging_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  
  -- Test details
  imaging_type VARCHAR(100),  -- X-ray, CT, MRI, Ultrasound
  body_part VARCHAR(100),
  
  -- Order details
  ordered_by UUID REFERENCES doctors(id),
  order_date TIMESTAMP DEFAULT NOW(),
  urgency ENUM('ROUTINE', 'URGENT'),
  
  -- Procedure
  procedure_date TIMESTAMP,
  technician_id UUID REFERENCES radiology_staff(id),
  
  -- Results
  findings TEXT,
  report_date TIMESTAMP,
  radiologist_id UUID REFERENCES doctors(id),
  images_path TEXT,  -- Reference to S3
  
  -- Status
  status ENUM('ORDERED', 'SCHEDULED', 'COMPLETED', 'REPORTED'),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_patient_id (patient_id),
  INDEX idx_procedure_date (procedure_date)
);

-- BILLING
CREATE TABLE bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_number VARCHAR(50) UNIQUE NOT NULL,
  patient_id UUID NOT NULL REFERENCES patients(id),
  visit_id UUID REFERENCES patient_visits(id),
  ipd_admission_id UUID REFERENCES ipd_admissions(id),
  
  -- Billing details
  bill_date TIMESTAMP DEFAULT NOW(),
  bill_type ENUM('OPD', 'IPD', 'EMERGENCY', 'LAB', 'PHARMACY'),
  
  -- Charges
  subtotal DECIMAL(12,2),
  discount DECIMAL(12,2) DEFAULT 0,
  tax DECIMAL(12,2),
  total_amount DECIMAL(12,2),
  
  -- Payment
  amount_paid DECIMAL(12,2) DEFAULT 0,
  balance DECIMAL(12,2),
  payment_method ENUM('CASH', 'CARD', 'CHEQUE', 'ONLINE', 'INSURANCE'),
  payment_date TIMESTAMP,
  
  -- Insurance
  insurance_company_id UUID REFERENCES insurance_companies(id),
  insurance_claim_id VARCHAR(100),
  insurance_amount DECIMAL(12,2),
  patient_amount DECIMAL(12,2),
  
  -- Status
  status ENUM('DRAFT', 'FINALIZED', 'PAID', 'PARTIALLY_PAID', 'CLAIM_PENDING'),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_bill_number (bill_number),
  INDEX idx_patient_id (patient_id),
  INDEX idx_bill_date (bill_date)
);

-- BILL ITEMS
CREATE TABLE bill_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID NOT NULL REFERENCES bills(id),
  
  -- Item details
  item_type VARCHAR(100),  -- Consultation, Room, Lab Test, Medicine, etc.
  item_name VARCHAR(200),
  quantity INT DEFAULT 1,
  unit_rate DECIMAL(10,2),
  amount DECIMAL(12,2),
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_bill_id (bill_id)
);

-- INSURANCE COMPANIES
CREATE TABLE insurance_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  company_code VARCHAR(50) UNIQUE,
  contact_person VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(100),
  api_endpoint VARCHAR(500),  -- For claim submission
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- INSURANCE CLAIMS
CREATE TABLE insurance_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_number VARCHAR(100) UNIQUE,
  bill_id UUID NOT NULL REFERENCES bills(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  insurance_company_id UUID NOT NULL REFERENCES insurance_companies(id),
  
  -- Claim details
  claim_amount DECIMAL(12,2),
  claim_date TIMESTAMP DEFAULT NOW(),
  submitted_date TIMESTAMP,
  
  -- Status
  status ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PAID', 'APPEALED'),
  rejection_reason TEXT,
  
  -- Response
  approved_amount DECIMAL(12,2),
  payment_date TIMESTAMP,
  reference_number VARCHAR(100),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_bill_id (bill_id),
  INDEX idx_claim_number (claim_number)
);

-- USERS
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  password_hash VARCHAR(255) NOT NULL,
  
  -- Role
  role ENUM('ADMIN', 'DOCTOR', 'NURSE', 'LAB_STAFF', 'PHARMACY_STAFF', 
            'BILLING_STAFF', 'RECEPTIONIST', 'RADIOLOGIST'),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_email (email)
);

-- DOCTORS (extends users)
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  
  -- Professional info
  registration_number VARCHAR(100) UNIQUE,
  registration_council VARCHAR(100),
  specialization VARCHAR(100),
  qualification VARCHAR(200),
  experience_years INT,
  
  -- Availability
  available_mon_fri_start TIME,
  available_mon_fri_end TIME,
  available_weekends BOOLEAN,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_user_id (user_id)
);

-- STAFF (NURSES, LAB, PHARMACY, ETC)
CREATE TABLE hospital_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  
  staff_type ENUM('NURSE', 'LAB_TECHNICIAN', 'RADIOGRAPHER', 'PHARMACY_TECH', 
                  'RECEPTIONIST', 'BILLING_CLERK'),
  department VARCHAR(100),
  shift ENUM('MORNING', 'EVENING', 'NIGHT'),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- APPOINTMENTS
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  doctor_id UUID NOT NULL REFERENCES doctors(id),
  
  appointment_date TIMESTAMP NOT NULL,
  duration_minutes INT DEFAULT 30,
  
  reason VARCHAR(200),
  status ENUM('SCHEDULED', 'CHECK_IN', 'IN_PROGRESS', 'COMPLETED', 'NO_SHOW', 'CANCELLED'),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_doctor_id (doctor_id),
  INDEX idx_appointment_date (appointment_date),
  INDEX idx_status (status)
);

-- AUDIT LOG
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(200) NOT NULL,
  table_name VARCHAR(100),
  record_id VARCHAR(100),
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_user_id (user_id),
  INDEX idx_table_name (table_name),
  INDEX idx_created_at (created_at)
);
```

---

## 3. API ENDPOINTS (100+ Endpoints)

### Authentication

```
POST /auth/login
  Body: { email, password }
  Response: { token, user, expiresIn }

POST /auth/logout
  Headers: Authorization
  Response: { success }

POST /auth/refresh-token
  Headers: Authorization
  Response: { token, expiresIn }

POST /auth/register
  Body: { email, password, name, role }
  Response: { user }
```

### Patient Management

```
GET /patients
  Query: { search, limit, offset }
  Response: { patients: [], total }

POST /patients
  Body: { firstName, lastName, dob, phone, address, ...}
  Response: { patient }

GET /patients/:id
  Response: { patient with full history }

PUT /patients/:id
  Body: { ...updates }
  Response: { patient }

GET /patients/:id/medical-history
  Response: { allergies, chronic_conditions, previous_surgeries, medications }

GET /patients/:id/visits
  Query: { visitType, startDate, endDate }
  Response: { visits: [] }

GET /patients/:id/bills
  Response: { bills: [] }

GET /patients/:id/prescriptions
  Response: { prescriptions: [] }
```

### OPD (Outpatient)

```
POST /opd/check-in
  Body: { patientId, chiefComplaint }
  Response: { visitId }

POST /opd/consultations
  Body: { patientId, doctorId, chiefComplaint, examination, diagnosis, ... }
  Response: { consultationId }

GET /opd/queue
  Response: { waitingPatients: [], inConsultation: [], completed: [] }

POST /opd/consultations/:id/notes
  Body: { notes }
  Response: { updated }

POST /opd/consultations/:id/prescribe
  Body: { medicines: [{medicineId, dose, frequency, duration}] }
  Response: { prescriptionId }

GET /opd/doctor/:doctorId/schedule
  Response: { appointments, consultations, availability }

POST /opd/consultations/:id/complete
  Body: { followUpRequired, followUpDate }
  Response: { consultationId, bill }
```

### IPD (Inpatient)

```
POST /ipd/admissions
  Body: { patientId, doctorId, reasonForAdmission, admissionType, roomId }
  Response: { admissionId }

GET /ipd/admissions
  Query: { status, patientId }
  Response: { admissions: [] }

GET /ipd/admissions/:id
  Response: { admission with full details }

POST /ipd/admissions/:id/daily-notes
  Body: { noteType, temperature, heartRate, bp, observations, plan }
  Response: { noteId }

POST /ipd/admissions/:id/prescribe
  Body: { medicines: [] }
  Response: { prescriptionId }

GET /ipd/admissions/:id/lab-orders
  Response: { labOrders: [] }

GET /ipd/admissions/:id/vital-signs
  Query: { days }
  Response: { vitalSigns: [] }

POST /ipd/admissions/:id/discharge
  Body: { dischargeSummary, dischargeAdvice, medications, followUp }
  Response: { dischargeId, bill }

POST /ipd/admissions/:id/transfer
  Body: { newRoomId }
  Response: { updated }

GET /ipd/census
  Response: { totalBeds, occupiedBeds, available, admissions: [] }

GET /ipd/rooms/:roomId/beds
  Response: { beds: [] }
```

### Pharmacy

```
GET /pharmacy/medicines
  Query: { search, category, inStock }
  Response: { medicines: [] }

POST /pharmacy/medicines
  Body: { name, strength, form, costPerUnit, sellingPrice, ... }
  Response: { medicineId }

PUT /pharmacy/medicines/:id/stock
  Body: { action: 'ADD'|'REMOVE'|'ADJUST', quantity, reason }
  Response: { currentStock, updated }

GET /pharmacy/inventory
  Response: { medicines: [{name, currentStock, reorderLevel, expiry}] }

GET /pharmacy/expiry-alerts
  Response: { expiringMedicines: [] }

POST /pharmacy/dispense
  Body: { prescriptionItemId, quantityDispensed }
  Response: { dispensed }

GET /pharmacy/stock-report
  Query: { category }
  Response: { report: [] }

POST /pharmacy/reorder
  Body: { medicineId, quantity, supplierId }
  Response: { orderId }
```

### Laboratory

```
POST /lab/orders
  Body: { patientId, testName, orderedBy, urgency }
  Response: { orderId }

GET /lab/orders
  Query: { status, patientId }
  Response: { orders: [] }

POST /lab/orders/:id/collect-sample
  Body: { sampleCollectedAt, collectedBy }
  Response: { updated }

POST /lab/orders/:id/result
  Body: { resultValue, resultUnit, isAbnormal }
  Response: { resultId }

GET /lab/orders/:id/report
  Response: { report with results }

GET /lab/worklist
  Response: { orders: [] }

GET /lab/test-categories
  Response: { categories: [] }

POST /lab/quality-control
  Body: { testId, controlResult, status }
  Response: { qcId }
```

### Imaging/Radiology

```
POST /imaging/orders
  Body: { patientId, imagingType, bodyPart, orderedBy, urgency }
  Response: { orderId }

GET /imaging/orders
  Query: { status, imagingType }
  Response: { orders: [] }

POST /imaging/orders/:id/schedule
  Body: { scheduledDateTime }
  Response: { updated }

POST /imaging/orders/:id/procedure
  Body: { technicianId, imagesPath }
  Response: { updated }

POST /imaging/orders/:id/report
  Body: { radiologistId, findings }
  Response: { reportId }

GET /imaging/orders/:id/images
  Response: { imageUrls: [] }
```

### Billing & Insurance

```
POST /billing/generate-bill
  Body: { patientId, visitId|admissionId, billType }
  Response: { billId }

GET /billing/bills
  Query: { patientId, status, dateRange }
  Response: { bills: [] }

GET /billing/bills/:id
  Response: { bill with items }

POST /billing/bills/:id/add-item
  Body: { itemName, quantity, rate }
  Response: { updated }

POST /billing/bills/:id/finalize
  Response: { finalized }

POST /billing/bills/:id/payment
  Body: { amount, paymentMethod, reference }
  Response: { paymentId, balance }

POST /billing/insurance-claims
  Body: { billId, insuranceCompanyId, claimAmount }
  Response: { claimId }

GET /billing/insurance-claims
  Query: { status, insuranceCompanyId }
  Response: { claims: [] }

POST /billing/insurance-claims/:id/submit
  Response: { submitted, claimNumber }

GET /billing/insurance-claims/:id/status
  Response: { status, rejectionReason }

GET /billing/daily-summary
  Response: { collections, pendingPayments, claimsSubmitted }

GET /billing/financial-report
  Query: { startDate, endDate }
  Response: { revenue, collections, outstanding }
```

### Reporting & Analytics

```
GET /reports/opd-summary
  Query: { startDate, endDate }
  Response: { totalConsultations, byDoctor, byComplaint }

GET /reports/ipd-summary
  Query: { startDate, endDate }
  Response: { admissions, discharges, averageLOS, occupancy }

GET /reports/lab-volume
  Query: { startDate, endDate }
  Response: { totalTests, byCategory, turnaround }

GET /reports/financial
  Query: { startDate, endDate }
  Response: { revenue, collections, outstanding }

GET /reports/staff-performance
  Query: { month }
  Response: { doctorMetrics, staffMetrics }

GET /reports/inventory-aging
  Response: { expiredItems, expiringItems }

GET /reports/patient-demographics
  Response: { ageWiseDistribution, genderWise, geographicWise }

GET /reports/insurance-performance
  Query: { insuranceCompanyId }
  Response: { claimsSubmitted, approved, rejected, rejectionReasons }
```

### User & Access Management

```
GET /users
  Response: { users: [] }

POST /users
  Body: { email, name, role, department }
  Response: { userId }

PUT /users/:id/role
  Body: { role }
  Response: { updated }

POST /users/:id/reset-password
  Response: { passwordReset }

GET /users/:id/permissions
  Response: { permissions: [] }

GET /audit-log
  Query: { userId, tableNames, dateRange }
  Response: { logs: [] }
```

### Dashboard & Home

```
GET /dashboard/overview
  Response: { 
    todayOPD, todayIPD, todayEmergency,
    bedsOccupancy, staffPresent, 
    pendingBills, pendingInsuranceClaims
  }

GET /dashboard/doctor/my-schedule
  Response: { appointments, consultations }

GET /dashboard/doctor/pending-actions
  Response: { prescriptionsToReview, labResultsToView, dischargesNeeded }

GET /dashboard/nurse/my-patients
  Response: { assignedPatients: [] }

GET /dashboard/receptionist/queue
  Response: { waitingPatients, checkInReady }
```

---

## 4. USER ROLES & PERMISSIONS

### Role-Based Access Control

```
ADMIN:
  ✅ All operations
  ✅ User management
  ✅ System configuration
  ✅ Financial reports
  ✅ Audit logs

DOCTOR:
  ✅ View patients (assigned)
  ✅ Create/update consultations
  ✅ Prescribe medications
  ✅ Order lab/imaging tests
  ✅ View patient history
  ✅ Create discharge summaries
  ❌ Modify other doctors' notes
  ❌ View financial data
  ❌ User management

NURSE:
  ✅ View assigned patients (IPD)
  ✅ Enter vital signs
  ✅ Create daily notes
  ✅ Medication administration tracking
  ✅ Patient monitoring
  ❌ Create consultations
  ❌ Prescribe
  ❌ View financial data

LAB_STAFF:
  ✅ View lab orders assigned to them
  ✅ Enter test results
  ✅ Manage samples
  ✅ Generate lab reports
  ❌ Modify orders
  ❌ View patient demographics (except test-related)

PHARMACY_STAFF:
  ✅ View prescriptions
  ✅ Dispense medications
  ✅ Manage inventory
  ✅ Track medication administration
  ❌ Create prescriptions
  ❌ Modify doses

RECEPTIONIST:
  ✅ Register patients
  ✅ Schedule appointments
  ✅ Check-in patients
  ✅ View waiting queue
  ❌ View clinical data
  ❌ Financial operations

BILLING_STAFF:
  ✅ Generate bills
  ✅ Record payments
  ✅ Submit insurance claims
  ✅ View financial reports
  ❌ Modify patient clinical data
  ❌ User management

RADIOLOGIST:
  ✅ View imaging orders
  ✅ Upload images
  ✅ Create reports
  ❌ Order imaging (only confirm)
  ❌ Financial data
```

---

## 5. CORE WORKFLOWS

### OPD Workflow

```
1. REGISTRATION
   Patient arrives → Receptionist checks-in → MRN assigned or existing looked up
   Patient added to waiting queue

2. TRIAGE
   Vital signs taken (by nurse or automated)
   Chief complaint recorded
   Priority assigned (routine vs urgent)

3. CONSULTATION
   Patient called from queue
   Doctor reviews patient history
   Doctor performs examination
   Doctor creates diagnosis & plan
   Doctor prescribes if needed

4. PRESCRIPTION FULFILLMENT
   Prescription sent to pharmacy
   Pharmacy staff dispenses
   Patient receives medicines

5. LAB/IMAGING (if needed)
   Lab/Imaging order created
   Patient directed to lab/imaging
   Results received & linked

6. BILLING
   Bill generated automatically
   Items added: consultation, lab, imaging, medicines
   Payment collected
   Insurance claim submission (if insured)

7. FOLLOW-UP (if needed)
   Next appointment scheduled
   Patient receives reminder
```

### IPD Workflow

```
1. EMERGENCY DEPARTMENT (if applicable)
   Patient arrives
   Triage & initial assessment
   Emergency treatment if needed
   Decision: Admit or Discharge

2. ADMISSION
   Patient admitted by doctor
   Room & bed assigned
   Admission note created
   Medical history updated
   Baseline vital signs recorded
   Medications/orders entered

3. DAILY MANAGEMENT
   Each day:
   - Morning round: Doctor enters notes
   - Vital signs: Nurse enters 4x/day
   - Medications: Pharmacy dispenses
   - Lab orders: Collected & reported
   - Imaging: Scheduled & reported

4. MEDICATION MANAGEMENT
   Doctor orders medications
   Pharmacy dispenses
   Nurse administers (tracked)
   Effectiveness monitored

5. PROCEDURES (if needed)
   Surgery scheduled
   Pre-operative notes
   Surgery details
   Post-operative orders

6. DISCHARGE PLANNING
   Doctor determines discharge readiness
   Discharge summary created
   Final medications prescribed
   Follow-up scheduled
   Patient education provided

7. DISCHARGE
   Final vital signs
   Discharge bill generated
   Patient & insurance payments
   Patient leaves with discharge summary
```

### Lab Workflow

```
1. ORDER CREATION
   Doctor creates lab order
   Test type selected
   Urgency assigned
   Order appears in lab worklist

2. SAMPLE COLLECTION
   Lab staff collects sample from patient/ward
   Sample labeled with patient ID
   Sample logged in system
   Chain of custody maintained

3. PROCESSING
   Sample processed according to test protocol
   Quality control performed
   Results generated

4. RESULT ENTRY
   Lab technician enters results
   System validates against reference ranges
   Abnormal results flagged
   Doctor notified (if critical)

5. REPORTING
   Lab report generated (printable + digital)
   Report sent to ordering doctor
   Results visible in patient portal
   Results added to patient record

6. FOLLOW-UP
   If critical value: System alerts doctor immediately
   Doctor reviews & takes action
   Follow-up testing if needed
```

---

## 6. MODULE SPECIFICATIONS

### Module 1: OPD (Outpatient Department)

**Key Features:**
- Patient queue management
- Appointment scheduling (weekly view)
- Chief complaint templating
- Quick consultation templates (by specialization)
- One-click prescription generation
- Automatic bill creation
- Insurance pre-auth checking

**Database Tables:**
- patient_visits
- opd_consultations
- appointments
- prescriptions
- prescription_items

**Key Metrics:**
- Patients per day
- Average consultation time
- Follow-ups vs new patients
- Insurance claims

---

### Module 2: IPD (Inpatient Department)

**Key Features:**
- Bed management (availability, assignment, transfer)
- Admission/discharge workflow
- Daily vital signs charting
- Ward rounds (digital)
- Medication tracking
- Discharge summary generation
- Hospital census dashboard

**Database Tables:**
- ipd_admissions
- ipd_daily_notes
- rooms
- beds
- prescriptions

**Key Metrics:**
- Occupancy rate
- Average length of stay
- Daily admissions/discharges
- Readmission rate

---

### Module 3: Pharmacy

**Key Features:**
- Real-time inventory tracking
- Automatic stock alerts
- Expiry date management
- Medicine dispensing (linked to prescriptions)
- Stock adjustment
- Supplier management
- Cost analysis

**Database Tables:**
- medicines
- prescription_items
- suppliers

**Key Metrics:**
- Stock value
- Expiry items
- Consumption rates
- Turnover

---

### Module 4: Lab

**Key Features:**
- Test ordering from clinics
- Sample collection tracking
- Test result entry
- Auto-validation against reference ranges
- Report generation
- Critical value alerts
- Turnaround time tracking

**Database Tables:**
- lab_tests
- lab_staff

**Key Metrics:**
- Daily volume by test type
- Turnaround time
- Critical results
- Lab utilization

---

### Module 5: Imaging/Radiology

**Key Features:**
- Imaging order management
- Scheduling
- Image storage (linked to S3)
- Radiologist reporting
- Result distribution

**Database Tables:**
- imaging_orders

**Key Metrics:**
- Imaging volume
- Modality-wise distribution
- Turnaround time

---

### Module 6: Billing & Insurance

**Key Features:**
- Automatic bill generation
- Multiple payment methods
- Insurance claim auto-generation
- Claim status tracking
- Outstanding balance reports
- Insurance company integration (API)
- Revenue analytics

**Database Tables:**
- bills
- bill_items
- insurance_companies
- insurance_claims

**Key Metrics:**
- Daily collections
- Claim approval rate
- Claim rejection reasons
- Outstanding amount

---

## 7. INTEGRATION POINTS

### Insurance Companies

```javascript
// Auto-generate and submit claims to insurance

POST /insurance-api/submit-claim
Body: {
  patientName,
  patientAge,
  insuranceNumber,
  billAmount,
  diagnosis,
  treatmentDetails,
  medicinesUsed
}

Response: {
  claimNumber,
  status: "SUBMITTED"
}

// Track claim status

GET /insurance-api/claim-status/:claimNumber
Response: {
  status: "APPROVED"|"REJECTED"|"PENDING",
  approvedAmount,
  rejectionReason
}
```

### Lab Equipment

```
Lab equipment can send results directly to system via API
OR staff manually enters results

Equipment Integration:
- Hematology analyzer
- Biochemistry analyzer
- ECG machine
- Ultra-sound machine
```

### NDHM Integration

```javascript
// When discharge summary generated
// Auto-push to NDHM (see previous NDHM integration docs)

POST /ndhm/push-discharge-summary
Body: {
  healthId,
  fhirResource: {...}
}
```

---

## 8. TECHNOLOGY STACK

### Frontend
- React.js (admin, doctor, billing portals)
- React Native (nurse bedside app - PWA)
- TypeScript
- Tailwind CSS + Material-UI

### Backend
- Node.js + Express.js
- TypeScript
- PostgreSQL (relational data)
- Redis (caching, sessions)
- Bull (async job queue)

### Infrastructure
- AWS EC2 (compute)
- RDS PostgreSQL (database)
- S3 (file storage - imaging, documents)
- CloudFront (CDN)
- Route 53 (DNS)

### DevOps
- Docker (containerization)
- GitHub Actions (CI/CD)
- AWS CodeDeploy (deployment)

### Monitoring
- CloudWatch (logs, metrics)
- Sentry (error tracking)
- New Relic (APM)

---

## 9. DEPLOYMENT ARCHITECTURE

```
┌─────────────────────────────────────────┐
│           Internet                      │
└──────────────┬──────────────────────────┘
               │
        ┌──────▼────────┐
        │ Route 53 DNS  │
        └──────┬────────┘
               │
        ┌──────▼────────────┐
        │  CloudFront CDN   │ (static assets)
        └──────┬────────────┘
               │
        ┌──────▼────────────────────────┐
        │  Application Load Balancer    │
        └──────┬─────────────────────────┘
               │
        ┌──────┴───────────────────────┐
        │                              │
   ┌────▼─────┐               ┌────────▼──────┐
   │ EC2 Web  │   (multi-AZ)  │  EC2 API      │
   │ Server 1 │───────────────│  Server 1     │
   └──────────┘               └───────────────┘
        │                              │
        └──────────┬───────────────────┘
                   │
           ┌───────▼────────┐
           │ RDS PostgreSQL │ (Multi-AZ)
           │ (Primary + Read│
           │    Replica)    │
           └────────────────┘
                   │
           ┌───────▼────────┐
           │  S3 Bucket     │ (imaging, documents)
           │  + Backups     │
           └────────────────┘
```

---

## 10. PERFORMANCE & SCALABILITY

### Database Optimization
- Indexes on frequently queried fields
- Partitioning for large tables (bills, visits by month)
- Read replicas for reporting queries
- Connection pooling (node-postgres)

### Caching
- Redis for session storage
- Redis for frequently accessed reference data (medicines, doctors, tests)
- CloudFront for static assets

### Load Balancing
- Application Load Balancer (AWS)
- Horizontal scaling: Add more EC2 instances as needed
- Database read replicas for reporting

### Monitoring & Alerts
- CloudWatch: CPU, memory, disk, network metrics
- Alerts: Email notifications if metrics exceed thresholds
- Performance monitoring: Track slow queries

### Performance Targets
- Page load time: < 2 seconds
- API response time: < 200ms (95th percentile)
- Database query time: < 100ms (average)
- System uptime: 99.5%+
- Concurrent users supported: 500+ simultaneously

---

**This is your complete technical architecture. Ready to develop.**

Next documents:
1. Hospital EHR Implementation Roadmap (6-month timeline)
2. Hospital Workflows & Operations Deep Dive
3. Deployment & Training Guide
4. Hospital Network Expansion Strategy
