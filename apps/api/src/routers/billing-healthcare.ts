/**
 * Billing Router (Healthcare)
 * 
 * Simplified router for charges, invoices, and payments
 */

import { z } from 'zod';
import { pub } from '../procedures';

const createChargeSchema = z.object({
  patientId: z.string().uuid(),
  serviceDate: z.string().date(),
  unitPrice: z.number().positive(),
  quantity: z.number().positive().default(1),
});

const createInvoiceSchema = z.object({
  patientId: z.string().uuid(),
  dueDate: z.string().date().optional(),
});

const createPaymentSchema = z.object({
  patientId: z.string().uuid(),
  amount: z.number().positive(),
  paymentMethod: z.enum(['cash', 'credit_card', 'debit_card', 'check', 'bank_transfer', 'insurance', 'other']),
});

export const billingHealthcareRouter = {
  listCharges: pub
    .route({
      method: 'GET',
      path: '/billing/charges',
      summary: 'List charges',
      tags: ['Billing'],
    })
    .output(z.array(z.any()))
    .handler(async () => {
      return [];
    }),

  createCharge: pub
    .route({
      method: 'POST',
      path: '/billing/charges',
      summary: 'Create charge',
      tags: ['Billing'],
    })
    .input(createChargeSchema)
    .output(z.any())
    .handler(async () => {
      return { id: 'new-charge-id' };
    }),

  listInvoices: pub
    .route({
      method: 'GET',
      path: '/billing/invoices',
      summary: 'List invoices',
      tags: ['Billing'],
    })
    .output(z.array(z.any()))
    .handler(async () => {
      return [];
    }),

  createInvoice: pub
    .route({
      method: 'POST',
      path: '/billing/invoices',
      summary: 'Create invoice',
      tags: ['Billing'],
    })
    .input(createInvoiceSchema)
    .output(z.any())
    .handler(async () => {
      return { id: 'new-invoice-id' };
    }),

  listPayments: pub
    .route({
      method: 'GET',
      path: '/billing/payments',
      summary: 'List payments',
      tags: ['Billing'],
    })
    .output(z.array(z.any()))
    .handler(async () => {
      return [];
    }),

  createPayment: pub
    .route({
      method: 'POST',
      path: '/billing/payments',
      summary: 'Create payment',
      tags: ['Billing'],
    })
    .input(createPaymentSchema)
    .output(z.any())
    .handler(async () => {
      return { id: 'new-payment-id' };
    }),
};
