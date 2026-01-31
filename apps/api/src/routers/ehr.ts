/**
 * EHR Router
 * 
 * Electronic Health Records - clinical notes, vital signs, diagnoses
 */

import { z } from 'zod';
import { eq, and, desc, count, ilike, or } from 'drizzle-orm';
import { complianceAudited, getDb, schema } from '../procedures';
import { ORPCError } from '@orpc/server';
import { clinicalNotes, vitalSigns, diagnoses } from '@healthcare-saas/storage/db/schema';

// Validation schemas
const createClinicalNoteSchema = z.object({
  patientId: z.string().uuid(),
  appointmentId: z.string().uuid().optional(),
  noteType: z.enum(['progress', 'soap', 'discharge', 'consultation', 'procedure', 'operative', 'emergency']).default('progress'),
  subjective: z.string().optional(),
  objective: z.string().optional(),
  assessment: z.string().optional(),
  plan: z.string().optional(),
  noteText: z.string().optional(),
  primaryDiagnosis: z.string().optional(),
  secondaryDiagnoses: z.array(z.string()).default([]),
  icd10Codes: z.array(z.string()).default([]),
  visitDate: z.string().datetime(),
});

const createVitalSignsSchema = z.object({
  patientId: z.string().uuid(),
  appointmentId: z.string().uuid().optional(),
  clinicalNoteId: z.string().uuid().optional(),
  temperature: z.number().optional(),
  temperatureUnit: z.enum(['C', 'F']).default('C'),
  bloodPressureSystolic: z.number().int().optional(),
  bloodPressureDiastolic: z.number().int().optional(),
  heartRate: z.number().int().optional(),
  respiratoryRate: z.number().int().optional(),
  oxygenSaturation: z.number().optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
  painScore: z.number().int().min(0).max(10).optional(),
  glucose: z.number().optional(),
});

const createDiagnosisSchema = z.object({
  patientId: z.string().uuid(),
  clinicalNoteId: z.string().uuid().optional(),
  diagnosis: z.string().min(1),
  icd10Code: z.string().optional(),
  icd11Code: z.string().optional(),
  isPrimary: z.boolean().default(false),
  status: z.enum(['active', 'resolved', 'chronic']).default('active'),
  onsetDate: z.string().date().optional(),
});

// Generate note number helper
function generateNoteNumber(organizationId: string, count: number): string {
  const prefix = organizationId.slice(0, 3).toUpperCase();
  const paddedCount = String(count + 1).padStart(6, '0');
  return `NOTE-${prefix}-${paddedCount}`;
}

