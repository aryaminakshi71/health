'use client';

import React from 'react';
import Link from 'next/link';
import {
    Users, BedDouble, DollarSign, Activity, TrendingUp, Calendar,
    Clock, ArrowUpRight, ArrowDownRight, AlertCircle, Stethoscope, Pill,
    FlaskConical, Heart, FileText, ChevronRight, UserPlus, Siren,
    HeartPulse, Baby, Scissors, Eye, Brain, Bone, Building2,
    CheckCircle, XCircle, Timer, Phone, Truck
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

// ============ DASHBOARD DATA ============
const stats = [
    { title: 'Total Patients Today', value: '248', change: '+12%', trend: 'up', icon: Users, color: 'blue', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
    { title: 'Bed Occupancy', value: '78%', change: '+5%', trend: 'up', icon: BedDouble, color: 'emerald', bgColor: 'bg-emerald-50', textColor: 'text-emerald-600' },
    { title: 'Today\'s Revenue', value: '₹2.45L', change: '+18%', trend: 'up', icon: DollarSign, color: 'amber', bgColor: 'bg-amber-50', textColor: 'text-amber-600' },
    { title: 'OPD Queue', value: '24', change: '-8%', trend: 'down', icon: Clock, color: 'purple', bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
];

const emergencyStats = [
    { label: 'Emergency Cases', value: '3', color: 'bg-red-500', icon: Siren },
    { label: 'ICU Patients', value: '8', color: 'bg-orange-500', icon: HeartPulse },
    { label: 'NICU Patients', value: '4', color: 'bg-pink-500', icon: Baby },
    { label: 'Surgeries Today', value: '6', color: 'bg-purple-500', icon: Scissors },
];

const revenueData = [
    { name: 'Mon', opd: 45000, ipd: 125000, pharmacy: 28000, lab: 35000 },
    { name: 'Tue', opd: 52000, ipd: 138000, pharmacy: 32000, lab: 42000 },
    { name: 'Wed', opd: 48000, ipd: 142000, pharmacy: 29000, lab: 38000 },
    { name: 'Thu', opd: 61000, ipd: 156000, pharmacy: 35000, lab: 48000 },
    { name: 'Fri', opd: 55000, ipd: 148000, pharmacy: 31000, lab: 44000 },
    { name: 'Sat', opd: 38000, ipd: 98000, pharmacy: 24000, lab: 32000 },
    { name: 'Sun', opd: 25000, ipd: 72000, pharmacy: 18000, lab: 22000 },
];

const departmentData = [
    { name: 'Emergency', patients: 45, color: '#ef4444' },
    { name: 'OPD', patients: 128, color: '#3b82f6' },
    { name: 'IPD', patients: 67, color: '#8b5cf6' },
    { name: 'ICU/CCU', patients: 18, color: '#f97316' },
    { name: 'Surgery', patients: 12, color: '#06b6d4' },
];

const bedData = [
    { name: 'Occupied', value: 68, color: '#ef4444' },
    { name: 'Available', value: 22, color: '#10b981' },
    { name: 'Maintenance', value: 6, color: '#f59e0b' },
    { name: 'Reserved', value: 4, color: '#3b82f6' },
];

const recentPatients = [
    { id: 'P-2024-001', name: 'Rahul Sharma', age: 45, gender: 'M', dept: 'Cardiology', status: 'Admitted', time: '5 min ago', type: 'ipd' },
    { id: 'P-2024-002', name: 'Priya Gupta', age: 32, gender: 'F', dept: 'Gynecology', status: 'OPD', time: '12 min ago', type: 'opd' },
    { id: 'P-2024-003', name: 'Amit Kumar', age: 28, gender: 'M', dept: 'Orthopedics', status: 'Emergency', time: '18 min ago', type: 'emergency' },
    { id: 'P-2024-004', name: 'Sneha Patel', age: 55, gender: 'F', dept: 'Neurology', status: 'Discharged', time: '32 min ago', type: 'discharged' },
    { id: 'P-2024-005', name: 'Vikram Singh', age: 40, gender: 'M', dept: 'General', status: 'Lab', time: '45 min ago', type: 'lab' },
];

const appointments = [
    { time: '09:00 AM', patient: 'Rajesh Kumar', doctor: 'Dr. Sharma', dept: 'Cardiology', status: 'Completed' },
    { time: '09:30 AM', patient: 'Meera Devi', doctor: 'Dr. Gupta', dept: 'Gynecology', status: 'Completed' },
    { time: '10:00 AM', patient: 'Suresh Yadav', doctor: 'Dr. Singh', dept: 'Orthopedics', status: 'In Progress' },
    { time: '10:30 AM', patient: 'Anita Sharma', doctor: 'Dr. Patel', dept: 'ENT', status: 'Waiting' },
    { time: '11:00 AM', patient: 'Mohan Lal', doctor: 'Dr. Verma', dept: 'Neurology', status: 'Scheduled' },
];

const quickActions = [
    { label: 'Register Patient', href: '/patients/register', icon: UserPlus, color: 'bg-blue-500' },
    { label: 'OPD Queue', href: '/opd/queue', icon: Users, color: 'bg-emerald-500' },
    { label: 'New Admission', href: '/ipd/admissions', icon: BedDouble, color: 'bg-purple-500' },
    { label: 'Book Appointment', href: '/appointments/new', icon: Calendar, color: 'bg-cyan-500' },
    { label: 'Lab Order', href: '/lab/tests', icon: FlaskConical, color: 'bg-amber-500' },
    { label: 'Pharmacy', href: '/pharmacy', icon: Pill, color: 'bg-rose-500' },
    { label: 'Billing', href: '/billing', icon: DollarSign, color: 'bg-green-500' },
    { label: 'Emergency', href: '/emergency', icon: Siren, color: 'bg-red-500' },
];

const alerts = [
    { type: 'critical', title: '3 Emergency Cases', message: 'Require immediate attention in ER', time: '2 min ago' },
    { type: 'warning', title: 'ICU Bed Alert', message: 'Only 2 ICU beds available', time: '15 min ago' },
    { type: 'info', title: 'Lab Reports Ready', message: '12 reports pending collection', time: '32 min ago' },
    { type: 'success', title: 'Surgery Completed', message: 'Patient P-2024-089 surgery successful', time: '45 min ago' },
];

export default function Dashboard() {
    const currentHour = new Date().getHours();
    const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 17 ? 'Good Afternoon' : 'Good Evening';

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* ========== HEADER ========== */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{greeting}, Dr. Admin</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 flex items-center gap-2 flex-wrap">
                        <Calendar className="w-4 h-4" />
                        {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        <span className="text-slate-300 dark:text-slate-600">|</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            Hospital Online
                        </span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/reports/daily" className="btn btn-outline text-sm">
                        <FileText className="w-4 h-4" />
                        <span className="hidden sm:inline">Daily Report</span>
                    </Link>
                    <Link href="/patients/register" className="btn btn-primary text-sm">
                        <UserPlus className="w-4 h-4" />
                        <span className="hidden sm:inline">New Patient</span>
                    </Link>
                </div>
            </div>

            {/* ========== EMERGENCY BANNER ========== */}
            <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-4 text-white shadow-lg">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <Siren className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Emergency Department Status</h3>
                            <p className="text-white/80 text-sm">3 active cases requiring attention | 2 ICU beds available</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {emergencyStats.map((stat, i) => (
                            <div key={i} className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
                                <p className="text-2xl font-bold">{stat.value}</p>
                                <p className="text-[11px] text-white/80">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ========== STATS GRID ========== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`stat-icon ${stat.bgColor}`}>
                                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                            </div>
                            <span className={`stat-change ${stat.trend === 'up' ? 'up' : 'down'}`}>
                                {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {stat.change}
                            </span>
                        </div>
                        <p className="stat-value">{stat.value}</p>
                        <p className="stat-label">{stat.title}</p>
                    </div>
                ))}
            </div>

            {/* ========== QUICK ACTIONS ========== */}
            <div className="card">
                <div className="card-header">
                    <h2 className="font-semibold text-slate-800 dark:text-white">Quick Actions</h2>
                    <Link href="/shortcuts" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">Customize</Link>
                </div>
                <div className="card-body">
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                        {quickActions.map((action, index) => (
                            <Link
                                key={index}
                                href={action.href}
                                className="quick-action group"
                            >
                                <div className={`quick-action-icon ${action.color} text-white group-hover:scale-110 transition-transform`}>
                                    <action.icon className="w-5 h-5" />
                                </div>
                                <span className="quick-action-label">{action.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* ========== ALERTS ========== */}
            <div className="space-y-2">
                {alerts.map((alert, index) => (
                    <div
                        key={index}
                        className={`alert ${
                            alert.type === 'critical' ? 'alert-danger' :
                            alert.type === 'warning' ? 'alert-warning' :
                            alert.type === 'success' ? 'alert-success' : 'alert-info'
                        }`}
                    >
                        {alert.type === 'critical' ? <AlertCircle className="w-5 h-5 flex-shrink-0" /> :
                         alert.type === 'warning' ? <AlertCircle className="w-5 h-5 flex-shrink-0" /> :
                         alert.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> :
                         <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                        <div className="flex-1">
                            <p className="font-medium">{alert.title}</p>
                            <p className="text-sm opacity-80">{alert.message}</p>
                        </div>
                        <span className="text-xs opacity-60">{alert.time}</span>
                    </div>
                ))}
            </div>

            {/* ========== CHARTS ROW ========== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 card">
                    <div className="card-header flex-col sm:flex-row gap-4">
                        <div>
                            <h2 className="font-semibold text-slate-800 dark:text-white">Revenue Overview</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Weekly performance by department</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm flex-wrap">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                <span className="text-slate-500 dark:text-slate-400">OPD</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                                <span className="text-slate-500 dark:text-slate-400">IPD</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                                <span className="text-slate-500 dark:text-slate-400">Pharmacy</span>
                            </div>
                        </div>
                    </div>
                    <div className="card-body">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="opdGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="ipdGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="pharmGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => [`₹${Number(value).toLocaleString()}`, '']}
                                />
                                <Area type="monotone" dataKey="opd" stroke="#3b82f6" fill="url(#opdGrad)" strokeWidth={2} />
                                <Area type="monotone" dataKey="ipd" stroke="#8b5cf6" fill="url(#ipdGrad)" strokeWidth={2} />
                                <Area type="monotone" dataKey="pharmacy" stroke="#10b981" fill="url(#pharmGrad)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bed Status */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="font-semibold text-slate-800 dark:text-white">Bed Occupancy</h2>
                        <Link href="/ipd/beds" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1">
                            View All <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="card-body">
                        <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                                <Pie
                                    data={bedData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={75}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {bedData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            {bedData.map((item) => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                                    <span className="text-sm text-slate-600 dark:text-slate-400">{item.name}</span>
                                    <span className="text-sm font-semibold text-slate-800 dark:text-white ml-auto">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ========== TABLES ROW ========== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Patients */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="font-semibold text-slate-800 dark:text-white">Recent Patients</h2>
                        <Link href="/patients" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1">
                            View All <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {recentPatients.map((patient) => (
                            <div key={patient.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0 ${
                                        patient.type === 'emergency' ? 'bg-red-500' :
                                        patient.type === 'ipd' ? 'bg-purple-500' :
                                        patient.type === 'opd' ? 'bg-blue-500' :
                                        patient.type === 'discharged' ? 'bg-slate-400' :
                                        'bg-amber-500'
                                    }`}>
                                        {patient.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-medium text-slate-800 dark:text-white truncate">{patient.name}</p>
                                            <span className="text-xs text-slate-400 dark:text-slate-500">({patient.age}/{patient.gender})</span>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{patient.dept}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <span className={`badge ${
                                            patient.status === 'Emergency' ? 'badge-danger' :
                                            patient.status === 'Admitted' ? 'badge-info' :
                                            patient.status === 'OPD' ? 'badge-success' :
                                            patient.status === 'Discharged' ? 'badge-neutral' :
                                            'badge-warning'
                                        }`}>
                                            {patient.status}
                                        </span>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{patient.time}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Today's Appointments */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="font-semibold text-slate-800 dark:text-white">Today's Appointments</h2>
                        <Link href="/appointments/today" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1">
                            View All <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {appointments.map((appt, index) => (
                            <div key={index} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="text-center min-w-[60px] flex-shrink-0">
                                        <p className="font-semibold text-slate-800 dark:text-white text-sm">{appt.time}</p>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-800 dark:text-white truncate">{appt.patient}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{appt.doctor} • {appt.dept}</p>
                                    </div>
                                    <span className={`badge flex-shrink-0 ${
                                        appt.status === 'Completed' ? 'badge-success' :
                                        appt.status === 'In Progress' ? 'badge-info' :
                                        appt.status === 'Waiting' ? 'badge-warning' :
                                        'badge-neutral'
                                    }`}>
                                        {appt.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ========== DEPARTMENT STATS ========== */}
            <div className="card">
                <div className="card-header">
                    <h2 className="font-semibold text-slate-800 dark:text-white">Department Overview</h2>
                    <Link href="/reports/departments" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">View Details</Link>
                </div>
                <div className="card-body">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={departmentData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={80} tick={{ fill: '#1e293b', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                            />
                            <Bar dataKey="patients" radius={[0, 4, 4, 0]}>
                                {departmentData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
