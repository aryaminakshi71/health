'use client';

import React, { useState } from 'react';
import { FlaskConical, FileText, Search, Printer, Download, CheckCircle, AlertTriangle, Eye, Calendar, User } from 'lucide-react';

const labReports = [
    {
        id: 'RPT-001',
        labId: 'LT-004',
        patient: 'Sunita Devi',
        patientId: 'P004',
        age: 55,
        gender: 'F',
        tests: ['Urine Routine', 'Urine Culture'],
        orderedBy: 'Dr. Verma',
        reportDate: '2024-12-30',
        status: 'Final',
        results: {
            'Urine Routine': {
                parameters: [
                    { name: 'Color', value: 'Pale Yellow', reference: 'Pale Yellow to Amber', status: 'normal' },
                    { name: 'Appearance', value: 'Clear', reference: 'Clear', status: 'normal' },
                    { name: 'pH', value: '6.5', reference: '5.0 - 8.0', status: 'normal' },
                    { name: 'Specific Gravity', value: '1.015', reference: '1.005 - 1.030', status: 'normal' },
                    { name: 'Protein', value: 'Nil', reference: 'Nil', status: 'normal' },
                    { name: 'Glucose', value: 'Nil', reference: 'Nil', status: 'normal' },
                    { name: 'RBC', value: '0-2 /hpf', reference: '0-5 /hpf', status: 'normal' },
                    { name: 'WBC', value: '2-4 /hpf', reference: '0-5 /hpf', status: 'normal' },
                ],
            },
            'Urine Culture': {
                parameters: [
                    { name: 'Culture Result', value: 'No growth after 48 hours', reference: 'No growth', status: 'normal' },
                ],
            },
        },
    },
    {
        id: 'RPT-002',
        labId: 'LT-007',
        patient: 'Ravi Shankar',
        patientId: 'P007',
        age: 48,
        gender: 'M',
        tests: ['CBC', 'LFT', 'KFT'],
        orderedBy: 'Dr. Patel',
        reportDate: '2024-12-30',
        status: 'Final',
        results: {
            'CBC': {
                parameters: [
                    { name: 'Hemoglobin', value: '12.8 g/dL', reference: '13.5-17.5 g/dL', status: 'low' },
                    { name: 'RBC Count', value: '4.2 million/μL', reference: '4.5-5.5 million/μL', status: 'low' },
                    { name: 'WBC Count', value: '7,500 /μL', reference: '4,000-11,000 /μL', status: 'normal' },
                    { name: 'Platelet Count', value: '250,000 /μL', reference: '150,000-400,000 /μL', status: 'normal' },
                    { name: 'MCV', value: '88 fL', reference: '80-100 fL', status: 'normal' },
                    { name: 'MCH', value: '29 pg', reference: '27-33 pg', status: 'normal' },
                ],
            },
            'LFT': {
                parameters: [
                    { name: 'SGOT (AST)', value: '45 U/L', reference: '10-40 U/L', status: 'high' },
                    { name: 'SGPT (ALT)', value: '68 U/L', reference: '7-56 U/L', status: 'high' },
                    { name: 'Alkaline Phosphatase', value: '95 U/L', reference: '44-147 U/L', status: 'normal' },
                    { name: 'Total Bilirubin', value: '1.0 mg/dL', reference: '0.1-1.2 mg/dL', status: 'normal' },
                    { name: 'Direct Bilirubin', value: '0.3 mg/dL', reference: '0.0-0.3 mg/dL', status: 'normal' },
                    { name: 'Total Protein', value: '7.2 g/dL', reference: '6.0-8.0 g/dL', status: 'normal' },
                    { name: 'Albumin', value: '4.0 g/dL', reference: '3.5-5.0 g/dL', status: 'normal' },
                ],
            },
            'KFT': {
                parameters: [
                    { name: 'Blood Urea', value: '35 mg/dL', reference: '15-40 mg/dL', status: 'normal' },
                    { name: 'Serum Creatinine', value: '1.1 mg/dL', reference: '0.7-1.3 mg/dL', status: 'normal' },
                    { name: 'Uric Acid', value: '6.5 mg/dL', reference: '3.5-7.2 mg/dL', status: 'normal' },
                    { name: 'Sodium', value: '140 mEq/L', reference: '136-145 mEq/L', status: 'normal' },
                    { name: 'Potassium', value: '4.2 mEq/L', reference: '3.5-5.0 mEq/L', status: 'normal' },
                ],
            },
        },
    },
    {
        id: 'RPT-003',
        labId: 'LT-008',
        patient: 'Meena Kumari',
        patientId: 'P008',
        age: 42,
        gender: 'F',
        tests: ['Thyroid Profile'],
        orderedBy: 'Dr. Gupta',
        reportDate: '2024-12-29',
        status: 'Final',
        results: {
            'Thyroid Profile': {
                parameters: [
                    { name: 'T3 (Triiodothyronine)', value: '1.8 ng/mL', reference: '0.8-2.0 ng/mL', status: 'normal' },
                    { name: 'T4 (Thyroxine)', value: '9.5 μg/dL', reference: '5.1-14.1 μg/dL', status: 'normal' },
                    { name: 'TSH', value: '8.5 mIU/L', reference: '0.4-4.0 mIU/L', status: 'high' },
                ],
            },
        },
    },
];

