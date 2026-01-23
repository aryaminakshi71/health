'use client';

import React, { useState } from 'react';
import {
    Pill, Clock, CheckCircle, XCircle, Search, Filter,
    User, Calendar, FileText, AlertCircle, Package, Eye
} from 'lucide-react';

const mockPrescriptions = [
    { id: 'RX-2024-001', patientName: 'Rahul Sharma', patientId: 'P001', doctor: 'Dr. Priya Mehta', date: '2024-12-28', time: '09:30', items: [
        { name: 'Paracetamol 500mg', dosage: '1-0-1', days: 5, qty: 10 },
        { name: 'Cetirizine 10mg', dosage: '0-0-1', days: 5, qty: 5 },
    ], status: 'PENDING', priority: 'NORMAL' },
    { id: 'RX-2024-002', patientName: 'Priya Gupta', patientId: 'P002', doctor: 'Dr. Amit Singh', date: '2024-12-28', time: '10:15', items: [
        { name: 'Amoxicillin 250mg', dosage: '1-1-1', days: 7, qty: 21 },
        { name: 'Pantoprazole 40mg', dosage: '1-0-0', days: 7, qty: 7 },
    ], status: 'PENDING', priority: 'URGENT' },
    { id: 'RX-2024-003', patientName: 'Amit Kumar', patientId: 'P003', doctor: 'Dr. Neha Sharma', date: '2024-12-28', time: '11:00', items: [
        { name: 'Metformin 500mg', dosage: '1-0-1', days: 30, qty: 60 },
    ], status: 'PROCESSING', priority: 'NORMAL' },
    { id: 'RX-2024-004', patientName: 'Sneha Patel', patientId: 'P004', doctor: 'Dr. Priya Mehta', date: '2024-12-28', time: '08:45', items: [
        { name: 'Atorvastatin 10mg', dosage: '0-0-1', days: 30, qty: 30 },
        { name: 'Losartan 50mg', dosage: '1-0-0', days: 30, qty: 30 },
    ], status: 'DISPENSED', priority: 'NORMAL' },
    { id: 'RX-2024-005', patientName: 'Vikram Joshi', patientId: 'P005', doctor: 'Dr. Amit Singh', date: '2024-12-27', time: '16:30', items: [
        { name: 'Azithromycin 500mg', dosage: '1-0-0', days: 3, qty: 3 },
    ], status: 'DISPENSED', priority: 'NORMAL' },
    { id: 'RX-2024-006', patientName: 'Meera Reddy', patientId: 'P006', doctor: 'Dr. Neha Sharma', date: '2024-12-27', time: '14:00', items: [
        { name: 'Omeprazole 20mg', dosage: '1-0-0', days: 14, qty: 14 },
        { name: 'Metoprolol 25mg', dosage: '1-0-1', days: 30, qty: 60 },
    ], status: 'DISPENSED', priority: 'NORMAL' },
    { id: 'RX-2024-007', patientName: 'Raj Malhotra', patientId: 'P007', doctor: 'Dr. Priya Mehta', date: '2024-12-28', time: '11:30', items: [
        { name: 'Paracetamol 500mg', dosage: '1-1-1', days: 3, qty: 9 },
    ], status: 'CANCELLED', priority: 'NORMAL' },
];

const statusStyles: Record<string, { bg: string; text: string; icon: any }> = {
    PENDING: { bg: 'bg-amber-100 dark:bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400', icon: Clock },
    PROCESSING: { bg: 'bg-blue-100 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-400', icon: Package },
    DISPENSED: { bg: 'bg-green-100 dark:bg-green-500/20', text: 'text-green-600 dark:text-green-400', icon: CheckCircle },
    CANCELLED: { bg: 'bg-red-100 dark:bg-red-500/20', text: 'text-red-600 dark:text-red-400', icon: XCircle },
};

const priorityStyles: Record<string, string> = {
    NORMAL: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400',
    URGENT: 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400',
};

