export interface FHIRPatient {
  resourceType: 'Patient';
  id: string;
  meta?: FHIRMeta;
  identifier?: FHIRIdentifier[];
  active?: boolean;
  name: FHIRHumanName[];
  telecom?: FHIRContactPoint[];
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  deceasedBoolean?: boolean;
  deceasedDateTime?: string;
  address?: FHIRAddress[];
  maritalStatus?: FHIRCodeableConcept;
  contact?: FHIRPatientContact[];
  communication?: FHIRPatientCommunication[];
  generalPractitioner?: FHIRReference[];
}

export interface FHIRAppointment {
  resourceType: 'Appointment';
  id: string;
  status: 'proposed' | 'pending' | 'booked' | 'arrived' | 'fulfilled' | 'cancelled' | 'noshow' | 'entered-in-error' | 'checked-in' | 'waitlist';
  serviceType?: FHIRCodeableConcept[];
  specialty?: FHIRCodeableConcept[];
  appointmentType?: FHIRCodeableConcept;
  reasonCode?: FHIRCodeableConcept[];
  priority?: number;
  description?: string;
  start?: string;
  end?: string;
  minutesDuration?: number;
  slot?: FHIRReference[];
  created?: string;
  comment?: string;
  patientInstruction?: string;
  participant: FHIRAppointmentParticipant[];
}

export interface FHIRObservation {
  resourceType: 'Observation';
  id: string;
  status: 'registered' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'cancelled' | 'entered-in-error' | 'unknown';
  category?: FHIRCodeableConcept[];
  code: FHIRCodeableConcept;
  subject?: FHIRReference;
  encounter?: FHIRReference;
  effectiveDateTime?: string;
  valueQuantity?: FHIRQuantity;
  valueString?: string;
  interpretation?: FHIRCodeableConcept[];
  referenceRange?: FHIRObservationReferenceRange[];
  component?: FHIRObservationComponent[];
}

export interface FHIRCondition {
  resourceType: 'Condition';
  id: string;
  clinicalStatus?: FHIRCodeableConcept;
  verificationStatus?: FHIRCodeableConcept;
  category?: FHIRCodeableConcept[];
  severity?: FHIRCodeableConcept;
  code?: FHIRCodeableConcept;
  bodySite?: FHIRCodeableConcept[];
  subject: FHIRReference;
  encounter?: FHIRReference;
  onsetDateTime?: string;
  abatementDateTime?: string;
  recordedDate?: string;
  recorder?: FHIRReference;
  note?: FHIRAnnotation[];
}

export interface FHIRMedicationRequest {
  resourceType: 'MedicationRequest';
  id: string;
  status: 'active' | 'on-hold' | 'cancelled' | 'completed' | 'entered-in-error' | 'stopped' | 'draft' | 'unknown';
  intent: 'proposal' | 'plan' | 'order' | 'original-order' | 'reflex-order' | 'filler-order' | 'instance-order' | 'option';
  medicationCodeableConcept?: FHIRCodeableConcept;
  medicationReference?: FHIRReference;
  subject: FHIRReference;
  encounter?: FHIRReference;
  authoredOn?: string;
  requester?: FHIRReference;
  dosageInstruction?: FHIRDosage[];
  dispenseRequest?: FHIRMedicationRequestDispenseRequest;
  substitution?: FHIRMedicationRequestSubstitution;
}

export interface FHIRBundle {
  resourceType: 'Bundle';
  id?: string;
  type: 'document' | 'message' | 'transaction' | 'transaction-response' | 'batch' | 'batch-response' | 'history' | 'searchset' | 'collection';
  total?: number;
  link?: FHIRBundleLink[];
  entry?: FHIRBundleEntry[];
}

export interface FHIRDiagnosticReport {
  resourceType: 'DiagnosticReport';
  id: string;
  status: 'registered' | 'partial' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'appended' | 'cancelled' | 'entered-in-error' | 'unknown';
  category?: FHIRCodeableConcept[];
  code: FHIRCodeableConcept;
  subject?: FHIRReference;
  encounter?: FHIRReference;
  effectiveDateTime?: string;
  issued?: string;
  performer?: FHIRReference[];
  result?: FHIRReference[];
  conclusion?: string;
}

export interface FHIRAllergyIntolerance {
  resourceType: 'AllergyIntolerance';
  id: string;
  clinicalStatus?: FHIRCodeableConcept;
  verificationStatus?: FHIRCodeableConcept;
  type?: 'allergy' | 'intolerance';
  category?: ('food' | 'medication' | 'environment' | 'biologic')[];
  criticality?: 'low' | 'high' | 'unable-to-assess';
  code?: FHIRCodeableConcept;
  patient: FHIRReference;
  onsetDateTime?: string;
  recordedDate?: string;
  recorder?: FHIRReference;
  reaction?: FHIRAllergyIntoleranceReaction[];
}

