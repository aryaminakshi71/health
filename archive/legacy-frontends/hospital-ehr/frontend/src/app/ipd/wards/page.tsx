'use client';

import React, { useState } from 'react';
import {
    Building2, BedDouble, Users, Plus, Search, Edit2, Trash2,
    AlertTriangle, TrendingUp, TrendingDown, Activity, CheckCircle,
    X, Settings, Eye, BarChart3
} from 'lucide-react';

// Mock ward data
const mockWards = [
    {
        id: 'W001',
        name: 'General Ward',
        floor: 'Floor 1',
        totalBeds: 20,
        occupiedBeds: 12,
        availableBeds: 6,
        maintenanceBeds: 2,
        nurseStation: 'NS-01',
        inCharge: 'Sr. Nurse Priya Sharma',
        doctor: 'Dr. Amit Patel',
        type: 'General',
        dailyRate: 1500,
        status: 'Active',
        occupancyTrend: 'up',
        criticalPatients: 0,
    },
    {
        id: 'W002',
        name: 'ICU',
        floor: 'Floor 2',
        totalBeds: 10,
        occupiedBeds: 8,
        availableBeds: 1,
        maintenanceBeds: 1,
        nurseStation: 'NS-02',
        inCharge: 'Sr. Nurse Meera Gupta',
        doctor: 'Dr. Rajesh Singh',
        type: 'Critical Care',
        dailyRate: 8000,
        status: 'Active',
        occupancyTrend: 'up',
        criticalPatients: 5,
    },
    {
        id: 'W003',
        name: 'Private Ward',
        floor: 'Floor 3',
        totalBeds: 8,
        occupiedBeds: 3,
        availableBeds: 5,
        maintenanceBeds: 0,
        nurseStation: 'NS-03',
        inCharge: 'Sr. Nurse Anita Verma',
        doctor: 'Dr. Vikram Reddy',
        type: 'Private',
        dailyRate: 5000,
        status: 'Active',
        occupancyTrend: 'down',
        criticalPatients: 0,
    },
    {
        id: 'W004',
        name: 'Maternity Ward',
        floor: 'Floor 4',
        totalBeds: 12,
        occupiedBeds: 5,
        availableBeds: 6,
        maintenanceBeds: 1,
        nurseStation: 'NS-04',
        inCharge: 'Sr. Nurse Kavita Singh',
        doctor: 'Dr. Priya Mehta',
        type: 'Maternity',
        dailyRate: 3000,
        status: 'Active',
        occupancyTrend: 'stable',
        criticalPatients: 0,
    },
    {
        id: 'W005',
        name: 'Pediatric Ward',
        floor: 'Floor 5',
        totalBeds: 15,
        occupiedBeds: 6,
        availableBeds: 8,
        maintenanceBeds: 1,
        nurseStation: 'NS-05',
        inCharge: 'Sr. Nurse Rekha Joshi',
        doctor: 'Dr. Sanjay Sharma',
        type: 'Pediatric',
        dailyRate: 2000,
        status: 'Active',
        occupancyTrend: 'up',
        criticalPatients: 1,
    },
    {
        id: 'W006',
        name: 'Orthopedic Ward',
        floor: 'Floor 6',
        totalBeds: 10,
        occupiedBeds: 4,
        availableBeds: 5,
        maintenanceBeds: 1,
        nurseStation: 'NS-06',
        inCharge: 'Sr. Nurse Sunita Rao',
        doctor: 'Dr. Rakesh Kumar',
        type: 'Orthopedic',
        dailyRate: 2500,
        status: 'Active',
        occupancyTrend: 'stable',
        criticalPatients: 0,
    },
];

const getOccupancyColor = (rate: number) => {
    if (rate >= 90) return 'text-red-600 bg-red-100 dark:bg-red-900/30';
    if (rate >= 70) return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30';
    return 'text-green-600 bg-green-100 dark:bg-green-900/30';
};

const getOccupancyBarColor = (rate: number) => {
    if (rate >= 90) return 'bg-red-500';
    if (rate >= 70) return 'bg-amber-500';
    return 'bg-green-500';
};

