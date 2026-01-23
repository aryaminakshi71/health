'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Users, Calendar, Clock, Plus, ChevronLeft, ChevronRight,
    Sun, Moon, Coffee, UserCheck, AlertCircle
} from 'lucide-react';

// Mock staff data
const mockStaff = [
    { id: '1', name: 'Dr. Patel', role: 'Doctor', department: 'General Medicine', color: 'bg-blue-500' },
    { id: '2', name: 'Dr. Sharma', role: 'Doctor', department: 'Pediatrics', color: 'bg-green-500' },
    { id: '3', name: 'Dr. Mehta', role: 'Doctor', department: 'OB-GYN', color: 'bg-pink-500' },
    { id: '4', name: 'Nurse Priya', role: 'Nurse', department: 'ICU', color: 'bg-purple-500' },
    { id: '5', name: 'Nurse Kavita', role: 'Nurse', department: 'General Ward', color: 'bg-orange-500' },
    { id: '6', name: 'Dr. Reddy', role: 'Doctor', department: 'Surgery', color: 'bg-red-500' },
];

// Mock schedule data
const mockSchedule: Record<string, Record<string, { shift: string; staff: string[] }>> = {
    'Mon': {
        'Morning': { shift: '8 AM - 2 PM', staff: ['1', '2', '4'] },
        'Afternoon': { shift: '2 PM - 8 PM', staff: ['3', '5'] },
        'Night': { shift: '8 PM - 8 AM', staff: ['6', '4'] },
    },
    'Tue': {
        'Morning': { shift: '8 AM - 2 PM', staff: ['1', '3', '5'] },
        'Afternoon': { shift: '2 PM - 8 PM', staff: ['2', '4'] },
        'Night': { shift: '8 PM - 8 AM', staff: ['6', '5'] },
    },
    'Wed': {
        'Morning': { shift: '8 AM - 2 PM', staff: ['2', '3', '4'] },
        'Afternoon': { shift: '2 PM - 8 PM', staff: ['1', '5'] },
        'Night': { shift: '8 PM - 8 AM', staff: ['6', '4'] },
    },
    'Thu': {
        'Morning': { shift: '8 AM - 2 PM', staff: ['1', '2', '5'] },
        'Afternoon': { shift: '2 PM - 8 PM', staff: ['3', '4'] },
        'Night': { shift: '8 PM - 8 AM', staff: ['6', '5'] },
    },
    'Fri': {
        'Morning': { shift: '8 AM - 2 PM', staff: ['1', '3', '4'] },
        'Afternoon': { shift: '2 PM - 8 PM', staff: ['2', '5'] },
        'Night': { shift: '8 PM - 8 AM', staff: ['6', '4'] },
    },
    'Sat': {
        'Morning': { shift: '8 AM - 2 PM', staff: ['2', '4'] },
        'Afternoon': { shift: '2 PM - 8 PM', staff: ['1'] },
        'Night': { shift: '8 PM - 8 AM', staff: ['6'] },
    },
    'Sun': {
        'Morning': { shift: '8 AM - 2 PM', staff: ['3', '5'] },
        'Afternoon': { shift: '2 PM - 8 PM', staff: ['2'] },
        'Night': { shift: '8 PM - 8 AM', staff: ['6'] },
    },
};

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const shifts = [
    { name: 'Morning', icon: Sun, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { name: 'Afternoon', icon: Coffee, color: 'text-orange-500', bg: 'bg-orange-50' },
    { name: 'Night', icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-50' },
];

export default function StaffSchedulePage() {
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [selectedStaff, setSelectedStaff] = useState<string | null>(null);

    const getStaffById = (id: string) => mockStaff.find(s => s.id === id);

    const getWeekDateRange = () => {
        const start = new Date(currentWeek);
        start.setDate(start.getDate() - start.getDay() + 1);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        return `${start.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    };

    const navigateWeek = (direction: number) => {
        const newDate = new Date(currentWeek);
        newDate.setDate(newDate.getDate() + direction * 7);
        setCurrentWeek(newDate);
    };

    // Staff working hours this week
    const staffHours = mockStaff.map(staff => {
        let morningCount = 0;
        let afternoonCount = 0;
        let nightCount = 0;

        days.forEach(day => {
            if (mockSchedule[day]?.Morning?.staff.includes(staff.id)) morningCount++;
            if (mockSchedule[day]?.Afternoon?.staff.includes(staff.id)) afternoonCount++;
            if (mockSchedule[day]?.Night?.staff.includes(staff.id)) nightCount++;
        });

        return {
            ...staff,
            totalShifts: morningCount + afternoonCount + nightCount,
            hours: morningCount * 6 + afternoonCount * 6 + nightCount * 12,
        };
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Calendar className="h-8 w-8 text-cyan-600" />
                        Staff Scheduling
                    </h1>
                    <p className="text-gray-500">Manage doctor and nurse shift assignments</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline">
                        <Users className="h-4 w-4 mr-2" /> Manage Staff
                    </Button>
                    <Button className="bg-cyan-600 hover:bg-cyan-700 shadow-lg">
                        <Plus className="h-4 w-4 mr-2" /> Add Shift
                    </Button>
                </div>
            </div>

            {/* Week Navigation */}
            <Card className="shadow-lg border-0">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <Button variant="outline" onClick={() => navigateWeek(-1)}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-center">
                            <h2 className="text-xl font-bold">{getWeekDateRange()}</h2>
                            <p className="text-sm text-gray-500">Weekly Schedule</p>
                        </div>
                        <Button variant="outline" onClick={() => navigateWeek(1)}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Schedule Grid */}
                <div className="lg:col-span-3">
                    <Card className="shadow-lg border-0 overflow-hidden">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 w-28">Shift</th>
                                            {days.map((day) => (
                                                <th key={day} className="px-2 py-3 text-center text-sm font-semibold text-gray-600">
                                                    {day}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {shifts.map((shift) => (
                                            <tr key={shift.name} className="border-t">
                                                <td className={`px-4 py-4 ${shift.bg}`}>
                                                    <div className="flex items-center gap-2">
                                                        <shift.icon className={`h-5 w-5 ${shift.color}`} />
                                                        <div>
                                                            <p className="font-medium text-sm">{shift.name}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {mockSchedule['Mon']?.[shift.name]?.shift}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                {days.map((day) => {
                                                    const dayShift = mockSchedule[day]?.[shift.name];
                                                    const staffList = dayShift?.staff.map(id => getStaffById(id)).filter(Boolean) || [];

                                                    return (
                                                        <td key={day} className={`px-2 py-2 ${shift.bg} border-l`}>
                                                            <div className="min-h-[60px] flex flex-wrap gap-1 justify-center items-start">
                                                                {staffList.map((staff) => (
                                                                    <div
                                                                        key={staff!.id}
                                                                        className={`px-2 py-1 ${staff!.color} text-white text-xs rounded truncate max-w-[80px] cursor-pointer hover:opacity-80`}
                                                                        title={`${staff!.name} - ${staff!.department}`}
                                                                        onClick={() => setSelectedStaff(staff!.id)}
                                                                    >
                                                                        {staff!.name.split(' ')[0]}
                                                                    </div>
                                                                ))}
                                                                {staffList.length === 0 && (
                                                                    <span className="text-xs text-gray-400 italic">No staff</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Staff List & Stats */}
                <div className="space-y-6">
                    <Card className="shadow-lg border-0">
                        <CardHeader className="py-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Users className="h-5 w-5 text-cyan-600" />
                                Staff Hours This Week
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {staffHours
                                    .sort((a, b) => b.hours - a.hours)
                                    .map((staff) => (
                                        <div
                                            key={staff.id}
                                            className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedStaff === staff.id
                                                    ? 'border-cyan-500 bg-cyan-50'
                                                    : 'hover:bg-gray-50'
                                                }`}
                                            onClick={() => setSelectedStaff(staff.id === selectedStaff ? null : staff.id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`h-10 w-10 rounded-full ${staff.color} flex items-center justify-center text-white font-bold`}>
                                                    {staff.name.charAt(0)}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">{staff.name}</p>
                                                    <p className="text-xs text-gray-500">{staff.department}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-cyan-600">{staff.hours}h</p>
                                                    <p className="text-xs text-gray-500">{staff.totalShifts} shifts</p>
                                                </div>
                                            </div>
                                            {/* Hours bar */}
                                            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${staff.color} rounded-full`}
                                                    style={{ width: `${Math.min((staff.hours / 48) * 100, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Alerts */}
                    <Card className="shadow-lg border-0 border-l-4 border-yellow-500 bg-yellow-50">
                        <CardHeader className="py-3">
                            <CardTitle className="text-sm flex items-center gap-2 text-yellow-700">
                                <AlertCircle className="h-4 w-4" />
                                Scheduling Alerts
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <ul className="text-sm text-yellow-800 space-y-2">
                                <li>• Sunday night shift has only 1 staff</li>
                                <li>• Dr. Patel has 6 consecutive shifts</li>
                                <li>• ICU needs minimum 2 nurses per shift</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
