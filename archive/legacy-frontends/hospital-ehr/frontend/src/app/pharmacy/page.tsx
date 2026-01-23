'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Pill, AlertTriangle, Package, TrendingUp, Plus,
    ShoppingCart, Truck, AlertCircle, Clock, CheckCircle
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SearchInput, FilterDropdown } from '@/components/ui/SearchInput';

const mockInventory = [
    { id: '1', name: 'Paracetamol 500mg', category: 'Analgesic', batch: 'PCM-2024-001', stock: 500, minStock: 100, price: 2.5, mrp: 3.5, expiry: '2026-12-31', supplier: 'Sun Pharma', status: 'OK' },
    { id: '2', name: 'Amoxicillin 250mg', category: 'Antibiotic', batch: 'AMX-2024-012', stock: 15, minStock: 50, price: 15.0, mrp: 22.0, expiry: '2025-06-30', supplier: 'Cipla', status: 'LOW' },
    { id: '3', name: 'Metformin 500mg', category: 'Antidiabetic', batch: 'MET-2024-008', stock: 200, minStock: 80, price: 5.0, mrp: 8.0, expiry: '2026-03-15', supplier: 'Dr Reddys', status: 'OK' },
    { id: '4', name: 'Cetirizine 10mg', category: 'Antihistamine', batch: 'CTZ-2024-003', stock: 8, minStock: 30, price: 3.0, mrp: 5.0, expiry: '2025-09-20', supplier: 'Mankind', status: 'LOW' },
    { id: '5', name: 'Omeprazole 20mg', category: 'PPI', batch: 'OMP-2024-015', stock: 150, minStock: 50, price: 8.0, mrp: 12.0, expiry: '2026-08-10', supplier: 'Lupin', status: 'OK' },
    { id: '6', name: 'Azithromycin 500mg', category: 'Antibiotic', batch: 'AZT-2024-007', stock: 45, minStock: 40, price: 25.0, mrp: 38.0, expiry: '2025-11-25', supplier: 'Cipla', status: 'OK' },
    { id: '7', name: 'Pantoprazole 40mg', category: 'PPI', batch: 'PNT-2024-022', stock: 0, minStock: 50, price: 12.0, mrp: 18.0, expiry: '2026-02-15', supplier: 'Sun Pharma', status: 'OUT' },
    { id: '8', name: 'Atorvastatin 10mg', category: 'Statin', batch: 'ATV-2024-018', stock: 120, minStock: 60, price: 6.0, mrp: 10.0, expiry: '2025-12-31', supplier: 'Torrent', status: 'OK' },
];

const recentSales = [
    { patient: 'Rahul Sharma', items: 3, total: 245, time: '10 min ago' },
    { patient: 'Priya Gupta', items: 5, total: 520, time: '25 min ago' },
    { patient: 'Amit Kumar', items: 2, total: 180, time: '1 hr ago' },
];

const lowStockAlerts = mockInventory.filter(i => i.status === 'LOW' || i.status === 'OUT');

