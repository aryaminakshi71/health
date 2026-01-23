/**
 * HL7 Integration
 * 
 * HL7 message generation and parsing for lab orders and results
 */

// HL7 Message Types
export type HL7MessageType = 'ORM' | 'ORU' | 'ADT' | 'MDM';

// HL7 Segment Types
export interface HL7Segment {
  type: string;
  fields: string[];
}

// HL7 Message Structure
export interface HL7Message {
  segments: HL7Segment[];
  messageType: HL7MessageType;
  messageControlId: string;
  timestamp: Date;
}

/**
 * Generate HL7 ORM (Order) Message
 * Used for lab order requests
 */
export function generateHL7ORM(order: {
  orderNumber: string;
  patientId: string;
  patientName: string;
  patientDob: string;
  patientGender: string;
  testCode: string;
  testName: string;
  orderingProvider: string;
  orderDate: Date;
}): string {
  const segments: string[] = [];
  const fieldSeparator = '|';
  const componentSeparator = '^';
  const timestamp = formatHL7Timestamp(order.orderDate);

  // MSH - Message Header
  segments.push([
    'MSH',
    fieldSeparator,
    componentSeparator,
    '~',
    '\\',
    '|',
    'HEALTHCARE',
    'FACILITY',
    'LAB',
    'SYSTEM',
    timestamp,
    '',
    'ORM^O01',
    order.orderNumber,
    'P',
    '2.5',
  ].join(fieldSeparator));

  // PID - Patient Identification
  segments.push([
    'PID',
    '1',
    order.patientId,
    '',
    order.patientName.split(' ').join(componentSeparator),
    '',
    order.patientDob,
    order.patientGender,
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
  ].join(fieldSeparator));

  // ORC - Common Order
  segments.push([
    'ORC',
    'NW', // New order
    order.orderNumber,
    '',
    '',
    '',
    'SC', // Send to lab
    '',
    '',
    timestamp,
    order.orderingProvider,
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
  ].join(fieldSeparator));

  // OBR - Observation Request
  segments.push([
    'OBR',
    '1',
    order.orderNumber,
    '',
    testCode(order.testCode),
    order.testName,
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    timestamp,
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
  ].join(fieldSeparator));

  return segments.join('\r');
}

/**
 * Parse HL7 ORU (Result) Message
 * Used for lab results
 */
export function parseHL7ORU(message: string): {
  patientId: string;
  orderNumber: string;
  testCode: string;
  testName: string;
  value: string;
  unit: string;
  referenceRange: string;
  abnormalFlag: string;
  resultDate: Date;
} {
  const segments = message.split('\r');
  const fieldSeparator = '|';
  
  let patientId = '';
  let orderNumber = '';
  let testCode = '';
  let testName = '';
  let value = '';
  let unit = '';
  let referenceRange = '';
  let abnormalFlag = '';
  let resultDate = new Date();

  for (const segment of segments) {
    const fields = segment.split(fieldSeparator);
    const segmentType = fields[0];

    if (segmentType === 'PID') {
      patientId = fields[3] || '';
    } else if (segmentType === 'OBR') {
      orderNumber = fields[2] || '';
      testCode = fields[4]?.split('^')[0] || '';
      testName = fields[4]?.split('^')[1] || '';
      resultDate = parseHL7Timestamp(fields[14] || '');
    } else if (segmentType === 'OBX') {
      value = fields[5] || '';
      unit = fields[6] || '';
      referenceRange = fields[7] || '';
      abnormalFlag = fields[8] || '';
    }
  }

  return {
    patientId,
    orderNumber,
    testCode,
    testName,
    value,
    unit,
    referenceRange,
    abnormalFlag,
    resultDate,
  };
}

/**
 * Format timestamp for HL7 (YYYYMMDDHHMMSS)
 */
function formatHL7Timestamp(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

/**
 * Parse HL7 timestamp
 */
function parseHL7Timestamp(timestamp: string): Date {
  if (timestamp.length >= 14) {
    const year = parseInt(timestamp.substring(0, 4));
    const month = parseInt(timestamp.substring(4, 6)) - 1;
    const day = parseInt(timestamp.substring(6, 8));
    const hours = parseInt(timestamp.substring(8, 10));
    const minutes = parseInt(timestamp.substring(10, 12));
    const seconds = parseInt(timestamp.substring(12, 14));
    return new Date(year, month, day, hours, minutes, seconds);
  }
  return new Date();
}

/**
 * Format test code for HL7
 */
function testCode(code: string): string {
  return `${code}^${code}^LOINC`;
}
