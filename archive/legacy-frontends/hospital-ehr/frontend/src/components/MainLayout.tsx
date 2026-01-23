'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, Users, Calendar, Stethoscope, BedDouble, Baby,
    Brain, Receipt, Pill, Settings, LogOut, Menu, FlaskConical, Monitor,
    Bell, HelpCircle, Activity, Scan, Heart, ChevronRight, ChevronDown,
    MapPin, Phone, User, Mail, Eye, Bone, HeartPulse, Thermometer,
    Ear, Scissors, Zap, Sparkles, Building2, X, Search, Clock, 
    MessageSquare, FileText, Shield, ChevronLeft, Maximize, CreditCard,
    Truck, Package, UserCog, ClipboardList, BarChart3, PieChart, TrendingUp,
    Wallet, BadgeDollarSign, FileCheck, Printer, Archive, Database,
    Wifi, Camera, Lock, Key, UserPlus, UserCheck, Briefcase, GraduationCap,
    Award, Target, AlertTriangle, Siren, Droplet,
    Wind, Microscope, TestTube, Beaker, Radiation, Radio, Waves,
    MonitorSpeaker, Tv, Globe, Languages, HardDrive, Server, Cloud,
    Download, Upload, RefreshCw, Trash2, Edit, Copy, Share2, Send,
    CalendarDays, CalendarClock, Timer, Hourglass, Coffee, Utensils,
    Car, Building, Home, MapPinned, Navigation, Route, Layers,
    LayoutGrid, List, Table, Grid3X3, Columns, Rows, SlidersHorizontal,
    Filter, SortAsc, SortDesc, ChevronUp, ArrowUp, ArrowDown, ArrowLeft,
    ArrowRight, RotateCcw, RotateCw, ZoomIn, ZoomOut, Move, Grip,
    MoreHorizontal, MoreVertical, Info, AlertCircle, CheckCircle, XCircle,
    MinusCircle, PlusCircle, Plus, Minus, Check, Loader2, Sparkle,
    Sun, Moon
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

