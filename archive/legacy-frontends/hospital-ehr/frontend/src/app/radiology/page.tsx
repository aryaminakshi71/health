'use client';

import React from 'react';
import { Scan, Clock, CheckCircle, AlertCircle, FileText, Users } from 'lucide-react';
import Link from 'next/link';

const pendingScans = [
    { id: 1, patient: 'Rahul Sharma', type: 'X-Ray', area: 'Chest', doctor: 'Dr. Gupta', time: '10:30 AM', priority: 'Routine' },
    { id: 2, patient: 'Priya Gupta', type: 'CT Scan', area: 'Abdomen', doctor: 'Dr. Singh', time: '11:00 AM', priority: 'Urgent' },
    { id: 3, patient: 'Amit Kumar', type: 'MRI', area: 'Brain', doctor: 'Dr. Patel', time: '11:30 AM', priority: 'Urgent' },
    { id: 4, patient: 'Sneha Devi', type: 'Ultrasound', area: 'Pelvis', doctor: 'Dr. Sharma', time: '12:00 PM', priority: 'Routine' },
];

const departments = [
    { name: 'X-Ray', icon: '📷', pending: 8, completed: 45, href: '/radiology/xray' },
    { name: 'CT Scan', icon: '🔬', pending: 3, completed: 12, href: '/radiology/ct' },
    { name: 'MRI', icon: '🧲', pending: 2, completed: 8, href: '/radiology/mri' },
    { name: 'Ultrasound', icon: '📊', pending: 5, completed: 28, href: '/radiology/ultrasound' },
];

export default function RadiologyPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Scan className="w-7 h-7 text-purple-500" />
                    Radiology Department
                </h1>
                <p className="text-slate-500 dark:text-slate-400">Manage imaging and diagnostic scans</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card p-4">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">18</p>
                    <p className="text-sm text-slate-500">Pending Scans</p>
                </div>
                <div className="card p-4 border-l-4 border-l-green-500">
                    <p className="text-2xl font-bold text-green-600">93</p>
                    <p className="text-sm text-slate-500">Completed Today</p>
                </div>
                <div className="card p-4 border-l-4 border-l-amber-500">
                    <p className="text-2xl font-bold text-amber-600">5</p>
                    <p className="text-sm text-slate-500">Reports Pending</p>
                </div>
                <div className="card p-4 border-l-4 border-l-blue-500">
                    <p className="text-2xl font-bold text-blue-600">4</p>
                    <p className="text-sm text-slate-500">Machines Active</p>
                </div>
            </div>

            {/* Departments */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {departments.map((dept) => (
                    <Link key={dept.name} href={dept.href}>
                        <div className="card p-5 hover:shadow-md transition-shadow cursor-pointer">
                            <div className="text-3xl mb-2">{dept.icon}</div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">{dept.name}</h3>
                            <div className="flex gap-4 mt-2 text-sm">
                                <span className="text-amber-600">{dept.pending} Pending</span>
                                <span className="text-green-600">{dept.completed} Done</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Pending Scans */}
            <div className="card">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold text-slate-900 dark:text-white">Pending Scans</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Patient</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Scan Type</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Area</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Doctor</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Time</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Priority</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {pendingScans.map((scan) => (
                                <tr key={scan.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{scan.patient}</td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{scan.type}</td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{scan.area}</td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{scan.doctor}</td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{scan.time}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            scan.priority === 'Urgent' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                                        }`}>
                                            {scan.priority}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                                            Start Scan
                                        </button>
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
