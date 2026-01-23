'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Clock, User, Phone, Mail, Search, Filter, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SearchInput } from '@/components/ui/SearchInput';

const mockAppointments = [
    { id: 'APT-001', patient: 'Rahul Sharma', phone: '9876543210', email: 'rahul@email.com', doctor: 'Dr. Rajesh Patel', department: 'General Medicine', date: '2024-12-30', time: '09:00 AM', type: 'NEW', status: 'CONFIRMED', notes: 'Follow-up for diabetes' },
    { id: 'APT-002', patient: 'Priya Gupta', phone: '9876543211', email: 'priya@email.com', doctor: 'Dr. Sunita Mehta', department: 'Cardiology', date: '2024-12-30', time: '09:30 AM', type: 'FOLLOWUP', status: 'CONFIRMED', notes: 'ECG follow-up' },
    { id: 'APT-003', patient: 'Amit Kumar', phone: '9876543212', email: 'amit@email.com', doctor: 'Dr. Amit Singh', department: 'Orthopedics', date: '2024-12-30', time: '10:00 AM', type: 'NEW', status: 'PENDING', notes: 'Knee pain' },
    { id: 'APT-004', patient: 'Sneha Patel', phone: '9876543213', email: 'sneha@email.com', doctor: 'Dr. Priya Reddy', department: 'Neurology', date: '2024-12-30', time: '10:30 AM', type: 'FOLLOWUP', status: 'CONFIRMED', notes: 'Migraine follow-up' },
    { id: 'APT-005', patient: 'Vikram Joshi', phone: '9876543214', email: 'vikram@email.com', doctor: 'Dr. Vikram Kumar', department: 'Pediatrics', date: '2024-12-30', time: '11:00 AM', type: 'NEW', status: 'CANCELLED', notes: 'Child checkup' },
    { id: 'APT-006', patient: 'Anjali Reddy', phone: '9876543215', email: 'anjali@email.com', doctor: 'Dr. Anjali Sharma', department: 'Obstetrics & Gynecology', date: '2024-12-30', time: '11:30 AM', type: 'FOLLOWUP', status: 'CONFIRMED', notes: 'Pregnancy checkup' },
    { id: 'APT-007', patient: 'Rajesh Verma', phone: '9876543216', email: 'rajesh@email.com', doctor: 'Dr. Sanjay Gupta', department: 'Dermatology', date: '2024-12-31', time: '09:00 AM', type: 'NEW', status: 'PENDING', notes: 'Skin rash' },
    { id: 'APT-008', patient: 'Meera Joshi', phone: '9876543217', email: 'meera@email.com', doctor: 'Dr. Meera Joshi', department: 'ENT', date: '2024-12-31', time: '09:30 AM', type: 'FOLLOWUP', status: 'CONFIRMED', notes: 'Ear infection follow-up' },
];

const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
    '04:00 PM', '04:30 PM', '05:00 PM'
];