export interface FHIREncounter {
  resourceType: 'Encounter';
  id: string;
  status: 'planned' | 'arrived' | 'triaged' | 'in-progress' | 'onleave' | 'finished' | 'cancelled' | 'entered-in-error' | 'unknown';
  class: FHIRCoding;
  type?: FHIRCodeableConcept[];
  serviceType?: FHIRCodeableConcept;
  subject?: FHIRReference;
  participant?: FHIREncounterParticipant[];
  period?: FHIRPeriod;
  reasonCode?: FHIRCodeableConcept[];
}

export interface FHIRImmunization {
  resourceType: 'Immunization';
  id: string;
  status: 'completed' | 'entered-in-error' | 'not-done';
  vaccineCode: FHIRCodeableConcept;
  patient: FHIRReference;
  encounter?: FHIRReference;
  occurrenceDateTime?: string;
  occurrenceString?: string;
  primarySource?: boolean;
  location?: FHIRReference;
  manufacturer?: FHIRReference;
  lotNumber?: string;
  expirationDate?: string;
  site?: FHIRCodeableConcept;
  route?: FHIRCodeableConcept;
  doseQuantity?: FHIRQuantity;
  performer?: FHIRImmunizationPerformer[];
}

export interface FHIRCarePlan {
  resourceType: 'CarePlan';
  id: string;
  status: 'draft' | 'active' | 'on-hold' | 'revoked' | 'completed' | 'entered-in-error' | 'unknown';
  intent: 'proposal' | 'plan' | 'order' | 'option';
  category?: FHIRCodeableConcept[];
  title?: string;
  description?: string;
  subject: FHIRReference;
  period?: FHIRPeriod;
  created?: string;
  author?: FHIRReference;
  careTeam?: FHIRReference[];
  activity?: FHIRCarePlanActivity[];
}

export interface FHIRMeta {
  versionId?: string;
  lastUpdated?: string;
  source?: string;
  profile?: string[];
  security?: FHIRCoding[];
  tag?: FHIRCoding[];
}

export interface FHIRIdentifier {
  use?: 'usual' | 'official' | 'temp' | 'secondary' | 'old';
  type?: FHIRCodeableConcept;
  system?: string;
  value?: string;
  period?: FHIRPeriod;
}

export interface FHIRHumanName {
  use?: 'usual' | 'official' | 'temp' | 'nickname' | 'anonymous' | 'old' | 'maiden';
  text?: string;
  family?: string;
  given?: string[];
  prefix?: string[];
  suffix?: string[];
  period?: FHIRPeriod;
}

export interface FHIRContactPoint {
  system?: 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other';
  value?: string;
  use?: 'home' | 'work' | 'temp' | 'old' | 'mobile';
  rank?: number;
  period?: FHIRPeriod;
}

export interface FHIRAddress {
  use?: 'home' | 'work' | 'temp' | 'old' | 'billing';
  type?: 'postal' | 'physical' | 'both';
  text?: string;
  line?: string[];
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  period?: FHIRPeriod;
}

export interface FHIRCodeableConcept {
  coding?: FHIRCoding[];
  text?: string;
}

export interface FHIRCoding {
  system?: string;
  version?: string;
  code?: string;
  display?: string;
  userSelected?: boolean;
}

export interface FHIRReference {
  reference?: string;
  type?: string;
  identifier?: FHIRIdentifier;
  display?: string;
}

export interface FHIRPeriod {
  start?: string;
  end?: string;
}

export interface FHIRQuantity {
  value?: number;
  comparator?: '<' | '<=' | '>=' | '>';
  unit?: string;
  system?: string;
  code?: string;
}

export interface FHIRAnnotation {
  authorReference?: FHIRReference;
  authorString?: string;
  time?: string;
  text: string;
}

export interface FHIRPatientContact {
  relationship?: FHIRCodeableConcept[];
  name?: FHIRHumanName;
  telecom?: FHIRContactPoint[];
  address?: FHIRAddress;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  organization?: FHIRReference;
  period?: FHIRPeriod;
}

export interface FHIRPatientCommunication {
  language: FHIRCodeableConcept;
  preferred?: boolean;
}

export interface FHIRAppointmentParticipant {
  type?: FHIRCodeableConcept[];
  actor?: FHIRReference;
  required?: 'required' | 'optional' | 'information-only';
  status: 'accepted' | 'declined' | 'tentative' | 'needs-action';
  period?: FHIRPeriod;
}

export interface FHIRObservationReferenceRange {
  low?: FHIRQuantity;
  high?: FHIRQuantity;
  type?: FHIRCodeableConcept;
  appliesTo?: FHIRCodeableConcept[];
  age?: FHIRRange;
  text?: string;
}

