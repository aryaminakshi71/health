# SURAKSHA - MATERNAL HEALTH PLATFORM
## MVP Technical Specification & Development Roadmap

**Version:** 1.0  
**Date:** December 2024  
**Status:** Ready to Build  
**Timeline:** 12 weeks (Jan-Mar 2025)

---

## EXECUTIVE SUMMARY

### What We're Building

A NDHM-integrated maternal health platform with 3 applications:

1. **ASHA Mobile App** (Android-first, offline-capable)
   - ASHA workers track pregnancies in villages
   - Record vital signs, identify complications
   - Alert clinics for referrals
   - Post-delivery baby tracking

2. **Clinic Web Portal** (React web app)
   - View referred pregnancies from ASHA network
   - Record ANC (antenatal care) visits
   - Generate discharge summaries (auto-push to NDHM PHR)
   - Dashboard of high-risk pregnancies

3. **Patient Mobile App** (React Native)
   - View pregnancy progress
   - Appointment reminders
   - Post-delivery baby health tracking
   - Simple patient engagement

### Core Principle
**Build NDHM-native from day 1** - Every health record created is:
- Linked to Health ID
- Stored as FHIR-R4 compliant
- Shareable via NDHM APIs
- Patient-owned and encrypted

### Why This Scope
- **MVP in 12 weeks** ← Must be achievable
- **Real pilot value** ← Clinics can actually use it
- **NDHM integration included** ← Not an afterthought
- **No fluff** ← Every feature solves real problem

### NOT in MVP (Phase 2)
❌ Telemedicine  
❌ Insurance claims  
❌ Advanced analytics/dashboards  
❌ Multi-clinic networks  
❌ Video consultations  
❌ Hospital EMR integration  

---

## PART 1: DETAILED FEATURE SPECIFICATION

### 1.1 ASHA Mobile App

**Platform:** Android 6.0+ (iOS in Phase 2)  
**Tech:** React Native  
**Storage:** SQLite (offline-first, encrypted)  
**Sync:** JSON over HTTPS when online

#### Screen 1: Login/Registration

**Purpose:** ASHA worker creates account

**Fields:**
- Phone number (Aadhaar alternative)
- Name
- Password
- District/Block selection
- Village/Sub-center assignment

**Logic:**
- Phone number = unique identifier
- First-time login = registration
- Subsequent login = auth
- Password stored hashed (bcrypt)

**NDHM Integration:**
- No NDHM login (too complex for ASHA)
- You'll request Health ID from clinic when pregnant woman arrives

**Database:**
```
asha_workers table:
- id (UUID)
- phone_number (unique, encrypted)
- name (text)
- district (select list)
- block (select list)
- village (text)
- created_at (timestamp)
- last_login (timestamp)
- app_version (text)
```

---

#### Screen 2: Home Dashboard

**Purpose:** ASHA sees overview of her pregnancies

**Layout:**
```
┌─────────────────────────────┐
│ SURAKSHA - Hello [Name]     │
├─────────────────────────────┤
│                             │
│ Active Pregnancies:    15   │
│ High-Risk Cases:       3    │
│ Due This Month:        5    │
│ Delivered (this month): 2   │
│                             │
├─────────────────────────────┤
│ [+ NEW PREGNANCY]           │
│ [VIEW ALL (15)]             │
│ [COMPLETED]                 │
│                             │
├─────────────────────────────┤
│ ALERTS (High-Risk)          │
│ • Priya Sharma (BP 160)     │
│ • Meera Singh (Bleeding)    │
│ • Anita Patel (Swelling)    │
│                             │
├─────────────────────────────┤
│ [SETTINGS] [SYNC] [HELP]    │
└─────────────────────────────┘
```

**Functionality:**
- Show count: Total pregnancies, high-risk, due this month, delivered
- List recent high-risk alerts (red, bold)
- Quick access buttons: New pregnancy, view all, completed
- Sync status indicator (shows if waiting to sync)

**Data Source:**
- Count from local SQLite (instant, offline)
- High-risk pregnancies: Filter by risk_level = "HIGH"
- Due this month: Filter by due_date BETWEEN today and +30 days

---

#### Screen 3: Register New Pregnancy

**Purpose:** ASHA creates entry for new pregnant woman

**Form Fields:**
```
[Header: NEW PREGNANCY REGISTRATION]

[Text Input] Woman's Full Name *
[Text Input] Phone Number
[Text Input] Age *
[Text Input] Address/Village *

[Select] Last Menstrual Period (LMP) Date *
  [Date Picker Calendar]

[Select] Medical History (Multi-select)
  ☐ Diabetes
  ☐ High Blood Pressure
  ☐ Previous Delivery Complications
  ☐ Previous C-Section
  ☐ Multiple Pregnancy
  ☐ Severe Anemia
  ☐ No known issues

[Text Area] Additional Notes
[Optional 100 chars]

[Radio Button] Has she registered at clinic?
  ○ Yes, Doctor: ___________
  ○ No, will register soon
  ○ Don't know

[Button: SAVE PREGNANCY]
[Button: CANCEL]
```

**Validation:**
```
- Name: Required, min 3 chars, no numbers
- Age: Required, 15-50 range (flag if <18 or >45)
- LMP Date: Required, can't be >280 days ago (9 months)
  - If >280 days: Show warning "Date seems old. Proceed?"
- Address: Required, min 5 chars
- Phone: Optional, but if provided validate format
```

**Auto-Calculations:**
```
If LMP = "Dec 1, 2024":
  → Current Weeks = 4 weeks
  → Current Trimester = "First Trimester"
  → Expected Delivery Date = Sep 8, 2025
  → Days Remaining = 255 days
```

**Risk Scoring:**
```
Automatic Risk Assessment:
  Base Risk = "LOW"
  
  Add "HIGH" if ANY:
    - Age < 18 or > 35
    - Previous complications checked
    - Multiple pregnancy
    - Severe anemia
    
  Result: "LOW RISK" or "HIGH RISK" (color coded: green/red)
```

**Database:**
```
pregnancies table:
- id (UUID, primary key)
- asha_id (foreign key to asha_workers)
- woman_name (text, encrypted)
- phone (text, encrypted, nullable)
- age (integer)
- village (text)
- lmp_date (date)
- current_weeks (integer, calculated)
- trimester (text: "First", "Second", "Third")
- expected_delivery_date (date, calculated)
- risk_level (enum: "LOW", "HIGH")
- medical_history (JSON: [{diabetes: true}, {bp: false}])
- registered_at_clinic (boolean)
- clinic_name (text, nullable)
- doctor_name (text, nullable)
- notes (text, nullable)
- status (enum: "ACTIVE", "DELIVERED", "REFERRED", "LOST_FOLLOW_UP")
- created_at (timestamp)
- updated_at (timestamp)
- synced_at (timestamp, nullable)
- health_id (text, nullable) [NDHM - added when clinic registers]
```

**Offline Behavior:**
- Save to local SQLite immediately
- Show: "✓ Saved locally" + sync icon
- When online: Auto-sync to server
- Sync visual: Spinning circle → ✓ Synced (green)

---

#### Screen 4: View Pregnancy Details

**Purpose:** ASHA sees full pregnancy record, can update

**Layout:**
```
┌──────────────────────────────────┐
│ [←] PRIYA SHARMA (25y)           │
├──────────────────────────────────┤
│                                  │
│ Status: ACTIVE (4 months)        │
│ Risk: HIGH (BP History)          │
│                                  │
│ LMP Date: Dec 1, 2024            │
│ Weeks Pregnant: 4 weeks          │
│ Expected Delivery: Sep 8, 2025   │
│ Days Remaining: 255 days         │
│                                  │
├──────────────────────────────────┤
│ LAST ANC VISIT: Not recorded     │
│ [+ RECORD ANC VISIT]             │
│                                  │
├──────────────────────────────────┤
│ VITAL SIGNS TRACKING             │
│ [+ RECORD VITAL SIGNS]           │
│                                  │
│ Last recorded: 2 days ago        │
│ BP: 140/90 ⚠️  (High)            │
│ Weight: 62 kg                    │
│ Swelling: Yes                    │
│                                  │
├──────────────────────────────────┤
│ MEDICATIONS & SUPPLEMENTS        │
│ ☑ Iron (daily)                   │
│ ☑ Folic Acid (daily)             │
│ ☑ TT Vaccination (done)          │
│ ☐ Calcium (pending)              │
│                                  │
├──────────────────────────────────┤
│ ALERTS                           │
│ ⚠️  HIGH BP - Check this week    │
│ ⚠️  Swelling noticed - Monitor   │
│                                  │
├──────────────────────────────────┤
│ [EDIT] [REFER TO CLINIC] [DELETE]│
└──────────────────────────────────┘
```

**Key Features:**
- Show all pregnancy details (auto-calculated weeks/trimester)
- Display last ANC visit status
- Quick record vital signs button
- Show medications/supplements checklist
- Display automated alerts (red warnings)
- Edit/refer/delete options

---

#### Screen 5: Record ANC Visit

**Purpose:** ASHA records antenatal care visit details

