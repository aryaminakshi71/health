/**
 * Compliance Router
 * 
 * Audit logs, consent management, and compliance reporting
 */

import { z } from 'zod';
import { eq, and, desc, count, gte, lte } from 'drizzle-orm';
import { complianceAudited, getDb, schema } from '../procedures';
import { ORPCError } from '@orpc/server';
import { complianceAuditLogs, consentRecords, dataBreachIncidents } from '@healthcare-saas/storage/db/schema/healthcare';

// Validation schemas
const createConsentSchema = z.object({
  patientId: z.string().uuid(),
  consentType: z.enum(['treatment', 'data_sharing', 'gdpr', 'hipaa', 'telemedicine']),
  consentDescription: z.string().optional(),
  isGranted: z.boolean().default(true),
  expiresAt: z.string().datetime().optional(),
});

const createBreachIncidentSchema = z.object({
  incidentType: z.enum(['unauthorized_access', 'data_loss', 'system_breach']),
  description: z.string(),
  affectedRecords: z.number().int().optional(),
  affectedPatients: z.number().int().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
});

// Generate incident number helper
function generateIncidentNumber(organizationId: string, count: number): string {
  const prefix = organizationId.slice(0, 3).toUpperCase();
  const paddedCount = String(count + 1).padStart(6, '0');
  return `INC-${prefix}-${paddedCount}`;
}

