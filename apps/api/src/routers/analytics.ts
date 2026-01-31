/**
 * Analytics Router
 * 
 * Reporting and analytics endpoints
 */

import { z } from 'zod';
import { eq, and, gte, lte, count, sum, desc } from 'drizzle-orm';
import { complianceAudited, getDb, schema } from '../procedures';
import { appointments, patients, charges, invoices } from '@healthcare-saas/storage/db/schema';

// Validation schemas
const analyticsFilterSchema = z.object({
  startDate: z.string().date(),
  endDate: z.string().date(),
  departmentId: z.string().uuid().optional(),
});

export const analyticsRouter = {
  /**
   * Get dashboard metrics
   */
  getDashboardMetrics: complianceAudited
    .route({
      method: 'GET',
      path: '/analytics/dashboard',
      summary: 'Get dashboard metrics',
      tags: ['Analytics'],
    })
    .output(
      z.object({
        totalPatients: z.number(),
        totalAppointments: z.number(),
        todayAppointments: z.number(),
        pendingLabResults: z.number(),
        monthlyRevenue: z.number(),
        collectionRate: z.number(),
      }),
    )
    .handler(async ({ context }) => {
      const db = getDb(context);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Total patients
      const patientsCount = await db
        .select({ count: count() })
        .from(patients)
        .where(
          and(
            eq(patients.organizationId, context.organization.id),
            eq(patients.isActive, true),
          ),
        );

      // Total appointments
      const appointmentsCount = await db
        .select({ count: count() })
        .from(appointments)
        .where(eq(appointments.organizationId, context.organization.id));

      // Today's appointments
      const todayAppointmentsCount = await db
        .select({ count: count() })
        .from(appointments)
        .where(
          and(
            eq(appointments.organizationId, context.organization.id),
            gte(appointments.scheduledAt, today),
            lte(appointments.scheduledAt, tomorrow),
          ),
        );

      // Monthly revenue (from invoices)
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthlyRevenue = await db
        .select({ total: sum(invoices.totalAmount) })
        .from(invoices)
        .where(
          and(
            eq(invoices.organizationId, context.organization.id),
            gte(invoices.invoiceDate, startOfMonth.toISOString().split('T')[0]),
          ),
        );

      return {
        totalPatients: patientsCount[0]?.count || 0,
        totalAppointments: appointmentsCount[0]?.count || 0,
        todayAppointments: todayAppointmentsCount[0]?.count || 0,
        pendingLabResults: 0, // Would query lab results
        monthlyRevenue: parseFloat(monthlyRevenue[0]?.total || '0'),
        collectionRate: 0, // Would calculate from payments
      };
    }),

  /**
   * Get appointment trends
   */
  getAppointmentTrends: complianceAudited
    .route({
      method: 'GET',
      path: '/analytics/appointments/trends',
      summary: 'Get appointment trends',
      tags: ['Analytics'],
    })
    .input(analyticsFilterSchema)
    .output(
      z.object({
        trends: z.array(
          z.object({
            date: z.string(),
            scheduled: z.number(),
            completed: z.number(),
            cancelled: z.number(),
          }),
        ),
      }),
    )
    .handler(async ({ context, input }) => {
      const db = getDb(context);
      
      // This would aggregate appointments by date
      // Simplified implementation
      const trends = [];

      return { trends };
    }),

  /**
   * Get revenue analytics
   */
  getRevenueAnalytics: complianceAudited
    .route({
      method: 'GET',
      path: '/analytics/revenue',
      summary: 'Get revenue analytics',
      tags: ['Analytics'],
    })
    .input(analyticsFilterSchema)
    .output(
      z.object({
        totalRevenue: z.number(),
        totalCharges: z.number(),
        totalPayments: z.number(),
        outstandingBalance: z.number(),
        byDepartment: z.array(
          z.object({
            departmentId: z.string(),
            revenue: z.number(),
          }),
        ),
      }),
    )
    .handler(async ({ context, input }) => {
      const db = getDb(context);

      // Calculate revenue metrics
      const totalRevenue = await db
        .select({ total: sum(invoices.totalAmount) })
        .from(invoices)
        .where(
          and(
            eq(invoices.organizationId, context.organization.id),
            gte(invoices.invoiceDate, input.startDate),
            lte(invoices.invoiceDate, input.endDate),
          ),
        );

      return {
        totalRevenue: parseFloat(totalRevenue[0]?.total || '0'),
        totalCharges: 0,
        totalPayments: 0,
        outstandingBalance: 0,
        byDepartment: [],
      };
    }),
};
