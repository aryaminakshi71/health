/**
 * Home/Dashboard Route
 */

import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '../lib/api';
import { DashboardMetrics } from '../components/analytics/dashboard-metrics';

export const Route = createFileRoute('/')({
  component: Dashboard,
});

function Dashboard() {
  const { data: metrics, isLoading } = useQuery(
    orpc.analytics.getDashboardMetrics()
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your healthcare organization
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <DashboardMetrics />
      )}

      {/* Additional dashboard sections */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Appointments */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Recent Appointments</h3>
          <div className="text-sm text-gray-500">
            View all appointments in the appointments section
          </div>
        </div>

        {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <a
                href="/modules"
                className="block px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                View Modules
              </a>
              <a
                href="/patients"
                className="block px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
              >
                Add New Patient
              </a>
            <a
              href="/appointments"
              className="block px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
            >
              Schedule Appointment
            </a>
            <a
              href="/billing"
              className="block px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100"
            >
              View Billing
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
