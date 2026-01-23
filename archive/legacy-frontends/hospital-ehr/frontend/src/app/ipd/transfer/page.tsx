'use client';

import React, { useState } from 'react';
import { ArrowRightLeft, User, BedDouble, Building, Search, CheckCircle } from 'lucide-react';

const patients = [
    { id: 1, name: 'Rajesh Kumar', age: 58, bed: 'ICU-01', ward: 'ICU', diagnosis: 'Post CABG', days: 3 },
    { id: 2, name: 'Meera Devi', age: 65, bed: 'GW-05', ward: 'General Ward', diagnosis: 'Pneumonia', days: 5 },
    { id: 3, name: 'Suresh Yadav', age: 45, bed: 'PW-02', ward: 'Private Ward', diagnosis: 'Appendectomy', days: 2 },
];

const wards = [
    { id: 'icu', name: 'ICU', available: 2, total: 10 },
    { id: 'ccu', name: 'CCU', available: 3, total: 8 },
    { id: 'gw', name: 'General Ward', available: 15, total: 50 },
    { id: 'pw', name: 'Private Ward', available: 8, total: 20 },
    { id: 'sw', name: 'Semi-Private', available: 10, total: 30 },
];

export default function TransferPage() {
    const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
    const [selectedWard, setSelectedWard] = useState('');
    const [transferReason, setTransferReason] = useState('');

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ArrowRightLeft className="w-7 h-7 text-blue-500" />
                    Patient Transfer
                </h1>
                <p className="text-slate-500 dark:text-slate-400">Transfer patients between wards</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Patient Selection */}
                <div className="card p-6">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Select Patient</h3>
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name or bed..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                        />
                    </div>
                    <div className="space-y-2">
                        {patients.map((patient) => (
                            <div
                                key={patient.id}
                                onClick={() => setSelectedPatient(patient.id)}
                                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                    selectedPatient === patient.id
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-medium text-slate-900 dark:text-white">{patient.name}</h4>
                                        <p className="text-sm text-slate-500">{patient.age} yrs | {patient.diagnosis}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-medium text-blue-600">{patient.bed}</span>
                                        <p className="text-xs text-slate-500">{patient.ward}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Ward Selection */}
                <div className="card p-6">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Transfer To</h3>
                    <div className="space-y-3">
                        {wards.map((ward) => (
                            <div
                                key={ward.id}
                                onClick={() => ward.available > 0 && setSelectedWard(ward.id)}
                                className={`p-4 border rounded-lg transition-all ${
                                    ward.available === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-300'
                                } ${selectedWard === ward.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700'}`}
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <BedDouble className="w-5 h-5 text-slate-400" />
                                        <span className="font-medium text-slate-900 dark:text-white">{ward.name}</span>
                                    </div>
                                    <span className={`text-sm font-medium ${ward.available > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {ward.available}/{ward.total} Available
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Reason for Transfer
                        </label>
                        <textarea
                            value={transferReason}
                            onChange={(e) => setTransferReason(e.target.value)}
                            placeholder="Enter reason for transfer..."
                            rows={3}
                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                        />
                    </div>

                    <button
                        disabled={!selectedPatient || !selectedWard}
                        className="mt-4 w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        Initiate Transfer
                    </button>
                </div>
            </div>
        </div>
    );
}
