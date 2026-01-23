/**
 * Claims Router
 * 
 * Insurance claims management with EDI 837/835 support
 */

import { z } from 'zod';
import { eq, and, desc, count, gte, lte } from 'drizzle-orm';
import { complianceAudited, getDb, schema } from '../procedures';
import { ORPCError } from '@orpc/server';
import { claims, claimCharges, charges } from '@healthcare-saas/storage/db/schema/healthcare';

// Validation schemas
const createClaimSchema = z.object({
  patientId: z.string().uuid(),
  chargeIds: z.array(z.string().uuid()),
  insuranceProvider: z.string().min(1),
  insurancePolicyNumber: z.string().optional(),
  payerId: z.string().optional(),
  serviceDateFrom: z.string().date(),
  serviceDateTo: z.string().date(),
  claimType: z.enum(['professional', 'institutional']).default('professional'),
  submissionType: z.enum(['electronic', 'paper']).default('electronic'),
});

// Generate claim number helper
function generateClaimNumber(organizationId: string, count: number): string {
  const prefix = organizationId.slice(0, 3).toUpperCase();
  const paddedCount = String(count + 1).padStart(6, '0');
  return `CLM-${prefix}-${paddedCount}`;
}

// Generate EDI 837 claim (simplified - would use proper EDI library)
async function generateEDI837(claim: any, charges: any[]): Promise<string> {
  // TODO: Use proper EDI 837 generator library
  // This is a placeholder
  return JSON.stringify({
    claimNumber: claim.claimNumber,
    patientId: claim.patientId,
    charges: charges.map((c) => ({
      cptCode: c.cptCode,
      amount: c.netAmount,
    })),
  });
}

