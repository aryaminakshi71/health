/**
 * Patients Schema
 * 
 * Core patient management tables for healthcare organizations
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  date,
  timestamp,
  boolean,
  jsonb,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizations } from '../auth.schema';
import { users } from '../auth.schema';

// Enums
export const genderEnum = pgEnum('gender', ['male', 'female', 'other', 'prefer_not_to_say']);
export const bloodTypeEnum = pgEnum('blood_type', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown']);
export const maritalStatusEnum = pgEnum('marital_status', ['single', 'married', 'divorced', 'widowed', 'other']);

// Patients table
export const patients = pgTable(
  'patients',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    
    // Demographics
    firstName: varchar('first_name', { length: 255 }).notNull(),
    lastName: varchar('last_name', { length: 255 }).notNull(),
    middleName: varchar('middle_name', { length: 255 }),
    dateOfBirth: date('date_of_birth').notNull(),
    gender: genderEnum('gender').notNull(),
    bloodType: bloodTypeEnum('blood_type'),
    maritalStatus: maritalStatusEnum('marital_status'),
    
    // Contact Information
    email: varchar('email', { length: 255 }),
    phone: varchar('phone', { length: 50 }),
    alternatePhone: varchar('alternate_phone', { length: 50 }),
    address: text('address'),
    city: varchar('city', { length: 100 }),
    state: varchar('state', { length: 100 }),
    zipCode: varchar('zip_code', { length: 20 }),
    country: varchar('country', { length: 100 }).default('USA'),
    
    // Identification
    patientNumber: varchar('patient_number', { length: 50 }).notNull().unique(),
    mrn: varchar('mrn', { length: 50 }), // Medical Record Number
    ssn: varchar('ssn', { length: 20 }), // Social Security Number (encrypted)
    aadhaar: varchar('aadhaar', { length: 20 }), // For India
    healthId: varchar('health_id', { length: 100 }), // NDHM Health ID (India)
    
    // Emergency Contact
    emergencyContactName: varchar('emergency_contact_name', { length: 255 }),
    emergencyContactPhone: varchar('emergency_contact_phone', { length: 50 }),
    emergencyContactRelation: varchar('emergency_contact_relation', { length: 100 }),
    
    // Medical Information
    allergies: jsonb('allergies').$type<string[]>().default([]),
    chronicConditions: jsonb('chronic_conditions').$type<string[]>().default([]),
    currentMedications: jsonb('current_medications').$type<string[]>().default([]),
    medicalHistory: jsonb('medical_history').$type<Record<string, unknown>>(),
    
    // Insurance
    primaryInsuranceProvider: varchar('primary_insurance_provider', { length: 255 }),
    primaryInsurancePolicyNumber: varchar('primary_insurance_policy_number', { length: 100 }),
    primaryInsuranceGroupNumber: varchar('primary_insurance_group_number', { length: 100 }),
    secondaryInsuranceProvider: varchar('secondary_insurance_provider', { length: 255 }),
    secondaryInsurancePolicyNumber: varchar('secondary_insurance_policy_number', { length: 100 }),
    
    // Consent & Privacy
    consentToTreatment: boolean('consent_to_treatment').default(false),
    consentToDataSharing: boolean('consent_to_data_sharing').default(false),
    gdprConsent: boolean('gdpr_consent').default(false),
    hipaaAcknowledgment: boolean('hipaa_acknowledgment').default(false),
    consentDate: timestamp('consent_date', { withTimezone: true }),
    
    // Status
    isActive: boolean('is_active').default(true).notNull(),
    isDeceased: boolean('is_deceased').default(false).notNull(),
    deceasedDate: timestamp('deceased_date', { withTimezone: true }),
    
    // Metadata
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    updatedBy: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    organizationIdIdx: index('idx_patients_organization_id').on(table.organizationId),
    patientNumberIdx: index('idx_patients_patient_number').on(table.patientNumber),
    mrnIdx: index('idx_patients_mrn').on(table.mrn),
    emailIdx: index('idx_patients_email').on(table.email),
    phoneIdx: index('idx_patients_phone').on(table.phone),
    healthIdIdx: index('idx_patients_health_id').on(table.healthId),
    nameIdx: index('idx_patients_name').on(table.firstName, table.lastName),
    createdAtIdx: index('idx_patients_created_at').on(table.createdAt),
  }),
);

// Patient Insurance table
export const patientInsurance = pgTable(
  'patient_insurance',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    patientId: uuid('patient_id')
      .notNull()
      .references(() => patients.id, { onDelete: 'cascade' }),
    insuranceType: varchar('insurance_type', { length: 50 }).notNull(), // 'primary', 'secondary', 'tertiary'
    providerName: varchar('provider_name', { length: 255 }).notNull(),
    policyNumber: varchar('policy_number', { length: 100 }),
    groupNumber: varchar('group_number', { length: 100 }),
    subscriberName: varchar('subscriber_name', { length: 255 }),
    subscriberId: varchar('subscriber_id', { length: 100 }),
    relationshipToSubscriber: varchar('relationship_to_subscriber', { length: 50 }),
    effectiveDate: date('effective_date'),
    expirationDate: date('expiration_date'),
    copay: varchar('copay', { length: 50 }),
    deductible: varchar('deductible', { length: 50 }),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    patientIdIdx: index('idx_patient_insurance_patient_id').on(table.patientId),
    policyNumberIdx: index('idx_patient_insurance_policy_number').on(table.policyNumber),
  }),
);

// Patient Allergies table
export const patientAllergies = pgTable(
  'patient_allergies',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    patientId: uuid('patient_id')
      .notNull()
      .references(() => patients.id, { onDelete: 'cascade' }),
    allergen: varchar('allergen', { length: 255 }).notNull(),
    reaction: text('reaction'),
    severity: varchar('severity', { length: 50 }), // 'mild', 'moderate', 'severe', 'life_threatening'
    onsetDate: date('onset_date'),
    status: varchar('status', { length: 50 }).default('active'), // 'active', 'resolved', 'unknown'
    documentedBy: uuid('documented_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    patientIdIdx: index('idx_patient_allergies_patient_id').on(table.patientId),
    allergenIdx: index('idx_patient_allergies_allergen').on(table.allergen),
  }),
);

// Relations
export const patientsRelations = relations(patients, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [patients.organizationId],
    references: [organizations.id],
  }),
  creator: one(users, {
    fields: [patients.createdBy],
    references: [users.id],
  }),
  updater: one(users, {
    fields: [patients.updatedBy],
    references: [users.id],
  }),
  insurance: many(patientInsurance),
  allergies: many(patientAllergies),
}));

export const patientInsuranceRelations = relations(patientInsurance, ({ one }) => ({
  patient: one(patients, {
    fields: [patientInsurance.patientId],
    references: [patients.id],
  }),
}));

export const patientAllergiesRelations = relations(patientAllergies, ({ one }) => ({
  patient: one(patients, {
    fields: [patientAllergies.patientId],
    references: [patients.id],
  }),
  documentedByUser: one(users, {
    fields: [patientAllergies.documentedBy],
    references: [users.id],
  }),
}));
