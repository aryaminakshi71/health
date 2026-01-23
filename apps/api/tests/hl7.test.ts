/**
 * HL7 Integration Tests
 */

import { describe, it, expect } from 'vitest';
import { generateHL7ORM, parseHL7ORU } from '@healthcare-saas/core/integrations/hl7';

describe('HL7 Integration', () => {
  it('should generate HL7 ORM message', () => {
    const order = {
      orderNumber: 'LAB-001-000001',
      patientId: 'patient-123',
      patientName: 'John Doe',
      patientDob: '1990-01-01',
      patientGender: 'M',
      testCode: 'CBC',
      testName: 'Complete Blood Count',
      orderingProvider: 'Dr. Smith',
      orderDate: new Date(),
    };

    const message = generateHL7ORM(order);
    expect(message).toContain('MSH');
    expect(message).toContain('PID');
    expect(message).toContain('ORC');
    expect(message).toContain('OBR');
  });

  it('should parse HL7 ORU message', () => {
    const oruMessage = `MSH|^~\\&|LAB|SYSTEM|HEALTHCARE|FACILITY|20240101120000||ORU^R01|12345|P|2.5
PID|1||patient-123||Doe^John||19900101|M
OBR|1|LAB-001-000001||CBC^Complete Blood Count|20240101120000
OBX|1|NM|WBC^White Blood Count|5.5|10*3/uL|4.0-11.0|N`;

    const result = parseHL7ORU(oruMessage);
    expect(result.patientId).toBe('patient-123');
    expect(result.orderNumber).toBe('LAB-001-000001');
    expect(result.testCode).toBe('CBC');
    expect(result.value).toBe('5.5');
  });
});
