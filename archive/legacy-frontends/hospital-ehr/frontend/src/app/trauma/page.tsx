'use client';

import React from 'react';
import { AlertTriangle, Clock, User, Activity, Truck } from 'lucide-react';

const traumaCases = [
    { id: 1, time: '10:30 AM', patient: 'Unknown Male', age: '~35', type: 'RTA - Head Injury', severity: 'Critical', gcs: 8, status: 'In Surgery', doctor: 'Dr. Singh' },
    { id: 2, time: '09:45 AM', patient: 'Ramesh Kumar', age: 42, type: 'Fall from Height', severity: 'Moderate', gcs: 14, status: 'Under Observation', doctor: 'Dr. Patel' },
    { id: 3, time: '08:20 AM', patient: 'Suresh Yadav', age: 28, type: 'Assault - Multiple Injuries', severity: 'Severe', gcs: 11, status: 'ICU Transferred', doctor: 'Dr. Sharma' },
    { id: 4, time: '07:15 AM', patient: 'Anita Devi', age: 55, type: 'Burns - 30%', severity: 'Critical', gcs: 15, status: 'Burn Ward', doctor: 'Dr. Gupta' },
];

const getSeverityColor = (severity: string) => {
    switch (severity) {
        case 'Critical': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        case 'Severe': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
        case 'Moderate': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
        default: return 'bg-green-100 text-green-700';
    }
};

export default function TraumaPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <AlertTriangle className="w-7 h-7 text-amber-500" />
                        Trauma Center
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Emergency trauma case management</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    <AlertTriangle className="w-4 h-4" />
                    New Trauma Alert
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card p-4 border-l-4 border-l-red-500">
                    <p className="text-2xl font-bold text-red-600">{traumaCases.filter(c => c.severity === 'Critical').length}</p>
                    <p className="text-sm text-slate-500">Critical</p>
                </div>
                <div className="card p-4 border-l-4 border-l-orange-500">
                    <p className="text-2xl font-bold text-orange-600">{traumaCases.filter(c => c.severity === 'Severe').length}</p>
                    <p className="text-sm text-slate-500">Severe</p>
                </div>
                <div className="card p-4 border-l-4 border-l-amber-500">
                    <p className="text-2xl font-bold text-amber-600">{traumaCases.filter(c => c.severity === 'Moderate').length}</p>
                    <p className="text-sm text-slate-500">Moderate</p>
                </div>
                <div className="card p-4">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{traumaCases.length}</p>
                    <p className="text-sm text-slate-500">Total Today</p>
                </div>
            </div>

            {/* Trauma Cases */}
            <div className="card">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold text-slate-900 dark:text-white">Active Trauma Cases</h3>
                </div>
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                    {traumaCases.map((trauma) => (
                        <div key={trauma.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                        trauma.severity === 'Critical' ? 'bg-red-100' : trauma.severity === 'Severe' ? 'bg-orange-100' : 'bg-amber-100'
                                    }`}>
                                        <AlertTriangle className={`w-6 h-6 ${
                                            trauma.severity === 'Critical' ? 'text-red-600' : trauma.severity === 'Severe' ? 'text-orange-600' : 'text-amber-600'
                                        }`} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-slate-900 dark:text-white">{trauma.patient}</h4>
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getSeverityColor(trauma.severity)}`}>
                                                {trauma.severity}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{trauma.type}</p>
                                        <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {trauma.time}</span>
                                            <span>Age: {trauma.age}</span>
                                            <span>GCS: {trauma.gcs}/15</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">{trauma.status}</p>
                                        <p className="text-xs text-slate-500">{trauma.doctor}</p>
                                    </div>
                                    <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