**Form:**
```
[Header: ANC VISIT - PRIYA SHARMA]
[Date of Visit: Auto-fill today, allow change]

VITAL SIGNS:
[Number Input] Blood Pressure (Systolic): 140
[Number Input] Blood Pressure (Diastolic): 90
[Number Input] Weight (kg): 62
[Number Input] Hemoglobin (g/dl): 10.5 [Optional]

SYMPTOMS (Check any):
☑ Bleeding
☑ Swelling (edema)
☑ Headache
☑ Vision problems
☐ Severe pain
☐ Convulsions
☐ Unconsciousness

MEDICATIONS GIVEN:
☑ Iron Tablet
☑ Folic Acid
☑ Calcium
☐ Antacid

VACCINATIONS:
☐ TT Dose 1
☑ TT Dose 2 (Given today)
☐ TT Booster

COUNSELING PROVIDED (Check any):
☑ Nutrition advice
☑ Delivery planning
☑ Danger signs education
☑ Breastfeeding information

NEXT VISIT DATE:
[Date Picker: Default +2 weeks]

REFERRED TO CLINIC:
○ No
○ Yes, Reason: [Text]

NOTES:
[Text Area - optional]

[SAVE ANC VISIT]
```

**Validation:**
```
BP Systolic > 160 OR Diastolic > 110 → Alert: "HIGH BP - Refer to clinic"
Bleeding > 0 → Alert: "BLEEDING - REFER IMMEDIATELY"
Swelling + Headache → Alert: "Possible Preeclampsia - Refer"
Hemoglobin < 8 → Alert: "SEVERE ANEMIA - Refer for transfusion"
```

**Database:**
```
anc_visits table:
- id (UUID)
- pregnancy_id (foreign key)
- visit_date (date)
- bp_systolic (integer)
- bp_diastolic (integer)
- weight_kg (decimal)
- hemoglobin (decimal, nullable)
- symptoms (JSON: [{bleeding: true}, {swelling: true}])
- medications_given (JSON)
- vaccinations (JSON)
- counseling_provided (JSON)
- next_visit_date (date)
- referred_to_clinic (boolean)
- referral_reason (text, nullable)
- alert_generated (boolean)
- alert_message (text, nullable)
- notes (text, nullable)
- created_at (timestamp)
- synced_at (timestamp, nullable)
```

**Auto-Alert Logic:**
```
IF bp_systolic > 160 OR bp_diastolic > 110:
  CREATE ALERT: "HIGH BP - Schedule clinic visit this week"
  
IF bleeding = true:
  CREATE ALERT: "BLEEDING - REFER TO HOSPITAL IMMEDIATELY"
  Send URGENT notification to clinic
  
IF swelling AND (headache OR vision_problems):
  CREATE ALERT: "Possible Preeclampsia - URGENT clinic referral"
  Send URGENT notification to clinic
  
IF hemoglobin < 8:
  CREATE ALERT: "Severe Anemia - May need transfusion"
  Send notification to clinic
```

---

#### Screen 6: Pregnancy Status & Completion

**Purpose:** Mark pregnancy as delivered or completed

**When to Mark as Delivered:**
- ASHA attends delivery (home or clinic)
- Or gets confirmation from clinic

**Form:**
```
[Header: DELIVERY DETAILS]

DELIVERY DATE:
[Date Picker]

DELIVERY LOCATION:
○ Home delivery
○ Government clinic
○ Private clinic
○ Hospital

DELIVERY TYPE:
○ Normal vaginal delivery
○ C-Section (Cesarean)
○ Instrumental (forceps/vacuum)
○ Unknown

BIRTH OUTCOME:
○ Single baby
○ Twins
○ Triplets

BABY GENDER:
○ Male
○ Female
○ Not known

BABY WEIGHT (if known):
[Number Input] kg

MOTHER STATUS:
○ Healthy, no complications
○ Had complications (describe):
  [Text Area]

BABY STATUS:
○ Healthy
○ Health complications (describe):
  [Text Area]

STILL BIRTH / NEONATAL DEATH:
○ No
○ Yes (describe):
  [Text Area]

NOTES:
[Text Area]

[MARK AS DELIVERED]
```

**Database:**
```
deliveries table:
- id (UUID)
- pregnancy_id (foreign key)
- delivery_date (date)
- location (enum)
- delivery_type (enum)
- num_babies (integer)
- baby_gender (enum)
- baby_weight_kg (decimal, nullable)
- mother_status (text)
- mother_complications (text, nullable)
- baby_status (text)
- baby_complications (text, nullable)
- stillbirth (boolean)
- neonatal_death (boolean)
- notes (text, nullable)
- created_at (timestamp)
- synced_at (timestamp, nullable)
```

---

#### Screen 7: Post-Delivery Baby Tracking

**Purpose:** ASHA tracks baby health for first 28 days

**Form (appears after delivery marked):**
```
[Header: BABY FOLLOW-UP - BOY (Priya's Baby)]

[Radio] Days old:
  ○ Day 1
  ○ Day 3
  ○ Day 7
  ○ Day 14
  ○ Day 28

BABY HEALTH:
☑ Feeding well
☑ Urine output normal
☑ Stool output normal
☐ Jaundice (yellow skin)
☐ Infection signs (fever, discharge)
☐ Feeding difficulty
☐ Breathing problems

VACCINATIONS GIVEN:
☑ BCG (Tuberculosis)
☑ OPV Dose 1 (Polio)
☐ Hepatitis B

VISIT TO CLINIC:
○ No
○ Yes, Date: [Date]
  Reason: [Text]

MOTHER'S HEALTH:
☑ Recovery normal
☐ Bleeding
☐ Infection
☐ Depression signs
☐ Breastfeeding issues

NOTES:
[Text Area]

[SAVE FOLLOW-UP]
```

**Database:**
```
baby_followups table:
- id (UUID)
- delivery_id (foreign key)
- days_old (integer: 1, 3, 7, 14, 28)
- feeding_well (boolean)
- urine_normal (boolean)
- stool_normal (boolean)
- health_issues (JSON)
- vaccinations_given (JSON)
- clinic_visit (boolean)
- mother_health_status (JSON)
- notes (text, nullable)
- created_at (timestamp)
- synced_at (timestamp, nullable)
```

---

#### Screen 8: Settings

**Purpose:** Configuration + account management

**Options:**
```
[Header: SETTINGS]

ACCOUNT:
- Name: [Editable]
- Phone: [Editable]
- District: [Select]
- Block: [Select]
- Village: [Select]
- [SAVE CHANGES]

NOTIFICATIONS:
☑ High-risk alerts
☑ Delivery reminders
☑ Sync notifications
[SAVE]

DATA:
- Pregnancies Recorded: 25
- Deliveries Recorded: 18
- Sync Status: Last synced 2 hours ago
- [MANUAL SYNC NOW]
- [CLEAR LOCAL CACHE] (careful!)

APP:
- App Version: 1.0.0
- Data Stored: 45 MB
- [CHECK FOR UPDATES]

HELP & ABOUT:
- [HOW TO USE]
- [REPORT BUG]
- [CONTACT SUPPORT]
- App Version: 1.0.0

[LOGOUT]
```

---

### 1.2 Clinic Web App

**Platform:** Web (React)  
**Device:** Desktop/Laptop/Tablet  
**Tech:** React.js, TypeScript, Tailwind CSS  
**Database:** PostgreSQL (on AWS RDS)

#### Overview Dashboard

**Purpose:** Clinic sees overview of all referred pregnancies

**Layout:**
```
┌─────────────────────────────────────────────┐
│ SURAKSHA CLINIC PORTAL - [Clinic Name]      │
├─────────────────────────────────────────────┤
│                                             │
│ TODAY'S STATUS:                             │
│ Active Pregnancies: 25                      │
│ High-Risk: 3                                │
│ Due Today: 0                                │
│ Due This Week: 2                            │
│                                             │
│ [PATIENT LIST] [REFERRALS] [DELIVERIES]    │
│                                             │
├─────────────────────────────────────────────┤
│ HIGH-RISK ALERTS (Referrals from ASHA)      │
│                                             │
│ • Priya Sharma (HIGH BP) - Referred 2 days  │
│   ASHA: Meena Singh (Village: X)            │
│   [VIEW] [RECORD ANC] [DISCHARGE]           │
│                                             │
│ • Meera Singh (BLEEDING) - Referred today   │
│   ASHA: Sunita Devi (Village: Y)            │
│   [VIEW] [RECORD ANC] [DISCHARGE]           │
│                                             │
│ • Anita Patel (SWELLING) - Referred 1 day   │
│   ASHA: Priya Kumar (Village: Z)            │
│   [VIEW] [RECORD ANC] [DISCHARGE]           │
│                                             │
├─────────────────────────────────────────────┤
│ RECENT DELIVERIES (This Month):             │
│ • Kavya Verma (Normal) - Mar 10             │
│ • Anjali Singh (C-Section) - Mar 8          │
│ • Divya Patel (Normal) - Mar 5              │
│                                             │
└─────────────────────────────────────────────┘
```

