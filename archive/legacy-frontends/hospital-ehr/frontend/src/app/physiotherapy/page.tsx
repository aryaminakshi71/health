'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Activity, Clock, User, Calendar, FileText, CheckCircle, Timer } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SearchInput } from '@/components/ui/SearchInput';

const mockPhysioSessions = [
    { id: 'PT-001', patient: 'Rahul Sharma', age: 45, gender: 'M', therapy: 'Physiotherapy - Back Pain', therapist: 'Dr. Amit Kumar', status: 'IN_PROGRESS', startTime: '09:00 AM', duration: 45, exercises: ['Back Extension', 'Stretching', 'TENS'], progress: 60 },
    { id: 'PT-002', patient: 'Priya Gupta', age: 32, gender: 'F', therapy: 'Post-Surgery Rehab', therapist: 'Dr. Amit Kumar', status: 'WAITING', startTime: '10:00 AM', duration: 60, exercises: ['Mobility Training', 'Strengthening'], progress: 0 },
    { id: 'PT-003', patient: 'Amit Kumar', age: 55, gender: 'M', therapy: 'Knee Replacement Rehab', therapist: 'Dr. Neha Singh', status: 'COMPLETED', startTime: '08:00 AM', duration: 45, exercises: ['Leg Raises', 'Walking', 'Balance'], progress: 100 },
    { id: 'PT-004', patient: 'Sneha Patel', age: 28, gender: 'F', therapy: 'Sports Injury', therapist: 'Dr. Amit Kumar', status: 'WAITING', startTime: '10:45 AM', duration: 30, exercises: ['Ice Therapy', 'Ultrasound'], progress: 0 },
    { id: 'PT-005', patient: 'Vikram Joshi', age: 60, gender: 'M', therapy: 'Stroke Rehab', therapist: 'Dr. Neha Singh', status: 'SCHEDULED', startTime: '11:30 AM', duration: 60, exercises: ['Speech Therapy', 'Motor Skills'], progress: 0 },
];

const therapists = [
    { id: 'T1', name: 'Dr. Amit Kumar', specialization: 'Orthopedic Rehab', patientsToday: 8 },
    { id: 'T2', name: 'Dr. Neha Singh', specialization: 'Neurological Rehab', patientsToday: 6 },
    { id: 'T3', name: 'Dr. Rajesh Patel', specialization: 'Sports Medicine', patientsToday: 5 },
];

const therapyTypes = [
    'Physiotherapy - Back Pain',
    'Physiotherapy - Neck Pain',
    'Post-Surgery Rehab',
    'Knee Replacement Rehab',
    'Sports Injury',
    'Stroke Rehab',
    'Frozen Shoulder',
    'Tennis Elbow',
];

const statusColors: Record<string, string> = {
    SCHEDULED: 'bg-slate-700 text-slate-300',
    WAITING: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    IN_PROGRESS: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    COMPLETED: 'bg-green-500/20 text-green-400 border border-green-500/30',
    CANCELLED: 'bg-red-500/20 text-red-400 border border-red-500/30',
};

