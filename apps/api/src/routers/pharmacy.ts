/**
 * Pharmacy Router
 * 
 * Simplified router for pharmacy/ medication management endpoints
 */

import { z } from 'zod';
import { pub } from '../procedures';

export const pharmacyRouter = {
  searchMedications: pub
    .route({
      method: 'GET',
      path: '/pharmacy/medications/search',
      summary: 'Search medications',
      tags: ['Pharmacy'],
    })
    .input(z.object({
      query: z.string(),
      limit: z.number().default(20),
    }))
    .output(z.array(z.object({
      ndc: z.string(),
      name: z.string(),
      genericName: z.string(),
      strength: z.string(),
      form: z.string(),
      manufacturer: z.string(),
      schedule: z.enum(['OTC', 'RX', 'CII', 'CIII', 'CIV', 'CV']).optional(),
    })))
    .handler(async ({ input }) => {
      return [
        { ndc: '00071-0155-23', name: 'Lipitor', genericName: 'Atorvastatin Calcium', strength: '10mg', form: 'Tablet', manufacturer: 'Pfizer', schedule: 'RX' as const },
        { ndc: '00074-3799-13', name: 'Zocor', genericName: 'Simvastatin', strength: '20mg', form: 'Tablet', manufacturer: 'Merck', schedule: 'RX' as const },
      ];
    }),

  getMedicationDetails: pub
    .route({
      method: 'GET',
      path: '/pharmacy/medications/{ndc}',
      summary: 'Get medication details',
      tags: ['Pharmacy'],
    })
    .input(z.object({ ndc: z.string() }))
    .output(z.object({
      ndc: z.string(),
      name: z.string(),
      genericName: z.string(),
      strength: z.string(),
      form: z.string(),
      manufacturer: z.string(),
      schedule: z.enum(['OTC', 'RX', 'CII', 'CIII', 'CIV', 'CV']),
      warnings: z.array(z.string()),
      interactions: z.array(z.object({
        drug: z.string(),
        severity: z.enum(['mild', 'moderate', 'severe']),
        description: z.string(),
      })),
      dosageForms: z.array(z.object({
        strength: z.string(),
        form: z.string(),
      })),
    }))
    .handler(async ({ input }) => {
      return {
        ndc: input.ndc,
        name: 'Lipitor',
        genericName: 'Atorvastatin Calcium',
        strength: '10mg',
        form: 'Tablet',
        manufacturer: 'Pfizer',
        schedule: 'RX' as const,
        warnings: ['Avoid grapefruit juice', 'Report muscle pain'],
        interactions: [
          { drug: 'Gemfibrozil', severity: 'severe' as const, description: 'Increased risk of muscle toxicity' },
          { drug: 'Clarithromycin', severity: 'moderate' as const, description: 'Increased levels of atorvastatin' },
        ],
        dosageForms: [
          { strength: '10mg', form: 'Tablet' },
          { strength: '20mg', form: 'Tablet' },
          { strength: '40mg', form: 'Tablet' },
          { strength: '80mg', form: 'Tablet' },
        ],
      };
    }),

  getPharmacies: pub
    .route({
      method: 'GET',
      path: '/pharmacy/search',
      summary: 'Search pharmacies by location',
      tags: ['Pharmacy'],
    })
    .input(z.object({
      zipCode: z.string(),
      radius: z.number().default(10),
    }))
    .output(z.array(z.object({
      id: z.string(),
      name: z.string(),
      address: z.object({
        street: z.string(),
        city: z.string(),
        state: z.string(),
        zip: z.string(),
      }),
      phone: z.string(),
      fax: z.string().optional(),
      hours: z.object({
        monFri: z.string(),
        sat: z.string(),
        sun: z.string(),
      }),
      distance: z.number(),
    })))
    .handler(async ({ input }) => {
      return [
        {
          id: 'pharm_001',
          name: 'CVS Pharmacy #1234',
          address: { street: '100 Main St', city: 'Springfield', state: 'IL', zip: input.zipCode },
          phone: '555-1000',
          fax: '555-1001',
          hours: { monFri: '8am-10pm', sat: '9am-6pm', sun: '10am-5pm' },
          distance: 1.2,
        },
        {
          id: 'pharm_002',
          name: 'Walgreens #5678',
          address: { street: '200 Oak Ave', city: 'Springfield', state: 'IL', zip: input.zipCode },
          phone: '555-2000',
          hours: { monFri: '7am-11pm', sat: '8am-8pm', sun: '9am-5pm' },
          distance: 2.5,
        },
      ];
    }),

  checkDrugInteractions: pub
    .route({
      method: 'POST',
      path: '/pharmacy/interactions',
      summary: 'Check for drug interactions',
      tags: ['Pharmacy'],
    })
    .input(z.object({
      medications: z.array(z.object({
        ndc: z.string(),
        name: z.string(),
        dosage: z.string(),
      })),
    }))
    .output(z.object({
      interactions: z.array(z.object({
        drug1: z.string(),
        drug2: z.string(),
        severity: z.enum(['mild', 'moderate', 'severe']),
        description: z.string(),
        recommendation: z.string(),
      })),
      hasInteractions: z.boolean(),
    }))
    .handler(async () => {
      return {
        interactions: [],
        hasInteractions: false,
      };
    }),
};
