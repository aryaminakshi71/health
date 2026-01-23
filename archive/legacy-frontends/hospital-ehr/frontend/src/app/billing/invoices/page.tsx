'use client';

import React, { useState } from 'react';
import {
    DollarSign, FileText, Plus, Search, Printer, Eye,
    CheckCircle, Clock, AlertCircle, Download, Calendar, User, X
} from 'lucide-react';

const mockInvoices = [
    { id: 'INV-2024-001', patientName: 'Rahul Sharma', patientId: 'P001', date: '2024-12-28', dueDate: '2024-12-31', items: [
        { desc: 'OPD Consultation', qty: 1, rate: 500, amount: 500 },
        { desc: 'Blood Test - CBC', qty: 1, rate: 450, amount: 450 },
        { desc: 'X-Ray Chest', qty: 1, rate: 800, amount: 800 },
    ], subtotal: 1750, discount: 0, tax: 0, total: 1750, paid: 1750, balance: 0, status: 'PAID' },
    { id: 'INV-2024-002', patientName: 'Priya Gupta', patientId: 'P002', date: '2024-12-28', dueDate: '2025-01-05', items: [
        { desc: 'IPD - General Ward (3 days)', qty: 3, rate: 1500, amount: 4500 },
        { desc: 'Medicines', qty: 1, rate: 2200, amount: 2200 },
        { desc: 'Doctor Visit', qty: 3, rate: 500, amount: 1500 },
    ], subtotal: 8200, discount: 500, tax: 0, total: 7700, paid: 5000, balance: 2700, status: 'PARTIAL' },
    { id: 'INV-2024-003', patientName: 'Amit Kumar', patientId: 'P003', date: '2024-12-27', dueDate: '2024-12-30', items: [
        { desc: 'ICU (2 days)', qty: 2, rate: 8000, amount: 16000 },
        { desc: 'Ventilator', qty: 2, rate: 3000, amount: 6000 },
        { desc: 'Medicines', qty: 1, rate: 5500, amount: 5500 },
    ], subtotal: 27500, discount: 0, tax: 0, total: 27500, paid: 0, balance: 27500, status: 'PENDING' },
    { id: 'INV-2024-004', patientName: 'Sneha Patel', patientId: 'P004', date: '2024-12-27', dueDate: '2024-12-30', items: [
        { desc: 'Consultation', qty: 1, rate: 500, amount: 500 },
    ], subtotal: 500, discount: 0, tax: 0, total: 500, paid: 500, balance: 0, status: 'PAID' },
    { id: 'INV-2024-005', patientName: 'Vikram Joshi', patientId: 'P005', date: '2024-12-26', dueDate: '2024-12-29', items: [
        { desc: 'Emergency Care', qty: 1, rate: 2500, amount: 2500 },
        { desc: 'Suturing', qty: 1, rate: 1200, amount: 1200 },
    ], subtotal: 3700, discount: 200, tax: 0, total: 3500, paid: 3500, balance: 0, status: 'PAID' },
    { id: 'INV-2024-006', patientName: 'Meera Reddy', patientId: 'P006', date: '2024-12-25', dueDate: '2024-12-28', items: [
        { desc: 'Surgery - Appendectomy', qty: 1, rate: 45000, amount: 45000 },
        { desc: 'IPD (5 days)', qty: 5, rate: 2000, amount: 10000 },
        { desc: 'Anesthesia', qty: 1, rate: 8000, amount: 8000 },
    ], subtotal: 63000, discount: 3000, tax: 0, total: 60000, paid: 30000, balance: 30000, status: 'PARTIAL' },
];

const statusStyles: Record<string, { bg: string; text: string }> = {
    PAID: { bg: 'bg-green-100 dark:bg-green-500/20', text: 'text-green-600 dark:text-green-400' },
    PARTIAL: { bg: 'bg-amber-100 dark:bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400' },
    PENDING: { bg: 'bg-red-100 dark:bg-red-500/20', text: 'text-red-600 dark:text-red-400' },
};

