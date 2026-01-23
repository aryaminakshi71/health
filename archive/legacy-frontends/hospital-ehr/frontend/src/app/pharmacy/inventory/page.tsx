'use client';

import React, { useState } from 'react';
import {
    Pill, AlertTriangle, Package, TrendingUp, Plus, Search,
    Calendar, AlertCircle, CheckCircle, RefreshCw, Download, Filter
} from 'lucide-react';

const mockInventory = [
    { id: '1', name: 'Paracetamol 500mg', category: 'Analgesic', batch: 'PCM-2024-001', stock: 500, minStock: 100, price: 2.5, mrp: 3.5, expiry: '2026-12-31', supplier: 'Sun Pharma', status: 'OK' },
    { id: '2', name: 'Amoxicillin 250mg', category: 'Antibiotic', batch: 'AMX-2024-012', stock: 15, minStock: 50, price: 15.0, mrp: 22.0, expiry: '2025-06-30', supplier: 'Cipla', status: 'LOW' },
    { id: '3', name: 'Metformin 500mg', category: 'Antidiabetic', batch: 'MET-2024-008', stock: 200, minStock: 80, price: 5.0, mrp: 8.0, expiry: '2026-03-15', supplier: 'Dr Reddys', status: 'OK' },
    { id: '4', name: 'Cetirizine 10mg', category: 'Antihistamine', batch: 'CTZ-2024-003', stock: 8, minStock: 30, price: 3.0, mrp: 5.0, expiry: '2025-02-20', supplier: 'Mankind', status: 'EXPIRING' },
    { id: '5', name: 'Omeprazole 20mg', category: 'PPI', batch: 'OMP-2024-015', stock: 150, minStock: 50, price: 8.0, mrp: 12.0, expiry: '2026-08-10', supplier: 'Lupin', status: 'OK' },
    { id: '6', name: 'Azithromycin 500mg', category: 'Antibiotic', batch: 'AZT-2024-007', stock: 45, minStock: 40, price: 25.0, mrp: 38.0, expiry: '2025-11-25', supplier: 'Cipla', status: 'OK' },
    { id: '7', name: 'Pantoprazole 40mg', category: 'PPI', batch: 'PNT-2024-022', stock: 0, minStock: 50, price: 12.0, mrp: 18.0, expiry: '2026-02-15', supplier: 'Sun Pharma', status: 'OUT' },
    { id: '8', name: 'Atorvastatin 10mg', category: 'Statin', batch: 'ATV-2024-018', stock: 120, minStock: 60, price: 6.0, mrp: 10.0, expiry: '2025-01-15', supplier: 'Torrent', status: 'EXPIRING' },
    { id: '9', name: 'Losartan 50mg', category: 'Antihypertensive', batch: 'LST-2024-011', stock: 85, minStock: 40, price: 7.5, mrp: 12.0, expiry: '2026-05-20', supplier: 'Zydus', status: 'OK' },
    { id: '10', name: 'Metoprolol 25mg', category: 'Beta Blocker', batch: 'MTP-2024-009', stock: 12, minStock: 50, price: 4.0, mrp: 6.5, expiry: '2026-07-10', supplier: 'Torrent', status: 'LOW' },
];

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
    OK: { bg: 'bg-green-500/20 dark:bg-green-500/20', text: 'text-green-600 dark:text-green-400', label: 'In Stock' },
    LOW: { bg: 'bg-amber-500/20 dark:bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400', label: 'Low Stock' },
    OUT: { bg: 'bg-red-500/20 dark:bg-red-500/20', text: 'text-red-600 dark:text-red-400', label: 'Out of Stock' },
    EXPIRING: { bg: 'bg-orange-500/20 dark:bg-orange-500/20', text: 'text-orange-600 dark:text-orange-400', label: 'Expiring Soon' },
};

