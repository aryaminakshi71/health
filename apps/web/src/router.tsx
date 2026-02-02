/**
 * TanStack Router Configuration
 */

import type { QueryClient } from '@tanstack/react-query';
import { createRouter as createTanStackRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { queryClient } from './lib/api';

export function createRouter(queryClient: QueryClient) {
  return createTanStackRouter({
    routeTree,
    defaultPreload: 'intent',
    context: {
      queryClient,
    },
  });
}

// TanStack Start expects getRouter export
export function getRouter() {
  return createRouter(queryClient);
}

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
