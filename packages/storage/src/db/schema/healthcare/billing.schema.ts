/**
 * Billing Schema
 * 
 * Charges, claims, payments, and invoices
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
export const chargeStatusEnum = pgEnum('charge_status', [
  'pending',
  'billed',
  'submitted',
  'paid',
  'denied',
  'adjusted',
  'refunded',
]);

export const claimStatusEnum = pgEnum('claim_status', [
  'draft',
  'submitted',
  'accepted',
  'rejected',
  'paid',
  'denied',
  'appealed',
  'voided',
]);

export const paymentMethodEnum = pgEnum('payment_method', [
  'cash',
  'credit_card',
  'debit_card',
  'check',
  'bank_transfer',
  'insurance',
  'other',
]);

export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'completed',
  'failed',
  'refunded',
]);

// Charges table
export const charges = pgTable(
  'charges',
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
    
    // Charge Details
    chargeNumber: varchar('charge_number', { length: 50 }).notNull().unique(),
    chargeDate: date('charge_date').notNull(),
    serviceDate: date('service_date').notNull(),
    
    // Procedure Codes
    cptCode: varchar('cpt_code', { length: 20 }),
    cptDescription: varchar('cpt_description', { length: 500 }),
    icd10Codes: jsonb('icd10_codes').$type<string[]>().default([]),
    modifiers: jsonb('modifiers').$type<string[]>().default([]),
    
    // Financial
    unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
    quantity: numeric('quantity', { precision: 10, scale: 2 }).default('1'),
    totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
    discountAmount: numeric('discount_amount', { precision: 10, scale: 2 }).default('0'),
    adjustmentAmount: numeric('adjustment_amount', { precision: 10, scale: 2 }).default('0'),
    netAmount: numeric('net_amount', { precision: 10, scale: 2 }).notNull(),
    
    // Status
    status: chargeStatusEnum('status').notNull().default('pending'),
    isBilled: boolean('is_billed').default(false).notNull(),
    billedAt: timestamp('billed_at', { withTimezone: true }),
    
    // Provider
    providerId: uuid('provider_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    departmentId: uuid('department_id'),
    
    // Metadata
    notes: text('notes'),
    createdBy: uuid('created_by')
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
    organizationIdIdx: index('idx_charges_organization_id').on(table.organizationId),
    patientIdIdx: index('idx_charges_patient_id').on(table.patientId),
    appointmentIdIdx: index('idx_charges_appointment_id').on(table.appointmentId),
    chargeNumberIdx: index('idx_charges_charge_number').on(table.chargeNumber),
    statusIdx: index('idx_charges_status').on(table.status),
    chargeDateIdx: index('idx_charges_charge_date').on(table.chargeDate),
  }),
);

// Insurance Claims table
export const claims = pgTable(
  'claims',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    patientId: uuid('patient_id')
      .notNull()
      .references(() => patients.id, { onDelete: 'restrict' }),
    
    // Claim Details
    claimNumber: varchar('claim_number', { length: 50 }).notNull().unique(),
    claimType: varchar('claim_type', { length: 20 }).notNull(), // 'professional', 'institutional'
    submissionType: varchar('submission_type', { length: 20 }).default('electronic'), // 'electronic', 'paper'
    
    // Insurance
    insuranceProvider: varchar('insurance_provider', { length: 255 }).notNull(),
    insurancePolicyNumber: varchar('insurance_policy_number', { length: 100 }),
    payerId: varchar('payer_id', { length: 50 }), // NPI or payer ID
    
    // Dates
    serviceDateFrom: date('service_date_from').notNull(),
    serviceDateTo: date('service_date_to').notNull(),
    claimDate: date('claim_date').notNull(),
    
    // Financial
    totalCharges: numeric('total_charges', { precision: 10, scale: 2 }).notNull(),
    totalPaid: numeric('total_paid', { precision: 10, scale: 2 }).default('0'),
    patientResponsibility: numeric('patient_responsibility', { precision: 10, scale: 2 }).default('0'),
    
    // Status
    status: claimStatusEnum('status').notNull().default('draft'),
    submittedAt: timestamp('submitted_at', { withTimezone: true }),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    deniedAt: timestamp('denied_at', { withTimezone: true }),
    denialReason: text('denial_reason'),
    
    // EDI
    edi837Data: jsonb('edi837_data'), // EDI 837 claim data
    edi835Data: jsonb('edi835_data'), // EDI 835 remittance data
    controlNumber: varchar('control_number', { length: 50 }),
    
    // Metadata
    notes: text('notes'),
    createdBy: uuid('created_by')
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
    organizationIdIdx: index('idx_claims_organization_id').on(table.organizationId),
    patientIdIdx: index('idx_claims_patient_id').on(table.patientId),
    claimNumberIdx: index('idx_claims_claim_number').on(table.claimNumber),
    statusIdx: index('idx_claims_status').on(table.status),
    submittedAtIdx: index('idx_claims_submitted_at').on(table.submittedAt),
  }),
);

// Claim Charges (many-to-many relationship)
export const claimCharges = pgTable(
  'claim_charges',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    claimId: uuid('claim_id')
      .notNull()
      .references(() => claims.id, { onDelete: 'cascade' }),
    chargeId: uuid('charge_id')
      .notNull()
      .references(() => charges.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    claimIdIdx: index('idx_claim_charges_claim_id').on(table.claimId),
    chargeIdIdx: index('idx_claim_charges_charge_id').on(table.chargeId),
    uniqueClaimCharge: index('idx_claim_charges_unique').on(table.claimId, table.chargeId),
  }),
);

// Payments table
export const payments = pgTable(
  'payments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    patientId: uuid('patient_id')
      .notNull()
      .references(() => patients.id, { onDelete: 'restrict' }),
    claimId: uuid('claim_id').references(() => claims.id, { onDelete: 'set null' }),
    
    // Payment Details
    paymentNumber: varchar('payment_number', { length: 50 }).notNull().unique(),
    paymentDate: date('payment_date').notNull(),
    amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
    paymentMethod: paymentMethodEnum('payment_method').notNull(),
    status: paymentStatusEnum('status').notNull().default('pending'),
    
    // Payment Source
    payerType: varchar('payer_type', { length: 50 }).notNull(), // 'insurance', 'patient', 'other'
    payerName: varchar('payer_name', { length: 255 }),
    checkNumber: varchar('check_number', { length: 50 }),
    transactionId: varchar('transaction_id', { length: 100 }),
    
    // Refund
    isRefund: boolean('is_refund').default(false).notNull(),
    refundAmount: numeric('refund_amount', { precision: 10, scale: 2 }).default('0'),
    refundReason: text('refund_reason'),
    
    // Metadata
    notes: text('notes'),
    processedBy: uuid('processed_by')
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
    organizationIdIdx: index('idx_payments_organization_id').on(table.organizationId),
    patientIdIdx: index('idx_payments_patient_id').on(table.patientId),
    claimIdIdx: index('idx_payments_claim_id').on(table.claimId),
    paymentNumberIdx: index('idx_payments_payment_number').on(table.paymentNumber),
    paymentDateIdx: index('idx_payments_payment_date').on(table.paymentDate),
  }),
);

// Invoices table
export const invoices = pgTable(
  'invoices',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    patientId: uuid('patient_id')
      .notNull()
      .references(() => patients.id, { onDelete: 'restrict' }),
    
    // Invoice Details
    invoiceNumber: varchar('invoice_number', { length: 50 }).notNull().unique(),
    invoiceDate: date('invoice_date').notNull(),
    dueDate: date('due_date'),
    
    // Financial
    subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
    taxAmount: numeric('tax_amount', { precision: 10, scale: 2 }).default('0'),
    discountAmount: numeric('discount_amount', { precision: 10, scale: 2 }).default('0'),
    totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
    paidAmount: numeric('paid_amount', { precision: 10, scale: 2 }).default('0'),
    balanceAmount: numeric('balance_amount', { precision: 10, scale: 2 }).notNull(),
    
    // Status
    status: varchar('status', { length: 50 }).default('draft'), // 'draft', 'sent', 'paid', 'overdue', 'cancelled'
    sentAt: timestamp('sent_at', { withTimezone: true }),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    
    // Metadata
    notes: text('notes'),
    createdBy: uuid('created_by')
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
    organizationIdIdx: index('idx_invoices_organization_id').on(table.organizationId),
    patientIdIdx: index('idx_invoices_patient_id').on(table.patientId),
    invoiceNumberIdx: index('idx_invoices_invoice_number').on(table.invoiceNumber),
    statusIdx: index('idx_invoices_status').on(table.status),
  }),
);

// Invoice Charges (many-to-many)
export const invoiceCharges = pgTable(
  'invoice_charges',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    invoiceId: uuid('invoice_id')
      .notNull()
      .references(() => invoices.id, { onDelete: 'cascade' }),
    chargeId: uuid('charge_id')
      .notNull()
      .references(() => charges.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    invoiceIdIdx: index('idx_invoice_charges_invoice_id').on(table.invoiceId),
    chargeIdIdx: index('idx_invoice_charges_charge_id').on(table.chargeId),
  }),
);

// Relations
export const chargesRelations = relations(charges, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [charges.organizationId],
    references: [organizations.id],
  }),
  patient: one(patients, {
    fields: [charges.patientId],
    references: [patients.id],
  }),
  appointment: one(appointments, {
    fields: [charges.appointmentId],
    references: [appointments.id],
  }),
  provider: one(users, {
    fields: [charges.providerId],
    references: [users.id],
  }),
  claimCharges: many(claimCharges),
  invoiceCharges: many(invoiceCharges),
}));

export const claimsRelations = relations(claims, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [claims.organizationId],
    references: [organizations.id],
  }),
  patient: one(patients, {
    fields: [claims.patientId],
    references: [patients.id],
  }),
  claimCharges: many(claimCharges),
  payments: many(payments),
}));

export const claimChargesRelations = relations(claimCharges, ({ one }) => ({
  claim: one(claims, {
    fields: [claimCharges.claimId],
    references: [claims.id],
  }),
  charge: one(charges, {
    fields: [claimCharges.chargeId],
    references: [charges.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  organization: one(organizations, {
    fields: [payments.organizationId],
    references: [organizations.id],
  }),
  patient: one(patients, {
    fields: [payments.patientId],
    references: [patients.id],
  }),
  claim: one(claims, {
    fields: [payments.claimId],
    references: [claims.id],
  }),
  processor: one(users, {
    fields: [payments.processedBy],
    references: [users.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [invoices.organizationId],
    references: [organizations.id],
  }),
  patient: one(patients, {
    fields: [invoices.patientId],
    references: [patients.id],
  }),
  invoiceCharges: many(invoiceCharges),
}));

export const invoiceChargesRelations = relations(invoiceCharges, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceCharges.invoiceId],
    references: [invoices.id],
  }),
  charge: one(charges, {
    fields: [invoiceCharges.chargeId],
    references: [charges.id],
  }),
}));
