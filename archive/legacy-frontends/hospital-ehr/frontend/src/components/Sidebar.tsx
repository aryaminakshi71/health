'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Stethoscope,
    BedDouble,
    Baby,
    Brain,
    Receipt,
    Pill,
    Settings,
    LogOut,
    Menu,
    FlaskConical,
    Monitor,
    AlertTriangle,
    Calendar,
    Video,
    Shield,
    Users,
    Bell,
    HelpCircle,
    Activity,
    Scan,
    Heart,
    ChevronRight,
    ChevronDown,
    MapPin,
    Phone,
    User,
    Mail,
    Eye,
    Bone,
    HeartPulse,
    Syringe,
    Microscope,
    Siren,
    Thermometer,
    Ear,
    Radio,
    Scissors,
    Accessibility,
    Zap,
    Sparkles,
    Building2,
    X,
    Search
} from 'lucide-react';

const menuGroups = [
    {
        title: 'MAIN',
        items: [
            { href: '/', label: 'Dashboard', icon: LayoutDashboard },
            { href: '/patients', label: 'Patients', icon: Users },
            { href: '/appointments', label: 'Appointments', icon: Calendar },
            { href: '/doctors', label: 'Doctors', icon: Stethoscope },
        ]
    },
    {
        title: 'EMERGENCY & CRITICAL',
        items: [
            { href: '/emergency', label: 'Emergency (24/7)', icon: Siren, badge: '2', badgeColor: 'bg-red-500', pulse: true },
            { href: '/icu', label: 'ICU', icon: HeartPulse, badge: '5', badgeColor: 'bg-orange-500' },
            { href: '/nicu', label: 'NICU', icon: Baby, badge: '3', badgeColor: 'bg-pink-500' },
            { href: '/operation-theatre', label: 'Operation Theatre', icon: Scissors },
        ]
    },
    {
        title: 'OPD & IPD',
        items: [
            { href: '/opd', label: 'OPD Queue', icon: Users, badge: '12', badgeColor: 'bg-emerald-500' },
            { href: '/ipd', label: 'IPD / Beds', icon: BedDouble, badge: '68%', badgeColor: 'bg-blue-500' },
        ]
    },
    {
        title: 'DIAGNOSTICS',
        items: [
            { href: '/laboratory', label: 'Laboratory', icon: FlaskConical },
            { href: '/xray', label: 'X-Ray', icon: Scan },
            { href: '/ultrasound', label: 'Ultrasound', icon: Radio },
            { href: '/tmt', label: 'TMT (Treadmill)', icon: Activity },
        ]
    },
    {
        title: 'SPECIALTIES',
        items: [
            { href: '/general-medicine', label: 'General Medicine', icon: Stethoscope },
            { href: '/general-surgery', label: 'General Surgery', icon: Scissors },
            { href: '/cardiology', label: 'Cardiology', icon: Heart },
            { href: '/orthopedics', label: 'Orthopedics', icon: Bone },
            { href: '/gynecology', label: 'OBS & Gynecology', icon: Baby },
            { href: '/pediatrics', label: 'Pediatrics', icon: Baby },
            { href: '/neurology', label: 'Neurology', icon: Brain },
            { href: '/gastroenterology', label: 'Gastroenterology', icon: Thermometer },
            { href: '/nephrology', label: 'Nephrology', icon: Activity },
            { href: '/urology', label: 'Urology', icon: Activity },
            { href: '/ent', label: 'ENT', icon: Ear },
            { href: '/ophthalmology', label: 'Ophthalmology', icon: Eye },
            { href: '/dermatology', label: 'Skin & Allergy', icon: Sparkles },
            { href: '/psychiatry', label: 'Psychiatry', icon: Zap },
            { href: '/physiotherapy', label: 'Physiotherapy', icon: Accessibility },
        ]
    },
    {
        title: 'MOTHER & CHILD',
        items: [
            { href: '/maternal-care', label: 'Maternal Care', icon: Baby },
            { href: '/child-care', label: 'Child Care', icon: Baby },
        ]
    },
    {
        title: 'PHARMACY & BILLING',
        items: [
            { href: '/pharmacy', label: 'Pharmacy (24/7)', icon: Pill },
            { href: '/billing', label: 'Billing', icon: Receipt, badge: '₹45K', badgeColor: 'bg-amber-500' },
        ]
    },
    {
        title: 'DIGITAL SERVICES',
        items: [
            { href: '/telemedicine', label: 'Telemedicine', icon: Video },
            { href: '/patient-portal', label: 'Patient Portal', icon: Monitor },
            { href: '/queue-display', label: 'Queue Display', icon: Monitor },
        ]
    },
    {
        title: 'ADMINISTRATION',
        items: [
            { href: '/staff', label: 'Staff Management', icon: Users },
            { href: '/inventory', label: 'Inventory', icon: Building2 },
            { href: '/reports', label: 'Reports', icon: Receipt },
            { href: '/settings', label: 'Settings', icon: Settings },
        ]
    }
];

