'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    BedDouble, UserPlus, LogOut, AlertTriangle, Search, Filter,
    Users, Activity, Clock, ArrowUpRight, HeartPulse, Stethoscope
} from 'lucide-react';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SearchInput } from '@/components/ui/SearchInput';

// Complete mock data
const mockBeds = [
    { id: '1', ward: 'General Ward', room: '101', bed: 'A', status: 'AVAILABLE', type: 'GENERAL', patient: null, admDate: null, doctor: null },
    { id: '2', ward: 'General Ward', room: '101', bed: 'B', status: 'OCCUPIED', type: 'GENERAL', patient: 'Rahul Sharma', admDate: '2024-12-26', doctor: 'Dr. Patel', diagnosis: 'Typhoid' },
    { id: '3', ward: 'General Ward', room: '102', bed: 'A', status: 'OCCUPIED', type: 'GENERAL', patient: 'Priya Gupta', admDate: '2024-12-25', doctor: 'Dr. Mehta', diagnosis: 'Dengue' },
    { id: '4', ward: 'General Ward', room: '102', bed: 'B', status: 'AVAILABLE', type: 'GENERAL', patient: null, admDate: null, doctor: null },
    { id: '5', ward: 'ICU', room: '201', bed: 'A', status: 'OCCUPIED', type: 'ICU', patient: 'Amit Kumar', admDate: '2024-12-24', doctor: 'Dr. Singh', diagnosis: 'MI', critical: true },
    { id: '6', ward: 'ICU', room: '201', bed: 'B', status: 'OCCUPIED', type: 'ICU', patient: 'Vikram Joshi', admDate: '2024-12-27', doctor: 'Dr. Singh', diagnosis: 'Pneumonia', critical: true },
    { id: '7', ward: 'ICU', room: '202', bed: 'A', status: 'MAINTENANCE', type: 'ICU', patient: null, admDate: null, doctor: null },
    { id: '8', ward: 'ICU', room: '202', bed: 'B', status: 'AVAILABLE', type: 'ICU', patient: null, admDate: null, doctor: null },
    { id: '9', ward: 'Private Ward', room: '301', bed: 'A', status: 'OCCUPIED', type: 'PRIVATE', patient: 'Sneha Patel', admDate: '2024-12-26', doctor: 'Dr. Reddy', diagnosis: 'Post-surgery' },
    { id: '10', ward: 'Private Ward', room: '302', bed: 'A', status: 'AVAILABLE', type: 'PRIVATE', patient: null, admDate: null, doctor: null },
    { id: '11', ward: 'Maternity', room: '401', bed: 'A', status: 'OCCUPIED', type: 'MATERNITY', patient: 'Kavita Singh', admDate: '2024-12-27', doctor: 'Dr. Mehta', diagnosis: 'Normal Delivery' },
    { id: '12', ward: 'Maternity', room: '401', bed: 'B', status: 'AVAILABLE', type: 'MATERNITY', patient: null, admDate: null, doctor: null },
];

const recentAdmissions = [
    { patient: 'Kavita Singh', ward: 'Maternity', time: '2 hrs ago', type: 'admission' },
    { patient: 'Vikram Joshi', ward: 'ICU', time: '5 hrs ago', type: 'admission' },
    { patient: 'Rajesh Verma', ward: 'General', time: '1 day ago', type: 'discharge' },
];

const statusColors: Record<string, string> = {
    AVAILABLE: 'bg-green-500',
    OCCUPIED: 'bg-red-500',
    MAINTENANCE: 'bg-yellow-500',
    RESERVED: 'bg-blue-500',
};

const statusBg: Record<string, string> = {
    AVAILABLE: 'bg-green-500/20 border-green-500/30 hover:bg-green-500/30',
    OCCUPIED: 'bg-red-500/20 border-red-500/30 hover:bg-red-500/30',
    MAINTENANCE: 'bg-yellow-500/20 border-yellow-500/30 hover:bg-yellow-500/30',
    RESERVED: 'bg-blue-500/20 border-blue-500/30 hover:bg-blue-500/30',
};

