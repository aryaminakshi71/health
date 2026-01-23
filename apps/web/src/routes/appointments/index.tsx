/**
 * Appointments List Route
 */

import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '../../lib/api';
import { AppointmentForm } from '../../components/appointments/appointment-form';
import { DataTable } from '../../components/ui/data-table';
import { Button } from '../../components/ui/button';
import { useState } from 'react';

export const Route = createFileRoute('/appointments/')({
  component: AppointmentsList,
});

function AppointmentsList() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<string | undefined>();

  const { data, isLoading, error } = useQuery(
    orpc.appointments.list({
      startDate: date,
      endDate: date,
      status: status as any,
      limit: 100,
    })
  );

  if (isLoading) {
    return <div>Loading appointments...</div>;
  }

  if (error) {
    return <div>Error loading appointments: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Appointments</h2>
          <p className="mt-1 text-sm text-gray-500">
            Schedule and manage appointments
          </p>
        </div>
        <AppointmentForm
          isOpen={showNewAppointment}
          onClose={() => setShowNewAppointment(false)}
        />
        <Button
          variant="primary"
          onClick={() => setShowNewAppointment(true)}
        >
          New Appointment
        </Button>
      </div>

      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex gap-4 mb-4">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          />
          <select
            value={status || ''}
            onChange={(e) => setStatus(e.target.value || undefined)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="confirmed">Confirmed</option>
            <option value="checked_in">Checked In</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.appointments.map((appointment: any) => (
                <tr key={appointment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(appointment.scheduledAt).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {appointment.patient?.firstName} {appointment.patient?.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {appointment.provider?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {appointment.appointmentType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      appointment.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <a
                      href={`/appointments/${appointment.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
