/**
 * Appointments Schema
 * 
 * Appointment scheduling and management tables
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  jsonb,
  integer,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizations } from '../auth.schema';
import { users } from '../auth.schema';
import { patients } from './patients.schema';

// Enums
export const appointmentStatusEnum = pgEnum('appointment_status', [
  'scheduled',
  'confirmed',
  'checked_in',
  'in_progress',
  'completed',
  'cancelled',
  'no_show',
  'rescheduled',
]);

export const appointmentTypeEnum = pgEnum('appointment_type', [
  'consultation',
  'follow_up',
  'procedure',
  'surgery',
  'telemedicine',
  'emergency',
  'walk_in',
]);

export const appointmentPriorityEnum = pgEnum('appointment_priority', [
  'routine',
  'urgent',
  'emergency',
]);

// Appointments table
export const appointments = pgTable(
  'appointments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    patientId: uuid('patient_id')
      .notNull()
      .references(() => patients.id, { onDelete: 'restrict' }),
    
    // Scheduling
    appointmentNumber: varchar('appointment_number', { length: 50 }).notNull().unique(),
    scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull(),
    duration: integer('duration').notNull().default(30), // Duration in minutes
    appointmentType: appointmentTypeEnum('appointment_type').notNull().default('consultation'),
    status: appointmentStatusEnum('status').notNull().default('scheduled'),
    priority: appointmentPriorityEnum('priority').default('routine'),
    
    // Provider Assignment
    providerId: uuid('provider_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    departmentId: uuid('department_id'), // References departments table (to be created)
    locationId: uuid('location_id'), // References locations table (to be created)
    roomNumber: varchar('room_number', { length: 50 }),
    
    // Appointment Details
    reason: text('reason'), // Chief complaint or reason for visit
    notes: text('notes'),
    instructions: text('instructions'), // Pre-appointment instructions
    
    // Telemedicine
    isTelemedicine: boolean('is_telemedicine').default(false).notNull(),
    telemedicineLink: varchar('telemedicine_link', { length: 500 }),
    telemedicinePlatform: varchar('telemedicine_platform', { length: 100 }),
    
    // Status Tracking
    checkedInAt: timestamp('checked_in_at', { withTimezone: true }),
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
    cancellationReason: text('cancellation_reason'),
    
    // Reminders
    reminderSent: boolean('reminder_sent').default(false).notNull(),
    reminderSentAt: timestamp('reminder_sent_at', { withTimezone: true }),
    
    // Region-Specific
    prayerTimeConsideration: boolean('prayer_time_consideration').default(false), // For Dubai
    genderAppropriateStaff: boolean('gender_appropriate_staff').default(false), // For Dubai
    
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
    organizationIdIdx: index('idx_appointments_organization_id').on(table.organizationId),
    patientIdIdx: index('idx_appointments_patient_id').on(table.patientId),
    providerIdIdx: index('idx_appointments_provider_id').on(table.providerId),
    scheduledAtIdx: index('idx_appointments_scheduled_at').on(table.scheduledAt),
    statusIdx: index('idx_appointments_status').on(table.status),
    appointmentNumberIdx: index('idx_appointments_appointment_number').on(table.appointmentNumber),
    departmentIdIdx: index('idx_appointments_department_id').on(table.departmentId),
  }),
);

// Appointment Reminders table
export const appointmentReminders = pgTable(
  'appointment_reminders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    appointmentId: uuid('appointment_id')
      .notNull()
      .references(() => appointments.id, { onDelete: 'cascade' }),
    reminderType: varchar('reminder_type', { length: 50 }).notNull(), // 'sms', 'email', 'push', 'call'
    scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull(),
    sentAt: timestamp('sent_at', { withTimezone: true }),
    status: varchar('status', { length: 50 }).default('pending'), // 'pending', 'sent', 'failed'
    errorMessage: text('error_message'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    appointmentIdIdx: index('idx_appointment_reminders_appointment_id').on(table.appointmentId),
    scheduledAtIdx: index('idx_appointment_reminders_scheduled_at').on(table.scheduledAt),
  }),
);

// Relations
export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [appointments.organizationId],
    references: [organizations.id],
  }),
  patient: one(patients, {
    fields: [appointments.patientId],
    references: [patients.id],
  }),
  provider: one(users, {
    fields: [appointments.providerId],
    references: [users.id],
  }),
  creator: one(users, {
    fields: [appointments.createdBy],
    references: [users.id],
  }),
  updater: one(users, {
    fields: [appointments.updatedBy],
    references: [users.id],
  }),
  reminders: many(appointmentReminders),
}));

export const appointmentRemindersRelations = relations(appointmentReminders, ({ one }) => ({
  appointment: one(appointments, {
    fields: [appointmentReminders.appointmentId],
    references: [appointments.id],
  }),
}));
