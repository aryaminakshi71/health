/**
 * Compliance Router Tests
 */

import { describe, it, expect } from 'vitest';
import { complianceRouter } from '../src/routers/compliance';

describe('Compliance Router', () => {
  it('should export getAuditLogs', () => {
    expect(complianceRouter.getAuditLogs).toBeDefined();
  });

  it('should export getComplianceReports', () => {
    expect(complianceRouter.getComplianceReports).toBeDefined();
  });

  it('should export checkDataAccess', () => {
    expect(complianceRouter.checkDataAccess).toBeDefined();
  });

  it('should export getDataRetentionPolicy', () => {
    expect(complianceRouter.getDataRetentionPolicy).toBeDefined();
  });
});
