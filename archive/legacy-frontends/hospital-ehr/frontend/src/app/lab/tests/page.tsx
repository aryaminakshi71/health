'use client';

import React, { useState } from 'react';
import { FlaskConical, TestTube, Search, Plus, Clock, CheckCircle, AlertCircle, User, Droplet, Filter } from 'lucide-react';

const labTests = [
    { id: 'LT-001', patient: 'Rahul Sharma', patientId: 'P001', age: 32, gender: 'M', tests: ['CBC', 'Blood Sugar (Fasting)', 'Lipid Profile'], orderedBy: 'Dr. Patel', orderedAt: '2024-12-30 09:30', status: 'Pending Collection', priority: 'Routine', sampleType: 'Blood' },
    { id: 'LT-002', patient: 'Priya Gupta', patientId: 'P002', age: 28, gender: 'F', tests: ['Thyroid Profile', 'HbA1c'], orderedBy: 'Dr. Mehta', orderedAt: '2024-12-30 10:15', status: 'Sample Collected', priority: 'Urgent', sampleType: 'Blood', collectedAt: '2024-12-30 10:45' },
    { id: 'LT-003', patient: 'Amit Kumar', patientId: 'P003', age: 45, gender: 'M', tests: ['LFT', 'KFT', 'Electrolytes'], orderedBy: 'Dr. Singh', orderedAt: '2024-12-30 08:00', status: 'Processing', priority: 'Routine', sampleType: 'Blood', collectedAt: '2024-12-30 08:30' },
    { id: 'LT-004', patient: 'Sunita Devi', patientId: 'P004', age: 55, gender: 'F', tests: ['Urine Routine', 'Urine Culture'], orderedBy: 'Dr. Verma', orderedAt: '2024-12-30 07:45', status: 'Completed', priority: 'Routine', sampleType: 'Urine', collectedAt: '2024-12-30 08:00', completedAt: '2024-12-30 11:30' },
    { id: 'LT-005', patient: 'Mohammad Ali', patientId: 'P005', age: 60, gender: 'M', tests: ['Cardiac Markers', 'D-Dimer'], orderedBy: 'Dr. Reddy', orderedAt: '2024-12-30 06:30', status: 'Processing', priority: 'Stat', sampleType: 'Blood', collectedAt: '2024-12-30 06:35' },
    { id: 'LT-006', patient: 'Anjali Kumari', patientId: 'P006', age: 35, gender: 'F', tests: ['Vitamin D', 'Vitamin B12', 'Iron Profile'], orderedBy: 'Dr. Gupta', orderedAt: '2024-12-30 11:00', status: 'Pending Collection', priority: 'Routine', sampleType: 'Blood' },
];

const testCategories = [
    { name: 'Hematology', tests: ['CBC', 'ESR', 'Peripheral Smear', 'Coagulation Profile'] },
    { name: 'Biochemistry', tests: ['LFT', 'KFT', 'Lipid Profile', 'Blood Sugar', 'HbA1c', 'Electrolytes'] },
    { name: 'Thyroid', tests: ['T3', 'T4', 'TSH', 'Thyroid Profile'] },
    { name: 'Cardiac', tests: ['Troponin I', 'CK-MB', 'BNP', 'Cardiac Markers'] },
    { name: 'Urine', tests: ['Urine Routine', 'Urine Culture', '24hr Urine Protein'] },
    { name: 'Vitamins', tests: ['Vitamin D', 'Vitamin B12', 'Folic Acid'] },
];

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Pending Collection': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
        case 'Sample Collected': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        case 'Processing': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
        case 'Completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    }
};

const getPriorityColor = (priority: string) => {
    switch (priority) {
        case 'Stat': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        case 'Urgent': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
        default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    }
};

