import { useState } from 'react';

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  physicianId: string;
  physicianName: string;
  date: string;
  time: string;
  duration: number;
  type: 'consultation' | 'follow-up' | 'emergency' | 'routine';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  location: string;
  insurance?: string;
  cost?: number;
}

export function useAppointmentData() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, ] = useState(false);

  const addAppointment = async (appointmentData: Partial<Appointment>) => {
    const newAppointment: Appointment = {
      id: Date.now().toString(),
      patientId: appointmentData.patientId || '',
      patientName: appointmentData.patientName || '',
      physicianId: appointmentData.physicianId || '',
      physicianName: appointmentData.physicianName || '',
      date: appointmentData.date || '',
      time: appointmentData.time || '',
      duration: appointmentData.duration || 30,
      type: appointmentData.type || 'consultation',
      status: appointmentData.status || 'scheduled',
      notes: appointmentData.notes,
      location: appointmentData.location || '',
      insurance: appointmentData.insurance,
      cost: appointmentData.cost
    };
    setAppointments(prev => [...prev, newAppointment]);
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    setAppointments(prev => 
      prev.map(appointment => 
        appointment.id === id ? { ...appointment, ...updates } : appointment
      )
    );
  };

  const deleteAppointment = async (id: string) => {
    setAppointments(prev => prev.filter(appointment => appointment.id !== id));
  };

  const getAppointmentsByDate = (date: string) => {
    return appointments.filter(appointment => appointment.date === date);
  };

  const getAppointmentsByStatus = (status: string) => {
    return appointments.filter(appointment => appointment.status === status);
  };

  return {
    appointments,
    loading,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointmentsByDate,
    getAppointmentsByStatus
  };
} 