**Key Metrics:**
- Active pregnancies count
- High-risk count
- Due today/this week
- Referrals waiting for action
- Recent deliveries

---

#### Patient List Page

**Purpose:** Search and view all pregnant women under this clinic

**Interface:**
```
[Search Box: Name / Phone / ASHA Name]
[Filter: All / High-Risk / Due This Week]
[Sort: By Name / By Risk / By Due Date]

┌─────────────────────────────────────────┐
│ NAME        │ AGE │ RISK  │ DUE DATE  │
├─────────────────────────────────────────┤
│ Priya S.    │ 25  │ HIGH  │ Sep 8     │
│ Meera Singh │ 32  │ LOW   │ Oct 12    │
│ Anita P.    │ 28  │ HIGH  │ Aug 25    │
│ Kavya V.    │ 24  │ LOW   │ Sep 30    │
│ [10 more...]                          │
│                                       │
│ [PREVIOUS PAGE] Page 1 of 3 [NEXT]    │
└─────────────────────────────────────────┘

Click on any row → View full patient record
```

---

#### Patient Detail Page

**Purpose:** View complete pregnancy record, update as needed

**Layout:**
```
┌────────────────────────────────────────────┐
│ [←] PRIYA SHARMA (25 years)                │
├────────────────────────────────────────────┤
│                                            │
│ BASIC INFO                                 │
│ Status: ACTIVE (4 months)                  │
│ Risk Level: HIGH (Previous BP issues)      │
│ Phone: 98XXXXXXXX                          │
│ Address: Village A, Block B, District C    │
│                                            │
│ LMP: Dec 1, 2024 | Expected Delivery: Sep8│
│                                            │
├────────────────────────────────────────────┤
│ REFERRED BY ASHA                           │
│ Name: Meena Singh (ASHA #123)              │
│ Village: Village X                         │
│ Reason: HIGH BP, Swelling                  │
│ Referred Date: Mar 15, 2025                │
│                                            │
├────────────────────────────────────────────┤
│ CLINIC VISITS (ANC)                        │
│                                            │
│ Visit 1 - Mar 15 (Today)                   │
│ ├─ BP: 140/90 (HIGH) ⚠️                   │
│ ├─ Weight: 62 kg                           │
│ ├─ Symptoms: Swelling, Headache            │
│ └─ Action: Continue monitoring, refer to   │
│            hospital if worsens             │
│                                            │
│ [+ ADD ANC VISIT]                          │
│                                            │
├────────────────────────────────────────────┤
│ ALERTS GENERATED                           │
│ ⚠️  HIGH BP - Manage with medication      │
│ ⚠️  Possible Preeclampsia - Monitor close  │
│                                            │
├────────────────────────────────────────────┤
│ ACTIONS:                                   │
│ [RECORD ANC VISIT]                         │
│ [GENERATE DISCHARGE SUMMARY]               │
│ [REFER TO HOSPITAL]                        │
│ [MARK AS DELIVERED]                        │
│ [EDIT] [NOTES]                             │
│                                            │
└────────────────────────────────────────────┘
```

---

#### Record ANC Visit (Clinic Version)

**Form:**
```
[Header: RECORD ANC VISIT - PRIYA SHARMA]
[Visit Date: Mar 15, 2025]

VITAL SIGNS:
[Input] BP Systolic: 140 mmHg
[Input] BP Diastolic: 90 mmHg
[Input] Weight: 62 kg
[Input] Hemoglobin: 10.5 g/dl
[Input] Urine Protein: [Negative/Trace/+1/+2/+3]
[Input] Urine Glucose: [Negative/Present]

EXAMINATION:
[Textarea] General Examination Findings:
[Textarea] Abdominal Examination:
[Textarea] Speculum Examination:
[Textarea] Per Vaginal Examination:

ULTRASOUND (if done):
[Input] Fetal Heartrate: 140 bpm
[Input] Amniotic Fluid: [Adequate/Low/Excess]
[Input] Fetal Position: [Cephalic/Breech/Transverse]
[Input] Estimated Fetal Weight: kg
[Textarea] Ultrasound Notes:

INVESTIGATIONS ORDERED:
☑ Blood test (CBC)
☑ Blood sugar test
☐ Thyroid test
☐ Syphilis test
☐ HIV test

DIAGNOSIS:
[Textarea] Clinical Diagnosis:

TREATMENT PLAN:
[Textarea] Medications:
[Textarea] Advice given:
[Textarea] Referral if needed:

NEXT VISIT:
[Date Picker] Default: +2 weeks

[SAVE ANC VISIT]
[SAVE & GENERATE DISCHARGE]
```

**Database:**
```
clinic_anc_visits table:
- id (UUID)
- pregnancy_id (FK)
- visit_date (date)
- bp_systolic (int)
- bp_diastolic (int)
- weight (decimal)
- hemoglobin (decimal)
- urine_protein (enum)
- urine_glucose (enum)
- general_exam (text)
- abdominal_exam (text)
- speculum_exam (text)
- pvx_exam (text)
- ultrasound_fhr (int)
- ultrasound_afv (enum)
- fetal_position (enum)
- estimated_fetal_weight (decimal)
- ultrasound_notes (text)
- investigations_ordered (JSON)
- clinical_diagnosis (text)
- medications (text)
- advice (text)
- referral (text, nullable)
- next_visit_date (date)
- created_at (timestamp)
- created_by (doctor_id)
- synced_to_ndhm (boolean)
- ndhm_resource_id (text, nullable)
```

---

#### Generate Discharge Summary

**Purpose:** Create formal discharge summary (auto-pushes to NDHM)

**Template:**
```
═══════════════════════════════════════════════════
         ANTENATAL CARE DISCHARGE SUMMARY
═══════════════════════════════════════════════════

PATIENT INFORMATION:
Name: Priya Sharma
Age: 25 years
Phone: 98XXXXXXXX
Address: Village A, Block B, District C

PREGNANCY DETAILS:
Date of Admission: Mar 15, 2025
LMP: Dec 1, 2024
Current Weeks: 4 weeks
Trimester: First Trimester
Expected Delivery: Sep 8, 2025

CLINICAL FINDINGS:
BP: 140/90 mmHg (Elevated)
Weight: 62 kg
Hemoglobin: 10.5 g/dl (Low-Normal)
Urine: Protein Negative, Glucose Negative

ULTRASOUND FINDINGS:
Fetal Heartrate: 140 bpm
Amniotic Fluid: Adequate
Fetal Position: Cephalic
Estimated Fetal Weight: 500g

DIAGNOSIS:
1. Primigravida with 4 weeks pregnancy
2. Chronic Hypertension (on monitoring)
3. Mild anemia

TREATMENT PROVIDED:
- Iron supplement: 1 tablet daily
- Folic Acid: 1 tablet daily
- Advice on diet, rest, hygiene
- Counseling on danger signs

MEDICATIONS PRESCRIBED:
1. Iron Ferrous 300mg daily
2. Folic Acid 5mg daily
3. Calcium 500mg daily
4. Vitamin B Complex daily

INVESTIGATIONS DONE:
✓ Blood Pressure: 140/90
✓ Weight: 62 kg
✓ Hemoglobin: 10.5

INVESTIGATIONS ORDERED:
□ CBC (Blood test)
□ Blood glucose
□ Thyroid function

ADVICE GIVEN:
- Attend next ANC visit in 2 weeks
- Maintain food & water hygiene
- Avoid physical strain
- Report if: Heavy bleeding, severe headache, vision changes, 
  severe swelling, convulsions

REFERRED TO:
- Next visit at clinic: Apr 12, 2025
- Hospital referral: If complications develop

DISCHARGE SUMMARY SIGNED BY:
Dr. Rajesh Kumar
Obstetrics & Gynecology
Registration: [License]
Date: Mar 15, 2025

═══════════════════════════════════════════════════
```

**Technical Handling:**
```
1. Generate PDF from template
2. Convert to FHIR-R4 DiagnosticReport resource
3. Create discharge summary as HIP (Health Information Provider)
4. If patient has Health ID: Auto-push to her PHR
5. Patient gets notification: "Your discharge summary uploaded to health record"
6. Store in our database + mark synced_to_ndhm = true
```

**Database:**
```
discharge_summaries table:
- id (UUID)
- pregnancy_id (FK)
- clinic_visit_id (FK)
- pdf_file_path (text)
- html_content (text)
- created_date (date)
- created_by_doctor_id (FK)
- health_id (text, nullable) [NDHM]
- pushed_to_ndhm (boolean)
- ndhm_timestamp (timestamp, nullable)
- patient_notified (boolean)
- created_at (timestamp)
```

---

#### Referral to Hospital

**Purpose:** Send patient to hospital if complicated

