'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Baby, Heart, AlertTriangle, Calendar, Activity,
    TrendingUp, Users, Clock, CheckCircle, Plus, Search,
    Stethoscope, FileText, Phone, ArrowRight
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// Mock pregnancy data
const mockPregnancies = [
    {
        id: '1',
        patientName: 'Kavita Singh',
        age: 28,
        phone: '9876543210',
        lmp: '2024-06-15',
        edd: '2025-03-22',
        gestationalAge: '28 weeks',
        trimester: 3,
        riskLevel: 'LOW',
        lastVisit: '2024-12-20',
        nextVisit: '2024-12-30',
        ancVisits: 6,
        bp: '110/70',
        weight: 65,
        fetalHR: 142,
    },
    {
        id: '2',
        patientName: 'Priya Sharma',
        age: 32,
        phone: '9876543211',
        lmp: '2024-08-10',
        edd: '2025-05-17',
        gestationalAge: '20 weeks',
        trimester: 2,
        riskLevel: 'HIGH',
        riskFactors: ['Previous C-section', 'Gestational Diabetes'],
        lastVisit: '2024-12-15',
        nextVisit: '2024-12-28',
        ancVisits: 4,
        bp: '130/85',
        weight: 72,
        fetalHR: 138,
    },
    {
        id: '3',
        patientName: 'Anjali Gupta',
        age: 25,
        phone: '9876543212',
        lmp: '2024-10-01',
        edd: '2025-07-08',
        gestationalAge: '12 weeks',
        trimester: 1,
        riskLevel: 'LOW',
        lastVisit: '2024-12-22',
        nextVisit: '2025-01-05',
        ancVisits: 2,
        bp: '115/75',
        weight: 58,
        fetalHR: 155,
    },
];

// Weight gain chart data
const weightGainData = [
    { week: 8, weight: 55, ideal: 55 },
    { week: 12, weight: 56.5, ideal: 56 },
    { week: 16, weight: 58, ideal: 58 },
    { week: 20, weight: 60, ideal: 60 },
    { week: 24, weight: 62.5, ideal: 62 },
    { week: 28, weight: 65, ideal: 64 },
];

// ANC Schedule
const ancSchedule = [
    { week: '8-12', visit: '1st Visit', tests: 'Blood group, Hb, HIV, HBsAg, Urine' },
    { week: '14-16', visit: '2nd Visit', tests: 'NT Scan, Double Marker' },
    { week: '18-20', visit: '3rd Visit', tests: 'Anomaly Scan' },
    { week: '24-28', visit: '4th Visit', tests: 'OGTT, Hb' },
    { week: '32-34', visit: '5th Visit', tests: 'Growth Scan' },
    { week: '36-40', visit: 'Weekly', tests: 'NST, AFI' },
];

const riskColors = {
    LOW: 'bg-green-100 text-green-800 border-green-200',
    MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    HIGH: 'bg-red-100 text-red-800 border-red-200',
};

