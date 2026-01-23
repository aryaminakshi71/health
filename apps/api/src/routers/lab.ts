/**
 * Lab Router
 * 
 * Laboratory orders and results management with HL7 integration
 */

import { z } from 'zod';
import { eq, and, desc, count, ilike, or } from 'drizzle-orm';
import { complianceAudited, getDb, schema } from '../procedures';
import { ORPCError } from '@orpc/server';
import { labOrders, labResults, labTestCatalog } from '@healthcare-saas/storage/db/schema/healthcare';

// Validation schemas
const createLabOrderSchema = z.object({
  patientId: z.string().uuid(),
  appointmentId: z.string().uuid().optional(),
  testId: z.string().uuid(),
  clinicalIndication: z.string().optional(),
  diagnosis: z.string().optional(),
  icd10Code: z.string().optional(),
  priority: z.enum(['routine', 'urgent', 'stat']).default('routine'),
});

const createLabResultSchema = z.object({
  labOrderId: z.string().uuid(),
  testCode: z.string().optional(),
  testName: z.string(),
  componentName: z.string().optional(),
  value: z.string().optional(),
  numericValue: z.number().optional(),
  unit: z.string().optional(),
  referenceRange: z.string().optional(),
  abnormalFlag: z.enum(['H', 'L', 'A', 'N']).optional(),
  criticalValue: z.enum(['normal', 'abnormal', 'critical', 'panic']).default('normal'),
  interpretation: z.string().optional(),
  comments: z.string().optional(),
});

// Generate order number helper
function generateLabOrderNumber(organizationId: string, count: number): string {
  const prefix = organizationId.slice(0, 3).toUpperCase();
  const paddedCount = String(count + 1).padStart(6, '0');
  return `LAB-${prefix}-${paddedCount}`;
}

// Generate result number helper
function generateLabResultNumber(organizationId: string, count: number): string {
  const prefix = organizationId.slice(0, 3).toUpperCase();
  const paddedCount = String(count + 1).padStart(6, '0');
  return `RES-${prefix}-${paddedCount}`;
}

