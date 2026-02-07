import { createObjectCsvStringifier } from 'csv-writer';
import { db } from '../db';
import { patients, appointments, clinicalNotes, prescriptions, labResults, charges } from '../db/schema';
import { format } from 'date-fns';

export async function generatePatientReport(patientId: string, options?: ReportOptions): Promise<ReportResult> {
  const patient = await db.query.patients.findFirst({
    where: (patients, { eq }) => eq(patients.id, patientId),
  });

  if (!patient) {
    throw new Error('Patient not found');
  }

  const [appointmentsData, notes, prescriptionsData, labResultsData, chargesData] = await Promise.all([
    db.select().from(appointments).where((appointments, { eq }) => eq(appointments.patientId, patientId)),
    db.select().from(clinicalNotes).where((clinicalNotes, { eq }) => eq(clinicalNotes.patientId, patientId)),
    db.select().from(prescriptions).where((prescriptions, { eq }) => eq(prescriptions.patientId, patientId)),
    db.select().from(labResults).where((labResults, { eq }) => eq(labResults.patientId, patientId)),
    db.select().from(charges).where((charges, { eq }) => eq(charges.patientId, patientId)),
  ]);

  const sections: ReportSection[] = [];

  if (options?.includePatientInfo !== false) {
    sections.push({
      title: 'Patient Information',
      data: [patient],
      format: 'table',
    });
  }

  if (options?.includeAppointments !== false) {
    sections.push({
      title: 'Appointments',
      data: appointmentsData,
      format: 'table',
    });
  }

  if (options?.includeNotes !== false) {
    sections.push({
      title: 'Clinical Notes',
      data: notes,
      format: 'table',
    });
  }

  if (options?.includePrescriptions !== false) {
    sections.push({
      title: 'Prescriptions',
      data: prescriptionsData,
      format: 'table',
    });
  }

  if (options?.includeLabResults !== false) {
    sections.push({
      title: 'Lab Results',
      data: labResultsData,
      format: 'table',
    });
  }

  if (options?.includeCharges !== false) {
    sections.push({
      title: 'Billing',
      data: chargesData,
      format: 'table',
    });
  }

  return {
    patientId,
    generatedAt: new Date().toISOString(),
    sections,
  };
}

export async function generateRevenueReport(startDate: Date, endDate: Date): Promise<RevenueReport> {
  const chargesResult = await db.select({
    total: sql<number>`SUM(${charges.totalAmount})`,
    insurance: sql<number>`SUM(${charges.insuranceAdjustment})`,
    patient: sql<number>`SUM(${charges.patientResponsibility})`,
  })
  .from(charges)
  .where(
    sql`${charges.serviceDate} >= ${startDate} AND ${charges.serviceDate} <= ${endDate}`
  );

  const paymentsResult = await db.select({
    total: sql<number>`SUM(amount)`,
  })
  .from(charges)
  .where(
    sql`${charges.serviceDate} >= ${startDate} AND ${charges.serviceDate} <= ${endDate} AND ${charges.status} = 'paid'`
  );

  return {
    period: { startDate, endDate },
    summary: {
      totalCharges: parseFloat(chargesResult[0]?.total || '0'),
      insuranceAdjustments: parseFloat(chargesResult[0]?.insurance || '0'),
      patientResponsibility: parseFloat(chargesResult[0]?.patient || '0'),
      totalPayments: parseFloat(paymentsResult[0]?.total || '0'),
    },
    generatedAt: new Date().toISOString(),
  };
}

export async function exportToCSV<T extends Record<string, any>>(data: T[], filename: string): Promise<string> {
  if (data.length === 0) {
    return '';
  }

  const keys = Object.keys(data[0]);
  const csvStringifier = createObjectCsvStringifier({
    header: keys.map(key => ({ key, title: key })),
  });

  const header = csvStringifier.getHeaderString();
  const records = csvStringifier.stringifyRecords(data);

  return header + records;
}

export async function exportToJSON<T extends Record<string, any>>(data: T[]): Promise<string> {
  return JSON.stringify(data, null, 2);
}

export interface ReportOptions {
  includePatientInfo?: boolean;
  includeAppointments?: boolean;
  includeNotes?: boolean;
  includePrescriptions?: boolean;
  includeLabResults?: boolean;
  includeCharges?: boolean;
  dateFormat?: string;
}

export interface ReportResult {
  patientId: string;
  generatedAt: string;
  sections: ReportSection[];
}

export interface ReportSection {
  title: string;
  data: any[];
  format: 'table' | 'list';
}

export interface RevenueReport {
  period: { startDate: Date; endDate: Date };
  summary: {
    totalCharges: number;
    insuranceAdjustments: number;
    patientResponsibility: number;
    totalPayments: number;
  };
  generatedAt: string;
}