export default function MaternalDashboard() {
    const [pregnancies] = useState(mockPregnancies);
    const [selectedPatient, setSelectedPatient] = useState<typeof mockPregnancies[0] | null>(null);
    const [activeTab, setActiveTab] = useState('overview');

    const totalActive = pregnancies.length;
    const highRiskCount = pregnancies.filter(p => p.riskLevel === 'HIGH').length;
    const dueSoon = pregnancies.filter(p => p.trimester === 3).length;

    const renderTimeline = (gestationalWeeks: number) => {
        const totalWeeks = 40;
        const progress = (gestationalWeeks / totalWeeks) * 100;
        const trimester1 = (12 / totalWeeks) * 100;
        const trimester2 = (27 / totalWeeks) * 100;

        return (
            <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
                <div className="absolute inset-0 flex">
                    <div className="bg-pink-100 border-r border-white" style={{ width: `${trimester1}%` }}>
                        <span className="text-xs text-pink-600 pl-2">T1</span>
                    </div>
                    <div className="bg-purple-100 border-r border-white" style={{ width: `${trimester2 - trimester1}%` }}>
                        <span className="text-xs text-purple-600 pl-2">T2</span>
                    </div>
                    <div className="bg-blue-100" style={{ width: `${100 - trimester2}%` }}>
                        <span className="text-xs text-blue-600 pl-2">T3</span>
                    </div>
                </div>
                <div
                    className="absolute top-0 bottom-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                />
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-purple-600 rounded-full shadow"
                    style={{ left: `calc(${progress}% - 8px)` }}
                />
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Baby className="h-8 w-8 text-pink-600" />
                        Suraksha: Maternal Health
                    </h1>
                    <p className="text-gray-500">Antenatal Care & High-Risk Pregnancy Management</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline">
                        <FileText className="h-4 w-4 mr-2" /> Reports
                    </Button>
                    <Button className="bg-pink-600 hover:bg-pink-700 shadow-lg">
                        <Plus className="h-4 w-4 mr-2" /> Register Pregnancy
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-pink-500 to-pink-700 text-white">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-pink-100 text-sm">Active Pregnancies</p>
                                <p className="text-3xl font-bold">{totalActive}</p>
                            </div>
                            <Baby className="h-10 w-10 text-pink-200" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-red-500">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">High Risk</p>
                                <p className="text-3xl font-bold text-red-600">{highRiskCount}</p>
                            </div>
                            <div className="p-2 bg-red-100 rounded-full">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-purple-500">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Due This Month</p>
                                <p className="text-3xl font-bold text-purple-600">{dueSoon}</p>
                            </div>
                            <div className="p-2 bg-purple-100 rounded-full">
                                <Calendar className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-green-500">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Visits Today</p>
                                <p className="text-3xl font-bold text-green-600">4</p>
                            </div>
                            <div className="p-2 bg-green-100 rounded-full">
                                <Stethoscope className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Patient List */}
                <div className="lg:col-span-2">
                    <Card className="shadow-lg border-0">
                        <CardHeader className="border-b bg-gray-50/50">
                            <div className="flex items-center justify-between">
                                <CardTitle>Active Pregnancies</CardTitle>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search patient..."
                                        className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {pregnancies.map((pregnancy) => (
                                    <div
                                        key={pregnancy.id}
                                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${selectedPatient?.id === pregnancy.id ? 'bg-pink-50' : ''}`}
                                        onClick={() => setSelectedPatient(pregnancy)}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                                                {pregnancy.patientName.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold">{pregnancy.patientName}</h3>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${riskColors[pregnancy.riskLevel as keyof typeof riskColors]}`}>
                                                        {pregnancy.riskLevel} RISK
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span>{pregnancy.age} yrs</span>
                                                    <span className="font-medium text-purple-600">{pregnancy.gestationalAge}</span>
                                                    <span>EDD: {pregnancy.edd}</span>
                                                </div>
                                                <div className="mt-2">
                                                    {renderTimeline(parseInt(pregnancy.gestationalAge))}
                                                </div>
                                                {(pregnancy as any).riskFactors && (
                                                    <div className="flex gap-2 mt-2">
                                                        {(pregnancy as any).riskFactors.map((factor: string) => (
                                                            <span key={factor} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded">
                                                                {factor}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Heart className="h-4 w-4 text-red-500" />
                                                    <span className="font-bold">{pregnancy.fetalHR} bpm</span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">Next: {pregnancy.nextVisit}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Weight Gain Chart */}
                    <Card className="shadow-lg border-0">
                        <CardHeader className="py-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-pink-600" />
                                Weight Gain Trend
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={180}>
                                <AreaChart data={weightGainData}>
                                    <defs>
                                        <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="week" tickFormatter={(v) => `${v}w`} fontSize={11} />
                                    <YAxis domain={[50, 70]} fontSize={11} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="ideal" stroke="#d1d5db" strokeDasharray="5 5" name="Ideal" />
                                    <Area type="monotone" dataKey="weight" stroke="#ec4899" fill="url(#weightGradient)" name="Actual" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* ANC Schedule */}
                    <Card className="shadow-lg border-0">
                        <CardHeader className="py-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-purple-600" />
                                ANC Schedule
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {ancSchedule.map((visit, index) => (
                                    <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">
                                            {visit.week.split('-')[0]}w
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{visit.visit}</p>
                                            <p className="text-xs text-gray-500">{visit.tests}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* High Risk Alert */}
                    {highRiskCount > 0 && (
                        <Card className="shadow-lg border-0 border-l-4 border-red-500 bg-red-50">
                            <CardHeader className="py-4">
                                <CardTitle className="text-lg flex items-center gap-2 text-red-700">
                                    <AlertTriangle className="h-5 w-5" />
                                    High Risk Alert
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {pregnancies.filter(p => p.riskLevel === 'HIGH').map((p) => (
                                        <div key={p.id} className="p-3 bg-white rounded-lg border border-red-200">
                                            <p className="font-medium text-sm">{p.patientName}</p>
                                            <p className="text-xs text-gray-500">{p.gestationalAge} • {(p as any).riskFactors?.join(', ')}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