**Form:**
```
[Header: REFER TO HOSPITAL]

REFERRAL DETAILS:
[Select] Refer to Hospital/Facility:
  - Government Hospital (District)
  - Private Hospital A
  - Medical College Hospital

REFERRAL REASON:
[Select] Primary Issue:
  ○ High Blood Pressure (>160/110)
  ○ Bleeding/Spotting
  ○ Severe Anemia
  ○ Preeclampsia symptoms
  ○ Other: [Text]

URGENCY:
○ Routine (within 1 week)
○ Urgent (within 24-48 hours)
○ EMERGENCY (TODAY)

CLINICAL SUMMARY:
[Textarea - Auto-filled with key findings]

DOCUMENTS TO SEND:
☑ ANC records
☑ Ultrasound report
☑ Lab reports
☑ Discharge summary

[CONFIRM REFERRAL]
[PRINT REFERRAL LETTER]
```

---

#### Delivery Outcome Recording

**Purpose:** Record delivery outcome when baby born

**Form:**
```
[Header: RECORD DELIVERY]

DELIVERY DATE: [Date]
DELIVERY TIME: [Time]

DELIVERY LOCATION:
○ This clinic
○ Government hospital
○ Private hospital
○ Home (assisted)

DELIVERY TYPE:
○ Normal vaginal
○ Assisted (forceps/vacuum)
○ C-Section

INDICATIONS FOR C-SECTION (if applicable):
[Checkboxes: Cephalopelvic disproportion, Fetal distress, etc.]

BABY OUTCOME:
[Radio] Baby Gender: ○ Male ○ Female ○ Not recorded

[Input] Birth Weight: kg
[Input] Birth Length: cm
[Input] APGAR Score (1 min): [0-10]
[Input] APGAR Score (5 min): [0-10]

BABY STATUS:
○ Healthy, normal
○ Minor complications: [Describe]
○ Serious complications: [Describe]

BABY FEEDING:
○ Breastfeeding started immediately
○ Breastfeeding started delayed: [Why]
○ Not breastfeeding: [Reason]

STILLBIRTH / NEONATAL DEATH:
○ No
○ Yes - [Date/Time], [Cause of death if known]

MOTHER OUTCOME:
○ Healthy recovery
○ Complications: [Describe]

POSTPARTUM BLEEDING:
[Input] Blood loss estimated: ml
○ Normal (<500ml)
○ PPH (>500ml) - [Management]

MATERNAL COMPLICATIONS:
☑ Retained Placenta
☐ Uterine Rupture
☐ Amniotic Fluid Embolism
☐ Anesthesia Complication
☐ Infection
☐ Other: [Text]

TREATMENT FOR COMPLICATIONS:
[Textarea]

DISCHARGE PLAN:
[Textarea - Mother care instructions]
[Textarea - Baby care instructions]
[Textarea - When to return]

OUTCOME SUMMARY:
[Auto-filled] Mother: [Status] | Baby: [Status]

[SAVE DELIVERY OUTCOME]
```

---

### 1.3 Patient Mobile App

**Platform:** iOS + Android  
**Tech:** React Native  
**Purpose:** Patient engagement + simple tracking

#### Key Screens:

**1. Login/Onboarding**
```
Scan clinic QR code OR
Enter clinic code: ________

OR

Register with phone: 98________ 
[Connect to NDHM Health ID]
```

**2. Pregnancy Dashboard**
```
YOUR PREGNANCY PROGRESS

4 Weeks Pregnant ▓▓▓▓░░░░░░ (40% done)

Expected Delivery: Sep 8, 2025
Time Remaining: 255 days

[NEXT APPOINTMENT: Mar 27]
Location: Clinic Name
Doctor: Dr. Rajesh

[HEALTH TRACKING]
- Last BP Check: 140/90 (High)
- Last Weight: 62 kg
- Hemoglobin: 10.5 g/dl

[HEALTH RECORDS]
- View my ANC visits
- View discharge summaries
- View lab reports
```

**3. Appointment Reminders**
```
Your appointment is in 5 days

[📅] Date: Mar 27, 2025
[⏰] Time: 2:00 PM
[📍] Location: City Clinic, Sector 5
[👨‍⚕️] Doctor: Dr. Rajesh Kumar

[SET REMINDER] [GET DIRECTIONS] [RESCHEDULE]
```

**4. Health Tips**
```
This Week's Tips (4 weeks pregnant)

✓ Eat iron-rich foods (spinach, meat, lentils)
✓ Take folic acid supplement
✓ Avoid heavy lifting
✓ Drink 2-3 liters water daily
✓ Get adequate sleep

[CALL DOCTOR] [CHAT WITH MIDWIFE] [BACK]
```

**5. Danger Signs**
```
⚠️  WARNING SIGNS

Call doctor IMMEDIATELY if you have:

🚨 Heavy vaginal bleeding
🚨 Severe abdominal pain
🚨 Severe headache with vision changes
🚨 Convulsions/Seizures
🚨 Unconsciousness
🚨 Severe swelling of face/hands
🚨 Severe shortness of breath

[CALL EMERGENCY] [CHAT DOCTOR] [BACK]
```

---

## PART 2: TECHNICAL ARCHITECTURE

### 2.1 System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ASHA Mobile      │    Clinic Web App    │   Patient Mobile   │
│  (React Native)   │    (React.js)        │   (React Native)   │
│  Android 6.0+     │    Desktop/Laptop    │   iOS + Android    │
│                                                                │
└──────────┬──────────────────────────┬──────────────────────────┘
           │                          │
           │                          │
        HTTP/HTTPS              HTTP/HTTPS
        (REST APIs)             (REST APIs)
           │                          │
           └──────────────┬───────────┘
                          │
┌─────────────────────────▼────────────────────────────────────────┐
│                    BACKEND API SERVER                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Technology: Node.js + Express.js                              │
│  Language: JavaScript/TypeScript                               │
│  Port: 3000                                                    │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │           API Routes & Business Logic                   │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │ POST   /auth/login                                      │ │
│  │ POST   /auth/register                                  │ │
│  │ POST   /pregnancies (ASHA: create)                     │ │
│  │ GET    /pregnancies/:id (clinic: view)                 │ │
│  │ POST   /anc-visits (clinic: record)                    │ │
│  │ POST   /discharge-summary (clinic: generate)           │ │
│  │ POST   /sync (mobile: offline sync)                    │ │
│  │ POST   /ndhm/health-id-lookup                          │ │
│  │ POST   /ndhm/push-to-phr (send data to NDHM)           │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │           Middleware                                    │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │ • Authentication (JWT tokens)                           │ │
│  │ • Role-based access control (ASHA/Clinic/Admin)        │ │
│  │ • Request validation                                   │ │
│  │ • Error handling                                       │ │
│  │ • Logging & monitoring                                 │ │
│  │ • CORS (for web app)                                  │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
└────────────────────┬─────────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┬──────────────┐
        │            │            │              │
     Database    Cache/Queue   NDHM APIs      Analytics
        │            │            │              │
        │            │            │              │
┌───────▼──────┐ ┌──▼─────┐ ┌───▼────────┐ ┌──▼──────┐
│ PostgreSQL   │ │ Redis  │ │ NDHM APIs: │ │ Google  │
│ (AWS RDS)    │ │(Cache) │ │ • Health ID│ │ Analytics
│              │ │        │ │ • HIP APIs │ │ (Events)
│ Tables:      │ │Queue   │ │ • PHR Push │ │
│ - asha_      │ │(Sync)  │ │ • Consent  │ │ Logs:
│   workers    │ │        │ │ • Registries
│ - pregnancies│ │        │ │            │ │ - CloudWatch
│ - anc_visits │ │        │ │            │ │ - Sentry
│ - deliveries │ │        │ │            │ │   (errors)
│ - users      │ │        │ │            │ │
└──────────────┘ └────────┘ └────────────┘ └─────────┘
```

---

### 2.2 Database Schema (PostgreSQL)

**Key Tables:**

```sql
-- ASHA Workers
CREATE TABLE asha_workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  district VARCHAR(50) NOT NULL,
  block VARCHAR(50) NOT NULL,
  village VARCHAR(100) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- Clinic Users
CREATE TABLE clinic_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role ENUM('doctor', 'nurse', 'admin') NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Clinics
CREATE TABLE clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  address TEXT NOT NULL,
  district VARCHAR(50) NOT NULL,
  block VARCHAR(50) NOT NULL,
  phone VARCHAR(20),
  ndhm_registered BOOLEAN DEFAULT false,
  hip_api_key VARCHAR(255),
  hip_encrypted_key VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Pregnancies
CREATE TABLE pregnancies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asha_worker_id UUID NOT NULL REFERENCES asha_workers(id),
  clinic_id UUID REFERENCES clinics(id),
  woman_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  age INTEGER NOT NULL,
  village VARCHAR(100) NOT NULL,
  lmp_date DATE NOT NULL,
  current_weeks INTEGER GENERATED ALWAYS AS (
    FLOOR(EXTRACT(DAY FROM (CURRENT_DATE - lmp_date))/7)
  ) STORED,
  trimester VARCHAR(20) GENERATED ALWAYS AS (
    CASE 
      WHEN current_weeks <= 13 THEN 'First'
      WHEN current_weeks <= 26 THEN 'Second'
      ELSE 'Third'
    END
  ) STORED,
  expected_delivery_date DATE GENERATED ALWAYS AS (
    lmp_date + INTERVAL '280 days'
  ) STORED,
  risk_level ENUM('LOW', 'HIGH') NOT NULL,
  medical_history JSONB,
  registered_at_clinic BOOLEAN DEFAULT false,
  clinic_name VARCHAR(200),
  doctor_name VARCHAR(100),
  status ENUM('ACTIVE', 'DELIVERED', 'REFERRED', 'LOST_FOLLOW_UP') DEFAULT 'ACTIVE',
  health_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  synced_at TIMESTAMP,
  synced_to_ndhm BOOLEAN DEFAULT false
);

