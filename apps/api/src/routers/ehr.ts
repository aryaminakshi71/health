/**
 * EHR (Electronic Health Records) Router
 * 
 * Simplified router for EHR endpoints
 */

import { z } from 'zod';
import { pub } from '../procedures';

export const ehrRouter = {
  getPatientRecord: pub
    .route({
      method: 'GET',
      path: '/ehr/patients/{patientId}',
      summary: 'Get patient EHR record',
      tags: ['EHR'],
    })
    .input(z.object({ patientId: z.string() }))
    .output(z.object({
      id: z.string(),
      mrn: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      dateOfBirth: z.string(),
      gender: z.string(),
      bloodType: z.string().optional(),
      allergies: z.array(z.string()),
      medications: z.array(z.object({
        name: z.string(),
        dosage: z.string(),
        frequency: z.string(),
        prescribedBy: z.string(),
      })),
      diagnoses: z.array(z.object({
        code: z.string(),
        description: z.string(),
        diagnosedDate: z.string(),
      })),
      vitals: z.array(z.object({
        date: z.string(),
        bloodPressure: z.string(),
        heartRate: z.number(),
        temperature: z.number(),
        weight: z.number().optional(),
      })),
    }))
    .handler(async ({ input }) => {
      return {
        id: input.patientId,
        mrn: 'MRN-2026-001',
        firstName: 'John',
        lastName: 'Smith',
        dateOfBirth: '1985-03-15',
        gender: 'Male',
        bloodType: 'A+',
        allergies: ['Penicillin', 'Sulfa drugs'],
        medications: [
          { name: 'Lisinopril', dosage: '10mg', frequency: 'Daily', prescribedBy: 'Dr. Wilson' },
          { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', prescribedBy: 'Dr. Wilson' },
        ],
        diagnoses: [
          { code: 'E11.9', description: 'Type 2 diabetes mellitus', diagnosedDate: '2020-06-15' },
          { code: 'I10', description: 'Essential hypertension', diagnosedDate: '2019-01-20' },
        ],
        vitals: [
          { date: '2026-02-01', bloodPressure: '130/85', heartRate: 72, temperature: 98.6, weight: 180 },
          { date: '2026-01-15', bloodPressure: '128/82', heartRate: 70, temperature: 98.4, weight: 182 },
        ],
      };
    }),

  updatePatientVitals: pub
    .route({
      method: 'POST',
      path: '/ehr/patients/{patientId}/vitals',
      summary: 'Update patient vitals',
      tags: ['EHR'],
    })
    .input(z.object({
      patientId: z.string(),
      bloodPressure: z.string(),
      heartRate: z.number(),
      temperature: z.number(),
      weight: z.number().optional(),
      recordedAt: z.string(),
    }))
    .output(z.object({
      success: z.boolean(),
      vitalsId: z.string(),
      recordedAt: z.string(),
    }))
    .handler(async ({ input }) => {
      return {
        success: true,
        vitalsId: `vitals_${Date.now()}`,
        recordedAt: input.recordedAt,
      };
    }),

  addClinicalNote: pub
    .route({
      method: 'POST',
      path: '/ehr/patients/{patientId}/notes',
      summary: 'Add clinical note',
      tags: ['EHR'],
    })
    .input(z.object({
      patientId: z.string(),
      noteType: z.enum(['progress', 'consultation', 'procedure', 'discharge']),
      content: z.string(),
      icdCodes: z.array(z.string()).optional(),
    }))
    .output(z.object({
      success: z.boolean(),
      noteId: z.string(),
      createdAt: z.string(),
    }))
    .handler(async ({ input }) => {
      return {
        success: true,
        noteId: `note_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
    }),

  getClinicalHistory: pub
    .route({
      method: 'GET',
      path: '/ehr/patients/{patientId}/history',
      summary: 'Get patient clinical history',
      tags: ['EHR'],
    })
    .input(z.object({
      patientId: z.string(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .output(z.object({
      encounters: z.array(z.object({
        id: z.string(),
        date: z.string(),
        type: z.string(),
        provider: z.string(),
        reason: z.string(),
        notes: z.string(),
      })),
      procedures: z.array(z.object({
        id: z.string(),
        date: z.string(),
        name: z.string(),
        provider: z.string(),
      })),
      immunizations: z.array(z.object({
        id: z.string(),
        date: z.string(),
        name: z.string(),
        provider: z.string(),
      })),
    }))
    .handler(async ({ input }) => {
      return {
        encounters: [
          { id: 'enc_001', date: '2026-02-01', type: 'Office Visit', provider: 'Dr. Wilson', reason: 'Diabetes follow-up', notes: 'Patient doing well, A1C improved' },
          { id: 'enc_002', date: '2026-01-15', type: 'Lab Work', provider: 'Lab Tech', reason: 'Routine labs', notes: 'All values within normal range' },
        ],
        procedures: [
          { id: 'proc_001', date: '2025-11-20', name: 'Colonoscopy', provider: 'Dr. Roberts' },
        ],
        immunizations: [
          { id: 'imm_001', date: '2025-10-01', name: 'Influenza Vaccine', provider: 'Nurse Johnson' },
          { id: 'imm_002', date: '2025-03-15', name: 'COVID-19 Booster', provider: 'Nurse Johnson' },
        ],
      };
    }),
};
