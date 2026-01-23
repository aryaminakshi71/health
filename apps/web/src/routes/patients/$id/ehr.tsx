/**
 * Patient EHR Route
 */

import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '../../../lib/api';
import { ClinicalNoteEditor } from '../../../components/ehr/clinical-note-editor';
import { VitalSignsForm } from '../../../components/ehr/vital-signs-form';
import { VitalSignsChart } from '../../../components/charts/vital-signs-chart';
import { useState } from 'react';

export const Route = createFileRoute('/patients/$id/ehr')({
  component: PatientEHR,
});

function PatientEHR() {
  const { id } = Route.useParams();
  const [activeTab, setActiveTab] = useState<'notes' | 'vitals' | 'diagnoses'>('notes');

  const { data: notes } = useQuery(
    orpc.ehr.listNotes({ patientId: id })
  );

  const { data: vitalSigns } = useQuery(
    orpc.ehr.getVitalSignsHistory({ patientId: id })
  );

  const { data: problemList } = useQuery(
    orpc.ehr.getProblemList({ patientId: id })
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Electronic Health Records</h2>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-6 py-3 border-b-2 font-medium text-sm ${
              activeTab === 'notes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Clinical Notes
          </button>
          <button
            onClick={() => setActiveTab('vitals')}
            className={`px-6 py-3 border-b-2 font-medium text-sm ${
              activeTab === 'vitals'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Vital Signs
          </button>
          <button
            onClick={() => setActiveTab('diagnoses')}
            className={`px-6 py-3 border-b-2 font-medium text-sm ${
              activeTab === 'diagnoses'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Problem List
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">New Clinical Note</h3>
            <ClinicalNoteEditor patientId={id} />
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Clinical Notes History</h3>
            <div className="space-y-4">
              {notes?.notes.map((note: any) => (
                <div key={note.id} className="border-b pb-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{note.noteType}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(note.visitDate).toLocaleDateString()}
                    </span>
                  </div>
                  {note.noteType === 'soap' && (
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>S:</strong> {note.subjective}
                      </div>
                      <div>
                        <strong>O:</strong> {note.objective}
                      </div>
                      <div>
                        <strong>A:</strong> {note.assessment}
                      </div>
                      <div>
                        <strong>P:</strong> {note.plan}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'vitals' && (
        <div className="space-y-4">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Record Vital Signs</h3>
            <VitalSignsForm patientId={id} />
          </div>

          {vitalSigns && vitalSigns.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Vital Signs Trends</h3>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <VitalSignsChart data={vitalSigns} metric="temperature" />
                <VitalSignsChart data={vitalSigns} metric="heartRate" />
                <VitalSignsChart data={vitalSigns} metric="bloodPressure" />
                <VitalSignsChart data={vitalSigns} metric="oxygenSaturation" />
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'diagnoses' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Problem List</h3>
          <div className="space-y-2">
            {problemList?.map((diagnosis: any) => (
              <div key={diagnosis.id} className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{diagnosis.diagnosis}</div>
                  {diagnosis.icd10Code && (
                    <div className="text-sm text-gray-500">ICD-10: {diagnosis.icd10Code}</div>
                  )}
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  diagnosis.status === 'active' ? 'bg-red-100 text-red-800' :
                  diagnosis.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {diagnosis.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
