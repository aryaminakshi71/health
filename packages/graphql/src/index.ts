import { graphqlServer } from '@hono/graphql-server';
import { buildSchema, printSchema } from 'graphql';
import { resolvers } from './resolvers';

const typeDefs = `
  type Patient {
    id: ID!
    firstName: String!
    lastName: String!
    email: String
    phone: String
    dateOfBirth: String
    gender: String
    address: String
    insuranceProvider: String
    insuranceNumber: String
    allergies: [String]
    createdAt: String
    updatedAt: String
  }

  type Appointment {
    id: ID!
    patientId: ID!
    doctorId: ID!
    dateTime: String!
    duration: Int!
    type: String!
    status: String!
    reason: String
    notes: String
    createdAt: String
    updatedAt: String
  }

  type Prescription {
    id: ID!
    patientId: ID!
    doctorId: ID!
    medicationName: String!
    dosage: String!
    frequency: String!
    duration: String!
    instructions: String
    refillsRemaining: Int
    prescribedAt: String
  }

  type LabResult {
    id: ID!
    patientId: ID!
    testName: String!
    result: String
    normalRange: String
    unit: String
    status: String!
    orderedBy: ID
    orderedAt: String
    completedAt: String
  }

  type VitalSigns {
    id: ID!
    patientId: ID!
    bloodPressureSystolic: Int
    bloodPressureDiastolic: Int
    heartRate: Int
    temperature: Float
    respiratoryRate: Int
    oxygenSaturation: Int
    weight: Float
    height: Float
    recordedAt: String
  }

  type Query {
    patients: [Patient!]!
    patient(id: ID!): Patient
    appointments(patientId: ID): [Appointment!]!
    appointment(id: ID!): Appointment
    prescriptions(patientId: ID): [Prescription!]!
    labResults(patientId: ID): [LabResult!]!
    vitalSigns(patientId: ID!, limit: Int): [VitalSigns!]!
  }

  type Mutation {
    createPatient(input: PatientInput!): Patient!
    updatePatient(id: ID!, input: PatientInput!): Patient!
    createAppointment(input: AppointmentInput!): Appointment!
    updateAppointmentStatus(id: ID!, status: String!): Appointment!
    createPrescription(input: PrescriptionInput!): Prescription!
    recordVitalSigns(input: VitalSignsInput!): VitalSigns!
  }

  input PatientInput {
    firstName: String!
    lastName: String!
    email: String
    phone: String
    dateOfBirth: String
    gender: String
    address: String
    insuranceProvider: String
    insuranceNumber: String
    allergies: [String]
  }

  input AppointmentInput {
    patientId: ID!
    doctorId: ID!
    dateTime: String!
    duration: Int!
    type: String!
    reason: String
    notes: String
  }

  input PrescriptionInput {
    patientId: ID!
    doctorId: ID!
    medicationName: String!
    dosage: String!
    frequency: String!
    duration: String!
    instructions: String
  }

  input VitalSignsInput {
    patientId: ID!
    bloodPressureSystolic: Int
    bloodPressureDiastolic: Int
    heartRate: Int
    temperature: Float
    respiratoryRate: Int
    oxygenSaturation: Int
    weight: Float
    height: Float
  }
`;

const schema = buildSchema(typeDefs);

export function createGraphQLServer() {
  return {
    schema,
    rootValue: resolvers,
  };
}

export { typeDefs };
