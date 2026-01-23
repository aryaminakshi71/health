/**
 * Pharmacy Schema
 * 
 * Prescriptions, medication dispensing, and inventory
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
export const prescriptionStatusEnum = pgEnum('prescription_status', [
  'draft',
  'active',
  'filled',
  'partially_filled',
  'cancelled',
  'expired',
  'refilled',
]);

export const prescriptionTypeEnum = pgEnum('prescription_type', [
  'new',
  'refill',
  'renewal',
]);

export const dispensingStatusEnum = pgEnum('dispensing_status', [
  'pending',
  'dispensed',
  'partially_dispensed',
  'cancelled',
]);

// Medication Catalog
export const medicationCatalog = pgTable(
  'medication_catalog',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    
    // Medication Details
    ndcCode: varchar('ndc_code', { length: 20 }), // National Drug Code
    rxNormCode: varchar('rx_norm_code', { length: 20 }), // RxNorm code
    medicationName: varchar('medication_name', { length: 255 }).notNull(),
    genericName: varchar('generic_name', { length: 255 }),
    brandName: varchar('brand_name', { length: 255 }),
    strength: varchar('strength', { length: 100 }),
    form: varchar('form', { length: 100 }), // 'tablet', 'capsule', 'liquid', etc.
    route: varchar('route', { length: 100 }), // 'oral', 'injection', 'topical', etc.
    
    // Classification
    drugClass: varchar('drug_class', { length: 100 }),
    controlledSubstance: boolean('controlled_substance').default(false),
    schedule: varchar('schedule', { length: 10 }), // DEA schedule (I-V)
    
    // Pricing
    unitPrice: numeric('unit_price', { precision: 10, scale: 2 }),
    
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
    organizationIdIdx: index('idx_medication_catalog_org_id').on(table.organizationId),
    ndcCodeIdx: index('idx_medication_catalog_ndc_code').on(table.ndcCode),
    rxNormCodeIdx: index('idx_medication_catalog_rx_norm_code').on(table.rxNormCode),
    medicationNameIdx: index('idx_medication_catalog_name').on(table.medicationName),
  }),
);

// Prescriptions table
export const prescriptions = pgTable(
  'prescriptions',
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
    
    // Prescription Details
    prescriptionNumber: varchar('prescription_number', { length: 50 }).notNull().unique(),
    prescriptionDate: date('prescription_date').notNull(),
    prescriptionType: prescriptionTypeEnum('prescription_type').notNull().default('new'),
    
    // Medication
    medicationId: uuid('medication_id')
      .notNull()
      .references(() => medicationCatalog.id, { onDelete: 'restrict' }),
    medicationName: varchar('medication_name', { length: 255 }).notNull(),
    dosage: varchar('dosage', { length: 100 }).notNull(), // e.g., "10mg"
    frequency: varchar('frequency', { length: 100 }).notNull(), // e.g., "twice daily"
    quantity: integer('quantity').notNull(),
    quantityUnit: varchar('quantity_unit', { length: 50 }), // 'tablets', 'ml', etc.
    daysSupply: integer('days_supply'),
    refills: integer('refills').default(0),
    refillsRemaining: integer('refills_remaining').default(0),
    
    // Instructions
    instructions: text('instructions'),
    sig: text('sig'), // Sig (directions) in pharmacy format
    
    // Status
    status: prescriptionStatusEnum('status').notNull().default('draft'),
    isEprescription: boolean('is_eprescription').default(false).notNull(),
    eprescriptionSent: boolean('eprescription_sent').default(false),
    eprescriptionSentAt: timestamp('eprescription_sent_at', { withTimezone: true }),
    
    // Provider
    prescribedBy: uuid('prescribed_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    
    // Safety Checks
    drugInteractions: jsonb('drug_interactions').$type<string[]>().default([]),
    allergyWarnings: jsonb('allergy_warnings').$type<string[]>().default([]),
    interactionChecked: boolean('interaction_checked').default(false),
    allergyChecked: boolean('allergy_checked').default(false),
    
    // Dates
    startDate: date('start_date'),
    endDate: date('endDate'),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    
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
    organizationIdIdx: index('idx_prescriptions_organization_id').on(table.organizationId),
    patientIdIdx: index('idx_prescriptions_patient_id').on(table.patientId),
    appointmentIdIdx: index('idx_prescriptions_appointment_id').on(table.appointmentId),
    prescriptionNumberIdx: index('idx_prescriptions_prescription_number').on(table.prescriptionNumber),
    statusIdx: index('idx_prescriptions_status').on(table.status),
    medicationIdIdx: index('idx_prescriptions_medication_id').on(table.medicationId),
  }),
);

// Prescription Refills table
export const prescriptionRefills = pgTable(
  'prescription_refills',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    prescriptionId: uuid('prescription_id')
      .notNull()
      .references(() => prescriptions.id, { onDelete: 'cascade' }),
    
    // Refill Details
    refillNumber: integer('refill_number').notNull(),
    refillDate: date('refill_date').notNull(),
    quantity: integer('quantity').notNull(),
    
    // Dispensing
    dispensedAt: timestamp('dispensed_at', { withTimezone: true }),
    dispensedBy: uuid('dispensed_by').references(() => users.id, {
      onDelete: 'set null',
    }),
    
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    prescriptionIdIdx: index('idx_prescription_refills_prescription_id').on(table.prescriptionId),
    refillDateIdx: index('idx_prescription_refills_refill_date').on(table.refillDate),
  }),
);

// Pharmacy Inventory table
export const pharmacyInventory = pgTable(
  'pharmacy_inventory',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    medicationId: uuid('medication_id')
      .notNull()
      .references(() => medicationCatalog.id, { onDelete: 'restrict' }),
    
    // Inventory Details
    currentStock: integer('current_stock').notNull().default(0),
    reorderPoint: integer('reorder_point').notNull().default(10),
    reorderQuantity: integer('reorder_quantity').notNull().default(100),
    maximumStock: integer('maximum_stock'),
    
    // Location
    location: varchar('location', { length: 100 }), // Shelf location
    
    // Batch/Lot Tracking
    batchNumber: varchar('batch_number', { length: 100 }),
    lotNumber: varchar('lot_number', { length: 100 }),
    expiryDate: date('expiry_date'),
    
    // Supplier
    supplierName: varchar('supplier_name', { length: 255 }),
    supplierPrice: numeric('supplier_price', { precision: 10, scale: 2 }),
    
    // Status
    isActive: boolean('is_active').default(true).notNull(),
    isExpired: boolean('is_expired').default(false).notNull(),
    
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    organizationIdIdx: index('idx_pharmacy_inventory_org_id').on(table.organizationId),
    medicationIdIdx: index('idx_pharmacy_inventory_medication_id').on(table.medicationId),
    expiryDateIdx: index('idx_pharmacy_inventory_expiry_date').on(table.expiryDate),
  }),
);

// Pharmacy Dispensations table
export const pharmacyDispensations = pgTable(
  'pharmacy_dispensations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    prescriptionId: uuid('prescription_id')
      .notNull()
      .references(() => prescriptions.id, { onDelete: 'restrict' }),
    inventoryId: uuid('inventory_id').references(() => pharmacyInventory.id, {
      onDelete: 'set null',
    }),
    
    // Dispensation Details
    dispensationNumber: varchar('dispensation_number', { length: 50 }).notNull().unique(),
    dispensationDate: date('dispensation_date').notNull(),
    quantity: integer('quantity').notNull(),
    
    // Status
    status: dispensingStatusEnum('status').notNull().default('pending'),
    dispensedAt: timestamp('dispensed_at', { withTimezone: true }),
    
    // Dispensed By
    dispensedBy: uuid('dispensed_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    
    // Notes
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    organizationIdIdx: index('idx_pharmacy_dispensations_org_id').on(table.organizationId),
    prescriptionIdIdx: index('idx_pharmacy_dispensations_prescription_id').on(table.prescriptionId),
    dispensationNumberIdx: index('idx_pharmacy_dispensations_number').on(table.dispensationNumber),
    statusIdx: index('idx_pharmacy_dispensations_status').on(table.status),
  }),
);

// Relations
export const medicationCatalogRelations = relations(medicationCatalog, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [medicationCatalog.organizationId],
    references: [organizations.id],
  }),
  prescriptions: many(prescriptions),
  inventory: many(pharmacyInventory),
}));

export const prescriptionsRelations = relations(prescriptions, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [prescriptions.organizationId],
    references: [organizations.id],
  }),
  patient: one(patients, {
    fields: [prescriptions.patientId],
    references: [patients.id],
  }),
  appointment: one(appointments, {
    fields: [prescriptions.appointmentId],
    references: [appointments.id],
  }),
  medication: one(medicationCatalog, {
    fields: [prescriptions.medicationId],
    references: [medicationCatalog.id],
  }),
  prescriber: one(users, {
    fields: [prescriptions.prescribedBy],
    references: [users.id],
  }),
  refills: many(prescriptionRefills),
  dispensations: many(pharmacyDispensations),
}));

export const prescriptionRefillsRelations = relations(prescriptionRefills, ({ one }) => ({
  prescription: one(prescriptions, {
    fields: [prescriptionRefills.prescriptionId],
    references: [prescriptions.id],
  }),
  dispenser: one(users, {
    fields: [prescriptionRefills.dispensedBy],
    references: [users.id],
  }),
}));

export const pharmacyInventoryRelations = relations(pharmacyInventory, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [pharmacyInventory.organizationId],
    references: [organizations.id],
  }),
  medication: one(medicationCatalog, {
    fields: [pharmacyInventory.medicationId],
    references: [medicationCatalog.id],
  }),
  dispensations: many(pharmacyDispensations),
}));

export const pharmacyDispensationsRelations = relations(pharmacyDispensations, ({ one }) => ({
  organization: one(organizations, {
    fields: [pharmacyDispensations.organizationId],
    references: [organizations.id],
  }),
  prescription: one(prescriptions, {
    fields: [pharmacyDispensations.prescriptionId],
    references: [prescriptions.id],
  }),
  inventory: one(pharmacyInventory, {
    fields: [pharmacyDispensations.inventoryId],
    references: [pharmacyInventory.id],
  }),
  dispenser: one(users, {
    fields: [pharmacyDispensations.dispensedBy],
    references: [users.id],
  }),
}));