export default function PrescriptionDispensingPage() {
    const [prescriptions] = useState(mockPrescriptions);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [selectedPrescription, setSelectedPrescription] = useState<typeof mockPrescriptions[0] | null>(null);

    const pendingCount = prescriptions.filter(p => p.status === 'PENDING').length;
    const processingCount = prescriptions.filter(p => p.status === 'PROCESSING').length;
    const dispensedToday = prescriptions.filter(p => p.status === 'DISPENSED' && p.date === '2024-12-28').length;
    const urgentCount = prescriptions.filter(p => p.priority === 'URGENT' && p.status === 'PENDING').length;

    const filteredPrescriptions = prescriptions.filter(p => {
        const matchesSearch = p.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.doctor.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'ALL' || p.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const pendingPrescriptions = filteredPrescriptions.filter(p => p.status === 'PENDING' || p.status === 'PROCESSING');
    const dispensedPrescriptions = filteredPrescriptions.filter(p => p.status === 'DISPENSED');

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">Prescription Dispensing</h1>
                    <p className="text-slate-600 dark:text-slate-400">Manage and dispense prescriptions</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-500/20 rounded-lg">
                        <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        <span className="font-semibold text-amber-700 dark:text-amber-400">{pendingCount} Pending</span>
                    </div>
                    {urgentCount > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-500/20 rounded-lg animate-pulse">
                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            <span className="font-semibold text-red-700 dark:text-red-400">{urgentCount} Urgent</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card p-5 border-l-4 border-l-amber-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Pending</p>
                            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingCount}</p>
                        </div>
                        <div className="p-3 bg-amber-100 dark:bg-amber-500/20 rounded-xl">
                            <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>
                </div>
                <div className="card p-5 border-l-4 border-l-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Processing</p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{processingCount}</p>
                        </div>
                        <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-xl">
                            <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>
                <div className="card p-5 border-l-4 border-l-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Dispensed Today</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{dispensedToday}</p>
                        </div>
                        <div className="p-3 bg-green-100 dark:bg-green-500/20 rounded-xl">
                            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </div>
                <div className="card p-5 border-l-4 border-l-red-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Urgent</p>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{urgentCount}</p>
                        </div>
                        <div className="p-3 bg-red-100 dark:bg-red-500/20 rounded-xl">
                            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
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
                            placeholder="Search by patient, prescription ID, or doctor..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        {['ALL', 'PENDING', 'PROCESSING', 'DISPENSED'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    filterStatus === status
                                        ? 'bg-teal-600 text-white'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                            >
                                {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Pending Prescriptions */}
                <div className="card overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-amber-50 dark:bg-amber-500/10">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <Clock className="h-5 w-5 text-amber-500" />
                            Pending Prescriptions
                        </h2>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[600px] overflow-y-auto">
                        {pendingPrescriptions.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                                No pending prescriptions
                            </div>
                        ) : (
                            pendingPrescriptions.map((rx) => {
                                const StatusIcon = statusStyles[rx.status].icon;
                                return (
                                    <div key={rx.id} className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${rx.priority === 'URGENT' ? 'border-l-4 border-l-red-500' : ''}`}>
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-blue-600 dark:text-blue-400">{rx.id}</span>
                                                    {rx.priority === 'URGENT' && (
                                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityStyles[rx.priority]}`}>
                                                            URGENT
                                                        </span>
                                                    )}
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${statusStyles[rx.status].bg} ${statusStyles[rx.status].text}`}>
                                                        <StatusIcon className="h-3 w-3" />
                                                        {rx.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-2">
                                                    <span className="flex items-center gap-1">
                                                        <User className="h-4 w-4" />
                                                        {rx.patientName}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <FileText className="h-4 w-4" />
                                                        {rx.doctor}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {rx.items.map((item, idx) => (
                                                        <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs text-slate-700 dark:text-slate-300">
                                                            <Pill className="h-3 w-3 text-teal-500" />
                                                            {item.name} ({item.dosage}) x{item.qty}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className="text-xs text-slate-500 dark:text-slate-400">{rx.time}</span>
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => setSelectedPrescription(rx)}
                                                        className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                                    >
                                                        <Eye className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                                    </button>
                                                    <button className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded-lg transition-colors">
                                                        Dispense
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Dispensed List */}
                <div className="card overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-green-50 dark:bg-green-500/10">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            Dispensed Prescriptions
                        </h2>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[600px] overflow-y-auto">
                        {dispensedPrescriptions.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                                No dispensed prescriptions
                            </div>
                        ) : (
                            dispensedPrescriptions.map((rx) => (
                                <div key={rx.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-blue-600 dark:text-blue-400">{rx.id}</span>
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${statusStyles[rx.status].bg} ${statusStyles[rx.status].text}`}>
                                                    <CheckCircle className="h-3 w-3" />
                                                    DISPENSED
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-2">
                                                <span className="flex items-center gap-1">
                                                    <User className="h-4 w-4" />
                                                    {rx.patientName}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    {rx.date}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {rx.items.map((item, idx) => (
                                                    <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-500/10 rounded text-xs text-green-700 dark:text-green-400">
                                                        <Pill className="h-3 w-3" />
                                                        {item.name} x{item.qty}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setSelectedPrescription(rx)}
                                            className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            <Eye className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Prescription Detail Modal */}
            {selectedPrescription && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setSelectedPrescription(null)}>
                    <div className="card max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Prescription Details</h2>
                            <button onClick={() => setSelectedPrescription(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                                <XCircle className="h-5 w-5 text-slate-500" />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Prescription ID</p>
                                    <p className="font-semibold text-blue-600 dark:text-blue-400">{selectedPrescription.id}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Date</p>
                                    <p className="font-medium text-slate-900 dark:text-white">{selectedPrescription.date} {selectedPrescription.time}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Patient</p>
                                    <p className="font-medium text-slate-900 dark:text-white">{selectedPrescription.patientName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Doctor</p>
                                    <p className="font-medium text-slate-900 dark:text-white">{selectedPrescription.doctor}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Medications</p>
                                <div className="space-y-2">
                                    {selectedPrescription.items.map((item, idx) => (
                                        <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-slate-900 dark:text-white">{item.name}</span>
                                                <span className="text-teal-600 dark:text-teal-400 font-semibold">Qty: {item.qty}</span>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">Dosage: {item.dosage} | {item.days} days</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
                            {selectedPrescription.status === 'PENDING' || selectedPrescription.status === 'PROCESSING' ? (
                                <>
                                    <button className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors">
                                        Dispense Now
                                    </button>
                                    <button className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                                        Print Label
                                    </button>
                                </>
                            ) : (
                                <button className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                                    Print Receipt
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