export default function Sidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<string[]>(['MAIN', 'EMERGENCY & CRITICAL', 'OPD & IPD']);

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

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 bg-slate-800/95 backdrop-blur text-white p-2.5 rounded-xl border border-slate-700 shadow-xl hover:bg-slate-700 transition-colors"
            >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div 
                    className="lg:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 z-40 h-screen
                bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950
                border-r border-slate-700/50 shadow-2xl
                transition-all duration-300 ease-out flex flex-col
                ${isCollapsed ? 'w-20' : 'w-72'}
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Logo & Hospital Info */}
                <div className="flex-shrink-0">
                    {/* Logo */}
                    <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700/50 bg-slate-900/50">
                        {!isCollapsed ? (
                            <Link href="/" className="flex items-center gap-3 group">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-500 flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-cyan-500/30 group-hover:shadow-cyan-500/50 transition-shadow">
                                    H
                                </div>
                                <div>
                                    <h1 className="font-bold text-white text-lg tracking-tight">Heal & Health</h1>
                                    <p className="text-[10px] text-cyan-400 font-medium">Hospital EHR System</p>
                                </div>
                            </Link>
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-500 flex items-center justify-center font-bold text-white text-lg mx-auto shadow-lg">
                                H
                            </div>
                        )}
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="hidden lg:flex p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
                        >
                            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${!isCollapsed ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    {/* Hospital Contact Info */}
                    {!isCollapsed && (
                        <div className="px-4 py-3 border-b border-slate-700/50 bg-gradient-to-r from-cyan-950/50 to-transparent">
                            <div className="flex items-center gap-2 text-xs text-slate-300 mb-1.5">
                                <MapPin className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                                <span className="truncate">SCO 42, Civil Lines, Gurugram</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                                    <Phone className="w-3 h-3 text-emerald-400" />
                                    <span>0124-4206860</span>
                                </div>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                                    24/7
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Search */}
                    {!isCollapsed && (
                        <div className="px-4 py-3 border-b border-slate-700/50">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input 
                                    type="text"
                                    placeholder="Search patients, doctors..."
                                    className="w-full pl-9 pr-4 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-2 px-2 custom-scrollbar">
                    {menuGroups.map((group) => (
                        <div key={group.title} className="mb-1">
                            {!isCollapsed && (
                                <button
                                    onClick={() => toggleGroup(group.title)}
                                    className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider hover:text-slate-300 transition-colors"
                                >
                                    <span>{group.title}</span>
                                    <ChevronDown className={`w-3 h-3 transition-transform ${expandedGroups.includes(group.title) ? 'rotate-180' : ''}`} />
                                </button>
                            )}
                            {(isCollapsed || expandedGroups.includes(group.title)) && (
                                <div className={isCollapsed ? 'px-1 space-y-1' : 'px-1 space-y-0.5'}>
                                    {group.items.map((item) => {
                                        const active = isActive(item.href);
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setMobileOpen(false)}
                                                className={`
                                                    flex items-center gap-3 py-2 px-3 rounded-lg
                                                    transition-all duration-200 group relative
                                                    ${active 
                                                        ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/10 text-white shadow-lg shadow-cyan-500/10' 
                                                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                                                    }
                                                    ${isCollapsed ? 'justify-center' : ''}
                                                `}
                                                title={isCollapsed ? item.label : undefined}
                                            >
                                                <item.icon className={`w-[18px] h-[18px] flex-shrink-0 transition-all group-hover:scale-110 ${active ? 'text-cyan-400' : ''}`} />
                                                {!isCollapsed && (
                                                    <>
                                                        <span className="font-medium text-sm flex-1 truncate">{item.label}</span>
                                                        {item.badge && (
                                                            <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md ${item.badgeColor || 'bg-slate-700'} text-white`}>
                                                                {item.badge}
                                                            </span>
                                                        )}
                                                        {item.pulse && (
                                                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                                        )}
                                                    </>
                                                )}
                                                {isCollapsed && item.badge && (
                                                    <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center text-[8px] font-bold rounded-full bg-red-500 text-white">
                                                        !
                                                    </span>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>

                {/* Footer */}
                <div className="flex-shrink-0 p-3 border-t border-slate-700/50 bg-slate-900/50">
                    {!isCollapsed ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-gradient-to-r from-slate-800/80 to-slate-800/40 border border-slate-700/50">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center font-semibold text-white text-sm shadow-lg">
                                    <User className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">Dr. Admin</p>
                                    <p className="text-[11px] text-slate-400 truncate">Super Administrator</p>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></div>
                            </div>
                            <div className="grid grid-cols-4 gap-1.5">
                                <button className="flex items-center justify-center py-2 rounded-lg text-slate-400 hover:bg-slate-800/50 hover:text-white transition-all group relative">
                                    <Bell className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center text-[9px] font-bold rounded-full bg-red-500 text-white">3</span>
                                </button>
                                <button className="flex items-center justify-center py-2 rounded-lg text-slate-400 hover:bg-slate-800/50 hover:text-white transition-all group">
                                    <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                </button>
                                <button className="flex items-center justify-center py-2 rounded-lg text-slate-400 hover:bg-slate-800/50 hover:text-white transition-all group">
                                    <HelpCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                </button>
                                <button className="flex items-center justify-center py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-all group">
                                    <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center font-semibold text-white shadow-lg">
                                <User className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <button className="p-2 rounded-lg text-slate-400 hover:bg-slate-800/50 hover:text-white relative">
                                    <Bell className="w-4 h-4" />
                                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500"></span>
                                </button>
                                <button className="p-2 rounded-lg text-red-400 hover:bg-red-500/10">
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* Spacer for main content */}
            <div className={`hidden lg:block flex-shrink-0 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'}`} />

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(100, 116, 139, 0.3);
                    border-radius: 2px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(100, 116, 139, 0.5);
                }
            `}</style>
        </>
    );
}
