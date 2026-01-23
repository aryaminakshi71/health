'use client';

import React, { useState } from 'react';
import {
    BedDouble, Search, Filter, User, AlertTriangle, Wrench,
    Clock, ChevronDown, Eye, RefreshCw, CheckCircle, XCircle
} from 'lucide-react';

// Mock bed data organized by ward
const mockBedData = {
    'General Ward': {
        floor: 'Floor 1',
        beds: [
            { id: 'GW-101A', room: '101', bed: 'A', status: 'OCCUPIED', patient: 'Rahul Sharma', age: 45, diagnosis: 'Typhoid Fever', doctor: 'Dr. Patel', admissionDate: '2024-12-26' },
            { id: 'GW-101B', room: '101', bed: 'B', status: 'AVAILABLE', patient: null, age: null, diagnosis: null, doctor: null, admissionDate: null },
            { id: 'GW-102A', room: '102', bed: 'A', status: 'OCCUPIED', patient: 'Priya Gupta', age: 32, diagnosis: 'Dengue', doctor: 'Dr. Mehta', admissionDate: '2024-12-25' },
            { id: 'GW-102B', room: '102', bed: 'B', status: 'AVAILABLE', patient: null, age: null, diagnosis: null, doctor: null, admissionDate: null },
            { id: 'GW-103A', room: '103', bed: 'A', status: 'RESERVED', patient: null, age: null, diagnosis: null, doctor: null, admissionDate: null, reservedFor: 'Emergency' },
            { id: 'GW-103B', room: '103', bed: 'B', status: 'MAINTENANCE', patient: null, age: null, diagnosis: null, doctor: null, admissionDate: null },
            { id: 'GW-104A', room: '104', bed: 'A', status: 'OCCUPIED', patient: 'Mohan Verma', age: 55, diagnosis: 'Post-Surgery Recovery', doctor: 'Dr. Reddy', admissionDate: '2024-12-23' },
            { id: 'GW-104B', room: '104', bed: 'B', status: 'AVAILABLE', patient: null, age: null, diagnosis: null, doctor: null, admissionDate: null },
        ]
    },
    'ICU': {
        floor: 'Floor 2',
        beds: [
            { id: 'ICU-201A', room: '201', bed: 'A', status: 'OCCUPIED', patient: 'Amit Kumar', age: 58, diagnosis: 'Myocardial Infarction', doctor: 'Dr. Singh', admissionDate: '2024-12-24', critical: true },
            { id: 'ICU-201B', room: '201', bed: 'B', status: 'OCCUPIED', patient: 'Vikram Joshi', age: 67, diagnosis: 'Pneumonia', doctor: 'Dr. Singh', admissionDate: '2024-12-27', critical: true },
            { id: 'ICU-202A', room: '202', bed: 'A', status: 'MAINTENANCE', patient: null, age: null, diagnosis: null, doctor: null, admissionDate: null },
            { id: 'ICU-202B', room: '202', bed: 'B', status: 'AVAILABLE', patient: null, age: null, diagnosis: null, doctor: null, admissionDate: null },
            { id: 'ICU-203A', room: '203', bed: 'A', status: 'OCCUPIED', patient: 'Suresh Yadav', age: 55, diagnosis: 'Sepsis', doctor: 'Dr. Singh', admissionDate: '2024-12-26', critical: true },
            { id: 'ICU-203B', room: '203', bed: 'B', status: 'RESERVED', patient: null, age: null, diagnosis: null, doctor: null, admissionDate: null, reservedFor: 'Post-Op' },
        ]
    },
    'Private Ward': {
        floor: 'Floor 3',
        beds: [
            { id: 'PW-301A', room: '301', bed: 'Single', status: 'OCCUPIED', patient: 'Sneha Patel', age: 42, diagnosis: 'Post Appendectomy', doctor: 'Dr. Reddy', admissionDate: '2024-12-26' },
            { id: 'PW-302A', room: '302', bed: 'Single', status: 'AVAILABLE', patient: null, age: null, diagnosis: null, doctor: null, admissionDate: null },
            { id: 'PW-303A', room: '303', bed: 'Single', status: 'AVAILABLE', patient: null, age: null, diagnosis: null, doctor: null, admissionDate: null },
            { id: 'PW-304A', room: '304', bed: 'Single', status: 'OCCUPIED', patient: 'Anil Kapoor', age: 50, diagnosis: 'Kidney Stone Surgery', doctor: 'Dr. Kumar', admissionDate: '2024-12-25' },
        ]
    },
    'Maternity': {
        floor: 'Floor 4',
        beds: [
            { id: 'MT-401A', room: '401', bed: 'A', status: 'OCCUPIED', patient: 'Kavita Singh', age: 28, diagnosis: 'Normal Delivery', doctor: 'Dr. Mehta', admissionDate: '2024-12-27' },
            { id: 'MT-401B', room: '401', bed: 'B', status: 'AVAILABLE', patient: null, age: null, diagnosis: null, doctor: null, admissionDate: null },
            { id: 'MT-402A', room: '402', bed: 'A', status: 'OCCUPIED', patient: 'Anita Sharma', age: 30, diagnosis: 'C-Section', doctor: 'Dr. Mehta', admissionDate: '2024-12-26' },
            { id: 'MT-402B', room: '402', bed: 'B', status: 'AVAILABLE', patient: null, age: null, diagnosis: null, doctor: null, admissionDate: null },
            { id: 'MT-403A', room: '403', bed: 'A', status: 'RESERVED', patient: null, age: null, diagnosis: null, doctor: null, admissionDate: null, reservedFor: 'Expected Delivery' },
            { id: 'MT-403B', room: '403', bed: 'B', status: 'AVAILABLE', patient: null, age: null, diagnosis: null, doctor: null, admissionDate: null },
        ]
    },
    'Pediatric Ward': {
        floor: 'Floor 5',
        beds: [
            { id: 'PD-501A', room: '501', bed: 'A', status: 'OCCUPIED', patient: 'Arjun (Child)', age: 8, diagnosis: 'Viral Infection', doctor: 'Dr. Sharma', admissionDate: '2024-12-27' },
            { id: 'PD-501B', room: '501', bed: 'B', status: 'AVAILABLE', patient: null, age: null, diagnosis: null, doctor: null, admissionDate: null },
            { id: 'PD-502A', room: '502', bed: 'A', status: 'OCCUPIED', patient: 'Priya (Child)', age: 5, diagnosis: 'Pneumonia', doctor: 'Dr. Sharma', admissionDate: '2024-12-26' },
            { id: 'PD-502B', room: '502', bed: 'B', status: 'AVAILABLE', patient: null, age: null, diagnosis: null, doctor: null, admissionDate: null },
        ]
    }
};

