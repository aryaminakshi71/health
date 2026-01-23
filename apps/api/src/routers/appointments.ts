/**
 * Appointments Router
 * 
 * Appointment scheduling and management with telemedicine support
 */

import { z } from 'zod';
import { eq, and, gte, lte, desc, count, or, ilike } from 'drizzle-orm';
import { complianceAudited, getDb, schema } from '../procedures';
import { ORPCError } from '@orpc/server';
import { appointments, appointmentReminders } from '@healthcare-saas/storage/db/schema/healthcare';
import { getOrCache, invalidateCache } from '@healthcare-saas/storage/redis';

// Validation schemas
const createAppointmentSchema = z.object({
  patientId: z.string().uuid(),
  providerId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
  duration: z.number().int().min(5).max(480).default(30),
  appointmentType: z.enum(['consultation', 'follow_up', 'procedure', 'surgery', 'telemedicine', 'emergency', 'walk_in']).default('consultation'),
  reason: z.string().optional(),
  notes: z.string().optional(),
  departmentId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  roomNumber: z.string().optional(),
  isTelemedicine: z.boolean().default(false),
  telemedicineLink: z.string().url().optional(),
  telemedicinePlatform: z.string().optional(),
});

const updateAppointmentSchema = createAppointmentSchema.partial().extend({
  id: z.string().uuid(),
  status: z.enum(['scheduled', 'confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled']).optional(),
});