const statusColors: Record<string, string> = {
    CONFIRMED: 'bg-green-500/20 text-green-400 border-green-500/30',
    PENDING: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
    COMPLETED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const typeColors: Record<string, string> = {
    NEW: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    FOLLOWUP: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
};

export default function AppointmentsDashboard() {
    const [appointments] = useState(mockAppointments);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

    const todayAppointments = appointments.filter(a => a.date === '2024-12-30');
    const confirmedCount = todayAppointments.filter(a => a.status === 'CONFIRMED').length;
    const pendingCount = todayAppointments.filter(a => a.status === 'PENDING').length;
    const cancelledCount = todayAppointments.filter(a => a.status === 'CANCELLED').length;

    const filteredAppointments = appointments.filter(a => {
        const matchesSearch = a.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             a.doctor.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'ALL' || a.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const navigateDate = (direction: 'prev' | 'next') => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        setSelectedDate(newDate);
    };

    return (
        <div className="min-h-screen bg-slate-900 p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Calendar className="h-6 w-6 text-blue-500" />
                        </div>
                        Appointments
                    </h1>
                    <p className="text-slate-400">Schedule and manage patient appointments</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex bg-slate-800 rounded-lg p-1">
                        <Button
                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                            className={viewMode === 'list' ? 'bg-blue-600' : ''}
                        >
                            List
                        </Button>
                        <Button
                            variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('calendar')}
                            className={viewMode === 'calendar' ? 'bg-blue-600' : ''}
                        >
                            Calendar
                        </Button>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" /> New Appointment
                    </Button>
                </div>
            </div>

            {/* Date Navigation & Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Date Selector */}
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <Button variant="ghost" size="sm" onClick={() => navigateDate('prev')}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <h3 className="font-semibold text-white">
                            {selectedDate.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </h3>
                        <Button variant="ghost" size="sm" onClick={() => navigateDate('next')}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button variant="outline" className="w-full" size="sm">
                        <Calendar className="h-4 w-4 mr-2" /> Today
                    </Button>
                </div>

                {/* Stats */}
                <div className="lg:col-span-3 grid grid-cols-3 gap-4">
                    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 border-l-4 border-l-green-500">
                        <p className="text-slate-400 text-sm">Confirmed</p>
                        <p className="text-3xl font-bold text-green-400 mt-1">{confirmedCount}</p>
                    </div>
                    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 border-l-4 border-l-amber-500">
                        <p className="text-slate-400 text-sm">Pending</p>
                        <p className="text-3xl font-bold text-amber-400 mt-1">{pendingCount}</p>
                    </div>
                    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 border-l-4 border-l-red-500">
                        <p className="text-slate-400 text-sm">Cancelled</p>
                        <p className="text-3xl font-bold text-red-400 mt-1">{cancelledCount}</p>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <SearchInput
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search by patient name or doctor..."
                    />
                </div>
                <div className="flex gap-2">
                    {['ALL', 'CONFIRMED', 'PENDING', 'CANCELLED'].map((status) => (
                        <Button
                            key={status}
                            variant={filterStatus === status ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilterStatus(status)}
                            className={filterStatus === status ? 'bg-blue-600' : ''}
                        >
                            {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Appointments List */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-900/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Appointment</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Patient</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Doctor</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Department</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {filteredAppointments.map((appointment) => (
                                <tr key={appointment.id} className="hover:bg-slate-700/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-slate-400" />
                                            <div>
                                                <p className="font-semibold text-blue-400">{appointment.time}</p>
                                                <p className="text-xs text-slate-400">{appointment.date}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                                {appointment.patient.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{appointment.patient}</p>
                                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                                    <Phone className="h-3 w-3" />
                                                    {appointment.phone}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-300">{appointment.doctor}</td>
                                    <td className="px-4 py-3 text-slate-400 text-sm">{appointment.department}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-medium border ${typeColors[appointment.type]}`}>
                                            {appointment.type === 'NEW' ? 'New' : 'Follow-up'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-medium border ${statusColors[appointment.status]}`}>
                                            {appointment.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-center gap-2">
                                            {appointment.status === 'PENDING' && (
                                                <>
                                                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                                        <CheckCircle className="h-3 w-3 mr-1" /> Confirm
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                                                        Cancel
                                                    </Button>
                                                </>
                                            )}
                                            {appointment.status === 'CONFIRMED' && (
                                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                                    Check In
                                                </Button>
                                            )}
                                            {appointment.status === 'CANCELLED' && (
                                                <Button size="sm" variant="secondary">
                                                    Reschedule
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

            {/* Quick Time Slots */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
                <h3 className="font-semibold text-white mb-4">Available Time Slots Today</h3>
                <div className="flex flex-wrap gap-2">
                    {timeSlots.map((slot) => {
                        const isBooked = todayAppointments.some(a => a.time === slot && a.status !== 'CANCELLED');
                        return (
                            <button
                                key={slot}
                                disabled={isBooked}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    isBooked 
                                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                        : 'bg-slate-700 text-slate-300 hover:bg-blue-600 hover:text-white'
                                }`}
                            >
                                {slot}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
