'use client';

import React, { useState } from 'react';
import {
    UserPlus, Search, Filter, Calendar, User, Phone, MapPin,
    FileText, Stethoscope, BedDouble, Clock, AlertCircle, CheckCircle,
    X, ChevronDown, Building2, Loader2, Shield
} from 'lucide-react';
import { useFormValidation, ValidationRules } from '@/hooks/useFormValidation';

interface AdmissionFormData {
    patientId: string;
    patientName: string;
    phone: string;
    age: string;
    gender: string;
    address: string;
    ward: string;
    bed: string;
    doctor: string;
    admissionDate: string;
    diagnosis: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    insuranceProvider: string;
    insuranceId: string;
    notes: string;
}

// Mock admitted patients data
const mockAdmittedPatients = [
    { id: 'ADM001', patientId: 'P10045', name: 'Rahul Sharma', age: 45, gender: 'Male', phone: '+91 98765 43210', ward: 'General Ward', bed: '101-A', admissionDate: '2024-12-26', diagnosis: 'Typhoid Fever', doctor: 'Dr. Amit Patel', status: 'Stable' },
    { id: 'ADM002', patientId: 'P10046', name: 'Priya Gupta', age: 32, gender: 'Female', phone: '+91 87654 32109', ward: 'General Ward', bed: '102-A', admissionDate: '2024-12-25', diagnosis: 'Dengue', doctor: 'Dr. Sunita Mehta', status: 'Under Observation' },
    { id: 'ADM003', patientId: 'P10047', name: 'Amit Kumar', age: 58, gender: 'Male', phone: '+91 76543 21098', ward: 'ICU', bed: '201-A', admissionDate: '2024-12-24', diagnosis: 'Myocardial Infarction', doctor: 'Dr. Rajesh Singh', status: 'Critical' },
    { id: 'ADM004', patientId: 'P10048', name: 'Kavita Singh', age: 28, gender: 'Female', phone: '+91 65432 10987', ward: 'Maternity', bed: '401-A', admissionDate: '2024-12-27', diagnosis: 'Normal Delivery', doctor: 'Dr. Priya Mehta', status: 'Stable' },
    { id: 'ADM005', patientId: 'P10049', name: 'Vikram Joshi', age: 67, gender: 'Male', phone: '+91 54321 09876', ward: 'ICU', bed: '201-B', admissionDate: '2024-12-27', diagnosis: 'Pneumonia', doctor: 'Dr. Rajesh Singh', status: 'Critical' },
    { id: 'ADM006', patientId: 'P10050', name: 'Sneha Patel', age: 42, gender: 'Female', phone: '+91 43210 98765', ward: 'Private Ward', bed: '301-A', admissionDate: '2024-12-26', diagnosis: 'Post Appendectomy', doctor: 'Dr. Vikram Reddy', status: 'Recovering' },
];

const availableBeds: Record<string, string[]> = {
    'General Ward': ['101-B', '102-B', '103-A', '103-B'],
    'ICU': ['202-B'],
    'Private Ward': ['302-A', '303-A'],
    'Maternity': ['401-B', '402-A', '402-B'],
};

const doctors = [
    { id: '1', name: 'Dr. Amit Patel', department: 'General Medicine' },
    { id: '2', name: 'Dr. Sunita Mehta', department: 'General Medicine' },
    { id: '3', name: 'Dr. Rajesh Singh', department: 'Cardiology' },
    { id: '4', name: 'Dr. Priya Mehta', department: 'Obstetrics' },
    { id: '5', name: 'Dr. Vikram Reddy', department: 'Surgery' },
];

const insuranceProviders = [
    'Star Health Insurance',
    'ICICI Lombard',
    'Max Bupa',
    'HDFC Ergo',
    'Bajaj Allianz',
    'New India Assurance',
    'CGHS',
    'ECHS',
    'Other',
];

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Critical': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        case 'Under Observation': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
        case 'Stable': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        case 'Recovering': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
};

