/**
 * API Client Setup
 *
 * TanStack Query client for data fetching
 */

import { QueryClient } from '@tanstack/react-query';

// Create TanStack Query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
    },
  },
});

// Mock orpc for now until backend is connected
export const orpc = {
  analytics: {
    getDashboardMetrics: () => ({
      queryKey: ['analytics', 'dashboard'],
      queryFn: async () => ({
        totalPatients: 1250,
        totalAppointments: 89,
        totalRevenue: 125000,
        pendingBills: 23,
      }),
    }),
  },
  patients: {
    list: () => ({
      queryKey: ['patients', 'list'],
      queryFn: async () => [],
    }),
    get: ({ id }: { id: string }) => ({
      queryKey: ['patients', id],
      queryFn: async () => ({
        id,
        patientNumber: `P00${id}`,
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1985-03-15',
        gender: 'Male',
        bloodType: 'O+',
        phone: '555-0101',
        email: 'john.doe@example.com',
        allergies: ['Penicillin'],
        chronicConditions: ['Hypertension'],
      }),
    }),
    getById: (id: string) => ({
      queryKey: ['patients', id],
      queryFn: async () => null,
    }),
  },
  appointments: {
    list: () => ({
      queryKey: ['appointments', 'list'],
      queryFn: async () => [],
    }),
    getById: (id: string) => ({
      queryKey: ['appointments', id],
      queryFn: async () => null,
    }),
  },
};

// Helper to get auth headers
export function getAuthHeaders(): HeadersInit {
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
