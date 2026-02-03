/**
 * Root Route Layout
 */

import {
  HeadContent,
  Scripts,
  createRootRoute,
  Outlet,
  Link,
  useRouterState,
} from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { PostHogProvider } from '../components/providers/posthog-provider';
import { queryClient } from '../lib/api';
import { ErrorPage, NotFoundPage } from '../components/error';
import { generateOrganizationSchema, generateWebSiteSchema, getHealthOrganizationSchema } from '../lib/structured-data';
import { registerServiceWorker } from '../lib/service-worker';
import { useEffect } from 'react';

import stylesCss from '../styles.css?url';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Healthcare Management System - Complete Hospital & Clinic Management" },
      { name: "description", content: "Comprehensive healthcare management system for hospitals and clinics. Manage patients, appointments, EHR, billing, lab, pharmacy, and compliance all in one platform." },
      { name: "keywords", content: "healthcare management, hospital management, clinic management, EHR, electronic health records, patient management, medical billing" },
      { property: "og:title", content: "Healthcare Management System" },
      { property: "og:description", content: "Complete hospital and clinic management platform for patient care and operations." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "index, follow" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "dns-prefetch", href: "https://api.your-domain.com" },
      { rel: "stylesheet", href: stylesCss },
    ],
  }),
  component: RootDocument,
  errorComponent: ({ error }) => <ErrorPage error={error} />,
  notFoundComponent: () => <NotFoundPage />,
});

function RootDocument() {
  useEffect(() => {
    registerServiceWorker();
    // Add skip link for accessibility
    addSkipLink("main-content", "Skip to main content");
  }, []);

  const isWellness = useRouterState({
    select: (state) => state.location.pathname.startsWith('/wellness'),
  });

  const organizationSchema = generateOrganizationSchema(getHealthOrganizationSchema())
  const websiteSchema = generateWebSiteSchema({
    name: 'Healthcare Management System',
    url: import.meta.env.VITE_PUBLIC_SITE_URL || 'https://health.your-domain.com',
    description: 'Comprehensive healthcare management system for hospitals and clinics.',
  })

  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-blue-600 focus:text-white focus:rounded-br-lg"
        >
          Skip to main content
        </a>
        <PostHogProvider>
          <QueryClientProvider client={queryClient}>
            {isWellness ? (
              <main id="main-content" tabIndex={-1}>
                <Outlet />
              </main>
            ) : (
              <div className="min-h-screen bg-gray-50" id="main-content" tabIndex={-1}>
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
                <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <Outlet />
                </main>
              </div>
            )}
            <Scripts />
          </QueryClientProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
