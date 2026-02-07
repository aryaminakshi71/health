/**
 * EHR Router Tests
 */

import { describe, it, expect } from 'vitest';
import { ehrRouter } from '../src/routers/ehr';

describe('EHR Router', () => {
  it('should export getPatientRecord', () => {
    expect(ehrRouter.getPatientRecord).toBeDefined();
  });

  it('should export updatePatientVitals', () => {
    expect(ehrRouter.updatePatientVitals).toBeDefined();
  });

  it('should export addClinicalNote', () => {
    expect(ehrRouter.addClinicalNote).toBeDefined();
  });

  it('should export getClinicalHistory', () => {
    expect(ehrRouter.getClinicalHistory).toBeDefined();
  });
});
