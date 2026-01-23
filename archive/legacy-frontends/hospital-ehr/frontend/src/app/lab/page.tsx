'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    FlaskConical, Search, Plus, Printer, CheckCircle, Clock,
    FileText, Download, BarChart3, Droplet
} from 'lucide-react';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge, DotBadge } from '@/components/ui/StatusBadge';
import { SearchInput, FilterDropdown } from '@/components/ui/SearchInput';

// Mock lab orders
const mockLabOrders = [
    {
        id: 'LAB-001',
        patient: 'Rahul Sharma',
        patientId: 'P001',
        age: 32,
        gender: 'M',
        orderedBy: 'Dr. Patel',
        orderedAt: '2024-12-28 09:30',
        tests: ['CBC', 'Blood Sugar (Fasting)', 'Lipid Profile'],
        status: 'PENDING',
        priority: 'ROUTINE',
        sampleCollected: false,
    },
    {
        id: 'LAB-002',
        patient: 'Priya Gupta',
        patientId: 'P002',
        age: 28,
        gender: 'F',
        orderedBy: 'Dr. Mehta',
        orderedAt: '2024-12-28 10:15',
        tests: ['Thyroid Profile', 'HbA1c'],
        status: 'COLLECTED',
        priority: 'URGENT',
        sampleCollected: true,
        collectedAt: '2024-12-28 10:45',
    },
    {
        id: 'LAB-003',
        patient: 'Amit Kumar',
        patientId: 'P003',
        age: 45,
        gender: 'M',
        orderedBy: 'Dr. Singh',
        orderedAt: '2024-12-28 08:00',
        tests: ['LFT', 'KFT', 'Electrolytes'],
        status: 'COMPLETED',
        priority: 'ROUTINE',
        sampleCollected: true,
        collectedAt: '2024-12-28 08:30',
        results: {
            'LFT': { SGOT: '32 U/L', SGPT: '28 U/L', Bilirubin: '0.8 mg/dL', status: 'NORMAL' },
            'KFT': { Creatinine: '1.8 mg/dL', Urea: '45 mg/dL', status: 'ABNORMAL' },
            'Electrolytes': { Sodium: '142 mEq/L', Potassium: '4.2 mEq/L', status: 'NORMAL' },
        }
    },
];

const referenceRanges: Record<string, Record<string, string>> = {
    'CBC': { Hemoglobin: '12-16 g/dL', WBC: '4000-11000 /μL', Platelets: '150000-400000 /μL' },
    'Blood Sugar (Fasting)': { Glucose: '70-100 mg/dL' },
    'Lipid Profile': { Cholesterol: '<200 mg/dL', Triglycerides: '<150 mg/dL', HDL: '>40 mg/dL', LDL: '<100 mg/dL' },
    'LFT': { SGOT: '10-40 U/L', SGPT: '7-56 U/L', Bilirubin: '0.1-1.2 mg/dL' },
    'KFT': { Creatinine: '0.7-1.3 mg/dL', Urea: '7-20 mg/dL' },
};

const priorityColors: Record<string, string> = {
    ROUTINE: 'bg-slate-700 text-slate-300',
    URGENT: 'bg-red-500/20 text-red-400 border border-red-500/30',
    STAT: 'bg-red-600 text-white',
};

