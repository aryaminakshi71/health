/**
 * Patients Router
 * 
 * Patient management operations with organization scoping and compliance
 */

import { z } from 'zod';
import { eq, and, ilike, desc, or, count } from 'drizzle-orm';
import { complianceAudited, getDb, schema } from '../procedures';
import { ORPCError } from '@orpc/server';
import { patients, patientInsurance, patientAllergies } from '@healthcare-saas/storage/db/schema/healthcare';
import { getOrCache, invalidateCache } from '@healthcare-saas/storage/redis';

// Validation schemas
const createPatientSchema = z.object({
  firstName: z.string().min(1).max(255),
  lastName: z.string().min(1).max(255),
  middleName: z.string().max(255).optional(),
  dateOfBirth: z.string().date(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown']).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(50).optional(),
  address: z.string().optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  zipCode: z.string().max(20).optional(),
  country: z.string().max(100).default('USA'),
  emergencyContactName: z.string().max(255).optional(),
  emergencyContactPhone: z.string().max(50).optional(),
  emergencyContactRelation: z.string().max(100).optional(),
  allergies: z.array(z.string()).default([]),
  chronicConditions: z.array(z.string()).default([]),
  consentToTreatment: z.boolean().default(false),
  consentToDataSharing: z.boolean().default(false),
  gdprConsent: z.boolean().default(false),
  hipaaAcknowledgment: z.boolean().default(false),
});

const updatePatientSchema = createPatientSchema.partial();

const patientFilterSchema = z.object({
  search: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  isActive: z.boolean().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

// Generate patient number helper
function generatePatientNumber(organizationId: string, count: number): string {
  const prefix = organizationId.slice(0, 3).toUpperCase();
  const paddedCount = String(count + 1).padStart(6, '0');
  return `PAT-${prefix}-${paddedCount}`;
}

export const patientsRouter = {
  /**
   * List patients for the organization
   */
  list: complianceAudited
    .route({
      method: 'GET',
      path: '/patients',
      summary: 'List patients',
      tags: ['Patients'],
    })
    .input(patientFilterSchema)
    .output(
      z.object({
        patients: z.array(z.any()),
        total: z.number(),
      }),
    )
    .handler(async ({ context, input }) => {
      const db = getDb(context);
      const { search, gender, isActive, limit, offset } = input;

      // Build cache key
      const cacheKey = `patients:${context.organization.id}:${JSON.stringify(input)}`;

      // Use cache for list queries (5 min TTL)
      return getOrCache(
        cacheKey,
        async () => {
          // Build where conditions
          const conditions = [
            eq(patients.organizationId, context.organization.id),
          ];

          if (isActive !== undefined) {
            conditions.push(eq(patients.isActive, isActive));
          }

          if (gender) {
            conditions.push(eq(patients.gender, gender));
          }

          if (search) {
            conditions.push(
              or(
                ilike(patients.firstName, `%${search}%`),
                ilike(patients.lastName, `%${search}%`),
                ilike(patients.patientNumber, `%${search}%`),
                ilike(patients.email, `%${search}%`),
                ilike(patients.phone, `%${search}%`),
              )!,
            );
          }

          // Query with pagination
          const patientsList = await db
            .select()
            .from(patients)
            .where(and(...conditions))
            .orderBy(desc(patients.createdAt))
            .limit(limit)
            .offset(offset);

          // Get total count
          const totalResult = await db
            .select({ count: count() })
            .from(patients)
            .where(and(...conditions));

          const total = totalResult[0]?.count || 0;

          return {
            patients: patientsList,
            total,
          };
        },
        300 // 5 minutes
      );
    }),

  /**
   * Get patient by ID
   */
  get: complianceAudited
    .route({
      method: 'GET',
      path: '/patients/:id',
      summary: 'Get patient',
      tags: ['Patients'],
    })
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context);

      // Cache key for individual patient
      const cacheKey = `patient:${input.id}:${context.organization.id}`;

      // Use cache (1 hour TTL for patient data)
      const patient = await getOrCache(
        cacheKey,
        async () => {
          return db.query.patients.findFirst({
            where: (patients, { eq, and }) =>
              and(
                eq(patients.id, input.id),
                eq(patients.organizationId, context.organization.id),
              ),
            with: {
              insurance: true,
              allergies: true,
            },
          });
        },
        3600 // 1 hour
      );

      if (!patient) {
        throw new ORPCError({
          code: 'NOT_FOUND',
          message: 'Patient not found',
        });
      }

      return patient;
    }),

  /**
   * Create new patient
   */
  create: complianceAudited
    .route({
      method: 'POST',
      path: '/patients',
      summary: 'Create patient',
      tags: ['Patients'],
    })
    .input(createPatientSchema)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context);

      // Get patient count for number generation
      const countResult = await db
        .select({ count: count() })
        .from(patients)
        .where(eq(patients.organizationId, context.organization.id));

      const patientCount = countResult[0]?.count || 0;
      const patientNumber = generatePatientNumber(
        context.organization.id,
        patientCount,
      );

      // Create patient
      const [newPatient] = await db
        .insert(patients)
        .values({
          organizationId: context.organization.id,
          firstName: input.firstName,
          lastName: input.lastName,
          middleName: input.middleName,
          dateOfBirth: input.dateOfBirth,
          gender: input.gender,
          bloodType: input.bloodType,
          email: input.email,
          phone: input.phone,
          address: input.address,
          city: input.city,
          state: input.state,
          zipCode: input.zipCode,
          country: input.country,
          emergencyContactName: input.emergencyContactName,
          emergencyContactPhone: input.emergencyContactPhone,
          emergencyContactRelation: input.emergencyContactRelation,
          allergies: input.allergies,
          chronicConditions: input.chronicConditions || [],
          patientNumber,
          consentToTreatment: input.consentToTreatment,
          consentToDataSharing: input.consentToDataSharing,
          gdprConsent: input.gdprConsent,
          hipaaAcknowledgment: input.hipaaAcknowledgment,
          consentDate: input.consentToTreatment ? new Date() : null,
          createdBy: context.user.id,
        })
        .returning();

      // Invalidate cache
      await invalidateCache(`patients:${context.organization.id}:*`);
      await invalidateCache(`patient:${newPatient.id}:${context.organization.id}`);

      return newPatient;
    }),

  /**
   * Update patient
   */
  update: complianceAudited
    .route({
      method: 'PUT',
      path: '/patients/:id',
      summary: 'Update patient',
      tags: ['Patients'],
    })
    .input(
      updatePatientSchema.extend({
        id: z.string().uuid(),
      }),
    )
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context);
      const { id, ...updateData } = input;

      // Verify patient exists and belongs to organization
      const existingPatient = await db.query.patients.findFirst({
        where: (patients, { eq, and }) =>
          and(
            eq(patients.id, id),
            eq(patients.organizationId, context.organization.id),
          ),
      });

      if (!existingPatient) {
        throw new ORPCError({
          code: 'NOT_FOUND',
          message: 'Patient not found',
        });
      }

      // Update patient
      const [updatedPatient] = await db
        .update(patients)
        .set({
          ...updateData,
          updatedBy: context.user.id,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(patients.id, id),
            eq(patients.organizationId, context.organization.id),
          ),
        )
        .returning();

      // Invalidate cache
      await invalidateCache(`patients:${context.organization.id}:*`);
      await invalidateCache(`patient:${id}:${context.organization.id}`);

      return updatedPatient;
    }),

  /**
   * Delete patient (soft delete for compliance)
   */
  delete: complianceAudited
    .route({
      method: 'DELETE',
      path: '/patients/:id',
      summary: 'Delete patient',
      tags: ['Patients'],
    })
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .output(
      z.object({
        success: z.boolean(),
      }),
    )
    .handler(async ({ context, input }) => {
      const db = getDb(context);

      // For GDPR compliance, implement soft delete with anonymization
      // For now, just mark as inactive
      await db
        .update(patients)
        .set({
          isActive: false,
          updatedBy: context.user.id,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(patients.id, input.id),
            eq(patients.organizationId, context.organization.id),
          ),
        );

      // Invalidate cache
      await invalidateCache(`patients:${context.organization.id}:*`);
      await invalidateCache(`patient:${input.id}:${context.organization.id}`);

      return { success: true };
    }),
};
