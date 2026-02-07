import { db } from '@healthcare-saas/storage';
import { patients, appointments, clinicalNotes, prescriptions, labResults, vitalSigns, diagnoses } from '@healthcare-saas/storage/db/schema';
import type { FHIRPatient, FHIRAppointment, FHIRObservation, FHIRCondition, FHIRMedicationRequest, FHIRBundle, FHIRDiagnosticReport, FHIRAllergyIntolerance, FHIREncounter, FHIRCarePlan } from './fhir-types';

export class FHIRConverter {
  static toFHIRPatient(patient: any): FHIRPatient {
    return {
      resourceType: 'Patient',
      id: patient.id,
      meta: {
        versionId: '1',
        lastUpdated: patient.updatedAt?.toISOString(),
        profile: ['http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient'],
      },
      identifier: [
        {
          use: 'usual',
          type: {
            coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v2-0203', code: 'MR' }],
          },
          system: 'urn:oid:healthcare.mrn',
          value: patient.medicalRecordNumber,
        },
      ],
      active: patient.status === 'active',
      name: [
        {
          use: 'official',
          family: patient.lastName,
          given: [patient.firstName],
        },
      ],
      telecom: [
        ...(patient.phone ? [{ system: 'phone' as const, value: patient.phone, use: 'mobile' as const }] : []),
        ...(patient.email ? [{ system: 'email' as const, value: patient.email, use: 'home' as const }] : []),
      ],
      gender: patient.gender?.toLowerCase() as 'male' | 'female' | 'other' | 'unknown',
      birthDate: patient.dateOfBirth?.toISOString().split('T')[0],
      address: patient.address ? [
        {
          use: 'home',
          line: [patient.address.street],
          city: patient.address.city,
          state: patient.address.state,
          postalCode: patient.address.zipCode,
          country: patient.address.country,
        },
      ] : undefined,
      contact: patient.emergencyContact ? [
        {
          relationship: [{ text: patient.emergencyContact.relationship }],
          name: { text: patient.emergencyContact.name },
          telecom: [{ system: 'phone', value: patient.emergencyContact.phone }],
        },
      ] : undefined,
    };
  }

  static toFHIRAppointment(appointment: any): FHIRAppointment {
    const statusMap: Record<string, FHIRAppointment['status']> = {
      scheduled: 'booked',
      confirmed: 'booked',
      checked_in: 'arrived',
      in_progress: 'arrived',
      completed: 'fulfilled',
      cancelled: 'cancelled',
      no_show: 'noshow',
    };

    return {
      resourceType: 'Appointment',
      id: appointment.id,
      status: statusMap[appointment.status] || 'pending',
      appointmentType: {
        coding: [{ display: appointment.appointmentType }],
        text: appointment.reason,
      },
      description: appointment.reason,
      start: appointment.scheduledAt?.toISOString(),
      end: appointment.scheduledAt ? 
        new Date(appointment.scheduledAt.getTime() + (appointment.duration || 30) * 60000).toISOString() 
        : undefined,
      minutesDuration: appointment.duration || 30,
      comment: appointment.notes,
      participant: [
        {
          actor: { reference: `Patient/${appointment.patientId}` },
          status: 'accepted',
        },
        {
          actor: { reference: `Practitioner/${appointment.providerId}` },
          status: 'accepted',
        },
      ],
    };
  }

  static toFHIRObservation(vital: any): FHIRObservation {
    const components = [];
    
    if (vital.bloodPressureSystolic && vital.bloodPressureDiastolic) {
      components.push({
        code: { coding: [{ system: 'http://loinc.org', code: '85354-9', display: 'Blood pressure panel' }] },
        valueQuantity: {
          value: vital.bloodPressureSystolic,
          unit: 'mmHg',
          system: 'http://unitsofmeasure.org',
        },
      });
    }
    
    if (vital.heartRate) {
      components.push({
        code: { coding: [{ system: 'http://loinc.org', code: '8867-4', display: 'Heart rate' }] },
        valueQuantity: {
          value: vital.heartRate,
          unit: 'beats/min',
          system: 'http://unitsofmeasure.org',
        },
      });
    }

    return {
      resourceType: 'Observation',
      id: vital.id,
      status: 'final',
      category: [
        {
          coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs' }],
        },
      ],
      code: { coding: [{ system: 'http://loinc.org', code: '85354-9', display: 'Blood pressure panel' }] },
      subject: { reference: `Patient/${vital.patientId}` },
      effectiveDateTime: vital.recordedAt?.toISOString(),
      component: components.length > 0 ? components : undefined,
    };
  }

