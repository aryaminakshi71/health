'use client';

import React, { useState } from 'react';
import { FileText, Download, Calendar, Printer, Mail, Filter, ChevronDown } from 'lucide-react';

const reports = [
    { id: 1, name: 'Daily Patient Summary', date: '2024-12-30', type: 'Patient', status: 'Generated', size: '2.4 MB' },
    { id: 2, name: 'OPD Collection Report', date: '2024-12-30', type: 'Financial', status: 'Generated', size: '1.8 MB' },
    { id: 3, name: 'IPD Discharge Summary', date: '2024-12-30', type: 'Patient', status: 'Generated', size: '3.2 MB' },
    { id: 4, name: 'Lab Test Report', date: '2024-12-30', type: 'Diagnostic', status: 'Generated', size: '1.5 MB' },
    { id: 5, name: 'Pharmacy Sales Report', date: '2024-12-30', type: 'Financial', status: 'Pending', size: '-' },
    { id: 6, name: 'Emergency Department Log', date: '2024-12-30', type: 'Patient', status: 'Generated', size: '0.9 MB' },
    { id: 7, name: 'Bed Occupancy Report', date: '2024-12-30', type: 'Operations', status: 'Generated', size: '0.5 MB' },
    { id: 8, name: 'Staff Attendance Report', date: '2024-12-30', type: 'HR', status: 'Generated', size: '1.1 MB' },
];

const quickStats = [
    { label: 'Total Reports Today', value: '24', color: 'bg-blue-500' },
    { label: 'Generated', value: '21', color: 'bg-green-500' },
    { label: 'Pending', value: '3', color: 'bg-amber-500' },
    { label: 'Failed', value: '0', color: 'bg-red-500' },
];

export default function DailyReportsPage() {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Daily Reports</h1>
                    <p className="text-slate-500 dark:text-slate-400">Generate and download daily operational reports</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <Download className="w-4 h-4" />
                        Download All
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickStats.map((stat) => (
                    <div key={stat.label} className="card p-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
                            <span className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Reports Table */}
            <div className="card">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-slate-900 dark:text-white">Available Reports</h3>
                        <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                            <Filter className="w-4 h-4" />
                            Filter
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Report Name</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Size</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {reports.map((report) => (
                                <tr key={report.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-blue-500" />
                                            <span className="font-medium text-slate-900 dark:text-white">{report.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{report.type}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{report.date}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            report.status === 'Generated' 
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                        }`}>
                                            {report.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{report.size}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded" title="Download">
                                                <Download className="w-4 h-4 text-slate-500" />
                                            </button>
                                            <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded" title="Print">
                                                <Printer className="w-4 h-4 text-slate-500" />
                                            </button>
                                            <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded" title="Email">
                                                <Mail className="w-4 h-4 text-slate-500" />
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
