/**
 * Patient Appointments Route
 */

import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '../../../lib/api';
import { DataTable } from '../../../components/ui/data-table';

export const Route = createFileRoute('/patients/$id/appointments')({
  component: PatientAppointments,
});

function PatientAppointments() {
  const { id } = Route.useParams();

  const { data: appointments, isLoading } = useQuery(
    orpc.appointments.list({ patientId: id, limit: 100 })
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Appointments</h2>
        <p className="mt-1 text-sm text-gray-500">
          Patient appointment history
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <DataTable
          data={appointments?.appointments || []}
          columns={[
            {
              key: 'scheduledAt',
              header: 'Date & Time',
              render: (row: any) => new Date(row.scheduledAt).toLocaleString(),
            },
            { key: 'appointmentType', header: 'Type' },
            { key: 'reason', header: 'Reason' },
            { key: 'status', header: 'Status' },
          ]}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
