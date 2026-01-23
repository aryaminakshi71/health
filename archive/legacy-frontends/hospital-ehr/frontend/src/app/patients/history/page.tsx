'use client';

import React, { useState } from 'react';
import { History, Calendar, Stethoscope, Pill, FlaskConical, FileText, ChevronRight, Search } from 'lucide-react';

const patientHistory = [
    { id: 1, date: '2024-12-28', type: 'OPD Visit', department: 'Cardiology', doctor: 'Dr. Sharma', diagnosis: 'Hypertension', notes: 'Regular checkup, BP controlled' },
    { id: 2, date: '2024-12-20', type: 'Lab Test', department: 'Pathology', doctor: 'Dr. Gupta', diagnosis: 'Lipid Profile', notes: 'Cholesterol slightly elevated' },
    { id: 3, date: '2024-12-15', type: 'IPD Admission', department: 'Medicine', doctor: 'Dr. Singh', diagnosis: 'Viral Fever', notes: '3 day admission, recovered' },
    { id: 4, date: '2024-11-28', type: 'OPD Visit', department: 'Cardiology', doctor: 'Dr. Sharma', diagnosis: 'Follow-up', notes: 'Medication adjusted' },
    { id: 5, date: '2024-11-10', type: 'Emergency', department: 'Emergency', doctor: 'Dr. Patel', diagnosis: 'Chest Pain', notes: 'ECG normal, discharged same day' },
];

const getTypeIcon = (type: string) => {
    switch (type) {
        case 'OPD Visit': return <Stethoscope className="w-4 h-4" />;
        case 'Lab Test': return <FlaskConical className="w-4 h-4" />;
        case 'IPD Admission': return <FileText className="w-4 h-4" />;
        case 'Emergency': return <History className="w-4 h-4" />;
        default: return <FileText className="w-4 h-4" />;
    }
};

const getTypeColor = (type: string) => {
    switch (type) {
        case 'OPD Visit': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
        case 'Lab Test': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
        case 'IPD Admission': return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
        case 'Emergency': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
        default: return 'bg-slate-100 text-slate-600';
    }
};

export default function PatientHistoryPage() {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Patient History</h1>
                    <p className="text-slate-500 dark:text-slate-400">View complete patient visit history and medical timeline</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by patient name or MRN..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm w-80"
                    />
                </div>
            </div>

            {/* Timeline */}
            <div className="card p-6">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-6">Medical Timeline - Rahul Sharma (MRN-2024-001)</h3>
                <div className="space-y-6">
                    {patientHistory.map((item, index) => (
                        <div key={item.id} className="relative pl-8 pb-6 border-l-2 border-slate-200 dark:border-slate-700 last:pb-0">
                            <div className={`absolute left-0 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center ${getTypeColor(item.type)}`}>
                                {getTypeIcon(item.type)}
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 ml-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(item.type)}`}>
                                        {item.type}
                                    </span>
                                    <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {item.date}
                                    </span>
                                </div>
                                <h4 className="font-medium text-slate-900 dark:text-white">{item.diagnosis}</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{item.department} - {item.doctor}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{item.notes}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
