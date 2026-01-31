/**
 * RxNorm Integration Tests
 */

import { describe, it, expect, vi, beforeAll } from 'vitest';
import { getRxNormByNDC, getRxNormInteractions } from '@healthcare-saas/core/integrations/rxnorm';

// Mock fetch for testing
global.fetch = vi.fn();

describe('RxNorm Integration', () => {
  beforeAll(() => {
    process.env.RXNORM_API_KEY = 'test-key';
  });

  it('should get RxNorm concept by NDC', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        idGroup: {
          rxnormId: ['12345'],
        },
      }),
    });

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        properties: [{
          rxcui: '12345',
          name: 'Aspirin',
          tty: 'IN',
        }],
      }),
    });

    const result = await getRxNormByNDC('12345-678-90');
    expect(result).toBeTruthy();
    expect(result?.name).toBe('Aspirin');
  });

  it('should get drug interactions', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        fullInteractionTypeGroup: [{
          fullInteractionType: [{
            minConceptItem: {
              rxcui: '12345',
              name: 'Aspirin',
            },
            interactionPair: [{
              interactionConcept: [
                { minConceptItem: { rxcui: '12345', name: 'Aspirin' } },
                { minConceptItem: { rxcui: '67890', name: 'Warfarin' } },
              ],
              severity: 'major',
              description: 'Increased risk of bleeding',
            }],
          }],
        }],
      }),
    });

    const interactions = await getRxNormInteractions(['12345', '67890']);
    expect(interactions.length).toBeGreaterThan(0);
  });
});
