'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, AlertTriangle, Clock, CheckCircle, User, Stethoscope, Activity, Phone, FileText, Heart } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SearchInput } from '@/components/ui/SearchInput';

const mockEmergencies = [
    { id: 'EM-001', patient: 'Rajesh Kumar', age: 45, gender: 'M', phone: '9876543210', condition: 'Chest Pain, Breathlessness', severity: 'CRITICAL', status: 'IN_TREATMENT', arrivalTime: '08:30 AM', doctor: 'Dr. Singh', triage: 'Red' },
    { id: 'EM-002', patient: 'Sunita Devi', age: 32, gender: 'F', phone: '9876543211', condition: 'Accident - Head Injury', severity: 'CRITICAL', status: 'WAITING', arrivalTime: '08:45 AM', doctor: null, triage: 'Red' },
    { id: 'EM-003', patient: 'Amit Sharma', age: 28, gender: 'M', phone: '9876543212', condition: 'Severe Abdominal Pain', severity: 'URGENT', status: 'IN_TREATMENT', arrivalTime: '09:00 AM', doctor: 'Dr. Patel', triage: 'Yellow' },
    { id: 'EM-004', patient: 'Priya Singh', age: 25, gender: 'F', phone: '9876543213', condition: 'Asthma Attack', severity: 'URGENT', status: 'WAITING', arrivalTime: '09:15 AM', doctor: null, triage: 'Yellow' },
    { id: 'EM-005', patient: 'Vikram Mehta', age: 55, gender: 'M', phone: '9876543214', condition: 'Fever, Convulsions', severity: 'STABLE', status: 'DISCHARGED', arrivalTime: '07:00 AM', doctor: 'Dr. Mehta', triage: 'Green' },
];

