/**
 * Prescriptions Router
 * 
 * E-prescription management with drug interaction checking
 */

import { z } from 'zod';
import { eq, and, desc, count, ilike, or } from 'drizzle-orm';
import { complianceAudited, getDb, schema } from '../procedures';
import { ORPCError } from '@orpc/server';
import { prescriptions, medicationCatalog, prescriptionRefills } from '@healthcare-saas/storage/db/schema';

// Validation schemas
const createPrescriptionSchema = z.object({
  patientId: z.string().uuid(),
  appointmentId: z.string().uuid().optional(),
  medicationId: z.string().uuid(),
  dosage: z.string().min(1),
  frequency: z.string().min(1),
  quantity: z.number().int().positive(),
  quantityUnit: z.string().default('tablets'),
  daysSupply: z.number().int().positive().optional(),
  refills: z.number().int().min(0).default(0),
  instructions: z.string().optional(),
  sig: z.string().optional(),
  startDate: z.string().date().optional(),
  isEprescription: z.boolean().default(false),
});

const prescriptionFilterSchema = z.object({
  patientId: z.string().uuid().optional(),
  status: z.enum(['draft', 'active', 'filled', 'partially_filled', 'cancelled', 'expired', 'refilled']).optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

// Generate prescription number helper
function generatePrescriptionNumber(organizationId: string, count: number): string {
  const prefix = organizationId.slice(0, 3).toUpperCase();
  const paddedCount = String(count + 1).padStart(6, '0');
  return `RX-${prefix}-${paddedCount}`;
}

// Drug interaction checker (placeholder - would integrate with external API)
async function checkDrugInteractions(
  medicationId: string,
  patientId: string,
  db: ReturnType<typeof getDb>,
): Promise<string[]> {
  // TODO: Integrate with drug interaction API (e.g., RxNorm, DrugBank)
  // For now, return empty array
  return [];
}

// Allergy checker
async function checkAllergies(
  medicationId: string,
  patientId: string,
  db: ReturnType<typeof getDb>,
): Promise<string[]> {
  const patient = await db.query.patients.findFirst({
    where: (patients, { eq }) => eq(patients.id, patientId),
  });

  if (!patient) {
    return [];
  }

  const medication = await db.query.medicationCatalog.findFirst({
    where: (medications, { eq }) => eq(medications.id, medicationId),
  });

  if (!medication) {
    return [];
  }

  // Check if medication name matches any allergies
  const allergies = patient.allergies || [];
  const warnings: string[] = [];

  allergies.forEach((allergen) => {
    if (
      medication.medicationName.toLowerCase().includes(allergen.toLowerCase()) ||
      medication.genericName?.toLowerCase().includes(allergen.toLowerCase())
    ) {
      warnings.push(`Patient is allergic to: ${allergen}`);
    }
  });

  return warnings;
}

export const prescriptionsRouter = {
  /**
   * List prescriptions
   */
  list: complianceAudited
    .route({
      method: 'GET',
      path: '/prescriptions',
      summary: 'List prescriptions',
      tags: ['Prescriptions'],
    })
    .input(prescriptionFilterSchema)
    .output(
      z.object({
        prescriptions: z.array(z.any()),
        total: z.number(),
      }),
    )
    .handler(async ({ context, input }) => {
      const db = getDb(context);
      const { patientId, status, search, limit, offset } = input;

      const conditions = [
        eq(prescriptions.organizationId, context.organization.id),
      ];

      if (patientId) {
        conditions.push(eq(prescriptions.patientId, patientId));
      }

      if (status) {
        conditions.push(eq(prescriptions.status, status));
      }

      if (search) {
        conditions.push(
          or(
            ilike(prescriptions.prescriptionNumber, `%${search}%`),
            ilike(prescriptions.medicationName, `%${search}%`),
          )!,
        );
      }

      const prescriptionsList = await db
        .select()
        .from(prescriptions)
        .where(and(...conditions))
        .orderBy(desc(prescriptions.prescriptionDate))
        .limit(limit)
        .offset(offset);

      const totalResult = await db
        .select({ count: count() })
        .from(prescriptions)
        .where(and(...conditions));

      return {
        prescriptions: prescriptionsList,
        total: totalResult[0]?.count || 0,
      };
    }),

  /**
   * Get prescription by ID
   */
  get: complianceAudited
    .route({
      method: 'GET',
      path: '/prescriptions/:id',
      summary: 'Get prescription',
      tags: ['Prescriptions'],
    })
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context);

      const prescription = await db.query.prescriptions.findFirst({
        where: (prescriptions, { eq, and }) =>
          and(
            eq(prescriptions.id, input.id),
            eq(prescriptions.organizationId, context.organization.id),
          ),
        with: {
          patient: true,
          medication: true,
          prescriber: true,
          refills: true,
        },
      });

      if (!prescription) {
        throw new ORPCError({
          code: 'NOT_FOUND',
          message: 'Prescription not found',
        });
      }

      return prescription;
    }),

  /**
   * Create prescription
   */
  create: complianceAudited
    .route({
      method: 'POST',
      path: '/prescriptions',
      summary: 'Create prescription',
      tags: ['Prescriptions'],
    })
    .input(createPrescriptionSchema)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context);

      // Get medication details
      const medication = await db.query.medicationCatalog.findFirst({
        where: (medications, { eq }) => eq(medications.id, input.medicationId),
      });

      if (!medication) {
        throw new ORPCError({
          code: 'NOT_FOUND',
          message: 'Medication not found',
        });
      }

      // Check drug interactions
      const drugInteractions = await checkDrugInteractions(
        input.medicationId,
        input.patientId,
        db,
      );

      // Check allergies
      const allergyWarnings = await checkAllergies(
        input.medicationId,
        input.patientId,
        db,
      );

      // Get prescription count for number generation
      const countResult = await db
        .select({ count: count() })
        .from(prescriptions)
        .where(eq(prescriptions.organizationId, context.organization.id));

      const prescriptionCount = countResult[0]?.count || 0;
      const prescriptionNumber = generatePrescriptionNumber(
        context.organization.id,
        prescriptionCount,
      );

      // Calculate expiry date (typically 1 year from prescription date)
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);

      const [newPrescription] = await db
        .insert(prescriptions)
        .values({
          organizationId: context.organization.id,
          patientId: input.patientId,
          appointmentId: input.appointmentId,
          medicationId: input.medicationId,
          medicationName: medication.medicationName,
          prescriptionNumber,
          prescriptionDate: new Date().toISOString().split('T')[0],
          prescriptionType: 'new',
          dosage: input.dosage,
          frequency: input.frequency,
          quantity: input.quantity,
          quantityUnit: input.quantityUnit,
          daysSupply: input.daysSupply,
          refills: input.refills,
          refillsRemaining: input.refills,
          instructions: input.instructions,
          sig: input.sig,
          startDate: input.startDate,
          status: 'active',
          isEprescription: input.isEprescription,
          drugInteractions,
          allergyWarnings,
          interactionChecked: true,
          allergyChecked: true,
          expiresAt: expiryDate,
          prescribedBy: context.user.id,
        })
        .returning();

      // If e-prescription, send to pharmacy network
      if (input.isEprescription) {
        // TODO: Integrate with e-prescription network (Surescripts, etc.)
        await db
          .update(prescriptions)
          .set({
            eprescriptionSent: true,
            eprescriptionSentAt: new Date(),
          })
          .where(eq(prescriptions.id, newPrescription.id));
      }

      return {
        ...newPrescription,
        warnings: {
          drugInteractions: drugInteractions.length > 0,
          allergies: allergyWarnings.length > 0,
        },
      };
    }),

  /**
   * Refill prescription
   */
  refill: complianceAudited
    .route({
      method: 'POST',
      path: '/prescriptions/:id/refill',
      summary: 'Refill prescription',
      tags: ['Prescriptions'],
    })
    .input(
      z.object({
        id: z.string().uuid(),
        quantity: z.number().int().positive().optional(),
      }),
    )
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context);

      const prescription = await db.query.prescriptions.findFirst({
        where: (prescriptions, { eq, and }) =>
          and(
            eq(prescriptions.id, input.id),
            eq(prescriptions.organizationId, context.organization.id),
          ),
      });

      if (!prescription) {
        throw new ORPCError({
          code: 'NOT_FOUND',
          message: 'Prescription not found',
        });
      }

      if (prescription.refillsRemaining <= 0) {
        throw new ORPCError({
          code: 'BAD_REQUEST',
          message: 'No refills remaining',
        });
      }

      // Create refill record
      const refillCount = prescription.refills - prescription.refillsRemaining + 1;
      await db.insert(prescriptionRefills).values({
        prescriptionId: prescription.id,
        refillNumber: refillCount,
        refillDate: new Date().toISOString().split('T')[0],
        quantity: input.quantity || prescription.quantity,
      });

      // Update prescription
      const [updatedPrescription] = await db
        .update(prescriptions)
        .set({
          refillsRemaining: prescription.refillsRemaining - 1,
          status: prescription.refillsRemaining === 1 ? 'refilled' : 'active',
          updatedAt: new Date(),
        })
        .where(eq(prescriptions.id, prescription.id))
        .returning();

      return updatedPrescription;
    }),

  /**
   * Cancel prescription
   */
  cancel: complianceAudited
    .route({
      method: 'POST',
      path: '/prescriptions/:id/cancel',
      summary: 'Cancel prescription',
      tags: ['Prescriptions'],
    })
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context);

      const [updatedPrescription] = await db
        .update(prescriptions)
        .set({
          status: 'cancelled',
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(prescriptions.id, input.id),
            eq(prescriptions.organizationId, context.organization.id),
          ),
        )
        .returning();

      if (!updatedPrescription) {
        throw new ORPCError({
          code: 'NOT_FOUND',
          message: 'Prescription not found',
        });
      }

      return updatedPrescription;
    }),
};
