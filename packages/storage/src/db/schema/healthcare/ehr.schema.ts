/**
 * Electronic Health Records (EHR) Schema
 * 
 * Clinical documentation, diagnoses, medications, and vital signs
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  numeric,
  integer,
  date,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizations } from '../auth.schema';
import { users } from '../auth.schema';
import { patients } from './patients.schema';
import { appointments } from './appointments.schema';

// Enums
export const noteTypeEnum = pgEnum('note_type', [
  'progress',
  'soap',
  'discharge',
  'consultation',
  'procedure',
  'operative',
  'emergency',
]);

// Clinical Notes table
export const clinicalNotes = pgTable(
  'clinical_notes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    patientId: uuid('patient_id')
      .notNull()
      .references(() => patients.id, { onDelete: 'restrict' }),
    appointmentId: uuid('appointment_id').references(() => appointments.id, {
      onDelete: 'set null',
    }),
    
    // Note Details
    noteType: noteTypeEnum('note_type').notNull().default('progress'),
    noteNumber: varchar('note_number', { length: 50 }).notNull().unique(),
    
    // SOAP Format
    subjective: text('subjective'), // Patient's description
    objective: text('objective'), // Clinical observations
    assessment: text('assessment'), // Diagnosis/assessment
    plan: text('plan'), // Treatment plan
    
    // Full Note Text
    noteText: text('note_text'),
    
    // Diagnoses
    primaryDiagnosis: varchar('primary_diagnosis', { length: 500 }),
    secondaryDiagnoses: jsonb('secondary_diagnoses').$type<string[]>().default([]),
    icd10Codes: jsonb('icd10_codes').$type<string[]>().default([]),
    
    // Author
    authorId: uuid('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    coAuthorIds: jsonb('co_author_ids').$type<string[]>().default([]),
    
    // Status
    isDraft: boolean('is_draft').default(false).notNull(),
    isSigned: boolean('is_signed').default(false).notNull(),
    signedAt: timestamp('signed_at', { withTimezone: true }),
    
    // Timestamps
    visitDate: timestamp('visit_date', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    organizationIdIdx: index('idx_clinical_notes_organization_id').on(table.organizationId),
    patientIdIdx: index('idx_clinical_notes_patient_id').on(table.patientId),
    appointmentIdIdx: index('idx_clinical_notes_appointment_id').on(table.appointmentId),
    authorIdIdx: index('idx_clinical_notes_author_id').on(table.authorId),
    visitDateIdx: index('idx_clinical_notes_visit_date').on(table.visitDate),
    noteNumberIdx: index('idx_clinical_notes_note_number').on(table.noteNumber),
  }),
);

// Vital Signs table
export const vitalSigns = pgTable(
  'vital_signs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    patientId: uuid('patient_id')
      .notNull()
      .references(() => patients.id, { onDelete: 'restrict' }),
    appointmentId: uuid('appointment_id').references(() => appointments.id, {
      onDelete: 'set null',
    }),
    clinicalNoteId: uuid('clinical_note_id').references(() => clinicalNotes.id, {
      onDelete: 'set null',
    }),
    
    // Vital Signs Measurements
    temperature: numeric('temperature', { precision: 5, scale: 2 }), // Celsius
    temperatureUnit: varchar('temperature_unit', { length: 10 }).default('C'),
    bloodPressureSystolic: integer('blood_pressure_systolic'),
    bloodPressureDiastolic: integer('blood_pressure_diastolic'),
    heartRate: integer('heart_rate'),
    respiratoryRate: integer('respiratory_rate'),
    oxygenSaturation: numeric('oxygen_saturation', { precision: 5, scale: 2 }),
    height: numeric('height', { precision: 5, scale: 2 }), // cm
    weight: numeric('weight', { precision: 5, scale: 2 }), // kg
    bmi: numeric('bmi', { precision: 5, scale: 2 }),
    painScore: integer('pain_score'), // 0-10 scale
    
    // Additional Measurements
    glucose: numeric('glucose', { precision: 5, scale: 2 }),
    headCircumference: numeric('head_circumference', { precision: 5, scale: 2 }), // For pediatrics
    
    // Recorded By
    recordedBy: uuid('recorded_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    
    // Timestamp
    recordedAt: timestamp('recorded_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    organizationIdIdx: index('idx_vital_signs_organization_id').on(table.organizationId),
    patientIdIdx: index('idx_vital_signs_patient_id').on(table.patientId),
    appointmentIdIdx: index('idx_vital_signs_appointment_id').on(table.appointmentId),
    recordedAtIdx: index('idx_vital_signs_recorded_at').on(table.recordedAt),
  }),
);

// Diagnoses table
export const diagnoses = pgTable(
  'diagnoses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    patientId: uuid('patient_id')
      .notNull()
      .references(() => patients.id, { onDelete: 'restrict' }),
    clinicalNoteId: uuid('clinical_note_id').references(() => clinicalNotes.id, {
      onDelete: 'set null',
    }),
    
    // Diagnosis Details
    diagnosis: varchar('diagnosis', { length: 500 }).notNull(),
    icd10Code: varchar('icd10_code', { length: 20 }),
    icd11Code: varchar('icd11_code', { length: 20 }),
    isPrimary: boolean('is_primary').default(false).notNull(),
    status: varchar('status', { length: 50 }).default('active'), // 'active', 'resolved', 'chronic'
    
    // Dates
    onsetDate: date('onset_date'),
    resolvedDate: date('resolved_date'),
    
    // Documented By
    documentedBy: uuid('documented_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    
    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    organizationIdIdx: index('idx_diagnoses_organization_id').on(table.organizationId),
    patientIdIdx: index('idx_diagnoses_patient_id').on(table.patientId),
    icd10CodeIdx: index('idx_diagnoses_icd10_code').on(table.icd10Code),
  }),
);

// Relations
export const clinicalNotesRelations = relations(clinicalNotes, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [clinicalNotes.organizationId],
    references: [organizations.id],
  }),
  patient: one(patients, {
    fields: [clinicalNotes.patientId],
    references: [patients.id],
  }),
  appointment: one(appointments, {
    fields: [clinicalNotes.appointmentId],
    references: [appointments.id],
  }),
  author: one(users, {
    fields: [clinicalNotes.authorId],
    references: [users.id],
  }),
  vitalSigns: many(vitalSigns),
  diagnoses: many(diagnoses),
}));

export const vitalSignsRelations = relations(vitalSigns, ({ one }) => ({
  organization: one(organizations, {
    fields: [vitalSigns.organizationId],
    references: [vitalSigns.organizationId],
  }),
  patient: one(patients, {
    fields: [vitalSigns.patientId],
    references: [patients.id],
  }),
  appointment: one(appointments, {
    fields: [vitalSigns.appointmentId],
    references: [appointments.id],
  }),
  clinicalNote: one(clinicalNotes, {
    fields: [vitalSigns.clinicalNoteId],
    references: [clinicalNotes.id],
  }),
  recordedByUser: one(users, {
    fields: [vitalSigns.recordedBy],
    references: [users.id],
  }),
}));

export const diagnosesRelations = relations(diagnoses, ({ one }) => ({
  organization: one(organizations, {
    fields: [diagnoses.organizationId],
    references: [organizations.id],
  }),
  patient: one(patients, {
    fields: [diagnoses.patientId],
    references: [patients.id],
  }),
  clinicalNote: one(clinicalNotes, {
    fields: [diagnoses.clinicalNoteId],
    references: [clinicalNotes.id],
  }),
  documentedByUser: one(users, {
    fields: [diagnoses.documentedBy],
    references: [users.id],
  }),
}));
