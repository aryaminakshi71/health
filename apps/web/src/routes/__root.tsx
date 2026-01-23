/**
 * Root Route Layout
 */

import { createRootRoute, Outlet } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { PostHogProvider } from '../components/providers/posthog-provider';
import { queryClient } from '../lib/api';

export const Route = createRootRoute({
  component: () => (
    <PostHogProvider>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <h1 className="text-xl font-bold text-gray-900">
                    Healthcare Management System
                  </h1>
                </div>
                <div className="flex items-center space-x-4">
                  {/* Navigation items will go here */}
                </div>
              </div>
            </div>
          </nav>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </main>
        </div>
      </QueryClientProvider>
    </PostHogProvider>
  ),
});
