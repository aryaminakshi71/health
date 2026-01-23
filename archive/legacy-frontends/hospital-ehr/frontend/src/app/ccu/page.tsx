'use client';

import React from 'react';
import { Heart, Activity, BedDouble, AlertTriangle, Zap } from 'lucide-react';

const ccuPatients = [
    { id: 1, bed: 'CCU-01', name: 'Rajesh Kumar', age: 58, diagnosis: 'Acute MI', doctor: 'Dr. Sharma', status: 'Critical', ecg: 'ST Elevation', troponin: 2.5, days: 1 },
    { id: 2, bed: 'CCU-02', name: 'Sunita Devi', age: 65, diagnosis: 'Heart Failure', doctor: 'Dr. Gupta', status: 'Stable', ecg: 'AF', troponin: 0.8, days: 3 },
    { id: 3, bed: 'CCU-03', name: 'Mohan Singh', age: 70, diagnosis: 'Unstable Angina', doctor: 'Dr. Patel', status: 'Critical', ecg: 'ST Depression', troponin: 1.2, days: 2 },
    { id: 4, bed: 'CCU-04', name: 'Kamla Sharma', age: 55, diagnosis: 'Post Angioplasty', doctor: 'Dr. Verma', status: 'Stable', ecg: 'Normal', troponin: 0.3, days: 1 },
    { id: 5, bed: 'CCU-05', name: 'Ramesh Yadav', age: 62, diagnosis: 'Cardiomyopathy', doctor: 'Dr. Sharma', status: 'Stable', ecg: 'LBBB', troponin: 0.5, days: 5 },
];

export default function CCUPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Heart className="w-7 h-7 text-red-500" />
                        Cardiac Care Unit (CCU)
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Cardiac intensive care monitoring</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card p-4">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{ccuPatients.length}/8</p>
                    <p className="text-sm text-slate-500">Beds Occupied</p>
                </div>
                <div className="card p-4 border-l-4 border-l-red-500">
                    <p className="text-2xl font-bold text-red-600">{ccuPatients.filter(p => p.status === 'Critical').length}</p>
                    <p className="text-sm text-slate-500">Critical</p>
                </div>
                <div className="card p-4 border-l-4 border-l-amber-500">
                    <p className="text-2xl font-bold text-amber-600">{ccuPatients.filter(p => p.troponin > 1).length}</p>
                    <p className="text-sm text-slate-500">Elevated Troponin</p>
                </div>
                <div className="card p-4 border-l-4 border-l-green-500">
                    <p className="text-2xl font-bold text-green-600">{ccuPatients.filter(p => p.status === 'Stable').length}</p>
                    <p className="text-sm text-slate-500">Stable</p>
                </div>
            </div>

            {/* Patients Table */}
            <div className="card">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Bed</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Patient</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Diagnosis</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">ECG</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Troponin</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Doctor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {ccuPatients.map((patient) => (
                                <tr key={patient.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-4 py-3">
                                        <span className="font-medium text-red-600">{patient.bed}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-slate-900 dark:text-white">{patient.name}</p>
                                        <p className="text-xs text-slate-500">{patient.age} yrs | Day {patient.days}</p>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{patient.diagnosis}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs rounded ${
                                            patient.ecg.includes('ST') ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                                        }`}>
                                            {patient.ecg}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`font-medium ${patient.troponin > 1 ? 'text-red-600' : 'text-slate-600'}`}>
                                            {patient.troponin} ng/mL
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            patient.status === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                        }`}>
                                            {patient.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{patient.doctor}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
