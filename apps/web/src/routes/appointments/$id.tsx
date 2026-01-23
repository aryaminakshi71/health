/**
 * Appointment Detail Route
 */

import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { useState } from 'react';

export const Route = createFileRoute('/appointments/$id')({
  component: AppointmentDetail,
});

function AppointmentDetail() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const [showTelemedicine, setShowTelemedicine] = useState(false);

  const { data: appointment, isLoading } = useQuery(
    orpc.appointments.get({ id })
  );

  const checkInMutation = useMutation({
    mutationFn: orpc.appointments.checkIn.mutate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', 'get', id] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: orpc.appointments.cancel.mutate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', 'get', id] });
    },
  });

  if (isLoading) {
    return <div>Loading appointment...</div>;
  }

  if (!appointment) {
    return <div>Appointment not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Appointment {appointment.appointmentNumber}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {new Date(appointment.scheduledAt).toLocaleString()}
          </p>
        </div>
        <div className="flex space-x-2">
          {appointment.status === 'scheduled' && (
            <Button
              variant="primary"
              onClick={() => checkInMutation.mutate({ id })}
              isLoading={checkInMutation.isPending}
            >
              Check In
            </Button>
          )}
          {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
            <Button
              variant="danger"
              onClick={() => cancelMutation.mutate({ id, reason: 'Cancelled by staff' })}
              isLoading={cancelMutation.isPending}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Appointment Details */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Appointment Details</h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Patient</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {appointment.patient?.firstName} {appointment.patient?.lastName}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Provider</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {appointment.provider?.name}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Type</dt>
              <dd className="mt-1 text-sm text-gray-900 capitalize">
                {appointment.appointmentType}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                  appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  appointment.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {appointment.status}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Duration</dt>
              <dd className="mt-1 text-sm text-gray-900">{appointment.duration} minutes</dd>
            </div>
            {appointment.reason && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Reason</dt>
                <dd className="mt-1 text-sm text-gray-900">{appointment.reason}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Telemedicine */}
        {appointment.isTelemedicine && (
          <VideoRoom appointmentId={appointment.id} />
        )}
      </div>
    </div>
  );
}
