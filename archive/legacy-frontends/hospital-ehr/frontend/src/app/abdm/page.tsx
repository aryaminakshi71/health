'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Shield, Link, CheckCircle, AlertCircle, Search,
    User, FileText, Upload, Download, RefreshCw, QrCode
} from 'lucide-react';

// Mock ABHA data
const mockLinkedPatients = [
    {
        id: '1',
        name: 'Rahul Sharma',
        abhaId: '91-1234-5678-9012',
        abhaAddress: 'rahul.sharma@abdm',
        linkedDate: '2024-12-15',
        status: 'ACTIVE',
        healthRecords: 12,
    },
    {
        id: '2',
        name: 'Priya Gupta',
        abhaId: '91-2345-6789-0123',
        abhaAddress: 'priya.gupta@abdm',
        linkedDate: '2024-12-20',
        status: 'ACTIVE',
        healthRecords: 8,
    },
];

const mockPendingConsent = [
    { id: 'C001', patient: 'Amit Kumar', purpose: 'View Lab Reports', requestedBy: 'Dr. Patel', date: '2024-12-28', status: 'PENDING' },
    { id: 'C002', patient: 'Sneha Patel', purpose: 'Share Prescription', requestedBy: 'City Hospital', date: '2024-12-27', status: 'PENDING' },
];

export default function ABDMPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('linked');
    const [showLinkModal, setShowLinkModal] = useState(false);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Shield className="h-8 w-8 text-orange-600" />
                        ABDM Integration
                    </h1>
                    <p className="text-gray-500">Ayushman Bharat Digital Mission • ABHA ID Linking</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" /> Sync Records
                    </Button>
                    <Button className="bg-orange-600 hover:bg-orange-700 shadow-lg">
                        <Link className="h-4 w-4 mr-2" /> Link ABHA ID
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-orange-500 to-orange-700 text-white">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm">Linked Patients</p>
                                <p className="text-3xl font-bold">{mockLinkedPatients.length}</p>
                            </div>
                            <User className="h-10 w-10 text-orange-200" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-green-500">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Records Shared</p>
                                <p className="text-3xl font-bold text-green-600">45</p>
                            </div>
                            <Upload className="h-6 w-6 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-blue-500">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Records Received</p>
                                <p className="text-3xl font-bold text-blue-600">23</p>
                            </div>
                            <Download className="h-6 w-6 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-yellow-500">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Pending Consent</p>
                                <p className="text-3xl font-bold text-yellow-600">{mockPendingConsent.length}</p>
                            </div>
                            <AlertCircle className="h-6 w-6 text-yellow-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b">
                {[
                    { id: 'linked', label: 'Linked Patients' },
                    { id: 'consent', label: 'Consent Requests' },
                    { id: 'link-new', label: 'Link New Patient' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                ? 'border-orange-600 text-orange-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'linked' && (
                <Card className="shadow-lg border-0">
                    <CardHeader className="border-b">
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name or ABHA ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Patient</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ABHA ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ABHA Address</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Records</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {mockLinkedPatients.map((patient) => (
                                    <tr key={patient.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold">
                                                    {patient.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{patient.name}</p>
                                                    <p className="text-xs text-gray-500">Linked: {patient.linkedDate}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-sm">{patient.abhaId}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{patient.abhaAddress}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
                                                {patient.healthRecords}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                                <CheckCircle className="h-3 w-3" /> {patient.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex justify-center gap-2">
                                                <Button size="sm" variant="outline">
                                                    <FileText className="h-3 w-3 mr-1" /> View Records
                                                </Button>
                                                <Button size="sm" variant="outline">
                                                    <Upload className="h-3 w-3 mr-1" /> Share
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            )}

            {activeTab === 'consent' && (
                <Card className="shadow-lg border-0">
                    <CardContent className="p-0">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Consent ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Patient</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Purpose</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Requested By</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {mockPendingConsent.map((consent) => (
                                    <tr key={consent.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-mono text-sm text-orange-600">{consent.id}</td>
                                        <td className="px-4 py-3 font-medium">{consent.patient}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{consent.purpose}</td>
                                        <td className="px-4 py-3 text-sm">{consent.requestedBy}</td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex justify-center gap-2">
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700">Approve</Button>
                                                <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">Deny</Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            )}

            {activeTab === 'link-new' && (
                <Card className="shadow-lg border-0 max-w-2xl">
                    <CardHeader>
                        <CardTitle>Link Patient ABHA ID</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" className="h-32 flex-col gap-2">
                                <QrCode className="h-10 w-10 text-orange-600" />
                                <span>Scan QR Code</span>
                            </Button>
                            <Button variant="outline" className="h-32 flex-col gap-2">
                                <User className="h-10 w-10 text-orange-600" />
                                <span>Enter ABHA ID</span>
                            </Button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">ABHA ID or Mobile Number</label>
                                <input
                                    type="text"
                                    placeholder="91-XXXX-XXXX-XXXX or 10-digit mobile"
                                    className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <Button className="w-full bg-orange-600 hover:bg-orange-700">
                                <Link className="h-4 w-4 mr-2" /> Verify & Link
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