const appointmentFilterSchema = z.object({
  patientId: z.string().uuid().optional(),
  providerId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  status: z.enum(['scheduled', 'confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled']).optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

// Generate appointment number helper
function generateAppointmentNumber(organizationId: string, count: number): string {
  const prefix = organizationId.slice(0, 3).toUpperCase();
  const paddedCount = String(count + 1).padStart(6, '0');
  return `APT-${prefix}-${paddedCount}`;
}

export const appointmentsRouter = {
  /**
   * List appointments
   */
  list: complianceAudited
    .route({
      method: 'GET',
      path: '/appointments',
      summary: 'List appointments',
      tags: ['Appointments'],
    })
    .input(appointmentFilterSchema)
    .output(
      z.object({
        appointments: z.array(z.any()),
        total: z.number(),
      }),
    )
    .handler(async ({ context, input }) => {
      const db = getDb(context);
      const { patientId, providerId, departmentId, status, startDate, endDate, search, limit, offset } = input;

      // Cache key for list queries
      const cacheKey = `appointments:${context.organization.id}:${JSON.stringify(input)}`;

      // Use cache for list queries (5 min TTL)
      return getOrCache(
        cacheKey,
        async () => {
          const conditions = [
            eq(appointments.organizationId, context.organization.id),
          ];

      if (patientId) {
        conditions.push(eq(appointments.patientId, patientId));
      }

      if (providerId) {
        conditions.push(eq(appointments.providerId, providerId));
      }

      if (departmentId) {
        conditions.push(eq(appointments.departmentId, departmentId));
      }

      if (status) {
        conditions.push(eq(appointments.status, status));
      }

      if (startDate) {
        conditions.push(gte(appointments.scheduledAt, new Date(startDate)));
      }

      if (endDate) {
        conditions.push(lte(appointments.scheduledAt, new Date(endDate)));
      }

      if (search) {
        conditions.push(
          or(
            ilike(appointments.appointmentNumber, `%${search}%`),
            ilike(appointments.reason, `%${search}%`),
          )!,
        );
      }

      const appointmentsList = await db
        .select()
        .from(appointments)
        .where(and(...conditions))
        .orderBy(desc(appointments.scheduledAt))
        .limit(limit)
        .offset(offset);

      const totalResult = await db
        .select({ count: count() })
        .from(appointments)
        .where(and(...conditions));

          return {
            appointments: appointmentsList,
            total: totalResult[0]?.count || 0,
          };
        },
        300 // 5 minutes
      );
    }),

  /**
   * Get appointment by ID
   */
  get: complianceAudited
    .route({
      method: 'GET',
      path: '/appointments/:id',
      summary: 'Get appointment',
      tags: ['Appointments'],
    })
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context);

      // Cache key for individual appointment
      const cacheKey = `appointment:${input.id}:${context.organization.id}`;

      // Use cache (1 hour TTL for appointment data)
      const appointment = await getOrCache(
        cacheKey,
        async () => {
          return db.query.appointments.findFirst({
            where: (appointments, { eq, and }) =>
              and(
                eq(appointments.id, input.id),
                eq(appointments.organizationId, context.organization.id),
              ),
            with: {
              patient: true,
              provider: true,
            },
          });
        },
        3600 // 1 hour
      );

      if (!appointment) {
        throw new ORPCError({
          code: 'NOT_FOUND',
          message: 'Appointment not found',
        });
      }

      return appointment;
    }),

  /**
   * Create appointment
   */
  create: complianceAudited
    .route({
      method: 'POST',
      path: '/appointments',
      summary: 'Create appointment',
      tags: ['Appointments'],
    })
    .input(createAppointmentSchema)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context);

      // Get appointment count for number generation
      const countResult = await db
        .select({ count: count() })
        .from(appointments)
        .where(eq(appointments.organizationId, context.organization.id));

      const appointmentCount = countResult[0]?.count || 0;
      const appointmentNumber = generateAppointmentNumber(
        context.organization.id,
        appointmentCount,
      );

      // Check for conflicts (simplified - would need more sophisticated checking)
      const conflictingAppointments = await db
        .select()
        .from(appointments)
        .where(
          and(
            eq(appointments.providerId, input.providerId),
            eq(appointments.status, 'scheduled'),
            gte(appointments.scheduledAt, new Date(new Date(input.scheduledAt).getTime() - input.duration * 60000)),
            lte(appointments.scheduledAt, new Date(new Date(input.scheduledAt).getTime() + input.duration * 60000)),
          ),
        );

      if (conflictingAppointments.length > 0) {
        throw new ORPCError({
          code: 'CONFLICT',
          message: 'Provider has a conflicting appointment at this time',
        });
      }

      const [newAppointment] = await db
        .insert(appointments)
        .values({
          organizationId: context.organization.id,
          patientId: input.patientId,
          providerId: input.providerId,
          scheduledAt: new Date(input.scheduledAt),
          duration: input.duration,
          appointmentType: input.appointmentType,
          reason: input.reason,
          notes: input.notes,
          departmentId: input.departmentId,
          locationId: input.locationId,
          roomNumber: input.roomNumber,
          isTelemedicine: input.isTelemedicine,
          telemedicineLink: input.telemedicineLink,
          telemedicinePlatform: input.telemedicinePlatform,
          appointmentNumber,
          status: 'scheduled',
          createdBy: context.user.id,
        })
        .returning();

      // Create reminder (scheduled for 24 hours before)
      const reminderTime = new Date(new Date(input.scheduledAt).getTime() - 24 * 60 * 60 * 1000);
      if (reminderTime > new Date()) {
        await db.insert(appointmentReminders).values({
          appointmentId: newAppointment.id,
          reminderType: 'email',
          scheduledAt: reminderTime,
          status: 'pending',
        });
      }

      // Invalidate cache
      await invalidateCache(`appointments:${context.organization.id}:*`);
      await invalidateCache(`appointment:${newAppointment.id}:${context.organization.id}`);

      return newAppointment;
    }),

  /**
   * Update appointment
   */
  update: complianceAudited
    .route({
      method: 'PUT',
      path: '/appointments/:id',
      summary: 'Update appointment',
      tags: ['Appointments'],
    })
    .input(updateAppointmentSchema)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context);
      const { id, ...updateData } = input;

      const existingAppointment = await db.query.appointments.findFirst({
        where: (appointments, { eq, and }) =>
          and(
            eq(appointments.id, id),
            eq(appointments.organizationId, context.organization.id),
          ),
      });

      if (!existingAppointment) {
        throw new ORPCError({
          code: 'NOT_FOUND',
          message: 'Appointment not found',
        });
      }

      // Update status timestamps
      const statusUpdates: Record<string, Date> = {};
      if (updateData.status === 'checked_in') {
        statusUpdates.checkedInAt = new Date();
      }
      if (updateData.status === 'in_progress') {
        statusUpdates.startedAt = new Date();
      }
      if (updateData.status === 'completed') {
        statusUpdates.completedAt = new Date();
      }
      if (updateData.status === 'cancelled') {
        statusUpdates.cancelledAt = new Date();
      }

      const [updatedAppointment] = await db
        .update(appointments)
        .set({
          ...updateData,
          ...statusUpdates,
          scheduledAt: updateData.scheduledAt ? new Date(updateData.scheduledAt) : undefined,
          updatedBy: context.user.id,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(appointments.id, id),
            eq(appointments.organizationId, context.organization.id),
          ),
        )
        .returning();

      // Invalidate cache
      await invalidateCache(`appointments:${context.organization.id}:*`);
      await invalidateCache(`appointment:${id}:${context.organization.id}`);

      return updatedAppointment;
    }),

  /**
   * Cancel appointment
   */
  cancel: complianceAudited
    .route({
      method: 'POST',
      path: '/appointments/:id/cancel',
      summary: 'Cancel appointment',
      tags: ['Appointments'],
    })
    .input(
      z.object({
        id: z.string().uuid(),
        reason: z.string().optional(),
      }),
    )
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context);

      const [updatedAppointment] = await db
        .update(appointments)
        .set({
          status: 'cancelled',
          cancelledAt: new Date(),
          cancellationReason: input.reason,
          updatedBy: context.user.id,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(appointments.id, input.id),
            eq(appointments.organizationId, context.organization.id),
          ),
        )
        .returning();

      if (!updatedAppointment) {
        throw new ORPCError({
          code: 'NOT_FOUND',
          message: 'Appointment not found',
        });
      }

      return updatedAppointment;
    }),

  /**
   * Check in patient
   */
  checkIn: complianceAudited
    .route({
      method: 'POST',
      path: '/appointments/:id/check-in',
      summary: 'Check in patient',
      tags: ['Appointments'],
    })
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context);

      const [updatedAppointment] = await db
        .update(appointments)
        .set({
          status: 'checked_in',
          checkedInAt: new Date(),
          updatedBy: context.user.id,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(appointments.id, input.id),
            eq(appointments.organizationId, context.organization.id),
          ),
        )
        .returning();

      if (!updatedAppointment) {
        throw new ORPCError({
          code: 'NOT_FOUND',
          message: 'Appointment not found',
        });
      }

      return updatedAppointment;
    }),
};
