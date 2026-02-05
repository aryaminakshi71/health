/**
 * API Client Setup
 *
 * TanStack Query client for data fetching
 */

import { QueryClient, useMutation } from '@tanstack/react-query';

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
const mockQuery = <T>(queryKey: unknown[], data: T) => ({
  queryKey,
  queryFn: async () => data,
});

const mockAppointment = (id: string) => ({
  id,
  appointmentNumber: `A-${id}`,
  scheduledAt: new Date().toISOString(),
  status: 'scheduled',
  duration: 30,
  appointmentType: 'consultation',
  isTelemedicine: false,
  patient: { firstName: 'John', lastName: 'Doe' },
  provider: { name: 'Dr. Smith' },
  reason: 'Routine checkup',
});

const mockPatient = (id: string) => ({
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
});

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
    getAppointmentTrends: (params: { startDate: string; endDate: string }) =>
      mockQuery(['analytics', 'appointmentTrends', params], { trends: [] }),
    getRevenueAnalytics: (params: { startDate: string; endDate: string }) =>
      mockQuery(['analytics', 'revenue', params], {
        totalRevenue: 0,
        totalCharges: 0,
        totalPayments: 0,
        outstandingBalance: 0,
      }),
  },
  patients: {
    list: (params?: { limit?: number }) =>
      mockQuery(['patients', 'list', params], []),
    get: ({ id }: { id: string }) =>
      mockQuery(['patients', 'get', id], mockPatient(id)),
    getById: (id: string) =>
      mockQuery(['patients', 'getById', id], null),
    create: {
      mutate: async (input?: unknown) => ({ ...mockPatient('new'), ...(input as object) }),
    },
    update: {
      mutate: async (input?: unknown) => ({ ...(input as object) }),
    },
  },
  appointments: {
    list: (params?: { patientId?: string; limit?: number }) =>
      mockQuery(['appointments', 'list', params], []),
    get: ({ id }: { id: string }) =>
      mockQuery(['appointments', 'get', id], mockAppointment(id)),
    getById: (id: string) =>
      mockQuery(['appointments', 'getById', id], null),
    create: {
      mutate: async (input?: unknown) => ({ ...mockAppointment('new'), ...(input as object) }),
    },
    checkIn: {
      mutate: async () => ({ success: true }),
    },
    cancel: {
      mutate: async () => ({ success: true }),
    },
  },
  compliance: {
    getAuditLogs: (params?: { limit?: number }) =>
      mockQuery(['compliance', 'auditLogs', params], { logs: [] }),
    getBreachIncidents: (params?: { limit?: number }) =>
      mockQuery(['compliance', 'breaches', params], []),
  },
  lab: {
    listOrders: (params?: { limit?: number }) =>
      mockQuery(['lab', 'orders', params], []),
    getPatientResults: (params?: { patientId?: string; testCode?: string; limit?: number }) =>
      mockQuery(['lab', 'results', params], []),
  },
  billingHealthcare: {
    listCharges: (params?: { patientId?: string; limit?: number }) =>
      mockQuery(['billing', 'charges', params], []),
    listInvoices: (params?: { patientId?: string; limit?: number }) =>
      mockQuery(['billing', 'invoices', params], []),
    listPayments: (params?: { patientId?: string; limit?: number }) =>
      mockQuery(['billing', 'payments', params], []),
    createCharge: {
      mutate: async (input?: unknown) => ({ ...(input as object) }),
    },
  },
  prescriptions: {
    list: (params?: { patientId?: string }) =>
      mockQuery(['prescriptions', 'list', params], []),
    create: {
      mutate: async (input?: unknown) => ({ ...(input as object) }),
    },
  },
  ehr: {
    listNotes: (params?: { patientId?: string }) =>
      mockQuery(['ehr', 'notes', params], []),
    getVitalSignsHistory: (params?: { patientId?: string }) =>
      mockQuery(['ehr', 'vitals', params], []),
    getProblemList: (params?: { patientId?: string }) =>
      mockQuery(['ehr', 'problems', params], []),
    createNote: {
      mutate: async (input?: unknown) => ({ ...(input as object) }),
    },
    recordVitalSigns: {
      mutate: async (input?: unknown) => ({ ...(input as object) }),
    },
  },
  telemedicine: {
    getRoomStatus: (params?: { appointmentId?: string }) =>
      mockQuery(['telemedicine', 'status', params], { status: 'offline' }),
    createRoom: {
      mutate: async (input?: unknown) => ({ roomId: 'room-1', ...(input as object) }),
    },
  },
  pharmacy: {
    getMedicationCatalog: (params?: { limit?: number }) =>
      mockQuery(['pharmacy', 'catalog', params], []),
  },
  files: {
    upload: {
      useMutation: (options?: Parameters<typeof useMutation>[0]) =>
        useMutation({
          mutationFn: async () => ({ success: true }),
          ...options,
        }),
    },
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
