import { useState } from 'react';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  emergencyContact: string;
  insurance: string;
  status: 'active' | 'inactive' | 'pending';
  lastVisit: string;
  nextAppointment?: string;
  notes?: string;
  tags: string[];
}

export function usePatientData() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, ] = useState(false);

  const addPatient = async (patientData: Partial<Patient>) => {
    const newPatient: Patient = {
      id: Date.now().toString(),
      name: patientData.name || '',
      email: patientData.email || '',
      phone: patientData.phone || '',
      dateOfBirth: patientData.dateOfBirth || '',
      gender: patientData.gender || 'other',
      address: patientData.address || '',
      emergencyContact: patientData.emergencyContact || '',
      insurance: patientData.insurance || '',
      status: 'active',
      lastVisit: new Date().toISOString(),
      notes: patientData.notes,
      tags: patientData.tags || []
    };

    setPatients(prev => [newPatient, ...prev]);
    return newPatient;
  };

  const updatePatient = async (id: string, updates: Partial<Patient>) => {
    setPatients(prev => prev.map(patient => 
      patient.id === id ? { ...patient, ...updates } : patient
    ));
  };

  const deletePatient = async (id: string) => {
    setPatients(prev => prev.filter(patient => patient.id !== id));
  };

  return {
    patients,
    setPatients,
    loading,
    addPatient,
    updatePatient,
    deletePatient
  };
}