export default function IPDAdmissionsPage() {
    const [showAdmissionForm, setShowAdmissionForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterWard, setFilterWard] = useState('All');
    const [admittedPatients] = useState(mockAdmittedPatients);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [admissionId, setAdmissionId] = useState('');

    const [formData, setFormData] = useState<AdmissionFormData>({
        patientId: '',
        patientName: '',
        phone: '',
        age: '',
        gender: '',
        address: '',
        ward: '',
        bed: '',
        doctor: '',
        admissionDate: new Date().toISOString().split('T')[0],
        diagnosis: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        insuranceProvider: '',
        insuranceId: '',
        notes: '',
    });

    // Validation schema
    const validationSchema = {
        patientName: [
            (v: string) => ValidationRules.required(v, 'Patient name'),
            (v: string) => ValidationRules.minLength(v, 2),
        ],
        phone: [
            (v: string) => ValidationRules.required(v, 'Phone number'),
            (v: string) => ValidationRules.phone(v, 10),
        ],
        age: [
            (v: string) => ValidationRules.required(v, 'Age'),
            (v: string) => ValidationRules.number(v, { min: 0, max: 150, integer: true }),
        ],
        gender: [
            (v: string) => ValidationRules.required(v, 'Gender'),
        ],
        ward: [
            (v: string) => ValidationRules.required(v, 'Ward'),
        ],
        bed: [
            (v: string) => ValidationRules.required(v, 'Bed'),
        ],
        doctor: [
            (v: string) => ValidationRules.required(v, 'Attending doctor'),
        ],
        admissionDate: [
            (v: string) => ValidationRules.required(v, 'Admission date'),
            (v: string) => ValidationRules.date(v),
        ],
        diagnosis: [
            (v: string) => ValidationRules.required(v, 'Diagnosis'),
            (v: string) => ValidationRules.minLength(v, 5),
        ],
        emergencyContactName: [
            (v: string) => ValidationRules.required(v, 'Emergency contact name'),
        ],
        emergencyContactPhone: [
            (v: string) => ValidationRules.required(v, 'Emergency contact phone'),
            (v: string) => ValidationRules.phone(v, 10),
        ],
    };

    const { errors, validateField, validateForm, setFieldError, clearFieldError, clearErrors } = useFormValidation<AdmissionFormData>(validationSchema);

    const handleChange = (field: keyof AdmissionFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            clearFieldError(field);
        }
    };

    const handleBlur = (field: keyof AdmissionFormData) => {
        const error = validateField(field, formData[field]);
        if (error) {
            setFieldError(field, error);
        }
    };

    const handleSubmit = async () => {
        if (!validateForm(formData)) return;

        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setAdmissionId('ADM-' + Date.now().toString().slice(-6));
        setIsSubmitting(false);
        setShowSuccess(true);
    };

    const handleCloseForm = () => {
        setShowAdmissionForm(false);
        setShowSuccess(false);
        clearErrors();
        setFormData({
            patientId: '', patientName: '', phone: '', age: '', gender: '',
            address: '', ward: '', bed: '', doctor: '',
            admissionDate: new Date().toISOString().split('T')[0],
            diagnosis: '', emergencyContactName: '', emergencyContactPhone: '',
            insuranceProvider: '', insuranceId: '', notes: '',
        });
    };

    const filteredPatients = admittedPatients.filter(patient => {
        const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            patient.patientId.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesWard = filterWard === 'All' || patient.ward === filterWard;
        return matchesSearch && matchesWard;
    });

    const stats = {
        totalAdmitted: admittedPatients.length,
        critical: admittedPatients.filter(p => p.status === 'Critical').length,
        stable: admittedPatients.filter(p => p.status === 'Stable').length,
        todayAdmissions: admittedPatients.filter(p => p.admissionDate === '2024-12-27').length,
    };

    const inputClass = (field: keyof AdmissionFormData) => `
        w-full px-4 py-2.5 border rounded-lg transition-all duration-200
        ${errors[field] 
            ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/10' 
            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
        }
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        text-slate-900 dark:text-white placeholder-slate-400
    `;

    const selectedWardBeds = formData.ward ? availableBeds[formData.ward] || [] : [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <UserPlus className="w-7 h-7 text-purple-600" />
                        IPD Admissions
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage patient admissions and view admitted patients</p>
                </div>
                <button
                    onClick={() => setShowAdmissionForm(true)}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <UserPlus className="w-4 h-4" />
                    New Admission
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <BedDouble className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalAdmitted}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Total Admitted</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Critical</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-600">{stats.stable}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Stable</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-blue-600">{stats.todayAdmissions}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Today's Admissions</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="card p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by patient name or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input pl-10"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                            value={filterWard}
                            onChange={(e) => setFilterWard(e.target.value)}
                            className="input pl-10 pr-8 appearance-none cursor-pointer"
                        >
                            <option value="All">All Wards</option>
                            <option value="General Ward">General Ward</option>
                            <option value="ICU">ICU</option>
                            <option value="Private Ward">Private Ward</option>
                            <option value="Maternity">Maternity</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Admitted Patients Table */}
            <div className="card overflow-hidden">
                <div className="card-header">
                    <h2 className="font-semibold text-slate-900 dark:text-white">Admitted Patients</h2>
                    <span className="text-sm text-slate-500 dark:text-slate-400">{filteredPatients.length} patients</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Ward / Bed</th>
                                <th>Admission Date</th>
                                <th>Diagnosis</th>
                                <th>Attending Doctor</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPatients.map((patient) => (
                                <tr key={patient.id}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                                <User className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">{patient.name}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{patient.patientId} | {patient.age}yrs, {patient.gender}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <Building2 className="w-4 h-4 text-slate-400" />
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">{patient.ward}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Bed: {patient.bed}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            <span className="text-slate-700 dark:text-slate-300">{patient.admissionDate}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="text-slate-700 dark:text-slate-300">{patient.diagnosis}</span>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <Stethoscope className="w-4 h-4 text-slate-400" />
                                            <span className="text-slate-700 dark:text-slate-300">{patient.doctor}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(patient.status)}`}>
                                            {patient.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button className="btn btn-outline text-xs px-3 py-1">View</button>
                                            <button className="btn btn-outline text-xs px-3 py-1">Edit</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* New Admission Modal */}
            {showAdmissionForm && (
                <div className="modal-overlay" onClick={handleCloseForm}>
                    <div className="modal max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        {showSuccess ? (
                            // Success State
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Patient Admitted Successfully!</h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-4">Admission ID: <span className="font-mono font-bold text-blue-600">{admissionId}</span></p>
                                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div><span className="text-slate-500">Patient:</span></div>
                                        <div className="font-medium text-slate-900 dark:text-white">{formData.patientName}</div>
                                        <div><span className="text-slate-500">Ward/Bed:</span></div>
                                        <div className="font-medium text-slate-900 dark:text-white">{formData.ward} / {formData.bed}</div>
                                        <div><span className="text-slate-500">Doctor:</span></div>
                                        <div className="font-medium text-slate-900 dark:text-white">{doctors.find(d => d.id === formData.doctor)?.name}</div>
                                    </div>
                                </div>
                                <div className="flex gap-3 justify-center">
                                    <button onClick={handleCloseForm} className="btn btn-primary">Close</button>
                                    <button onClick={() => { setShowSuccess(false); clearErrors(); setFormData({...formData, patientId: '', patientName: '', phone: '', age: '', gender: '', address: '', diagnosis: '', emergencyContactName: '', emergencyContactPhone: '', insuranceProvider: '', insuranceId: '', notes: ''}); }} className="btn btn-secondary">Admit Another</button>
                                </div>
                            </div>
                        ) : (
                            // Form
                            <>
                                <div className="modal-header">
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                        <UserPlus className="w-5 h-5 text-purple-600" />
                                        New Patient Admission
                                    </h2>
                                    <button onClick={handleCloseForm} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                                        <X className="w-5 h-5 text-slate-500" />
                                    </button>
                                </div>
                                <div className="modal-body space-y-6">
                                    {/* Patient Information Section */}
                                    <div>
                                        <h3 className="font-medium text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4 flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            Patient Information
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                    Patient ID / UHID <span className="text-slate-400">(Optional)</span>
                                                </label>
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        value={formData.patientId}
                                                        onChange={(e) => handleChange('patientId', e.target.value)}
                                                        placeholder="Search existing patient..."
                                                        className={`${inputClass('patientId')} pl-10`}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                    Full Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.patientName}
                                                    onChange={(e) => handleChange('patientName', e.target.value)}
                                                    onBlur={() => handleBlur('patientName')}
                                                    placeholder="Enter patient name"
                                                    className={inputClass('patientName')}
                                                />
                                                {errors.patientName && <p className="mt-1 text-sm text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.patientName}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                    Phone Number <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                    onBlur={() => handleBlur('phone')}
                                                    placeholder="9876543210"
                                                    className={inputClass('phone')}
                                                />
                                                {errors.phone && <p className="mt-1 text-sm text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.phone}</p>}
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                        Age <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={formData.age}
                                                        onChange={(e) => handleChange('age', e.target.value)}
                                                        onBlur={() => handleBlur('age')}
                                                        placeholder="Years"
                                                        min="0"
                                                        max="150"
                                                        className={inputClass('age')}
                                                    />
                                                    {errors.age && <p className="mt-1 text-sm text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.age}</p>}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                        Gender <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        value={formData.gender}
                                                        onChange={(e) => handleChange('gender', e.target.value)}
                                                        onBlur={() => handleBlur('gender')}
                                                        className={inputClass('gender')}
                                                    >
                                                        <option value="">Select</option>
                                                        <option value="male">Male</option>
                                                        <option value="female">Female</option>
                                                        <option value="other">Other</option>
                                                    </select>
                                                    {errors.gender && <p className="mt-1 text-sm text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.gender}</p>}
                                                </div>
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address</label>
                                                <input
                                                    type="text"
                                                    value={formData.address}
                                                    onChange={(e) => handleChange('address', e.target.value)}
                                                    placeholder="Enter address"
                                                    className={inputClass('address')}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Admission Details Section */}
                                    <div>
                                        <h3 className="font-medium text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4 flex items-center gap-2">
                                            <BedDouble className="w-4 h-4" />
                                            Admission Details
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                    Ward <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    value={formData.ward}
                                                    onChange={(e) => { handleChange('ward', e.target.value); handleChange('bed', ''); }}
                                                    onBlur={() => handleBlur('ward')}
                                                    className={inputClass('ward')}
                                                >
                                                    <option value="">Select Ward</option>
                                                    {Object.entries(availableBeds).map(([ward, beds]) => (
                                                        <option key={ward} value={ward}>{ward} ({beds.length} beds available)</option>
                                                    ))}
                                                </select>
                                                {errors.ward && <p className="mt-1 text-sm text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.ward}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                    Bed <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    value={formData.bed}
                                                    onChange={(e) => handleChange('bed', e.target.value)}
                                                    onBlur={() => handleBlur('bed')}
                                                    disabled={!formData.ward}
                                                    className={inputClass('bed')}
                                                >
                                                    <option value="">Select Bed</option>
                                                    {selectedWardBeds.map(bed => (
                                                        <option key={bed} value={bed}>{bed}</option>
                                                    ))}
                                                </select>
                                                {errors.bed && <p className="mt-1 text-sm text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.bed}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                    Attending Doctor <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    value={formData.doctor}
                                                    onChange={(e) => handleChange('doctor', e.target.value)}
                                                    onBlur={() => handleBlur('doctor')}
                                                    className={inputClass('doctor')}
                                                >
                                                    <option value="">Select Doctor</option>
                                                    {doctors.map(doctor => (
                                                        <option key={doctor.id} value={doctor.id}>{doctor.name} - {doctor.department}</option>
                                                    ))}
                                                </select>
                                                {errors.doctor && <p className="mt-1 text-sm text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.doctor}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                    Admission Date <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="date"
                                                    value={formData.admissionDate}
                                                    onChange={(e) => handleChange('admissionDate', e.target.value)}
                                                    onBlur={() => handleBlur('admissionDate')}
                                                    className={inputClass('admissionDate')}
                                                />
                                                {errors.admissionDate && <p className="mt-1 text-sm text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.admissionDate}</p>}
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                    Diagnosis / Reason for Admission <span className="text-red-500">*</span>
                                                </label>
                                                <textarea
                                                    value={formData.diagnosis}
                                                    onChange={(e) => handleChange('diagnosis', e.target.value)}
                                                    onBlur={() => handleBlur('diagnosis')}
                                                    placeholder="Enter diagnosis or reason for admission"
                                                    className={`${inputClass('diagnosis')} min-h-[80px] resize-none`}
                                                />
                                                {errors.diagnosis && <p className="mt-1 text-sm text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.diagnosis}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Emergency Contact Section */}
                                    <div>
                                        <h3 className="font-medium text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4 flex items-center gap-2">
                                            <Phone className="w-4 h-4" />
                                            Emergency Contact
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                    Contact Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.emergencyContactName}
                                                    onChange={(e) => handleChange('emergencyContactName', e.target.value)}
                                                    onBlur={() => handleBlur('emergencyContactName')}
                                                    placeholder="Emergency contact name"
                                                    className={inputClass('emergencyContactName')}
                                                />
                                                {errors.emergencyContactName && <p className="mt-1 text-sm text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.emergencyContactName}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                    Contact Phone <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={formData.emergencyContactPhone}
                                                    onChange={(e) => handleChange('emergencyContactPhone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                    onBlur={() => handleBlur('emergencyContactPhone')}
                                                    placeholder="9876543210"
                                                    className={inputClass('emergencyContactPhone')}
                                                />
                                                {errors.emergencyContactPhone && <p className="mt-1 text-sm text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.emergencyContactPhone}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Insurance Section */}
                                    <div>
                                        <h3 className="font-medium text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4 flex items-center gap-2">
                                            <Shield className="w-4 h-4" />
                                            Insurance Information <span className="text-slate-400 text-sm font-normal">(Optional)</span>
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Insurance Provider</label>
                                                <select
                                                    value={formData.insuranceProvider}
                                                    onChange={(e) => handleChange('insuranceProvider', e.target.value)}
                                                    className={inputClass('insuranceProvider')}
                                                >
                                                    <option value="">Select Provider</option>
                                                    {insuranceProviders.map(provider => (
                                                        <option key={provider} value={provider}>{provider}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Policy / ID Number</label>
                                                <input
                                                    type="text"
                                                    value={formData.insuranceId}
                                                    onChange={(e) => handleChange('insuranceId', e.target.value)}
                                                    placeholder="Enter policy number"
                                                    className={inputClass('insuranceId')}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Additional Notes</label>
                                        <textarea
                                            value={formData.notes}
                                            onChange={(e) => handleChange('notes', e.target.value)}
                                            placeholder="Any additional notes or special requirements..."
                                            className={`${inputClass('notes')} min-h-[60px] resize-none`}
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button onClick={handleCloseForm} className="btn btn-secondary">Cancel</button>
                                    <button 
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="btn btn-primary flex items-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Admitting...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-4 h-4" />
                                                Admit Patient
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
