/**
 * Patient Billing Route
 */

import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '../../../lib/api';
import { DataTable } from '../../../components/ui/data-table';

export const Route = createFileRoute('/patients/$id/billing')({
  component: PatientBilling,
});

function PatientBilling() {
  const { id } = Route.useParams();

  const { data: charges } = useQuery(
    orpc.billingHealthcare.listCharges({ patientId: id, limit: 100 })
  );

  const { data: invoices } = useQuery(
    orpc.billingHealthcare.listInvoices({ patientId: id, limit: 100 })
  );

  const { data: paymentsData } = useQuery(
    orpc.billingHealthcare.listPayments({ patientId: id, limit: 100 })
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Billing</h2>
        <p className="mt-1 text-sm text-gray-500">
          Patient billing and payment history
        </p>
      </div>

      {/* Charges */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Charges</h3>
        <DataTable
          data={charges?.charges || []}
          columns={[
            { key: 'chargeNumber', header: 'Charge #' },
            { key: 'serviceDate', header: 'Service Date' },
            { key: 'cptCode', header: 'CPT Code' },
            { key: 'netAmount', header: 'Amount', render: (row: any) => `$${row.netAmount}` },
            { key: 'status', header: 'Status' },
          ]}
        />
      </div>

      {/* Invoices */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Invoices</h3>
        <DataTable
          data={invoices?.invoices || []}
          columns={[
            { key: 'invoiceNumber', header: 'Invoice #' },
            { key: 'invoiceDate', header: 'Date' },
            { key: 'totalAmount', header: 'Total', render: (row: any) => `$${row.totalAmount}` },
            { key: 'balanceAmount', header: 'Balance', render: (row: any) => `$${row.balanceAmount}` },
            { key: 'status', header: 'Status' },
          ]}
        />
      </div>

      {/* Payments */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Payments</h3>
        <DataTable
          data={paymentsData?.payments || []}
          columns={[
            { key: 'paymentNumber', header: 'Payment #' },
            { key: 'paymentDate', header: 'Date' },
            { key: 'amount', header: 'Amount', render: (row: any) => `$${row.amount}` },
            { key: 'paymentMethod', header: 'Method' },
            { key: 'status', header: 'Status' },
          ]}
        />
      </div>
    </div>
  );
}
