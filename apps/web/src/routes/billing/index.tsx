/**
 * Billing Dashboard Route
 */

import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '../../lib/api';
import { DataTable } from '../../components/ui/data-table';
import { useState } from 'react';

export const Route = createFileRoute('/billing/')({
  component: BillingDashboard,
});

function BillingDashboard() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const { data: charges } = useQuery(
    orpc.billingHealthcare.listCharges({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      limit: 100,
    })
  );

  const { data: invoices } = useQuery(
    orpc.billingHealthcare.listInvoices({
      limit: 50,
    })
  );

  const { data: analytics } = useQuery(
    orpc.analytics.getRevenueAnalytics({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Billing & Revenue</h2>
        <p className="mt-1 text-sm text-gray-500">
          Manage charges, invoices, and payments
        </p>
      </div>

      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="text-2xl font-bold text-gray-900">
              ${analytics?.totalRevenue.toFixed(2) || '0.00'}
            </div>
            <div className="text-sm font-medium text-gray-500">Total Revenue</div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="text-2xl font-bold text-gray-900">
              ${analytics?.totalCharges.toFixed(2) || '0.00'}
            </div>
            <div className="text-sm font-medium text-gray-500">Total Charges</div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="text-2xl font-bold text-gray-900">
              ${analytics?.totalPayments.toFixed(2) || '0.00'}
            </div>
            <div className="text-sm font-medium text-gray-500">Total Payments</div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="text-2xl font-bold text-gray-900">
              ${analytics?.outstandingBalance.toFixed(2) || '0.00'}
            </div>
            <div className="text-sm font-medium text-gray-500">Outstanding Balance</div>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex gap-4">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          />
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* Charges Table */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Recent Charges</h3>
        <DataTable
          data={charges?.charges || []}
          columns={[
            { key: 'chargeNumber', header: 'Charge #' },
            { key: 'serviceDate', header: 'Service Date' },
            { key: 'cptCode', header: 'CPT Code' },
            { key: 'netAmount', header: 'Amount', render: (row) => `$${row.netAmount}` },
            { key: 'status', header: 'Status' },
          ]}
        />
      </div>

      {/* Invoices Table */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Recent Invoices</h3>
        <DataTable
          data={invoices?.invoices || []}
          columns={[
            { key: 'invoiceNumber', header: 'Invoice #' },
            { key: 'invoiceDate', header: 'Date' },
            { key: 'totalAmount', header: 'Total', render: (row) => `$${row.totalAmount}` },
            { key: 'balanceAmount', header: 'Balance', render: (row) => `$${row.balanceAmount}` },
            { key: 'status', header: 'Status' },
          ]}
        />
      </div>
    </div>
  );
}