// ============ COMPREHENSIVE HOSPITAL MENU STRUCTURE ============
const menuGroups = [
    {
        title: 'DASHBOARD',
        icon: LayoutDashboard,
        items: [
            { href: '/', label: 'Main Dashboard', icon: LayoutDashboard },
            { href: '/analytics', label: 'Analytics', icon: BarChart3 },
            { href: '/reports/daily', label: 'Daily Reports', icon: FileText },
        ]
    },
    {
        title: 'PATIENT MANAGEMENT',
        icon: Users,
        items: [
            { href: '/patients', label: 'All Patients', icon: Users, badge: '1,247' },
            { href: '/patients/register', label: 'New Registration', icon: UserPlus },
            { href: '/patients/search', label: 'Patient Search', icon: Search },
            { href: '/patients/medical-records', label: 'Medical Records', icon: FileText },
            { href: '/patients/history', label: 'Patient History', icon: ClipboardList },
        ]
    },
    {
        title: 'APPOINTMENTS',
        icon: Calendar,
        items: [
            { href: '/appointments', label: 'All Appointments', icon: Calendar },
            { href: '/appointments/new', label: 'Book Appointment', icon: CalendarDays },
            { href: '/appointments/today', label: "Today's Schedule", icon: CalendarClock, badge: '48' },
            { href: '/appointments/calendar', label: 'Calendar View', icon: LayoutGrid },
        ]
    },
    {
        title: 'EMERGENCY & CRITICAL CARE',
        icon: Siren,
        items: [
            { href: '/emergency', label: 'Emergency (24/7)', icon: Siren, badge: '3', badgeColor: 'bg-red-500', pulse: true },
            { href: '/icu', label: 'ICU', icon: HeartPulse, badge: '8' },
            { href: '/nicu', label: 'NICU', icon: Baby, badge: '4' },
            { href: '/ccu', label: 'CCU (Cardiac)', icon: Heart, badge: '5' },
            { href: '/trauma', label: 'Trauma Center', icon: AlertTriangle },
            { href: '/ambulance', label: 'Ambulance Services', icon: Truck },
        ]
    },
    {
        title: 'OUTPATIENT (OPD)',
        icon: Stethoscope,
        items: [
            { href: '/opd', label: 'OPD Dashboard', icon: LayoutDashboard },
            { href: '/opd/queue', label: 'Patient Queue', icon: Users, badge: '24' },
            { href: '/opd/consultation', label: 'Consultation', icon: Stethoscope },
            { href: '/opd/prescription', label: 'Prescriptions', icon: FileText },
            { href: '/opd/referral', label: 'Referrals', icon: Share2 },
            { href: '/queue-display', label: 'Queue Display', icon: MonitorSpeaker },
        ]
    },
    {
        title: 'INPATIENT (IPD)',
        icon: BedDouble,
        items: [
            { href: '/ipd', label: 'IPD Dashboard', icon: LayoutDashboard },
            { href: '/ipd/admissions', label: 'Admissions', icon: UserPlus, badge: '12' },
            { href: '/ipd/beds', label: 'Bed Management', icon: BedDouble, badge: '68%' },
            { href: '/ipd/wards', label: 'Ward Management', icon: Building },
            { href: '/ipd/discharge', label: 'Discharge', icon: UserCheck },
            { href: '/ipd/transfer', label: 'Patient Transfer', icon: ArrowRight },
        ]
    },
    {
        title: 'OPERATION THEATRE',
        icon: Scissors,
        items: [
            { href: '/ot', label: 'OT Dashboard', icon: LayoutDashboard },
            { href: '/ot/schedule', label: 'Surgery Schedule', icon: Calendar },
            { href: '/ot/booking', label: 'OT Booking', icon: CalendarDays },
            { href: '/ot/anesthesia', label: 'Anesthesia', icon: Wind },
            { href: '/ot/equipment', label: 'OT Equipment', icon: Package },
            { href: '/ot/sterilization', label: 'Sterilization', icon: Sparkle },
        ]
    },
    {
        title: 'DIAGNOSTICS & LAB',
        icon: FlaskConical,
        items: [
            { href: '/laboratory', label: 'Laboratory', icon: FlaskConical },
            { href: '/lab/tests', label: 'Test Catalog', icon: TestTube },
            { href: '/lab/samples', label: 'Sample Collection', icon: Droplet },
            { href: '/lab/results', label: 'Test Results', icon: FileCheck },
            { href: '/lab/reports', label: 'Lab Reports', icon: FileText },
        ]
    },
    {
        title: 'RADIOLOGY & IMAGING',
        icon: Scan,
        items: [
            { href: '/radiology', label: 'Radiology Dashboard', icon: LayoutDashboard },
            { href: '/radiology/xray', label: 'X-Ray', icon: Scan },
            { href: '/radiology/ct', label: 'CT Scan', icon: Radio },
            { href: '/radiology/mri', label: 'MRI', icon: Waves },
            { href: '/radiology/ultrasound', label: 'Ultrasound', icon: Activity },
            { href: '/radiology/echo', label: 'Echo / ECG', icon: Heart },
            { href: '/radiology/mammography', label: 'Mammography', icon: Scan },
            { href: '/radiology/tmt', label: 'TMT', icon: Activity },
        ]
    },
    {
        title: 'CLINICAL DEPARTMENTS',
        icon: Stethoscope,
        items: [
            { href: '/dept/general-medicine', label: 'General Medicine', icon: Stethoscope },
            { href: '/dept/general-surgery', label: 'General Surgery', icon: Scissors },
            { href: '/dept/cardiology', label: 'Cardiology', icon: Heart },
            { href: '/dept/orthopedics', label: 'Orthopedics', icon: Bone },
            { href: '/dept/neurology', label: 'Neurology', icon: Brain },
            { href: '/dept/pediatrics', label: 'Pediatrics', icon: Baby },
            { href: '/dept/gynecology', label: 'OBS & Gynecology', icon: Baby },
            { href: '/dept/ent', label: 'ENT', icon: Ear },
            { href: '/dept/ophthalmology', label: 'Ophthalmology', icon: Eye },
            { href: '/dept/dermatology', label: 'Dermatology', icon: Sparkles },
            { href: '/dept/psychiatry', label: 'Psychiatry', icon: Zap },
            { href: '/dept/dental', label: 'Dental', icon: Sparkle },
            { href: '/dept/urology', label: 'Urology', icon: Droplet },
            { href: '/dept/nephrology', label: 'Nephrology', icon: Activity },
            { href: '/dept/gastro', label: 'Gastroenterology', icon: Thermometer },
            { href: '/dept/pulmonology', label: 'Pulmonology', icon: Wind },
            { href: '/dept/oncology', label: 'Oncology', icon: Target },
            { href: '/dept/physiotherapy', label: 'Physiotherapy', icon: Activity },
        ]
    },
    {
        title: 'PHARMACY',
        icon: Pill,
        items: [
            { href: '/pharmacy', label: 'Pharmacy Dashboard', icon: LayoutDashboard },
            { href: '/pharmacy/inventory', label: 'Drug Inventory', icon: Package },
            { href: '/pharmacy/dispensing', label: 'Dispensing', icon: Pill },
            { href: '/pharmacy/orders', label: 'Medicine Orders', icon: ClipboardList },
            { href: '/pharmacy/stock', label: 'Stock Management', icon: Archive },
            { href: '/pharmacy/expiry', label: 'Expiry Tracking', icon: AlertTriangle },
            { href: '/pharmacy/suppliers', label: 'Suppliers', icon: Truck },
        ]
    },
    {
        title: 'BILLING & FINANCE',
        icon: Receipt,
        items: [
            { href: '/billing', label: 'Billing Dashboard', icon: LayoutDashboard },
            { href: '/billing/invoices', label: 'Invoices', icon: Receipt, badge: '₹2.4L' },
            { href: '/billing/payments', label: 'Payments', icon: CreditCard },
            { href: '/billing/insurance', label: 'Insurance Claims', icon: Shield },
            { href: '/billing/tpa', label: 'TPA Management', icon: Building2 },
            { href: '/billing/refunds', label: 'Refunds', icon: RotateCcw },
            { href: '/billing/reports', label: 'Financial Reports', icon: BarChart3 },
            { href: '/billing/taxation', label: 'GST & Taxation', icon: BadgeDollarSign },
        ]
    },
    {
        title: 'INVENTORY & ASSETS',
        icon: Package,
        items: [
            { href: '/inventory', label: 'Inventory Dashboard', icon: LayoutDashboard },
            { href: '/inventory/medical', label: 'Medical Supplies', icon: Package },
            { href: '/inventory/equipment', label: 'Equipment', icon: Monitor },
            { href: '/inventory/consumables', label: 'Consumables', icon: Droplet },
            { href: '/inventory/linen', label: 'Linen & Laundry', icon: Layers },
            { href: '/inventory/food', label: 'Food & Dietary', icon: Utensils },
            { href: '/inventory/purchase', label: 'Purchase Orders', icon: ClipboardList },
            { href: '/inventory/vendors', label: 'Vendor Management', icon: Truck },
        ]
    },
    {
        title: 'HUMAN RESOURCES',
        icon: UserCog,
        items: [
            { href: '/hr', label: 'HR Dashboard', icon: LayoutDashboard },
            { href: '/hr/employees', label: 'All Employees', icon: Users },
            { href: '/hr/doctors', label: 'Doctors', icon: Stethoscope, badge: '45' },
            { href: '/hr/nurses', label: 'Nursing Staff', icon: UserCheck, badge: '120' },
            { href: '/hr/technicians', label: 'Technicians', icon: Settings },
            { href: '/hr/admin-staff', label: 'Admin Staff', icon: Briefcase },
            { href: '/hr/attendance', label: 'Attendance', icon: Clock },
            { href: '/hr/payroll', label: 'Payroll', icon: Wallet },
            { href: '/hr/leave', label: 'Leave Management', icon: Calendar },
            { href: '/hr/duty-roster', label: 'Duty Roster', icon: CalendarDays },
            { href: '/hr/recruitment', label: 'Recruitment', icon: UserPlus },
            { href: '/hr/training', label: 'Training', icon: GraduationCap },
        ]
    },
    {
        title: 'REPORTS & ANALYTICS',
        icon: BarChart3,
        items: [
            { href: '/reports', label: 'Reports Dashboard', icon: LayoutDashboard },
            { href: '/reports/clinical', label: 'Clinical Reports', icon: FileText },
            { href: '/reports/financial', label: 'Financial Reports', icon: BarChart3 },
            { href: '/reports/operational', label: 'Operational Reports', icon: PieChart },
            { href: '/reports/compliance', label: 'Compliance Reports', icon: Shield },
            { href: '/reports/custom', label: 'Custom Reports', icon: SlidersHorizontal },
            { href: '/reports/export', label: 'Export Data', icon: Download },
        ]
    },
    {
        title: 'QUALITY & COMPLIANCE',
        icon: Award,
        items: [
            { href: '/quality', label: 'Quality Dashboard', icon: LayoutDashboard },
            { href: '/quality/nabh', label: 'NABH Compliance', icon: Award },
            { href: '/quality/jci', label: 'JCI Standards', icon: CheckCircle },
            { href: '/quality/infection', label: 'Infection Control', icon: Shield },
            { href: '/quality/incidents', label: 'Incident Reporting', icon: AlertTriangle },
            { href: '/quality/audits', label: 'Internal Audits', icon: ClipboardList },
            { href: '/quality/feedback', label: 'Patient Feedback', icon: MessageSquare },
        ]
    },
    {
        title: 'TELEMEDICINE',
        icon: Monitor,
        items: [
            { href: '/telemedicine', label: 'Telemedicine', icon: Monitor },
            { href: '/telemedicine/consultations', label: 'Video Consults', icon: Camera },
            { href: '/telemedicine/schedule', label: 'Online Schedule', icon: Calendar },
        ]
    },
    {
        title: 'ADMINISTRATION',
        icon: Settings,
        items: [
            { href: '/admin', label: 'Admin Dashboard', icon: LayoutDashboard },
            { href: '/admin/users', label: 'User Management', icon: Users },
            { href: '/admin/roles', label: 'Roles & Permissions', icon: Key },
            { href: '/admin/departments', label: 'Departments', icon: Building },
            { href: '/admin/branches', label: 'Branches/Locations', icon: MapPinned },
            { href: '/admin/templates', label: 'Templates', icon: FileText },
            { href: '/admin/settings', label: 'System Settings', icon: Settings },
            { href: '/admin/backup', label: 'Backup & Restore', icon: Database },
            { href: '/admin/logs', label: 'Audit Logs', icon: ClipboardList },
            { href: '/admin/integrations', label: 'Integrations', icon: Globe },
        ]
    },
];

