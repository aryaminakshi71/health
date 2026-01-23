'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const appointments = [
    { id: 1, date: '2024-12-30', time: '09:00', patient: 'Rahul Sharma', doctor: 'Dr. Sharma', color: 'bg-blue-500' },
    { id: 2, date: '2024-12-30', time: '10:30', patient: 'Priya Gupta', doctor: 'Dr. Gupta', color: 'bg-green-500' },
    { id: 3, date: '2024-12-31', time: '11:00', patient: 'Amit Kumar', doctor: 'Dr. Singh', color: 'bg-purple-500' },
    { id: 4, date: '2025-01-02', time: '09:30', patient: 'Sneha Patel', doctor: 'Dr. Patel', color: 'bg-amber-500' },
    { id: 5, date: '2025-01-03', time: '14:00', patient: 'Vikram Singh', doctor: 'Dr. Verma', color: 'bg-red-500' },
];

export default function AppointmentCalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<'month' | 'week'>('month');

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const getAppointmentsForDate = (day: number) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return appointments.filter(apt => apt.date === dateStr);
    };

    const isToday = (day: number) => {
        const today = new Date();
        return day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Appointment Calendar</h1>
                    <p className="text-slate-500 dark:text-slate-400">View and manage appointments in calendar view</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                        <button
                            onClick={() => setView('month')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${view === 'month' ? 'bg-white dark:bg-slate-700 shadow' : ''}`}
                        >
                            Month
                        </button>
                        <button
                            onClick={() => setView('week')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${view === 'week' ? 'bg-white dark:bg-slate-700 shadow' : ''}`}
                        >
                            Week
                        </button>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <Plus className="w-4 h-4" />
                        New Appointment
                    </button>
                </div>
            </div>

            <div className="card">
                {/* Calendar Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <button onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Calendar Grid */}
                <div className="p-4">
                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {dayNames.map(day => (
                            <div key={day} className="p-2 text-center text-sm font-semibold text-slate-500">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-1">
                        {/* Empty cells for days before month starts */}
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                            <div key={`empty-${i}`} className="min-h-[100px] p-2 bg-slate-50 dark:bg-slate-800/30 rounded-lg" />
                        ))}

                        {/* Days of the month */}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const dayAppointments = getAppointmentsForDate(day);
                            return (
                                <div
                                    key={day}
                                    className={`min-h-[100px] p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                                        isToday(day) ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300' : ''
                                    }`}
                                >
                                    <span className={`text-sm font-medium ${isToday(day) ? 'text-blue-600' : 'text-slate-600 dark:text-slate-400'}`}>
                                        {day}
                                    </span>
                                    <div className="mt-1 space-y-1">
                                        {dayAppointments.slice(0, 2).map(apt => (
                                            <div
                                                key={apt.id}
                                                className={`text-xs p-1 rounded text-white truncate ${apt.color}`}
                                                title={`${apt.time} - ${apt.patient}`}
                                            >
                                                {apt.time} {apt.patient.split(' ')[0]}
                                            </div>
                                        ))}
                                        {dayAppointments.length > 2 && (
                                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                                +{dayAppointments.length - 2} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
