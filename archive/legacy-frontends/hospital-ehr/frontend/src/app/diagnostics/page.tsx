'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Scan, Activity, FileText, Printer, CheckCircle, Clock, Search, Image } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SearchInput, FilterDropdown } from '@/components/ui/SearchInput';

const mockDiagnostics = [
    { id: 'DX-001', patient: 'Rahul Sharma', age: 45, gender: 'M', test: 'X-Ray Chest', referredBy: 'Dr. Patel', status: 'COMPLETED', priority: 'ROUTINE', orderedAt: '09:00 AM', result: 'Normal Chest X-Ray', equipment: 'X-Ray 1' },
    { id: 'DX-002', patient: 'Priya Gupta', age: 28, gender: 'F', test: 'Ultrasound abdomen', referredBy: 'Dr. Mehta', status: 'IN_PROGRESS', priority: 'URGENT', orderedAt: '09:30 AM', result: null, equipment: 'USG 1' },
    { id: 'DX-003', patient: 'Amit Kumar', age: 55, gender: 'M', test: 'TMT', referredBy: 'Dr. Singh', status: 'PENDING', priority: 'STAT', orderedAt: '10:00 AM', result: null, equipment: 'TMT Lab' },
    { id: 'DX-004', patient: 'Sneha Patel', age: 35, gender: 'F', test: 'X-Ray Spine', referredBy: 'Dr. Reddy', status: 'COMPLETED', priority: 'ROUTINE', orderedAt: '08:00 AM', result: 'Lumbar Spondylosis changes', equipment: 'X-Ray 2' },
    { id: 'DX-005', patient: 'Vikram Joshi', age: 60, gender: 'M', test: 'Ultrasound KUB', referredBy: 'Dr. Patel', status: 'PENDING', priority: 'URGENT', orderedAt: '10:30 AM', result: null, equipment: 'USG 1' },
];

const testTypes = [
    { value: 'ALL', label: 'All Tests' },
    { value: 'X-Ray', label: 'X-Ray' },
    { value: 'Ultrasound', label: 'Ultrasound' },
    { value: 'TMT', label: 'TMT' },
    { value: 'CT', label: 'CT Scan' },
    { value: 'MRI', label: 'MRI' },
    { value: 'ECG', label: 'ECG' },
];

const equipmentStatus = [
    { id: 'X-Ray 1', name: 'X-Ray Machine 1', status: 'AVAILABLE', utilization: 75 },
    { id: 'X-Ray 2', name: 'X-Ray Machine 2', status: 'BUSY', utilization: 90 },
    { id: 'USG 1', name: 'Ultrasound 1', status: 'BUSY', utilization: 85 },
    { id: 'USG 2', name: 'Ultrasound 2', status: 'AVAILABLE', utilization: 40 },
    { id: 'TMT Lab', name: 'TMT Lab', status: 'AVAILABLE', utilization: 50 },
    { id: 'CT Scan', name: 'CT Scanner', status: 'AVAILABLE', utilization: 60 },
];

const priorityColors: Record<string, string> = {
    ROUTINE: 'bg-slate-700 text-slate-300',
    URGENT: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    STAT: 'bg-red-500 text-white',
};