export const ehrRouter = {
  /**
   * List clinical notes for a patient
   */
  listNotes: complianceAudited
    .route({
      method: 'GET',
      path: '/ehr/notes',
      summary: 'List clinical notes',
      tags: ['EHR'],
    })
    .input(
      z.object({
        patientId: z.string().uuid(),
        noteType: z.enum(['progress', 'soap', 'discharge', 'consultation', 'procedure', 'operative', 'emergency']).optional(),
        limit: z.coerce.number().int().min(1).max(100).optional().default(50),
        offset: z.coerce.number().int().min(0).optional().default(0),
      }),
    )
    .output(
      z.object({
        notes: z.array(z.any()),
        total: z.number(),
      }),
    )
    .handler(async ({ context, input }) => {
      const db = getDb(context);

      const conditions = [
        eq(clinicalNotes.organizationId, context.organization.id),
        eq(clinicalNotes.patientId, input.patientId),
      ];

      if (input.noteType) {
        conditions.push(eq(clinicalNotes.noteType, input.noteType));
      }

      const notes = await db
        .select()
        .from(clinicalNotes)
        .where(and(...conditions))
        .orderBy(desc(clinicalNotes.visitDate))
        .limit(input.limit)
        .offset(input.offset);

      const totalResult = await db
        .select({ count: count() })
        .from(clinicalNotes)
        .where(and(...conditions));

      return {
        notes,
        total: totalResult[0]?.count || 0,
      };
    }),

  /**
   * Get clinical note by ID
   */
  getNote: complianceAudited
    .route({
      method: 'GET',
      path: '/ehr/notes/:id',
      summary: 'Get clinical note',
      tags: ['EHR'],
    })
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context);

      const note = await db.query.clinicalNotes.findFirst({
        where: (notes, { eq, and }) =>
          and(
            eq(notes.id, input.id),
            eq(notes.organizationId, context.organization.id),
          ),
        with: {
          patient: true,
          author: true,
          vitalSigns: true,
          diagnoses: true,
        },
      });

      if (!note) {
        throw new ORPCError({
          code: 'NOT_FOUND',
          message: 'Clinical note not found',
        });
      }

      return note;
    }),

  /**
   * Create clinical note
   */
  createNote: complianceAudited
    .route({
      method: 'POST',
      path: '/ehr/notes',
      summary: 'Create clinical note',
      tags: ['EHR'],
    })
    .input(createClinicalNoteSchema)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context);

      // Get note count for number generation
      const countResult = await db
        .select({ count: count() })
        .from(clinicalNotes)
        .where(eq(clinicalNotes.organizationId, context.organization.id));

      const noteCount = countResult[0]?.count || 0;
      const noteNumber = generateNoteNumber(context.organization.id, noteCount);

      const [newNote] = await db
        .insert(clinicalNotes)
        .values({
          organizationId: context.organization.id,
          patientId: input.patientId,
          appointmentId: input.appointmentId,
          noteType: input.noteType,
          noteNumber,
          subjective: input.subjective,
          objective: input.objective,
          assessment: input.assessment,
          plan: input.plan,
          noteText: input.noteText,
          primaryDiagnosis: input.primaryDiagnosis,
          secondaryDiagnoses: input.secondaryDiagnoses,
          icd10Codes: input.icd10Codes,
          authorId: context.user.id,
          visitDate: new Date(input.visitDate),
          isDraft: false,
          isSigned: true,
          signedAt: new Date(),
        })
        .returning();

      return newNote;
    }),

  /**
   * Record vital signs
   */
  recordVitalSigns: complianceAudited
    .route({
      method: 'POST',
      path: '/ehr/vital-signs',
      summary: 'Record vital signs',
      tags: ['EHR'],
    })
    .input(createVitalSignsSchema)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context);

      // Calculate BMI if height and weight provided
      let bmi: number | undefined;
      if (input.height && input.weight) {
        const heightInMeters = input.height / 100; // Assuming height in cm
        bmi = input.weight / (heightInMeters * heightInMeters);
      }

      const [vitalSignsRecord] = await db
        .insert(vitalSigns)
        .values({
          organizationId: context.organization.id,
          patientId: input.patientId,
          appointmentId: input.appointmentId,
          clinicalNoteId: input.clinicalNoteId,
          temperature: input.temperature?.toString(),
          temperatureUnit: input.temperatureUnit,
          bloodPressureSystolic: input.bloodPressureSystolic,
          bloodPressureDiastolic: input.bloodPressureDiastolic,
          heartRate: input.heartRate,
          respiratoryRate: input.respiratoryRate,
          oxygenSaturation: input.oxygenSaturation?.toString(),
          height: input.height?.toString(),
          weight: input.weight?.toString(),
          bmi: bmi?.toString(),
          painScore: input.painScore,
          glucose: input.glucose?.toString(),
          recordedBy: context.user.id,
        })
        .returning();

      return vitalSignsRecord;
    }),

  /**
   * Get vital signs history
   */
  getVitalSignsHistory: complianceAudited
    .route({
      method: 'GET',
      path: '/ehr/vital-signs/:patientId',
      summary: 'Get vital signs history',
      tags: ['EHR'],
    })
    .input(
      z.object({
        patientId: z.string().uuid(),
        limit: z.coerce.number().int().min(1).max(100).optional().default(50),
      }),
    )
    .output(z.array(z.any()))
    .handler(async ({ context, input }) => {
      const db = getDb(context);

      const vitalSignsHistory = await db
        .select()
        .from(vitalSigns)
        .where(
          and(
            eq(vitalSigns.organizationId, context.organization.id),
            eq(vitalSigns.patientId, input.patientId),
          ),
        )
        .orderBy(desc(vitalSigns.recordedAt))
        .limit(input.limit);

      return vitalSignsHistory;
    }),

  /**
   * Create diagnosis
   */
  createDiagnosis: complianceAudited
    .route({
      method: 'POST',
      path: '/ehr/diagnoses',
      summary: 'Create diagnosis',
      tags: ['EHR'],
    })
    .input(createDiagnosisSchema)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context);

      const [newDiagnosis] = await db
        .insert(diagnoses)
        .values({
          organizationId: context.organization.id,
          patientId: input.patientId,
          clinicalNoteId: input.clinicalNoteId,
          diagnosis: input.diagnosis,
          icd10Code: input.icd10Code,
          icd11Code: input.icd11Code,
          isPrimary: input.isPrimary,
          status: input.status,
          onsetDate: input.onsetDate,
          documentedBy: context.user.id,
        })
        .returning();

      return newDiagnosis;
    }),

  /**
   * Get patient problem list
   */
  getProblemList: complianceAudited
    .route({
      method: 'GET',
      path: '/ehr/problem-list/:patientId',
      summary: 'Get problem list',
      tags: ['EHR'],
    })
    .input(
      z.object({
        patientId: z.string().uuid(),
        status: z.enum(['active', 'resolved', 'chronic']).optional(),
      }),
    )
    .output(z.array(z.any()))
    .handler(async ({ context, input }) => {
      const db = getDb(context);

      const conditions = [
        eq(diagnoses.organizationId, context.organization.id),
        eq(diagnoses.patientId, input.patientId),
      ];

      if (input.status) {
        conditions.push(eq(diagnoses.status, input.status));
      }

      const problemList = await db
        .select()
        .from(diagnoses)
        .where(and(...conditions))
        .orderBy(desc(diagnoses.createdAt));

      return problemList;
    }),
};
