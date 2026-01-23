/**
 * Patient Detail Route
 */

import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '../../lib/api';

export const Route = createFileRoute('/patients/$id')({
  component: PatientDetail,
});

function PatientDetail() {
  const { id } = Route.useParams();

  const { data: patient, isLoading, error } = useQuery(
    orpc.patients.get({ id })
  );

  if (isLoading) {
    return <div>Loading patient...</div>;
  }

  if (error) {
    return <div>Error loading patient: {error.message}</div>;
  }

  if (!patient) {
    return <div>Patient not found</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          {patient.firstName} {patient.lastName}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Patient Number: {patient.patientNumber}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Demographics */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Demographics</h3>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
              <dd className="mt-1 text-sm text-gray-900">{patient.dateOfBirth}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Gender</dt>
              <dd className="mt-1 text-sm text-gray-900">{patient.gender}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Blood Type</dt>
              <dd className="mt-1 text-sm text-gray-900">{patient.bloodType || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="mt-1 text-sm text-gray-900">{patient.phone || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{patient.email || 'N/A'}</dd>
            </div>
          </dl>
        </div>

        {/* Medical Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Medical Information</h3>
          <div className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Allergies</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {patient.allergies && patient.allergies.length > 0
                  ? patient.allergies.join(', ')
                  : 'None'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Chronic Conditions</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {patient.chronicConditions && patient.chronicConditions.length > 0
                  ? patient.chronicConditions.join(', ')
                  : 'None'}
              </dd>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for EHR, Appointments, etc. */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <a
              href={`/patients/${id}/ehr`}
              className="px-6 py-3 border-b-2 border-blue-500 text-blue-600 font-medium text-sm"
            >
              EHR
            </a>
            <a
              href={`/patients/${id}/appointments`}
              className="px-6 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 text-sm"
            >
              Appointments
            </a>
            <a
              href={`/patients/${id}/prescriptions`}
              className="px-6 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 text-sm"
            >
              Prescriptions
            </a>
            <a
              href={`/patients/${id}/billing`}
              className="px-6 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 text-sm"
            >
              Billing
            </a>
            <a
              href={`/patients/${id}/lab`}
              className="px-6 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 text-sm"
            >
              Lab Results
            </a>
          </nav>
        </div>
      </div>
    </div>
  );
}
