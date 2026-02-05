/**
 * Compliance Router Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { testDb, hasDatabase } from './setup';
import { complianceRouter } from '../src/routers/compliance';
import { createMockOrgContext, createTestPatient, createTestOrganization } from './test-utils';
import { complianceAuditLogs, consentRecords, dataBreachIncidents, patients, organizations } from '@healthcare-saas/storage/db/schema';
import { eq } from 'drizzle-orm';

describe('Compliance Router', () => {
  let context: ReturnType<typeof createMockOrgContext>;
  let testOrgId: string;
  let testPatientId: string;

  beforeEach(async () => {
    if (!hasDatabase || !testDb) {
      return;
    }

    // Clean up test data
    await testDb.delete(dataBreachIncidents);
    await testDb.delete(consentRecords);
    await testDb.delete(complianceAuditLogs);
    await testDb.delete(patients);
    await testDb.delete(organizations);

    // Create test organization
    const org = await createTestOrganization(testDb, {
      name: "Test Organization",
      region: "usa",
    });
    testOrgId = org.id;

    // Create mock context
    context = createMockOrgContext({
      organization: {
        id: org.id,
        name: org.name,
        region: org.region,
        complianceSettings: org.complianceSettings,
      },
      user: {
        id: "test-user-id",
        email: "test@example.com",
        name: "Test User",
        organizationId: org.id,
        role: "admin",
      },
    });

    // Create test patient
    const patient = await createTestPatient(testDb, context);
    testPatientId = patient.id;
  });

  it.skipIf(!hasDatabase || !testDb)('should log audit events', async () => {
    // Note: Audit logging is typically done automatically by complianceAudited middleware
    // This test verifies that audit logs can be retrieved
    const result = await complianceRouter.getAuditLogs.handler({
      context,
      input: {
        limit: 50,
        offset: 0,
      },
    });

    // Assert audit logs structure
    expect(result).toBeDefined();
    expect(result.logs).toBeDefined();
    expect(Array.isArray(result.logs)).toBe(true);
    expect(result.total).toBeGreaterThanOrEqual(0);
  });

  it.skipIf(!hasDatabase || !testDb)('should create consent record', async () => {
    // Call complianceRouter.createConsent with consent data
    const result = await complianceRouter.createConsent.handler({
      context,
      input: {
        patientId: testPatientId,
        consentType: 'treatment',
        consentDescription: 'Consent for treatment',
        isGranted: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });

    // Assert consent record is created
    expect(result).toBeDefined();
    expect(result.patientId).toBe(testPatientId);
    expect(result.consentType).toBe('treatment');
    expect(result.isGranted).toBe(true);

    // Verify consentType, isGranted, expiresAt are set correctly
    expect(result.expiresAt).toBeDefined();

    // Verify IP address and documentedBy are recorded
    expect(result.documentedBy).toBe(context.user.id);
    expect(result.ipAddress).toBeDefined();
  });

  it.skipIf(!hasDatabase || !testDb)('should revoke consent', async () => {
    // Create test consent record with isGranted: true
    const consent = await complianceRouter.createConsent.handler({
      context,
      input: {
        patientId: testPatientId,
        consentType: 'treatment',
        isGranted: true,
      },
    });

    // Call complianceRouter.revokeConsent with consent ID
    const result = await complianceRouter.revokeConsent.handler({
      context,
      input: {
        id: consent.id,
      },
    });

    // Assert consent is revoked (isGranted: false)
    expect(result).toBeDefined();
    expect(result.isGranted).toBe(false);

    // Verify revokedAt timestamp is set
    expect(result.revokedAt).toBeDefined();
  });

  it.skipIf(!hasDatabase || !testDb)('should get audit logs with filters', async () => {
    // Note: Audit logs are typically created by middleware, so we test filtering
    // Call complianceRouter.getAuditLogs with various filters
    const allLogs = await complianceRouter.getAuditLogs.handler({
      context,
      input: {
        limit: 50,
        offset: 0,
      },
    });

    // Assert filtered results structure
    expect(allLogs).toBeDefined();
    expect(allLogs.logs).toBeDefined();
    expect(Array.isArray(allLogs.logs)).toBe(true);

    // Test filters: userId, resourceType, startDate, endDate
    const filteredLogs = await complianceRouter.getAuditLogs.handler({
      context,
      input: {
        userId: context.user.id,
        resourceType: 'patient',
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        limit: 10,
        offset: 0,
      },
    });

    expect(filteredLogs).toBeDefined();
    expect(filteredLogs.logs).toBeDefined();

    // Verify pagination works (limit, offset)
    const paginatedLogs = await complianceRouter.getAuditLogs.handler({
      context,
      input: {
        limit: 1,
        offset: 0,
      },
    });
    expect(paginatedLogs.logs.length).toBeLessThanOrEqual(1);
  });

  it.skipIf(!hasDatabase || !testDb)('should track PHI access', async () => {
    // PHI access tracking is done automatically by complianceAudited middleware
    // This test verifies that PHI access logs can be retrieved
    const result = await complianceRouter.getAuditLogs.handler({
      context,
      input: {
        phiAccessed: true,
        limit: 50,
        offset: 0,
      },
    });

    // Assert audit logs structure
    expect(result).toBeDefined();
    expect(result.logs).toBeDefined();
    expect(Array.isArray(result.logs)).toBe(true);
  });

  it.skipIf(!hasDatabase || !testDb)('should create breach incident', async () => {
    // Call complianceRouter.createBreachIncident with incident data
    const result = await complianceRouter.createBreachIncident.handler({
      context,
      input: {
        incidentType: 'unauthorized_access',
        description: 'Test breach incident',
        affectedRecords: 10,
        affectedPatients: 5,
        severity: 'high',
      },
    });

    // Assert breach incident is created with incident number
    expect(result).toBeDefined();
    expect(result.incidentNumber).toBeDefined();
    expect(result.incidentNumber).toMatch(/^INC-[A-Z]{3}-\d{6}$/);

    // Verify severity, incidentType, affectedRecords are recorded
    expect(result.severity).toBe('high');
    expect(result.incidentType).toBe('unauthorized_access');
    expect(result.affectedRecords).toBe(10);
    expect(result.affectedPatients).toBe(5);

    // Verify notificationRequired is set based on severity
    expect(result.notificationRequired).toBe(true); // High severity requires notification

    // Test critical severity
    const criticalResult = await complianceRouter.createBreachIncident.handler({
      context,
      input: {
        incidentType: 'data_loss',
        description: 'Critical breach',
        severity: 'critical',
      },
    });
    expect(criticalResult.notificationRequired).toBe(true);
  });
});
