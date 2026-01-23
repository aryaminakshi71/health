'use client';

import React, { useState } from 'react';
import {
    LogOut, Search, User, Calendar, Clock, FileText, CreditCard,
    Printer, Download, CheckCircle, AlertCircle, ChevronDown,
    Building2, Stethoscope, Pill, TestTube, BedDouble, X, IndianRupee
} from 'lucide-react';

// Mock data for patients ready for discharge
const mockDischargePatients = [
    {
        id: 'ADM001',
        patientId: 'P10045',
        name: 'Rahul Sharma',
        age: 45,
        gender: 'Male',
        phone: '+91 98765 43210',
        ward: 'General Ward',
        bed: '101-A',
        admissionDate: '2024-12-20',
        diagnosis: 'Typhoid Fever',
        doctor: 'Dr. Amit Patel',
        status: 'Ready for Discharge',
        totalDays: 7,
        billing: {
            roomCharges: 10500,
            doctorFees: 5000,
            medicines: 3500,
            labTests: 2500,
            procedures: 0,
            miscellaneous: 500,
            totalAmount: 22000,
            paidAmount: 10000,
            discount: 0,
            balanceAmount: 12000,
        }
    },
    {
        id: 'ADM002',
        patientId: 'P10046',
        name: 'Priya Gupta',
        age: 32,
        gender: 'Female',
        phone: '+91 87654 32109',
        ward: 'General Ward',
        bed: '102-A',
        admissionDate: '2024-12-22',
        diagnosis: 'Dengue',
        doctor: 'Dr. Sunita Mehta',
        status: 'Ready for Discharge',
        totalDays: 5,
        billing: {
            roomCharges: 7500,
            doctorFees: 4000,
            medicines: 2800,
            labTests: 3500,
            procedures: 0,
            miscellaneous: 300,
            totalAmount: 18100,
            paidAmount: 18100,
            discount: 0,
            balanceAmount: 0,
        }
    },
    {
        id: 'ADM003',
        patientId: 'P10050',
        name: 'Sneha Patel',
        age: 42,
        gender: 'Female',
        phone: '+91 43210 98765',
        ward: 'Private Ward',
        bed: '301-A',
        admissionDate: '2024-12-23',
        diagnosis: 'Post Appendectomy',
        doctor: 'Dr. Vikram Reddy',
        status: 'Discharge Processing',
        totalDays: 4,
        billing: {
            roomCharges: 20000,
            doctorFees: 15000,
            medicines: 5000,
            labTests: 4000,
            procedures: 25000,
            miscellaneous: 1000,
            totalAmount: 70000,
            paidAmount: 50000,
            discount: 5000,
            balanceAmount: 15000,
        }
    },
];

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Ready for Discharge': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        case 'Discharge Processing': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        case 'Awaiting Payment': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
        default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
};

