/**
 * Appointment Form Component
 */

import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Modal } from '../ui/modal';
import { orpc } from '../../lib/api';

export interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  patientId?: string;
}

export function AppointmentForm({ isOpen, onClose, patientId }: AppointmentFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    patientId: patientId || '',
    providerId: '',
    scheduledAt: '',
    appointmentType: 'consultation' as 'consultation' | 'follow_up' | 'procedure' | 'emergency' | 'telemedicine',
    duration: 30,
    reason: '',
    isTelemedicine: false,
  });

  const { data: patients } = useQuery(
    orpc.patients.list({ limit: 100 })
  );

  const createMutation = useMutation({
    mutationFn: orpc.appointments.create.mutate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', 'list'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      scheduledAt: new Date(formData.scheduledAt).toISOString(),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New Appointment"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={createMutation.isPending}
          >
            Schedule Appointment
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {!patientId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient
            </label>
            <select
              value={formData.patientId}
              onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            >
              <option value="">Select patient...</option>
              {patients?.patients.map((patient: any) => (
                <option key={patient.id} value={patient.id}>
                  {patient.firstName} {patient.lastName} ({patient.patientNumber})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Date & Time"
            type="datetime-local"
            value={formData.scheduledAt}
            onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
            required
          />
          <Input
            label="Duration (minutes)"
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Appointment Type
          </label>
          <select
            value={formData.appointmentType}
            onChange={(e) => setFormData({ ...formData, appointmentType: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="consultation">Consultation</option>
            <option value="follow_up">Follow-up</option>
            <option value="procedure">Procedure</option>
            <option value="emergency">Emergency</option>
            <option value="telemedicine">Telemedicine</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason for Visit
          </label>
          <textarea
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            rows={3}
            placeholder="Brief description of the reason for the appointment..."
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="telemedicine"
            checked={formData.isTelemedicine}
            onChange={(e) => setFormData({ ...formData, isTelemedicine: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="telemedicine" className="ml-2 block text-sm text-gray-900">
            Telemedicine Appointment
          </label>
        </div>
      </form>
    </Modal>
  );
}
