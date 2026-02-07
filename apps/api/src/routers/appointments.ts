/**
 * Appointments Router
 * 
 * Simplified router for appointment scheduling
 */

import { z } from 'zod';
import { pub } from '../procedures';

const createAppointmentSchema = z.object({
  patientId: z.string().uuid(),
  providerId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
  duration: z.number().int().min(5).max(480).default(30),
  appointmentType: z.enum(['consultation', 'follow_up', 'procedure', 'surgery', 'telemedicine', 'emergency', 'walk_in']).default('consultation'),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

const updateAppointmentSchema = createAppointmentSchema.partial().extend({
  id: z.string().uuid(),
  status: z.enum(['scheduled', 'confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled']).optional(),
});

const appointmentFilterSchema = z.object({
  patientId: z.string().uuid().optional(),
  providerId: z.string().uuid().optional(),
  status: z.enum(['scheduled', 'confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled']).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

const outputSchema = z.object({
  appointments: z.array(z.any()),
  total: z.number(),
});

export const appointmentsRouter = {
  list: pub
    .route({
      method: 'GET',
      path: '/appointments',
      summary: 'List appointments',
      tags: ['Appointments'],
    })
    .input(appointmentFilterSchema)
    .output(outputSchema)
    .handler(async () => {
      return {
        appointments: [],
        total: 0,
      };
    }),

  get: pub
    .route({
      method: 'GET',
      path: '/appointments/:id',
      summary: 'Get appointment',
      tags: ['Appointments'],
    })
    .output(z.any())
    .handler(async () => {
      return null;
    }),

  create: pub
    .route({
      method: 'POST',
      path: '/appointments',
      summary: 'Create appointment',
      tags: ['Appointments'],
    })
    .input(createAppointmentSchema)
    .output(z.any())
    .handler(async (opts) => {
      const { input } = opts as any;
      return { id: 'new-appointment-id', ...input };
    }),

  update: pub
    .route({
      method: 'PUT',
      path: '/appointments/:id',
      summary: 'Update appointment',
      tags: ['Appointments'],
    })
    .input(updateAppointmentSchema)
    .output(z.any())
    .handler(async (opts) => {
      const { input } = opts as any;
      return { id: input.id, ...input };
    }),

  cancel: pub
    .route({
      method: 'POST',
      path: '/appointments/:id/cancel',
      summary: 'Cancel appointment',
      tags: ['Appointments'],
    })
    .output(z.any())
    .handler(async () => {
      return { success: true };
    }),
};
