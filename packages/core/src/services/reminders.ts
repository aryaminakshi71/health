import { eq, gte, lte, desc, asc, and } from 'drizzle-orm';
import { db } from '../db';
import { appointments, patients } from '../db/schema';
import { createSMSService } from './sms';
import { getCache, setCache } from '../redis';

const REMINDER_HOURS_BEFORE = [24, 2];

export async function processAppointmentReminders() {
  const now = new Date();
  const smsService = createSMSService();

  for (const hoursBefore of REMINDER_HOURS_BEFORE) {
    const targetTime = new Date(now.getTime() + hoursBefore * 60 * 60 * 1000);
    const windowStart = new Date(targetTime.getTime() - 30 * 60 * 1000);
    const windowEnd = new Date(targetTime.getTime() + 30 * 60 * 1000);

    const upcomingAppointments = await db.select({
      appointment: appointments,
      patient: patients,
    })
    .from(appointments)
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    .where(
      and(
        eq(appointments.status, 'scheduled'),
        gte(appointments.scheduledAt, windowStart),
        lte(appointments.scheduledAt, windowEnd)
      )
    )
    .limit(100);

    for (const { appointment, patient } of upcomingAppointments) {
      if (!patient.phone) continue;

      const cacheKey = `reminder:sent:${appointment.id}:${hoursBefore}`;
      const alreadySent = await getCache<boolean>(cacheKey);
      
      if (alreadySent) continue;

      const dateStr = appointment.scheduledAt!.toLocaleDateString();
      const timeStr = appointment.scheduledAt!.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      await smsService.sendAppointmentReminder(
        patient.phone,
        patient.firstName || 'Patient',
        dateStr,
        timeStr
      );

      await setCache(cacheKey, true, 60 * 60);

      await db.insert(appointmentReminders).values({
        appointmentId: appointment.id,
        patientId: patient.id,
        hoursBefore,
        sentAt: new Date(),
        status: 'sent',
      });
    }
  }

  return { processed: true };
}

export async function scheduleAppointmentReminder(appointmentId: string) {
  const appointment = await db.query.appointments.findFirst({
    where: eq(appointments.id, appointmentId),
  });

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  for (const hoursBefore of REMINDER_HOURS_BEFORE) {
    const reminderTime = new Date(appointment.scheduledAt!.getTime() - hoursBefore * 60 * 60 * 1000);
    
    await db.insert(scheduledReminders).values({
      appointmentId: appointment.id,
      scheduledFor: reminderTime,
      type: 'sms',
      status: 'pending',
      metadata: JSON.stringify({ hoursBefore }),
    });
  }
}

import { pgTable, uuid, timestamp, text, jsonb, integer } from 'drizzle-orm/pg-core';

export const appointmentReminders = pgTable('appointment_reminders', {
  id: uuid('id').defaultRandom().primaryKey(),
  appointmentId: uuid('appointment_id').notNull(),
  patientId: uuid('patient_id').notNull(),
  hoursBefore: integer('hours_before').notNull(),
  sentAt: timestamp('sent_at').defaultNow(),
  status: text('status').default('pending'),
  errorMessage: text('error_message'),
});

export const scheduledReminders = pgTable('scheduled_reminders', {
  id: uuid('id').defaultRandom().primaryKey(),
  appointmentId: uuid('appointment_id').notNull(),
  scheduledFor: timestamp('scheduled_for').notNull(),
  type: text('type').notNull(),
  status: text('status').default('pending'),
  metadata: jsonb('metadata'),
  processedAt: timestamp('processed_at'),
  errorMessage: text('error_message'),
});