  static toFHIRCondition(diagnosis: any): FHIRCondition {
    return {
      resourceType: 'Condition',
      id: diagnosis.id,
      clinicalStatus: { coding: [{ code: diagnosis.status || 'active' }] },
      code: diagnosis.icdCode ? {
        coding: [{ system: 'http://hl7.org/fhir/sid/icd-10-cm', code: diagnosis.icdCode, display: diagnosis.name }],
        text: diagnosis.name,
      } : undefined,
      subject: { reference: `Patient/${diagnosis.patientId}` },
      onsetDateTime: diagnosis.diagnosedDate?.toISOString(),
      recordedDate: diagnosis.createdAt?.toISOString(),
    };
  }

  static toFHIRMedicationRequest(prescription: any): FHIRMedicationRequest {
    return {
      resourceType: 'MedicationRequest',
      id: prescription.id,
      status: prescription.status === 'active' ? 'active' : 
             prescription.status === 'completed' ? 'completed' : 
             prescription.status === 'on_hold' ? 'on-hold' : 'stopped',
      intent: 'order',
      medicationCodeableConcept: {
        coding: [{ display: prescription.medicationName }],
        text: prescription.medicationName,
      },
      subject: { reference: `Patient/${prescription.patientId}` },
      authoredOn: prescription.prescribedAt?.toISOString(),
      requester: { reference: `Practitioner/${prescription.providerId}` },
      dosageInstruction: [
        {
          text: `${prescription.dosage} ${prescription.frequency}`,
          timing: { code: { text: prescription.frequency } },
          route: prescription.route ? { text: prescription.route } : undefined,
          doseAndRate: [
            {
              doseQuantity: {
                value: parseFloat(prescription.dosage) || undefined,
                unit: prescription.dosage?.replace(/[0-9.]/g, '') || 'mg',
              },
            },
          ],
        },
      ],
      dispenseRequest: {
        numberOfRepeatsAllowed: prescription.refills,
        quantity: prescription.quantity,
        expectedSupplyDuration: {
          value: 30,
          unit: 'days',
          system: 'http://unitsofmeasure.org',
        },
      },
    };
  }

  static toFHIRBundle(resources: any[], type: FHIRBundle['type'] = 'collection'): FHIRBundle {
    return {
      resourceType: 'Bundle',
      type,
      total: resources.length,
      entry: resources.map(resource => ({
        fullUrl: `urn:uuid:${resource.id}`,
        resource,
      })),
    };
  }
}

export class FHIRValidator {
  static validateResource(resource: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!resource.resourceType) {
      errors.push('Missing resourceType');
    }

    if (!resource.id) {
      errors.push('Missing id');
    }

    switch (resource.resourceType) {
      case 'Patient':
        if (!resource.name || resource.name.length === 0) {
          errors.push('Patient must have at least one name');
        }
        break;
      case 'Appointment':
        if (!resource.status) {
          errors.push('Appointment must have a status');
        }
        if (!resource.participant || resource.participant.length === 0) {
          errors.push('Appointment must have at least one participant');
        }
        break;
      case 'Observation':
        if (!resource.status) {
          errors.push('Observation must have a status');
        }
        if (!resource.code) {
          errors.push('Observation must have a code');
        }
        break;
    }

    return { valid: errors.length === 0, errors };
  }
}

export async function getPatientFHIR(id: string): Promise<FHIRPatient | null> {
  const patient = await db.query.patients.findFirst({
    where: (patients, { eq }) => eq(patients.id, id),
  });

  if (!patient) return null;

  return FHIRConverter.toFHIRPatient(patient);
}

export async function getPatientBundleFHIR(id: string): Promise<FHIRBundle> {
  const [patient, appointments_list, clinical_notes, prescriptions_list, lab_results_list, vital_signs_list, conditions] = await Promise.all([
    db.query.patients.findFirst({ where: (patients, { eq }) => eq(patients.id, id) }),
    db.select().from(appointments).where((appointments, { eq }) => eq(appointments.patientId, id)),
    db.select().from(clinicalNotes).where((clinicalNotes, { eq }) => eq(clinicalNotes.patientId, id)),
    db.select().from(prescriptions).where((prescriptions, { eq }) => eq(prescriptions.patientId, id)),
    db.select().from(labResults).where((labResults, { eq }) => eq(labResults.patientId, id)),
    db.select().from(vitalSigns).where((vitalSigns, { eq }) => eq(vitalSigns.patientId, id)),
    db.select().from(diagnoses).where((diagnoses, { eq }) => eq(diagnoses.patientId, id)),
  ]);

  const resources: any[] = [];

  if (patient) {
    resources.push(FHIRConverter.toFHIRPatient(patient));
  }

  resources.push(...appointments_list.map(FHIRConverter.toFHIRAppointment));
  resources.push(...vitalSigns_list.map(FHIRConverter.toFHIRObservation));
  resources.push(...conditions.map(FHIRConverter.toFHIRCondition));
  resources.push(...prescriptions_list.map(FHIRConverter.toFHIRMedicationRequest));

  return FHIRConverter.toFHIRBundle(resources, 'collection');
}
