'use client';

import React from 'react';
import { Scan, Clock, User, FileText } from 'lucide-react';

const usQueue = [
    { id: 1, patient: 'Priya Sharma', age: 28, area: 'Obstetric - 2nd Trimester', doctor: 'Dr. Gupta', time: '10:30 AM', status: 'In Progress' },
    { id: 2, patient: 'Anita Devi', age: 45, area: 'Abdomen Complete', doctor: 'Dr. Patel', time: '10:45 AM', status: 'Waiting' },
    { id: 3, patient: 'Sunita Kumari', age: 32, area: 'Pelvis', doctor: 'Dr. Singh', time: '11:00 AM', status: 'Waiting' },
    { id: 4, patient: 'Meera Joshi', age: 55, area: 'Thyroid', doctor: 'Dr. Sharma', time: '11:15 AM', status: 'Waiting' },
    { id: 5, patient: 'Kamla Rani', age: 38, area: 'Breast', doctor: 'Dr. Verma', time: '11:30 AM', status: 'Waiting' },
];

export default function UltrasoundPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Scan className="w-7 h-7 text-cyan-500" />
                    Ultrasound Department
                </h1>
                <p className="text-slate-500 dark:text-slate-400">Ultrasound imaging queue and reports</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card p-4">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">5</p>
                    <p className="text-sm text-slate-500">In Queue</p>
                </div>
                <div className="card p-4 border-l-4 border-l-cyan-500">
                    <p className="text-2xl font-bold text-cyan-600">1</p>
                    <p className="text-sm text-slate-500">In Progress</p>
                </div>
                <div className="card p-4 border-l-4 border-l-green-500">
                    <p className="text-2xl font-bold text-green-600">28</p>
                    <p className="text-sm text-slate-500">Completed</p>
                </div>
                <div className="card p-4">
                    <p className="text-2xl font-bold text-slate-600">~15 min</p>
                    <p className="text-sm text-slate-500">Avg. Scan Time</p>
                </div>
            </div>

            <div className="card">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold text-slate-900 dark:text-white">Ultrasound Queue</h3>
                </div>
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                    {usQueue.map((patient) => (
                        <div key={patient.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                                        <User className="w-6 h-6 text-cyan-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-slate-900 dark:text-white">{patient.patient}</h4>
                                        <p className="text-sm text-slate-500">{patient.age} yrs | {patient.area}</p>
                                        <p className="text-xs text-slate-400 mt-1">{patient.doctor}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        patient.status === 'In Progress' ? 'bg-cyan-100 text-cyan-700' : 'bg-slate-100 text-slate-700'
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
