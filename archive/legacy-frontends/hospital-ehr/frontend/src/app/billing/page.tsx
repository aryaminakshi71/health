'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    DollarSign, Printer, Check, Clock, Plus, Search, Filter,
    CreditCard, Banknote, Smartphone, Building2, FileText, TrendingUp,
    ArrowUpRight, ArrowDownRight, Calendar, User, MoreVertical
} from 'lucide-react';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SearchInput } from '@/components/ui/SearchInput';

// Complete mock data
const mockInvoices = [
    {
        id: 'INV-2024-001', patientName: 'Rahul Sharma', patientId: 'P001', date: '2024-12-28', items: [
            { desc: 'OPD Consultation', qty: 1, rate: 500, amount: 500 },
            { desc: 'Blood Test - CBC', qty: 1, rate: 450, amount: 450 },
            { desc: 'X-Ray Chest', qty: 1, rate: 800, amount: 800 },
        ], subtotal: 1750, discount: 0, tax: 0, total: 1750, paid: 1750, balance: 0, status: 'PAID', paymentMode: 'UPI'
    },
    {
        id: 'INV-2024-002', patientName: 'Priya Gupta', patientId: 'P002', date: '2024-12-28', items: [
            { desc: 'IPD - General Ward (3 days)', qty: 3, rate: 1500, amount: 4500 },
            { desc: 'Medicines', qty: 1, rate: 2200, amount: 2200 },
            { desc: 'Doctor Visit', qty: 3, rate: 500, amount: 1500 },
        ], subtotal: 8200, discount: 500, tax: 0, total: 7700, paid: 5000, balance: 2700, status: 'PARTIAL', paymentMode: 'Cash'
    },
    {
        id: 'INV-2024-003', patientName: 'Amit Kumar', patientId: 'P003', date: '2024-12-27', items: [
            { desc: 'ICU (2 days)', qty: 2, rate: 8000, amount: 16000 },
            { desc: 'Ventilator', qty: 2, rate: 3000, amount: 6000 },
            { desc: 'Medicines', qty: 1, rate: 5500, amount: 5500 },
        ], subtotal: 27500, discount: 0, tax: 0, total: 27500, paid: 0, balance: 27500, status: 'PENDING', paymentMode: null
    },
    {
        id: 'INV-2024-004', patientName: 'Sneha Patel', patientId: 'P004', date: '2024-12-27', items: [
            { desc: 'Consultation', qty: 1, rate: 500, amount: 500 },
        ], subtotal: 500, discount: 0, tax: 0, total: 500, paid: 500, balance: 0, status: 'PAID', paymentMode: 'Card'
    },
];

const paymentModeIcons: Record<string, any> = {
    Cash: Banknote,
    Card: CreditCard,
    UPI: Smartphone,
    Insurance: Building2,
};

