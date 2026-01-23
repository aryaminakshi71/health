// Patient Portal Interfaces

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  email: string;
  phone: string;
  address: Address;
  emergencyContact: EmergencyContact;
  insurance: InsuranceInfo;
  medicalHistory: MedicalHistory;
  allergies: Allergy[];
  medications: Medication[];
  immunizations: Immunization[];
  providers: Provider[];
  dependents: Dependent[];
  preferences: PatientPreferences;
  status: 'active' | 'inactive' | 'pending';
  lastVisit: string;
  nextAppointment?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  subscriberName: string;
  relationship: 'self' | 'spouse' | 'child' | 'other';
  effectiveDate: string;
  expirationDate?: string;
  copay?: number;
  deductible?: number;
  coverageType: 'primary' | 'secondary' | 'tertiary';
}

export interface MedicalHistory {
  conditions: MedicalCondition[];
  surgeries: Surgery[];
  familyHistory: FamilyHistory[];
  lifestyle: LifestyleInfo;
}

export interface MedicalCondition {
  id: string;
  name: string;
  diagnosisDate: string;
  status: 'active' | 'resolved' | 'chronic';
  severity: 'mild' | 'moderate' | 'severe';
  notes?: string;
  provider: string;
}

export interface Surgery {
  id: string;
  procedure: string;
  date: string;
  hospital: string;
  surgeon: string;
  notes?: string;
}

export interface FamilyHistory {
  condition: string;
  relationship: string;
  ageAtDiagnosis?: number;
  notes?: string;
}

export interface LifestyleInfo {
  smoking: 'never' | 'former' | 'current';
  alcohol: 'never' | 'occasional' | 'moderate' | 'heavy';
  exercise: 'none' | 'light' | 'moderate' | 'heavy';
  diet: string[];
  occupation: string;
  stressLevel: 'low' | 'moderate' | 'high';
}

export interface Allergy {
  id: string;
  allergen: string;
  severity: 'mild' | 'moderate' | 'severe';
  reaction: string;
  onsetDate: string;
  status: 'active' | 'resolved';
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  route: 'oral' | 'injection' | 'topical' | 'inhalation';
  startDate: string;
  endDate?: string;
  prescribedBy: string;
  pharmacy: string;
  refillsRemaining: number;
  status: 'active' | 'discontinued' | 'completed';
  notes?: string;
}

export interface Immunization {
  id: string;
  name: string;
  date: string;
  provider: string;
  nextDueDate?: string;
  status: 'completed' | 'due' | 'overdue';
}

export interface Provider {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  office: Address;
  isPrimary: boolean;
  notes?: string;
}

export interface Dependent {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  relationship: string;
  insuranceId?: string;
  status: 'active' | 'inactive';
}

export interface PatientPreferences {
  communicationMethod: 'email' | 'phone' | 'text' | 'portal';
  appointmentReminders: boolean;
  medicationReminders: boolean;
  labResultNotifications: boolean;
  language: string;
  accessibility: {
    largeText: boolean;
    highContrast: boolean;
    screenReader: boolean;
  };
}

// Appointment Interfaces
export interface Appointment {
  id: string;
  patientId: string;
  providerId: string;
  date: string;
  time: string;
  duration: number; // minutes
  type: 'checkup' | 'consultation' | 'procedure' | 'follow-up' | 'emergency';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  reason: string;
  notes?: string;
  location: string;
  instructions?: string;
  reminderSent: boolean;
}

export interface AppointmentRequest {
  patientId: string;
  preferredDate: string;
  preferredTime: string;
  type: string;
  reason: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  preferredProvider?: string;
  notes?: string;
}

// Test Results Interfaces
export interface TestResult {
  id: string;
  patientId: string;
  testName: string;
  testDate: string;
  resultDate: string;
  category: 'blood' | 'urine' | 'imaging' | 'biopsy' | 'other';
  results: TestValue[];
  status: 'pending' | 'completed' | 'abnormal' | 'critical';
  orderedBy: string;
  lab: string;
  notes?: string;
  attachments?: string[];
}

