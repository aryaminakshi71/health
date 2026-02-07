/**
 * Telemedicine Router
 * 
 * Simplified router for telemedicine/virtual visit endpoints
 */

import { z } from 'zod';
import { pub } from '../procedures';

export const telemedicineRouter = {
  getAppointments: pub
    .route({
      method: 'GET',
      path: '/telemedicine/appointments',
      summary: 'Get telemedicine appointments',
      tags: ['Telemedicine'],
    })
    .input(z.object({
      patientId: z.string().optional(),
      providerId: z.string().optional(),
      status: z.enum(['scheduled', 'in-progress', 'completed', 'cancelled']).optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .output(z.array(z.object({
      id: z.string(),
      patientId: z.string(),
      providerId: z.string(),
      patientName: z.string(),
      providerName: z.string(),
      scheduledAt: z.string(),
      duration: z.number(),
      status: z.enum(['scheduled', 'in-progress', 'completed', 'cancelled']),
      type: z.enum(['video', 'audio', 'chat']),
      reason: z.string(),
      notes: z.string().optional(),
      meetingUrl: z.string().optional(),
    })))
    .handler(async () => {
      return [
        {
          id: 'tele_001',
          patientId: 'patient_123',
          providerId: 'user_456',
          patientName: 'John Smith',
          providerName: 'Dr. Wilson',
          scheduledAt: '2026-02-07T14:00:00Z',
          duration: 30,
          status: 'scheduled' as const,
          type: 'video' as const,
          reason: 'Follow-up consultation',
          meetingUrl: 'https://telehealth.example.com/room/abc123',
        },
      ];
    }),

  createAppointment: pub
    .route({
      method: 'POST',
      path: '/telemedicine/appointments',
      summary: 'Schedule a telemedicine appointment',
      tags: ['Telemedicine'],
    })
    .input(z.object({
      patientId: z.string(),
      providerId: z.string(),
      scheduledAt: z.string(),
      duration: z.number().default(30),
      type: z.enum(['video', 'audio', 'chat']).default('video'),
      reason: z.string(),
      notes: z.string().optional(),
    }))
    .output(z.object({
      success: z.boolean(),
      appointmentId: z.string(),
      meetingUrl: z.string(),
      scheduledAt: z.string(),
    }))
    .handler(async ({ input }) => {
      return {
        success: true,
        appointmentId: `tele_${Date.now()}`,
        meetingUrl: `https://telehealth.example.com/room/${Date.now()}`,
        scheduledAt: input.scheduledAt,
      };
    }),

  joinAppointment: pub
    .route({
      method: 'POST',
      path: '/telemedicine/appointments/{appointmentId}/join',
      summary: 'Join a telemedicine appointment',
      tags: ['Telemedicine'],
    })
    .input(z.object({
      appointmentId: z.string(),
      userId: z.string(),
    }))
    .output(z.object({
      success: z.boolean(),
      meetingToken: z.string(),
      meetingUrl: z.string(),
      startedAt: z.string(),
    }))
    .handler(async ({ input }) => {
      return {
        success: true,
        meetingToken: `token_${Date.now()}`,
        meetingUrl: `https://telehealth.example.com/room/${input.appointmentId}`,
        startedAt: new Date().toISOString(),
      };
    }),

  endAppointment: pub
    .route({
      method: 'POST',
      path: '/telemedicine/appointments/{appointmentId}/end',
      summary: 'End a telemedicine appointment',
      tags: ['Telemedicine'],
    })
    .input(z.object({
      appointmentId: z.string(),
      notes: z.string().optional(),
    }))
    .output(z.object({
      success: z.boolean(),
      endedAt: z.string(),
      duration: z.number(),
    }))
    .handler(async ({ input }) => {
      return {
        success: true,
        endedAt: new Date().toISOString(),
        duration: 25,
      };
    }),

  getWaitingRoom: pub
    .route({
      method: 'GET',
      path: '/telemedicine/waiting-room/{providerId}',
      summary: 'Get patients in waiting room',
      tags: ['Telemedicine'],
    })
    .input(z.object({ providerId: z.string() }))
    .output(z.array(z.object({
      appointmentId: z.string(),
      patientId: z.string(),
      patientName: z.string(),
      waitingSince: z.string(),
      position: z.number(),
      type: z.enum(['video', 'audio', 'chat']),
      reason: z.string(),
    })))
    .handler(async ({ input }) => {
      return [
        {
          appointmentId: 'tele_001',
          patientId: 'patient_123',
          patientName: 'John Smith',
          waitingSince: '2026-02-07T14:05:00Z',
          position: 1,
          type: 'video' as const,
          reason: 'Follow-up consultation',
        },
      ];
    }),
};
