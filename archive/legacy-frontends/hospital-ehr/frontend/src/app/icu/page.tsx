'use client';

import React from 'react';
import { HeartPulse, BedDouble, Users, AlertTriangle, Activity, Thermometer, Droplet, Wind } from 'lucide-react';

const icuPatients = [
    { id: 1, bed: 'ICU-01', name: 'Rajesh Kumar', age: 65, diagnosis: 'Post CABG', doctor: 'Dr. Sharma', status: 'Critical', vitals: { bp: '90/60', hr: 110, spo2: 92, temp: 38.2 }, ventilator: true, days: 3 },
    { id: 2, bed: 'ICU-02', name: 'Meera Devi', age: 72, diagnosis: 'Respiratory Failure', doctor: 'Dr. Gupta', status: 'Stable', vitals: { bp: '120/80', hr: 85, spo2: 96, temp: 37.1 }, ventilator: true, days: 5 },
    { id: 3, bed: 'ICU-03', name: 'Suresh Yadav', age: 55, diagnosis: 'Sepsis', doctor: 'Dr. Singh', status: 'Critical', vitals: { bp: '85/55', hr: 120, spo2: 88, temp: 39.5 }, ventilator: true, days: 2 },
    { id: 4, bed: 'ICU-04', name: 'Anita Sharma', age: 48, diagnosis: 'Multi-organ failure', doctor: 'Dr. Patel', status: 'Critical', vitals: { bp: '80/50', hr: 130, spo2: 85, temp: 39.8 }, ventilator: true, days: 1 },
    { id: 5, bed: 'ICU-05', name: 'Mohan Lal', age: 60, diagnosis: 'Post MI', doctor: 'Dr. Verma', status: 'Stable', vitals: { bp: '110/70', hr: 78, spo2: 98, temp: 36.8 }, ventilator: false, days: 4 },
];

const getStatusColor = (status: string) => {
    return status === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
};

export default function ICUPage() {
    const stats = {
        total: 10,
        occupied: icuPatients.length,
        critical: icuPatients.filter(p => p.status === 'Critical').length,
        onVentilator: icuPatients.filter(p => p.ventilator).length,
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <HeartPulse className="w-7 h-7 text-red-500" />
                        Intensive Care Unit (ICU)
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Real-time ICU patient monitoring</p>
                </div>
                <span className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg font-semibold">
                    {stats.critical} Critical Patients
                </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <BedDouble className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.occupied}/{stats.total}</p>
                            <p className="text-sm text-slate-500">Beds Occupied</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
                            <p className="text-sm text-slate-500">Critical</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Wind className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.onVentilator}</p>
                            <p className="text-sm text-slate-500">On Ventilator</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Users className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-600">{stats.occupied - stats.critical}</p>
                            <p className="text-sm text-slate-500">Stable</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Patient Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {icuPatients.map((patient) => (
                    <div key={patient.id} className={`card p-4 border-l-4 ${patient.status === 'Critical' ? 'border-l-red-500' : 'border-l-green-500'}`}>
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <span className="text-xs font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">{patient.bed}</span>
                                <h3 className="font-semibold text-slate-900 dark:text-white mt-1">{patient.name}</h3>
                                <p className="text-sm text-slate-500">{patient.age} yrs | {patient.diagnosis}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(patient.status)}`}>
                                {patient.status}
                            </span>
                        </div>

                        {/* Vitals */}
                        <div className="grid grid-cols-4 gap-2 mb-3">
                            <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded text-center">
                                <Activity className="w-4 h-4 mx-auto text-red-500 mb-1" />
                                <p className="text-xs text-slate-500">BP</p>
                                <p className="font-semibold text-sm">{patient.vitals.bp}</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded text-center">
                                <HeartPulse className="w-4 h-4 mx-auto text-pink-500 mb-1" />
                                <p className="text-xs text-slate-500">HR</p>
                                <p className="font-semibold text-sm">{patient.vitals.hr}</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded text-center">
                                <Droplet className="w-4 h-4 mx-auto text-blue-500 mb-1" />
                                <p className="text-xs text-slate-500">SpO2</p>
                                <p className={`font-semibold text-sm ${patient.vitals.spo2 < 90 ? 'text-red-600' : ''}`}>{patient.vitals.spo2}%</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded text-center">
                                <Thermometer className="w-4 h-4 mx-auto text-amber-500 mb-1" />
                                <p className="text-xs text-slate-500">Temp</p>
                                <p className={`font-semibold text-sm ${patient.vitals.temp > 38 ? 'text-red-600' : ''}`}>{patient.vitals.temp}°C</p>
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">{patient.doctor} | Day {patient.days}</span>
                            {patient.ventilator && (
                                <span className="flex items-center gap-1 text-purple-600">
                                    <Wind className="w-4 h-4" /> Ventilator
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
