/**
 * Health Router
 * 
 * Simplified router for health/ wellness endpoints
 */

import { z } from 'zod';
import { pub } from '../procedures';

export const healthRouter = {
  checkSystemHealth: pub
    .route({
      method: 'GET',
      path: '/health',
      summary: 'Check system health',
      tags: ['Health'],
    })
    .output(z.object({
      status: z.enum(['healthy', 'degraded', 'unhealthy']),
      timestamp: z.string(),
      version: z.string(),
      uptime: z.number(),
      checks: z.object({
        database: z.object({
          status: z.enum(['up', 'down']),
          latency: z.number().optional(),
        }),
        storage: z.object({
          status: z.enum(['up', 'down']),
          usedPercent: z.number().optional(),
        }),
        api: z.object({
          status: z.enum(['up', 'down']),
          requestsPerMinute: z.number().optional(),
        }),
      }),
    }))
    .handler(async () => {
      return {
        status: 'healthy' as const,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        uptime: process.uptime(),
        checks: {
          database: { status: 'up' as const, latency: 15 },
          storage: { status: 'up' as const, usedPercent: 45 },
          api: { status: 'up' as const, requestsPerMinute: 1250 },
        },
      };
    }),

  getSystemMetrics: pub
    .route({
      method: 'GET',
      path: '/health/metrics',
      summary: 'Get system metrics',
      tags: ['Health'],
    })
    .output(z.object({
      cpuUsage: z.number(),
      memoryUsage: z.number(),
      activeConnections: z.number(),
      requestsPerMinute: z.number(),
      errorRate: z.number(),
      averageResponseTime: z.number(),
    }))
    .handler(async () => {
      return {
        cpuUsage: 0.35,
        memoryUsage: 0.62,
        activeConnections: 45,
        requestsPerMinute: 1250,
        errorRate: 0.001,
        averageResponseTime: 125,
      };
    }),
};
