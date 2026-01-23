'use client';

import React, { useState } from 'react';
import { Scissors, ChevronLeft, ChevronRight, Clock, User, Calendar } from 'lucide-react';

const surgerySchedule = [
    { id: 1, date: '2024-12-30', time: '08:00', endTime: '10:00', ot: 'OT-1', patient: 'Ramesh Kumar', procedure: 'Cholecystectomy', surgeon: 'Dr. Sharma', status: 'Completed' },
    { id: 2, date: '2024-12-30', time: '08:30', endTime: '11:30', ot: 'OT-3', patient: 'Arvind Patel', procedure: 'CABG', surgeon: 'Dr. Reddy', status: 'In Progress' },
    { id: 3, date: '2024-12-30', time: '09:00', endTime: '10:30', ot: 'OT-2', patient: 'Sunita Devi', procedure: 'Appendectomy', surgeon: 'Dr. Gupta', status: 'In Progress' },
    { id: 4, date: '2024-12-30', time: '11:00', endTime: '12:00', ot: 'OT-1', patient: 'Priya Sharma', procedure: 'Cesarean Section', surgeon: 'Dr. Verma', status: 'Scheduled' },
    { id: 5, date: '2024-12-30', time: '12:30', endTime: '15:00', ot: 'OT-2', patient: 'Mohammad Ali', procedure: 'Hip Replacement', surgeon: 'Dr. Patel', status: 'Scheduled' },
    { id: 6, date: '2024-12-30', time: '10:30', endTime: '12:30', ot: 'OT-4', patient: 'Deepak Singh', procedure: 'Emergency Laparotomy', surgeon: 'Dr. Sharma', status: 'Scheduled' },
    { id: 7, date: '2024-12-31', time: '08:00', endTime: '09:30', ot: 'OT-1', patient: 'Anjali Kumari', procedure: 'Hernia Repair', surgeon: 'Dr. Gupta', status: 'Scheduled' },
    { id: 8, date: '2024-12-31', time: '10:00', endTime: '14:00', ot: 'OT-3', patient: 'Vikram Singh', procedure: 'Valve Replacement', surgeon: 'Dr. Reddy', status: 'Scheduled' },
    { id: 9, date: '2025-01-01', time: '09:00', endTime: '11:00', ot: 'OT-2', patient: 'Neha Gupta', procedure: 'Thyroidectomy', surgeon: 'Dr. Verma', status: 'Scheduled' },
];

const otRooms = ['OT-1', 'OT-2', 'OT-3', 'OT-4', 'OT-5'];
const timeSlots = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Completed': return 'bg-green-500 dark:bg-green-600';
        case 'In Progress': return 'bg-blue-500 dark:bg-blue-600';
        case 'Scheduled': return 'bg-purple-500 dark:bg-purple-600';
        case 'Cancelled': return 'bg-red-500 dark:bg-red-600';
        default: return 'bg-slate-500 dark:bg-slate-600';
    }
};

