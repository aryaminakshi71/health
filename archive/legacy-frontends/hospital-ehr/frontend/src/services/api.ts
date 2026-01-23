import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// ============ CONFIGURATION ============
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// ============ TYPES ============
export interface User {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'DOCTOR' | 'NURSE' | 'RECEPTIONIST' | 'PHARMACIST' | 'LAB_TECH';
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    name: string;
    role?: User['role'];
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface Patient {
    id: string;
    mrn: string;
    firstName: string;
    lastName?: string;
    dateOfBirth: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    phone: string;
    email?: string;
    address?: string;
    city?: string;
    bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePatientData {
    firstName: string;
    lastName?: string;
    dateOfBirth: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    phone: string;
    email?: string;
    address?: string;
    city?: string;
    bloodGroup?: Patient['bloodGroup'];
    emergencyContactName?: string;
    emergencyContactPhone?: string;
}

export interface Visit {
    id: string;
    patientId: string;
    doctorId?: string;
    visitType: 'OPD' | 'IPD' | 'EMERGENCY';
    department?: string;
    chiefComplaint?: string;
    diagnosis?: string;
    notes?: string;
    prescription?: string;
    status: 'SCHEDULED' | 'CHECKED_IN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    scheduledAt?: string;
    startedAt?: string;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
    patient?: Patient;
}

export interface CreateVisitData {
    patientId: string;
    doctorId?: string;
    visitType: 'OPD' | 'IPD' | 'EMERGENCY';
    department?: string;
    chiefComplaint?: string;
    scheduledAt?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export interface PaginationParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface DashboardStats {
    totalPatientsToday: number;
    totalPatients: number;
    bedOccupancy: number;
    totalBeds: number;
    opdQueue: number;
    emergencyCases: number;
    icuPatients: number;
    nicuPatients: number;
    surgeriesToday: number;
    todayRevenue: number;
    monthlyRevenue: number;
}

export interface Appointment {
    id: string;
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    department: string;
    scheduledAt: string;
    status: 'SCHEDULED' | 'CHECKED_IN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
    notes?: string;
}

// ============ API CLIENT ============
class ApiClient {
    private client: AxiosInstance;
    private token: string | null = null;

    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 30000,
        });

        // Request interceptor to add auth token
        this.client.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                const token = this.getToken();
                if (token && config.headers) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor for error handling
        this.client.interceptors.response.use(
            (response) => response,
            (error: AxiosError) => {
                if (error.response?.status === 401) {
                    // Token expired or invalid - clear storage
                    this.clearToken();
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem('ehr-token');
                        localStorage.removeItem('ehr-user');
                        // Optionally redirect to login
                        // window.location.href = '/login';
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    private getToken(): string | null {
        if (this.token) return this.token;
        if (typeof window !== 'undefined') {
            this.token = localStorage.getItem('ehr-token');
        }
        return this.token;
    }

    setToken(token: string) {
        this.token = token;
    }

    clearToken() {
        this.token = null;
    }

    // Generic request methods
    async get<T>(url: string, params?: Record<string, any>): Promise<T> {
        const response = await this.client.get<T>(url, { params });
        return response.data;
    }

    async post<T>(url: string, data?: any): Promise<T> {
        const response = await this.client.post<T>(url, data);
        return response.data;
    }

    async put<T>(url: string, data?: any): Promise<T> {
        const response = await this.client.put<T>(url, data);
        return response.data;
    }

    async patch<T>(url: string, data?: any): Promise<T> {
        const response = await this.client.patch<T>(url, data);
        return response.data;
    }

    async delete<T>(url: string): Promise<T> {
        const response = await this.client.delete<T>(url);
        return response.data;
    }
}

// Singleton instance
const apiClient = new ApiClient();

// ============ AUTH SERVICE ============
export const authService = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
        apiClient.setToken(response.token);
        return response;
    },

    register: async (data: RegisterData): Promise<User> => {
        return apiClient.post<User>('/auth/register', data);
    },

    logout: () => {
        apiClient.clearToken();
    },
};

// ============ PATIENT SERVICE ============
export const patientService = {
    getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Patient>> => {
        return apiClient.get<PaginatedResponse<Patient>>('/patients', params);
    },

    getById: async (id: string): Promise<Patient> => {
        return apiClient.get<Patient>(`/patients/${id}`);
    },

    create: async (data: CreatePatientData): Promise<Patient> => {
        return apiClient.post<Patient>('/patients', data);
    },

    update: async (id: string, data: Partial<CreatePatientData>): Promise<Patient> => {
        return apiClient.patch<Patient>(`/patients/${id}`, data);
    },

    delete: async (id: string): Promise<void> => {
        return apiClient.delete(`/patients/${id}`);
    },

    search: async (query: string): Promise<Patient[]> => {
        const response = await apiClient.get<PaginatedResponse<Patient>>('/patients', { search: query, limit: 20 });
        return response.data;
    },
};

// ============ VISIT SERVICE ============
export const visitService = {
    getAll: async (params?: PaginationParams & { patientId?: string; status?: string }): Promise<PaginatedResponse<Visit>> => {
        return apiClient.get<PaginatedResponse<Visit>>('/visits', params);
    },

    getById: async (id: string): Promise<Visit> => {
        return apiClient.get<Visit>(`/visits/${id}`);
    },

    create: async (data: CreateVisitData): Promise<Visit> => {
        return apiClient.post<Visit>('/visits', data);
    },

    update: async (id: string, data: Partial<Visit>): Promise<Visit> => {
        return apiClient.patch<Visit>(`/visits/${id}`, data);
    },

    getByPatient: async (patientId: string): Promise<Visit[]> => {
        const response = await apiClient.get<PaginatedResponse<Visit>>('/visits', { patientId });
        return response.data;
    },
};

// ============ DASHBOARD SERVICE ============
export const dashboardService = {
    getStats: async (): Promise<DashboardStats> => {
        // This endpoint might not exist yet, we'll provide fallback data
        try {
            return await apiClient.get<DashboardStats>('/dashboard/stats');
        } catch {
            // Return mock data if endpoint doesn't exist
            return {
                totalPatientsToday: 248,
                totalPatients: 12547,
                bedOccupancy: 78,
                totalBeds: 200,
                opdQueue: 24,
                emergencyCases: 3,
                icuPatients: 8,
                nicuPatients: 4,
                surgeriesToday: 6,
                todayRevenue: 245000,
                monthlyRevenue: 7850000,
            };
        }
    },

    getRevenueData: async (period: 'week' | 'month' | 'year' = 'week') => {
        try {
            return await apiClient.get('/dashboard/revenue', { period });
        } catch {
            // Mock data
            return [
                { name: 'Mon', opd: 45000, ipd: 125000, pharmacy: 28000, lab: 35000 },
                { name: 'Tue', opd: 52000, ipd: 138000, pharmacy: 32000, lab: 42000 },
                { name: 'Wed', opd: 48000, ipd: 142000, pharmacy: 29000, lab: 38000 },
                { name: 'Thu', opd: 61000, ipd: 156000, pharmacy: 35000, lab: 48000 },
                { name: 'Fri', opd: 55000, ipd: 148000, pharmacy: 31000, lab: 44000 },
                { name: 'Sat', opd: 38000, ipd: 98000, pharmacy: 24000, lab: 32000 },
                { name: 'Sun', opd: 25000, ipd: 72000, pharmacy: 18000, lab: 22000 },
            ];
        }
    },

    getDepartmentStats: async () => {
        try {
            return await apiClient.get('/dashboard/departments');
        } catch {
            return [
                { name: 'Emergency', patients: 45, color: '#ef4444' },
                { name: 'OPD', patients: 128, color: '#3b82f6' },
                { name: 'IPD', patients: 67, color: '#8b5cf6' },
                { name: 'ICU/CCU', patients: 18, color: '#f97316' },
                { name: 'Surgery', patients: 12, color: '#06b6d4' },
            ];
        }
    },
};

// ============ APPOINTMENT SERVICE ============
export const appointmentService = {
    getAll: async (params?: PaginationParams & { date?: string; doctorId?: string; status?: string }): Promise<PaginatedResponse<Appointment>> => {
        try {
            return await apiClient.get<PaginatedResponse<Appointment>>('/appointments', params);
        } catch {
            // Mock data
            return {
                data: [],
                pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false }
            };
        }
    },

    getToday: async (): Promise<Appointment[]> => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const response = await apiClient.get<PaginatedResponse<Appointment>>('/appointments', { date: today });
            return response.data;
        } catch {
            return [];
        }
    },

    create: async (data: Partial<Appointment>): Promise<Appointment> => {
        return apiClient.post<Appointment>('/appointments', data);
    },

    update: async (id: string, data: Partial<Appointment>): Promise<Appointment> => {
        return apiClient.patch<Appointment>(`/appointments/${id}`, data);
    },

    cancel: async (id: string): Promise<void> => {
        return apiClient.patch(`/appointments/${id}`, { status: 'CANCELLED' });
    },
};

