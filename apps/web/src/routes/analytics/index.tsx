/**
 * Analytics Dashboard Route
 */

import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '../../lib/api';
import { DashboardMetrics } from '../../components/analytics/dashboard-metrics';

export const Route = createFileRoute('/analytics/')({
  component: AnalyticsDashboard,
});

function AnalyticsDashboard() {
  const { data: metrics } = useQuery(
    orpc.analytics.getDashboardMetrics()
  );

  const { data: trends } = useQuery(
    orpc.analytics.getAppointmentTrends({
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    })
  );

  const { data: revenue } = useQuery(
    orpc.analytics.getRevenueAnalytics({
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analytics & Reporting</h2>
        <p className="mt-1 text-sm text-gray-500">
          Comprehensive analytics and insights
        </p>
      </div>

      <DashboardMetrics />

      {/* Revenue Analytics */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Revenue Analytics</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="text-sm text-gray-500">Total Revenue</div>
            <div className="text-2xl font-bold">${revenue?.totalRevenue.toFixed(2) || '0.00'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Total Charges</div>
            <div className="text-2xl font-bold">${revenue?.totalCharges.toFixed(2) || '0.00'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Total Payments</div>
            <div className="text-2xl font-bold">${revenue?.totalPayments.toFixed(2) || '0.00'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Outstanding Balance</div>
            <div className="text-2xl font-bold">${revenue?.outstandingBalance.toFixed(2) || '0.00'}</div>
          </div>
        </div>
      </div>

      {/* Appointment Trends */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Appointment Trends</h3>
        <div className="h-64 flex items-end justify-between gap-2">
          {trends?.trends.map((trend: any, index: number) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-blue-500 rounded-t"
                style={{ height: `${(trend.completed / (trend.scheduled || 1)) * 100}%` }}
              />
              <span className="text-xs text-gray-500 mt-1">{trend.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
