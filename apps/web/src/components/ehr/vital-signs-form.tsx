/**
 * Vital Signs Form Component
 */

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { orpc } from '../../lib/api';

export interface VitalSignsFormProps {
  patientId: string;
  appointmentId?: string;
  onSave?: () => void;
}

export function VitalSignsForm({ patientId, appointmentId, onSave }: VitalSignsFormProps) {
  const queryClient = useQueryClient();
  const [vitals, setVitals] = useState({
    temperature: '',
    temperatureUnit: 'C' as 'C' | 'F',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRate: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    height: '',
    weight: '',
    painScore: '',
  });

  const createMutation = useMutation({
    mutationFn: orpc.ehr.recordVitalSigns.mutate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ehr', 'vital-signs', patientId] });
      onSave?.();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      patientId,
      appointmentId,
      temperature: vitals.temperature ? parseFloat(vitals.temperature) : undefined,
      temperatureUnit: vitals.temperatureUnit,
      bloodPressureSystolic: vitals.bloodPressureSystolic ? parseInt(vitals.bloodPressureSystolic) : undefined,
      bloodPressureDiastolic: vitals.bloodPressureDiastolic ? parseInt(vitals.bloodPressureDiastolic) : undefined,
      heartRate: vitals.heartRate ? parseInt(vitals.heartRate) : undefined,
      respiratoryRate: vitals.respiratoryRate ? parseInt(vitals.respiratoryRate) : undefined,
      oxygenSaturation: vitals.oxygenSaturation ? parseFloat(vitals.oxygenSaturation) : undefined,
      height: vitals.height ? parseFloat(vitals.height) : undefined,
      weight: vitals.weight ? parseFloat(vitals.weight) : undefined,
      painScore: vitals.painScore ? parseInt(vitals.painScore) : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input
            label="Temperature"
            type="number"
            step="0.1"
            value={vitals.temperature}
            onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
          />
          <select
            value={vitals.temperatureUnit}
            onChange={(e) => setVitals({ ...vitals, temperatureUnit: e.target.value as 'C' | 'F' })}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="C">°C</option>
            <option value="F">°F</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Input
            label="BP Systolic"
            type="number"
            value={vitals.bloodPressureSystolic}
            onChange={(e) => setVitals({ ...vitals, bloodPressureSystolic: e.target.value })}
          />
          <Input
            label="BP Diastolic"
            type="number"
            value={vitals.bloodPressureDiastolic}
            onChange={(e) => setVitals({ ...vitals, bloodPressureDiastolic: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Heart Rate (bpm)"
          type="number"
          value={vitals.heartRate}
          onChange={(e) => setVitals({ ...vitals, heartRate: e.target.value })}
        />
        <Input
          label="Respiratory Rate"
          type="number"
          value={vitals.respiratoryRate}
          onChange={(e) => setVitals({ ...vitals, respiratoryRate: e.target.value })}
        />
        <Input
          label="O2 Saturation (%)"
          type="number"
          step="0.1"
          value={vitals.oxygenSaturation}
          onChange={(e) => setVitals({ ...vitals, oxygenSaturation: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Height (cm)"
          type="number"
          step="0.1"
          value={vitals.height}
          onChange={(e) => setVitals({ ...vitals, height: e.target.value })}
        />
        <Input
          label="Weight (kg)"
          type="number"
          step="0.1"
          value={vitals.weight}
          onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
        />
        <Input
          label="Pain Score (0-10)"
          type="number"
          min="0"
          max="10"
          value={vitals.painScore}
          onChange={(e) => setVitals({ ...vitals, painScore: e.target.value })}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" variant="primary" isLoading={createMutation.isPending}>
          Record Vital Signs
        </Button>
      </div>
    </form>
  );
}