export interface TestValue {
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'high' | 'low' | 'critical';
  flag?: string;
}

// Prescription Interfaces
export interface Prescription {
  id: string;
  patientId: string;
  medication: string;
  dosage: string;
  frequency: string;
  quantity: number;
  refills: number;
  prescribedBy: string;
  prescribedDate: string;
  expirationDate: string;
  status: 'active' | 'expired' | 'discontinued';
  pharmacy: string;
  cost: number;
  insuranceCoverage?: number;
  copay?: number;
}

export interface PrescriptionRefill {
  id: string;
  prescriptionId: string;
  patientId: string;
  requestedDate: string;
  status: 'pending' | 'approved' | 'denied' | 'completed';
  requestedBy: string;
  notes?: string;
  estimatedReadyDate?: string;
}

// Referral Interfaces
export interface Referral {
  id: string;
  patientId: string;
  fromProvider: string;
  toProvider: string;
  specialty: string;
  reason: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  status: 'pending' | 'approved' | 'scheduled' | 'completed' | 'expired';
  requestDate: string;
  approvalDate?: string;
  appointmentDate?: string;
  notes?: string;
  insuranceApproval?: boolean;
}

// Message Interfaces
export interface Message {
  id: string;
  patientId: string;
  providerId?: string;
  subject: string;
  content: string;
  timestamp: string;
  status: 'unread' | 'read' | 'archived';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  attachments?: MessageAttachment[];
  threadId?: string;
}

export interface MessageAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

// Payment Interfaces
export interface Payment {
  id: string;
  patientId: string;
  amount: number;
  description: string;
  date: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method: 'credit-card' | 'debit-card' | 'bank-transfer' | 'cash' | 'check';
  transactionId?: string;
  invoiceId?: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  patientId: string;
  date: string;
  dueDate: string;
  amount: number;
  insuranceAmount?: number;
  patientAmount: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  notes?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  insuranceCoverage?: number;
  patientResponsibility: number;
}

// Form Interfaces
export interface Form {
  id: string;
  name: string;
  category: 'medical-history' | 'consent' | 'insurance' | 'demographics' | 'other';
  description: string;
  fields: FormField[];
  status: 'draft' | 'published' | 'archived';
  version: string;
  createdDate: string;
  updatedDate: string;
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'number' | 'email' | 'phone';
  required: boolean;
  options?: string[];
  validation?: string;
  placeholder?: string;
}

export interface FormSubmission {
  id: string;
  formId: string;
  patientId: string;
  submittedDate: string;
  status: 'draft' | 'submitted' | 'reviewed' | 'approved';
  data: Record<string, any>;
  reviewedBy?: string;
  reviewDate?: string;
  notes?: string;
}

// Visit Summary Interfaces
export interface VisitSummary {
  id: string;
  patientId: string;
  visitDate: string;
  provider: string;
  chiefComplaint: string;
  diagnosis: string[];
  treatment: string[];
  medications: string[];
  followUpDate?: string;
  instructions: string;
  vitals: VitalSigns;
  notes: string;
  attachments?: string[];
}

export interface VitalSigns {
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  oxygenSaturation?: number;
  respiratoryRate?: number;
}

// Notification Interfaces
export interface PatientNotification {
  id: string;
  patientId: string;
  type: 'appointment' | 'test-result' | 'medication' | 'payment' | 'message' | 'reminder';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

// Dashboard Interfaces
export interface PatientDashboard {
  upcomingAppointments: Appointment[];
  recentTestResults: TestResult[];
  activeMedications: Medication[];
  pendingRefills: PrescriptionRefill[];
  unreadMessages: Message[];
  recentVisits: VisitSummary[];
  notifications: PatientNotification[];
  healthMetrics: HealthMetric[];
}

export interface HealthMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  date: string;
  trend: 'improving' | 'stable' | 'declining';
  target?: number;
  status: 'normal' | 'warning' | 'critical';
} 