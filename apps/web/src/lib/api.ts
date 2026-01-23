/**
 * oRPC Client Setup
 * 
 * Type-safe API client with TanStack Query integration
 */

import { createORPCClient } from '@orpc/client';
import { createORPCQueryClient } from '@orpc/tanstack-query';
import type { AppRouter } from '@healthcare-saas/api';

// Create oRPC client
export const orpcClient = createORPCClient<AppRouter>({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create TanStack Query client with oRPC integration
export const queryClient = createORPCQueryClient(orpcClient);

// Export hooks for use in components
export const orpc = queryClient;

// Helper to get auth headers
export function getAuthHeaders(): HeadersInit {
  // Get token from Better Auth session
  // This will be set by Better Auth client
  const token = typeof window !== 'undefined' 
    ? document.cookie
        .split('; ')
        .find(row => row.startsWith('better-auth.session_token='))
        ?.split('=')[1]
    : null;

  return {
    'Authorization': token ? `Bearer ${token}` : '',
  };
}