const getStatusColor = (status: string) => {
    switch (status) {
        case 'normal': return 'text-green-600 dark:text-green-400';
        case 'high': return 'text-red-600 dark:text-red-400';
        case 'low': return 'text-amber-600 dark:text-amber-400';
        default: return 'text-slate-600 dark:text-slate-400';
    }
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'normal': return <CheckCircle className="w-4 h-4 text-green-500" />;
        case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />;
        case 'low': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
        default: return null;
    }
};

export default function LabReportsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedReport, setSelectedReport] = useState<typeof labReports[0] | null>(null);
    const [dateFilter, setDateFilter] = useState('');

    const filteredReports = labReports.filter(report => {
        const matchesSearch = report.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             report.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             report.patientId.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDate = !dateFilter || report.reportDate === dateFilter;
        return matchesSearch && matchesDate;
    });

    const handlePrint = (report: typeof labReports[0]) => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Lab Report - ${report.id}</title>
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                        .header { border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 20px; }
                        .header h1 { color: #0f172a; font-size: 24px; }
                        .patient-info { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
                        .patient-info div { font-size: 13px; }
                        .patient-info label { color: #64748b; font-size: 11px; display: block; }
                        .patient-info span { font-weight: 600; color: #0f172a; }
                        .test-section { margin-bottom: 20px; }
                        .test-section h3 { background: #3b82f6; color: white; padding: 10px; font-size: 14px; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
                        th { background: #f1f5f9; font-weight: 600; color: #64748b; }
                        .normal { color: #22c55e; }
                        .high { color: #ef4444; font-weight: bold; }
                        .low { color: #f59e0b; font-weight: bold; }
                        .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #64748b; }
                        @media print { body { padding: 20px; } }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Truvias</h1>
                        <p style="font-size: 12px; color: #64748b;">Laboratory Report</p>
                    </div>
                    <div class="patient-info">
                        <div><label>Patient Name</label><span>${report.patient}</span></div>
                        <div><label>Age/Gender</label><span>${report.age} yrs / ${report.gender}</span></div>
                        <div><label>Patient ID</label><span>${report.patientId}</span></div>
                        <div><label>Report ID</label><span>${report.id}</span></div>
                        <div><label>Referred By</label><span>${report.orderedBy}</span></div>
                        <div><label>Report Date</label><span>${report.reportDate}</span></div>
                    </div>
                    ${Object.entries(report.results).map(([testName, data]) => `
                        <div class="test-section">
                            <h3>${testName}</h3>
                            <table>
                                <thead><tr><th>Parameter</th><th>Result</th><th>Reference Range</th><th>Status</th></tr></thead>
                                <tbody>
                                    ${data.parameters.map(p => `
                                        <tr>
                                            <td>${p.name}</td>
                                            <td class="${p.status}">${p.value}</td>
                                            <td>${p.reference}</td>
                                            <td class="${p.status}">${p.status.toUpperCase()}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    `).join('')}
                    <div class="footer">
                        <p>*** End of Report ***</p>
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-7 h-7 text-green-500" />
                        Lab Reports
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">View and generate lab test reports</p>
                </div>
                <div className="flex gap-2">
                    <a href="/lab" className="btn btn-secondary">
                        <FlaskConical className="w-4 h-4" /> Lab Dashboard
                    </a>
                    <a href="/lab/tests" className="btn btn-secondary">
                        <FlaskConical className="w-4 h-4" /> Lab Tests
                    </a>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="card p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by patient name, report ID, or patient ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input pl-10"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-slate-400" />
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="input w-auto"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Reports List */}
                <div className="lg:col-span-1 space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Reports</h2>
                    {filteredReports.map((report) => (
                        <div
                            key={report.id}
                            onClick={() => setSelectedReport(report)}
                            className={`card p-4 cursor-pointer transition-all ${selectedReport?.id === report.id ? 'ring-2 ring-blue-500' : ''}`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <span className="font-bold text-blue-600 dark:text-blue-400">{report.id}</span>
                                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                                    {report.status}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                <User className="w-4 h-4 text-slate-400" />
                                <span className="font-medium text-slate-900 dark:text-white">{report.patient}</span>
                                <span className="text-sm text-slate-500 dark:text-slate-400">({report.age}y, {report.gender})</span>
                            </div>
                            <div className="flex flex-wrap gap-1 mb-2">
                                {report.tests.map((test, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded">
                                        {test}
                                    </span>
                                ))}
                            </div>
                            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                <span>{report.orderedBy}</span>
                                <span>{report.reportDate}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Report Detail */}
                <div className="lg:col-span-2">
                    {selectedReport ? (
                        <div className="card">
                            <div className="card-header">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Report: {selectedReport.id}</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{selectedReport.patient} | {selectedReport.patientId}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handlePrint(selectedReport)} className="btn btn-secondary text-sm">
                                        <Printer className="w-4 h-4" /> Print
                                    </button>
                                    <button className="btn btn-primary text-sm">
                                        <Download className="w-4 h-4" /> Download PDF
                                    </button>
                                </div>
                            </div>
                            <div className="card-body space-y-6">
                                {/* Patient Info */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Patient Name</p>
                                        <p className="font-medium text-slate-900 dark:text-white">{selectedReport.patient}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Age / Gender</p>
                                        <p className="font-medium text-slate-900 dark:text-white">{selectedReport.age} yrs / {selectedReport.gender}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Referred By</p>
                                        <p className="font-medium text-slate-900 dark:text-white">{selectedReport.orderedBy}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Report Date</p>
                                        <p className="font-medium text-slate-900 dark:text-white">{selectedReport.reportDate}</p>
                                    </div>
                                </div>

                                {/* Test Results */}
                                {Object.entries(selectedReport.results).map(([testName, data]) => (
                                    <div key={testName} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                        <div className="bg-blue-600 text-white px-4 py-2 font-semibold">
                                            {testName}
                                        </div>
                                        <table className="w-full">
                                            <thead className="bg-slate-50 dark:bg-slate-800">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Parameter</th>
                                                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Result</th>
                                                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Reference Range</th>
                                                    <th className="px-4 py-2 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                                {data.parameters.map((param, i) => (
                                                    <tr key={i} className={param.status !== 'normal' ? 'bg-red-50 dark:bg-red-900/10' : ''}>
                                                        <td className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300">{param.name}</td>
                                                        <td className={`px-4 py-2 text-sm font-medium ${getStatusColor(param.status)}`}>{param.value}</td>
                                                        <td className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400">{param.reference}</td>
                                                        <td className="px-4 py-2 text-center">
                                                            <div className="flex items-center justify-center gap-1">
                                                                {getStatusIcon(param.status)}
                                                                <span className={`text-xs font-medium ${getStatusColor(param.status)}`}>
                                                                    {param.status.toUpperCase()}
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ))}

                                {/* Abnormal Values Summary */}
                                {Object.values(selectedReport.results).some(r => r.parameters.some(p => p.status !== 'normal')) && (
                                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                        <div className="flex items-start gap-2">
                                            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-medium text-amber-800 dark:text-amber-300">Abnormal Values Detected</p>
                                                <p className="text-sm text-amber-700 dark:text-amber-400">
                                                    Please consult with the referring physician for interpretation and follow-up.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="card p-12 text-center">
                            <div className="empty-state-icon mx-auto mb-4">
                                <Eye className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Select a Report</h3>
                            <p className="text-slate-500 dark:text-slate-400">Click on a report from the list to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
