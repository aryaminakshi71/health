'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Shield, Clock, User, FileText, Search, Filter,
    Eye, Edit, Trash, Download, LogIn, LogOut,
    AlertTriangle, CheckCircle, Info
} from 'lucide-react';

// Mock audit logs
const mockAuditLogs = [
    { id: '1', timestamp: '2024-12-28 11:45:23', user: 'Dr. Patel', role: 'Doctor', action: 'VIEW', resource: 'Patient Record', resourceId: 'P001', patient: 'Rahul Sharma', ip: '192.168.1.101', status: 'SUCCESS' },
    { id: '2', timestamp: '2024-12-28 11:42:15', user: 'Nurse Priya', role: 'Nurse', action: 'UPDATE', resource: 'Vitals', resourceId: 'V123', patient: 'Rahul Sharma', ip: '192.168.1.102', status: 'SUCCESS' },
    { id: '3', timestamp: '2024-12-28 11:38:02', user: 'Dr. Sharma', role: 'Doctor', action: 'CREATE', resource: 'Prescription', resourceId: 'RX-001', patient: 'Priya Gupta', ip: '192.168.1.103', status: 'SUCCESS' },
    { id: '4', timestamp: '2024-12-28 11:35:45', user: 'Admin', role: 'Admin', action: 'DELETE', resource: 'User Account', resourceId: 'U045', patient: '-', ip: '192.168.1.100', status: 'SUCCESS' },
    { id: '5', timestamp: '2024-12-28 11:30:12', user: 'Unknown', role: '-', action: 'LOGIN_FAILED', resource: 'System', resourceId: '-', patient: '-', ip: '203.45.67.89', status: 'FAILED' },
    { id: '6', timestamp: '2024-12-28 11:28:00', user: 'Dr. Patel', role: 'Doctor', action: 'EXPORT', resource: 'Lab Report', resourceId: 'LAB-003', patient: 'Amit Kumar', ip: '192.168.1.101', status: 'SUCCESS' },
    { id: '7', timestamp: '2024-12-28 11:25:33', user: 'Receptionist', role: 'Staff', action: 'CREATE', resource: 'Appointment', resourceId: 'APT-100', patient: 'New Patient', ip: '192.168.1.105', status: 'SUCCESS' },
    { id: '8', timestamp: '2024-12-28 11:20:18', user: 'Dr. Mehta', role: 'Doctor', action: 'VIEW', resource: 'Patient Record', resourceId: 'P002', patient: 'Kavita Singh', ip: '192.168.1.104', status: 'SUCCESS' },
];

const actionIcons: Record<string, any> = {
    VIEW: Eye,
    CREATE: FileText,
    UPDATE: Edit,
    DELETE: Trash,
    EXPORT: Download,
    LOGIN: LogIn,
    LOGOUT: LogOut,
    LOGIN_FAILED: AlertTriangle,
};

const actionColors: Record<string, string> = {
    VIEW: 'bg-blue-100 text-blue-700',
    CREATE: 'bg-green-100 text-green-700',
    UPDATE: 'bg-yellow-100 text-yellow-700',
    DELETE: 'bg-red-100 text-red-700',
    EXPORT: 'bg-purple-100 text-purple-700',
    LOGIN: 'bg-green-100 text-green-700',
    LOGOUT: 'bg-gray-100 text-gray-700',
    LOGIN_FAILED: 'bg-red-100 text-red-700',
};

export default function AuditLogPage() {
    const [logs] = useState(mockAuditLogs);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterAction, setFilterAction] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.resource.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesAction = filterAction === 'ALL' || log.action === filterAction;
        const matchesStatus = filterStatus === 'ALL' || log.status === filterStatus;
        return matchesSearch && matchesAction && matchesStatus;
    });

    const failedAttempts = logs.filter(l => l.status === 'FAILED').length;
    const sensitiveAccess = logs.filter(l => l.action === 'VIEW' || l.action === 'EXPORT').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Shield className="h-8 w-8 text-slate-600" />
                        Audit Logs
                    </h1>
                    <p className="text-gray-500">HIPAA Compliance • Access Tracking • Security Monitoring</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" /> Export Logs
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-slate-600 to-slate-800 text-white">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-200 text-sm">Total Events</p>
                                <p className="text-3xl font-bold">{logs.length}</p>
                            </div>
                            <FileText className="h-10 w-10 text-slate-300" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-red-500">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Failed Attempts</p>
                                <p className="text-3xl font-bold text-red-600">{failedAttempts}</p>
                            </div>
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-blue-500">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Data Access</p>
                                <p className="text-3xl font-bold text-blue-600">{sensitiveAccess}</p>
                            </div>
                            <Eye className="h-6 w-6 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-green-500">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Active Users</p>
                                <p className="text-3xl font-bold text-green-600">8</p>
                            </div>
                            <User className="h-6 w-6 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by user, patient, or resource..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={filterAction}
                        onChange={(e) => setFilterAction(e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                    >
                        <option value="ALL">All Actions</option>
                        <option value="VIEW">View</option>
                        <option value="CREATE">Create</option>
                        <option value="UPDATE">Update</option>
                        <option value="DELETE">Delete</option>
                        <option value="EXPORT">Export</option>
                        <option value="LOGIN_FAILED">Login Failed</option>
                    </select>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                    >
                        <option value="ALL">All Status</option>
                        <option value="SUCCESS">Success</option>
                        <option value="FAILED">Failed</option>
                    </select>
                </div>
            </div>

            {/* Logs Table */}
            <Card className="shadow-lg border-0">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Timestamp</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Action</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Resource</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Patient</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">IP Address</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredLogs.map((log) => {
                                    const ActionIcon = actionIcons[log.action] || Info;
                                    return (
                                        <tr key={log.id} className={`hover:bg-gray-50 ${log.status === 'FAILED' ? 'bg-red-50' : ''}`}>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Clock className="h-3 w-3 text-gray-400" />
                                                    <span className="font-mono text-gray-600">{log.timestamp}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="font-medium text-sm">{log.user}</p>
                                                    <p className="text-xs text-gray-500">{log.role}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${actionColors[log.action]}`}>
                                                    <ActionIcon className="h-3 w-3" />
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm">{log.resource}</p>
                                                <p className="text-xs text-gray-500 font-mono">{log.resourceId}</p>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{log.patient}</td>
                                            <td className="px-4 py-3 font-mono text-sm text-gray-500">{log.ip}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${log.status === 'SUCCESS'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {log.status === 'SUCCESS' ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                                                    {log.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
