'use client';

import React from 'react';
import { Scan, Clock, CheckCircle, User, FileText } from 'lucide-react';

const xrayQueue = [
    { id: 1, patient: 'Rahul Sharma', age: 45, area: 'Chest PA', doctor: 'Dr. Gupta', time: '10:30 AM', status: 'Waiting' },
    { id: 2, patient: 'Priya Gupta', age: 32, area: 'Left Hand', doctor: 'Dr. Singh', time: '10:45 AM', status: 'In Progress' },
    { id: 3, patient: 'Amit Kumar', age: 55, area: 'Lumbar Spine', doctor: 'Dr. Patel', time: '11:00 AM', status: 'Waiting' },
    { id: 4, patient: 'Sneha Devi', age: 28, area: 'Both Knees', doctor: 'Dr. Sharma', time: '11:15 AM', status: 'Waiting' },
];

const completedToday = [
    { id: 1, patient: 'Mohan Lal', area: 'Chest PA', time: '09:30 AM', reportStatus: 'Ready' },
    { id: 2, patient: 'Sunita Devi', area: 'Abdomen', time: '09:45 AM', reportStatus: 'Ready' },
    { id: 3, patient: 'Ramesh Kumar', area: 'Right Shoulder', time: '10:00 AM', reportStatus: 'Pending' },
];

export default function XRayPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Scan className="w-7 h-7 text-blue-500" />
                    X-Ray Department
                </h1>
                <p className="text-slate-500 dark:text-slate-400">X-Ray imaging queue and reports</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card p-4">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">4</p>
                    <p className="text-sm text-slate-500">In Queue</p>
                </div>
                <div className="card p-4 border-l-4 border-l-blue-500">
                    <p className="text-2xl font-bold text-blue-600">1</p>
                    <p className="text-sm text-slate-500">In Progress</p>
                </div>
                <div className="card p-4 border-l-4 border-l-green-500">
                    <p className="text-2xl font-bold text-green-600">45</p>
                    <p className="text-sm text-slate-500">Completed</p>
                </div>
                <div className="card p-4 border-l-4 border-l-amber-500">
                    <p className="text-2xl font-bold text-amber-600">3</p>
                    <p className="text-sm text-slate-500">Reports Pending</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Queue */}
                <div className="card">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="font-semibold text-slate-900 dark:text-white">Current Queue</h3>
                    </div>
                    <div className="divide-y divide-slate-200 dark:divide-slate-700">
                        {xrayQueue.map((patient) => (
                            <div key={patient.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-medium text-slate-900 dark:text-white">{patient.patient}</h4>
                                        <p className="text-sm text-slate-500">{patient.age} yrs | {patient.area}</p>
                                        <p className="text-xs text-slate-400 mt-1">{patient.doctor} | {patient.time}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        patient.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                                    }`}>
                                        {patient.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Completed */}
                <div className="card">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="font-semibold text-slate-900 dark:text-white">Completed Today</h3>
                    </div>
                    <div className="divide-y divide-slate-200 dark:divide-slate-700">
                        {completedToday.map((item) => (
                            <div key={item.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-medium text-slate-900 dark:text-white">{item.patient}</h4>
                                        <p className="text-sm text-slate-500">{item.area} | {item.time}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            item.reportStatus === 'Ready' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                            {item.reportStatus}
                                        </span>
                                        {item.reportStatus === 'Ready' && (
                                            <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                                                <FileText className="w-4 h-4 text-blue-500" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