export default function PatientDischargePage() {
    const [patients] = useState(mockDischargePatients);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<typeof mockDischargePatients[0] | null>(null);
    const [showDischargeForm, setShowDischargeForm] = useState(false);

    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.patientId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        readyForDischarge: patients.filter(p => p.status === 'Ready for Discharge').length,
        processing: patients.filter(p => p.status === 'Discharge Processing').length,
        totalPending: patients.length,
        totalBillingDue: patients.reduce((sum, p) => sum + p.billing.balanceAmount, 0),
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <LogOut className="w-7 h-7 text-emerald-600" />
                        Patient Discharge
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Process patient discharges and final billing</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-600">{stats.readyForDischarge}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Ready for Discharge</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Processing</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <User className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalPending}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Total Pending</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                            <IndianRupee className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-amber-600">Rs. {stats.totalBillingDue.toLocaleString()}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Total Balance Due</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="card p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by patient name or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input pl-10"
                    />
                </div>
            </div>

            {/* Patient List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredPatients.map((patient) => (
                    <div key={patient.id} className="card overflow-hidden">
                        <div className="card-header bg-slate-50 dark:bg-slate-800/50">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                    <User className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white">{patient.name}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{patient.patientId} | {patient.age}yrs, {patient.gender}</p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(patient.status)}`}>
                                {patient.status}
                            </span>
                        </div>
                        <div className="card-body space-y-4">
                            {/* Admission Details */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-slate-400" />
                                    <span className="text-slate-500 dark:text-slate-400">Ward:</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{patient.ward}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <BedDouble className="w-4 h-4 text-slate-400" />
                                    <span className="text-slate-500 dark:text-slate-400">Bed:</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{patient.bed}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    <span className="text-slate-500 dark:text-slate-400">Admitted:</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{patient.admissionDate}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-slate-400" />
                                    <span className="text-slate-500 dark:text-slate-400">Days:</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{patient.totalDays} days</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                                <Stethoscope className="w-4 h-4 text-slate-400" />
                                <span className="text-slate-500 dark:text-slate-400">Diagnosis:</span>
                                <span className="font-medium text-slate-900 dark:text-white">{patient.diagnosis}</span>
                            </div>

                            {/* Billing Summary */}
                            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">Total Bill</span>
                                    <span className="font-bold text-slate-900 dark:text-white">Rs. {patient.billing.totalAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">Paid Amount</span>
                                    <span className="font-medium text-green-600">Rs. {patient.billing.paidAmount.toLocaleString()}</span>
                                </div>
                                {patient.billing.discount > 0 && (
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">Discount</span>
                                        <span className="font-medium text-blue-600">- Rs. {patient.billing.discount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Balance Due</span>
                                    <span className={`font-bold ${patient.billing.balanceAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        Rs. {patient.billing.balanceAmount.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSelectedPatient(patient)}
                                    className="btn btn-outline flex-1 text-sm"
                                >
                                    <FileText className="w-4 h-4 mr-1" />
                                    View Details
                                </button>
                                <button
                                    onClick={() => { setSelectedPatient(patient); setShowDischargeForm(true); }}
                                    className="btn btn-primary flex-1 text-sm"
                                >
                                    <LogOut className="w-4 h-4 mr-1" />
                                    Process Discharge
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Discharge Form Modal */}
            {showDischargeForm && selectedPatient && (
                <div className="modal-overlay" onClick={() => setShowDischargeForm(false)}>
                    <div className="modal max-w-3xl" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <LogOut className="w-5 h-5 text-emerald-600" />
                                Process Discharge - {selectedPatient.name}
                            </h2>
                            <button onClick={() => setShowDischargeForm(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <div className="modal-body space-y-6">
                            {/* Patient Summary */}
                            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p className="text-slate-500 dark:text-slate-400">Patient ID</p>
                                        <p className="font-medium text-slate-900 dark:text-white">{selectedPatient.patientId}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 dark:text-slate-400">Ward / Bed</p>
                                        <p className="font-medium text-slate-900 dark:text-white">{selectedPatient.ward} / {selectedPatient.bed}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 dark:text-slate-400">Admission Date</p>
                                        <p className="font-medium text-slate-900 dark:text-white">{selectedPatient.admissionDate}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 dark:text-slate-400">Total Stay</p>
                                        <p className="font-medium text-slate-900 dark:text-white">{selectedPatient.totalDays} days</p>
                                    </div>
                                </div>
                            </div>

                            {/* Discharge Summary */}
                            <div>
                                <h3 className="font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Discharge Summary
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Final Diagnosis</label>
                                        <input type="text" defaultValue={selectedPatient.diagnosis} className="input" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Treatment Summary</label>
                                        <textarea className="input min-h-[80px]" placeholder="Enter treatment summary..." />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Discharge Instructions</label>
                                        <textarea className="input min-h-[60px]" placeholder="Enter discharge instructions for patient..." />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Follow-up Date</label>
                                            <input type="date" className="input" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Condition at Discharge</label>
                                            <select className="input">
                                                <option value="Recovered">Recovered</option>
                                                <option value="Improved">Improved</option>
                                                <option value="Stable">Stable</option>
                                                <option value="Referred">Referred</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Billing Checkout */}
                            <div>
                                <h3 className="font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                    <CreditCard className="w-4 h-4" />
                                    Billing Checkout
                                </h3>
                                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                            <BedDouble className="w-4 h-4" /> Room Charges
                                        </span>
                                        <span className="font-medium text-slate-900 dark:text-white">Rs. {selectedPatient.billing.roomCharges.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                            <Stethoscope className="w-4 h-4" /> Doctor Fees
                                        </span>
                                        <span className="font-medium text-slate-900 dark:text-white">Rs. {selectedPatient.billing.doctorFees.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                            <Pill className="w-4 h-4" /> Medicines
                                        </span>
                                        <span className="font-medium text-slate-900 dark:text-white">Rs. {selectedPatient.billing.medicines.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                            <TestTube className="w-4 h-4" /> Lab Tests
                                        </span>
                                        <span className="font-medium text-slate-900 dark:text-white">Rs. {selectedPatient.billing.labTests.toLocaleString()}</span>
                                    </div>
                                    {selectedPatient.billing.procedures > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500 dark:text-slate-400">Procedures</span>
                                            <span className="font-medium text-slate-900 dark:text-white">Rs. {selectedPatient.billing.procedures.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 dark:text-slate-400">Miscellaneous</span>
                                        <span className="font-medium text-slate-900 dark:text-white">Rs. {selectedPatient.billing.miscellaneous.toLocaleString()}</span>
                                    </div>
                                    <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                                        <div className="flex justify-between text-sm font-medium">
                                            <span className="text-slate-700 dark:text-slate-300">Total Amount</span>
                                            <span className="text-slate-900 dark:text-white">Rs. {selectedPatient.billing.totalAmount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-green-600">Paid Amount</span>
                                            <span className="text-green-600">- Rs. {selectedPatient.billing.paidAmount.toLocaleString()}</span>
                                        </div>
                                        {selectedPatient.billing.discount > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-blue-600">Discount</span>
                                                <span className="text-blue-600">- Rs. {selectedPatient.billing.discount.toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                            <span className="text-slate-900 dark:text-white">Balance Due</span>
                                            <span className={selectedPatient.billing.balanceAmount > 0 ? 'text-red-600' : 'text-green-600'}>
                                                Rs. {selectedPatient.billing.balanceAmount.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {selectedPatient.billing.balanceAmount > 0 && (
                                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                                            <AlertCircle className="w-5 h-5" />
                                            <span className="font-medium">Payment Required</span>
                                        </div>
                                        <p className="text-sm text-amber-600 dark:text-amber-500 mt-1">
                                            Balance amount of Rs. {selectedPatient.billing.balanceAmount.toLocaleString()} must be cleared before discharge.
                                        </p>
                                        <button className="btn btn-primary mt-3 text-sm">
                                            <CreditCard className="w-4 h-4 mr-1" />
                                            Process Payment
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline flex items-center gap-2">
                                <Printer className="w-4 h-4" />
                                Print Summary
                            </button>
                            <button className="btn btn-outline flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                Download PDF
                            </button>
                            <button
                                className="btn btn-primary flex items-center gap-2"
                                disabled={selectedPatient.billing.balanceAmount > 0}
                            >
                                <CheckCircle className="w-4 h-4" />
                                Complete Discharge
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
