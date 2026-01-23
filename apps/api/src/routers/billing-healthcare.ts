/**
 * Billing Router (Healthcare)
 * 
 * Charges, invoices, and payment processing
 */

import { z } from 'zod';
import { eq, and, desc, count, ilike, or, gte, lte } from 'drizzle-orm';
import { complianceAudited, getDb, schema } from '../procedures';
import { ORPCError } from '@orpc/server';
import { charges, invoices, payments, invoiceCharges } from '@healthcare-saas/storage/db/schema/healthcare';

// Validation schemas
const createChargeSchema = z.object({
  patientId: z.string().uuid(),
  appointmentId: z.string().uuid().optional(),
  serviceDate: z.string().date(),
  cptCode: z.string().optional(),
  cptDescription: z.string().optional(),
  icd10Codes: z.array(z.string()).default([]),
  modifiers: z.array(z.string()).default([]),
  unitPrice: z.number().positive(),
  quantity: z.number().positive().default(1),
  discountAmount: z.number().min(0).default(0),
  adjustmentAmount: z.number().min(0).default(0),
  providerId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  notes: z.string().optional(),
});

const createInvoiceSchema = z.object({
  patientId: z.string().uuid(),
  chargeIds: z.array(z.string().uuid()),
  dueDate: z.string().date().optional(),
  notes: z.string().optional(),
});

const createPaymentSchema = z.object({
  patientId: z.string().uuid(),
  claimId: z.string().uuid().optional(),
  amount: z.number().positive(),
  paymentMethod: z.enum(['cash', 'credit_card', 'debit_card', 'check', 'bank_transfer', 'insurance', 'other']),
  payerType: z.enum(['insurance', 'patient', 'other']),
  payerName: z.string().optional(),
  checkNumber: z.string().optional(),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
});

// Generate charge number helper
function generateChargeNumber(organizationId: string, count: number): string {
  const prefix = organizationId.slice(0, 3).toUpperCase();
  const paddedCount = String(count + 1).padStart(6, '0');
  return `CHG-${prefix}-${paddedCount}`;
}

// Generate invoice number helper
function generateInvoiceNumber(organizationId: string, count: number): string {
  const prefix = organizationId.slice(0, 3).toUpperCase();
  const paddedCount = String(count + 1).padStart(6, '0');
  return `INV-${prefix}-${paddedCount}`;
}

// Generate payment number helper
function generatePaymentNumber(organizationId: string, count: number): string {
  const prefix = organizationId.slice(0, 3).toUpperCase();
  const paddedCount = String(count + 1).padStart(6, '0');
  return `PAY-${prefix}-${paddedCount}`;
}