// ============ EMERGENCY SERVICE ============
export const emergencyService = {
    getActive: async (): Promise<Visit[]> => {
        try {
            const response = await apiClient.get<PaginatedResponse<Visit>>('/visits', { 
                visitType: 'EMERGENCY',
                status: 'IN_PROGRESS'
            });
            return response.data;
        } catch {
            return [];
        }
    },

    getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Visit>> => {
        return apiClient.get<PaginatedResponse<Visit>>('/visits', { ...params, visitType: 'EMERGENCY' });
    },

    createEmergencyVisit: async (data: Omit<CreateVisitData, 'visitType'>): Promise<Visit> => {
        return apiClient.post<Visit>('/visits', { ...data, visitType: 'EMERGENCY' });
    },
};

// ============ PHARMACY SERVICE ============
export const pharmacyService = {
    getMedicines: async (params?: PaginationParams) => {
        try {
            return await apiClient.get('/pharmacy/medicines', params);
        } catch {
            return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false } };
        }
    },

    getPrescriptions: async (patientId?: string) => {
        try {
            return await apiClient.get('/pharmacy/prescriptions', { patientId });
        } catch {
            return { data: [] };
        }
    },

    dispenseMedicine: async (prescriptionId: string) => {
        return apiClient.post(`/pharmacy/dispense/${prescriptionId}`);
    },
};

// ============ BILLING SERVICE ============
export const billingService = {
    getInvoices: async (params?: PaginationParams & { patientId?: string; status?: string }) => {
        try {
            return await apiClient.get('/billing/invoices', params);
        } catch {
            return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false } };
        }
    },

    createInvoice: async (data: any) => {
        return apiClient.post('/billing/invoices', data);
    },

    processPayment: async (invoiceId: string, paymentData: any) => {
        return apiClient.post(`/billing/invoices/${invoiceId}/payment`, paymentData);
    },
};

// ============ IPD SERVICE ============
export const ipdService = {
    getAdmissions: async (params?: PaginationParams & { status?: string }) => {
        try {
            return await apiClient.get('/ipd/admissions', params);
        } catch {
            return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false } };
        }
    },

    getBeds: async () => {
        try {
            return await apiClient.get('/ipd/beds');
        } catch {
            return { data: [] };
        }
    },

    admitPatient: async (data: any) => {
        return apiClient.post('/ipd/admissions', data);
    },

    dischargePatient: async (admissionId: string) => {
        return apiClient.patch(`/ipd/admissions/${admissionId}/discharge`);
    },
};

// Export the api client for custom requests
export { apiClient };