export interface FHIRObservationComponent {
  code: FHIRCodeableConcept;
  valueQuantity?: FHIRQuantity;
  valueString?: string;
  interpretation?: FHIRCodeableConcept[];
  referenceRange?: FHIRObservationReferenceRange[];
}

export interface FHIRAllergyIntoleranceReaction {
  substance?: FHIRCodeableConcept;
  manifestation: FHIRCodeableConcept[];
  description?: string;
  onset?: string;
  severity?: 'mild' | 'moderate' | 'severe';
  exposureRoute?: FHIRCodeableConcept;
  note?: FHIRAnnotation[];
}

export interface FHIREncounterParticipant {
  type?: FHIRCodeableConcept[];
  period?: FHIRPeriod;
  individual?: FHIRReference;
}

export interface FHIRDosage {
  sequence?: number;
  text?: string;
  timing?: FHIRTiming;
  route?: FHIRCodeableConcept;
  method?: FHIRCodeableConcept;
  doseAndRate?: FHIRDosageDoseAndRate[];
}

export interface FHIRTiming {
  event?: string[];
  repeat?: FHIRTimingRepeat;
  code?: FHIRCodeableConcept;
}

export interface FHIRTimingRepeat {
  boundsDuration?: FHIRDuration;
  boundsPeriod?: FHIRPeriod;
  count?: number;
  countMax?: number;
  duration?: number;
  durationMax?: number;
  durationUnit?: 's' | 'min' | 'h' | 'd' | 'wk' | 'mo' | 'a';
  frequency?: number;
  frequencyMax?: number;
  period?: number;
  periodMax?: number;
  periodUnit?: 's' | 'min' | 'h' | 'd' | 'wk' | 'mo' | 'a';
  dayOfWeek?: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
  timeOfDay?: string[];
  when?: string[];
}

export interface FHIRDuration {
  value?: number;
  comparator?: '<' | '<=' | '>=' | '>';
  unit?: string;
  system?: string;
  code?: string;
}

export interface FHIRRange {
  low?: FHIRQuantity;
  high?: FHIRQuantity;
}

export interface FHIRDosageDoseAndRate {
  type?: FHIRCodeableConcept;
  doseRange?: FHIRRange;
  doseQuantity?: FHIRQuantity;
  rateRatio?: FHIRRatio;
  rateRange?: FHIRRange;
  rateQuantity?: FHIRQuantity;
}

export interface FHIRRatio {
  numerator?: FHIRQuantity;
  denominator?: FHIRQuantity;
}

export interface FHIRMedicationRequestDispenseRequest {
  initialFill?: { quantity?: FHIRQuantity; duration?: FHIRDuration };
  dispenseInterval?: FHIRDuration;
  validityPeriod?: FHIRPeriod;
  numberOfRepeatsAllowed?: number;
  quantity?: FHIRQuantity;
  expectedSupplyDuration?: FHIRDuration;
  performer?: FHIRReference;
}

export interface FHIRMedicationRequestSubstitution {
  allowedBoolean?: boolean;
  allowedCodeableConcept?: FHIRCodeableConcept;
  reason?: FHIRCodeableConcept;
}

export interface FHIRBundleLink {
  relation: string;
  url: string;
}

export interface FHIRBundleEntry {
  link?: FHIRBundleLink[];
  fullUrl?: string;
  resource?: any;
  search?: { mode?: 'match' | 'include' | 'outcome'; score?: number };
  request?: { method: string; url: string; ifNoneMatch?: string; ifModifiedSince?: string; ifMatch?: string; ifNoneExist?: string };
  response?: { status: string; location?: string; etag?: string; lastModified?: string; outcome?: any };
}

export interface FHIRCarePlanActivity {
  outcomeCodeableConcept?: FHIRCodeableConcept[];
  outcomeReference?: FHIRReference[];
  progress?: FHIRAnnotation[];
  reference?: FHIRReference;
  detail?: FHIRCarePlanActivityDetail;
}

export interface FHIRCarePlanActivityDetail {
  kind?: string;
  instantiatesCanonical?: string[];
  instantiatesUri?: string[];
  code?: FHIRCodeableConcept;
  reasonCode?: FHIRCodeableConcept[];
  reasonReference?: FHIRReference[];
  goal?: FHIRReference[];
  status: 'not-started' | 'scheduled' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled' | 'stopped' | 'unknown' | 'entered-in-error';
  doNotPerform?: boolean;
  scheduledTiming?: FHIRTiming;
  scheduledPeriod?: FHIRPeriod;
  scheduledString?: string;
  location?: FHIRReference;
  performer?: FHIRReference[];
  productCodeableConcept?: FHIRCodeableConcept;
  productReference?: FHIRReference;
  dailyAmount?: FHIRQuantity;
  quantity?: FHIRQuantity;
  description?: string;
}

export interface FHIRImmunizationPerformer {
  function?: FHIRCodeableConcept;
  actor: FHIRReference;
}
