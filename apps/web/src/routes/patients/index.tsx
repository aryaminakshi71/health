/**
 * Patients List Route
 */

import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '../../lib/api';
import { useState } from 'react';

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Patients</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage patient records and information
          </p>
        </div>
        <PatientForm
          isOpen={showNewPatient}
          onClose={() => setShowNewPatient(false)}
        />
        <Button
          variant="primary"
          onClick={() => setShowNewPatient(true)}
        >
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

        <DataTable
          data={data?.patients || []}
          columns={[
            { key: 'patientNumber', header: 'Patient Number' },
            { 
              key: 'name', 
              header: 'Name',
              render: (row: any) => `${row.firstName} ${row.lastName}`
            },
            { key: 'dateOfBirth', header: 'Date of Birth' },
            { key: 'gender', header: 'Gender' },
            { key: 'phone', header: 'Phone' },
            {
              key: 'actions',
              header: 'Actions',
              render: (row: any) => (
                <a
                  href={`/patients/${row.id}`}
                  className="text-blue-600 hover:text-blue-900"
                >
                  View
                </a>
              ),
            },
          ]}
          onRowClick={(row: any) => {
            window.location.href = `/patients/${row.id}`;
          }}
          isLoading={isLoading}
        />

        {data && data.total > limit && (
          <div className="p-4 border-t flex justify-between">
            <div className="text-sm text-gray-500">
              Showing {page * limit + 1} to {Math.min((page + 1) * limit, data.total)} of {data.total}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={(page + 1) * limit >= data.total}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