export const complianceRouter = {
  /**
   * Get audit logs
   */
  getAuditLogs: complianceAudited
    .route({
      method: 'GET',
      path: '/compliance/audit-logs',
      summary: 'Get audit logs',
      tags: ['Compliance'],
    })
    .input(
      z.object({
        startDate: z.string().date().optional(),
        endDate: z.string().date().optional(),
        userId: z.string().uuid().optional(),
        resourceType: z.string().optional(),
        limit: z.coerce.number().int().min(1).max(100).optional().default(50),
        offset: z.coerce.number().int().min(0).optional().default(0),
      }),
    )
    .output(
      z.object({
        logs: z.array(z.any()),
        total: z.number(),
      }),
    )
    .handler(async ({ context, input }) => {
      const db = getDb(context);

      const conditions = [
        eq(complianceAuditLogs.organizationId, context.organization.id),
      ];

      if (input.userId) {
        conditions.push(eq(complianceAuditLogs.userId, input.userId));
      }

      if (input.resourceType) {
        conditions.push(eq(complianceAuditLogs.resourceType, input.resourceType));
      }

      if (input.startDate) {
        conditions.push(gte(complianceAuditLogs.timestamp, new Date(input.startDate)));
      }

      if (input.endDate) {
        conditions.push(lte(complianceAuditLogs.timestamp, new Date(input.endDate)));
      }

      const logs = await db
        .select()
        .from(complianceAuditLogs)
        .where(and(...conditions))
        .orderBy(desc(complianceAuditLogs.timestamp))
        .limit(input.limit)
        .offset(input.offset);

      const totalResult = await db
        .select({ count: count() })
        .from(complianceAuditLogs)
        .where(and(...conditions));

      return {
        logs,
        total: totalResult[0]?.count || 0,
      };
    }),

  /**
   * Get breach incidents
   */
  getBreachIncidents: complianceAudited
    .route({
      method: 'GET',
      path: '/compliance/breaches',
      summary: 'Get breach incidents',
      tags: ['Compliance'],
    })
    .input(
      z.object({
        limit: z.coerce.number().int().min(1).max(100).optional().default(50),
        offset: z.coerce.number().int().min(0).optional().default(0),
      }),
    )
    .output(
      z.array(z.any()),
    )
    .handler(async ({ context, input }) => {
      const db = getDb(context);

      const breaches = await db
        .select()
        .from(breachIncidents)
        .where(eq(breachIncidents.organizationId, context.organization.id))
        .orderBy(desc(breachIncidents.detectedAt))
        .limit(input.limit)
        .offset(input.offset);

      return breaches;
    }),

  /**
   * Get audit logs
   */
  getAuditLogs: complianceAudited
    .route({
      method: 'GET',
      path: '/compliance/audit-logs',
      summary: 'Get audit logs',
      tags: ['Compliance'],
    })
    .input(
      z.object({
        userId: z.string().uuid().optional(),
        resourceType: z.enum(['patient', 'appointment', 'ehr', 'billing', 'lab_result', 'prescription', 'user', 'organization', 'audit_log']).optional(),
        startDate: z.string().date().optional(),
        endDate: z.string().date().optional(),
        phiAccessed: z.boolean().optional(),
        limit: z.coerce.number().int().min(1).max(100).optional().default(50),
        offset: z.coerce.number().int().min(0).optional().default(0),
      }),
    )
    .output(
      z.object({
        logs: z.array(z.any()),
        total: z.number(),
      }),
    )
    .handler(async ({ context, input }) => {
      const db = getDb(context);
      const { userId, resourceType, startDate, endDate, phiAccessed, limit, offset } = input;

      const conditions = [
        eq(complianceAuditLogs.organizationId, context.organization.id),
      ];

      if (userId) {
        conditions.push(eq(complianceAuditLogs.userId, userId));
      }

      if (resourceType) {
        conditions.push(eq(complianceAuditLogs.resourceType, resourceType));
      }

      if (startDate) {
        conditions.push(gte(complianceAuditLogs.timestamp, new Date(startDate)));
      }

      if (endDate) {
        conditions.push(lte(complianceAuditLogs.timestamp, new Date(endDate)));
      }

      if (phiAccessed !== undefined) {
        conditions.push(eq(complianceAuditLogs.phiAccessed, phiAccessed));
      }

      const logs = await db
        .select()
        .from(complianceAuditLogs)
        .where(and(...conditions))
        .orderBy(desc(complianceAuditLogs.timestamp))
        .limit(limit)
        .offset(offset);

      const totalResult = await db
        .select({ count: count() })
        .from(complianceAuditLogs)
        .where(and(...conditions));

      return {
        logs,
        total: totalResult[0]?.count || 0,
      };
    }),

  /**
   * Create consent record
   */
  createConsent: complianceAudited
    .route({
      method: 'POST',
      path: '/compliance/consent',
      summary: 'Create consent record',
      tags: ['Compliance'],
    })
    .input(createConsentSchema)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context);

      const [newConsent] = await db
        .insert(consentRecords)
        .values({
          organizationId: context.organization.id,
          patientId: input.patientId,
          consentType: input.consentType,
          consentDescription: input.consentDescription,
          isGranted: input.isGranted,
          grantedAt: input.isGranted ? new Date() : null,
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
          consentMethod: 'electronic',
          ipAddress: context.request.headers.get('x-forwarded-for') || 'unknown',
          documentedBy: context.user.id,
        })
        .returning();

      return newConsent;
    }),

  /**
   * Revoke consent
   */
  revokeConsent: complianceAudited
    .route({
      method: 'POST',
      path: '/compliance/consent/:id/revoke',
      summary: 'Revoke consent',
      tags: ['Compliance'],
    })
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context);

      const [updatedConsent] = await db
        .update(consentRecords)
        .set({
          isGranted: false,
          revokedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(consentRecords.id, input.id),
            eq(consentRecords.organizationId, context.organization.id),
          ),
        )
        .returning();

      if (!updatedConsent) {
        throw new ORPCError({
          code: 'NOT_FOUND',
          message: 'Consent record not found',
        });
      }

      return updatedConsent;
    }),

  /**
   * Get consent records for patient
   */
  getPatientConsents: complianceAudited
    .route({
      method: 'GET',
      path: '/compliance/consent/:patientId',
      summary: 'Get patient consent records',
      tags: ['Compliance'],
    })
    .input(
      z.object({
        patientId: z.string().uuid(),
        consentType: z.string().optional(),
        activeOnly: z.boolean().default(true),
      }),
    )
    .output(z.array(z.any()))
    .handler(async ({ context, input }) => {
      const db = getDb(context);

      const conditions = [
        eq(consentRecords.organizationId, context.organization.id),
        eq(consentRecords.patientId, input.patientId),
      ];

      if (input.consentType) {
        conditions.push(eq(consentRecords.consentType, input.consentType));
      }

      if (input.activeOnly) {
        conditions.push(eq(consentRecords.isGranted, true));
      }

      const consents = await db
        .select()
        .from(consentRecords)
        .where(and(...conditions))
        .orderBy(desc(consentRecords.grantedAt));

      return consents;
    }),

  /**
   * Create breach incident
   */
  createBreachIncident: complianceAudited
    .route({
      method: 'POST',
      path: '/compliance/breach',
      summary: 'Create breach incident',
      tags: ['Compliance'],
    })
    .input(createBreachIncidentSchema)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context);

      // Get incident count
      const countResult = await db
        .select({ count: count() })
        .from(dataBreachIncidents)
        .where(eq(dataBreachIncidents.organizationId, context.organization.id));

      const incidentCount = countResult[0]?.count || 0;
      const incidentNumber = generateIncidentNumber(context.organization.id, incidentCount);

      const [newIncident] = await db
        .insert(dataBreachIncidents)
        .values({
          organizationId: context.organization.id,
          region: context.organization.region,
          incidentNumber,
          incidentType: input.incidentType,
          description: input.description,
          affectedRecords: input.affectedRecords,
          affectedPatients: input.affectedPatients,
          detectedAt: new Date(),
          status: 'detected',
          severity: input.severity,
          notificationRequired: input.severity === 'high' || input.severity === 'critical',
          reportedBy: context.user.id,
        })
        .returning();

      // If notification required, trigger notification workflow
      if (newIncident.notificationRequired) {
        // TODO: Implement breach notification (72-hour requirement for HIPAA/GDPR)
        // await triggerBreachNotification(newIncident);
      }

      return newIncident;
    }),

  /**
   * Get breach incidents
   */
  getBreachIncidents: complianceAudited
    .route({
      method: 'GET',
      path: '/compliance/breach',
      summary: 'Get breach incidents',
      tags: ['Compliance'],
    })
    .input(
      z.object({
        status: z.string().optional(),
        severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
        limit: z.coerce.number().int().min(1).max(100).optional().default(50),
      }),
    )
    .output(z.array(z.any()))
    .handler(async ({ context, input }) => {
      const db = getDb(context);

      const conditions = [
        eq(dataBreachIncidents.organizationId, context.organization.id),
      ];

      if (input.status) {
        conditions.push(eq(dataBreachIncidents.status, input.status));
      }

      if (input.severity) {
        conditions.push(eq(dataBreachIncidents.severity, input.severity));
      }

      const incidents = await db
        .select()
        .from(dataBreachIncidents)
        .where(and(...conditions))
        .orderBy(desc(dataBreachIncidents.detectedAt))
        .limit(input.limit);

      return incidents;
    }),
};
