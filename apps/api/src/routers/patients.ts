/**
 * Patients Router
 * 
 * Simplified router for patient management endpoints
 */

import { z } from 'zod';
import { pub } from '../procedures';

export const patientsRouter = {
  getPatients: pub
    .route({
      method: 'GET',
      path: '/patients',
      summary: 'Get list of patients',
      tags: ['Patients'],
    })
    .input(z.object({
      search: z.string().optional(),
      status: z.enum(['active', 'inactive', 'all']).default('active'),
      page: z.number().default(1),
      limit: z.number().default(50),
    }))
    .output(z.object({
      patients: z.array(z.object({
        id: z.string(),
        mrn: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        dateOfBirth: z.string(),
        gender: z.string(),
        phone: z.string(),
        email: z.string(),
        lastVisit: z.string().optional(),
        status: z.enum(['active', 'inactive']),
      })),
      total: z.number(),
      page: z.number(),
    }))
    .handler(async () => {
      return {
        patients: [
          { id: 'patient_001', mrn: 'MRN-2026-001', firstName: 'John', lastName: 'Smith', dateOfBirth: '1985-03-15', gender: 'Male', phone: '555-0101', email: 'john.smith@email.com', lastVisit: '2026-02-01', status: 'active' as const },
          { id: 'patient_002', mrn: 'MRN-2026-002', firstName: 'Jane', lastName: 'Doe', dateOfBirth: '1990-07-22', gender: 'Female', phone: '555-0102', email: 'jane.doe@email.com', lastVisit: '2026-01-28', status: 'active' as const },
          { id: 'patient_003', mrn: 'MRN-2026-003', firstName: 'Robert', lastName: 'Johnson', dateOfBirth: '1978-11-30', gender: 'Male', phone: '555-0103', email: 'robert.j@email.com', lastVisit: '2025-12-15', status: 'active' as const },
        ],
        total: 3,
        page: 1,
      };
    }),

  getPatient: pub
    .route({
      method: 'GET',
      path: '/patients/{patientId}',
      summary: 'Get patient details',
      tags: ['Patients'],
    })
    .input(z.object({ patientId: z.string() }))
    .output(z.object({
      id: z.string(),
      mrn: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      dateOfBirth: z.string(),
      gender: z.string(),
      phone: z.string(),
      email: z.string(),
      address: z.object({
        street: z.string(),
        city: z.string(),
        state: z.string(),
        zip: z.string(),
      }),
      emergencyContact: z.object({
        name: z.string(),
        relationship: z.string(),
        phone: z.string(),
      }),
      insurance: z.object({
        provider: z.string(),
        policyNumber: z.string(),
        groupNumber: z.string().optional(),
      }).optional(),
      createdAt: z.string(),
      status: z.enum(['active', 'inactive']),
    }))
    .handler(async ({ input }) => {
      return {
        id: input.patientId,
        mrn: 'MRN-2026-001',
        firstName: 'John',
        lastName: 'Smith',
        dateOfBirth: '1985-03-15',
        gender: 'Male',
        phone: '555-0101',
        email: 'john.smith@email.com',
        address: { street: '123 Main St', city: 'Springfield', state: 'IL', zip: '62701' },
        emergencyContact: { name: 'Mary Smith', relationship: 'Spouse', phone: '555-0104' },
        insurance: { provider: 'Blue Cross Blue Shield', policyNumber: 'BCBS123456', groupNumber: 'GRP001' },
        createdAt: '2020-01-15T00:00:00Z',
        status: 'active' as const,
      };
    }),

  createPatient: pub
    .route({
      method: 'POST',
      path: '/patients',
      summary: 'Create a new patient',
      tags: ['Patients'],
    })
    .input(z.object({
      firstName: z.string(),
      lastName: z.string(),
      dateOfBirth: z.string(),
      gender: z.string(),
      phone: z.string(),
      email: z.string(),
      address: z.object({
        street: z.string(),
        city: z.string(),
        state: z.string(),
        zip: z.string(),
      }),
      emergencyContact: z.object({
        name: z.string(),
        relationship: z.string(),
        phone: z.string(),
      }),
    }))
    .output(z.object({
      success: z.boolean(),
      patientId: z.string(),
      mrn: z.string(),
    }))
    .handler(async ({ input }) => {
      return {
        success: true,
        patientId: `patient_${Date.now()}`,
        mrn: `MRN-2026-${String(Date.now()).slice(-4)}`,
      };
    }),

  updatePatient: pub
    .route({
      method: 'PATCH',
      path: '/patients/{patientId}',
      summary: 'Update patient information',
      tags: ['Patients'],
    })
    .input(z.object({
      patientId: z.string(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      address: z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zip: z.string().optional(),
      }).optional(),
    }))
    .output(z.object({
      success: z.boolean(),
      updatedAt: z.string(),
    }))
    .handler(async ({ input }) => {
      return {
        success: true,
        updatedAt: new Date().toISOString(),
      };
    }),
};
