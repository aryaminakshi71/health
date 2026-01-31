/**
 * Telemedicine Router
 * 
 * Video consultation management
 */

import { z } from 'zod';
import { complianceAudited, getDb, schema } from '../procedures';
import { ORPCError } from '@orpc/server';
import { createTwilioRoom, createZoomRoom } from '@healthcare-saas/core/integrations/telemedicine';
import { appointments } from '@healthcare-saas/storage/db/schema';
import { eq, and } from 'drizzle-orm';

// Validation schemas
const createTelemedicineRoomSchema = z.object({
  appointmentId: z.string().uuid(),
  provider: z.enum(['twilio', 'zoom']).default('twilio'),
});

export const telemedicineRouter = {
  /**
   * Create telemedicine room
   */
  createRoom: complianceAudited
    .route({
      method: 'POST',
      path: '/telemedicine/room',
      summary: 'Create telemedicine room',
      tags: ['Telemedicine'],
    })
    .input(createTelemedicineRoomSchema)
    .output(
      z.object({
        roomId: z.string(),
        roomUrl: z.string(),
        accessToken: z.string(),
        expiresAt: z.string(),
      }),
    )
    .handler(async ({ context, input }) => {
      const db = getDb(context);

      // Get appointment details
      const appointment = await db.query.appointments.findFirst({
        where: (appointments, { eq, and }) =>
          and(
            eq(appointments.id, input.appointmentId),
            eq(appointments.organizationId, context.organization.id),
          ),
        with: {
          patient: true,
          provider: true,
        },
      });

      if (!appointment) {
        throw new ORPCError({
          code: 'NOT_FOUND',
          message: 'Appointment not found',
        });
      }

      if (!appointment.isTelemedicine) {
        throw new ORPCError({
          code: 'BAD_REQUEST',
          message: 'Appointment is not configured for telemedicine',
        });
      }

      // Create room based on provider
      let room;
      if (input.provider === 'twilio') {
        room = await createTwilioRoom(
          appointment.id,
          `${appointment.patient.firstName} ${appointment.patient.lastName}`,
          appointment.provider.name || 'Provider',
        );
      } else {
        room = await createZoomRoom(
          appointment.id,
          `Consultation - ${appointment.patient.firstName} ${appointment.patient.lastName}`,
        );
      }

      // Update appointment with telemedicine link
      await db
        .update(appointments)
        .set({
          telemedicineLink: room.roomUrl,
          telemedicinePlatform: input.provider,
          updatedAt: new Date(),
        })
        .where(eq(appointments.id, appointment.id));

      return {
        roomId: room.roomId,
        roomUrl: room.roomUrl,
        accessToken: room.accessToken,
        expiresAt: room.expiresAt.toISOString(),
      };
    }),

  /**
   * Get telemedicine room status
   */
  getRoomStatus: complianceAudited
    .route({
      method: 'GET',
      path: '/telemedicine/room/:appointmentId',
      summary: 'Get telemedicine room status',
      tags: ['Telemedicine'],
    })
    .input(
      z.object({
        appointmentId: z.string().uuid(),
      }),
    )
    .output(
      z.object({
        status: z.enum(['active', 'in-progress', 'completed', 'expired']),
        roomUrl: z.string().nullable(),
      }),
    )
    .handler(async ({ context, input }) => {
      const db = getDb(context);

      const appointment = await db.query.appointments.findFirst({
        where: (appointments, { eq, and }) =>
          and(
            eq(appointments.id, input.appointmentId),
            eq(appointments.organizationId, context.organization.id),
          ),
      });

      if (!appointment) {
        throw new ORPCError({
          code: 'NOT_FOUND',
          message: 'Appointment not found',
        });
      }

      return {
        status: appointment.status === 'in_progress' ? 'in-progress' :
                appointment.status === 'completed' ? 'completed' : 'active',
        roomUrl: appointment.telemedicineLink,
      };
    }),
};