export default function PharmacyInventoryPage() {
    const [inventory] = useState(mockInventory);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterCategory, setFilterCategory] = useState('ALL');

    const totalItems = inventory.length;
    const lowStockItems = inventory.filter(i => i.status === 'LOW').length;
    const outOfStock = inventory.filter(i => i.status === 'OUT').length;
    const expiringItems = inventory.filter(i => i.status === 'EXPIRING').length;
    const totalValue = inventory.reduce((sum, i) => sum + (i.stock * i.price), 0);

    const categories = ['ALL', ...new Set(inventory.map(i => i.category))];

    const filteredInventory = inventory.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.batch.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
        const matchesCategory = filterCategory === 'ALL' || item.category === filterCategory;
        return matchesSearch && matchesStatus && matchesCategory;
    });

    const lowStockAlerts = inventory.filter(i => i.status === 'LOW' || i.status === 'OUT');
    const expiryAlerts = inventory.filter(i => i.status === 'EXPIRING');

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">Pharmacy Inventory</h1>
                    <p className="text-slate-600 dark:text-slate-400">Medicine Stock & Expiry Management</p>
                </div>
                <div className="flex gap-3">
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <Download className="h-4 w-4" /> Export
                    </button>
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors">
                        <Plus className="h-4 w-4" /> Add Stock
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="card p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Total Items</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalItems}</p>
                        </div>
                        <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-xl">
                            <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>
                <div className="card p-5 border-l-4 border-l-amber-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Low Stock</p>
                            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{lowStockItems}</p>
                        </div>
                        <div className="p-3 bg-amber-100 dark:bg-amber-500/20 rounded-xl">
                            <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>
                </div>
                <div className="card p-5 border-l-4 border-l-red-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Out of Stock</p>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{outOfStock}</p>
                        </div>
                        <div className="p-3 bg-red-100 dark:bg-red-500/20 rounded-xl">
                            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                    </div>
                </div>
                <div className="card p-5 border-l-4 border-l-orange-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Expiring Soon</p>
                            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{expiringItems}</p>
                        </div>
                        <div className="p-3 bg-orange-100 dark:bg-orange-500/20 rounded-xl">
                            <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                    </div>
                </div>
                <div className="card p-5 bg-gradient-to-br from-teal-500 to-teal-600 border-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-teal-100 text-sm">Stock Value</p>
                            <p className="text-2xl font-bold text-white">${totalValue.toLocaleString()}</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-teal-200" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Main Inventory Table */}
                <div className="xl:col-span-2 space-y-4">
                    {/* Search and Filters */}
                    <div className="card p-4">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search medicine, batch, or supplier..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="OK">In Stock</option>
                                    <option value="LOW">Low Stock</option>
                                    <option value="OUT">Out of Stock</option>
                                    <option value="EXPIRING">Expiring Soon</option>
                                </select>
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat === 'ALL' ? 'All Categories' : cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Inventory Table */}
                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Medicine</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Batch</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Stock</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">MRP</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Expiry</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {filteredInventory.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${statusStyles[item.status].bg}`}>
                                                        <Pill className={`h-4 w-4 ${statusStyles[item.status].text}`} />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">{item.category} | {item.supplier}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{item.batch}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`font-bold ${item.stock < item.minStock ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                                                    {item.stock}
                                                </span>
                                                <span className="text-xs text-slate-400 block">min: {item.minStock}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-white">${item.mrp}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`text-sm ${item.status === 'EXPIRING' ? 'text-orange-600 dark:text-orange-400 font-medium' : 'text-slate-600 dark:text-slate-400'}`}>
                                                    {item.expiry}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[item.status].bg} ${statusStyles[item.status].text}`}>
                                                    {statusStyles[item.status].label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button className="px-3 py-1.5 text-sm bg-teal-50 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-500/30 transition-colors">
                                                    Reorder
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar Alerts */}
                <div className="space-y-6">
                    {/* Low Stock Alerts */}
                    <div className="card p-5 border-l-4 border-l-amber-500">
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white mb-4">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            Low Stock Alerts
                        </h3>
                        <div className="space-y-3">
                            {lowStockAlerts.length === 0 ? (
                                <p className="text-slate-500 dark:text-slate-400 text-sm">No low stock alerts</p>
                            ) : (
                                lowStockAlerts.map((item) => (
                                    <div key={item.id} className={`p-3 rounded-lg ${item.status === 'OUT' ? 'bg-red-50 dark:bg-red-500/10' : 'bg-amber-50 dark:bg-amber-500/10'}`}>
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium text-sm text-slate-900 dark:text-white">{item.name}</p>
                                            <span className={`text-xs font-bold ${item.status === 'OUT' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                                {item.status === 'OUT' ? 'OUT OF STOCK' : `${item.stock} left`}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Min required: {item.minStock}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Expiry Alerts */}
                    <div className="card p-5 border-l-4 border-l-orange-500">
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white mb-4">
                            <Calendar className="h-5 w-5 text-orange-500" />
                            Expiry Tracking
                        </h3>
                        <div className="space-y-3">
                            {expiryAlerts.length === 0 ? (
                                <p className="text-slate-500 dark:text-slate-400 text-sm">No expiring items</p>
                            ) : (
                                expiryAlerts.map((item) => (
                                    <div key={item.id} className="p-3 rounded-lg bg-orange-50 dark:bg-orange-500/10">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium text-sm text-slate-900 dark:text-white">{item.name}</p>
                                            <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                                                {item.expiry}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Batch: {item.batch} | Stock: {item.stock}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="card p-5">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                            <button className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left">
                                <RefreshCw className="h-5 w-5 text-teal-500" />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Generate Reorder List</span>
                            </button>
                            <button className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left">
                                <Download className="h-5 w-5 text-blue-500" />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Export Expiry Report</span>
                            </button>
                            <button className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Stock Audit</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
