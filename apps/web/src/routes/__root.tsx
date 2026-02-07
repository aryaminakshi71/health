import {
  HeadContent,
  Scripts,
  Outlet,
  createRootRoute,
} from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/api';
import '../styles.css';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Health - Healthcare Management System' },
      {
        name: 'description',
        content:
          'Healthcare management platform for patients, appointments, billing, and clinical operations.',
      },
    ],
  }),
  component: RootDocument,
  errorComponent: ({ error }: { error: any }) => (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold text-red-600">Something went wrong</h1>
      <pre className="mt-4 p-4 bg-gray-100 rounded overflow-auto max-w-full">
        {error?.message || 'Unknown error'}
      </pre>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Retry
      </button>
    </div>
  ),
  notFoundComponent: () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold text-gray-900">404 - Not Found</h1>
      <p className="mt-2 text-gray-600">The page you are looking for does not exist.</p>
      <a href="/" className="mt-4 text-blue-600 hover:underline">
        Go back home
      </a>
    </div>
  ),
});

function RootDocument() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="antialiased min-h-screen bg-background">
        <QueryClientProvider client={queryClient}>
          <div className="min-h-screen">
            <Outlet />
          </div>
          <Scripts />
        </QueryClientProvider>
      </body>
    </html>
  );
}
