'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Filter, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { DataTable } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SearchInput, FilterDropdown } from '@/components/ui/SearchInput';
import Link from 'next/link';
import { patientService, Patient, PaginatedResponse } from '@/services/api';

// Mock patients for fallback when API is unavailable
const mockPatients = [
    { id: 'P001', mrn: 'MRN-2024-001', firstName: 'Rahul', lastName: 'Sharma', dateOfBirth: '1992-05-15', gender: 'MALE' as const, phone: '9876543210', email: 'rahul@email.com', status: 'ACTIVE', createdAt: '2024-12-28', updatedAt: '2024-12-28' },
    { id: 'P002', mrn: 'MRN-2024-002', firstName: 'Priya', lastName: 'Gupta', dateOfBirth: '1996-03-22', gender: 'FEMALE' as const, phone: '9876543211', email: 'priya@email.com', status: 'ACTIVE', createdAt: '2024-12-27', updatedAt: '2024-12-27' },
    { id: 'P003', mrn: 'MRN-2024-003', firstName: 'Amit', lastName: 'Kumar', dateOfBirth: '1979-08-10', gender: 'MALE' as const, phone: '9876543212', email: 'amit@email.com', status: 'INACTIVE', createdAt: '2024-12-20', updatedAt: '2024-12-20' },
    { id: 'P004', mrn: 'MRN-2024-004', firstName: 'Sneha', lastName: 'Patel', dateOfBirth: '1989-11-30', gender: 'FEMALE' as const, phone: '9876543213', email: 'sneha@email.com', status: 'ACTIVE', createdAt: '2024-12-26', updatedAt: '2024-12-26' },
    { id: 'P005', mrn: 'MRN-2024-005', firstName: 'Vikram', lastName: 'Singh', dateOfBirth: '1974-02-18', gender: 'MALE' as const, phone: '9876543214', email: 'vikram@email.com', status: 'ACTIVE', createdAt: '2024-12-25', updatedAt: '2024-12-25' },
    { id: 'P006', mrn: 'MRN-2024-006', firstName: 'Anjali', lastName: 'Reddy', dateOfBirth: '1995-07-05', gender: 'FEMALE' as const, phone: '9876543215', email: 'anjali@email.com', status: 'DISCHARGED', createdAt: '2024-12-24', updatedAt: '2024-12-24' },
    { id: 'P007', mrn: 'MRN-2024-007', firstName: 'Rajesh', lastName: 'Verma', dateOfBirth: '1982-09-12', gender: 'MALE' as const, phone: '9876543216', email: 'rajesh@email.com', status: 'ACTIVE', createdAt: '2024-12-23', updatedAt: '2024-12-23' },
    { id: 'P008', mrn: 'MRN-2024-008', firstName: 'Meera', lastName: 'Joshi', dateOfBirth: '1986-12-28', gender: 'FEMALE' as const, phone: '9876543217', email: 'meera@email.com', status: 'ADMITTED', createdAt: '2024-12-28', updatedAt: '2024-12-28' },
];

const statusOptions = [
    { value: 'ALL', label: 'All Status' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'ADMITTED', label: 'Admitted' },
    { value: 'DISCHARGED', label: 'Discharged' },
];

// Helper to calculate age from date of birth
const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

// Transform Patient from API to display format
interface DisplayPatient {
    id: string;
    mrn: string;
    name: string;
    firstName: string;
    lastName?: string;
    age: number;
    gender: string;
    phone: string;
    email?: string;
    status: string;
    lastVisit: string;
}

const transformPatient = (patient: Patient | typeof mockPatients[0]): DisplayPatient => ({
    id: patient.id,
    mrn: patient.mrn,
    name: `${patient.firstName} ${patient.lastName || ''}`.trim(),
    firstName: patient.firstName,
    lastName: patient.lastName,
    age: calculateAge(patient.dateOfBirth),
    gender: patient.gender === 'MALE' ? 'M' : patient.gender === 'FEMALE' ? 'F' : 'O',
    phone: patient.phone,
    email: patient.email,
    status: (patient as any).status || 'ACTIVE',
    lastVisit: patient.updatedAt?.split('T')[0] || patient.createdAt?.split('T')[0] || 'N/A',
});

