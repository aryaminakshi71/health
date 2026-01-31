/**
 * Root Route Layout
 */

import { createRootRoute, Outlet, Link, useRouterState } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { PostHogProvider } from '../components/providers/posthog-provider';
import { queryClient } from '../lib/api';

export const Route = createRootRoute({
  component: () => {
    const isWellness = useRouterState({
      select: (state) => state.location.pathname.startsWith('/wellness'),
    });

    return (
      <PostHogProvider>
        <QueryClientProvider client={queryClient}>
          {isWellness ? (
            <Outlet />
          ) : (
            <div className="min-h-screen bg-gray-50">
              <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex flex-wrap items-center justify-between gap-4 py-4">
                    <div className="flex items-center">
                      <h1 className="text-xl font-bold text-gray-900">
                        Healthcare Management System
                      </h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-gray-600">
                      <Link to="/" className="hover:text-gray-900">
                        Dashboard
                      </Link>
                      <Link to="/modules" className="hover:text-gray-900">
                        Modules
                      </Link>
                      <Link to="/patients" className="hover:text-gray-900">
                        Patients
                      </Link>
                      <Link to="/appointments" className="hover:text-gray-900">
                        Appointments
                      </Link>
                      <Link to="/billing" className="hover:text-gray-900">
                        Billing
                      </Link>
                      <Link to="/wellness" className="text-primary hover:text-primary/80">
                        Wellness
                      </Link>
                    </div>
                  </div>
                </div>
              </nav>
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
              </main>
            </div>
          )}
        </QueryClientProvider>
      </PostHogProvider>
    );
  },
});
