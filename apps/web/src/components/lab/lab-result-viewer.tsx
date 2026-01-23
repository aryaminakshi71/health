/**
 * Lab Result Viewer Component
 */

import { useQuery } from '@tanstack/react-query';
import { orpc } from '../../lib/api';
import { DataTable } from '../ui/data-table';

export interface LabResultViewerProps {
  patientId: string;
  testCode?: string;
}

export function LabResultViewer({ patientId, testCode }: LabResultViewerProps) {
  const { data: results, isLoading } = useQuery(
    orpc.lab.getPatientResults({ patientId, testCode, limit: 100 })
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Lab Results</h3>
      <DataTable
        data={results || []}
        columns={[
          { key: 'resultDate', header: 'Date', render: (row: any) => new Date(row.resultDate).toLocaleDateString() },
          { key: 'testName', header: 'Test' },
          { key: 'value', header: 'Value' },
          { key: 'unit', header: 'Unit' },
          { key: 'referenceRange', header: 'Reference Range' },
          {
            key: 'abnormalFlag',
            header: 'Flag',
            render: (row: any) => (
              <span className={`px-2 py-1 text-xs font-medium rounded ${
                row.abnormalFlag === 'H' ? 'bg-red-100 text-red-800' :
                row.abnormalFlag === 'L' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {row.abnormalFlag || 'N'}
              </span>
            ),
          },
          {
            key: 'criticalValue',
            header: 'Critical',
            render: (row: any) => (
              <span className={`px-2 py-1 text-xs font-medium rounded ${
                row.criticalValue === 'critical' || row.criticalValue === 'panic'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {row.criticalValue}
              </span>
            ),
          },
        ]}
        isLoading={isLoading}
      />
    </div>
  );
}
