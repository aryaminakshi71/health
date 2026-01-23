'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    User, Calendar, FileText, Pill, CreditCard, Bell,
    Clock, CheckCircle, Download, Phone, MapPin, Heart
} from 'lucide-react';

// Mock patient data (logged in patient view)
const mockPatientData = {
    id: 'P001',
    name: 'Rahul Sharma',
    age: 32,
    gender: 'Male',
    phone: '9876543210',
    email: 'rahul.sharma@email.com',
    address: '123 Main Street, Mumbai 400001',
    bloodGroup: 'O+',
    allergies: ['Penicillin'],
    emergencyContact: { name: 'Priya Sharma', relation: 'Wife', phone: '9876543211' },
};

const mockAppointments = [
    { id: '1', date: '2024-12-30', time: '10:00 AM', doctor: 'Dr. Patel', department: 'General Medicine', status: 'CONFIRMED', type: 'Follow-up' },
    { id: '2', date: '2025-01-05', time: '2:30 PM', doctor: 'Dr. Mehta', department: 'Cardiology', status: 'PENDING', type: 'Consultation' },
];

const mockPrescriptions = [
    {
        id: 'RX-001',
        date: '2024-12-25',
        doctor: 'Dr. Patel',
        diagnosis: 'Viral Fever',
        medicines: [
            { name: 'Paracetamol 500mg', dosage: '1-0-1', duration: '3 days' },
            { name: 'Cetirizine 10mg', dosage: '0-0-1', duration: '5 days' },
        ]
    },
    {
        id: 'RX-002',
        date: '2024-12-10',
        doctor: 'Dr. Singh',
        diagnosis: 'Hypertension',
        medicines: [
            { name: 'Amlodipine 5mg', dosage: '1-0-0', duration: '30 days' },
            { name: 'Telmisartan 40mg', dosage: '1-0-0', duration: '30 days' },
        ]
    },
];

const mockLabReports = [
    { id: 'LAB-001', date: '2024-12-20', tests: ['CBC', 'Lipid Profile'], status: 'READY' },
    { id: 'LAB-002', date: '2024-12-15', tests: ['Blood Sugar Fasting'], status: 'READY' },
];

const mockBills = [
    { id: 'INV-001', date: '2024-12-25', amount: 1500, paid: 1500, status: 'PAID' },
    { id: 'INV-002', date: '2024-12-10', amount: 2500, paid: 2500, status: 'PAID' },
];

