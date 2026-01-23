/**
 * Dashboard Metrics Component
 */

import { useQuery } from '@tanstack/react-query';
import { orpc } from '../../lib/api';

export function DashboardMetrics() {
  // These would use actual dashboard endpoints when implemented
  const { data: patients } = useQuery(
    orpc.patients.list({ limit: 1 })
  );

  const { data: appointments } = useQuery(
    orpc.appointments.list({ limit: 1 })
  );

  const metrics = [
    {
      name: 'Total Patients',
      value: patients?.total || 0,
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      name: "Today's Appointments",
      value: appointments?.total || 0,
      change: '+5%',
      changeType: 'positive' as const,
    },
    {
      name: 'Pending Lab Results',
      value: 0, // Would come from lab router
      change: '-3%',
      changeType: 'negative' as const,
    },
    {
      name: 'Revenue (This Month)',
      value: '$0', // Would come from billing router
      change: '+8%',
      changeType: 'positive' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <div key={metric.name} className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {metric.name}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className={`text-sm font-semibold ${
                      metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.change}
                    </div>
                    <div className="ml-2 text-sm text-gray-500">from last month</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
