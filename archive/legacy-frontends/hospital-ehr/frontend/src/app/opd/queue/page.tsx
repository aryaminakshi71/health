'use client';

import React, { useState } from 'react';
import {
    Clock,
    Users,
    UserCheck,
    AlertCircle,
    Search,
    Filter,
    RefreshCw,
    Bell,
    Stethoscope,
    ArrowRight,
    Timer,
    Volume2
} from 'lucide-react';

// Mock queue data
const mockQueueData = [
    { id: '1', token: 'A001', patientName: 'Rahul Sharma', age: 32, gender: 'M', phone: '9876543210', department: 'General Medicine', doctor: 'Dr. Patel', status: 'WAITING', registeredAt: '09:15 AM', waitTime: 45, priority: 'NORMAL' },
    { id: '2', token: 'A002', patientName: 'Priya Gupta', age: 28, gender: 'F', phone: '9876543211', department: 'Gynecology', doctor: 'Dr. Mehta', status: 'IN_CONSULTATION', registeredAt: '09:20 AM', waitTime: 0, priority: 'NORMAL' },
    { id: '3', token: 'A003', patientName: 'Amit Kumar', age: 55, gender: 'M', phone: '9876543212', department: 'Cardiology', doctor: 'Dr. Singh', status: 'WAITING', registeredAt: '09:30 AM', waitTime: 35, priority: 'URGENT' },
    { id: '4', token: 'A004', patientName: 'Sneha Patel', age: 22, gender: 'F', phone: '9876543213', department: 'Dermatology', doctor: 'Dr. Reddy', status: 'WAITING', registeredAt: '09:35 AM', waitTime: 30, priority: 'NORMAL' },
    { id: '5', token: 'A005', patientName: 'Vikram Joshi', age: 45, gender: 'M', phone: '9876543214', department: 'General Medicine', doctor: 'Dr. Patel', status: 'CALLED', registeredAt: '09:40 AM', waitTime: 25, priority: 'NORMAL' },
    { id: '6', token: 'A006', patientName: 'Kavita Singh', age: 38, gender: 'F', phone: '9876543215', department: 'Orthopedics', doctor: 'Dr. Verma', status: 'WAITING', registeredAt: '09:45 AM', waitTime: 20, priority: 'NORMAL' },
    { id: '7', token: 'A007', patientName: 'Rajesh Verma', age: 60, gender: 'M', phone: '9876543216', department: 'Cardiology', doctor: 'Dr. Singh', status: 'WAITING', registeredAt: '09:50 AM', waitTime: 15, priority: 'URGENT' },
    { id: '8', token: 'A008', patientName: 'Anita Desai', age: 35, gender: 'F', phone: '9876543217', department: 'ENT', doctor: 'Dr. Sharma', status: 'COMPLETED', registeredAt: '08:30 AM', waitTime: 0, priority: 'NORMAL' },
    { id: '9', token: 'A009', patientName: 'Suresh Yadav', age: 48, gender: 'M', phone: '9876543218', department: 'Neurology', doctor: 'Dr. Gupta', status: 'IN_CONSULTATION', registeredAt: '09:00 AM', waitTime: 0, priority: 'NORMAL' },
    { id: '10', token: 'A010', patientName: 'Meera Agarwal', age: 29, gender: 'F', phone: '9876543219', department: 'General Medicine', doctor: 'Dr. Patel', status: 'WAITING', registeredAt: '10:00 AM', waitTime: 10, priority: 'NORMAL' },
];

const doctorAssignments = [
    { name: 'Dr. Patel', department: 'General Medicine', room: '101', currentToken: 'A005', queueCount: 3, status: 'AVAILABLE' },
    { name: 'Dr. Mehta', department: 'Gynecology', room: '102', currentToken: 'A002', queueCount: 1, status: 'BUSY' },
    { name: 'Dr. Singh', department: 'Cardiology', room: '103', currentToken: '-', queueCount: 2, status: 'AVAILABLE' },
    { name: 'Dr. Reddy', department: 'Dermatology', room: '104', currentToken: '-', queueCount: 1, status: 'BREAK' },
    { name: 'Dr. Verma', department: 'Orthopedics', room: '105', currentToken: '-', queueCount: 1, status: 'AVAILABLE' },
    { name: 'Dr. Gupta', department: 'Neurology', room: '106', currentToken: 'A009', queueCount: 0, status: 'BUSY' },
];

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    WAITING: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'Waiting' },
    CALLED: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Called' },
    IN_CONSULTATION: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'In Consultation' },
    COMPLETED: { bg: 'bg-slate-500/20', text: 'text-slate-400', label: 'Completed' },
};

const doctorStatusConfig: Record<string, { bg: string; text: string }> = {
    AVAILABLE: { bg: 'bg-green-500', text: 'Available' },
    BUSY: { bg: 'bg-red-500', text: 'In Consultation' },
    BREAK: { bg: 'bg-amber-500', text: 'On Break' },
};

