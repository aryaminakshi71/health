'use client';

import React, { useState } from 'react';
import {
    DollarSign, CreditCard, Banknote, Smartphone, Building2,
    Search, Clock, CheckCircle, Calendar, User, Filter, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

const mockPayments = [
    { id: 'PAY-2024-001', invoiceId: 'INV-2024-001', patientName: 'Rahul Sharma', patientId: 'P001', amount: 1750, method: 'UPI', reference: 'UPI123456789', date: '2024-12-28', time: '10:30', status: 'COMPLETED' },
    { id: 'PAY-2024-002', invoiceId: 'INV-2024-002', patientName: 'Priya Gupta', patientId: 'P002', amount: 5000, method: 'Cash', reference: 'CASH-001', date: '2024-12-28', time: '11:15', status: 'COMPLETED' },
    { id: 'PAY-2024-003', invoiceId: 'INV-2024-004', patientName: 'Sneha Patel', patientId: 'P004', amount: 500, method: 'Card', reference: 'CARD-789012', date: '2024-12-27', time: '14:45', status: 'COMPLETED' },
    { id: 'PAY-2024-004', invoiceId: 'INV-2024-005', patientName: 'Vikram Joshi', patientId: 'P005', amount: 3500, method: 'Card', reference: 'CARD-456789', date: '2024-12-26', time: '16:00', status: 'COMPLETED' },
    { id: 'PAY-2024-005', invoiceId: 'INV-2024-006', patientName: 'Meera Reddy', patientId: 'P006', amount: 30000, method: 'Insurance', reference: 'INS-TPA-2024-123', date: '2024-12-25', time: '09:30', status: 'COMPLETED' },
    { id: 'PAY-2024-006', invoiceId: 'INV-2024-007', patientName: 'Arun Nair', patientId: 'P007', amount: 2500, method: 'UPI', reference: 'UPI987654321', date: '2024-12-28', time: '15:20', status: 'PROCESSING' },
];

const mockPendingPayments = [
    { id: 'INV-2024-002', patientName: 'Priya Gupta', patientId: 'P002', total: 7700, paid: 5000, balance: 2700, dueDate: '2025-01-05', daysOverdue: 0 },
    { id: 'INV-2024-003', patientName: 'Amit Kumar', patientId: 'P003', total: 27500, paid: 0, balance: 27500, dueDate: '2024-12-30', daysOverdue: 0 },
    { id: 'INV-2024-006', patientName: 'Meera Reddy', patientId: 'P006', total: 60000, paid: 30000, balance: 30000, dueDate: '2024-12-28', daysOverdue: 0 },
    { id: 'INV-2024-008', patientName: 'Kiran Shah', patientId: 'P008', total: 15000, paid: 5000, balance: 10000, dueDate: '2024-12-25', daysOverdue: 3 },
];

const methodIcons: Record<string, any> = {
    Cash: Banknote,
    Card: CreditCard,
    UPI: Smartphone,
    Insurance: Building2,
};

const methodColors: Record<string, string> = {
    Cash: 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400',
    Card: 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400',
    UPI: 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400',
    Insurance: 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400',
};

export default function PaymentsPage() {
    const [payments] = useState(mockPayments);
    const [pendingPayments] = useState(mockPendingPayments);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterMethod, setFilterMethod] = useState('ALL');
    const [showCollectModal, setShowCollectModal] = useState(false);
    const [selectedPending, setSelectedPending] = useState<typeof mockPendingPayments[0] | null>(null);

    const todayCollection = payments.filter(p => p.date === '2024-12-28' && p.status === 'COMPLETED').reduce((sum, p) => sum + p.amount, 0);
    const totalPending = pendingPayments.reduce((sum, p) => sum + p.balance, 0);
    const overdueCount = pendingPayments.filter(p => p.daysOverdue > 0).length;
    const totalTransactions = payments.length;

    const filteredPayments = payments.filter(p => {
        const matchesSearch = p.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.invoiceId.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesMethod = filterMethod === 'ALL' || p.method === filterMethod;
        return matchesSearch && matchesMethod;
    });

    const openCollectModal = (pending: typeof mockPendingPayments[0]) => {
        setSelectedPending(pending);
        setShowCollectModal(true);
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">Payment Collection</h1>
                    <p className="text-slate-600 dark:text-slate-400">Track payments and collect pending dues</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-500/20 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">Today's Collection:</span>
                    <span className="font-bold text-green-600 dark:text-green-400">${todayCollection.toLocaleString()}</span>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card p-5 bg-gradient-to-br from-green-500 to-green-600 border-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm">Today's Collection</p>
                            <p className="text-2xl font-bold text-white">${todayCollection.toLocaleString()}</p>
                            <div className="flex items-center text-green-200 text-sm mt-1">
                                <ArrowUpRight className="h-4 w-4" />
                                <span>+18% vs yesterday</span>
                            </div>
                        </div>
                        <DollarSign className="h-10 w-10 text-green-200" />
                    </div>
                </div>
                <div className="card p-5 border-l-4 border-l-amber-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Total Pending</p>
                            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">${totalPending.toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-amber-100 dark:bg-amber-500/20 rounded-xl">
                            <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>
                </div>
                <div className="card p-5 border-l-4 border-l-red-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Overdue</p>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{overdueCount}</p>
                        </div>
                        <div className="p-3 bg-red-100 dark:bg-red-500/20 rounded-xl">
                            <Calendar className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                    </div>
                </div>
                <div className="card p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Transactions</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalTransactions}</p>
                        </div>
                        <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-xl">
                            <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Payment History */}
                <div className="xl:col-span-2 space-y-4">
                    {/* Search and Filter */}
                    <div className="card p-4">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by patient, payment ID, or invoice..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {['ALL', 'Cash', 'Card', 'UPI', 'Insurance'].map((method) => (
                                    <button
                                        key={method}
                                        onClick={() => setFilterMethod(method)}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            filterMethod === method
                                                ? 'bg-green-600 text-white'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        {method}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Payment History Table */}
                    <div className="card overflow-hidden">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Payment History</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Payment ID</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Patient</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Method</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date/Time</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {filteredPayments.map((payment) => {
                                        const MethodIcon = methodIcons[payment.method];
                                        return (
                                            <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <p className="font-semibold text-blue-600 dark:text-blue-400">{payment.id}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{payment.invoiceId}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-sm">
                                                            {payment.patientName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-slate-900 dark:text-white text-sm">{payment.patientName}</p>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">{payment.patientId}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <p className="font-bold text-green-600 dark:text-green-400">${payment.amount.toLocaleString()}</p>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${methodColors[payment.method]}`}>
                                                        <MethodIcon className="h-3.5 w-3.5" />
                                                        {payment.method}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="text-sm text-slate-900 dark:text-white">{payment.date}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{payment.time}</p>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                                                        payment.status === 'COMPLETED' 
                                                            ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400'
                                                            : 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
                                                    }`}>
                                                        {payment.status === 'COMPLETED' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                                        {payment.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Pending Payments Sidebar */}
                <div className="space-y-6">
                    <div className="card overflow-hidden">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-amber-50 dark:bg-amber-500/10">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <Clock className="h-5 w-5 text-amber-500" />
                                Pending Payments
                            </h2>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[500px] overflow-y-auto">
                            {pendingPayments.map((pending) => (
                                <div key={pending.id} className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${pending.daysOverdue > 0 ? 'border-l-4 border-l-red-500' : ''}`}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-blue-600 dark:text-blue-400 text-sm">{pending.id}</span>
                                                {pending.daysOverdue > 0 && (
                                                    <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded text-xs font-medium">
                                                        {pending.daysOverdue}d overdue
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">{pending.patientName}</p>
                                            <div className="flex items-center gap-4 mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                <span>Total: ${pending.total.toLocaleString()}</span>
                                                <span>Paid: ${pending.paid.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-red-600 dark:text-red-400">${pending.balance.toLocaleString()}</p>
                                            <button 
                                                onClick={() => openCollectModal(pending)}
                                                className="mt-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors"
                                            >
                                                Collect
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payment Method Summary */}
                    <div className="card p-5">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Today by Method</h3>
                        <div className="space-y-3">
                            {Object.entries(methodIcons).map(([method, Icon]) => {
                                const total = payments.filter(p => p.method === method && p.date === '2024-12-28').reduce((sum, p) => sum + p.amount, 0);
                                return (
                                    <div key={method} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${methodColors[method]}`}>
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <span className="font-medium text-slate-700 dark:text-slate-300">{method}</span>
                                        </div>
                                        <span className="font-bold text-slate-900 dark:text-white">${total.toLocaleString()}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Collect Payment Modal */}
            {showCollectModal && selectedPending && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setShowCollectModal(false)}>
                    <div className="card max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Collect Payment</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">Invoice</span>
                                    <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedPending.id}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">Patient</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{selectedPending.patientName}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">Balance Due</span>
                                    <span className="font-bold text-red-600 dark:text-red-400">${selectedPending.balance.toLocaleString()}</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount to Collect ($)</label>
                                <input 
                                    type="number" 
                                    defaultValue={selectedPending.balance}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Payment Method</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {Object.entries(methodIcons).map(([method, Icon]) => (
                                        <button key={method} className={`p-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-green-500 dark:hover:border-green-500 transition-colors flex flex-col items-center gap-1`}>
                                            <Icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                            <span className="text-xs text-slate-600 dark:text-slate-400">{method}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reference Number</label>
                                <input 
                                    type="text" 
                                    placeholder="Transaction reference..."
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500" 
                                />
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
                            <button onClick={() => setShowCollectModal(false)} className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                                Cancel
                            </button>
                            <button className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2">
                                <CheckCircle className="h-4 w-4" /> Confirm Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