// Theme Toggle Component
function ThemeToggle() {
    const { resolvedTheme, toggleTheme } = useTheme();
    
    return (
        <button
            onClick={toggleTheme}
            className="theme-toggle p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {resolvedTheme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
            ) : (
                <Moon className="w-5 h-5 text-slate-600" />
            )}
        </button>
    );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<string[]>(['DASHBOARD', 'PATIENT MANAGEMENT', 'EMERGENCY & CRITICAL CARE']);
    const [searchQuery, setSearchQuery] = useState('');

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    };

    const toggleGroup = (title: string) => {
        setExpandedGroups(prev =>
            prev.includes(title)
                ? prev.filter(g => g !== title)
                : [...prev, title]
        );
    };

    const currentTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const currentDate = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors duration-300">
            {/* ========== TOP HEADER ========== */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 z-50 shadow-sm">
                <div className="flex items-center justify-between h-full px-4">
                    {/* Left Section */}
                    <div className="flex items-center gap-3">
                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5 text-slate-600" /> : <Menu className="w-5 h-5 text-slate-600" />}
                        </button>

                        {/* Desktop Sidebar Toggle */}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="hidden lg:flex p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            {sidebarOpen ? <ChevronLeft className="w-5 h-5 text-slate-600" /> : <Menu className="w-5 h-5 text-slate-600" />}
                        </button>

                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <Plus className="w-6 h-6 text-white rotate-45" />
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="font-bold text-slate-900 text-lg leading-tight">Heal & Health</h1>
                                <p className="text-[10px] text-slate-500 font-medium">HOSPITAL MANAGEMENT SYSTEM</p>
                            </div>
                        </Link>
                    </div>

                    {/* Center - Search */}
                    <div className="hidden md:flex flex-1 max-w-xl mx-8">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search patients, doctors, appointments, medicines..."
                                className="w-full pl-10 pr-20 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 text-[10px] text-slate-400 bg-white border border-slate-200 rounded font-mono">⌘</kbd>
                                <kbd className="px-1.5 py-0.5 text-[10px] text-slate-400 bg-white border border-slate-200 rounded font-mono">K</kbd>
                            </div>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-1 sm:gap-2">
                        {/* Date & Time */}
                        <div className="hidden xl:flex flex-col items-end mr-4 text-right">
                            <span className="text-sm font-semibold text-slate-700">{currentTime}</span>
                            <span className="text-[10px] text-slate-500">{currentDate}</span>
                        </div>

                        {/* Quick Actions */}
                        <div className="hidden lg:flex items-center gap-2 mr-2">
                            <Link href="/patients/register" className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                                <Plus className="w-4 h-4" />
                                <span>New Patient</span>
                            </Link>
                        </div>

                        {/* Emergency Alert */}
                        <Link href="/emergency" className="relative p-2 rounded-lg bg-red-50 hover:bg-red-100 transition-colors group">
                            <Siren className="w-5 h-5 text-red-600" />
                            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-[9px] font-bold items-center justify-center">3</span>
                            </span>
                        </Link>

                        {/* Notifications */}
                        <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
                            <Bell className="w-5 h-5 text-slate-600" />
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">12</span>
                        </button>

                        {/* Messages */}
                        <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
                            <MessageSquare className="w-5 h-5 text-slate-600" />
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">5</span>
                        </button>

                        {/* Theme Toggle */}
                        <ThemeToggle />

                        {/* Settings */}
                        <button className="hidden sm:flex p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                            <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </button>

                        {/* Divider */}
                        <div className="hidden sm:block w-px h-8 bg-slate-200 dark:bg-slate-700 mx-1"></div>

                        {/* User Profile */}
                        <div className="flex items-center gap-2 sm:gap-3 pl-1 sm:pl-2">
                            <div className="hidden md:block text-right">
                                <p className="text-sm font-semibold text-slate-800">Dr. Admin</p>
                                <p className="text-[10px] text-slate-500">Super Administrator</p>
                            </div>
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center ring-2 ring-white shadow-md">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                            </div>
                            <button className="hidden sm:flex p-1 hover:bg-slate-100 rounded transition-colors">
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* ========== SIDEBAR ========== */}
            <aside className={`fixed top-16 left-0 bottom-0 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-40 transition-all duration-300 overflow-hidden shadow-sm
                ${sidebarOpen ? 'w-72' : 'w-0 lg:w-16'} 
                ${mobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}`}
            >
                <div className="flex flex-col h-full">
                    {/* Hospital Info Banner */}
                    {(sidebarOpen || mobileMenuOpen) && (
                        <div className="p-3 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-cyan-500">
                            <div className="flex items-center gap-2 text-white/90 text-xs mb-1">
                                <MapPin className="w-3 h-3" />
                                <span>SCO 42, Civil Lines, Gurugram</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-white/90 text-xs">
                                    <Phone className="w-3 h-3" />
                                    <span>0124-4206860</span>
                                </div>
                                <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-white/20 rounded-full backdrop-blur-sm">
                                    24/7 EMERGENCY
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
                        {menuGroups.map((group) => (
                            <div key={group.title} className="mb-1">
                                {(sidebarOpen || mobileMenuOpen) ? (
                                    <button
                                        onClick={() => toggleGroup(group.title)}
                                        className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <group.icon className="w-3.5 h-3.5" />
                                            <span>{group.title}</span>
                                        </div>
                                        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${expandedGroups.includes(group.title) ? '' : '-rotate-90'}`} />
                                    </button>
                                ) : (
                                    <div className="flex justify-center py-2">
                                        <group.icon className="w-4 h-4 text-slate-400" />
                                    </div>
                                )}

                                {(expandedGroups.includes(group.title) || (!sidebarOpen && !mobileMenuOpen)) && (
                                    <div className="space-y-0.5 mt-1">
                                        {group.items.map((item) => {
                                            const active = isActive(item.href);
                                            return (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    onClick={() => setMobileMenuOpen(false)}
                                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm
                                                        ${active
                                                            ? 'bg-blue-50 text-blue-700 font-medium border-l-4 border-blue-600 ml-0 pl-2'
                                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent'
                                                        }
                                                        ${(!sidebarOpen && !mobileMenuOpen) ? 'justify-center px-2' : ''}`}
                                                    title={(!sidebarOpen && !mobileMenuOpen) ? item.label : undefined}
                                                >
                                                    <item.icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                                                    {(sidebarOpen || mobileMenuOpen) && (
                                                        <>
                                                            <span className="flex-1 truncate">{item.label}</span>
                                                            {item.badge && (
                                                                <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md ${item.badgeColor || 'bg-slate-200 text-slate-600'} ${item.badgeColor?.includes('red') ? 'text-white' : ''}`}>
                                                                    {item.badge}
                                                                </span>
                                                            )}
                                                            {item.pulse && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                                                        </>
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>

                    {/* Sidebar Footer */}
                    {(sidebarOpen || mobileMenuOpen) && (
                        <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                            <div className="flex items-center justify-between gap-2">
                                <Link href="/help" className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                                    <HelpCircle className="w-4 h-4" />
                                    <span>Help & Support</span>
                                </Link>
                                <div className="flex items-center gap-1">
                                    <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors">
                                        <Settings className="w-4 h-4" />
                                    </button>
                                    <button className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors">
                                        <LogOut className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* ========== MAIN CONTENT ========== */}
            <main className={`pt-16 min-h-screen transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-16'}`}>
                <div className="p-4 lg:p-6">
                    {children}
                </div>

                {/* ========== FOOTER ========== */}
                <footer className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <div className="px-4 lg:px-6 py-4">
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                            {/* Left */}
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
                                <span className="font-medium text-slate-600 dark:text-slate-300">© 2024 Heal & Health Hospitals Pvt. Ltd.</span>
                                <Link href="/about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About Us</Link>
                                <Link href="/contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</Link>
                                <Link href="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</Link>
                                <Link href="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms of Service</Link>
                            </div>

                            {/* Right */}
                            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-1.5">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    <span className="text-green-600 dark:text-green-400 font-medium">System Online</span>
                                </div>
                                <span className="text-slate-300 dark:text-slate-600">|</span>
                                <span>v2.1.0</span>
                                <span className="text-slate-300 dark:text-slate-600">|</span>
                                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                    <Shield className="w-3 h-3" />
                                    <span className="font-medium">HIPAA Compliant</span>
                                </div>
                                <span className="text-slate-300 dark:text-slate-600">|</span>
                                <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                    <Award className="w-3 h-3" />
                                    <span className="font-medium">NABH Ready</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}