export default function LabPage() {
    const [orders] = useState(mockLabOrders);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    const pendingCount = orders.filter(o => o.status === 'PENDING').length;
    const collectedCount = orders.filter(o => o.status === 'COLLECTED').length;
    const completedToday = orders.filter(o => o.status === 'COMPLETED').length;

    const filteredOrders = orders.filter(o => {
        const matchesStatus = filterStatus === 'ALL' || o.status === filterStatus;
        const matchesSearch = o.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             o.id.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const printReport = (order: typeof mockLabOrders[0]) => {
        const printWindow = window.open('', '_blank');
        if (printWindow && order.status === 'COMPLETED') {
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Lab Report - ${order.id}</title>
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
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th { background: #3b82f6; color: white; padding: 12px; text-align: left; font-size: 12px; }
                        td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #0f172a; }
                        .abnormal { color: #ef4444; font-weight: bold; }
                        .normal { color: #22c55e; }
                        .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #64748b; }
                        @media print { body { padding: 20px; } }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Truvias</h1>
                        <p>SCO 42, Old Judicial Complex, Civil Lines, Gurugram, Haryana 122001<br/>Tel: 01244206860 | Email: appointment@truvias.com | Website: truvias.com</p>
                    </div>
                    <div class="patient-info">
                        <div><label>Patient Name</label><span>${order.patient}</span></div>
                        <div><label>Age/Gender</label><span>${order.age} yrs / ${order.gender}</span></div>
                        <div><label>Lab ID</label><span>${order.id}</span></div>
                        <div><label>Referred By</label><span>${order.orderedBy}</span></div>
                        <div><label>Sample Collected</label><span>${order.collectedAt}</span></div>
                        <div><label>Report Date</label><span>${new Date().toLocaleDateString('en-IN')}</span></div>
                    </div>
                    ${Object.entries((order as any).results || {}).map(([testName, values]) => `
                        <h3 style="margin-top: 20px; color: #3b82f6; font-size: 16px;">${testName}</h3>
                        <table>
                            <thead><tr><th>Parameter</th><th>Result</th><th>Reference Range</th></tr></thead>
                            <tbody>
                                ${Object.entries(values as Record<string, string>).filter(([k]) => k !== 'status').map(([param, value]) => `
                                    <tr>
                                        <td>${param}</td>
                                        <td class="${(values as any).status === 'ABNORMAL' ? 'abnormal' : 'normal'}">${value}</td>
                                        <td>${referenceRanges[testName]?.[param] || '-'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    `).join('')}
                    <div class="footer">
                        <p>*** End of Report ***</p>
                        <p>This is a computer-generated report | Truvias - Your health, our priority</p>
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
                        <FlaskConical className="h-8 w-8 text-blue-500" />
                        Laboratory Management
                    </h1>
                    <p className="text-slate-400">Sample Collection • Testing • Results</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary">
                        <BarChart3 className="h-4 w-4 mr-2" /> Reports
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
                            <p className="text-3xl font-bold">{orders.length}</p>
                        </div>
                        <FileText className="h-10 w-10 text-blue-200" />
                    </div>
                </div>
                <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 border-l-4 border-l-amber-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Pending Collection</p>
                            <p className="text-3xl font-bold text-amber-400">{pendingCount}</p>
                        </div>
                        <Clock className="h-6 w-6 text-amber-500" />
                    </div>
                </div>
                <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 border-l-4 border-l-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">In Processing</p>
                            <p className="text-3xl font-bold text-blue-400">{collectedCount}</p>
                        </div>
                        <Droplet className="h-6 w-6 text-blue-500" />
                    </div>
                </div>
                <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 border-l-4 border-l-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Completed</p>
                            <p className="text-3xl font-bold text-green-400">{completedToday}</p>
                        </div>
                        <CheckCircle className="h-6 w-6 text-green-500" />
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <SearchInput
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search by patient name or lab ID..."
                    />
                </div>
                <FilterDropdown
                    options={[
                        { value: 'ALL', label: 'All Status' },
                        { value: 'PENDING', label: 'Pending' },
                        { value: 'COLLECTED', label: 'Collected' },
                        { value: 'COMPLETED', label: 'Completed' },
                    ]}
                    value={filterStatus}
                    onChange={setFilterStatus}
                />
            </div>

            {/* Orders Table */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-900/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Lab ID</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Patient</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Tests</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Ordered By</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Priority</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-slate-700/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <span className="font-semibold text-blue-400">{order.id}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                                {order.patient.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{order.patient}</p>
                                                <p className="text-xs text-slate-400">{order.age} yrs, {order.gender}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {order.tests.map((test) => (
                                                <span key={test} className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded">
                                                    {test}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-300">{order.orderedBy}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[order.priority]}`}>
                                            {order.priority}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <StatusBadge status={order.status} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-center gap-2">
                                            {order.status === 'PENDING' && (
                                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                                    <Droplet className="h-3 w-3 mr-1" /> Collect
                                                </Button>
                                            )}
                                            {order.status === 'COLLECTED' && (
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                                    <CheckCircle className="h-3 w-3 mr-1" /> Enter Results
                                                </Button>
                                            )}
                                            {order.status === 'COMPLETED' && (
                                                <Button size="sm" variant="secondary" onClick={() => printReport(order)}>
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
