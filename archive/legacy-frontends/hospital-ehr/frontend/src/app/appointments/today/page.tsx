'use client';

import React from 'react';
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, Phone } from 'lucide-react';

const todayAppointments = [
    { id: 1, time: '09:00 AM', patient: 'Rahul Sharma', age: 45, phone: '9876543210', doctor: 'Dr. Sharma', department: 'Cardiology', status: 'Completed', type: 'Follow-up' },
    { id: 2, time: '09:30 AM', patient: 'Priya Gupta', age: 32, phone: '9876543211', doctor: 'Dr. Gupta', department: 'Gynecology', status: 'Completed', type: 'Consultation' },
    { id: 3, time: '10:00 AM', patient: 'Amit Kumar', age: 28, phone: '9876543212', doctor: 'Dr. Singh', department: 'Orthopedics', status: 'In Progress', type: 'New Patient' },
    { id: 4, time: '10:30 AM', patient: 'Sneha Patel', age: 55, phone: '9876543213', doctor: 'Dr. Patel', department: 'ENT', status: 'Waiting', type: 'Follow-up' },
    { id: 5, time: '11:00 AM', patient: 'Vikram Singh', age: 40, phone: '9876543214', doctor: 'Dr. Verma', department: 'Neurology', status: 'Scheduled', type: 'Consultation' },
    { id: 6, time: '11:30 AM', patient: 'Meera Joshi', age: 38, phone: '9876543215', doctor: 'Dr. Sharma', department: 'Cardiology', status: 'Scheduled', type: 'ECG Test' },
    { id: 7, time: '02:00 PM', patient: 'Rajesh Kumar', age: 50, phone: '9876543216', doctor: 'Dr. Gupta', department: 'Medicine', status: 'Scheduled', type: 'Follow-up' },
    { id: 8, time: '02:30 PM', patient: 'Anita Sharma', age: 35, phone: '9876543217', doctor: 'Dr. Singh', department: 'Dermatology', status: 'Cancelled', type: 'Consultation' },
];

const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
        'Completed': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        'In Progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        'Waiting': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        'Scheduled': 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
        'Cancelled': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return styles[status] || styles['Scheduled'];
};

export default function TodayAppointmentsPage() {
    const stats = {
        total: todayAppointments.length,
        completed: todayAppointments.filter(a => a.status === 'Completed').length,
        inProgress: todayAppointments.filter(a => a.status === 'In Progress').length,
        waiting: todayAppointments.filter(a => a.status === 'Waiting').length,
        scheduled: todayAppointments.filter(a => a.status === 'Scheduled').length,
        cancelled: todayAppointments.filter(a => a.status === 'Cancelled').length,
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Today's Appointments</h1>
                    <p className="text-slate-500 dark:text-slate-400">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="card p-4 text-center">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                    <p className="text-sm text-slate-500">Total</p>
                </div>
                <div className="card p-4 text-center border-l-4 border-l-green-500">
                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                    <p className="text-sm text-slate-500">Completed</p>
                </div>
                <div className="card p-4 text-center border-l-4 border-l-blue-500">
                    <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                    <p className="text-sm text-slate-500">In Progress</p>
                </div>
                <div className="card p-4 text-center border-l-4 border-l-amber-500">
                    <p className="text-2xl font-bold text-amber-600">{stats.waiting}</p>
                    <p className="text-sm text-slate-500">Waiting</p>
                </div>
                <div className="card p-4 text-center border-l-4 border-l-slate-400">
                    <p className="text-2xl font-bold text-slate-600">{stats.scheduled}</p>
                    <p className="text-sm text-slate-500">Scheduled</p>
                </div>
                <div className="card p-4 text-center border-l-4 border-l-red-500">
                    <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                    <p className="text-sm text-slate-500">Cancelled</p>
                </div>
            </div>

            {/* Appointments List */}
            <div className="card">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Time</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Patient</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Doctor</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Department</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {todayAppointments.map((apt) => (
                                <tr key={apt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-4 py-3">
                                        <span className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                                            <Clock className="w-4 h-4 text-slate-400" />
                                            {apt.time}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">{apt.patient}</p>
                                            <p className="text-xs text-slate-500">{apt.age} yrs | {apt.phone}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{apt.doctor}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{apt.department}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{apt.type}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(apt.status)}`}>
                                            {apt.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
                                                Check In
                                            </button>
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
