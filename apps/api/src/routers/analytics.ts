/**
 * Analytics Router
 * 
 * Simplified router for analytics endpoints
 */

import { z } from 'zod';
import { pub } from '../procedures';

const outputSchema = z.object({
  totalPatients: z.number(),
  totalAppointments: z.number(),
  todayAppointments: z.number(),
  pendingLabResults: z.number(),
  monthlyRevenue: z.number(),
  collectionRate: z.number(),
});

export const analyticsRouter = {
  getDashboardMetrics: pub
    .route({
      method: 'GET',
      path: '/analytics/dashboard',
      summary: 'Get dashboard metrics',
      tags: ['Analytics'],
    })
    .output(outputSchema)
    .handler(async () => {
      return {
        totalPatients: 1250,
        totalAppointments: 15680,
        todayAppointments: 28,
        pendingLabResults: 15,
        monthlyRevenue: 125000.00,
        collectionRate: 0.92,
      };
    }),
};