export default function DiagnosticsDashboard() {
    const [diagnostics] = useState(mockDiagnostics);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterTest, setFilterTest] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');

    const pendingCount = diagnostics.filter(d => d.status === 'PENDING').length;
    const inProgressCount = diagnostics.filter(d => d.status === 'IN_PROGRESS').length;
    const completedCount = diagnostics.filter(d => d.status === 'COMPLETED').length;

    const filteredDiagnostics = diagnostics.filter(d => {
        const matchesSearch = d.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             d.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTest = filterTest === 'ALL' || d.test.includes(filterTest);
        const matchesStatus = filterStatus === 'ALL' || d.status === filterStatus;
        return matchesSearch && matchesTest && matchesStatus;
    });

    const printReport = (diagnostic: typeof mockDiagnostics[0]) => {
        if (diagnostic.status !== 'COMPLETED') return;
        
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Diagnostic Report - ${diagnostic.id}</title>
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; background: #fff; }
                        .header { border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 20px; }
                        .header h1 { color: #0f172a; font-size: 24px; font-weight: bold; }
                        .header p { font-size: 12px; color: #64748b; }
                        .patient-info { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
                        .patient-info div { font-size: 13px; }
                        .patient-info label { color: #64748b; font-size: 11px; display: block; }
                        .patient-info span { font-weight: 600; color: #0f172a; }
                        .report-box { background: #f8fafc; padding: 20px; border-radius: 8px; margin-top: 20px; }
                        .report-box h3 { color: #3b82f6; margin-bottom: 10px; }
                        .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #666; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Truvias - Diagnostic Report</h1>
                        <p>SCO 42, Old Judicial Complex, Civil Lines, Gurugram, Haryana 122001<br/>Tel: 01244206860 | Email: appointment@truvias.com</p>
                    </div>
                    <div class="patient-info">
                        <div><label>Patient Name</label><span>${diagnostic.patient}</span></div>
                        <div><label>Age/Gender</label><span>${diagnostic.age} yrs / ${diagnostic.gender}</span></div>
                        <div><label>Report ID</label><span>${diagnostic.id}</span></div>
                        <div><label>Test</label><span>${diagnostic.test}</span></div>
                        <div><label>Referred By</label><span>${diagnostic.referredBy}</span></div>
                        <div><label>Report Date</label><span>${new Date().toLocaleDateString('en-IN')}</span></div>
                    </div>
                    <div class="report-box">
                        <h3>Result</h3>
                        <p>${diagnostic.result}</p>
                    </div>
                    <div class="footer">
                        <p>Truvias - Your health, our priority</p>
                        <p>This is a computer-generated report</p>
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
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Scan className="h-6 w-6 text-blue-500" />
                        </div>
                        Diagnostics Department
                    </h1>
                    <p className="text-slate-400">X-Ray • Ultrasound • TMT • CT Scan • MRI</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary">
                        <FileText className="h-4 w-4 mr-2" /> Reports
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" /> New Order
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-5 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm">Today's Orders</p>
                            <p className="text-3xl font-bold">{diagnostics.length}</p>
                        </div>
                        <Scan className="h-10 w-10 text-blue-200" />
                    </div>
                </div>
                <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 border-l-4 border-l-amber-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Pending</p>
                            <p className="text-3xl font-bold text-amber-400">{pendingCount}</p>
                        </div>
                        <Clock className="h-6 w-6 text-amber-500" />
                    </div>
                </div>
                <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 border-l-4 border-l-purple-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">In Progress</p>
                            <p className="text-3xl font-bold text-purple-400">{inProgressCount}</p>
                        </div>
                        <Activity className="h-6 w-6 text-purple-500" />
                    </div>
                </div>
                <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 border-l-4 border-l-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Completed</p>
                            <p className="text-3xl font-bold text-green-400">{completedCount}</p>
                        </div>
                        <CheckCircle className="h-6 w-6 text-green-500" />
                    </div>
                </div>
            </div>

            {/* Equipment Status */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-700">
                    <h2 className="font-semibold text-white">Equipment Status</h2>
                </div>
                <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {equipmentStatus.map((eq) => (
                        <div key={eq.id} className="bg-slate-700/50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-slate-400">{eq.id}</span>
                                <div className={`h-2 w-2 rounded-full ${
                                    eq.status === 'AVAILABLE' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'
                                }`} />
                            </div>
                            <p className="text-sm font-medium text-white truncate">{eq.name}</p>
                            <div className="mt-2">
                                <div className="flex justify-between text-xs text-slate-400 mb-1">
                                    <span>Utilization</span>
                                    <span>{eq.utilization}%</span>
                                </div>
                                <div className="h-1.5 bg-slate-600 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-blue-500 rounded-full" 
                                        style={{ width: `${eq.utilization}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <SearchInput
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search by patient name or ID..."
                    />
                </div>
                <FilterDropdown
                    options={testTypes}
                    value={filterTest}
                    onChange={setFilterTest}
                />
                <FilterDropdown
                    options={[
                        { value: 'ALL', label: 'All Status' },
                        { value: 'PENDING', label: 'Pending' },
                        { value: 'IN_PROGRESS', label: 'In Progress' },
                        { value: 'COMPLETED', label: 'Completed' },
                    ]}
                    value={filterStatus}
                    onChange={setFilterStatus}
                />
            </div>

            {/* Diagnostics Table */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-900/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">ID</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Patient</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Test</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Referred By</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Equipment</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Priority</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {filteredDiagnostics.map((diagnostic) => (
                                <tr key={diagnostic.id} className="hover:bg-slate-700/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <span className="font-semibold text-blue-400">{diagnostic.id}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                                {diagnostic.patient.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{diagnostic.patient}</p>
                                                <p className="text-xs text-slate-400">{diagnostic.age} yrs, {diagnostic.gender}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Image className="h-4 w-4 text-slate-400" />
                                            <span className="text-slate-300">{diagnostic.test}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-300">{diagnostic.referredBy}</td>
                                    <td className="px-4 py-3 text-sm text-slate-400">{diagnostic.equipment}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[diagnostic.priority]}`}>
                                            {diagnostic.priority}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <StatusBadge status={diagnostic.status} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-center gap-2">
                                            {diagnostic.status === 'PENDING' && (
                                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                                    <Scan className="h-3 w-3 mr-1" /> Start
                                                </Button>
                                            )}
                                            {diagnostic.status === 'IN_PROGRESS' && (
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                                    <CheckCircle className="h-3 w-3 mr-1" /> Complete
                                                </Button>
                                            )}
                                            {diagnostic.status === 'COMPLETED' && (
                                                <Button size="sm" variant="secondary" onClick={() => printReport(diagnostic)}>
                                                    <Printer className="h-3 w-3 mr-1" /> Print
                                                </Button>
                                            )}
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