export default function OTSchedulePage() {
    const [currentDate, setCurrentDate] = useState(new Date('2024-12-30'));
    const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

    const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
    };

    const navigateDate = (direction: number) => {
        const newDate = new Date(currentDate);
        if (viewMode === 'day') {
            newDate.setDate(newDate.getDate() + direction);
        } else {
            newDate.setDate(newDate.getDate() + (direction * 7));
        }
        setCurrentDate(newDate);
    };

    const getWeekDates = () => {
        const dates = [];
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(date.getDate() + i);
            dates.push(date);
        }
        return dates;
    };

    const getSurgeriesForDateAndOT = (date: string, ot: string) => {
        return surgerySchedule.filter(s => s.date === date && s.ot === ot);
    };

    const getDaySurgeries = () => {
        return surgerySchedule.filter(s => s.date === formatDate(currentDate));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Calendar className="w-7 h-7 text-purple-500" />
                        OT Schedule
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">View and manage surgery schedules</p>
                </div>
                <div className="flex gap-2">
                    <a href="/ot" className="btn btn-secondary">
                        <Scissors className="w-4 h-4" /> Dashboard
                    </a>
                    <a href="/ot/booking" className="btn btn-primary">
                        <Scissors className="w-4 h-4" /> Book OT
                    </a>
                </div>
            </div>

            {/* Calendar Controls */}
            <div className="card p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <button onClick={() => navigateDate(-1)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                            <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        </button>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white min-w-[200px] text-center">
                            {currentDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </h2>
                        <button onClick={() => navigateDate(1)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                            <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setViewMode('day')} 
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'day' ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
                        >
                            Day View
                        </button>
                        <button 
                            onClick={() => setViewMode('week')} 
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'week' ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
                        >
                            Week View
                        </button>
                        <button 
                            onClick={() => setCurrentDate(new Date())} 
                            className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                        >
                            Today
                        </button>
                    </div>
                </div>
            </div>

            {/* Day View */}
            {viewMode === 'day' && (
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead className="bg-slate-50 dark:bg-slate-800">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase w-20">Time</th>
                                    {otRooms.map(ot => (
                                        <th key={ot} className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{ot}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {timeSlots.map(time => (
                                    <tr key={time} className="h-16">
                                        <td className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-700">
                                            {time}
                                        </td>
                                        {otRooms.map(ot => {
                                            const surgeries = getSurgeriesForDateAndOT(formatDate(currentDate), ot);
                                            const surgery = surgeries.find(s => s.time === time);
                                            return (
                                                <td key={ot} className="px-2 py-1 border-r border-slate-100 dark:border-slate-700 last:border-r-0">
                                                    {surgery && (
                                                        <div className={`p-2 rounded-lg text-white text-xs ${getStatusColor(surgery.status)}`}>
                                                            <p className="font-semibold truncate">{surgery.procedure}</p>
                                                            <p className="truncate">{surgery.patient}</p>
                                                            <p className="truncate opacity-80">{surgery.surgeon}</p>
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Week View */}
            {viewMode === 'week' && (
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px]">
                            <thead className="bg-slate-50 dark:bg-slate-800">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase w-20">OT</th>
                                    {getWeekDates().map(date => (
                                        <th key={date.toISOString()} className={`px-4 py-3 text-center text-xs font-semibold uppercase ${formatDate(date) === formatDate(new Date()) ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                            <div>{date.toLocaleDateString('en-IN', { weekday: 'short' })}</div>
                                            <div className="text-lg font-bold">{date.getDate()}</div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {otRooms.map(ot => (
                                    <tr key={ot} className="h-24">
                                        <td className="px-4 py-2 text-sm font-bold text-purple-600 dark:text-purple-400 border-r border-slate-100 dark:border-slate-700">
                                            {ot}
                                        </td>
                                        {getWeekDates().map(date => {
                                            const surgeries = getSurgeriesForDateAndOT(formatDate(date), ot);
                                            return (
                                                <td key={date.toISOString()} className={`px-2 py-1 border-r border-slate-100 dark:border-slate-700 last:border-r-0 align-top ${formatDate(date) === formatDate(new Date()) ? 'bg-purple-50 dark:bg-purple-900/10' : ''}`}>
                                                    {surgeries.map(surgery => (
                                                        <div key={surgery.id} className={`p-1.5 mb-1 rounded text-white text-xs ${getStatusColor(surgery.status)}`}>
                                                            <p className="font-semibold truncate">{surgery.time}</p>
                                                            <p className="truncate">{surgery.procedure}</p>
                                                        </div>
                                                    ))}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Today's List */}
            <div className="card">
                <div className="card-header">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-purple-500" />
                        Surgery List - {currentDate.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Time</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">OT</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Patient</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Procedure</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Surgeon</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {getDaySurgeries().sort((a, b) => a.time.localeCompare(b.time)).map((surgery) => (
                                <tr key={surgery.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                                        {surgery.time} - {surgery.endTime}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="font-bold text-purple-600 dark:text-purple-400">{surgery.ot}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-slate-400" />
                                            <span className="text-slate-900 dark:text-white font-medium">{surgery.patient}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{surgery.procedure}</td>
                                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{surgery.surgeon}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full text-white ${getStatusColor(surgery.status)}`}>
                                            {surgery.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {getDaySurgeries().length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                                        No surgeries scheduled for this day
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Legend */}
            <div className="card p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Status:</span>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">In Progress</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">Scheduled</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">Cancelled</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