export default function WardManagementPage() {
    const [wards] = useState(mockWards);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedWard, setSelectedWard] = useState<typeof mockWards[0] | null>(null);

    const filteredWards = wards.filter(ward =>
        ward.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ward.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calculate overall stats
    const totalStats = wards.reduce((acc, ward) => ({
        totalBeds: acc.totalBeds + ward.totalBeds,
        occupiedBeds: acc.occupiedBeds + ward.occupiedBeds,
        availableBeds: acc.availableBeds + ward.availableBeds,
        criticalPatients: acc.criticalPatients + ward.criticalPatients,
    }), { totalBeds: 0, occupiedBeds: 0, availableBeds: 0, criticalPatients: 0 });

    const overallOccupancy = Math.round((totalStats.occupiedBeds / totalStats.totalBeds) * 100);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Building2 className="w-7 h-7 text-indigo-600" />
                        Ward Management
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage hospital wards, capacity, and occupancy</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add New Ward
                </button>
            </div>

            {/* Overall Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-indigo-100 text-sm">Total Wards</p>
                            <p className="text-3xl font-bold">{wards.length}</p>
                        </div>
                        <Building2 className="w-8 h-8 text-indigo-200" />
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <BedDouble className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalStats.totalBeds}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Total Beds</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-600">{totalStats.availableBeds}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Available Beds</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getOccupancyColor(overallOccupancy)}`}>
                            <Activity className="w-5 h-5" />
                        </div>
                        <div>
                            <p className={`text-2xl font-bold ${overallOccupancy >= 90 ? 'text-red-600' : overallOccupancy >= 70 ? 'text-amber-600' : 'text-green-600'}`}>
                                {overallOccupancy}%
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Overall Occupancy</p>
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
                        placeholder="Search wards by name or type..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input pl-10"
                    />
                </div>
            </div>

            {/* Ward Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredWards.map((ward) => {
                    const occupancyRate = Math.round((ward.occupiedBeds / ward.totalBeds) * 100);
                    return (
                        <div key={ward.id} className="card overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="card-header bg-slate-50 dark:bg-slate-800/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                        <Building2 className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 dark:text-white">{ward.name}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{ward.floor}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    {ward.criticalPatients > 0 && (
                                        <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                                            <AlertTriangle className="w-3 h-3" />
                                            {ward.criticalPatients}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="card-body space-y-4">
                                {/* Bed Stats */}
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                        <p className="text-lg font-bold text-slate-900 dark:text-white">{ward.totalBeds}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
                                    </div>
                                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                        <p className="text-lg font-bold text-green-600">{ward.availableBeds}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Available</p>
                                    </div>
                                    <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                        <p className="text-lg font-bold text-red-600">{ward.occupiedBeds}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Occupied</p>
                                    </div>
                                </div>

                                {/* Occupancy Bar */}
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm text-slate-600 dark:text-slate-400">Occupancy</span>
                                        <div className="flex items-center gap-1">
                                            <span className={`text-sm font-medium ${occupancyRate >= 90 ? 'text-red-600' : occupancyRate >= 70 ? 'text-amber-600' : 'text-green-600'}`}>
                                                {occupancyRate}%
                                            </span>
                                            {ward.occupancyTrend === 'up' && <TrendingUp className="w-4 h-4 text-red-500" />}
                                            {ward.occupancyTrend === 'down' && <TrendingDown className="w-4 h-4 text-green-500" />}
                                        </div>
                                    </div>
                                    <div className="progress-bar">
                                        <div
                                            className={`progress-fill ${getOccupancyBarColor(occupancyRate)}`}
                                            style={{ width: `${occupancyRate}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Ward Details */}
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 dark:text-slate-400">Type</span>
                                        <span className="font-medium text-slate-900 dark:text-white">{ward.type}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 dark:text-slate-400">In-Charge</span>
                                        <span className="font-medium text-slate-900 dark:text-white truncate ml-2">{ward.inCharge}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 dark:text-slate-400">Daily Rate</span>
                                        <span className="font-medium text-slate-900 dark:text-white">Rs. {ward.dailyRate.toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                    <button
                                        onClick={() => setSelectedWard(ward)}
                                        className="btn btn-outline flex-1 text-sm py-2"
                                    >
                                        <Eye className="w-4 h-4 mr-1" />
                                        View
                                    </button>
                                    <button className="btn btn-outline text-sm py-2 px-3">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button className="btn btn-outline text-sm py-2 px-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                                        <Settings className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Ward Details Modal */}
            {selectedWard && (
                <div className="modal-overlay" onClick={() => setSelectedWard(null)}>
                    <div className="modal max-w-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-indigo-600" />
                                {selectedWard.name} Details
                            </h2>
                            <button onClick={() => setSelectedWard(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <div className="modal-body space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Ward ID</p>
                                    <p className="font-medium text-slate-900 dark:text-white">{selectedWard.id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Floor</p>
                                    <p className="font-medium text-slate-900 dark:text-white">{selectedWard.floor}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Ward Type</p>
                                    <p className="font-medium text-slate-900 dark:text-white">{selectedWard.type}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
                                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                                        {selectedWard.status}
                                    </span>
                                </div>
                            </div>

                            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                                <h3 className="font-medium text-slate-700 dark:text-slate-300 mb-3">Bed Statistics</h3>
                                <div className="grid grid-cols-4 gap-2 text-center">
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                        <p className="text-xl font-bold text-slate-900 dark:text-white">{selectedWard.totalBeds}</p>
                                        <p className="text-xs text-slate-500">Total</p>
                                    </div>
                                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                        <p className="text-xl font-bold text-green-600">{selectedWard.availableBeds}</p>
                                        <p className="text-xs text-slate-500">Available</p>
                                    </div>
                                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                        <p className="text-xl font-bold text-red-600">{selectedWard.occupiedBeds}</p>
                                        <p className="text-xs text-slate-500">Occupied</p>
                                    </div>
                                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                        <p className="text-xl font-bold text-amber-600">{selectedWard.maintenanceBeds}</p>
                                        <p className="text-xs text-slate-500">Maintenance</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                                <h3 className="font-medium text-slate-700 dark:text-slate-300 mb-3">Staff Information</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500 dark:text-slate-400">In-Charge Nurse</span>
                                        <span className="font-medium text-slate-900 dark:text-white">{selectedWard.inCharge}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500 dark:text-slate-400">Head Doctor</span>
                                        <span className="font-medium text-slate-900 dark:text-white">{selectedWard.doctor}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500 dark:text-slate-400">Nurse Station</span>
                                        <span className="font-medium text-slate-900 dark:text-white">{selectedWard.nurseStation}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500 dark:text-slate-400">Daily Rate</span>
                                    <span className="text-xl font-bold text-slate-900 dark:text-white">Rs. {selectedWard.dailyRate.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary flex items-center gap-2">
                                <BarChart3 className="w-4 h-4" />
                                View Analytics
                            </button>
                            <button className="btn btn-primary flex items-center gap-2">
                                <Edit2 className="w-4 h-4" />
                                Edit Ward
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Ward Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal max-w-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <Plus className="w-5 h-5 text-indigo-600" />
                                Add New Ward
                            </h2>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <div className="modal-body space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ward Name *</label>
                                <input type="text" placeholder="Enter ward name" className="input" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Floor *</label>
                                    <input type="text" placeholder="e.g., Floor 1" className="input" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ward Type *</label>
                                    <select className="input">
                                        <option value="">Select Type</option>
                                        <option value="General">General</option>
                                        <option value="Critical Care">Critical Care</option>
                                        <option value="Private">Private</option>
                                        <option value="Maternity">Maternity</option>
                                        <option value="Pediatric">Pediatric</option>
                                        <option value="Orthopedic">Orthopedic</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Total Beds *</label>
                                    <input type="number" placeholder="Enter number of beds" className="input" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Daily Rate (Rs.) *</label>
                                    <input type="number" placeholder="Enter daily rate" className="input" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">In-Charge Nurse</label>
                                <input type="text" placeholder="Enter nurse name" className="input" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Head Doctor</label>
                                <input type="text" placeholder="Enter doctor name" className="input" />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => setShowAddModal(false)} className="btn btn-secondary">Cancel</button>
                            <button className="btn btn-primary flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Create Ward
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