export default function IPDDashboard() {
    const [beds] = useState(mockBeds);
    const [selectedWard, setSelectedWard] = useState('ALL');
    const [showAdmitModal, setShowAdmitModal] = useState(false);

    const totalBeds = beds.length;
    const occupiedBeds = beds.filter(b => b.status === 'OCCUPIED').length;
    const availableBeds = beds.filter(b => b.status === 'AVAILABLE').length;
    const icuBeds = beds.filter(b => b.type === 'ICU' && b.status === 'AVAILABLE').length;
    const occupancyRate = Math.round((occupiedBeds / totalBeds) * 100);

    const wards = ['ALL', ...new Set(beds.map(b => b.ward))];
    const filteredBeds = selectedWard === 'ALL' ? beds : beds.filter(b => b.ward === selectedWard);

    // Group by ward for display
    const groupedBeds = filteredBeds.reduce((acc, bed) => {
        if (!acc[bed.ward]) acc[bed.ward] = [];
        acc[bed.ward].push(bed);
        return acc;
    }, {} as Record<string, typeof beds>);

    return (
        <div className="min-h-screen bg-slate-900 p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">IPD Management</h1>
                    <p className="text-slate-400">Inpatient Department • Bed Status & Admissions</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary">
                        <LogOut className="h-4 w-4 mr-2" /> Discharge
                    </Button>
                    <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setShowAdmitModal(true)}>
                        <UserPlus className="h-4 w-4 mr-2" /> Admit Patient
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-5 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm">Total Beds</p>
                            <p className="text-3xl font-bold">{totalBeds}</p>
                        </div>
                        <BedDouble className="h-8 w-8 text-purple-200" />
                    </div>
                </div>
                <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 border-l-4 border-l-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Available</p>
                            <p className="text-3xl font-bold text-green-400">{availableBeds}</p>
                        </div>
                        <div className="p-2 bg-green-500/20 rounded-full">
                            <BedDouble className="h-5 w-5 text-green-500" />
                        </div>
                    </div>
                </div>
                <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 border-l-4 border-l-red-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Occupied</p>
                            <p className="text-3xl font-bold text-red-400">{occupiedBeds}</p>
                        </div>
                        <div className="p-2 bg-red-500/20 rounded-full">
                            <Users className="h-5 w-5 text-red-500" />
                        </div>
                    </div>
                </div>
                <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 border-l-4 border-l-orange-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">ICU Available</p>
                            <p className="text-3xl font-bold text-orange-400">{icuBeds}</p>
                        </div>
                        <div className="p-2 bg-orange-500/20 rounded-full">
                            <HeartPulse className="h-5 w-5 text-orange-500" />
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-5 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm">Occupancy</p>
                            <p className="text-3xl font-bold">{occupancyRate}%</p>
                        </div>
                        <Activity className="h-8 w-8 text-blue-200" />
                    </div>
                </div>
            </div>

            {/* Ward Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {wards.map((ward) => (
                    <Button
                        key={ward}
                        variant={selectedWard === ward ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedWard(ward)}
                        className={selectedWard === ward ? 'bg-purple-600' : ''}
                    >
                        {ward === 'ALL' ? 'All Wards' : ward}
                    </Button>
                ))}
            </div>

            {/* Bed Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {Object.entries(groupedBeds).map(([wardName, wardBeds]) => (
                        <div key={wardName} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                            <div className="bg-slate-900/50 px-5 py-4 border-b border-slate-700 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <BedDouble className="h-5 w-5 text-purple-500" />
                                    <span className="font-semibold text-white">{wardName}</span>
                                    <span className="text-sm text-slate-400 ml-2">
                                        ({wardBeds.filter(b => b.status === 'AVAILABLE').length} available)
                                    </span>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {wardBeds.map((bed) => (
                                        <div
                                            key={bed.id}
                                            className={`relative border-2 rounded-xl p-4 transition-all cursor-pointer ${statusBg[bed.status]}`}
                                        >
                                            {/* Status indicator */}
                                            <div className={`absolute top-2 right-2 h-3 w-3 rounded-full ${statusColors[bed.status]}`} />

                                            {/* Bed Info */}
                                            <div className="flex items-center gap-2 mb-2">
                                                <BedDouble className={`h-5 w-5 ${bed.status === 'OCCUPIED' ? 'text-red-400' : 'text-slate-400'}`} />
                                                <span className="font-bold text-sm text-white">
                                                    {bed.room}-{bed.bed}
                                                </span>
                                            </div>

                                            {bed.patient ? (
                                                <div className="space-y-1">
                                                    <p className="font-medium text-sm text-white truncate">{bed.patient}</p>
                                                    <p className="text-xs text-slate-400">{bed.diagnosis}</p>
                                                    <p className="text-xs text-slate-500">{bed.doctor}</p>
                                                    {(bed as any).critical && (
                                                        <span className="inline-flex items-center gap-1 text-xs text-red-400 font-medium">
                                                            <AlertTriangle className="h-3 w-3" /> Critical
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-slate-400">
                                                    {bed.status === 'MAINTENANCE' ? 'Under Maintenance' : 'Available'}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Activity Sidebar */}
                <div className="space-y-6">
                    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-700">
                            <h3 className="font-semibold text-white">Recent Activity</h3>
                        </div>
                        <div className="p-4 space-y-4">
                            {recentAdmissions.map((activity, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                                    <div className={`p-2 rounded-full ${activity.type === 'admission' ? 'bg-green-500/20' : 'bg-blue-500/20'}`}>
                                        {activity.type === 'admission' ? (
                                            <UserPlus className={`h-4 w-4 ${activity.type === 'admission' ? 'text-green-400' : 'text-blue-400'}`} />
                                        ) : (
                                            <LogOut className="h-4 w-4 text-blue-400" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm text-white">{activity.patient}</p>
                                        <p className="text-xs text-slate-400">{activity.type === 'admission' ? 'Admitted to' : 'Discharged from'} {activity.ward}</p>
                                    </div>
                                    <span className="text-xs text-slate-500">{activity.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-700">
                            <h3 className="text-sm font-semibold text-white">Legend</h3>
                        </div>
                        <div className="p-4 space-y-2">
                            {[
                                { status: 'Available', color: 'bg-green-500' },
                                { status: 'Occupied', color: 'bg-red-500' },
                                { status: 'Maintenance', color: 'bg-yellow-500' },
                                { status: 'Reserved', color: 'bg-blue-500' },
                            ].map((item) => (
                                <div key={item.status} className="flex items-center gap-2">
                                    <div className={`h-3 w-3 rounded-full ${item.color}`} />
                                    <span className="text-sm text-slate-300">{item.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
