'use client';

import React, { useState } from 'react';
import { Shield, Search, Clock, CheckCircle, XCircle, AlertCircle, FileText, DollarSign } from 'lucide-react';

const claims = [
    { id: 'CLM-001', patient: 'Rahul Sharma', insurer: 'Star Health', policyNo: 'SH123456', amount: 125000, claimAmount: 100000, status: 'Approved', date: '2024-12-28' },
    { id: 'CLM-002', patient: 'Priya Gupta', insurer: 'ICICI Lombard', policyNo: 'IL789012', amount: 85000, claimAmount: 85000, status: 'Pending', date: '2024-12-27' },
    { id: 'CLM-003', patient: 'Amit Kumar', insurer: 'Max Bupa', policyNo: 'MB345678', amount: 250000, claimAmount: 200000, status: 'Under Review', date: '2024-12-26' },
    { id: 'CLM-004', patient: 'Sneha Patel', insurer: 'HDFC Ergo', policyNo: 'HE901234', amount: 50000, claimAmount: 45000, status: 'Rejected', date: '2024-12-25' },
    { id: 'CLM-005', patient: 'Vikram Singh', insurer: 'New India', policyNo: 'NI567890', amount: 175000, claimAmount: 150000, status: 'Approved', date: '2024-12-24' },
];

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'Approved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        case 'Pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
        case 'Under Review': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        case 'Rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        default: return 'bg-slate-100 text-slate-700';
    }
};

export default function InsurancePage() {
    const [filter, setFilter] = useState('All');

    const stats = {
        total: claims.length,
        approved: claims.filter(c => c.status === 'Approved').length,
        pending: claims.filter(c => c.status === 'Pending' || c.status === 'Under Review').length,
        rejected: claims.filter(c => c.status === 'Rejected').length,
        totalAmount: claims.filter(c => c.status === 'Approved').reduce((sum, c) => sum + c.claimAmount, 0),
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Shield className="w-7 h-7 text-blue-500" />
                        Insurance Claims
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage insurance claims and TPA processing</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <FileText className="w-4 h-4" />
                    New Claim
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="card p-4">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                    <p className="text-sm text-slate-500">Total Claims</p>
                </div>
                <div className="card p-4 border-l-4 border-l-green-500">
                    <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                    <p className="text-sm text-slate-500">Approved</p>
                </div>
                <div className="card p-4 border-l-4 border-l-amber-500">
                    <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                    <p className="text-sm text-slate-500">Pending</p>
                </div>
                <div className="card p-4 border-l-4 border-l-red-500">
                    <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                    <p className="text-sm text-slate-500">Rejected</p>
                </div>
                <div className="card p-4 border-l-4 border-l-blue-500">
                    <p className="text-2xl font-bold text-blue-600">₹{(stats.totalAmount/100000).toFixed(1)}L</p>
                    <p className="text-sm text-slate-500">Approved Amount</p>
                </div>
            </div>

            {/* Claims Table */}
            <div className="card">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search claims..."
                            className="pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 w-64"
                        />
                    </div>
                    <div className="flex gap-2">
                        {['All', 'Approved', 'Pending', 'Rejected'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 text-sm rounded-lg ${
                                    filter === f ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Claim ID</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Patient</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Insurer</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Bill Amount</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Claim Amount</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {claims.map((claim) => (
                                <tr key={claim.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-4 py-3 font-medium text-blue-600">{claim.id}</td>
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-slate-900 dark:text-white">{claim.patient}</p>
                                        <p className="text-xs text-slate-500">{claim.policyNo}</p>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{claim.insurer}</td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">₹{claim.amount.toLocaleString()}</td>
                                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">₹{claim.claimAmount.toLocaleString()}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(claim.status)}`}>
                                            {claim.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{claim.date}</td>
                                    <td className="px-4 py-3">
                                        <button className="text-sm text-blue-600 hover:underline">View</button>
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
