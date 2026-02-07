/**
 * Lab Router
 * 
 * Simplified router for lab/ laboratory endpoints
 */

import { z } from 'zod';
import { pub } from '../procedures';

export const labRouter = {
  getLabOrders: pub
    .route({
      method: 'GET',
      path: '/lab/orders',
      summary: 'Get lab orders',
      tags: ['Lab'],
    })
    .input(z.object({
      patientId: z.string().optional(),
      status: z.enum(['pending', 'in-progress', 'completed', 'cancelled']).optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .output(z.array(z.object({
      id: z.string(),
      patientId: z.string(),
      testName: z.string(),
      testCode: z.string(),
      status: z.enum(['pending', 'in-progress', 'completed', 'cancelled']),
      orderedBy: z.string(),
      orderedAt: z.string(),
      completedAt: z.string().optional(),
      results: z.array(z.object({
        name: z.string(),
        value: z.string(),
        unit: z.string(),
        referenceRange: z.string(),
        flag: z.enum(['normal', 'low', 'high', 'critical']).optional(),
      })).optional(),
    })))
    .handler(async () => {
      return [
        {
          id: 'lab_001',
          patientId: 'patient_123',
          testName: 'Complete Blood Count',
          testCode: 'CBC',
          status: 'completed' as const,
          orderedBy: 'Dr. Wilson',
          orderedAt: '2026-02-01T08:00:00Z',
          completedAt: '2026-02-01T14:30:00Z',
          results: [
            { name: 'WBC', value: '7.5', unit: 'K/uL', referenceRange: '4.5-11.0', flag: 'normal' as const },
            { name: 'RBC', value: '4.8', unit: 'M/uL', referenceRange: '4.5-5.5', flag: 'normal' as const },
            { name: 'Hemoglobin', value: '14.2', unit: 'g/dL', referenceRange: '12.0-16.0', flag: 'normal' as const },
          ],
        },
        {
          id: 'lab_002',
          patientId: 'patient_123',
          testName: 'Basic Metabolic Panel',
          testCode: 'BMP',
          status: 'in-progress' as const,
          orderedBy: 'Dr. Wilson',
          orderedAt: '2026-02-07T09:00:00Z',
        },
      ];
    }),

  createLabOrder: pub
    .route({
      method: 'POST',
      path: '/lab/orders',
      summary: 'Create a lab order',
      tags: ['Lab'],
    })
    .input(z.object({
      patientId: z.string(),
      testCode: z.string(),
      testName: z.string(),
      priority: z.enum(['routine', 'urgent', 'stat']).default('routine'),
      notes: z.string().optional(),
    }))
    .output(z.object({
      success: z.boolean(),
      orderId: z.string(),
      status: z.enum(['pending', 'in-progress', 'completed', 'cancelled']),
      createdAt: z.string(),
    }))
    .handler(async ({ input }) => {
      return {
        success: true,
        orderId: `lab_${Date.now()}`,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
      };
    }),

  getLabResults: pub
    .route({
      method: 'GET',
      path: '/lab/results/{orderId}',
      summary: 'Get lab results',
      tags: ['Lab'],
    })
    .input(z.object({ orderId: z.string() }))
    .output(z.object({
      orderId: z.string(),
      patientId: z.string(),
      testName: z.string(),
      status: z.enum(['pending', 'in-progress', 'completed', 'cancelled']),
      results: z.array(z.object({
        name: z.string(),
        value: z.string(),
        unit: z.string(),
        referenceRange: z.string(),
        flag: z.enum(['normal', 'low', 'high', 'critical']).optional(),
        interpretation: z.string().optional(),
      })),
      reviewedBy: z.string().optional(),
      reviewedAt: z.string().optional(),
    }))
    .handler(async ({ input }) => {
      return {
        orderId: input.orderId,
        patientId: 'patient_123',
        testName: 'Complete Blood Count',
        status: 'completed' as const,
        results: [
          { name: 'WBC', value: '7.5', unit: 'K/uL', referenceRange: '4.5-11.0', flag: 'normal' as const },
          { name: 'RBC', value: '4.8', unit: 'M/uL', referenceRange: '4.5-5.5', flag: 'normal' as const },
          { name: 'Hemoglobin', value: '14.2', unit: 'g/dL', referenceRange: '12.0-16.0', flag: 'normal' as const },
        ],
        reviewedBy: 'Dr. Wilson',
        reviewedAt: '2026-02-01T15:00:00Z',
      };
    }),

  getLabPanels: pub
    .route({
      method: 'GET',
      path: '/lab/panels',
      summary: 'Get available lab panels',
      tags: ['Lab'],
    })
    .output(z.array(z.object({
      code: z.string(),
      name: z.string(),
      description: z.string(),
      tests: z.array(z.string()),
      turnaroundTime: z.string(),
      price: z.number(),
    })))
    .handler(async () => {
      return [
        { code: 'CBC', name: 'Complete Blood Count', description: 'Standard blood count', tests: ['WBC', 'RBC', 'Hgb', 'Hct', 'Plt'], turnaroundTime: '4-6 hours', price: 45.00 },
        { code: 'BMP', name: 'Basic Metabolic Panel', description: 'Electrolytes and kidney function', tests: ['Na', 'K', 'Cl', 'CO2', 'BUN', 'Cr', 'Glucose'], turnaroundTime: '4-6 hours', price: 55.00 },
        { code: 'CMP', name: 'Comprehensive Metabolic Panel', description: 'Extended metabolic panel', tests: ['BMP', 'Calcium', 'Protein', 'Albumin', 'ALP', 'AST', 'ALT', 'Bilirubin'], turnaroundTime: '4-6 hours', price: 75.00 },
      ];
    }),
};