-- ANC Visits
CREATE TABLE anc_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pregnancy_id UUID NOT NULL REFERENCES pregnancies(id),
  recorded_by_id UUID NOT NULL, -- ASHA or doctor ID
  recorded_by_type ENUM('ASHA', 'CLINIC') NOT NULL,
  visit_date DATE NOT NULL,
  bp_systolic INTEGER,
  bp_diastolic INTEGER,
  weight_kg DECIMAL(5,2),
  hemoglobin DECIMAL(4,2),
  symptoms JSONB,
  medications_given JSONB,
  vaccinations JSONB,
  counseling_provided JSONB,
  next_visit_date DATE,
  referred_to_clinic BOOLEAN DEFAULT false,
  referral_reason TEXT,
  alert_generated BOOLEAN DEFAULT false,
  alert_message TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  synced_at TIMESTAMP,
  synced_to_ndhm BOOLEAN DEFAULT false
);

-- Deliveries
CREATE TABLE deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pregnancy_id UUID NOT NULL REFERENCES pregnancies(id),
  recorded_by_id UUID NOT NULL,
  recorded_by_type ENUM('ASHA', 'CLINIC') NOT NULL,
  delivery_date DATE NOT NULL,
  delivery_time TIME,
  location VARCHAR(50),
  delivery_type VARCHAR(50),
  num_babies INTEGER,
  baby_gender VARCHAR(20),
  baby_weight_kg DECIMAL(4,2),
  mother_status TEXT,
  mother_complications TEXT,
  baby_status TEXT,
  baby_complications TEXT,
  stillbirth BOOLEAN DEFAULT false,
  neonatal_death BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  synced_to_ndhm BOOLEAN DEFAULT false
);

-- Discharge Summaries
CREATE TABLE discharge_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pregnancy_id UUID NOT NULL REFERENCES pregnancies(id),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  anc_visit_id UUID REFERENCES anc_visits(id),
  pdf_file_path TEXT,
  html_content TEXT,
  created_date DATE NOT NULL,
  created_by_doctor_id UUID NOT NULL,
  health_id VARCHAR(50),
  pushed_to_ndhm BOOLEAN DEFAULT false,
  ndhm_timestamp TIMESTAMP,
  ndhm_resource_id TEXT,
  patient_notified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Baby Follow-ups
CREATE TABLE baby_followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id UUID NOT NULL REFERENCES deliveries(id),
  recorded_by_id UUID NOT NULL,
  days_old INTEGER,
  feeding_well BOOLEAN,
  urine_normal BOOLEAN,
  stool_normal BOOLEAN,
  health_issues JSONB,
  vaccinations_given JSONB,
  clinic_visit BOOLEAN,
  mother_health_status JSONB,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  synced_at TIMESTAMP,
  synced_to_ndhm BOOLEAN DEFAULT false
);

-- NDHM Sync Log (track what was pushed to NDHM)
CREATE TABLE ndhm_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type VARCHAR(50), -- 'Patient', 'Encounter', 'Observation', etc.
  resource_id TEXT,
  local_id UUID,
  fhir_resource JSONB,
  ndhm_response JSONB,
  status ENUM('PENDING', 'SUCCESS', 'FAILED'),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  synced_at TIMESTAMP
);
```

---

### 2.3 API Specifications (Key Endpoints)

#### Authentication

```
POST /auth/register
Body: {
  phone: "98XXXXXX",
  password: "securepass123",
  name: "ASHA Name",
  district: "Gurugram",
  block: "Manesar",
  village: "Village Name",
  role: "ASHA" // or "CLINIC_DOCTOR"
}

Response: {
  token: "eyJhbGc...",
  user: { id, name, role },
  expiresIn: 86400
}

POST /auth/login
Body: { phone, password }
Response: { token, user, expiresIn }

POST /auth/logout
Response: { success: true }
```

#### Pregnancy Management

```
POST /pregnancies
Headers: Authorization: Bearer {token}
Body: {
  woman_name: "Priya Sharma",
  age: 25,
  phone: "98XXXXXX",
  village: "Village X",
  lmp_date: "2024-12-01",
  medical_history: { diabetes: false, high_bp: true },
  notes: "Optional notes"
}

Response: {
  id: "uuid",
  current_weeks: 4,
  trimester: "First",
  risk_level: "HIGH",
  status: "ACTIVE"
}

GET /pregnancies/:id
Response: { Full pregnancy object with all visits }

PUT /pregnancies/:id
Body: { Updated fields }
Response: { Updated pregnancy }

GET /pregnancies
Query params: ?filter=active&sort=due_date&page=1
Response: { pregnancies: [...], total: 150, page: 1 }
```

#### ANC Visits

```
POST /anc-visits
Headers: Authorization: Bearer {token}
Body: {
  pregnancy_id: "uuid",
  visit_date: "2025-03-15",
  bp_systolic: 140,
  bp_diastolic: 90,
  weight_kg: 62.0,
  hemoglobin: 10.5,
  symptoms: { bleeding: true, swelling: true },
  medications_given: { iron: true, folic_acid: true },
  next_visit_date: "2025-03-29"
}

Response: {
  id: "uuid",
  alert_generated: true,
  alert_message: "HIGH BP - Schedule clinic visit this week"
}

GET /anc-visits/:pregnancy_id
Response: { visits: [...] }
```

#### Discharge Summary

```
POST /discharge-summary
Headers: Authorization: Bearer {token}
Body: {
  pregnancy_id: "uuid",
  anc_visit_id: "uuid",
  clinical_diagnosis: "Primigravida with hypertension",
  medications: "Iron 300mg daily, Folic acid 5mg",
  next_visit_date: "2025-03-29"
}

Response: {
  id: "uuid",
  pdf_url: "https://bucket.s3.amazonaws.com/discharge_123.pdf",
  pushed_to_ndhm: false,
  health_id: "uuid-abc"
}

POST /discharge-summary/:id/push-to-ndhm
Response: {
  ndhm_resource_id: "uuid",
  timestamp: "2025-03-15T10:30:00Z",
  status: "SUCCESS"
}
```

#### NDHM Integration

```
POST /ndhm/health-id-lookup
Body: { phone: "98XXXXXX" OR aadhar: "1234567890" }
Response: {
  health_id: "uuid-123",
  name: "Priya Sharma",
  dob: "2000-01-15",
  found: true
}

POST /ndhm/create-health-id
Body: { phone, name, gender, dob }
Response: { health_id: "uuid" }

POST /ndhm/push-to-phr
Headers: Authorization: Bearer {token}
Body: {
  health_id: "uuid",
  resource_type: "DiagnosticReport", // or Encounter, Observation, etc.
  fhir_resource: { ...FHIR-R4 JSON },
  consent_token: "consent-uuid"
}

Response: {
  success: true,
  ndhm_id: "resource-uuid",
  timestamp: "2025-03-15T10:30:00Z"
}