export default function PatientPortalPage() {
    const [activeTab, setActiveTab] = useState('dashboard');

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: User },
        { id: 'appointments', label: 'Appointments', icon: Calendar },
        { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
        { id: 'reports', label: 'Lab Reports', icon: FileText },
        { id: 'bills', label: 'Bills', icon: CreditCard },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
                                {mockPatientData.name.charAt(0)}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Welcome, {mockPatientData.name}</h1>
                                <p className="text-blue-100">Patient ID: {mockPatientData.id}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button variant="outline" className="text-white border-white hover:bg-white/10">
                                <Bell className="h-4 w-4" />
                            </Button>
                            <Button className="bg-white text-blue-600 hover:bg-blue-50">
                                Book Appointment
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-6xl mx-auto">
                    <div className="flex gap-1 overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto p-6">
                {activeTab === 'dashboard' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Quick Stats */}
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Quick Overview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                                        <Calendar className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                                        <p className="text-2xl font-bold text-blue-600">{mockAppointments.length}</p>
                                        <p className="text-sm text-gray-600">Upcoming</p>
                                    </div>
                                    <div className="text-center p-4 bg-green-50 rounded-xl">
                                        <FileText className="h-8 w-8 mx-auto text-green-600 mb-2" />
                                        <p className="text-2xl font-bold text-green-600">{mockLabReports.length}</p>
                                        <p className="text-sm text-gray-600">Reports Ready</p>
                                    </div>
                                    <div className="text-center p-4 bg-purple-50 rounded-xl">
                                        <Pill className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                                        <p className="text-2xl font-bold text-purple-600">{mockPrescriptions.length}</p>
                                        <p className="text-sm text-gray-600">Prescriptions</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Profile Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>My Profile</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <Heart className="h-4 w-4 text-red-500" />
                                    <span>Blood Group: <strong>{mockPatientData.bloodGroup}</strong></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    <span>{mockPatientData.phone}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-600">{mockPatientData.address}</span>
                                </div>
                                {mockPatientData.allergies.length > 0 && (
                                    <div className="p-2 bg-red-50 rounded border border-red-200">
                                        <p className="text-xs text-red-600 font-medium">⚠️ Allergies</p>
                                        <p className="text-red-700">{mockPatientData.allergies.join(', ')}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Upcoming Appointment */}
                        <Card className="md:col-span-3">
                            <CardHeader>
                                <CardTitle>Next Appointment</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {mockAppointments[0] && (
                                    <div className="flex items-center gap-6 p-4 bg-blue-50 rounded-xl">
                                        <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                                            <p className="text-3xl font-bold text-blue-600">30</p>
                                            <p className="text-sm text-gray-600">Dec</p>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold">{mockAppointments[0].doctor}</h3>
                                            <p className="text-gray-600">{mockAppointments[0].department}</p>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    {mockAppointments[0].time}
                                                </span>
                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                                                    {mockAppointments[0].status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline">Reschedule</Button>
                                            <Button className="bg-blue-600 hover:bg-blue-700">Join Video</Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeTab === 'appointments' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">My Appointments</h2>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Calendar className="h-4 w-4 mr-2" /> Book New
                            </Button>
                        </div>
                        {mockAppointments.map((apt) => (
                            <Card key={apt.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-4">
                                        <div className="text-center p-3 bg-blue-100 rounded-xl min-w-[70px]">
                                            <p className="text-xl font-bold text-blue-600">{apt.date.split('-')[2]}</p>
                                            <p className="text-xs text-blue-600">Dec</p>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold">{apt.doctor}</h3>
                                            <p className="text-sm text-gray-500">{apt.department} • {apt.type}</p>
                                            <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> {apt.time}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${apt.status === 'CONFIRMED'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {apt.status}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {activeTab === 'prescriptions' && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">My Prescriptions</h2>
                        {mockPrescriptions.map((rx) => (
                            <Card key={rx.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="font-semibold">{rx.diagnosis}</h3>
                                            <p className="text-sm text-gray-500">{rx.doctor} • {rx.date}</p>
                                        </div>
                                        <Button variant="outline" size="sm">
                                            <Download className="h-3 w-3 mr-1" /> PDF
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        {rx.medicines.map((med, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                                                <Pill className="h-4 w-4 text-purple-600" />
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">{med.name}</p>
                                                    <p className="text-xs text-gray-500">{med.dosage} • {med.duration}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {activeTab === 'reports' && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Lab Reports</h2>
                        {mockLabReports.map((report) => (
                            <Card key={report.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <FileText className="h-10 w-10 text-indigo-600" />
                                            <div>
                                                <h3 className="font-semibold">{report.tests.join(', ')}</h3>
                                                <p className="text-sm text-gray-500">{report.date}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                                                <CheckCircle className="h-3 w-3" /> {report.status}
                                            </span>
                                            <Button variant="outline" size="sm">
                                                <Download className="h-3 w-3 mr-1" /> Download
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {activeTab === 'bills' && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Bills & Payments</h2>
                        {mockBills.map((bill) => (
                            <Card key={bill.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <CreditCard className="h-10 w-10 text-green-600" />
                                            <div>
                                                <h3 className="font-semibold">{bill.id}</h3>
                                                <p className="text-sm text-gray-500">{bill.date}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="font-bold text-lg">₹{bill.amount.toLocaleString()}</p>
                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                                                    {bill.status}
                                                </span>
                                            </div>
                                            <Button variant="outline" size="sm">
                                                <Download className="h-3 w-3 mr-1" /> Receipt
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
