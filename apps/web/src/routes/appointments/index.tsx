/**
 * Appointments List Route
 */

import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '../../components/ui/button';

export const Route = createFileRoute('/appointments/')({
  component: AppointmentsList,
});

function AppointmentsList() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<string | undefined>();

  // Sample appointments for demo
  const sampleAppointments = [
    { id: '1', scheduledAt: '2025-01-30T09:00:00', patient: { firstName: 'John', lastName: 'Doe' }, provider: { name: 'Dr. Smith' }, appointmentType: 'Check-up', status: 'scheduled' },
    { id: '2', scheduledAt: '2025-01-30T10:30:00', patient: { firstName: 'Jane', lastName: 'Smith' }, provider: { name: 'Dr. Johnson' }, appointmentType: 'Follow-up', status: 'confirmed' },
    { id: '3', scheduledAt: '2025-01-30T14:00:00', patient: { firstName: 'Robert', lastName: 'Johnson' }, provider: { name: 'Dr. Williams' }, appointmentType: 'Consultation', status: 'completed' },
  ];

  const filteredAppointments = status
    ? sampleAppointments.filter(a => a.status === status)
    : sampleAppointments;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Appointments</h2>
          <p className="mt-1 text-sm text-gray-500">
            Schedule and manage appointments
          </p>
        </div>
        <Button>
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
              {filteredAppointments.map((appointment) => (
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
                    <Link
                      to="/appointments/$id"
                      params={{ id: appointment.id }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </Link>
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