GET /ndhm/health-records/:health_id
Headers: Authorization: Bearer {token}
Response: {
  records: [
    {
      resource_type: "Encounter",
      date: "2025-03-15",
      provider: "Clinic Name",
      summary: "ANC visit"
    },
    ...
  ]
}
```

---

### 2.4 Technology Stack Decisions

#### Why These Choices?

**Backend: Node.js + Express**
- ✅ JavaScript/TypeScript = faster development
- ✅ Non-blocking I/O = handles concurrent requests well
- ✅ NPM ecosystem = lots of libraries
- ✅ JSON-native = perfect for REST APIs + FHIR (JSON)
- ✅ Easy to deploy on AWS Lambda (serverless option later)

**Database: PostgreSQL**
- ✅ ACID compliance = data integrity critical for health
- ✅ JSONB support = stores medical history as JSON
- ✅ Full-text search = search pregnancies by name
- ✅ Open source = no licensing costs
- ✅ AWS RDS = managed service (automatic backups)

**Frontend Web: React.js**
- ✅ Component-based = easier to maintain
- ✅ Large ecosystem = lots of health-related libraries
- ✅ TypeScript support = fewer bugs
- ✅ Easy testing = unit tests with Jest

**Mobile: React Native**
- ✅ Write once, deploy to iOS + Android
- ✅ Offline support = can install sqlite
- ✅ Hot reload = faster development
- ✅ Similar to React web = code reuse

**Cloud: AWS**
- ✅ HIPAA-compliant infrastructure
- ✅ Free tier = EC2, RDS, S3 for development
- ✅ Scalability = handle 10,000+ users easily
- ✅ Payment: Pay only what you use

**Authentication: JWT + PostgreSQL**
- ✅ JWT tokens = stateless (easier to scale)
- ✅ No third-party dependency = controls data
- ✅ Suitable for mobile offline-first apps

**Security: Encryption at rest + transit**
- ✅ PostgreSQL encryption = sensitive data encrypted
- ✅ HTTPS/TLS = data encrypted in transit
- ✅ bcrypt = passwords hashed
- ✅ API keys = for clinic integrations

---

### 2.5 NDHM Integration Architecture

**How Your System Becomes NDHM-Compatible:**

```
┌──────────────────────────────────────────────────────┐
│         YOUR SYSTEM (Suraksha)                       │
│                                                      │
│  PostgreSQL Database                                │
│  ├─ pregnancies                                     │
│  ├─ anc_visits                                      │
│  ├─ deliveries                                      │
│  └─ discharge_summaries                             │
│                                                      │
└────────────────────┬─────────────────────────────────┘
                     │
         ┌───────────┴────────────┐
         │                        │
         ▼                        ▼
    [HIP Role]            [HIU Role]
    (Your system           (Your system
     creates data)         reads data)
         │                        │
         │                        │
    ┌────▼──────────┐      ┌──────▼──────┐
    │ Data Adapter  │      │  Consent    │
    │ (Convert to   │      │  Manager    │
    │  FHIR-R4)     │      │  (Verify)   │
    └────┬──────────┘      └──────┬──────┘
         │                        │
         ▼                        ▼
    ┌─────────────────────────────────────┐
    │     NDHM GATEWAY & APIs             │
    │                                     │
    │ • Health ID Service                │
    │ • HIP Data Push Service            │
    │ • Consent Manager                  │
    │ • PHR View Service                 │
    │ • Registries                       │
    └─────────────────────────────────────┘
         │
         ▼
    ┌─────────────────────────────────────┐
    │  NDHM ECOSYSTEM                     │
    │                                     │
    │ • Patient Health ID (unique ID)    │
    │ • Personal Health Record (PHR)     │
    │ • Health Data Exchange             │
    │ • Registries (Doctors, Facilities) │
    └─────────────────────────────────────┘
