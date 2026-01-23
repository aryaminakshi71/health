/**
 * Prescription Form Component
 */

import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Modal } from '../ui/modal';
import { orpc } from '../../lib/api';

export interface PrescriptionFormProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  appointmentId?: string;
}

export function PrescriptionForm({ isOpen, onClose, patientId, appointmentId }: PrescriptionFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    medicationId: '',
    dosage: '',
    frequency: '',
    quantity: 30,
    quantityUnit: 'tablets',
    daysSupply: 30,
    refills: 0,
    instructions: '',
    isEprescription: false,
  });

  const { data: medications } = useQuery(
    orpc.pharmacy.getMedicationCatalog({ limit: 100 })
  );

  const createMutation = useMutation({
    mutationFn: orpc.prescriptions.create.mutate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions', 'list'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      patientId,
      appointmentId,
      ...formData,
      medicationId: formData.medicationId,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New Prescription"
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
            Create Prescription
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Medication
          </label>
          <select
            value={formData.medicationId}
            onChange={(e) => setFormData({ ...formData, medicationId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            required
          >
            <option value="">Select medication...</option>
            {medications?.map((med: any) => (
              <option key={med.id} value={med.id}>
                {med.medicationName} {med.strength && `(${med.strength})`}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Dosage"
            value={formData.dosage}
            onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
            placeholder="e.g., 10mg"
            required
          />
          <Input
            label="Frequency"
            value={formData.frequency}
            onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
            placeholder="e.g., twice daily"
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit
            </label>
            <select
              value={formData.quantityUnit}
              onChange={(e) => setFormData({ ...formData, quantityUnit: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="tablets">Tablets</option>
              <option value="capsules">Capsules</option>
              <option value="ml">mL</option>
              <option value="units">Units</option>
            </select>
          </div>
          <Input
            label="Days Supply"
            type="number"
            value={formData.daysSupply}
            onChange={(e) => setFormData({ ...formData, daysSupply: parseInt(e.target.value) })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Refills"
            type="number"
            min="0"
            value={formData.refills}
            onChange={(e) => setFormData({ ...formData, refills: parseInt(e.target.value) })}
          />
          <div className="flex items-center">
            <input
              type="checkbox"
              id="eprescription"
              checked={formData.isEprescription}
              onChange={(e) => setFormData({ ...formData, isEprescription: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="eprescription" className="ml-2 block text-sm text-gray-900">
              E-Prescription
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Instructions
          </label>
          <textarea
            value={formData.instructions}
            onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            rows={3}
            placeholder="Additional instructions for the patient..."
          />
        </div>

        {createMutation.data?.warnings && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">Warnings</h4>
            {createMutation.data.warnings.drugInteractions && (
              <p className="text-sm text-yellow-700">Drug interactions detected</p>
            )}
            {createMutation.data.warnings.allergies && (
              <p className="text-sm text-yellow-700">Allergy warnings detected</p>
            )}
          </div>
        )}
      </form>
    </Modal>
  );
}