export default function PatientsPage() {
    const [patients, setPatients] = useState<DisplayPatient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [usingMockData, setUsingMockData] = useState(false);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const pageSize = 10;

    // Fetch patients from API
    const fetchPatients = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await patientService.getAll({ 
                page: currentPage, 
                limit: pageSize,
                search: searchQuery || undefined
            });
            
            const transformedPatients = response.data.map(transformPatient);
            setPatients(transformedPatients);
            setTotalItems(response.pagination.total);
            setUsingMockData(false);
        } catch (err) {
            console.warn('API unavailable, using mock data:', err);
            // Fallback to mock data
            const transformed = mockPatients.map(transformPatient);
            setPatients(transformed);
            setTotalItems(mockPatients.length);
            setUsingMockData(true);
            setError('Backend unavailable - showing demo data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, [currentPage]);

    // Client-side filtering for mock data (API handles this server-side)
    const filteredPatients = usingMockData 
        ? patients.filter(patient => {
            const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 patient.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 patient.phone.includes(searchQuery);
            const matchesStatus = filterStatus === 'ALL' || patient.status === filterStatus;
            return matchesSearch && matchesStatus;
          })
        : patients;

    const columns = [
        { key: 'mrn', header: 'MRN', sortable: true },
        { 
            key: 'name', 
            header: 'Patient',
            render: (patient: DisplayPatient) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                        {patient.name.charAt(0)}
                    </div>
                    <div>
                        <p className="font-medium text-slate-900 dark:text-white">{patient.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{patient.age} yrs, {patient.gender}</p>
                    </div>
                </div>
            )
        },
        { key: 'phone', header: 'Phone' },
        { key: 'email', header: 'Email' },
        { 
            key: 'status', 
            header: 'Status',
            render: (patient: DisplayPatient) => <StatusBadge status={patient.status} />
        },
        { key: 'lastVisit', header: 'Last Visit' },
    ];

    // Stats calculation
    const stats = {
        total: usingMockData ? mockPatients.length : totalItems,
        active: patients.filter(p => p.status === 'ACTIVE').length,
        admitted: patients.filter(p => p.status === 'ADMITTED').length,
        discharged: patients.filter(p => p.status === 'DISCHARGED').length,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Patients</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage patient records and information</p>
                </div>
                <div className="flex gap-3">
                    <Button 
                        variant="secondary" 
                        onClick={fetchPatients}
                        disabled={loading}
                        className="dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> 
                        Refresh
                    </Button>
                    <Button variant="secondary" className="dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600">
                        <Download className="h-4 w-4 mr-2" /> Export
                    </Button>
                    <Link href="/patients/register">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4 mr-2" /> Add Patient
                        </Button>
                    </Link>
                </div>
            </div>

            {/* API Status Banner */}
            {usingMockData && (
                <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Demo Mode</p>
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                            Backend API is unavailable. Displaying sample data. Start the backend at localhost:3001 for live data.
                        </p>
                    </div>
                    <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={fetchPatients}
                        className="bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-700"
                    >
                        Retry Connection
                    </Button>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card p-5">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Total Patients</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.total}</p>
                </div>
                <div className="card p-5 border-l-4 border-l-green-500">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Active</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.active}</p>
                </div>
                <div className="card p-5 border-l-4 border-l-blue-500">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Admitted</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.admitted}</p>
                </div>
                <div className="card p-5 border-l-4 border-l-amber-500">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Discharged</p>
                    <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.discharged}</p>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <SearchInput
                        value={searchQuery}
                        onChange={(value) => {
                            setSearchQuery(value);
                            if (!usingMockData) {
                                // Debounce API search
                                setCurrentPage(1);
                            }
                        }}
                        placeholder="Search by name, MRN, or phone..."
                    />
                </div>
                <FilterDropdown
                    options={statusOptions}
                    value={filterStatus}
                    onChange={setFilterStatus}
                />
            </div>

            {/* Patients Table */}
            <div className="card">
                <DataTable
                    columns={columns}
                    data={filteredPatients}
                    keyExtractor={(patient) => patient.id}
                    loading={loading}
                    emptyMessage="No patients found"
                    onRowClick={(patient) => {
                        // Navigate to patient detail page
                        window.location.href = `/patients/${patient.id}`;
                    }}
                    currentPage={currentPage}
                    totalItems={usingMockData ? filteredPatients.length : totalItems}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
}
