/**
 * Patient Prescriptions Route
 */

import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '../../../lib/api';
import { PrescriptionForm } from '../../../components/prescriptions/prescription-form';
import { DataTable } from '../../../components/ui/data-table';
import { Button } from '../../../components/ui/button';
import { useState } from 'react';

export const Route = createFileRoute('/patients/$id/prescriptions')({
  component: PatientPrescriptions,
});

function PatientPrescriptions() {
  const { id } = Route.useParams();
  const [showNewPrescription, setShowNewPrescription] = useState(false);

  const { data: prescriptions, isLoading } = useQuery(
    orpc.prescriptions.list({ patientId: id })
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Prescriptions</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage patient prescriptions
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowNewPrescription(true)}
        >
          New Prescription
        </Button>
      </div>

      <PrescriptionForm
        isOpen={showNewPrescription}
        onClose={() => setShowNewPrescription(false)}
        patientId={id}
      />

      <div className="bg-white shadow rounded-lg p-6">
        <DataTable
          data={prescriptions?.prescriptions || []}
          columns={[
            { key: 'prescriptionNumber', header: 'Prescription #' },
            { key: 'medicationName', header: 'Medication' },
            { key: 'dosage', header: 'Dosage' },
            { key: 'frequency', header: 'Frequency' },
            { key: 'quantity', header: 'Quantity' },
            { key: 'refillsRemaining', header: 'Refills' },
            { key: 'status', header: 'Status' },
          ]}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
