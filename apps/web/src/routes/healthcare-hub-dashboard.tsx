/**
 * Healthcare Hub Dashboard (Migrated)
 * 
 * This is an example of migrating a dashboard from healthcare-hub
 * to the unified frontend. This route demonstrates the integration.
 */

import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '../lib/api';
import { DashboardMetrics } from '../components/analytics/dashboard-metrics';
import { Button } from '../components/ui/button';

export const Route = createFileRoute('/healthcare-hub-dashboard')({
  component: HealthcareHubDashboard,
});

function HealthcareHubDashboard() {
  const { data: metrics, isLoading } = useQuery(
    orpc.analytics.getDashboardMetrics()
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Healthcare Hub Dashboard</h2>
          <p className="mt-1 text-sm text-gray-500">
            Migrated from healthcare-hub/frontend
          </p>
        </div>
        <Button variant="primary">
          New Action
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <DashboardMetrics />
      )}

      {/* Additional dashboard content from healthcare-hub can be added here */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Integration Status</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <span className="text-green-600 mr-2">✅</span>
            <span>Using shared UI components from @healthcare-saas/ui</span>
          </div>
          <div className="flex items-center">
            <span className="text-green-600 mr-2">✅</span>
            <span>Using oRPC for type-safe API calls</span>
          </div>
          <div className="flex items-center">
            <span className="text-green-600 mr-2">✅</span>
            <span>Integrated with unified frontend</span>
          </div>
        </div>
      </div>
    </div>
  );
}