const severityColors: Record<string, string> = {
    CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/30',
    URGENT: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    STABLE: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const triageColors: Record<string, string> = {
    Red: 'bg-red-500',
    Yellow: 'bg-amber-500',
    Green: 'bg-green-500',
    Black: 'bg-slate-500',
};

export default function EmergencyDashboard() {
    const [emergencies] = useState(mockEmergencies);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterSeverity, setFilterSeverity] = useState('ALL');

    const criticalCount = emergencies.filter(e => e.severity === 'CRITICAL' && e.status !== 'DISCHARGED').length;
    const urgentCount = emergencies.filter(e => e.severity === 'URGENT' && e.status !== 'DISCHARGED').length;
    const waitingCount = emergencies.filter(e => e.status === 'WAITING').length;
    const treatedToday = emergencies.filter(e => e.status === 'DISCHARGED').length;

    const filteredEmergencies = emergencies.filter(e => {
        const matchesSearch = e.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             e.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterSeverity === 'ALL' || e.severity === filterSeverity;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="min-h-screen bg-slate-900 p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                            <AlertTriangle className="h-6 w-6 text-red-500" />
                        </div>
                        Emergency Department
                    </h1>
                    <p className="text-slate-400">24/7 Emergency Care • Critical Cases Management</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary">
                        <Phone className="h-4 w-4 mr-2" /> Ambulance
                    </Button>
                    <Button className="bg-red-600 hover:bg-red-700">
                        <Plus className="h-4 w-4 mr-2" /> New Emergency
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-5 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-red-100 text-sm">Critical</p>
                            <p className="text-3xl font-bold">{criticalCount}</p>
                        </div>
                        <AlertTriangle className="h-10 w-10 text-red-200" />
                    </div>
                </div>
                <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 border-l-4 border-l-amber-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Urgent</p>
                            <p className="text-3xl font-bold text-amber-400">{urgentCount}</p>
                        </div>
                        <Clock className="h-6 w-6 text-amber-500" />
                    </div>
                </div>
                <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 border-l-4 border-l-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Waiting</p>
                            <p className="text-3xl font-bold text-blue-400">{waitingCount}</p>
                        </div>
                        <User className="h-6 w-6 text-blue-500" />
                    </div>
                </div>
                <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 border-l-4 border-l-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Treated Today</p>
                            <p className="text-3xl font-bold text-green-400">{treatedToday}</p>
                        </div>
                        <CheckCircle className="h-6 w-6 text-green-500" />
                    </div>
                </div>
            </div>

            {/* Active Emergency Beds */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-700">
                    <h2 className="font-semibold text-white">Emergency Beds Status</h2>
                </div>
                <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {[
                        { id: 'ER-1', status: 'OCCUPIED', patient: 'Rajesh K.', time: '30 min' },
                        { id: 'ER-2', status: 'AVAILABLE', patient: null, time: null },
                        { id: 'ER-3', status: 'OCCUPIED', patient: 'Sunita D.', time: '15 min' },
                        { id: 'ER-4', status: 'AVAILABLE', patient: null, time: null },
                        { id: 'ER-5', status: 'MAINTENANCE', patient: null, time: null },
                        { id: 'ER-6', status: 'AVAILABLE', patient: null, time: null },
                    ].map((bed) => (
                        <div key={bed.id} className={`p-4 rounded-xl border-2 ${
                            bed.status === 'AVAILABLE' ? 'bg-green-500/10 border-green-500/30' :
                            bed.status === 'OCCUPIED' ? 'bg-red-500/10 border-red-500/30' :
                            'bg-slate-700/50 border-slate-600'
                        }`}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-slate-400">{bed.id}</span>
                                <div className={`h-2 w-2 rounded-full ${
                                    bed.status === 'AVAILABLE' ? 'bg-green-500' :
                                    bed.status === 'OCCUPIED' ? 'bg-red-500 animate-pulse' :
                                    'bg-slate-500'
                                }`} />
                            </div>
                            <p className="text-sm font-medium text-white">{bed.patient || 'Available'}</p>
                            {bed.time && <p className="text-xs text-slate-400">{bed.time} ago</p>}
                        </div>
                    ))}
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <SearchInput
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search by patient name or emergency ID..."
                    />
                </div>
                <div className="flex gap-2">
                    {['ALL', 'CRITICAL', 'URGENT', 'STABLE'].map((severity) => (
                        <Button
                            key={severity}
                            variant={filterSeverity === severity ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilterSeverity(severity)}
                            className={filterSeverity === severity ? 'bg-red-600' : ''}
                        >
                            {severity === 'ALL' ? 'All' : severity}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Emergency Cases Table */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-900/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Triage</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">ID</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Patient</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Condition</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Arrival</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Doctor</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Severity</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {filteredEmergencies.map((emergency) => (
                                <tr key={emergency.id} className="hover:bg-slate-700/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className={`h-3 w-3 rounded-full ${triageColors[emergency.triage]}`} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="font-semibold text-red-400">{emergency.id}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold">
                                                {emergency.patient.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{emergency.patient}</p>
                                                <p className="text-xs text-slate-400">{emergency.age} yrs, {emergency.gender}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-300">{emergency.condition}</td>
                                    <td className="px-4 py-3 text-sm text-slate-400">{emergency.arrivalTime}</td>
                                    <td className="px-4 py-3 text-sm text-slate-300">{emergency.doctor || '-'}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-medium border ${severityColors[emergency.severity]}`}>
                                            {emergency.severity}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <StatusBadge status={emergency.status} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-center gap-2">
                                            <Button size="sm" className="bg-red-600 hover:bg-red-700">
                                                <Activity className="h-3 w-3 mr-1" /> Attend
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Contact */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 flex items-center gap-4">
                    <div className="p-3 bg-red-500/20 rounded-full">
                        <Phone className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">Ambulance Service</p>
                        <p className="text-white font-semibold">0124-4206860</p>
                    </div>
                </div>
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 flex items-center gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-full">
                        <Heart className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">Cardiac Emergency</p>
                        <p className="text-white font-semibold">Ext. 101</p>
                    </div>
                </div>
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 flex items-center gap-4">
                    <div className="p-3 bg-green-500/20 rounded-full">
                        <FileText className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">Emergency Protocol</p>
                        <p className="text-white font-semibold">View Guidelines</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