export default function LabTestsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [showOrderModal, setShowOrderModal] = useState(false);

    const stats = {
        total: labTests.length,
        pendingCollection: labTests.filter(t => t.status === 'Pending Collection').length,
        processing: labTests.filter(t => t.status === 'Processing' || t.status === 'Sample Collected').length,
        completed: labTests.filter(t => t.status === 'Completed').length,
    };

    const filteredTests = labTests.filter(test => {
        const matchesSearch = test.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             test.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             test.tests.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = filterStatus === 'All' || test.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <TestTube className="w-7 h-7 text-blue-500" />
                        Lab Tests
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Order tests and track sample collection</p>
                </div>
                <div className="flex gap-2">
                    <a href="/lab" className="btn btn-secondary">
                        <FlaskConical className="w-4 h-4" /> Lab Dashboard
                    </a>
                    <button onClick={() => setShowOrderModal(true)} className="btn btn-primary">
                        <Plus className="w-4 h-4" /> Order New Test
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <TestTube className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Total Orders</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                            <Clock className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-amber-600">{stats.pendingCollection}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Pending Collection</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Droplet className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-purple-600">{stats.processing}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Processing</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Completed</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="card p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by patient name, test ID, or test name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input pl-10"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="input w-auto"
                        >
                            <option value="All">All Status</option>
                            <option value="Pending Collection">Pending Collection</option>
                            <option value="Sample Collected">Sample Collected</option>
                            <option value="Processing">Processing</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Test Orders Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Order ID</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Patient</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Tests</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Sample</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Ordered By</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Priority</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {filteredTests.map((test) => (
                                <tr key={test.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${test.priority === 'Stat' ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                                    <td className="px-4 py-3">
                                        <span className="font-bold text-blue-600 dark:text-blue-400">{test.id}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                                                {test.patient.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">{test.patient}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{test.age}y, {test.gender} | {test.patientId}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                                            {test.tests.map((t, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
                                            <Droplet className="w-4 h-4" />
                                            {test.sampleType}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-sm text-slate-700 dark:text-slate-300">{test.orderedBy}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{test.orderedAt}</p>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(test.priority)}`}>
                                            {test.priority}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(test.status)}`}>
                                            {test.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-center gap-2">
                                            {test.status === 'Pending Collection' && (
                                                <button className="btn btn-primary text-xs py-1 px-3">
                                                    <Droplet className="w-3 h-3" /> Collect
                                                </button>
                                            )}
                                            {test.status === 'Sample Collected' && (
                                                <button className="btn btn-secondary text-xs py-1 px-3">
                                                    Start Processing
                                                </button>
                                            )}
                                            {test.status === 'Processing' && (
                                                <button className="btn btn-secondary text-xs py-1 px-3">
                                                    Enter Results
                                                </button>
                                            )}
                                            {test.status === 'Completed' && (
                                                <a href="/lab/reports" className="btn btn-secondary text-xs py-1 px-3">
                                                    View Report
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Test Categories Quick Reference */}
            <div className="card">
                <div className="card-header">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Available Test Categories</h2>
                </div>
                <div className="card-body">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {testCategories.map((category) => (
                            <div key={category.name} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{category.name}</h3>
                                <div className="flex flex-wrap gap-1">
                                    {category.tests.map((test, i) => (
                                        <span key={i} className="px-2 py-1 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded border border-slate-200 dark:border-slate-600">
                                            {test}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Order Modal */}
            {showOrderModal && (
                <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
                    <div className="modal max-w-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Order New Lab Test</h2>
                            <button onClick={() => setShowOrderModal(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                                <AlertCircle className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="modal-body space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Patient ID</label>
                                    <input type="text" className="input" placeholder="Enter Patient ID" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                                    <select className="input">
                                        <option>Routine</option>
                                        <option>Urgent</option>
                                        <option>Stat</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Tests</label>
                                <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-2">
                                    {testCategories.map((category) => (
                                        <div key={category.name}>
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">{category.name}</p>
                                            <div className="flex flex-wrap gap-2 ml-2">
                                                {category.tests.map((test, i) => (
                                                    <label key={i} className="flex items-center gap-1 cursor-pointer">
                                                        <input type="checkbox" className="w-4 h-4 rounded text-blue-600" />
                                                        <span className="text-sm text-slate-600 dark:text-slate-400">{test}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Clinical Notes</label>
                                <textarea className="input min-h-[80px]" placeholder="Any relevant clinical information..." />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => setShowOrderModal(false)} className="btn btn-secondary">Cancel</button>
                            <button className="btn btn-primary">
                                <Plus className="w-4 h-4" /> Place Order
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
