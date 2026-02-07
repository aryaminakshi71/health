/**
 * Claims Router
 * 
 * Simplified router for insurance claims management
 */

import { z } from 'zod';
import { pub } from '../procedures';

const createClaimSchema = z.object({
  patientId: z.string().uuid(),
  insuranceProvider: z.string().min(1),
  insurancePolicyNumber: z.string().optional(),
  serviceDateFrom: z.string().date(),
  serviceDateTo: z.string().date(),
  claimType: z.enum(['professional', 'institutional']).default('professional'),
});

export const claimsRouter = {
  list: pub
    .route({
      method: 'GET',
      path: '/claims',
      summary: 'List claims',
      tags: ['Claims'],
    })
    .output(z.array(z.any()))
    .handler(async () => {
      return [];
    }),

  get: pub
    .route({
      method: 'GET',
      path: '/claims/:id',
      summary: 'Get claim',
      tags: ['Claims'],
    })
    .output(z.any())
    .handler(async () => {
      return null;
    }),

  create: pub
    .route({
      method: 'POST',
      path: '/claims',
      summary: 'Create claim',
      tags: ['Claims'],
    })
    .input(createClaimSchema)
    .output(z.any())
    .handler(async () => {
      return { id: 'new-claim-id' };
    }),

  submit: pub
    .route({
      method: 'POST',
      path: '/claims/:id/submit',
      summary: 'Submit claim',
      tags: ['Claims'],
    })
    .output(z.any())
    .handler(async () => {
      return { success: true };
    }),

  status: pub
    .route({
      method: 'GET',
      path: '/claims/:id/status',
      summary: 'Get claim status',
      tags: ['Claims'],
    })
    .output(z.any())
    .handler(async () => {
      return { status: 'pending' };
    }),
};
