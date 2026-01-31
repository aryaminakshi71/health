/**
 * Billing Dashboard Route
 */

import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/billing/')({
  component: BillingDashboard,
});

function BillingDashboard() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  // Sample data for demo
  const analytics = {
    totalRevenue: 125000.00,
    totalCharges: 150000.00,
    totalPayments: 125000.00,
    outstandingBalance: 25000.00,
  };

  const charges = [
    { id: '1', chargeNumber: 'CHG-001', serviceDate: '2025-01-28', cptCode: '99213', netAmount: 150.00, status: 'Paid' },
    { id: '2', chargeNumber: 'CHG-002', serviceDate: '2025-01-29', cptCode: '99214', netAmount: 200.00, status: 'Pending' },
    { id: '3', chargeNumber: 'CHG-003', serviceDate: '2025-01-30', cptCode: '99215', netAmount: 250.00, status: 'Submitted' },
  ];

  const invoices = [
    { id: '1', invoiceNumber: 'INV-001', invoiceDate: '2025-01-25', totalAmount: 500.00, balanceAmount: 0, status: 'Paid' },
    { id: '2', invoiceNumber: 'INV-002', invoiceDate: '2025-01-28', totalAmount: 750.00, balanceAmount: 250.00, status: 'Partial' },
    { id: '3', invoiceNumber: 'INV-003', invoiceDate: '2025-01-30', totalAmount: 300.00, balanceAmount: 300.00, status: 'Pending' },
  ];

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
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Charge #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CPT Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {charges.map((charge) => (
              <tr key={charge.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{charge.chargeNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{charge.serviceDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{charge.cptCode}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${charge.netAmount.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{charge.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invoices Table */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Recent Invoices</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.invoiceNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.invoiceDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${invoice.totalAmount.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${invoice.balanceAmount.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