export default function PhysiotherapyDashboard() {
    const [sessions] = useState(mockPhysioSessions);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    const waitingCount = sessions.filter(s => s.status === 'WAITING').length;
    const inProgressCount = sessions.filter(s => s.status === 'IN_PROGRESS').length;
    const completedToday = sessions.filter(s => s.status === 'COMPLETED').length;
    const scheduledCount = sessions.filter(s => s.status === 'SCHEDULED').length;

    const filteredSessions = sessions.filter(s => {
        const matchesSearch = s.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             s.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'ALL' || s.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="min-h-screen bg-slate-900 p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                            <Activity className="h-6 w-6 text-green-500" />
                        </div>
                        Physiotherapy Department
                    </h1>
                    <p className="text-slate-400">Rehabilitation • Sports Medicine • Orthopedic Care</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary">
                        <Calendar className="h-4 w-4 mr-2" /> Schedule
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700">
                        <Plus className="h-4 w-4 mr-2" /> New Session
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 border-l-4 border-l-amber-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Waiting</p>
                            <p className="text-3xl font-bold text-amber-400">{waitingCount}</p>
                        </div>
                        <Clock className="h-6 w-6 text-amber-500" />
                    </div>
                </div>
                <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 border-l-4 border-l-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">In Progress</p>
                            <p className="text-3xl font-bold text-blue-400">{inProgressCount}</p>
                        </div>
                        <Timer className="h-6 w-6 text-blue-500" />
                    </div>
                </div>
                <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 border-l-4 border-l-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Completed Today</p>
                            <p className="text-3xl font-bold text-green-400">{completedToday}</p>
                        </div>
                        <CheckCircle className="h-6 w-6 text-green-500" />
                    </div>
                </div>
                <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 border-l-4 border-l-purple-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Scheduled</p>
                            <p className="text-3xl font-bold text-purple-400">{scheduledCount}</p>
                        </div>
                        <Calendar className="h-6 w-6 text-purple-500" />
                    </div>
                </div>
            </div>

            {/* Therapists Overview */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-700">
                    <h2 className="font-semibold text-white">Our Therapists</h2>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {therapists.map((therapist) => (
                        <div key={therapist.id} className="bg-slate-700/50 rounded-lg p-4 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-lg">
                                {therapist.name.split(' ').slice(1).map(n => n[0]).join('')}
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-white">{therapist.name}</p>
                                <p className="text-sm text-slate-400">{therapist.specialization}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-green-400">{therapist.patientsToday}</p>
                                <p className="text-xs text-slate-400">patients today</p>
                            </div>
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
                        placeholder="Search by patient name or session ID..."
                    />
                </div>
                <div className="flex gap-2">
                    {['ALL', 'SCHEDULED', 'WAITING', 'IN_PROGRESS', 'COMPLETED'].map((status) => (
                        <Button
                            key={status}
                            variant={filterStatus === status ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilterStatus(status)}
                            className={filterStatus === status ? 'bg-green-600' : ''}
                        >
                            {status === 'ALL' ? 'All' : status.replace('_', ' ')}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Sessions Table */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-900/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Session</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Patient</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Therapy</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Therapist</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Schedule</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Exercises</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Progress</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {filteredSessions.map((session) => (
                                <tr key={session.id} className="hover:bg-slate-700/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <span className="font-semibold text-green-400">{session.id}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold">
                                                {session.patient.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{session.patient}</p>
                                                <p className="text-xs text-slate-400">{session.age} yrs, {session.gender}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-300">{session.therapy}</td>
                                    <td className="px-4 py-3 text-sm text-slate-300">{session.therapist}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2 text-sm text-slate-300">
                                            <Clock className="h-4 w-4 text-slate-400" />
                                            {session.startTime} • {session.duration} min
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {session.exercises.slice(0, 2).map((ex) => (
                                                <span key={ex} className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded">
                                                    {ex}
                                                </span>
                                            ))}
                                            {session.exercises.length > 2 && (
                                                <span className="px-2 py-0.5 bg-slate-700 text-slate-400 text-xs rounded">
                                                    +{session.exercises.length - 2}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-green-500 rounded-full"
                                                    style={{ width: `${session.progress}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-slate-400">{session.progress}%</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-medium border ${statusColors[session.status]}`}>
                                            {session.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-center gap-2">
                                            {session.status === 'WAITING' && (
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                                    <Activity className="h-3 w-3 mr-1" /> Start
                                                </Button>
                                            )}
                                            {session.status === 'IN_PROGRESS' && (
                                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                                    <CheckCircle className="h-3 w-3 mr-1" /> Complete
                                                </Button>
                                            )}
                                            {session.status === 'COMPLETED' && (
                                                <Button size="sm" variant="secondary">
                                                    <FileText className="h-3 w-3 mr-1" /> Report
                                                </Button>
                                            )}
                                        </div>
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
