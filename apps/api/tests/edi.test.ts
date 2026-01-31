/**
 * EDI Integration Tests
 */

import { describe, it, expect } from 'vitest';
import { generateEDI837, parseEDI835 } from '@healthcare-saas/core/integrations/edi';

describe('EDI Integration', () => {
  it('should generate EDI 837 claim', () => {
    const claim = {
      claimNumber: 'CLM-001-000001',
      patientId: 'patient-123',
      patientName: 'John Doe',
      patientDob: '1990-01-01',
      patientGender: 'M',
      subscriberId: 'SUB123',
      insuranceProvider: 'Blue Cross',
      payerId: 'PAYER123',
      serviceDateFrom: '2024-01-01',
      serviceDateTo: '2024-01-01',
      charges: [
        {
          cptCode: '99213',
          icd10Code: 'E11.9',
          amount: 150.00,
          serviceDate: '2024-01-01',
        },
      ],
      billingProvider: {
        npi: '1234567890',
        name: 'Healthcare Clinic',
        address: '123 Main St',
        city: 'City',
        state: 'ST',
        zip: '12345',
      },
    };

    const edi837 = generateEDI837(claim);
    expect(edi837).toContain('ISA');
    expect(edi837).toContain('GS');
    expect(edi837).toContain('ST');
    expect(edi837).toContain('CLM');
  });

  it('should parse EDI 835 remittance', () => {
    const edi835 = `ISA*00*          *00*          *ZZ*HEALTHCARE*ZZ*BLUECROSS*240101*1200*^*12345*0*0*P*:~GS*HC*HEALTHCARE*BLUECROSS*240101*1200*12345*X*005010X221A1~ST*835*0001~CLP*CLM-001-000001*1*150.00*120.00*30.00~CAS*CO*45*30.00~SE*3*0001~GE*1*12345~IEA*1*12345~`;

    const remittance = parseEDI835(edi835);
    expect(remittance.claimNumber).toBe('CLM-001-000001');
    expect(remittance.totalPaid).toBe(120.00);
    expect(remittance.patientResponsibility).toBe(30.00);
  });
});
