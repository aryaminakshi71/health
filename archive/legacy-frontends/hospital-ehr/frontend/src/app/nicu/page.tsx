'use client';

import React from 'react';
import { Baby, BedDouble, AlertTriangle, Thermometer, Activity, Heart } from 'lucide-react';

const nicuPatients = [
    { id: 1, bed: 'NICU-01', name: 'Baby of Priya', gestAge: '28 weeks', weight: '1.2 kg', diagnosis: 'Preterm', doctor: 'Dr. Patel', status: 'Critical', vitals: { hr: 160, spo2: 90, temp: 36.5 }, incubator: true, days: 5 },
    { id: 2, bed: 'NICU-02', name: 'Baby of Meera', gestAge: '32 weeks', weight: '1.8 kg', diagnosis: 'RDS', doctor: 'Dr. Sharma', status: 'Stable', vitals: { hr: 145, spo2: 95, temp: 36.8 }, incubator: true, days: 3 },
    { id: 3, bed: 'NICU-03', name: 'Baby of Anita', gestAge: '30 weeks', weight: '1.5 kg', diagnosis: 'Jaundice', doctor: 'Dr. Gupta', status: 'Stable', vitals: { hr: 150, spo2: 97, temp: 36.6 }, incubator: true, days: 7 },
    { id: 4, bed: 'NICU-04', name: 'Baby of Sneha', gestAge: '26 weeks', weight: '0.9 kg', diagnosis: 'Extreme Preterm', doctor: 'Dr. Patel', status: 'Critical', vitals: { hr: 170, spo2: 88, temp: 36.2 }, incubator: true, days: 2 },
];

export default function NICUPage() {
    const stats = {
        total: 8,
        occupied: nicuPatients.length,
        critical: nicuPatients.filter(p => p.status === 'Critical').length,
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Baby className="w-7 h-7 text-pink-500" />
                        Neonatal ICU (NICU)
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Neonatal intensive care monitoring</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card p-4">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.occupied}/{stats.total}</p>
                    <p className="text-sm text-slate-500">Incubators Occupied</p>
                </div>
                <div className="card p-4 border-l-4 border-l-red-500">
                    <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
                    <p className="text-sm text-slate-500">Critical</p>
                </div>
                <div className="card p-4 border-l-4 border-l-green-500">
                    <p className="text-2xl font-bold text-green-600">{stats.occupied - stats.critical}</p>
                    <p className="text-sm text-slate-500">Stable</p>
                </div>
                <div className="card p-4 border-l-4 border-l-blue-500">
                    <p className="text-2xl font-bold text-blue-600">{stats.total - stats.occupied}</p>
                    <p className="text-sm text-slate-500">Available</p>
                </div>
            </div>

            {/* Patient Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {nicuPatients.map((patient) => (
                    <div key={patient.id} className={`card p-4 border-l-4 ${patient.status === 'Critical' ? 'border-l-red-500' : 'border-l-green-500'}`}>
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <span className="text-xs font-bold text-pink-600 bg-pink-100 dark:bg-pink-900/30 px-2 py-1 rounded">{patient.bed}</span>
                                <h3 className="font-semibold text-slate-900 dark:text-white mt-1">{patient.name}</h3>
                                <p className="text-sm text-slate-500">{patient.gestAge} | {patient.weight} | {patient.diagnosis}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                patient.status === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                            }`}>
                                {patient.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded text-center">
                                <Heart className="w-4 h-4 mx-auto text-red-500 mb-1" />
                                <p className="text-xs text-slate-500">HR</p>
                                <p className="font-semibold text-sm">{patient.vitals.hr}</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded text-center">
                                <Activity className="w-4 h-4 mx-auto text-blue-500 mb-1" />
                                <p className="text-xs text-slate-500">SpO2</p>
                                <p className="font-semibold text-sm">{patient.vitals.spo2}%</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded text-center">
                                <Thermometer className="w-4 h-4 mx-auto text-amber-500 mb-1" />
                                <p className="text-xs text-slate-500">Temp</p>
                                <p className="font-semibold text-sm">{patient.vitals.temp}°C</p>
                            </div>
                        </div>

                        <p className="text-sm text-slate-500">{patient.doctor} | Day {patient.days}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
