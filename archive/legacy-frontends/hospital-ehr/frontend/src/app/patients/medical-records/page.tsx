'use client';

import React, { useState } from 'react';
import { FileText, Download, Eye, Calendar, User, Search, Filter, FolderOpen } from 'lucide-react';

const records = [
    { id: 1, patient: 'Rahul Sharma', mrn: 'MRN-2024-001', type: 'Lab Report', date: '2024-12-28', doctor: 'Dr. Gupta', department: 'Pathology' },
    { id: 2, patient: 'Priya Gupta', mrn: 'MRN-2024-002', type: 'X-Ray', date: '2024-12-27', doctor: 'Dr. Singh', department: 'Radiology' },
    { id: 3, patient: 'Amit Kumar', mrn: 'MRN-2024-003', type: 'Prescription', date: '2024-12-26', doctor: 'Dr. Patel', department: 'Medicine' },
    { id: 4, patient: 'Sneha Patel', mrn: 'MRN-2024-004', type: 'Discharge Summary', date: '2024-12-25', doctor: 'Dr. Sharma', department: 'Surgery' },
    { id: 5, patient: 'Vikram Singh', mrn: 'MRN-2024-005', type: 'MRI Report', date: '2024-12-24', doctor: 'Dr. Verma', department: 'Radiology' },
];

export default function MedicalRecordsPage() {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Medical Records</h1>
                    <p className="text-slate-500 dark:text-slate-400">Access and manage patient medical records</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search records..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm w-64"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                        <Filter className="w-4 h-4" />
                        Filter
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Patient</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Record Type</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Doctor</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Department</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {records.map((record) => (
                                <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">{record.patient}</p>
                                            <p className="text-xs text-slate-500">{record.mrn}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-blue-500" />
                                            {record.type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{record.date}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{record.doctor}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{record.department}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded" title="View">
                                                <Eye className="w-4 h-4 text-slate-500" />
                                            </button>
                                            <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded" title="Download">
                                                <Download className="w-4 h-4 text-slate-500" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
