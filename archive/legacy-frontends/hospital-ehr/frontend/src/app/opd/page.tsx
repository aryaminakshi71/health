'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Clock, Stethoscope, CheckCircle, User } from 'lucide-react';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SearchInput } from '@/components/ui/SearchInput';

const mockVisits = [
    { id: '1', patientName: 'Rahul Sharma', age: 32, gender: 'M', phone: '9876543210', symptoms: 'Fever, Headache', status: 'WAITING', token: 'A001', waitTime: 15, doctor: 'Dr. Patel', department: 'General', registeredAt: '09:15 AM' },
    { id: '2', patientName: 'Priya Gupta', age: 28, gender: 'F', phone: '9876543211', symptoms: 'Pregnancy Checkup', status: 'IN_CONSULTATION', token: 'A002', waitTime: 0, doctor: 'Dr. Mehta', department: 'Obstetrics', registeredAt: '09:30 AM' },
    { id: '3', patientName: 'Amit Kumar', age: 45, gender: 'M', phone: '9876543212', symptoms: 'Chest Pain, Breathlessness', status: 'WAITING', token: 'A003', waitTime: 30, doctor: 'Dr. Singh', department: 'Cardiology', registeredAt: '09:45 AM' },
    { id: '4', patientName: 'Sneha Patel', age: 22, gender: 'F', phone: '9876543213', symptoms: 'Skin Allergy, Rash', status: 'COMPLETED', token: 'A004', waitTime: 0, doctor: 'Dr. Patel', department: 'Dermatology', registeredAt: '08:30 AM' },
    { id: '5', patientName: 'Vikram Joshi', age: 55, gender: 'M', phone: '9876543214', symptoms: 'Diabetes Follow-up', status: 'WAITING', token: 'A005', waitTime: 45, doctor: 'Dr. Reddy', department: 'Endocrinology', registeredAt: '10:00 AM' },
];

export default function OPDDashboard() {
    const [visits] = useState(mockVisits);
    const [searchQuery, setSearchQuery] = useState('');

    const waitingCount = visits.filter(v => v.status === 'WAITING').length;
    const inConsultCount = visits.filter(v => v.status === 'IN_CONSULTATION').length;
    const completedCount = visits.filter(v => v.status === 'COMPLETED').length;

    const filteredVisits = visits.filter(v => 
        v.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.token.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-900 p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">OPD Management</h1>
                    <p className="text-slate-400">Outpatient Department • {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                </div>
                <Link href="/opd/register">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" /> New Patient
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 border-l-4 border-l-amber-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Waiting</p>
                            <p className="text-3xl font-bold text-amber-400">{waitingCount}</p>
                        </div>
                        <div className="p-3 bg-amber-500/20 rounded-full">
                            <Clock className="h-6 w-6 text-amber-500" />
                        </div>
                    </div>
                </div>
                <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 border-l-4 border-l-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">In Consultation</p>
                            <p className="text-3xl font-bold text-blue-400">{inConsultCount}</p>
                        </div>
                        <div className="p-3 bg-blue-500/20 rounded-full">
                            <Stethoscope className="h-6 w-6 text-blue-500" />
                        </div>
                    </div>
                </div>
                <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 border-l-4 border-l-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Completed</p>
                            <p className="text-3xl font-bold text-green-400">{completedCount}</p>
                        </div>
                        <div className="p-3 bg-green-500/20 rounded-full">
                            <CheckCircle className="h-6 w-6 text-green-500" />
                        </div>
                    </div>
                </div>
                <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 border-l-4 border-l-purple-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Total Today</p>
                            <p className="text-3xl font-bold text-white">{visits.length}</p>
                        </div>
                        <div className="p-3 bg-purple-500/20 rounded-full">
                            <User className="h-6 w-6 text-purple-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by patient name or token number..."
            />

            {/* Visits Table */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-900/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Token</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Patient</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Symptoms</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Doctor</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Wait Time</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {filteredVisits.map((visit) => (
                                <tr key={visit.id} className="hover:bg-slate-700/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <span className="font-bold text-white">{visit.token}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                                {visit.patientName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{visit.patientName}</p>
                                                <p className="text-xs text-slate-400">{visit.age} yrs, {visit.gender} • {visit.phone}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-300">{visit.symptoms}</td>
                                    <td className="px-4 py-3 text-sm text-slate-300">{visit.doctor}</td>
                                    <td className="px-4 py-3 text-sm text-slate-400">
                                        {visit.waitTime > 0 ? `${visit.waitTime} min` : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <StatusBadge status={visit.status} />
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                            {visit.status === 'WAITING' ? 'Start' : 'View'}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
