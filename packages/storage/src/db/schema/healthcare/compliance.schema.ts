/**
 * Compliance Schema
 * 
 * Audit logs and compliance tracking for HIPAA, GDPR, NDHM, and Sharia
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  boolean,
  integer,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizations } from '../auth.schema';
import { users } from '../auth.schema';

// Enums
export const complianceRegionEnum = pgEnum('compliance_region', [
  'india',
  'usa',
  'europe',
  'dubai',
]);

export const auditActionEnum = pgEnum('audit_action', [
  'create',
  'read',
  'update',
  'delete',
  'export',
  'access',
  'login',
  'logout',
  'consent_granted',
  'consent_revoked',
  'data_deletion',
  'breach_detected',
]);

export const resourceTypeEnum = pgEnum('resource_type', [
  'patient',
  'appointment',
  'ehr',
  'billing',
  'lab_result',
  'prescription',
  'user',
  'organization',
  'audit_log',
]);

// Compliance Audit Logs table
export const complianceAuditLogs = pgTable(
  'compliance_audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    region: complianceRegionEnum('region').notNull(),
    
    // User & Action
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    action: auditActionEnum('action').notNull(),
    resourceType: resourceTypeEnum('resource_type'),
    resourceId: uuid('resource_id'),
    
    // Request Details
    method: varchar('method', { length: 10 }), // GET, POST, PUT, DELETE
    path: varchar('path', { length: 500 }),
    ipAddress: varchar('ip_address', { length: 100 }),
    userAgent: text('user_agent'),
    
    // Response Details
    statusCode: integer('status_code'),
    duration: integer('duration'), // milliseconds
    success: boolean('success').default(true).notNull(),
    
    // Data Details
    dataBefore: jsonb('data_before'), // For update/delete actions
    dataAfter: jsonb('data_after'), // For create/update actions
    errorMessage: text('error_message'),
    
    // Compliance-Specific
    hipaaCompliant: boolean('hipaa_compliant').default(false),
    gdprCompliant: boolean('gdpr_compliant').default(false),
    phiAccessed: boolean('phi_accessed').default(false), // Protected Health Information
    consentRequired: boolean('consent_required').default(false),
    consentGranted: boolean('consent_granted').default(false),
    
    // Timestamp
    timestamp: timestamp('timestamp', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    organizationIdIdx: index('idx_compliance_audit_org_id').on(table.organizationId),
    userIdIdx: index('idx_compliance_audit_user_id').on(table.userId),
    regionIdx: index('idx_compliance_audit_region').on(table.region),
    actionIdx: index('idx_compliance_audit_action').on(table.action),
    resourceTypeIdx: index('idx_compliance_audit_resource_type').on(table.resourceType),
    resourceIdIdx: index('idx_compliance_audit_resource_id').on(table.resourceId),
    timestampIdx: index('idx_compliance_audit_timestamp').on(table.timestamp),
    phiAccessedIdx: index('idx_compliance_audit_phi_accessed').on(table.phiAccessed),
  }),
);

// Consent Management table
export const consentRecords = pgTable(
  'consent_records',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    patientId: uuid('patient_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }), // Assuming patient is a user
    
    // Consent Details
    consentType: varchar('consent_type', { length: 100 }).notNull(), // 'treatment', 'data_sharing', 'gdpr', 'hipaa', 'telemedicine'
    consentDescription: text('consent_description'),
    isGranted: boolean('is_granted').default(false).notNull(),
    
    // Consent Period
    grantedAt: timestamp('granted_at', { withTimezone: true }),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    
    // Consent Method
    consentMethod: varchar('consent_method', { length: 50 }), // 'electronic', 'paper', 'verbal'
    ipAddress: varchar('ip_address', { length: 100 }),
    userAgent: text('user_agent'),
    
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
    organizationIdIdx: index('idx_consent_records_org_id').on(table.organizationId),
    patientIdIdx: index('idx_consent_records_patient_id').on(table.patientId),
    consentTypeIdx: index('idx_consent_records_consent_type').on(table.consentType),
    grantedAtIdx: index('idx_consent_records_granted_at').on(table.grantedAt),
  }),
);

// Data Breach Incidents table
export const dataBreachIncidents = pgTable(
  'data_breach_incidents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    region: complianceRegionEnum('region').notNull(),
    
    // Incident Details
    incidentNumber: varchar('incident_number', { length: 50 }).notNull().unique(),
    incidentType: varchar('incident_type', { length: 100 }).notNull(), // 'unauthorized_access', 'data_loss', 'system_breach'
    description: text('description'),
    affectedRecords: integer('affected_records'),
    affectedPatients: integer('affected_patients'),
    
    // Timeline
    detectedAt: timestamp('detected_at', { withTimezone: true }).notNull(),
    reportedAt: timestamp('reported_at', { withTimezone: true }),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    
    // Notification
    notificationRequired: boolean('notification_required').default(false),
    notificationSent: boolean('notification_sent').default(false),
    notificationSentAt: timestamp('notification_sent_at', { withTimezone: true }),
    notificationMethod: varchar('notification_method', { length: 100 }),
    
    // Status
    status: varchar('status', { length: 50 }).default('detected'), // 'detected', 'investigating', 'contained', 'resolved'
    severity: varchar('severity', { length: 50 }), // 'low', 'medium', 'high', 'critical'
    
    // Remediation
    remediationSteps: jsonb('remediation_steps').$type<string[]>().default([]),
    preventiveMeasures: jsonb('preventive_measures').$type<string[]>().default([]),
    
    // Reported By
    reportedBy: uuid('reported_by')
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
    organizationIdIdx: index('idx_data_breach_org_id').on(table.organizationId),
    regionIdx: index('idx_data_breach_region').on(table.region),
    incidentNumberIdx: index('idx_data_breach_incident_number').on(table.incidentNumber),
    detectedAtIdx: index('idx_data_breach_detected_at').on(table.detectedAt),
  }),
);

// Relations
export const complianceAuditLogsRelations = relations(complianceAuditLogs, ({ one }) => ({
  organization: one(organizations, {
    fields: [complianceAuditLogs.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [complianceAuditLogs.userId],
    references: [users.id],
  }),
}));

export const consentRecordsRelations = relations(consentRecords, ({ one }) => ({
  organization: one(organizations, {
    fields: [consentRecords.organizationId],
    references: [organizations.id],
  }),
  patient: one(users, {
    fields: [consentRecords.patientId],
    references: [users.id],
  }),
  documentedByUser: one(users, {
    fields: [consentRecords.documentedBy],
    references: [users.id],
  }),
}));

export const dataBreachIncidentsRelations = relations(dataBreachIncidents, ({ one }) => ({
  organization: one(organizations, {
    fields: [dataBreachIncidents.organizationId],
    references: [organizations.id],
  }),
  reportedByUser: one(users, {
    fields: [dataBreachIncidents.reportedBy],
    references: [users.id],
  }),
}));
