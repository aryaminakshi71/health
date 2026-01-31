/**
 * Patients List Route
 */

import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '../../lib/api';
import { useState } from 'react';
import { Button } from '../../components/ui/button';

export const Route = createFileRoute('/patients/')({
  component: PatientsList,
});

function PatientsList() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [showNewPatient, setShowNewPatient] = useState(false);
  const limit = 50;

  const { data, isLoading, error } = useQuery(
    orpc.patients.list({
      search,
      limit,
      offset: page * limit,
    })
  );

  if (isLoading) {
    return <div>Loading patients...</div>;
  }

  if (error) {
    return <div>Error loading patients: {error.message}</div>;
  }

  // Sample patients for demo
  const samplePatients = [
    { id: '1', patientNumber: 'P001', firstName: 'John', lastName: 'Doe', dateOfBirth: '1985-03-15', gender: 'Male', phone: '555-0101' },
    { id: '2', patientNumber: 'P002', firstName: 'Jane', lastName: 'Smith', dateOfBirth: '1990-07-22', gender: 'Female', phone: '555-0102' },
    { id: '3', patientNumber: 'P003', firstName: 'Robert', lastName: 'Johnson', dateOfBirth: '1978-11-08', gender: 'Male', phone: '555-0103' },
  ];

  const filteredPatients = samplePatients.filter(p =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Patients</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage patient records and information
          </p>
        </div>
        <Button onClick={() => setShowNewPatient(true)}>
          New Patient
        </Button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Search patients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DOB</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPatients.map((patient) => (
              <tr key={patient.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.patientNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.firstName} {patient.lastName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.dateOfBirth}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.gender}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Link to="/patients/$id" params={{ id: patient.id }} className="text-blue-600 hover:text-blue-900">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredPatients.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No patients found
          </div>
        )}
      </div>
    </div>
  );
}