export const billingRouter = {
  /**
   * List charges
   */
  listCharges: complianceAudited
    .route({
      method: 'GET',
      path: '/billing/charges',
      summary: 'List charges',
      tags: ['Billing'],
    })
    .input(
      z.object({
        patientId: z.string().uuid().optional(),
        status: z.enum(['pending', 'billed', 'submitted', 'paid', 'denied', 'adjusted', 'refunded']).optional(),
        startDate: z.string().date().optional(),
        endDate: z.string().date().optional(),
        limit: z.coerce.number().int().min(1).max(100).optional().default(50),
        offset: z.coerce.number().int().min(0).optional().default(0),
      }),
    )
    .output(
      z.object({
        charges: z.array(z.any()),
        total: z.number(),
      }),
    )
    .handler(async ({ context, input }) => {
      const db = getDb(context);
      const { patientId, status, startDate, endDate, limit, offset } = input;

      const conditions = [
        eq(charges.organizationId, context.organization.id),
      ];

      if (patientId) {
        conditions.push(eq(charges.patientId, patientId));
      }

      if (status) {
        conditions.push(eq(charges.status, status));
      }

      if (startDate) {
        conditions.push(gte(charges.chargeDate, startDate));
      }

      if (endDate) {
        conditions.push(lte(charges.chargeDate, endDate));
      }

      const chargesList = await db
        .select()
        .from(charges)
        .where(and(...conditions))
        .orderBy(desc(charges.chargeDate))
        .limit(limit)
        .offset(offset);

      const totalResult = await db
        .select({ count: count() })
        .from(charges)
        .where(and(...conditions));

      return {
        charges: chargesList,
        total: totalResult[0]?.count || 0,
      };
    }),

  /**
   * Create charge
   */
  createCharge: complianceAudited
    .route({
      method: 'POST',
      path: '/billing/charges',
      summary: 'Create charge',
      tags: ['Billing'],
    })
    .input(createChargeSchema)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context);

      // Calculate amounts
      const totalAmount = input.unitPrice * input.quantity;
      const netAmount = totalAmount - input.discountAmount - input.adjustmentAmount;

      // Get charge count for number generation
      const countResult = await db
        .select({ count: count() })
        .from(charges)
        .where(eq(charges.organizationId, context.organization.id));

      const chargeCount = countResult[0]?.count || 0;
      const chargeNumber = generateChargeNumber(context.organization.id, chargeCount);

      const [newCharge] = await db
        .insert(charges)
        .values({
          organizationId: context.organization.id,
          patientId: input.patientId,
          appointmentId: input.appointmentId,
          chargeNumber,
          chargeDate: new Date().toISOString().split('T')[0],
          serviceDate: input.serviceDate,
          cptCode: input.cptCode,
          cptDescription: input.cptDescription,
          icd10Codes: input.icd10Codes,
          modifiers: input.modifiers,
          unitPrice: input.unitPrice.toString(),
          quantity: input.quantity.toString(),
          totalAmount: totalAmount.toString(),
          discountAmount: input.discountAmount.toString(),
          adjustmentAmount: input.adjustmentAmount.toString(),
          netAmount: netAmount.toString(),
          status: 'pending',
          providerId: input.providerId,
          departmentId: input.departmentId,
          notes: input.notes,
          createdBy: context.user.id,
        })
        .returning();

      return newCharge;
    }),

  /**
   * Create invoice
   */
  createInvoice: complianceAudited
    .route({
      method: 'POST',
      path: '/billing/invoices',
      summary: 'Create invoice',
      tags: ['Billing'],
    })
    .input(createInvoiceSchema)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context);

      // Get charges
      const chargesList = await db
        .select()
        .from(charges)
        .where(
          and(
            eq(charges.organizationId, context.organization.id),
            eq(charges.patientId, input.patientId),
            // In clause for charge IDs
          ),
        );

      if (chargesList.length === 0) {
        throw new ORPCError({
          code: 'BAD_REQUEST',
          message: 'No charges found',
        });
      }

      // Calculate totals
      const subtotal = chargesList.reduce(
        (sum, charge) => sum + parseFloat(charge.netAmount),
        0,
      );
      const taxAmount = subtotal * 0.1; // 10% tax (configurable)
      const totalAmount = subtotal + taxAmount;

      // Get invoice count
      const countResult = await db
        .select({ count: count() })
        .from(invoices)
        .where(eq(invoices.organizationId, context.organization.id));

      const invoiceCount = countResult[0]?.count || 0;
      const invoiceNumber = generateInvoiceNumber(context.organization.id, invoiceCount);

      // Create invoice
      const [newInvoice] = await db
        .insert(invoices)
        .values({
          organizationId: context.organization.id,
          patientId: input.patientId,
          invoiceNumber,
          invoiceDate: new Date().toISOString().split('T')[0],
          dueDate: input.dueDate,
          subtotal: subtotal.toString(),
          taxAmount: taxAmount.toString(),
          totalAmount: totalAmount.toString(),
          balanceAmount: totalAmount.toString(),
          status: 'draft',
          notes: input.notes,
          createdBy: context.user.id,
        })
        .returning();

      // Link charges to invoice
      for (const charge of chargesList) {
        await db.insert(invoiceCharges).values({
          invoiceId: newInvoice.id,
          chargeId: charge.id,
        });

        // Update charge status
        await db
          .update(charges)
          .set({
            status: 'billed',
            isBilled: true,
            billedAt: new Date(),
          })
          .where(eq(charges.id, charge.id));
      }

      return newInvoice;
    }),

  /**
   * Create payment
   */
  createPayment: complianceAudited
    .route({
      method: 'POST',
      path: '/billing/payments',
      summary: 'Create payment',
      tags: ['Billing'],
    })
    .input(createPaymentSchema)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context);

      // Get payment count
      const countResult = await db
        .select({ count: count() })
        .from(payments)
        .where(eq(payments.organizationId, context.organization.id));

      const paymentCount = countResult[0]?.count || 0;
      const paymentNumber = generatePaymentNumber(context.organization.id, paymentCount);

      const [newPayment] = await db
        .insert(payments)
        .values({
          organizationId: context.organization.id,
          patientId: input.patientId,
          claimId: input.claimId,
          paymentNumber,
          paymentDate: new Date().toISOString().split('T')[0],
          amount: input.amount.toString(),
          paymentMethod: input.paymentMethod,
          status: 'completed',
          payerType: input.payerType,
          payerName: input.payerName,
          checkNumber: input.checkNumber,
          transactionId: input.transactionId,
          notes: input.notes,
          processedBy: context.user.id,
        })
        .returning();

      // Update invoice balance if payment is for an invoice
      // This would need invoice lookup logic

      return newPayment;
    }),

  /**
   * List payments
   */
  listPayments: complianceAudited
    .route({
      method: 'GET',
      path: '/billing/payments',
      summary: 'List payments',
      tags: ['Billing'],
    })
    .input(
      z.object({
        patientId: z.string().uuid().optional(),
        limit: z.coerce.number().int().min(1).max(100).optional().default(50),
        offset: z.coerce.number().int().min(0).optional().default(0),
      }),
    )
    .output(
      z.object({
        payments: z.array(z.any()),
        total: z.number(),
      }),
    )
    .handler(async ({ context, input }) => {
      const db = getDb(context);
      const { patientId, limit, offset } = input;

      const conditions = [
        eq(payments.organizationId, context.organization.id),
      ];

      if (patientId) {
        conditions.push(eq(payments.patientId, patientId));
      }

      const paymentsList = await db
        .select()
        .from(payments)
        .where(and(...conditions))
        .orderBy(desc(payments.paymentDate))
        .limit(limit)
        .offset(offset);

      const totalResult = await db
        .select({ count: count() })
        .from(payments)
        .where(and(...conditions));

      return {
        payments: paymentsList,
        total: totalResult[0]?.count || 0,
      };
    }),

  /**
   * List invoices
   */
  listInvoices: complianceAudited
    .route({
      method: 'GET',
      path: '/billing/invoices',
      summary: 'List invoices',
      tags: ['Billing'],
    })
    .input(
      z.object({
        patientId: z.string().uuid().optional(),
        status: z.string().optional(),
        limit: z.coerce.number().int().min(1).max(100).optional().default(50),
        offset: z.coerce.number().int().min(0).optional().default(0),
      }),
    )
    .output(
      z.object({
        invoices: z.array(z.any()),
        total: z.number(),
      }),
    )
    .handler(async ({ context, input }) => {
      const db = getDb(context);
      const { patientId, status, limit, offset } = input;

      const conditions = [
        eq(invoices.organizationId, context.organization.id),
      ];

      if (patientId) {
        conditions.push(eq(invoices.patientId, patientId));
      }

      if (status) {
        conditions.push(eq(invoices.status, status));
      }

      const invoicesList = await db
        .select()
        .from(invoices)
        .where(and(...conditions))
        .orderBy(desc(invoices.invoiceDate))
        .limit(limit)
        .offset(offset);

      const totalResult = await db
        .select({ count: count() })
        .from(invoices)
        .where(and(...conditions));

      return {
        invoices: invoicesList,
        total: totalResult[0]?.count || 0,
      };
    }),
};
