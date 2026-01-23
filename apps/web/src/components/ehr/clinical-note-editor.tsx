/**
 * Clinical Note Editor Component
 */

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { orpc } from '../../lib/api';

export interface ClinicalNoteEditorProps {
  patientId: string;
  appointmentId?: string;
  onSave?: () => void;
}

export function ClinicalNoteEditor({ patientId, appointmentId, onSave }: ClinicalNoteEditorProps) {
  const queryClient = useQueryClient();
  const [noteData, setNoteData] = useState({
    noteType: 'soap' as 'progress' | 'soap' | 'discharge' | 'consultation' | 'procedure' | 'operative' | 'emergency',
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
    primaryDiagnosis: '',
    secondaryDiagnoses: [] as string[],
    icd10Codes: [] as string[],
  });

  const createMutation = useMutation({
    mutationFn: orpc.ehr.createNote.mutate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ehr', 'notes', patientId] });
      onSave?.();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      patientId,
      appointmentId,
      ...noteData,
      visitDate: new Date().toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Note Type
        </label>
        <select
          value={noteData.noteType}
          onChange={(e) => setNoteData({ ...noteData, noteType: e.target.value as any })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="soap">SOAP</option>
          <option value="progress">Progress Note</option>
          <option value="discharge">Discharge Summary</option>
          <option value="consultation">Consultation</option>
          <option value="procedure">Procedure Note</option>
          <option value="operative">Operative Note</option>
          <option value="emergency">Emergency Note</option>
        </select>
      </div>

      {noteData.noteType === 'soap' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subjective
            </label>
            <textarea
              value={noteData.subjective}
              onChange={(e) => setNoteData({ ...noteData, subjective: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={4}
              placeholder="Patient's description of symptoms..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Objective
            </label>
            <textarea
              value={noteData.objective}
              onChange={(e) => setNoteData({ ...noteData, objective: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={4}
              placeholder="Clinical observations, vital signs, exam findings..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assessment
            </label>
            <textarea
              value={noteData.assessment}
              onChange={(e) => setNoteData({ ...noteData, assessment: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={4}
              placeholder="Diagnosis, differential diagnosis..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan
            </label>
            <textarea
              value={noteData.plan}
              onChange={(e) => setNoteData({ ...noteData, plan: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={4}
              placeholder="Treatment plan, medications, follow-up..."
            />
          </div>
        </>
      )}

      <div>
        <Input
          label="Primary Diagnosis"
          value={noteData.primaryDiagnosis}
          onChange={(e) => setNoteData({ ...noteData, primaryDiagnosis: e.target.value })}
        />
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={createMutation.isPending}>
          Save Note
        </Button>
      </div>
    </form>
  );
}
