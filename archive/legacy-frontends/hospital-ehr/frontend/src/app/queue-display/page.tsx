'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Users, Volume2, Bell } from 'lucide-react';

// Mock queue data
const mockQueueData = {
    currentToken: 'OPD-024',
    waitingCount: 12,
    avgWaitTime: '18 mins',
    counters: [
        { id: 1, name: 'Counter 1', doctor: 'Dr. Patel', department: 'General Medicine', currentToken: 'OPD-024', status: 'active' },
        { id: 2, name: 'Counter 2', doctor: 'Dr. Sharma', department: 'Pediatrics', currentToken: 'OPD-018', status: 'active' },
        { id: 3, name: 'Counter 3', doctor: 'Dr. Mehta', department: 'Orthopedics', currentToken: 'OPD-021', status: 'active' },
        { id: 4, name: 'Counter 4', doctor: 'Dr. Reddy', department: 'ENT', currentToken: 'OPD-019', status: 'break' },
    ],
    upcomingTokens: ['OPD-025', 'OPD-026', 'OPD-027', 'OPD-028', 'OPD-029'],
    announcements: [
        'Pharmacy will be closed from 1:00 PM - 2:00 PM for lunch',
        'Please carry your Aadhaar card for ABHA ID linking',
    ],
};

export default function QueueDisplayPage() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [flashToken, setFlashToken] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Flash effect for token
    useEffect(() => {
        const flashInterval = setInterval(() => {
            setFlashToken(true);
            setTimeout(() => setFlashToken(false), 500);
        }, 3000);
        return () => clearInterval(flashInterval);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold">Apollo City Hospital</h1>
                    <p className="text-blue-200 text-lg">OPD Queue Display</p>
                </div>
                <div className="text-right">
                    <div className="text-5xl font-mono font-bold">
                        {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-blue-200">
                        {currentTime.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                </div>
            </div>

            {/* Current Token - Large Display */}
            <div className={`text-center py-12 mb-8 rounded-3xl transition-all duration-300 ${flashToken ? 'bg-yellow-500 scale-105' : 'bg-gradient-to-r from-green-500 to-emerald-600'
                }`}>
                <p className="text-2xl text-white/80 mb-2">NOW SERVING</p>
                <div className="text-9xl font-bold font-mono tracking-wider animate-pulse">
                    {mockQueueData.currentToken}
                </div>
                <p className="text-xl mt-4 text-white/80">Please proceed to Counter 1</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                <Card className="bg-white/10 border-white/20 backdrop-blur">
                    <CardContent className="p-6 text-center">
                        <Users className="h-10 w-10 mx-auto mb-2 text-blue-300" />
                        <p className="text-4xl font-bold text-white">{mockQueueData.waitingCount}</p>
                        <p className="text-blue-200">Patients Waiting</p>
                    </CardContent>
                </Card>
                <Card className="bg-white/10 border-white/20 backdrop-blur">
                    <CardContent className="p-6 text-center">
                        <Clock className="h-10 w-10 mx-auto mb-2 text-green-300" />
                        <p className="text-4xl font-bold text-white">{mockQueueData.avgWaitTime}</p>
                        <p className="text-blue-200">Avg Wait Time</p>
                    </CardContent>
                </Card>
                <Card className="bg-white/10 border-white/20 backdrop-blur">
                    <CardContent className="p-6 text-center">
                        <Volume2 className="h-10 w-10 mx-auto mb-2 text-yellow-300" />
                        <p className="text-4xl font-bold text-white">{mockQueueData.counters.filter(c => c.status === 'active').length}</p>
                        <p className="text-blue-200">Active Counters</p>
                    </CardContent>
                </Card>
            </div>

            {/* Counter Status Grid */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                {mockQueueData.counters.map((counter) => (
                    <Card key={counter.id} className={`border-2 ${counter.status === 'active'
                            ? 'bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-400'
                            : 'bg-gray-800/50 border-gray-600'
                        }`}>
                        <CardContent className="p-4 text-center">
                            <p className="text-sm text-gray-300">{counter.name}</p>
                            <p className={`text-3xl font-bold font-mono my-2 ${counter.status === 'active' ? 'text-green-400' : 'text-gray-500'
                                }`}>
                                {counter.status === 'active' ? counter.currentToken : 'BREAK'}
                            </p>
                            <p className="text-white font-medium">{counter.doctor}</p>
                            <p className="text-xs text-gray-400">{counter.department}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Upcoming Tokens */}
            <div className="flex items-center gap-4 mb-8">
                <p className="text-xl text-blue-200">NEXT UP:</p>
                <div className="flex gap-3">
                    {mockQueueData.upcomingTokens.map((token, index) => (
                        <div
                            key={token}
                            className={`px-6 py-3 rounded-xl font-mono font-bold text-xl ${index === 0
                                    ? 'bg-yellow-500 text-black'
                                    : 'bg-white/10 text-white'
                                }`}
                        >
                            {token}
                        </div>
                    ))}
                </div>
            </div>

            {/* Announcements Ticker */}
            <div className="bg-red-600 rounded-xl p-4 flex items-center gap-4 overflow-hidden">
                <Bell className="h-6 w-6 text-white flex-shrink-0" />
                <div className="animate-marquee whitespace-nowrap">
                    {mockQueueData.announcements.map((ann, i) => (
                        <span key={i} className="mx-8 text-lg">📢 {ann}</span>
                    ))}
                    {mockQueueData.announcements.map((ann, i) => (
                        <span key={`dup-${i}`} className="mx-8 text-lg">📢 {ann}</span>
                    ))}
                </div>
            </div>

            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 20s linear infinite;
                }
            `}</style>
        </div>
    );
}