export const claimsRouter = {
  /**
   * List claims
   */
  list: complianceAudited
    .route({
      method: 'GET',
      path: '/claims',
      summary: 'List claims',
      tags: ['Claims'],
    })
    .input(
      z.object({
        patientId: z.string().uuid().optional(),
        status: z.enum(['draft', 'submitted', 'accepted', 'rejected', 'paid', 'denied', 'appealed', 'voided']).optional(),
        startDate: z.string().date().optional(),
        endDate: z.string().date().optional(),
        limit: z.coerce.number().int().min(1).max(100).optional().default(50),
        offset: z.coerce.number().int().min(0).optional().default(0),
      }),
    )
    .output(
      z.object({
        claims: z.array(z.any()),
        total: z.number(),
      }),
    )
    .handler(async ({ context, input }) => {
      const db = getDb(context);
      const { patientId, status, startDate, endDate, limit, offset } = input;

      const conditions = [
        eq(claims.organizationId, context.organization.id),
      ];

      if (patientId) {
        conditions.push(eq(claims.patientId, patientId));
      }

      if (status) {
        conditions.push(eq(claims.status, status));
      }

      if (startDate) {
        conditions.push(gte(claims.claimDate, startDate));
      }

      if (endDate) {
        conditions.push(lte(claims.claimDate, endDate));
      }

      const claimsList = await db
        .select()
        .from(claims)
        .where(and(...conditions))
        .orderBy(desc(claims.claimDate))
        .limit(limit)
        .offset(offset);

      const totalResult = await db
        .select({ count: count() })
        .from(claims)
        .where(and(...conditions));

      return {
        claims: claimsList,
        total: totalResult[0]?.count || 0,
      };
    }),

  /**
   * Get claim by ID
   */
  get: complianceAudited
    .route({
      method: 'GET',
      path: '/claims/:id',
      summary: 'Get claim',
      tags: ['Claims'],
    })
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context);

      const claim = await db.query.claims.findFirst({
        where: (claims, { eq, and }) =>
          and(
            eq(claims.id, input.id),
            eq(claims.organizationId, context.organization.id),
          ),
        with: {
          claimCharges: {
            with: {
              charge: true,
            },
          },
          payments: true,
        },
      });

      if (!claim) {
        throw new ORPCError({
          code: 'NOT_FOUND',
          message: 'Claim not found',
        });
      }

      return claim;
    }),

  /**
   * Create claim
   */
  create: complianceAudited
    .route({
      method: 'POST',
      path: '/claims',
      summary: 'Create claim',
      tags: ['Claims'],
    })
    .input(createClaimSchema)
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
            // Would need to filter by chargeIds array
          ),
        );

      if (chargesList.length === 0) {
        throw new ORPCError({
          code: 'BAD_REQUEST',
          message: 'No charges found',
        });
      }

      // Calculate total charges
      const totalCharges = chargesList.reduce(
        (sum, charge) => sum + parseFloat(charge.netAmount),
        0,
      );

      // Get claim count
      const countResult = await db
        .select({ count: count() })
        .from(claims)
        .where(eq(claims.organizationId, context.organization.id));

      const claimCount = countResult[0]?.count || 0;
      const claimNumber = generateClaimNumber(context.organization.id, claimCount);

      // Create claim
      const [newClaim] = await db
        .insert(claims)
        .values({
          organizationId: context.organization.id,
          patientId: input.patientId,
          claimNumber,
          claimType: input.claimType,
          submissionType: input.submissionType,
          insuranceProvider: input.insuranceProvider,
          insurancePolicyNumber: input.insurancePolicyNumber,
          payerId: input.payerId,
          serviceDateFrom: input.serviceDateFrom,
          serviceDateTo: input.serviceDateTo,
          claimDate: new Date().toISOString().split('T')[0],
          totalCharges: totalCharges.toString(),
          status: 'draft',
          createdBy: context.user.id,
        })
        .returning();

      // Link charges to claim
      for (const charge of chargesList) {
        await db.insert(claimCharges).values({
          claimId: newClaim.id,
          chargeId: charge.id,
        });

        // Update charge status
        await db
          .update(charges)
          .set({
            status: 'submitted',
            updatedAt: new Date(),
          })
          .where(eq(charges.id, charge.id));
      }

      return newClaim;
    }),

  /**
   * Submit claim
   */
  submit: complianceAudited
    .route({
      method: 'POST',
      path: '/claims/:id/submit',
      summary: 'Submit claim',
      tags: ['Claims'],
    })
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context);

      const claim = await db.query.claims.findFirst({
        where: (claims, { eq, and }) =>
          and(
            eq(claims.id, input.id),
            eq(claims.organizationId, context.organization.id),
          ),
        with: {
          claimCharges: {
            with: {
              charge: true,
            },
          },
        },
      });

      if (!claim) {
        throw new ORPCError({
          code: 'NOT_FOUND',
          message: 'Claim not found',
        });
      }

      if (claim.status !== 'draft') {
        throw new ORPCError({
          code: 'BAD_REQUEST',
          message: 'Claim is not in draft status',
        });
      }

      // Generate EDI 837
      const chargesList = claim.claimCharges.map((cc) => cc.charge);
      const edi837Data = await generateEDI837(claim, chargesList);

      // Generate control number
      const controlNumber = `CLM${context.organization.id.slice(0, 8)}${Date.now()}`;

      // Update claim
      const [updatedClaim] = await db
        .update(claims)
        .set({
          status: 'submitted',
          submittedAt: new Date(),
          edi837Data: edi837Data as any,
          controlNumber,
        })
        .where(eq(claims.id, input.id))
        .returning();

      // TODO: Send EDI 837 to clearinghouse/insurance
      // await sendEDI837(updatedClaim);

      return updatedClaim;
    }),

  /**
   * Process remittance (EDI 835)
   */
  processRemittance: complianceAudited
    .route({
      method: 'POST',
      path: '/claims/remittance',
      summary: 'Process remittance advice',
      tags: ['Claims'],
    })
    .input(
      z.object({
        claimId: z.string().uuid(),
        edi835Data: z.any(), // EDI 835 remittance data
        totalPaid: z.number(),
        patientResponsibility: z.number(),
      }),
    )
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context);

      const [updatedClaim] = await db
        .update(claims)
        .set({
          status: input.totalPaid > 0 ? 'paid' : 'denied',
          paidAt: input.totalPaid > 0 ? new Date() : null,
          deniedAt: input.totalPaid === 0 ? new Date() : null,
          totalPaid: input.totalPaid.toString(),
          patientResponsibility: input.patientResponsibility.toString(),
          edi835Data: input.edi835Data,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(claims.id, input.claimId),
            eq(claims.organizationId, context.organization.id),
          ),
        )
        .returning();

      if (!updatedClaim) {
        throw new ORPCError({
          code: 'NOT_FOUND',
          message: 'Claim not found',
        });
      }

      // Create payment record if paid
      if (input.totalPaid > 0) {
        // This would use the payments router
        // await createPaymentFromRemittance(updatedClaim, input.totalPaid);
      }

      return updatedClaim;
    }),
};
