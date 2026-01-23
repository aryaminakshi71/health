'use client';

import React, { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Users, DollarSign, BedDouble, Calendar, Download, Filter } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const revenueData = [
    { month: 'Jan', revenue: 4500000, patients: 2100, expenses: 3200000 },
    { month: 'Feb', revenue: 4800000, patients: 2250, expenses: 3350000 },
    { month: 'Mar', revenue: 5200000, patients: 2400, expenses: 3500000 },
    { month: 'Apr', revenue: 4900000, patients: 2300, expenses: 3400000 },
    { month: 'May', revenue: 5500000, patients: 2600, expenses: 3600000 },
    { month: 'Jun', revenue: 5800000, patients: 2750, expenses: 3700000 },
];

const departmentRevenue = [
    { name: 'Cardiology', value: 2500000, color: '#ef4444' },
    { name: 'Orthopedics', value: 1800000, color: '#3b82f6' },
    { name: 'Neurology', value: 1500000, color: '#8b5cf6' },
    { name: 'Gynecology', value: 1200000, color: '#ec4899' },
    { name: 'Pediatrics', value: 900000, color: '#10b981' },
    { name: 'Others', value: 1900000, color: '#6b7280' },
];

const patientTrends = [
    { day: 'Mon', opd: 120, ipd: 45, emergency: 12 },
    { day: 'Tue', opd: 135, ipd: 48, emergency: 15 },
    { day: 'Wed', opd: 128, ipd: 52, emergency: 10 },
    { day: 'Thu', opd: 142, ipd: 50, emergency: 18 },
    { day: 'Fri', opd: 138, ipd: 55, emergency: 14 },
    { day: 'Sat', opd: 95, ipd: 42, emergency: 20 },
    { day: 'Sun', opd: 65, ipd: 38, emergency: 25 },
];

const stats = [
    { title: 'Total Revenue', value: '₹58.5L', change: '+12.5%', trend: 'up', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Total Patients', value: '2,750', change: '+8.2%', trend: 'up', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Bed Occupancy', value: '78%', change: '+5.1%', trend: 'up', icon: BedDouble, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Appointments', value: '1,245', change: '-2.3%', trend: 'down', icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
];

export default function AnalyticsPage() {
    const [period, setPeriod] = useState('month');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics Dashboard</h1>
                    <p className="text-slate-500 dark:text-slate-400">Comprehensive hospital performance metrics</p>
                </div>
                <div className="flex gap-3">
                    <select 
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                    >
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="quarter">This Quarter</option>
                        <option value="year">This Year</option>
                    </select>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <Download className="w-4 h-4" />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <div key={stat.title} className="card p-5">
                        <div className="flex items-center justify-between">
                            <div className={`p-3 rounded-lg ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <span className={`flex items-center gap-1 text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                {stat.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                {stat.change}
                            </span>
                        </div>
                        <div className="mt-4">
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{stat.title}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="card p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Revenue vs Expenses</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="month" stroke="#64748b" />
                            <YAxis stroke="#64748b" tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} />
                            <Tooltip formatter={(value: number) => [`₹${(value/100000).toFixed(1)}L`, '']} />
                            <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} name="Revenue" />
                            <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} name="Expenses" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Department Revenue */}
                <div className="card p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Revenue by Department</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={departmentRevenue}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {departmentRevenue.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => [`₹${(value/100000).toFixed(1)}L`, '']} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Patient Trends */}
            <div className="card p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Patient Trends (Weekly)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={patientTrends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="day" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip />
                        <Bar dataKey="opd" fill="#3b82f6" name="OPD" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="ipd" fill="#8b5cf6" name="IPD" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="emergency" fill="#ef4444" name="Emergency" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
