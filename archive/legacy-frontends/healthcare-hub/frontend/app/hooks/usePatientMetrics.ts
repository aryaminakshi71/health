import React, { useState } from 'react';

export interface PatientMetrics {
  totalPatients: number;
  activePatients: number;
  totalAppointments: number;
  completedAppointments: number;
  pendingAppointments: number;
  averageWaitTime: number;
  patientSatisfaction: number;
}

export function usePatientMetrics() {
  const [metrics, setMetrics] = useState<PatientMetrics>({
    totalPatients: 0,
    activePatients: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    pendingAppointments: 0,
    averageWaitTime: 0,
    patientSatisfaction: 0
  });

  const updateMetrics = (newMetrics: Partial<PatientMetrics>) => {
    setMetrics(prev => ({ ...prev, ...newMetrics }));
  };

  return {
    metrics,
    updateMetrics
  };
} 