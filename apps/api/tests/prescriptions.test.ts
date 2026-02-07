/**
 * Prescriptions Router Tests
 */

import { describe, it, expect } from 'vitest';
import { prescriptionsRouter } from '../src/routers/prescriptions';

describe('Prescriptions Router', () => {
  it('should export getPrescriptions', () => {
    expect(prescriptionsRouter.getPrescriptions).toBeDefined();
  });

  it('should export createPrescription', () => {
    expect(prescriptionsRouter.createPrescription).toBeDefined();
  });

  it('should export requestRefill', () => {
    expect(prescriptionsRouter.requestRefill).toBeDefined();
  });

  it('should export getPrescriptionHistory', () => {
    expect(prescriptionsRouter.getPrescriptionHistory).toBeDefined();
  });
});