const statusStyles: Record<string, string> = {
    OK: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    LOW: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    OUT: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function PharmacyDashboard() {
    const [inventory] = useState(mockInventory);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('ALL');

    const totalItems = inventory.length;
    const lowStockItems = inventory.filter(i => i.status === 'LOW').length;
    const outOfStock = inventory.filter(i => i.status === 'OUT').length;
    const totalValue = inventory.reduce((sum, i) => sum + (i.stock * i.price), 0);
    const todaySales = 12500;

    const categories = ['ALL', ...new Set(inventory.map(i => i.category))];

    const filteredInventory = inventory.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.batch.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'ALL' || item.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-slate-900 p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Pharmacy & Inventory</h1>
                    <p className="text-slate-400">Stock Management & Dispensing</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary">
                        <Truck className="h-4 w-4 mr-2" /> Purchase Order
                    </Button>
                    <Button className="bg-teal-600 hover:bg-teal-700">
                        <Plus className="h-4 w-4 mr-2" /> Add Stock
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl p-5 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-teal-100 text-sm">Today's Sales</p>
                            <p className="text-3xl font-bold">₹{todaySales.toLocaleString()}</p>
                        </div>
                        <ShoppingCart className="h-8 w-8 text-teal-200" />
                    </div>
                </div>
                <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 border-l-4 border-l-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Total Items</p>
                            <p className="text-3xl font-bold text-white">{totalItems}</p>
                        </div>
                        <div className="p-2 bg-blue-500/20 rounded-full">
                            <Package className="h-5 w-5 text-blue-400" />
                        </div>
                    </div>
                </div>
                <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 border-l-4 border-l-amber-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Low Stock</p>
                            <p className="text-3xl font-bold text-amber-400">{lowStockItems}</p>
                        </div>
                        <div className="p-2 bg-amber-500/20 rounded-full">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                        </div>
                    </div>
                </div>
                <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 border-l-4 border-l-red-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Out of Stock</p>
                            <p className="text-3xl font-bold text-red-400">{outOfStock}</p>
                        </div>
                        <div className="p-2 bg-red-500/20 rounded-full">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-5 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm">Stock Value</p>
                            <p className="text-3xl font-bold">₹{(totalValue / 1000).toFixed(1)}K</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-purple-200" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Inventory */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Search and Filter */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <SearchInput
                                value={searchQuery}
                                onChange={setSearchQuery}
                                placeholder="Search medicine or batch..."
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto">
                            {categories.slice(0, 5).map((cat) => (
                                <Button
                                    key={cat}
                                    variant={filterCategory === cat ? 'default' : 'secondary'}
                                    size="sm"
                                    onClick={() => setFilterCategory(cat)}
                                    className={filterCategory === cat ? 'bg-teal-600 whitespace-nowrap' : 'whitespace-nowrap'}
                                >
                                    {cat === 'ALL' ? 'All' : cat}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Inventory Table */}
                    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-900/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Medicine</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Batch</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Stock</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">MRP</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Expiry</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {filteredInventory.map((item) => (
                                        <tr key={item.id} className={`hover:bg-slate-700/50 transition-colors ${item.status === 'OUT' ? 'bg-red-500/5' : item.status === 'LOW' ? 'bg-amber-500/5' : ''}`}>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${statusStyles[item.status].split(' ')[0]}`}>
                                                        <Pill className={`h-4 w-4 ${statusStyles[item.status].split(' ')[1]}`} />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm text-white">{item.name}</p>
                                                        <p className="text-xs text-slate-400">{item.category}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-400">{item.batch}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`font-bold ${item.stock < item.minStock ? 'text-red-400' : 'text-white'}`}>
                                                    {item.stock}
                                                </span>
                                                <span className="text-xs text-slate-500 block">min: {item.minStock}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium text-white">₹{item.mrp}</td>
                                            <td className="px-4 py-3 text-center text-sm text-slate-400">{item.expiry}</td>
                                            <td className="px-4 py-3 text-center">
                                                <StatusBadge status={item.status} />
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Button size="sm" variant="secondary" disabled={item.stock === 0}>
                                                    Dispense
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Alerts */}
                    <div className="bg-slate-800 rounded-xl border border-slate-700 border-l-4 border-l-red-500 p-6">
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            Stock Alerts
                        </h3>
                        <div className="space-y-3">
                            {lowStockAlerts.map((item) => (
                                <div key={item.id} className={`p-3 rounded-lg ${item.status === 'OUT' ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
                                    <div className="flex items-center justify-between">
                                        <p className="font-medium text-sm text-white">{item.name}</p>
                                        <span className={`text-xs font-bold ${item.status === 'OUT' ? 'text-red-400' : 'text-amber-400'}`}>
                                            {item.status === 'OUT' ? 'OUT OF STOCK' : `Only ${item.stock} left`}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">Min required: {item.minStock}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Sales */}
                    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
                            <ShoppingCart className="h-5 w-5 text-teal-500" />
                            Recent Sales
                        </h3>
                        <div className="space-y-3">
                            {recentSales.map((sale, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-sm text-white">{sale.patient}</p>
                                        <p className="text-xs text-slate-400">{sale.items} items</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-teal-400">₹{sale.total}</p>
                                        <p className="text-xs text-slate-500">{sale.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
