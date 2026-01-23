/**
 * EDI Integration
 * 
 * EDI 837 (Claims) and EDI 835 (Remittance) generation and parsing
 */

// EDI Segment Types
export interface EDISegment {
  id: string;
  elements: string[];
}

// EDI Transaction Structure
export interface EDITransaction {
  segments: EDISegment[];
  transactionType: '837' | '835';
  controlNumber: string;
}

/**
 * Generate EDI 837 Professional Claim
 */
export function generateEDI837(claim: {
  claimNumber: string;
  patientId: string;
  patientName: string;
  patientDob: string;
  patientGender: string;
  subscriberId: string;
  insuranceProvider: string;
  payerId: string;
  serviceDateFrom: string;
  serviceDateTo: string;
  charges: Array<{
    cptCode: string;
    icd10Code: string;
    amount: number;
    serviceDate: string;
  }>;
  billingProvider: {
    npi: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
}): string {
  const segments: string[] = [];
  const elementSeparator = '*';
  const segmentTerminator = '~';

  // ISA - Interchange Header
  segments.push([
    'ISA',
    '00',
    '          ',
    '00',
    '          ',
    'ZZ',
    'HEALTHCARE',
    'ZZ',
    claim.insuranceProvider.substring(0, 15).padEnd(15),
    formatEDIDate(new Date()),
    formatEDITime(new Date()),
    '^',
    claim.claimNumber.substring(0, 9).padStart(9, '0'),
    '0',
    '0',
    'P',
    ':',
  ].join(elementSeparator) + segmentTerminator);

  // GS - Functional Group Header
  segments.push([
    'GS',
    'HC',
    'HEALTHCARE',
    claim.insuranceProvider.substring(0, 15).padEnd(15),
    formatEDIDate(new Date()),
    formatEDITime(new Date()),
    claim.claimNumber.substring(0, 9).padStart(9, '0'),
    'X',
    '005010X222A1',
  ].join(elementSeparator) + segmentTerminator);

  // ST - Transaction Set Header
  segments.push([
    'ST',
    '837',
    claim.claimNumber.substring(0, 4).padStart(4, '0'),
  ].join(elementSeparator) + segmentTerminator);

  // BHT - Beginning of Hierarchical Transaction
  segments.push([
    'BHT',
    '0019',
    '00',
    claim.claimNumber,
    formatEDIDate(new Date()),
    formatEDITime(new Date()),
    'CH',
  ].join(elementSeparator) + segmentTerminator);

  // NM1 - Submitter Name
  segments.push([
    'NM1',
    '41',
    '2',
    claim.billingProvider.name.substring(0, 35).padEnd(35),
    '',
    '',
    '',
    '',
    '46',
    claim.billingProvider.npi.padEnd(20),
  ].join(elementSeparator) + segmentTerminator);

  // PER - Submitter Contact
  segments.push([
    'PER',
    'IC',
    'CONTACT',
    'TE',
    '5551234567',
  ].join(elementSeparator) + segmentTerminator);

  // Loop 2000A - Billing Provider
  segments.push([
    'NM1',
    '85',
    '2',
    claim.billingProvider.name.substring(0, 35).padEnd(35),
    '',
    '',
    '',
    '',
    'XX',
    claim.billingProvider.npi.padEnd(20),
  ].join(elementSeparator) + segmentTerminator);

  // N3 - Provider Address
  segments.push([
    'N3',
    claim.billingProvider.address.substring(0, 55).padEnd(55),
  ].join(elementSeparator) + segmentTerminator);

  // N4 - Provider City/State/ZIP
  segments.push([
    'N4',
    claim.billingProvider.city.substring(0, 30).padEnd(30),
    claim.billingProvider.state.padEnd(2),
    claim.billingProvider.zip.substring(0, 15).padEnd(15),
  ].join(elementSeparator) + segmentTerminator);

  // Loop 2010AA - Subscriber
  segments.push([
    'NM1',
    'IL',
    '1',
    claim.patientName.split(' ')[0]?.substring(0, 35).padEnd(35) || '',
    claim.patientName.split(' ')[1]?.substring(0, 35).padEnd(35) || '',
    '',
    '',
    '',
    'MI',
    claim.subscriberId.padEnd(20),
  ].join(elementSeparator) + segmentTerminator);

  // DMG - Subscriber Demographics
  segments.push([
    'DMG',
    'D8',
    formatEDIDate(new Date(claim.patientDob)),
    claim.patientGender,
  ].join(elementSeparator) + segmentTerminator);

  // Loop 2300 - Claim Information
  segments.push([
    'CLM',
    claim.claimNumber,
    claim.charges.reduce((sum, c) => sum + c.amount, 0).toFixed(2),
    '',
    '',
    '',
    '',
    '',
    '11',
    'A',
    '1',
    'Y',
    'A',
    'Y',
  ].join(elementSeparator) + segmentTerminator);

  // DTP - Service Date
  segments.push([
    'DTP',
    '431',
    'D8',
    formatEDIDate(new Date(claim.serviceDateFrom)),
  ].join(elementSeparator) + segmentTerminator);

  // CL1 - Claim Codes
  segments.push([
    'CL1',
    '',
    '',
    '',
    '',
  ].join(elementSeparator) + segmentTerminator);

  // Loop 2400 - Service Lines
  claim.charges.forEach((charge, index) => {
    segments.push([
      'LX',
      String(index + 1).padStart(6, '0'),
    ].join(elementSeparator) + segmentTerminator);

    segments.push([
      'SV1',
      'HC',
      charge.cptCode,
      charge.amount.toFixed(2),
      'UN',
      '1',
    ].join(elementSeparator) + segmentTerminator);

    segments.push([
      'DTP',
      '472',
      'D8',
      formatEDIDate(new Date(charge.serviceDate)),
    ].join(elementSeparator) + segmentTerminator);
  });

  // SE - Transaction Set Trailer
  segments.push([
    'SE',
    String(segments.length + 1),
    claim.claimNumber.substring(0, 4).padStart(4, '0'),
  ].join(elementSeparator) + segmentTerminator);

  // GE - Functional Group Trailer
  segments.push([
    'GE',
    '1',
    claim.claimNumber.substring(0, 9).padStart(9, '0'),
  ].join(elementSeparator) + segmentTerminator);

  // IEA - Interchange Trailer
  segments.push([
    'IEA',
    '1',
    claim.claimNumber.substring(0, 9).padStart(9, '0'),
  ].join(elementSeparator) + segmentTerminator);

  return segments.join('');
}

/**
 * Parse EDI 835 Remittance Advice
 */
export function parseEDI835(message: string): {
  claimNumber: string;
  totalPaid: number;
  patientResponsibility: number;
  adjustments: Array<{
    code: string;
    amount: number;
    reason: string;
  }>;
} {
  const segments = message.split('~');
  const elementSeparator = '*';
  
  let claimNumber = '';
  let totalPaid = 0;
  let patientResponsibility = 0;
  const adjustments: Array<{ code: string; amount: number; reason: string }> = [];

  for (const segment of segments) {
    const elements = segment.split(elementSeparator);
    const segmentId = elements[0];

    if (segmentId === 'CLP') {
      claimNumber = elements[1] || '';
      totalPaid = parseFloat(elements[4] || '0');
      patientResponsibility = parseFloat(elements[5] || '0');
    } else if (segmentId === 'CAS') {
      // Adjustment segments
      const adjustmentCode = elements[1] || '';
      const adjustmentAmount = parseFloat(elements[2] || '0');
      const adjustmentReason = elements[3] || '';
      adjustments.push({
        code: adjustmentCode,
        amount: adjustmentAmount,
        reason: adjustmentReason,
      });
    }
  }

  return {
    claimNumber,
    totalPaid,
    patientResponsibility,
    adjustments,
  };
}

/**
 * Format date for EDI (YYYYMMDD)
 */
function formatEDIDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Format time for EDI (HHMM)
 */
function formatEDITime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}${minutes}`;
}