export default function OPDQueuePage() {
    const [queue] = useState(mockQueueData);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('ALL');

    const waitingCount = queue.filter(p => p.status === 'WAITING').length;
    const inConsultCount = queue.filter(p => p.status === 'IN_CONSULTATION').length;
    const completedCount = queue.filter(p => p.status === 'COMPLETED').length;
    const avgWaitTime = Math.round(queue.filter(p => p.status === 'WAITING').reduce((acc, p) => acc + p.waitTime, 0) / waitingCount) || 0;

    const departments = ['ALL', ...new Set(queue.map(p => p.department))];

    const filteredQueue = queue.filter(p => {
        const matchesSearch = p.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.token.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDept = selectedDepartment === 'ALL' || p.department === selectedDepartment;
        return matchesSearch && matchesDept;
    });

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">OPD Patient Queue</h1>
                    <p className="text-slate-600 dark:text-slate-400">Real-time queue management and patient tracking</p>
                </div>
                <div className="flex gap-3">
                    <button className="btn btn-secondary flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </button>
                    <button className="btn btn-primary flex items-center gap-2">
                        <Volume2 className="h-4 w-4" />
                        Call Next
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card p-5 border-l-4 border-l-amber-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Waiting</p>
                            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{waitingCount}</p>
                        </div>
                        <div className="p-3 bg-amber-100 dark:bg-amber-500/20 rounded-full">
                            <Clock className="h-6 w-6 text-amber-600 dark:text-amber-500" />
                        </div>
                    </div>
                </div>
                <div className="card p-5 border-l-4 border-l-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">In Consultation</p>
                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{inConsultCount}</p>
                        </div>
                        <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-full">
                            <Stethoscope className="h-6 w-6 text-blue-600 dark:text-blue-500" />
                        </div>
                    </div>
                </div>
                <div className="card p-5 border-l-4 border-l-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Completed</p>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{completedCount}</p>
                        </div>
                        <div className="p-3 bg-green-100 dark:bg-green-500/20 rounded-full">
                            <UserCheck className="h-6 w-6 text-green-600 dark:text-green-500" />
                        </div>
                    </div>
                </div>
                <div className="card p-5 border-l-4 border-l-purple-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Avg Wait Time</p>
                            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{avgWaitTime}m</p>
                        </div>
                        <div className="p-3 bg-purple-100 dark:bg-purple-500/20 rounded-full">
                            <Timer className="h-6 w-6 text-purple-600 dark:text-purple-500" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Queue List */}
                <div className="xl:col-span-2 space-y-4">
                    {/* Filters */}
                    <div className="card p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name or token..."
                                    className="input pl-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <select
                                className="input w-full md:w-48"
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                            >
                                {departments.map(dept => (
                                    <option key={dept} value={dept}>{dept === 'ALL' ? 'All Departments' : dept}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Queue Table */}
                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr>
                                        <th>Token</th>
                                        <th>Patient</th>
                                        <th>Department</th>
                                        <th>Doctor</th>
                                        <th>Wait Time</th>
                                        <th>Status</th>
                                        <th className="text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredQueue.map((patient) => (
                                        <tr key={patient.id} className={patient.priority === 'URGENT' ? 'bg-red-50 dark:bg-red-500/10' : ''}>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-900 dark:text-white">{patient.token}</span>
                                                    {patient.priority === 'URGENT' && (
                                                        <AlertCircle className="h-4 w-4 text-red-500" />
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-white">{patient.patientName}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{patient.age} yrs, {patient.gender}</p>
                                                </div>
                                            </td>
                                            <td className="text-slate-600 dark:text-slate-300">{patient.department}</td>
                                            <td className="text-slate-600 dark:text-slate-300">{patient.doctor}</td>
                                            <td>
                                                {patient.status === 'WAITING' ? (
                                                    <span className={`font-medium ${patient.waitTime > 30 ? 'text-red-500' : 'text-slate-600 dark:text-slate-300'}`}>
                                                        {patient.waitTime} min
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`badge ${statusConfig[patient.status].bg} ${statusConfig[patient.status].text}`}>
                                                    {statusConfig[patient.status].label}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                {patient.status === 'WAITING' && (
                                                    <button className="btn btn-primary text-sm py-1 px-3">
                                                        Call <Bell className="h-3 w-3 ml-1" />
                                                    </button>
                                                )}
                                                {patient.status === 'CALLED' && (
                                                    <button className="btn btn-success text-sm py-1 px-3">
                                                        Start <ArrowRight className="h-3 w-3 ml-1" />
                                                    </button>
                                                )}
                                                {patient.status === 'IN_CONSULTATION' && (
                                                    <span className="text-sm text-green-500">In Progress</span>
                                                )}
                                                {patient.status === 'COMPLETED' && (
                                                    <span className="text-sm text-slate-400">Done</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Doctor Assignments Sidebar */}
                <div className="space-y-4">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <Users className="h-5 w-5 text-blue-500" />
                                Doctor Assignments
                            </h3>
                        </div>
                        <div className="card-body space-y-3">
                            {doctorAssignments.map((doctor, index) => (
                                <div key={index} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">{doctor.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{doctor.department}</p>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className={`h-2 w-2 rounded-full ${doctorStatusConfig[doctor.status].bg}`} />
                                            <span className="text-xs text-slate-500 dark:text-slate-400">{doctorStatusConfig[doctor.status].text}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500 dark:text-slate-400">Room {doctor.room}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-slate-600 dark:text-slate-300">
                                                Current: <span className="font-semibold text-blue-600 dark:text-blue-400">{doctor.currentToken}</span>
                                            </span>
                                            <span className="text-slate-600 dark:text-slate-300">
                                                Queue: <span className="font-semibold">{doctor.queueCount}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="font-semibold text-slate-900 dark:text-white">Queue Summary</h3>
                        </div>
                        <div className="card-body">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600 dark:text-slate-400">Total Registered</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">{queue.length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600 dark:text-slate-400">Urgent Cases</span>
                                    <span className="font-semibold text-red-500">{queue.filter(p => p.priority === 'URGENT').length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600 dark:text-slate-400">Avg Service Time</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">12 min</span>
                                </div>
                                <div className="h-px bg-slate-200 dark:bg-slate-700 my-2" />
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600 dark:text-slate-400">Est. Clear Time</span>
                                    <span className="font-semibold text-green-600 dark:text-green-400">2:30 PM</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