```

**Step-by-Step NDHM Integration:**

1. **Patient Creates Health ID**
   - At clinic, patient gets Health ID (Aadhaar or alternative)
   - You store: `pregnancies.health_id = "uuid-123"`

2. **ASHA Records Data (Your App)**
   - ASHA enters pregnancy details offline
   - Data stored in local SQLite
   - When online, syncs to your server

3. **Clinic Reviews & Records (Your App)**
   - Clinic doctor sees pregnancy (from ASHA referral)
   - Records ANC visit with your web app
   - Discharge summary auto-generated

4. **Push to NDHM (Automatic)**
   - Your system calls NDHM HIP API
   - Converts data to FHIR-R4 format
   - Pushes: `POST /ndhm/push`
   - Example FHIR resource:
     ```json
     {
       "resourceType": "DiagnosticReport",
       "id": "discharge-summary-123",
       "status": "final",
       "category": "cardiology",
       "code": "Discharge Summary",
       "subject": {
         "reference": "Patient/health-id-123"
       },
       "issued": "2025-03-15T10:30:00Z",
       "performer": [{ "reference": "Practitioner/doctor-123" }],
       "result": [
         { "reference": "Observation/bp-140-90" },
         { "reference": "Observation/weight-62kg" }
       ],
       "presentedForm": [{
         "contentType": "text/plain",
         "data": "[Base64 encoded discharge summary PDF]"
       }]
     }
     ```

5. **Patient PHR Updated (NDHM)**
   - Data appears in patient's health record (on NDHM app/portal)
   - Patient can grant access to other doctors
   - Other hospitals can request access (with consent)

6. **Security & Compliance**
   - NDHM consent framework: Patient controls who sees data
   - Encryption: Data encrypted in transit + at rest
   - Audit: Every access logged
   - Anonymization: Aggregated data de-identified

**Your Role in NDHM Ecosystem:**

```
┌────────────────────────────────────────────┐
│  NDHM Ecosystem Roles                      │
├────────────────────────────────────────────┤
│                                            │
│ HIP (Health Information Provider):         │
│  → You CREATE health records               │
│  → You STORE patient data                  │
│  → You PUSH to PHR on demand               │
│  → You OWN patient consent                 │
│                                            │
│ HIU (Health Information User):             │
│  → You REQUEST data from other HIPs        │
│  → You VERIFY consent before access        │
│  → You VIEW patient's aggregated records   │
│                                            │
│ Your System:                               │
│  ✅ Acts as HIP (for maternal data)       │
│  ✅ Acts as HIU (reads other systems)     │
│  ✅ Manages consent (per NDHM standard)   │
│  ✅ Pushes FHIR-R4 (standard format)      │
│  ✅ Syncs with Health ID (unique ID)      │
│                                            │
└────────────────────────────────────────────┘
```

---

## PART 3: DEVELOPMENT ROADMAP

### Timeline: 12 Weeks (Jan-Mar 2025)

```
WEEK  1-2  │ ██ SETUP & INFRASTRUCTURE
WEEK  3-4  │ ██ BACKEND FOUNDATION
WEEK  5-6  │ ████ ASHA MOBILE APP
WEEK  7-8  │ ████ CLINIC WEB APP
WEEK  9-10 │ ██ PATIENT APP & NDHM Integration
WEEK 11-12 │ ██████ TESTING & DEPLOYMENT
```

---

### Week 1-2: Project Setup

**Monday:**
- [ ] Dev team kickoff meeting (1 hour)
- [ ] Explain project vision + NDHM integration
- [ ] Share all documentation (specification, wireframes, tech stack)
- [ ] Assign team roles:
  - Developer 1: Backend + Database
  - Developer 2: Frontend (mobile + web)

**Tuesday-Thursday:**
- [ ] Set up development environment
  - Git repositories created (private)
  - Branching strategy (main, develop, feature branches)
  - CI/CD pipeline started (GitHub Actions)
  
- [ ] AWS account & infrastructure setup
  - VPC created (Virtual Private Cloud)
  - RDS PostgreSQL instance launched (test environment)
  - S3 bucket created (for file storage - PDFs, images)
  - IAM roles configured (permissions management)
  - Cost monitoring set up
  
- [ ] Local development setup
  - Node.js installed
  - TypeScript configured
  - ESLint + Prettier (code quality)
  - Jest (testing framework)
  
- [ ] Database schema created (PostgreSQL)
  - Tables created (pregnancies, anc_visits, etc.)
  - Relationships defined
  - Indexes created (for fast queries)
  - Migrations set up

**Friday:**
- [ ] First development sprint
  - Architecture review with team
  - Database schema walkthrough
  - API design review
  - Assign first tasks

**Deliverables:**
- ✅ Git repos + branching strategy
- ✅ AWS infrastructure + RDS ready
- ✅ Database schema created
- ✅ Development environment working locally
- ✅ CI/CD pipeline basic setup

---

### Week 3-4: Backend Foundation + Authentication

**Focus:** Build core API + database layer

**Tasks:**
- [ ] **Authentication System**
  ```
  POST /auth/register (ASHA + Clinic users)
  POST /auth/login
  POST /auth/logout
  POST /auth/refresh-token
  
  Implement JWT token generation
  Password hashing (bcrypt)
  Role-based access control (RBAC)
  ```

- [ ] **Pregnancy CRUD APIs**
  ```
  POST /pregnancies (Create pregnancy)
  GET /pregnancies/:id (Get single)
  PUT /pregnancies/:id (Update)
  GET /pregnancies (List with filters)
  DELETE /pregnancies/:id (Soft delete)
  ```

- [ ] **ANC Visit APIs**
  ```
  POST /anc-visits
  GET /anc-visits/:pregnancy_id
  PUT /anc-visits/:id
  
  With auto-risk-assessment logic
  Auto-alert generation
  ```

- [ ] **Sync Endpoint (for offline mobile)**
  ```
  POST /sync
  Body: { pregnancies: [...], anc_visits: [...] }
  
  Handles: Merging local + server data
  Conflict resolution
  Incremental syncs
  ```

- [ ] **Error Handling + Logging**
  ```
  Global error handler
  Logging to CloudWatch (AWS)
  Error reporting (Sentry)
  Status codes (200, 400, 401, 500)
  ```

**Testing:**
- [ ] Unit tests for core logic (50%+ coverage)
- [ ] API integration tests (Postman / Jest)
- [ ] Database transaction tests

**Deliverables:**
- ✅ Authentication working (can login)
- ✅ Pregnancy CRUD working
- ✅ ANC visit CRUD working
- ✅ Sync endpoint working
- ✅ Basic error handling
- ✅ Unit tests passing

---

### Week 5-6: ASHA Mobile App

**Focus:** Build first functional app that ASHA can use

**Architecture:**
```
React Native (TypeScript)
├─ Navigation Stack
│  ├─ Auth Stack (Login/Register)
│  ├─ Home Stack (Dashboard, Pregnancies)
│  └─ Settings Stack (Settings, Profile)
├─ State Management (Redux or Context)
├─ Local Storage (SQLite + Encrypted)
├─ API Client (Axios + Offline Queue)
└─ UI Components (Custom or React Native Paper)
```

**Features:**
- [ ] **Navigation**
  - Tab-based nav (Home, Pregnancies, Settings)
  - Stack navigation (for detailed views)
  - Smooth transitions

- [ ] **Authentication Screen**
  - Login with phone + password
  - New user registration
  - Password reset
  - Offline support (cached credentials)

- [ ] **Home Dashboard**
  - Display stats (active, high-risk, due this month)
  - Recent alerts
  - Quick actions (new pregnancy, view all)
  - Refresh/sync status

- [ ] **Pregnancy List Screen**
  - List all pregnancies
  - Search by name
  - Filter (active, high-risk, due soon)
  - Tap to view details

- [ ] **Pregnancy Detail Screen**
  - Full pregnancy info
  - ANC visits history
  - Vital signs chart
  - Alerts (color-coded)
  - Action buttons

- [ ] **New Pregnancy Form**
  - Text inputs (name, age, village)
  - Date picker (LMP date)
  - Checkboxes (medical history)
  - Auto-calculations (weeks, due date, risk)
  - Save + Validation

- [ ] **Record ANC Visit Form**
  - BP, weight, hemoglobin inputs
  - Symptom checkboxes
  - Medications checklist
  - Next visit date picker
  - Submit + Alert generation

- [ ] **Offline-First**
  - SQLite local database
  - Sync queue (when online)
  - Visual indicators (synced/pending)
  - Auto-sync when connection restored

- [ ] **Settings Screen**
  - Profile info
  - Notification preferences
  - Data storage info
  - Logout

**Testing:**
- [ ] Functional testing on Android 6.0+ devices
- [ ] Offline scenario testing (disable internet)
- [ ] Sync testing (online/offline transitions)
- [ ] Performance testing (app responsiveness)

**Deliverables:**
- ✅ App installs on Android devices
- ✅ ASHA can login
- ✅ Can create pregnancy offline
- ✅ Can record ANC visits
- ✅ Syncs to server when online
- ✅ UI matches wireframes
- ✅ No crashes (error handling)

---

### Week 7-8: Clinic Web App

**Focus:** Build web portal for doctors/clinic staff

**Tech Stack:**
```
React.js (TypeScript)
├─ Pages
│  ├─ Dashboard
│  ├─ Patients List
│  ├─ Patient Detail
│  ├─ ANC Recording
│  ├─ Discharge Summary
│  └─ Settings
├─ Components
│  ├─ PatientCard
│  ├─ ANCForm
│  ├─ DischargeSummaryGenerator
│  └─ AlertNotifications
├─ State Management (Redux)
├─ API Client (Axios)
├─ UI Library (Tailwind CSS + Headless UI)
└─ PDF Generation (React-PDF / jsPDF)
```

**Features:**
- [ ] **Authentication**
  - Login with email + password
  - Remember me option
  - Session management

- [ ] **Dashboard**
  - Overview cards (total, high-risk, due today)
  - Referral alerts (from ASHA)
  - Recent deliveries
  - Charts (optional for MVP)

- [ ] **Patients List**
  - Searchable table
  - Filters (high-risk, due this week)
  - Pagination
  - Click to view details

- [ ] **Patient Details**
  - Full pregnancy info + medical history
  - ANC visits list
  - Referred by (ASHA name)
  - Action buttons

- [ ] **Record ANC Visit (Clinic)**
  - Extended form (vs ASHA simpler form)
  - BP, weight, hemoglobin, urine tests
  - Exam findings (general, abdominal, speculum, PV)
  - Ultrasound details (if done)
  - Diagnosis + treatment plan
  - Save + Generate Discharge Summary

- [ ] **Discharge Summary Generator**
  - Auto-populate from ANC visit
  - PDF generation
  - Preview before download
  - Send to patient (via NDHM)
  - Print option

- [ ] **Referral Management**
  - View referrals from ASHA
  - Accept/acknowledge referral
  - Record clinic visit
  - Return to ASHA (if normal)
  - Refer to hospital (if complicated)

- [ ] **Delivery Outcome Recording**
  - Date, location, type of delivery
  - Baby details (gender, weight, APGAR)
  - Maternal complications
  - Stillbirth/neonatal death (if applicable)
  - Save outcome

- [ ] **Settings**
  - Clinic details
  - Staff management (add/remove users)
  - Notification preferences
  - NDHM integration status

**Testing:**
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Responsive design (desktop + tablet)
- [ ] Form validation
- [ ] PDF generation
- [ ] Performance (page load times)

**Deliverables:**
- ✅ Web app loads in browser
- ✅ Doctor can login
- ✅ Can view referred pregnancies
- ✅ Can record ANC visit
- ✅ Can generate discharge summary (PDF)
- ✅ Can record delivery outcome
- ✅ Responsive design
- ✅ No bugs/errors

---

### Week 9-10: Patient App + NDHM Integration

**Patient App (React Native - Simple)**

**Features:**
- [ ] **Login with clinic code**
  - Clinic enters code + phone
  - Links to clinic system

- [ ] **Dashboard**
  - Pregnancy progress bar
  - Due date countdown
  - Next appointment info
  - Health metrics (BP, weight)

- [ ] **Appointment Reminders**
  - Show upcoming appointment
  - Set mobile notification
  - Get directions link

- [ ] **Health Tips**
  - Weekly tips based on week of pregnancy
  - Danger signs list
  - FAQs

- [ ] **View Records**
  - ANC visit summaries
  - Lab reports
  - Discharge summaries

**NDHM Integration (Backend)**

**Focus:** Make your system NDHM-compatible

- [ ] **Health ID Lookup Service**
  ```
  POST /ndhm/health-id-lookup
  Input: Phone OR Aadhaar
  Output: Health ID (if exists)
  
  Implementation:
  - Call NDHM API to search
  - Cache result locally
  - Handle "not found" case
  ```

- [ ] **Health ID Creation**
  ```
  POST /ndhm/create-health-id
  Input: Phone, Name, DOB
  Output: New Health ID
  
  Implementation:
  - Validate patient info
  - Call NDHM API
  - Store in your DB: pregnancies.health_id
  ```

- [ ] **Convert Data to FHIR-R4**
  ```
  Create FHIR resource mappers:
  
  Pregnancy → Patient + Encounter
  ANC Visit → Observation (vital signs) + DiagnosticReport
  Discharge Summary → DiagnosticReport (full report)
  Baby Follow-up → Observation (baby health)
  
  Example mapping:
  pregnancies.lmp_date + 280 days → Patient.birthDate
  anc_visits.bp_systolic → Observation.value (SNOMED code)
  discharge_summaries.pdf → DiagnosticReport.presentedForm
  ```

- [ ] **Push to PHR (NDHM)**
  ```
  POST /ndhm/push-to-phr
  
  For each discharge summary:
  1. Verify patient has Health ID
  2. Get consent from patient (via NDHM consent API)
  3. Convert to FHIR-R4 DiagnosticReport
  4. Call NDHM HIP API: POST /health-information/hips/records/insert
  5. Verify success + store ndhm_resource_id
  6. Send notification to patient
  
  Implementation:
  - Queue system (Kafka/RabbitMQ or simple DB queue)
  - Retry logic (if push fails, retry)
  - Logging (track all NDHM interactions)
  ```

- [ ] **Consent Management (NDHM)**
  ```
  Implement NDHM consent flow:
  
  1. When clinic generates discharge summary
  2. System asks patient: "Share with NDHM?"
  3. Get consent token from NDHM
  4. Push data WITH consent token
  5. Patient can revoke later
  
  Implementation:
  - Store consent in: discharge_summaries.consent_token
  - Check consent before pushing
  - Handle revocation (if user opts out)
  ```

- [ ] **Registry Lookups**
  ```
  GET /registries/doctors?name=Rajesh
  GET /registries/facilities?district=Gurugram
  
  Implement:
  - Cache registry data locally
  - Periodic sync with NDHM registries
  - Search functionality
  ```

- [ ] **Sync NDHM Data to Your System (HIU Role)**
  ```
  POST /ndhm/sync-patient-records
  Input: health_id, consent
  
  Implementation:
  - Call NDHM to get patient's aggregated PHR
  - Store in your DB (for future reference)
  - Display to doctors (if different from your data)
  ```

**Testing:**
- [ ] Test NDHM sandbox environment
- [ ] FHIR-R4 validation (each resource)
- [ ] Consent flow testing
- [ ] Error scenarios (network, validation)

**Deliverables:**
- ✅ Patient app works (basic)
- ✅ Health ID lookup working
- ✅ Health ID creation working
- ✅ Data converting to FHIR-R4
- ✅ Pushing to NDHM (test environment)
- ✅ Consent management implemented
- ✅ Syncing NDHM registries
- ✅ Error handling for NDHM failures

---

### Week 11-12: Testing + Deployment

**Testing Phase**

- [ ] **System Integration Testing**
  ```
  Scenario 1: Complete Flow
  1. ASHA creates pregnancy offline
  2. Syncs to server when online
  3. Clinic views pregnancy + records ANC visit
  4. Generates discharge summary
  5. Pushes to NDHM
  6. Patient sees in their app
  
  Verify each step works
  ```

- [ ] **Pilot Clinic Testing**
  - Deploy to test servers
  - Clinic staff uses real app (1 week)
  - Collect feedback
  - Fix critical bugs

- [ ] **NDHM Compliance Check**
  - Verify FHIR-R4 compliance
  - Test with NDHM sandbox
  - Confirm data pushed correctly
  - Validate security (encryption, etc.)

- [ ] **Security Testing**
  - Check for SQL injection vulnerabilities
  - Test authentication (can't bypass login)
  - Test authorization (ASHA can't access clinic data)
  - Verify encryption (data at rest + transit)
  - Password reset flow

- [ ] **Performance Testing**
  - App loads < 3 seconds
  - Search < 1 second
  - Sync completes quickly
  - Database queries optimized

- [ ] **Device Testing**
  - Android 6.0, 8.0, 10.0, 12.0
  - Various phone models (low-end, mid-range)
  - Low connectivity (slow internet)
  - Large data sets (1000+ pregnancies)

**Deployment Phase**

- [ ] **Production AWS Setup**
  - Larger RDS instance
  - Multiple app servers (load balancing)
  - CDN for static assets
  - Automated backups
  - Monitoring + alerts

- [ ] **Mobile App Release**
  - Android APK signed
  - Upload to Google Play Store (pending approval ~24-48 hours)
  - Create app store listing
  - Release notes

- [ ] **Web App Deployment**
  - Build production bundle (optimized)
  - Deploy to AWS Elastic Beanstalk or EC2
  - Set up domain name
  - SSL certificate (HTTPS)
  - DNS configuration

- [ ] **Documentation**
  - User guides (ASHA, Clinic Doctor, Patient)
  - API documentation (for future partners)
  - Admin setup guide
  - Troubleshooting guide

- [ ] **Training Materials**
  - Video tutorials (3-5 mins each)
  - Screenshots + captions
  - Step-by-step guides
  - FAQ document

**Deliverables:**
- ✅ All tests passing
- ✅ Pilot clinics have working system
- ✅ Production infrastructure ready
- ✅ Mobile app in Google Play Store
- ✅ Web app live (https://suraksha.health)
- ✅ Training materials ready
- ✅ Documentation complete
- ✅ Support process defined

---

## PART 4: TEAM STRUCTURE & HIRING

### Team Needed for MVP

**Minimum Viable Team:**
1. **Full-Stack Developer (Lead)** - Node.js + React/React Native
2. **Mobile Developer** - React Native specialist
3. **DevOps / Backend Support** - AWS infrastructure

**OR Simpler:**
1. **Full-Stack Developer 1** - Backend focus (Node.js + DB)
2. **Frontend Developer** - React + React Native

### Hiring Specification

```
POSITION: Full-Stack Developer (Backend Focus)

