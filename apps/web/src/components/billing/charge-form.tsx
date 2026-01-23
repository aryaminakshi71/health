/**
 * Charge Form Component
 */

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Modal } from '../ui/modal';
import { orpc } from '../../lib/api';

export interface ChargeFormProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  appointmentId?: string;
}

export function ChargeForm({ isOpen, onClose, patientId, appointmentId }: ChargeFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    serviceDate: new Date().toISOString().split('T')[0],
    cptCode: '',
    cptDescription: '',
    icd10Codes: [] as string[],
    unitPrice: '',
    quantity: 1,
    discountAmount: '0',
    adjustmentAmount: '0',
  });

  const createMutation = useMutation({
    mutationFn: orpc.billingHealthcare.createCharge.mutate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billingHealthcare', 'listCharges'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      patientId,
      appointmentId,
      ...formData,
      unitPrice: parseFloat(formData.unitPrice),
      quantity: formData.quantity,
      discountAmount: parseFloat(formData.discountAmount),
      adjustmentAmount: parseFloat(formData.adjustmentAmount),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New Charge"
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
            Create Charge
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Service Date"
          type="date"
          value={formData.serviceDate}
          onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="CPT Code"
            value={formData.cptCode}
            onChange={(e) => setFormData({ ...formData, cptCode: e.target.value })}
            placeholder="e.g., 99213"
          />
          <Input
            label="CPT Description"
            value={formData.cptDescription}
            onChange={(e) => setFormData({ ...formData, cptDescription: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Unit Price"
            type="number"
            step="0.01"
            value={formData.unitPrice}
            onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
            required
          />
          <Input
            label="Quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Discount Amount"
            type="number"
            step="0.01"
            value={formData.discountAmount}
            onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
          />
          <Input
            label="Adjustment Amount"
            type="number"
            step="0.01"
            value={formData.adjustmentAmount}
            onChange={(e) => setFormData({ ...formData, adjustmentAmount: e.target.value })}
          />
        </div>
      </form>
    </Modal>
  );
}
