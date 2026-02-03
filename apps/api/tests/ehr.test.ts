/**
 * EHR Router Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { testDb, hasDatabase } from './setup';
import { ehrRouter } from '../routers/ehr';
import { createMockOrgContext, createTestPatient, createTestOrganization } from './test-utils';
import { clinicalNotes, vitalSigns, diagnoses, patients, organizations } from '@healthcare-saas/storage/db/schema';
import { eq } from 'drizzle-orm';

describe('EHR Router', () => {
  let context: ReturnType<typeof createMockOrgContext>;
  let testOrgId: string;
  let testPatientId: string;

  beforeEach(async () => {
    if (!hasDatabase || !testDb) {
      return;
    }

    // Clean up test data
    await testDb.delete(diagnoses);
    await testDb.delete(vitalSigns);
    await testDb.delete(clinicalNotes);
    await testDb.delete(patients);
    await testDb.delete(organizations);

    // Create test organization
    const org = await createTestOrganization(testDb, {
      name: "Test Organization",
      region: "usa",
    });
    testOrgId = org.id;

    // Create mock context first
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
    const patient = await createTestPatient(testDb, context, {
      firstName: "Test",
      lastName: "Patient",
    });
    testPatientId = patient.id;
  });

  it.skipIf(!hasDatabase || !testDb)('should create clinical note', async () => {
    // Call ehrRouter.createNote with valid input
    const result = await ehrRouter.createNote.handler({
      context,
      input: {
        patientId: testPatientId,
        noteType: 'soap',
        subjective: 'Patient reports headache',
        objective: 'BP 120/80, HR 72',
        assessment: 'Tension headache',
        plan: 'Prescribe pain medication',
        visitDate: new Date().toISOString(),
      },
    });

    // Assert note is created with correct SOAP format
    expect(result).toBeDefined();
    expect(result.noteType).toBe('soap');
    expect(result.subjective).toBe('Patient reports headache');
    expect(result.objective).toBe('BP 120/80, HR 72');
    expect(result.assessment).toBe('Tension headache');
    expect(result.plan).toBe('Prescribe pain medication');

    // Verify note number is generated correctly
    expect(result.noteNumber).toBeDefined();
    expect(result.noteNumber).toMatch(/^NOTE-[A-Z]{3}-\d{6}$/);

    // Verify note is associated with patient and organization
    expect(result.patientId).toBe(testPatientId);
    expect(result.organizationId).toBe(testOrgId);
    expect(result.authorId).toBe(context.user.id);
  });

  it.skipIf(!hasDatabase || !testDb)('should record vital signs', async () => {
    // Call ehrRouter.recordVitalSigns with vital signs data
    const result = await ehrRouter.recordVitalSigns.handler({
      context,
      input: {
        patientId: testPatientId,
        temperature: 98.6,
        temperatureUnit: 'F',
        bloodPressureSystolic: 120,
        bloodPressureDiastolic: 80,
        heartRate: 72,
        respiratoryRate: 16,
        oxygenSaturation: 98,
        height: 175, // cm
        weight: 70, // kg
        painScore: 3,
      },
    });

    // Assert vital signs are recorded correctly
    expect(result).toBeDefined();
    expect(result.patientId).toBe(testPatientId);
    expect(result.temperature).toBe('98.6');
    expect(result.bloodPressureSystolic).toBe(120);
    expect(result.bloodPressureDiastolic).toBe(80);
    expect(result.heartRate).toBe(72);

    // Verify BMI is calculated if height and weight provided
    expect(result.bmi).toBeDefined();
    const expectedBmi = 70 / ((175 / 100) ** 2); // ~22.86
    expect(parseFloat(result.bmi || '0')).toBeCloseTo(expectedBmi, 1);

    // Verify recordedBy is set to current user
    expect(result.recordedBy).toBe(context.user.id);
  });

  it.skipIf(!hasDatabase || !testDb)('should get vital signs history', async () => {
    // Create multiple vital signs records
    await ehrRouter.recordVitalSigns.handler({
      context,
      input: {
        patientId: testPatientId,
        heartRate: 70,
        recordedAt: new Date(Date.now() - 10000).toISOString(),
      } as any,
    });
    await ehrRouter.recordVitalSigns.handler({
      context,
      input: {
        patientId: testPatientId,
        heartRate: 75,
      },
    });

    // Call ehrRouter.getVitalSignsHistory with patient ID
    const result = await ehrRouter.getVitalSignsHistory.handler({
      context,
      input: {
        patientId: testPatientId,
        limit: 10,
      },
    });

    // Assert all vital signs are returned
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(2);

    // Verify results are ordered by recordedAt desc
    if (result.length > 1) {
      const timestamps = result.map((r: any) => new Date(r.recordedAt).getTime());
      for (let i = 0; i < timestamps.length - 1; i++) {
        expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i + 1]);
      }
    }

    // Verify limit parameter works correctly
    const limitedResult = await ehrRouter.getVitalSignsHistory.handler({
      context,
      input: {
        patientId: testPatientId,
        limit: 1,
      },
    });
    expect(limitedResult.length).toBeLessThanOrEqual(1);
  });

  it.skipIf(!hasDatabase || !testDb)('should create diagnosis', async () => {
    // Create clinical note first
    const note = await ehrRouter.createNote.handler({
      context,
      input: {
        patientId: testPatientId,
        noteType: 'progress',
        visitDate: new Date().toISOString(),
      },
    });

    // Call ehrRouter.createDiagnosis with diagnosis data
    const result = await ehrRouter.createDiagnosis.handler({
      context,
      input: {
        patientId: testPatientId,
        clinicalNoteId: note.id,
        diagnosis: 'Hypertension',
        icd10Code: 'I10',
        isPrimary: true,
        status: 'active',
      },
    });

    // Assert diagnosis is created with correct ICD codes
    expect(result).toBeDefined();
    expect(result.diagnosis).toBe('Hypertension');
    expect(result.icd10Code).toBe('I10');

    // Verify isPrimary flag is set correctly
    expect(result.isPrimary).toBe(true);

    // Verify diagnosis is associated with patient and note
    expect(result.patientId).toBe(testPatientId);
    expect(result.clinicalNoteId).toBe(note.id);
    expect(result.organizationId).toBe(testOrgId);
  });

  it.skipIf(!hasDatabase || !testDb)('should get problem list', async () => {
    // Create multiple diagnoses with different statuses
    await ehrRouter.createDiagnosis.handler({
      context,
      input: {
        patientId: testPatientId,
        diagnosis: 'Active Condition',
        status: 'active',
      },
    });
    await ehrRouter.createDiagnosis.handler({
      context,
      input: {
        patientId: testPatientId,
        diagnosis: 'Resolved Condition',
        status: 'resolved',
      },
    });
    await ehrRouter.createDiagnosis.handler({
      context,
      input: {
        patientId: testPatientId,
        diagnosis: 'Chronic Condition',
        status: 'chronic',
      },
    });

    // Call ehrRouter.getProblemList with patient ID
    const allProblems = await ehrRouter.getProblemList.handler({
      context,
      input: {
        patientId: testPatientId,
      },
    });

    // Assert all diagnoses are returned
    expect(allProblems.length).toBeGreaterThanOrEqual(3);

    // Test status filter (active, resolved, chronic)
    const activeProblems = await ehrRouter.getProblemList.handler({
      context,
      input: {
        patientId: testPatientId,
        status: 'active',
      },
    });
    expect(activeProblems.every((p: any) => p.status === 'active')).toBe(true);

    // Verify results are ordered by createdAt desc
    if (allProblems.length > 1) {
      const timestamps = allProblems.map((p: any) => new Date(p.createdAt).getTime());
      for (let i = 0; i < timestamps.length - 1; i++) {
        expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i + 1]);
      }
    }
  });

  it.skipIf(!hasDatabase || !testDb)('should list clinical notes for patient', async () => {
    // Create multiple clinical notes
    await ehrRouter.createNote.handler({
      context,
      input: {
        patientId: testPatientId,
        noteType: 'progress',
        visitDate: new Date(Date.now() - 10000).toISOString(),
      },
    });
    await ehrRouter.createNote.handler({
      context,
      input: {
        patientId: testPatientId,
        noteType: 'soap',
        visitDate: new Date().toISOString(),
      },
    });

    // Call ehrRouter.listNotes with patient ID
    const result = await ehrRouter.listNotes.handler({
      context,
      input: {
        patientId: testPatientId,
        limit: 50,
        offset: 0,
      },
    });

    // Assert all notes are returned
    expect(result.notes).toBeDefined();
    expect(Array.isArray(result.notes)).toBe(true);
    expect(result.total).toBeGreaterThanOrEqual(2);

    // Verify pagination works (limit, offset)
    const paginatedResult = await ehrRouter.listNotes.handler({
      context,
      input: {
        patientId: testPatientId,
        limit: 1,
        offset: 0,
      },
    });
    expect(paginatedResult.notes.length).toBeLessThanOrEqual(1);

    // Verify notes are ordered by visitDate desc
    if (result.notes.length > 1) {
      const dates = result.notes.map((n: any) => new Date(n.visitDate).getTime());
      for (let i = 0; i < dates.length - 1; i++) {
        expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1]);
      }
    }
  });
});
