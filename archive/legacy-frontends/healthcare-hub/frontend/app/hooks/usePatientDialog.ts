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

export function usePatientDialog() {
  const [showPatientDialog, setShowPatientDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  return {
    showPatientDialog,
    setShowPatientDialog,
    selectedPatient,
    setSelectedPatient
  };
}