export default function InvoicesPage() {
    const [invoices] = useState(mockInvoices);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [selectedInvoice, setSelectedInvoice] = useState<typeof mockInvoices[0] | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const totalRevenue = invoices.reduce((sum, i) => sum + i.paid, 0);
    const pendingAmount = invoices.reduce((sum, i) => sum + i.balance, 0);
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter(i => i.status === 'PAID').length;

    const filteredInvoices = invoices.filter(inv => {
        const matchesSearch = inv.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inv.patientId.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'ALL' || inv.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">Invoice Management</h1>
                    <p className="text-slate-600 dark:text-slate-400">Create and manage patient invoices</p>
                </div>
                <div className="flex gap-3">
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <Download className="h-4 w-4" /> Export
                    </button>
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                        <Plus className="h-4 w-4" /> New Invoice
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card p-5 bg-gradient-to-br from-green-500 to-green-600 border-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm">Total Revenue</p>
                            <p className="text-2xl font-bold text-white">${totalRevenue.toLocaleString()}</p>
                        </div>
                        <DollarSign className="h-10 w-10 text-green-200" />
                    </div>
                </div>
                <div className="card p-5 border-l-4 border-l-amber-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Pending Amount</p>
                            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">${pendingAmount.toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-amber-100 dark:bg-amber-500/20 rounded-xl">
                            <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>
                </div>
                <div className="card p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Total Invoices</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalInvoices}</p>
                        </div>
                        <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-xl">
                            <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>
                <div className="card p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Paid Invoices</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{paidInvoices}</p>
                        </div>
                        <div className="p-3 bg-green-100 dark:bg-green-500/20 rounded-xl">
                            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="card p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by patient name, invoice ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        {['ALL', 'PAID', 'PARTIAL', 'PENDING'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    filterStatus === status
                                        ? 'bg-green-600 text-white'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                            >
                                {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Invoice Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Invoice</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Patient</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Paid</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Balance</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {filteredInvoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <p className="font-semibold text-blue-600 dark:text-blue-400">{inv.id}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-sm">
                                                {inv.patientName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">{inv.patientName}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{inv.patientId}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-sm text-slate-900 dark:text-white">{inv.date}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Due: {inv.dueDate}</p>
                                    </td>
                                    <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">${inv.total.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right font-medium text-green-600 dark:text-green-400">${inv.paid.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right">
                                        <span className={inv.balance > 0 ? 'font-semibold text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}>
                                            ${inv.balance.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[inv.status].bg} ${statusStyles[inv.status].text}`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => setSelectedInvoice(inv)}
                                                className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                                title="View"
                                            >
                                                <Eye className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                            </button>
                                            <button 
                                                className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                                title="Print"
                                            >
                                                <Printer className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                            </button>
                                            {inv.balance > 0 && (
                                                <button className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors">
                                                    Pay
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Invoice Detail Modal */}
            {selectedInvoice && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setSelectedInvoice(null)}>
                    <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Invoice {selectedInvoice.id}</h2>
                            <button onClick={() => setSelectedInvoice(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                                <X className="h-5 w-5 text-slate-500" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Patient</p>
                                    <p className="font-semibold text-slate-900 dark:text-white">{selectedInvoice.patientName}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{selectedInvoice.patientId}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Date</p>
                                    <p className="font-medium text-slate-900 dark:text-white">{selectedInvoice.date}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Due: {selectedInvoice.dueDate}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Items</h3>
                                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400">Description</th>
                                                <th className="px-4 py-2 text-center text-xs font-medium text-slate-500 dark:text-slate-400">Qty</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 dark:text-slate-400">Rate</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 dark:text-slate-400">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                            {selectedInvoice.items.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="px-4 py-2 text-sm text-slate-900 dark:text-white">{item.desc}</td>
                                                    <td className="px-4 py-2 text-sm text-center text-slate-600 dark:text-slate-400">{item.qty}</td>
                                                    <td className="px-4 py-2 text-sm text-right text-slate-600 dark:text-slate-400">${item.rate}</td>
                                                    <td className="px-4 py-2 text-sm text-right font-medium text-slate-900 dark:text-white">${item.amount}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <div className="w-64 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
                                        <span className="text-slate-900 dark:text-white">${selectedInvoice.subtotal.toLocaleString()}</span>
                                    </div>
                                    {selectedInvoice.discount > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500 dark:text-slate-400">Discount</span>
                                            <span className="text-green-600 dark:text-green-400">-${selectedInvoice.discount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-base font-semibold pt-2 border-t border-slate-200 dark:border-slate-700">
                                        <span className="text-slate-900 dark:text-white">Total</span>
                                        <span className="text-slate-900 dark:text-white">${selectedInvoice.total.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 dark:text-slate-400">Paid</span>
                                        <span className="text-green-600 dark:text-green-400">${selectedInvoice.paid.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-base font-semibold">
                                        <span className="text-slate-900 dark:text-white">Balance</span>
                                        <span className={selectedInvoice.balance > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                                            ${selectedInvoice.balance.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
                            <button className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2">
                                <Printer className="h-4 w-4" /> Print
                            </button>
                            {selectedInvoice.balance > 0 && (
                                <button className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2">
                                    <DollarSign className="h-4 w-4" /> Collect Payment
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Create Invoice Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setShowCreateModal(false)}>
                    <div className="card max-w-xl w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Create New Invoice</h2>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                                <X className="h-5 w-5 text-slate-500" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Patient ID</label>
                                    <input type="text" placeholder="P001" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Patient Name</label>
                                    <input type="text" placeholder="John Doe" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Service/Item</label>
                                <input type="text" placeholder="OPD Consultation" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Quantity</label>
                                    <input type="number" placeholder="1" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rate ($)</label>
                                    <input type="number" placeholder="500" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Discount ($)</label>
                                    <input type="number" placeholder="0" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
                                </div>
                            </div>
                            <button className="w-full px-4 py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-500 dark:text-slate-400 hover:border-green-500 hover:text-green-500 transition-colors">
                                + Add Another Item
                            </button>
                        </div>
                        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
                            <button onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                                Cancel
                            </button>
                            <button className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                                Create Invoice
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
