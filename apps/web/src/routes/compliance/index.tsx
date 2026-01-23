/**
 * Compliance Dashboard Route
 */

import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '../../lib/api';
import { DataTable } from '../../components/ui/data-table';

export const Route = createFileRoute('/compliance/')({
  component: ComplianceDashboard,
});

function ComplianceDashboard() {
  const { data: auditLogs } = useQuery(
    orpc.compliance.getAuditLogs({ limit: 100 })
  );

  const { data: breaches } = useQuery(
    orpc.compliance.getBreachIncidents({ limit: 50 })
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Compliance & Audit</h2>
        <p className="mt-1 text-sm text-gray-500">
          Monitor compliance and audit logs
        </p>
      </div>

      {/* Audit Logs */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Recent Audit Logs</h3>
        <DataTable
          data={auditLogs?.logs || []}
          columns={[
            { key: 'timestamp', header: 'Timestamp', render: (row: any) => new Date(row.timestamp).toLocaleString() },
            { key: 'action', header: 'Action' },
            { key: 'resourceType', header: 'Resource Type' },
            { key: 'phiAccessed', header: 'PHI Accessed', render: (row: any) => row.phiAccessed ? 'Yes' : 'No' },
            { key: 'hipaaCompliant', header: 'HIPAA', render: (row: any) => row.hipaaCompliant ? '✓' : '-' },
            { key: 'gdprCompliant', header: 'GDPR', render: (row: any) => row.gdprCompliant ? '✓' : '-' },
          ]}
        />
      </div>

      {/* Breach Incidents */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Breach Incidents</h3>
        <DataTable
          data={breaches || []}
          columns={[
            { key: 'incidentNumber', header: 'Incident #' },
            { key: 'detectedAt', header: 'Detected', render: (row: any) => new Date(row.detectedAt).toLocaleDateString() },
            { key: 'incidentType', header: 'Type' },
            { key: 'severity', header: 'Severity' },
            { key: 'status', header: 'Status' },
            { key: 'affectedPatients', header: 'Affected Patients' },
          ]}
        />
      </div>
    </div>
  );
}
