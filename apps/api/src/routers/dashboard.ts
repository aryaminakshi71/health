/**
 * Dashboard Router
 * 
 * Simplified router for dashboard endpoints
 */

import { z } from 'zod';
import { pub } from '../procedures';

export const dashboardRouter = {
  getOverview: pub
    .route({
      method: 'GET',
      path: '/dashboard/overview',
      summary: 'Get dashboard overview',
      tags: ['Dashboard'],
    })
    .output(z.object({
      patientsCount: z.number(),
      appointmentsToday: z.number(),
      pendingLabResults: z.number(),
      revenue: z.object({
        today: z.number(),
        month: z.number(),
        year: z.number(),
      }),
      occupancyRate: z.number(),
      upcomingAppointments: z.array(z.object({
        id: z.string(),
        patientName: z.string(),
        time: z.string(),
        type: z.string(),
      })),
    }))
    .handler(async () => {
      return {
        patientsCount: 1250,
        appointmentsToday: 28,
        pendingLabResults: 15,
        revenue: {
          today: 4250.00,
          month: 125000.00,
          year: 1450000.00,
        },
        occupancyRate: 0.75,
        upcomingAppointments: [
          { id: 'apt_001', patientName: 'John Smith', time: '09:00 AM', type: 'Check-up' },
          { id: 'apt_002', patientName: 'Jane Doe', time: '09:30 AM', type: 'Follow-up' },
          { id: 'apt_003', patientName: 'Robert Johnson', time: '10:00 AM', type: 'Consultation' },
        ],
      };
    }),

  getNotifications: pub
    .route({
      method: 'GET',
      path: '/dashboard/notifications',
      summary: 'Get user notifications',
      tags: ['Dashboard'],
    })
    .output(z.array(z.object({
      id: z.string(),
      type: z.enum(['info', 'warning', 'alert', 'reminder']),
      title: z.string(),
      message: z.string(),
      read: z.boolean(),
      createdAt: z.string(),
    })))
    .handler(async () => {
      return [
        {
          id: 'notif_001',
          type: 'alert' as const,
          title: 'Lab Results Ready',
          message: 'Lab results for patient #12345 are ready for review',
          read: false,
          createdAt: '2026-02-07T08:30:00Z',
        },
        {
          id: 'notif_002',
          type: 'reminder' as const,
          title: 'Appointment Reminder',
          message: 'Staff meeting scheduled for 2:00 PM today',
          read: false,
          createdAt: '2026-02-07T07:00:00Z',
        },
      ];
    }),

  getQuickActions: pub
    .route({
      method: 'GET',
      path: '/dashboard/quick-actions',
      summary: 'Get available quick actions',
      tags: ['Dashboard'],
    })
    .output(z.array(z.object({
      id: z.string(),
      label: z.string(),
      icon: z.string(),
      route: z.string(),
    })))
    .handler(async () => {
      return [
        { id: 'action_001', label: 'New Patient', icon: 'user-plus', route: '/patients/new' },
        { id: 'action_002', label: 'Schedule Appointment', icon: 'calendar', route: '/appointments/new' },
        { id: 'action_003', label: 'View Lab Results', icon: 'flask', route: '/lab-results' },
        { id: 'action_004', label: 'Billing', icon: 'credit-card', route: '/billing' },
      ];
    }),
};