const statusColors: Record<string, string> = {
    PAID: 'bg-green-500/20 text-green-400 border-green-500/30',
    PARTIAL: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    PENDING: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function BillingDashboard() {
    const [invoices] = useState(mockInvoices);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [selectedInvoice, setSelectedInvoice] = useState<typeof mockInvoices[0] | null>(null);

    const totalRevenue = invoices.reduce((sum, i) => sum + i.paid, 0);
    const pendingAmount = invoices.reduce((sum, i) => sum + i.balance, 0);
    const todayRevenue = invoices.filter(i => i.date === '2024-12-28').reduce((sum, i) => sum + i.paid, 0);
    const invoiceCount = invoices.length;

    const filteredInvoices = invoices.filter(inv => {
        const matchesSearch = inv.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inv.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'ALL' || inv.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const printInvoice = (invoice: typeof mockInvoices[0]) => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Invoice ${invoice.id}</title>
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                        .header { display: flex; justify-content: space-between; border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
                        .hospital h1 { color: #0f172a; font-size: 24px; font-weight: bold; }
                        .hospital p { font-size: 12px; color: #64748b; line-height: 1.6; }
                        .invoice-title { font-size: 32px; color: #3b82f6; font-weight: bold; }
                        .invoice-meta { text-align: right; }
                        .invoice-meta p { margin: 3px 0; font-size: 13px; }
                        .patient-box { background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
                        .patient-box h3 { color: #3b82f6; margin-bottom: 10px; font-size: 14px; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                        th { background: #3b82f6; color: white; padding: 12px; text-align: left; font-size: 13px; }
                        td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
                        .amount { text-align: right; }
                        .totals { width: 300px; margin-left: auto; }
                        .totals tr td { padding: 8px 12px; }
                        .totals .grand-total { font-size: 18px; font-weight: bold; background: #f8fafc; }
                        .totals .grand-total td:last-child { color: #3b82f6; }
                        .status-paid { color: #22c55e; font-weight: bold; }
                        .status-pending { color: #ef4444; font-weight: bold; }
                        .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #666; text-align: center; }
                        @media print { body { padding: 20px; } }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="hospital">
                            <h1>Truvias</h1>
                            <p>SCO 42, Old Judicial Complex, Civil Lines<br/>Gurugram, Haryana 122001<br/>Tel: 01244206860 | Email: appointment@truvias.com</p>
                        </div>
                        <div class="invoice-meta">
                            <div class="invoice-title">INVOICE</div>
                            <p><strong>${invoice.id}</strong></p>
                            <p>Date: ${invoice.date}</p>
                        </div>
                    </div>
                    
                    <div class="patient-box">
                        <h3>BILL TO</h3>
                        <p><strong>${invoice.patientName}</strong></p>
                        <p>Patient ID: ${invoice.patientId}</p>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Description</th>
                                <th class="amount">Qty</th>
                                <th class="amount">Rate (₹)</th>
                                <th class="amount">Amount (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${invoice.items.map((item, i) => `
                                <tr>
                                    <td>${i + 1}</td>
                                    <td>${item.desc}</td>
                                    <td class="amount">${item.qty}</td>
                                    <td class="amount">${item.rate.toLocaleString()}</td>
                                    <td class="amount">${item.amount.toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <table class="totals">
                        <tr><td>Subtotal</td><td class="amount">₹${invoice.subtotal.toLocaleString()}</td></tr>
                        ${invoice.discount > 0 ? `<tr><td>Discount</td><td class="amount">-₹${invoice.discount.toLocaleString()}</td></tr>` : ''}
                        <tr class="grand-total"><td>Grand Total</td><td class="amount">₹${invoice.total.toLocaleString()}</td></tr>
                        <tr><td>Paid</td><td class="amount">₹${invoice.paid.toLocaleString()}</td></tr>
                        <tr><td>Balance</td><td class="amount ${invoice.balance > 0 ? 'status-pending' : 'status-paid'}">₹${invoice.balance.toLocaleString()}</td></tr>
                    </table>
                    
                    <div class="footer">
                        <p>Thank you for choosing Truvias - Your health, our priority</p>
                        <p>This is a computer-generated invoice and does not require a signature</p>
                    </div>
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Billing & Invoicing</h1>
                    <p className="text-slate-400">Revenue Management • {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary">
                        <FileText className="h-4 w-4 mr-2" /> Reports
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700">
                        <Plus className="h-4 w-4 mr-2" /> New Invoice
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-5 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm">Today's Collection</p>
                            <p className="text-3xl font-bold">₹{todayRevenue.toLocaleString()}</p>
                            <div className="flex items-center text-green-200 text-sm mt-1">
                                <ArrowUpRight className="h-4 w-4" />
                                <span>+12% vs yesterday</span>
                            </div>
                        </div>
                        <DollarSign className="h-10 w-10 text-green-200" />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-5 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm">Total Revenue (MTD)</p>
                            <p className="text-3xl font-bold">₹{totalRevenue.toLocaleString()}</p>
                        </div>
                        <TrendingUp className="h-10 w-10 text-blue-200" />
                    </div>
                </div>
                <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 border-l-4 border-l-orange-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Pending</p>
                            <p className="text-3xl font-bold text-orange-400">₹{pendingAmount.toLocaleString()}</p>
                        </div>
                        <div className="p-2 bg-orange-500/20 rounded-full">
                            <Clock className="h-6 w-6 text-orange-500" />
                        </div>
                    </div>
                </div>
                <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 border-l-4 border-l-purple-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Invoices Today</p>
                            <p className="text-3xl font-bold text-purple-400">{invoiceCount}</p>
                        </div>
                        <div className="p-2 bg-purple-500/20 rounded-full">
                            <FileText className="h-6 w-6 text-purple-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <SearchInput
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search by patient name or invoice number..."
                    />
                </div>
                <div className="flex gap-2">
                    {['ALL', 'PAID', 'PARTIAL', 'PENDING'].map((status) => (
                        <Button
                            key={status}
                            variant={filterStatus === status ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilterStatus(status)}
                            className={filterStatus === status ? 'bg-green-600' : ''}
                        >
                            {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Invoice Table */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-900/50 border-b border-slate-700">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Invoice</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Patient</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Date</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase">Amount</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase">Paid</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase">Balance</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-400 uppercase">Status</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {filteredInvoices.map((inv) => {
                                const PaymentIcon = inv.paymentMode ? paymentModeIcons[inv.paymentMode] : null;
                                return (
                                    <tr key={inv.id} className="hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-blue-400">{inv.id}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold">
                                                    {inv.patientName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{inv.patientName}</p>
                                                    <p className="text-xs text-slate-400">{inv.patientId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400">{inv.date}</td>
                                        <td className="px-6 py-4 text-right font-semibold text-white">₹{inv.total.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right text-green-400 font-medium">₹{inv.paid.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={inv.balance > 0 ? 'text-red-400 font-semibold' : 'text-slate-400'}>
                                                ₹{inv.balance.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusColors[inv.status]}`}>
                                                {PaymentIcon && <PaymentIcon className="h-3 w-3" />}
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button size="sm" variant="secondary" onClick={() => printInvoice(inv)}>
                                                    <Printer className="h-3.5 w-3.5" />
                                                </Button>
                                                {inv.balance > 0 && (
                                                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                                        <DollarSign className="h-3.5 w-3.5 mr-1" /> Pay
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
