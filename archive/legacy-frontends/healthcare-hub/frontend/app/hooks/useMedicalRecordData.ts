import { useState } from 'react';

interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  recordType: 'progress_note' | 'lab_result' | 'imaging' | 'medication' | 'allergy' | 'immunization';
  date: string;
  physicianId: string;
  physicianName: string;
  diagnosis?: string;
  symptoms?: string[];
  medications?: string[];
  labResults?: {
    testName: string;
    result: string;
    normalRange: string;
    unit: string;
  }[];
  notes?: string;
  attachments?: string[];
  status: 'draft' | 'final' | 'reviewed';
}

export function useMedicalRecordData() {
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [loading, ] = useState(false);

  const addMedicalRecord = async (recordData: Partial<MedicalRecord>) => {
    const newRecord: MedicalRecord = {
      id: Date.now().toString(),
      patientId: recordData.patientId || '',
      patientName: recordData.patientName || '',
      recordType: recordData.recordType || 'progress_note',
      date: recordData.date || new Date().toISOString(),
      physicianId: recordData.physicianId || '',
      physicianName: recordData.physicianName || '',
      diagnosis: recordData.diagnosis,
      symptoms: recordData.symptoms,
      medications: recordData.medications,
      labResults: recordData.labResults,
      notes: recordData.notes,
      attachments: recordData.attachments,
      status: recordData.status || 'draft'
    };
    setMedicalRecords(prev => [...prev, newRecord]);
  };

  const updateMedicalRecord = async (id: string, updates: Partial<MedicalRecord>) => {
    setMedicalRecords(prev => 
      prev.map(record => 
        record.id === id ? { ...record, ...updates } : record
      )
    );
  };

  const deleteMedicalRecord = async (id: string) => {
    setMedicalRecords(prev => prev.filter(record => record.id !== id));
  };

  const getRecordsByPatient = (patientId: string) => {
    return medicalRecords.filter(record => record.patientId === patientId);
  };

  const getRecordsByType = (recordType: string) => {
    return medicalRecords.filter(record => record.recordType === recordType);
  };

  return {
    medicalRecords,
    loading,
    addMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord,
    getRecordsByPatient,
    getRecordsByType
  };
} 