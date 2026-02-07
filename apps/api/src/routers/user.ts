/**
 * User Router
 * 
 * Simplified router for user management endpoints
 */

import { z } from 'zod';
import { pub } from '../procedures';

export const userRouter = {
  getCurrentUser: pub
    .route({
      method: 'GET',
      path: '/users/me',
      summary: 'Get current user',
      tags: ['Users'],
    })
    .output(z.object({
      id: z.string(),
      email: z.string(),
      name: z.string(),
      role: z.enum(['admin', 'physician', 'nurse', 'staff', 'patient']),
      organization: z.object({
        id: z.string(),
        name: z.string(),
      }).optional(),
      permissions: z.array(z.string()),
      preferences: z.object({
        theme: z.enum(['light', 'dark', 'system']).default('system'),
        language: z.string().default('en'),
        notifications: z.object({
          email: z.boolean(),
          push: z.boolean(),
          sms: z.boolean(),
        }),
      }),
      lastLogin: z.string().optional(),
      createdAt: z.string(),
    }))
    .handler(async () => {
      return {
        id: 'user_456',
        email: 'dr.wilson@clinic.com',
        name: 'Dr. Wilson',
        role: 'physician' as const,
        organization: { id: 'org_001', name: 'Springfield Medical Clinic' },
        permissions: ['view_patients', 'edit_patients', 'view_appointments', 'create_prescriptions'],
        preferences: {
          theme: 'system' as const,
          language: 'en',
          notifications: { email: true, push: true, sms: false },
        },
        lastLogin: '2026-02-07T08:00:00Z',
        createdAt: '2020-01-15T00:00:00Z',
      };
    }),

  updateProfile: pub
    .route({
      method: 'PATCH',
      path: '/users/me',
      summary: 'Update current user profile',
      tags: ['Users'],
    })
    .input(z.object({
      name: z.string().optional(),
      preferences: z.object({
        theme: z.enum(['light', 'dark', 'system']).optional(),
        language: z.string().optional(),
        notifications: z.object({
          email: z.boolean().optional(),
          push: z.boolean().optional(),
          sms: z.boolean().optional(),
        }).optional(),
      }).optional(),
    }))
    .output(z.object({
      success: z.boolean(),
      updatedAt: z.string(),
    }))
    .handler(async ({ input }) => {
      return {
        success: true,
        updatedAt: new Date().toISOString(),
      };
    }),

  changePassword: pub
    .route({
      method: 'POST',
      path: '/users/me/change-password',
      summary: 'Change password',
      tags: ['Users'],
    })
    .input(z.object({
      currentPassword: z.string(),
      newPassword: z.string().min(8),
      confirmPassword: z.string(),
    }))
    .output(z.object({
      success: z.boolean(),
      message: z.string(),
    }))
    .handler(async ({ input }) => {
      if (input.newPassword !== input.confirmPassword) {
        return { success: false, message: 'Passwords do not match' };
      }
      return { success: true, message: 'Password changed successfully' };
    }),

  getUserNotifications: pub
    .route({
      method: 'GET',
      path: '/users/me/notifications',
      summary: 'Get user notifications',
      tags: ['Users'],
    })
    .input(z.object({
      unreadOnly: z.boolean().default(false),
      limit: z.number().default(50),
    }))
    .output(z.array(z.object({
      id: z.string(),
      type: z.enum(['info', 'warning', 'alert', 'reminder']),
      title: z.string(),
      message: z.string(),
      read: z.boolean(),
      actionUrl: z.string().optional(),
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
          actionUrl: '/lab-results/12345',
          createdAt: '2026-02-07T08:30:00Z',
        },
        {
          id: 'notif_002',
          type: 'reminder' as const,
          title: 'Upcoming Appointment',
          message: 'You have an appointment with John Smith at 2:00 PM',
          read: false,
          actionUrl: '/appointments/456',
          createdAt: '2026-02-07T07:00:00Z',
        },
      ];
    }),

  markNotificationRead: pub
    .route({
      method: 'POST',
      path: '/users/me/notifications/{notificationId}/read',
      summary: 'Mark notification as read',
      tags: ['Users'],
    })
    .input(z.object({ notificationId: z.string() }))
    .output(z.object({
      success: z.boolean(),
    }))
    .handler(async ({ input }) => {
      return { success: true };
    }),
};