const statusConfig: Record<string, { color: string; bgColor: string; borderColor: string; label: string; icon: React.ReactNode }> = {
    AVAILABLE: { color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-900/20', borderColor: 'border-green-500', label: 'Available', icon: <CheckCircle className="w-4 h-4" /> },
    OCCUPIED: { color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-900/20', borderColor: 'border-red-500', label: 'Occupied', icon: <User className="w-4 h-4" /> },
    MAINTENANCE: { color: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-900/20', borderColor: 'border-amber-500', label: 'Maintenance', icon: <Wrench className="w-4 h-4" /> },
    RESERVED: { color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20', borderColor: 'border-blue-500', label: 'Reserved', icon: <Clock className="w-4 h-4" /> },
};

export default function BedManagementPage() {
    const [selectedWard, setSelectedWard] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBed, setSelectedBed] = useState<any>(null);

    // Calculate stats
    const allBeds = Object.values(mockBedData).flatMap(ward => ward.beds);
    const stats = {
        total: allBeds.length,
        available: allBeds.filter(b => b.status === 'AVAILABLE').length,
        occupied: allBeds.filter(b => b.status === 'OCCUPIED').length,
        maintenance: allBeds.filter(b => b.status === 'MAINTENANCE').length,
        reserved: allBeds.filter(b => b.status === 'RESERVED').length,
    };

    const occupancyRate = Math.round((stats.occupied / stats.total) * 100);

    const filteredWards = selectedWard === 'All' 
        ? Object.entries(mockBedData) 
        : Object.entries(mockBedData).filter(([name]) => name === selectedWard);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <BedDouble className="w-7 h-7 text-blue-600" />
                        Bed Management
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Real-time bed availability and occupancy status</p>
                </div>
                <button className="btn btn-secondary flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Refresh Status
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="card p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm">Total Beds</p>
                            <p className="text-3xl font-bold">{stats.total}</p>
                        </div>
                        <BedDouble className="w-8 h-8 text-blue-200" />
                    </div>
                </div>
                <div className="card p-4 border-l-4 border-l-green-500">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-600">{stats.available}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Available</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4 border-l-4 border-l-red-500">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <User className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-red-600">{stats.occupied}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Occupied</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4 border-l-4 border-l-amber-500">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                            <Wrench className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-amber-600">{stats.maintenance}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Maintenance</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm">Occupancy Rate</p>
                            <p className="text-3xl font-bold">{occupancyRate}%</p>
                        </div>
                        <div className="w-12 h-12 rounded-full border-4 border-purple-300 flex items-center justify-center">
                            <span className="text-sm font-bold">{occupancyRate}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by bed ID or patient name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input pl-10"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                            value={selectedWard}
                            onChange={(e) => setSelectedWard(e.target.value)}
                            className="input pl-10 pr-8 appearance-none cursor-pointer min-w-[180px]"
                        >
                            <option value="All">All Wards</option>
                            {Object.keys(mockBedData).map(ward => (
                                <option key={ward} value={ward}>{ward}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    {Object.entries(statusConfig).map(([status, config]) => (
                        <div key={status} className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded ${config.bgColor} ${config.color} flex items-center justify-center`}>
                                {config.icon}
                            </div>
                            <span className="text-sm text-slate-600 dark:text-slate-400">{config.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bed Grid by Ward */}
            <div className="space-y-6">
                {filteredWards.map(([wardName, wardData]) => (
                    <div key={wardName} className="card overflow-hidden">
                        <div className="card-header bg-slate-50 dark:bg-slate-800/50">
                            <div className="flex items-center gap-3">
                                <BedDouble className="w-5 h-5 text-blue-600" />
                                <div>
                                    <h2 className="font-semibold text-slate-900 dark:text-white">{wardName}</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{wardData.floor}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                                <span className="text-green-600 font-medium">
                                    {wardData.beds.filter(b => b.status === 'AVAILABLE').length} Available
                                </span>
                                <span className="text-red-600 font-medium">
                                    {wardData.beds.filter(b => b.status === 'OCCUPIED').length} Occupied
                                </span>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                {wardData.beds.map((bed) => {
                                    const config = statusConfig[bed.status];
                                    return (
                                        <div
                                            key={bed.id}
                                            onClick={() => setSelectedBed(bed)}
                                            className={`relative p-4 rounded-xl border-2 ${config.borderColor} ${config.bgColor} cursor-pointer transition-all hover:shadow-md`}
                                        >
                                            {/* Critical indicator */}
                                            {(bed as any).critical && (
                                                <div className="absolute -top-1 -right-1">
                                                    <AlertTriangle className="w-5 h-5 text-red-500 fill-red-100" />
                                                </div>
                                            )}

                                            {/* Bed Info */}
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-bold text-sm text-slate-900 dark:text-white">{bed.id}</span>
                                                <span className={config.color}>{config.icon}</span>
                                            </div>

                                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                                                Room {bed.room} - Bed {bed.bed}
                                            </div>

                                            {bed.patient ? (
                                                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                                    <p className="font-medium text-sm text-slate-900 dark:text-white truncate">{bed.patient}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{bed.diagnosis}</p>
                                                </div>
                                            ) : (bed as any).reservedFor ? (
                                                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                                    <p className="text-xs text-blue-600 dark:text-blue-400">Reserved: {(bed as any).reservedFor}</p>
                                                </div>
                                            ) : bed.status === 'MAINTENANCE' ? (
                                                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                                    <p className="text-xs text-amber-600 dark:text-amber-400">Under Maintenance</p>
                                                </div>
                                            ) : null}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bed Details Modal */}
            {selectedBed && (
                <div className="modal-overlay" onClick={() => setSelectedBed(null)}>
                    <div className="modal max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <BedDouble className="w-5 h-5 text-blue-600" />
                                Bed Details - {selectedBed.id}
                            </h2>
                            <button onClick={() => setSelectedBed(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                                <XCircle className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <div className="modal-body space-y-4">
                            <div className={`p-3 rounded-lg ${statusConfig[selectedBed.status].bgColor}`}>
                                <div className="flex items-center gap-2">
                                    <span className={statusConfig[selectedBed.status].color}>{statusConfig[selectedBed.status].icon}</span>
                                    <span className={`font-medium ${statusConfig[selectedBed.status].color}`}>
                                        {statusConfig[selectedBed.status].label}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Room</p>
                                    <p className="font-medium text-slate-900 dark:text-white">{selectedBed.room}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Bed</p>
                                    <p className="font-medium text-slate-900 dark:text-white">{selectedBed.bed}</p>
                                </div>
                            </div>

                            {selectedBed.patient && (
                                <>
                                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                                        <h3 className="font-medium text-slate-700 dark:text-slate-300 mb-3">Patient Information</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                    <User className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-white">{selectedBed.patient}</p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">{selectedBed.age} years old</p>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Diagnosis</p>
                                                <p className="font-medium text-slate-900 dark:text-white">{selectedBed.diagnosis}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Attending Doctor</p>
                                                <p className="font-medium text-slate-900 dark:text-white">{selectedBed.doctor}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Admission Date</p>
                                                <p className="font-medium text-slate-900 dark:text-white">{selectedBed.admissionDate}</p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="modal-footer">
                            {selectedBed.status === 'AVAILABLE' && (
                                <button className="btn btn-primary flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Assign Patient
                                </button>
                            )}
                            {selectedBed.status === 'OCCUPIED' && (
                                <button className="btn btn-secondary flex items-center gap-2">
                                    <Eye className="w-4 h-4" />
                                    View Patient
                                </button>
                            )}
                            <button onClick={() => setSelectedBed(null)} className="btn btn-outline">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