export const labRouter = {
  /**
   * List lab orders
   */
  listOrders: complianceAudited
    .route({
      method: 'GET',
      path: '/lab/orders',
      summary: 'List lab orders',
      tags: ['Lab'],
    })
    .input(
      z.object({
        patientId: z.string().uuid().optional(),
        status: z.enum(['ordered', 'collected', 'in_progress', 'completed', 'cancelled', 'rejected']).optional(),
        limit: z.coerce.number().int().min(1).max(100).optional().default(50),
        offset: z.coerce.number().int().min(0).optional().default(0),
      }),
    )
    .output(
      z.object({
        orders: z.array(z.any()),
        total: z.number(),
      }),
    )
    .handler(async ({ context, input }) => {
      const db = getDb(context);
      const { patientId, status, limit, offset } = input;

      const conditions = [
        eq(labOrders.organizationId, context.organization.id),
      ];

      if (patientId) {
        conditions.push(eq(labOrders.patientId, patientId));
      }

      if (status) {
        conditions.push(eq(labOrders.status, status));
      }

      const orders = await db
        .select()
        .from(labOrders)
        .where(and(...conditions))
        .orderBy(desc(labOrders.orderDate))
        .limit(limit)
        .offset(offset);

      const totalResult = await db
        .select({ count: count() })
        .from(labOrders)
        .where(and(...conditions));

      return {
        orders,
        total: totalResult[0]?.count || 0,
      };
    }),

  /**
   * Create lab order
   */
  createOrder: complianceAudited
    .route({
      method: 'POST',
      path: '/lab/orders',
      summary: 'Create lab order',
      tags: ['Lab'],
    })
    .input(createLabOrderSchema)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context);

      // Get test details
      const test = await db.query.labTestCatalog.findFirst({
        where: (tests, { eq }) => eq(tests.id, input.testId),
      });

      if (!test) {
        throw new ORPCError({
          code: 'NOT_FOUND',
          message: 'Lab test not found',
        });
      }

      // Get order count
      const countResult = await db
        .select({ count: count() })
        .from(labOrders)
        .where(eq(labOrders.organizationId, context.organization.id));

      const orderCount = countResult[0]?.count || 0;
      const orderNumber = generateLabOrderNumber(context.organization.id, orderCount);

      const [newOrder] = await db
        .insert(labOrders)
        .values({
          organizationId: context.organization.id,
          patientId: input.patientId,
          appointmentId: input.appointmentId,
          orderNumber,
          orderDate: new Date().toISOString().split('T')[0],
          orderTime: new Date(),
          testId: input.testId,
          testName: test.testName,
          testCode: test.testCode,
          clinicalIndication: input.clinicalIndication,
          diagnosis: input.diagnosis,
          icd10Code: input.icd10Code,
          priority: input.priority,
          status: 'ordered',
          orderedBy: context.user.id,
        })
        .returning();

      // TODO: Send HL7 ORM message to lab system
      // await sendHL7ORM(newOrder);

      return newOrder;
    }),

  /**
   * Record lab result (from HL7 ORU or manual entry)
   */
  recordResult: complianceAudited
    .route({
      method: 'POST',
      path: '/lab/results',
      summary: 'Record lab result',
      tags: ['Lab'],
    })
    .input(createLabResultSchema)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context);

      // Verify lab order exists
      const labOrder = await db.query.labOrders.findFirst({
        where: (orders, { eq }) => eq(orders.id, input.labOrderId),
      });

      if (!labOrder) {
        throw new ORPCError({
          code: 'NOT_FOUND',
          message: 'Lab order not found',
        });
      }

      // Get result count
      const countResult = await db
        .select({ count: count() })
        .from(labResults)
        .where(eq(labResults.organizationId, context.organization.id));

      const resultCount = countResult[0]?.count || 0;
      const resultNumber = generateLabResultNumber(context.organization.id, resultCount);

      const [newResult] = await db
        .insert(labResults)
        .values({
          organizationId: context.organization.id,
          patientId: labOrder.patientId,
          labOrderId: input.labOrderId,
          resultNumber,
          resultDate: new Date().toISOString().split('T')[0],
          resultTime: new Date(),
          testCode: input.testCode || labOrder.testCode,
          testName: input.testName,
          componentName: input.componentName,
          value: input.value,
          numericValue: input.numericValue?.toString(),
          unit: input.unit,
          referenceRange: input.referenceRange,
          abnormalFlag: input.abnormalFlag,
          criticalValue: input.criticalValue,
          interpretation: input.interpretation,
          comments: input.comments,
          status: 'final',
          isVerified: true,
          verifiedBy: context.user.id,
          verifiedAt: new Date(),
        })
        .returning();

      // Update lab order status
      await db
        .update(labOrders)
        .set({
          status: 'completed',
          updatedAt: new Date(),
        })
        .where(eq(labOrders.id, input.labOrderId));

      // Check for critical values and send alert
      if (input.criticalValue === 'critical' || input.criticalValue === 'panic') {
        // TODO: Send critical value alert
        // await sendCriticalValueAlert(newResult);
      }

      return newResult;
    }),

  /**
   * Get lab results for a patient
   */
  getPatientResults: complianceAudited
    .route({
      method: 'GET',
      path: '/lab/results/:patientId',
      summary: 'Get patient lab results',
      tags: ['Lab'],
    })
    .input(
      z.object({
        patientId: z.string().uuid(),
        testCode: z.string().optional(),
        limit: z.coerce.number().int().min(1).max(100).optional().default(50),
      }),
    )
    .output(z.array(z.any()))
    .handler(async ({ context, input }) => {
      const db = getDb(context);

      const conditions = [
        eq(labResults.organizationId, context.organization.id),
        eq(labResults.patientId, input.patientId),
      ];

      if (input.testCode) {
        conditions.push(eq(labResults.testCode, input.testCode));
      }

      const results = await db
        .select()
        .from(labResults)
        .where(and(...conditions))
        .orderBy(desc(labResults.resultDate))
        .limit(input.limit);

      return results;
    }),

  /**
   * Get lab test catalog
   */
  getTestCatalog: complianceAudited
    .route({
      method: 'GET',
      path: '/lab/test-catalog',
      summary: 'Get lab test catalog',
      tags: ['Lab'],
    })
    .input(
      z.object({
        category: z.string().optional(),
        search: z.string().optional(),
        limit: z.coerce.number().int().min(1).max(100).optional().default(50),
      }),
    )
    .output(z.array(z.any()))
    .handler(async ({ context, input }) => {
      const db = getDb(context);

      const conditions = [
        eq(labTestCatalog.organizationId, context.organization.id),
        eq(labTestCatalog.isActive, true),
      ];

      if (input.category) {
        conditions.push(eq(labTestCatalog.category, input.category));
      }

      if (input.search) {
        conditions.push(
          or(
            ilike(labTestCatalog.testName, `%${input.search}%`),
            ilike(labTestCatalog.testCode, `%${input.search}%`),
          )!,
        );
      }

      const tests = await db
        .select()
        .from(labTestCatalog)
        .where(and(...conditions))
        .limit(input.limit);

      return tests;
    }),
};
