/**
 * Lab Results Route
 */

import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '../../lib/api';
import { DataTable } from '../../components/ui/data-table';

export const Route = createFileRoute('/lab/')({
  component: LabResults,
});

function LabResults() {
  const { data: orders } = useQuery(
    orpc.lab.listOrders({ limit: 50 })
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Laboratory</h2>
        <p className="mt-1 text-sm text-gray-500">
          Manage lab orders and view results
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Lab Orders</h3>
        <DataTable
          data={orders?.orders || []}
          columns={[
            { key: 'orderNumber', header: 'Order #' },
            { key: 'orderDate', header: 'Order Date' },
            { key: 'testName', header: 'Test' },
            { key: 'status', header: 'Status' },
            { key: 'priority', header: 'Priority' },
          ]}
        />
      </div>
    </div>
  );
}
