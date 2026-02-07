/**
 * Billing Router
 * 
 * Simplified router for billing endpoints
 */

import { z } from 'zod';
import { pub } from '../procedures';

const invoiceSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  amount: z.number(),
  status: z.enum(['pending', 'paid', 'overdue']),
  dueDate: z.string(),
  createdAt: z.string(),
});

const lineItemSchema = z.object({
  description: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  total: z.number(),
});

export const billingRouter = {
  getInvoices: pub
    .route({
      method: 'GET',
      path: '/billing/invoices',
      summary: 'Get invoices for a patient',
      tags: ['Billing'],
    })
    .input(z.object({ patientId: z.string(), limit: z.number().default(50) }))
    .output(z.array(invoiceSchema))
    .handler(async () => {
      return [
        {
          id: 'inv_001',
          patientId: 'patient_123',
          amount: 150.00,
          status: 'pending' as const,
          dueDate: '2026-03-01',
          createdAt: '2026-02-01',
        },
        {
          id: 'inv_002',
          patientId: 'patient_123',
          amount: 75.50,
          status: 'paid' as const,
          dueDate: '2026-01-15',
          createdAt: '2026-01-01',
        },
      ];
    }),

  getInvoice: pub
    .route({
      method: 'GET',
      path: '/billing/invoices/{invoiceId}',
      summary: 'Get a specific invoice',
      tags: ['Billing'],
    })
    .input(z.object({ invoiceId: z.string() }))
    .output(z.object({
      ...invoiceSchema.shape,
      lineItems: z.array(lineItemSchema),
    }))
    .handler(async ({ input }) => {
      return {
        id: input.invoiceId,
        patientId: 'patient_123',
        amount: 150.00,
        status: 'pending' as const,
        dueDate: '2026-03-01',
        createdAt: '2026-02-01',
        lineItems: [
          { description: 'Office Visit', quantity: 1, unitPrice: 100.00, total: 100.00 },
          { description: 'Lab Work', quantity: 1, unitPrice: 50.00, total: 50.00 },
        ],
      };
    }),

  createInvoice: pub
    .route({
      method: 'POST',
      path: '/billing/invoices',
      summary: 'Create a new invoice',
      tags: ['Billing'],
    })
    .input(z.object({
      patientId: z.string(),
      amount: z.number(),
      dueDate: z.string(),
      lineItems: z.array(z.object({
        description: z.string(),
        quantity: z.number(),
        unitPrice: z.number(),
      })),
    }))
    .output(z.object({
      id: z.string(),
      status: z.enum(['pending', 'paid', 'overdue']),
      createdAt: z.string(),
    }))
    .handler(async ({ input }) => {
      return {
        id: `inv_${Date.now()}`,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
      };
    }),

  processPayment: pub
    .route({
      method: 'POST',
      path: '/billing/payments',
      summary: 'Process a payment',
      tags: ['Billing'],
    })
    .input(z.object({
      invoiceId: z.string(),
      amount: z.number(),
      paymentMethod: z.enum(['card', 'insurance', 'cash']),
    }))
    .output(z.object({
      success: z.boolean(),
      transactionId: z.string().optional(),
      message: z.string(),
    }))
    .handler(async ({ input }) => {
      return {
        success: true,
        transactionId: `txn_${Date.now()}`,
        message: 'Payment processed successfully',
      };
    }),
};
