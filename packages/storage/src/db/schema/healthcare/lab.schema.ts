/**
 * Laboratory Schema
 * 
 * Lab orders, results, and test management
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  numeric,
  boolean,
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
export const labOrderStatusEnum = pgEnum('lab_order_status', [
  'ordered',
  'collected',
  'in_progress',
  'completed',
  'cancelled',
  'rejected',
]);

export const labResultStatusEnum = pgEnum('lab_result_status', [
  'pending',
  'preliminary',
  'final',
  'corrected',
  'cancelled',
]);

export const criticalValueEnum = pgEnum('critical_value', [
  'normal',
  'abnormal',
  'critical',
  'panic',
]);

// Lab Test Catalog
export const labTestCatalog = pgTable(
  'lab_test_catalog',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    
    // Test Details
    testCode: varchar('test_code', { length: 50 }).notNull(),
    testName: varchar('test_name', { length: 255 }).notNull(),
    testDescription: text('test_description'),
    loincCode: varchar('loinc_code', { length: 20 }), // LOINC code
    cptCode: varchar('cpt_code', { length: 20 }), // CPT code for billing
    
    // Test Category
    category: varchar('category', { length: 100 }),
    subcategory: varchar('subcategory', { length: 100 }),
    
    // Test Properties
    isPanel: boolean('is_panel').default(false).notNull(),
    panelTests: jsonb('panel_tests').$type<string[]>().default([]), // Test IDs if panel
    specimenType: varchar('specimen_type', { length: 100 }), // 'blood', 'urine', 'stool', etc.
    collectionInstructions: text('collection_instructions'),
    fastingRequired: boolean('fasting_required').default(false),
    
    // Pricing
    price: numeric('price', { precision: 10, scale: 2 }),
    
    // Status
    isActive: boolean('is_active').default(true).notNull(),
    
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    organizationIdIdx: index('idx_lab_test_catalog_org_id').on(table.organizationId),
    testCodeIdx: index('idx_lab_test_catalog_test_code').on(table.testCode),
    loincCodeIdx: index('idx_lab_test_catalog_loinc_code').on(table.loincCode),
  }),
);

// Lab Orders table
export const labOrders = pgTable(
  'lab_orders',
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
    
    // Order Details
    orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
    orderDate: date('order_date').notNull(),
    orderTime: timestamp('order_time', { withTimezone: true }).notNull(),
    
    // Test Information
    testId: uuid('test_id')
      .notNull()
      .references(() => labTestCatalog.id, { onDelete: 'restrict' }),
    testName: varchar('test_name', { length: 255 }).notNull(),
    testCode: varchar('test_code', { length: 50 }),
    
    // Clinical Information
    clinicalIndication: text('clinical_indication'),
    diagnosis: varchar('diagnosis', { length: 500 }),
    icd10Code: varchar('icd10_code', { length: 20 }),
    
    // Status
    status: labOrderStatusEnum('status').notNull().default('ordered'),
    priority: varchar('priority', { length: 20 }).default('routine'), // 'routine', 'urgent', 'stat'
    
    // Collection
    collectionDate: timestamp('collection_date', { withTimezone: true }),
    collectedBy: uuid('collected_by').references(() => users.id, {
      onDelete: 'set null',
    }),
    specimenNumber: varchar('specimen_number', { length: 50 }),
    
    // Provider
    orderedBy: uuid('ordered_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    
    // HL7
    hl7MessageId: varchar('hl7_message_id', { length: 100 }),
    hl7Sent: boolean('hl7_sent').default(false),
    hl7SentAt: timestamp('hl7_sent_at', { withTimezone: true }),
    
    // Metadata
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    organizationIdIdx: index('idx_lab_orders_organization_id').on(table.organizationId),
    patientIdIdx: index('idx_lab_orders_patient_id').on(table.patientId),
    appointmentIdIdx: index('idx_lab_orders_appointment_id').on(table.appointmentId),
    orderNumberIdx: index('idx_lab_orders_order_number').on(table.orderNumber),
    statusIdx: index('idx_lab_orders_status').on(table.status),
    testIdIdx: index('idx_lab_orders_test_id').on(table.testId),
  }),
);

// Lab Results table
export const labResults = pgTable(
  'lab_results',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    patientId: uuid('patient_id')
      .notNull()
      .references(() => patients.id, { onDelete: 'restrict' }),
    labOrderId: uuid('lab_order_id')
      .notNull()
      .references(() => labOrders.id, { onDelete: 'cascade' }),
    
    // Result Details
    resultNumber: varchar('result_number', { length: 50 }).notNull().unique(),
    resultDate: date('result_date').notNull(),
    resultTime: timestamp('result_time', { withTimezone: true }).notNull(),
    
    // Test Information
    testCode: varchar('test_code', { length: 50 }),
    testName: varchar('test_name', { length: 255 }).notNull(),
    componentName: varchar('component_name', { length: 255 }), // For panels
    
    // Result Values
    value: varchar('value', { length: 255 }),
    numericValue: numeric('numeric_value', { precision: 10, scale: 4 }),
    unit: varchar('unit', { length: 50 }),
    referenceRange: varchar('reference_range', { length: 100 }),
    abnormalFlag: varchar('abnormal_flag', { length: 20 }), // 'H', 'L', 'A', 'N'
    criticalValue: criticalValueEnum('critical_value').default('normal'),
    
    // Status
    status: labResultStatusEnum('status').notNull().default('pending'),
    isVerified: boolean('is_verified').default(false).notNull(),
    verifiedBy: uuid('verified_by').references(() => users.id, {
      onDelete: 'set null',
    }),
    verifiedAt: timestamp('verified_at', { withTimezone: true }),
    
    // Interpretation
    interpretation: text('interpretation'),
    comments: text('comments'),
    
    // HL7
    hl7MessageId: varchar('hl7_message_id', { length: 100 }),
    hl7Received: boolean('hl7_received').default(false),
    hl7ReceivedAt: timestamp('hl7_received_at', { withTimezone: true }),
    
    // Metadata
    performedBy: uuid('performed_by').references(() => users.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    organizationIdIdx: index('idx_lab_results_organization_id').on(table.organizationId),
    patientIdIdx: index('idx_lab_results_patient_id').on(table.patientId),
    labOrderIdIdx: index('idx_lab_results_lab_order_id').on(table.labOrderId),
    resultNumberIdx: index('idx_lab_results_result_number').on(table.resultNumber),
    resultDateIdx: index('idx_lab_results_result_date').on(table.resultDate),
    criticalValueIdx: index('idx_lab_results_critical_value').on(table.criticalValue),
  }),
);

// Relations
export const labTestCatalogRelations = relations(labTestCatalog, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [labTestCatalog.organizationId],
    references: [organizations.id],
  }),
  labOrders: many(labOrders),
}));

export const labOrdersRelations = relations(labOrders, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [labOrders.organizationId],
    references: [organizations.id],
  }),
  patient: one(patients, {
    fields: [labOrders.patientId],
    references: [patients.id],
  }),
  appointment: one(appointments, {
    fields: [labOrders.appointmentId],
    references: [appointments.id],
  }),
  test: one(labTestCatalog, {
    fields: [labOrders.testId],
    references: [labTestCatalog.id],
  }),
  orderedByUser: one(users, {
    fields: [labOrders.orderedBy],
    references: [users.id],
  }),
  collectedByUser: one(users, {
    fields: [labOrders.collectedBy],
    references: [users.id],
  }),
  results: many(labResults),
}));

export const labResultsRelations = relations(labResults, ({ one }) => ({
  organization: one(organizations, {
    fields: [labResults.organizationId],
    references: [organizations.id],
  }),
  patient: one(patients, {
    fields: [labResults.patientId],
    references: [patients.id],
  }),
  labOrder: one(labOrders, {
    fields: [labResults.labOrderId],
    references: [labOrders.id],
  }),
  verifiedByUser: one(users, {
    fields: [labResults.verifiedBy],
    references: [users.id],
  }),
  performedByUser: one(users, {
    fields: [labResults.performedBy],
    references: [users.id],
  }),
}));
