'use client';

import React from 'react';
import { Scan, Clock, CheckCircle, User, FileText } from 'lucide-react';

const ctQueue = [
    { id: 1, patient: 'Rajesh Kumar', age: 58, area: 'Brain - Contrast', doctor: 'Dr. Sharma', time: '10:30 AM', status: 'In Progress', duration: '15 min' },
    { id: 2, patient: 'Priya Gupta', age: 42, area: 'Chest HRCT', doctor: 'Dr. Gupta', time: '11:00 AM', status: 'Waiting', duration: '20 min' },
    { id: 3, patient: 'Amit Kumar', age: 55, area: 'Abdomen', doctor: 'Dr. Patel', time: '11:30 AM', status: 'Waiting', duration: '25 min' },
];

export default function CTScanPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Scan className="w-7 h-7 text-purple-500" />
                    CT Scan Department
                </h1>
                <p className="text-slate-500 dark:text-slate-400">CT imaging queue and reports</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card p-4">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">3</p>
                    <p className="text-sm text-slate-500">In Queue</p>
                </div>
                <div className="card p-4 border-l-4 border-l-blue-500">
                    <p className="text-2xl font-bold text-blue-600">1</p>
                    <p className="text-sm text-slate-500">In Progress</p>
                </div>
                <div className="card p-4 border-l-4 border-l-green-500">
                    <p className="text-2xl font-bold text-green-600">12</p>
                    <p className="text-sm text-slate-500">Completed</p>
                </div>
                <div className="card p-4 border-l-4 border-l-amber-500">
                    <p className="text-2xl font-bold text-amber-600">2</p>
                    <p className="text-sm text-slate-500">Reports Pending</p>
                </div>
            </div>

            <div className="card">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold text-slate-900 dark:text-white">CT Scan Queue</h3>
                </div>
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                    {ctQueue.map((patient) => (
                        <div key={patient.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                        <User className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-slate-900 dark:text-white">{patient.patient}</h4>
                                        <p className="text-sm text-slate-500">{patient.age} yrs | {patient.area}</p>
                                        <p className="text-xs text-slate-400 mt-1">{patient.doctor} | Est. {patient.duration}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        patient.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                                    }`}>
                                        {patient.status}
                                    </span>
                                    <p className="text-xs text-slate-500 mt-1">{patient.time}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