Requirements:
✓ 2-4 years Node.js experience
✓ PostgreSQL + SQL fundamentals
✓ REST API design
✓ Good understanding of healthcare/security concepts
✓ Git + GitHub experience

Nice to have:
- React.js knowledge
- AWS experience
- HIPAA/data privacy understanding
- Healthcare software background

Salary: ₹15-25 lakh/year
Location: Remote or Gurugram/Delhi NCR
Duration: 6-month contract (renewable)

What they'll build:
- PostgreSQL schemas + migrations
- REST APIs (Express.js)
- Authentication system
- NDHM integration
- Offline sync logic
```

```
POSITION: Mobile Developer (React Native)

Requirements:
✓ 2-4 years React Native experience
✓ Android + iOS understanding
✓ SQLite for local storage
✓ REST API integration
✓ Git experience

Nice to have:
- Offline-first app architecture
- Redux/State management
- Performance optimization
- Healthcare app experience

Salary: ₹15-25 lakh/year
Location: Remote or Gurugram
Duration: 6-month contract

What they'll build:
- ASHA mobile app (React Native)
- Patient mobile app
- Offline-first architecture
- Sync mechanism
- UI implementation per wireframes
```

### Where to Hire

1. **Upwork** (Budget: ₹30-40k for 2-week trial)
   - Post detailed job
   - Screen 10+ applications
   - Test with paid trial before full hire

2. **LinkedIn** (Direct reach)
   - Search: "React Native" + "Gurugram" OR "Bangalore"
   - Direct message: "Hi [Name], we're building healthcare software..."
   - Target ex-employees of: Swiggy, OYO, Paytm (have startup experience)

3. **Toptal** (High quality, expensive)
   - Vetted developers
   - Cost: 2x market rate
   - Good if you have limited time for hiring

4. **Local Tech Communities:**
   - Startup Grind Gurugram
   - Delhi JavaScript meetup
   - Dev community groups

---

## PART 5: BUDGET & TIMELINE

### 12-Week Budget Breakdown

| Item | Cost | Notes |
|------|------|-------|
| **Developer Salaries** | ₹32-40L | 2 devs × 6 months @ ₹15-20L/year |
| AWS Infrastructure | ₹2-3L | EC2, RDS, S3, data transfer |
| Third-party APIs | ₹1-2L | Sentry (error tracking), SendGrid (email) |
| Development Tools | ₹50k | GitHub, Jira, Design tools |
| STQC Certification | ₹5-10L | Medical device classification (for Phase 2) |
| Miscellaneous | ₹1-2L | Travel, contingency |
| **Total** | **₹42-57L** | Conservative estimate |

### Timeline Summary

| Phase | Weeks | What | Deliverable |
|-------|-------|------|-------------|
| Setup | 1-2 | Infrastructure, DB schema | Ready to code |
| Backend | 3-4 | APIs, auth, sync | API endpoints working |
| ASHA App | 5-6 | Mobile app for ASHA | App installs, works offline |
| Clinic App | 7-8 | Web app for doctors | Doctors can record visits |
| Patient App + NDHM | 9-10 | Patient engagement + NDHM | Data pushing to NDHM |
| Testing + Deployment | 11-12 | QA, fixes, production deploy | Live at 3 pilot clinics |

---

## PART 6: SUCCESS CRITERIA (MVP Definition)

### Must-Have (Do NOT ship without these)

✅ **ASHA App:**
- Can register pregnancies offline
- Can record ANC visits
- Syncs to server when online
- No data loss

✅ **Clinic Web App:**
- Can view referred pregnancies
- Can record ANC visit details
- Can generate discharge summary
- Can record delivery outcomes

✅ **Patient App:**
- Can view pregnancy progress
- Can see appointments
- Receives reminders

✅ **NDHM Integration:**
- Can lookup Health ID
- Can create Health ID
- Can push discharge summaries to NDHM
- FHIR-R4 compliant

✅ **Data Quality:**
- All vital data encrypted
- Database integrity verified
- Audit logs for all transactions
- Backup/recovery tested

✅ **Usability:**
- No crashes (< 1 crash per 100 uses)
- App loads < 3 seconds
- Intuitive UI (doctors understand without training)
- Works on slow internet

### Nice-to-Have (Can ship in Phase 2)

⭐ Advanced analytics dashboard
⭐ Telemedicine consultation
⭐ Insurance claim processing
⭐ Multi-language support
⭐ Video consultations
⭐ Hospital integration

---

## FINAL CHECKLIST - READY TO BUILD

**Before you hand to developers, confirm:**

- [ ] Read entire spec document (2 hours)
- [ ] All 3 apps understood (ASHA, Clinic, Patient)
- [ ] Tech stack approved by developer lead
- [ ] NDHM integration plan reviewed
- [ ] Database schema reviewed
- [ ] API design reviewed
- [ ] Wireframes approved
- [ ] Budget + Timeline confirmed
- [ ] Team hired + onboarded
- [ ] Development environment set up
- [ ] Git repos + CI/CD ready

---

## NEXT STEPS

**Week 1 Actions:**
1. **Share this spec with developers**
2. **Schedule spec walkthrough** (2 hours)
3. **Start Week 1-2 tasks** (setup phase)
4. **Weekly standup meetings** (Mon + Fri)
5. **Track progress** (Jira or simple spreadsheet)

**Key Success Factors:**
- ✅ **Clarity** - Developers know exactly what to build
- ✅ **Deadlines** - Each week has clear deliverables
- ✅ **Testing** - Testing starts Week 3, not Week 12
- ✅ **Communication** - Daily standups catch blockers early
- ✅ **NDHM alignment** - Every feature considers NDHM integration

---

**This specification is complete and ready to hand to your development team.**

**Total effort: 12 weeks, 2 developers, ₹45-55L budget.**

**Result: Working MVP with 3 pilot clinics live, ready for Series A.**

---

Would you like me to:
1. Create detailed NDHM API integration code examples (how to call NDHM APIs)?
2. Create sample FHIR-R4 JSON for obstetric data?
3. Create deployment checklist (AWS setup steps)?
4. Create testing checklist (what to test for each feature)?

Which would help you most right now?
