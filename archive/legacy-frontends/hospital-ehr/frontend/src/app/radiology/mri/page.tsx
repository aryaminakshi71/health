'use client';

import React from 'react';
import { Scan, Clock, User, FileText, AlertCircle } from 'lucide-react';

const mriQueue = [
    { id: 1, patient: 'Suresh Yadav', age: 48, area: 'Brain - Contrast', doctor: 'Dr. Verma', time: '10:00 AM', status: 'In Progress', duration: '45 min' },
    { id: 2, patient: 'Meera Devi', age: 52, area: 'Lumbar Spine', doctor: 'Dr. Singh', time: '11:00 AM', status: 'Waiting', duration: '40 min' },
];

export default function MRIPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Scan className="w-7 h-7 text-indigo-500" />
                    MRI Department
                </h1>
                <p className="text-slate-500 dark:text-slate-400">MRI imaging queue and reports</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card p-4">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">2</p>
                    <p className="text-sm text-slate-500">In Queue</p>
                </div>
                <div className="card p-4 border-l-4 border-l-blue-500">
                    <p className="text-2xl font-bold text-blue-600">1</p>
                    <p className="text-sm text-slate-500">In Progress</p>
                </div>
                <div className="card p-4 border-l-4 border-l-green-500">
                    <p className="text-2xl font-bold text-green-600">8</p>
                    <p className="text-sm text-slate-500">Completed</p>
                </div>
                <div className="card p-4">
                    <p className="text-2xl font-bold text-amber-600">~45 min</p>
                    <p className="text-sm text-slate-500">Avg. Scan Time</p>
                </div>
            </div>

            {/* MRI Safety Notice */}
            <div className="card p-4 border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-900/20">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-amber-800 dark:text-amber-200">MRI Safety Reminder</h4>
                        <p className="text-sm text-amber-700 dark:text-amber-300">Ensure all patients are screened for metal implants, pacemakers, and other contraindications before MRI scan.</p>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold text-slate-900 dark:text-white">MRI Queue</h3>
                </div>
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                    {mriQueue.map((patient) => (
                        <div key={patient.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                        <User className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-slate-900 dark:text-white">{patient.patient}</h4>
                                        <p className="text-sm text-slate-500">{patient.age} yrs | {patient.area}</p>
                                        <p className="text-xs text-slate-400 mt-1">{patient.doctor} | Est. {patient.duration}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        patient.status === 'In Progress' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'
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
