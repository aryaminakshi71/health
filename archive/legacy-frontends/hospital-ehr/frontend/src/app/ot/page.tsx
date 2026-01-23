'use client';

import React from 'react';
import { Scissors, Clock, Users, Activity, AlertTriangle, CheckCircle, Calendar, BedDouble } from 'lucide-react';

const activeSurgeries = [
    { id: 1, ot: 'OT-1', patient: 'Ramesh Kumar', age: 45, procedure: 'Laparoscopic Cholecystectomy', surgeon: 'Dr. Sharma', anesthetist: 'Dr. Mehta', startTime: '08:30 AM', status: 'In Progress', elapsed: '1h 45m' },
    { id: 2, ot: 'OT-2', patient: 'Sunita Devi', age: 38, procedure: 'Appendectomy', surgeon: 'Dr. Gupta', anesthetist: 'Dr. Singh', startTime: '09:00 AM', status: 'In Progress', elapsed: '1h 15m' },
    { id: 3, ot: 'OT-3', patient: 'Arvind Patel', age: 52, procedure: 'CABG', surgeon: 'Dr. Reddy', anesthetist: 'Dr. Kumar', startTime: '07:00 AM', status: 'Closing', elapsed: '3h 30m' },
];

const scheduledSurgeries = [
    { id: 4, ot: 'OT-1', patient: 'Priya Sharma', age: 29, procedure: 'Cesarean Section', surgeon: 'Dr. Verma', scheduledTime: '11:00 AM', priority: 'Elective' },
    { id: 5, ot: 'OT-2', patient: 'Mohammad Ali', age: 60, procedure: 'Hip Replacement', surgeon: 'Dr. Patel', scheduledTime: '12:30 PM', priority: 'Elective' },
    { id: 6, ot: 'OT-4', patient: 'Deepak Singh', age: 35, procedure: 'Emergency Laparotomy', surgeon: 'Dr. Sharma', scheduledTime: '10:30 AM', priority: 'Emergency' },
];

const otRooms = [
    { id: 'OT-1', name: 'Main OT 1', status: 'Occupied', currentProcedure: 'Cholecystectomy', nextAvailable: '11:00 AM' },
    { id: 'OT-2', name: 'Main OT 2', status: 'Occupied', currentProcedure: 'Appendectomy', nextAvailable: '11:30 AM' },
    { id: 'OT-3', name: 'Cardiac OT', status: 'Occupied', currentProcedure: 'CABG', nextAvailable: '12:00 PM' },
    { id: 'OT-4', name: 'Emergency OT', status: 'Available', currentProcedure: null, nextAvailable: 'Now' },
    { id: 'OT-5', name: 'Minor OT', status: 'Under Maintenance', currentProcedure: null, nextAvailable: 'Tomorrow' },
];

const getStatusColor = (status: string) => {
    switch (status) {
        case 'In Progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        case 'Closing': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
        case 'Completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    }
};

const getOTStatusColor = (status: string) => {
    switch (status) {
        case 'Occupied': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        case 'Available': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        case 'Under Maintenance': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
        default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    }
};

const getPriorityColor = (priority: string) => {
    return priority === 'Emergency' 
        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
};

export default function OTDashboardPage() {
    const stats = {
        totalOTs: otRooms.length,
        occupied: otRooms.filter(r => r.status === 'Occupied').length,
        available: otRooms.filter(r => r.status === 'Available').length,
        scheduled: scheduledSurgeries.length,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Scissors className="w-7 h-7 text-purple-500" />
                        Operation Theatre Dashboard
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Real-time OT monitoring and management</p>
                </div>
                <div className="flex gap-2">
                    <a href="/ot/schedule" className="btn btn-secondary">
                        <Calendar className="w-4 h-4" /> View Schedule
                    </a>
                    <a href="/ot/booking" className="btn btn-primary">
                        <Scissors className="w-4 h-4" /> Book OT
                    </a>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <BedDouble className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalOTs}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Total OTs</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <Activity className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-red-600">{stats.occupied}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">In Use</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
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
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Scheduled Today</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* OT Availability */}
            <div className="card">
                <div className="card-header">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">OT Availability</h2>
                </div>
                <div className="card-body">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {otRooms.map((room) => (
                            <div key={room.id} className={`p-4 rounded-lg border ${room.status === 'Available' ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' : room.status === 'Occupied' ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20' : 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20'}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-slate-900 dark:text-white">{room.id}</span>
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getOTStatusColor(room.status)}`}>
                                        {room.status}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300">{room.name}</p>
                                {room.currentProcedure && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{room.currentProcedure}</p>
                                )}
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Next: {room.nextAvailable}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Active Surgeries */}
            <div className="card">
                <div className="card-header">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-red-500" />
                        Active Surgeries
                    </h2>
                    <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm font-medium">
                        {activeSurgeries.length} Ongoing
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">OT</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Patient</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Procedure</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Surgeon</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Start Time</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Elapsed</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {activeSurgeries.map((surgery) => (
                                <tr key={surgery.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-4 py-3">
                                        <span className="font-bold text-purple-600 dark:text-purple-400">{surgery.ot}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-slate-900 dark:text-white">{surgery.patient}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{surgery.age} years</p>
                                    </td>
                                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{surgery.procedure}</td>
                                    <td className="px-4 py-3">
                                        <p className="text-slate-700 dark:text-slate-300">{surgery.surgeon}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{surgery.anesthetist}</p>
                                    </td>
                                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{surgery.startTime}</td>
                                    <td className="px-4 py-3">
                                        <span className="font-medium text-amber-600 dark:text-amber-400">{surgery.elapsed}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(surgery.status)}`}>
                                            {surgery.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Scheduled Surgeries */}
            <div className="card">
                <div className="card-header">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-500" />
                        Upcoming Surgeries
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">OT</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Patient</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Procedure</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Surgeon</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Scheduled Time</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Priority</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {scheduledSurgeries.map((surgery) => (
                                <tr key={surgery.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${surgery.priority === 'Emergency' ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                                    <td className="px-4 py-3">
                                        <span className="font-bold text-purple-600 dark:text-purple-400">{surgery.ot}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-slate-900 dark:text-white">{surgery.patient}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{surgery.age} years</p>
                                    </td>
                                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{surgery.procedure}</td>
                                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{surgery.surgeon}</td>
                                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{surgery.scheduledTime}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(surgery.priority)}`}>
                                            {surgery.priority}
                                        </span>
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
