import { useState } from 'react';

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  duration: number;
  type: 'consultation' | 'follow-up' | 'emergency' | 'routine';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  symptoms?: string;
  diagnosis?: string;
  prescription?: string;
}

export function useAppointmentDialog() {
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  return {
    showAppointmentDialog,
    setShowAppointmentDialog,
    selectedAppointment,
    setSelectedAppointment
  };
} 