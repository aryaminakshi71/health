'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Brain, Calendar, TrendingUp, Users, Clock, CheckCircle, Plus, Search,
    Star, Target, MessageCircle, Activity, FileText, BarChart3, Settings,
    ArrowUp, ArrowDown, Minus, PlayCircle, Award, BookOpen, Heart,
    Video, Bell, Camera, Smile, AlertCircle, Zap, Sparkles
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area, BarChart, Bar } from 'recharts';

// Comprehensive patient profiles
const mockPatients = [
    {
        id: '1',
        name: 'Aarav Mehta',
        age: 6,
        diagnosis: 'ASD Level 1',
        diagnosisDate: '2022-03-15',
        therapist: 'Dr. Sneha Kapoor',
        enrolledDate: '2024-06-15',
        totalSessions: 48,
        nextSession: '2024-12-30 10:00 AM',
        photo: null,
        parentName: 'Priya Mehta',
        parentPhone: '9876543210',
        parentEmail: 'priya.mehta@email.com',
        sensoryProfile: { auditory: 'Hypersensitive', visual: 'Normal', tactile: 'Seeking' },
        strengths: ['Visual Learning', 'Memory', 'Puzzles'],
        challenges: ['Transitions', 'Eye Contact', 'Group Settings'],
        currentIEP: {
            startDate: '2024-06-01',
            reviewDate: '2025-06-01',
            goals: [
                { id: 'g1', name: 'Eye Contact', target: 'Maintain 3-5 sec', current: 7, max: 10, trend: 'up' },
                { id: 'g2', name: 'Verbal Requests', target: '5 per session', current: 5, max: 10, trend: 'up' },
                { id: 'g3', name: 'Social Turn-Taking', target: '3 exchanges', current: 4, max: 10, trend: 'stable' },
                { id: 'g4', name: 'Following Instructions', target: '2-step commands', current: 6, max: 10, trend: 'up' },
                { id: 'g5', name: 'Emotional Regulation', target: 'Use calming strategy', current: 3, max: 10, trend: 'up' },
            ]
        },
        recentNotes: 'Good progress in verbal communication. Initiated conversation with peer today.',
        behaviorData: [
            { date: 'Mon', tantrums: 2, compliance: 8, engagement: 7 },
            { date: 'Tue', tantrums: 1, compliance: 9, engagement: 8 },
            { date: 'Wed', tantrums: 3, compliance: 7, engagement: 6 },
            { date: 'Thu', tantrums: 1, compliance: 8, engagement: 9 },
            { date: 'Fri', tantrums: 0, compliance: 9, engagement: 9 },
        ],
        milestones: [
            { date: '2024-12-20', milestone: 'First spontaneous greeting', category: 'Social' },
            { date: '2024-12-10', milestone: 'Used 3-word sentence', category: 'Communication' },
            { date: '2024-11-28', milestone: 'Completed puzzle independently', category: 'Cognitive' },
        ]
    },
    {
        id: '2',
        name: 'Ishaan Sharma',
        age: 4,
        diagnosis: 'ASD Level 2',
        diagnosisDate: '2023-01-10',
        therapist: 'Dr. Priya Reddy',
        enrolledDate: '2024-08-20',
        totalSessions: 32,
        nextSession: '2024-12-29 2:00 PM',
        photo: null,
        parentName: 'Rahul Sharma',
        parentPhone: '9876543211',
        sensoryProfile: { auditory: 'Hypersensitive', visual: 'Seeking', tactile: 'Hypersensitive' },
        strengths: ['Numbers', 'Patterns', 'Music'],
        challenges: ['Verbal Communication', 'Loud Sounds', 'New Environments'],
        currentIEP: {
            startDate: '2024-08-20',
            reviewDate: '2025-02-20',
            goals: [
                { id: 'g1', name: 'Eye Contact', target: 'Respond to name', current: 4, max: 10, trend: 'up' },
                { id: 'g2', name: 'Imitation Skills', target: 'Copy 5 actions', current: 2, max: 10, trend: 'stable' },
                { id: 'g3', name: 'Receptive Language', target: 'Follow 1-step', current: 5, max: 10, trend: 'up' },
                { id: 'g4', name: 'Sensory Tolerance', target: 'Tolerate sounds', current: 3, max: 10, trend: 'up' },
            ]
        },
        recentNotes: 'Working on sensory integration. Showed improvement in tolerating loud sounds.',
        behaviorData: [
            { date: 'Mon', tantrums: 4, compliance: 5, engagement: 5 },
            { date: 'Tue', tantrums: 3, compliance: 6, engagement: 6 },
            { date: 'Wed', tantrums: 5, compliance: 4, engagement: 4 },
            { date: 'Thu', tantrums: 2, compliance: 7, engagement: 7 },
            { date: 'Fri', tantrums: 2, compliance: 7, engagement: 8 },
        ],
        milestones: [
            { date: '2024-12-15', milestone: 'First eye contact on request', category: 'Social' },
            { date: '2024-12-05', milestone: 'Pointed to desired object', category: 'Communication' },
        ]
    },
];

// Therapy activity library
const activityLibrary = [
    { id: 'a1', name: 'Social Stories', category: 'Social', difficulty: 'Easy', duration: '10-15 min', icon: BookOpen },
    { id: 'a2', name: 'PECS Communication', category: 'Communication', difficulty: 'Medium', duration: '15-20 min', icon: MessageCircle },
    { id: 'a3', name: 'Sensory Bins', category: 'Sensory', difficulty: 'Easy', duration: '20-30 min', icon: Sparkles },
    { id: 'a4', name: 'Turn-Taking Games', category: 'Social', difficulty: 'Medium', duration: '15-20 min', icon: Users },
    { id: 'a5', name: 'Visual Schedules', category: 'Routine', difficulty: 'Easy', duration: '5-10 min', icon: Calendar },
    { id: 'a6', name: 'Emotion Cards', category: 'Emotional', difficulty: 'Medium', duration: '10-15 min', icon: Smile },
];

// Today's sessions
const todaySessions = [
    { time: '10:00 AM', patient: 'Aarav Mehta', type: 'ABA', therapist: 'Dr. Sneha', status: 'completed', notes: 'Great session!' },
    { time: '11:30 AM', patient: 'Ishaan Sharma', type: 'Speech', therapist: 'Dr. Priya', status: 'completed', notes: 'Good progress' },
    { time: '2:00 PM', patient: 'Ishaan Sharma', type: 'OT', therapist: 'Dr. Riya', status: 'ongoing', notes: '' },
    { time: '4:00 PM', patient: 'Myra Gupta', type: 'ABA', therapist: 'Dr. Sneha', status: 'upcoming', notes: '' },
];

const therapyTypes = [
    { name: 'ABA', color: 'bg-purple-100 text-purple-700', desc: 'Applied Behavior Analysis' },
    { name: 'Speech', color: 'bg-blue-100 text-blue-700', desc: 'Speech Therapy' },
    { name: 'OT', color: 'bg-green-100 text-green-700', desc: 'Occupational Therapy' },
    { name: 'Sensory', color: 'bg-orange-100 text-orange-700', desc: 'Sensory Integration' },
];

const getTrendIcon = (trend: string) => {
    switch (trend) {
        case 'up': return <ArrowUp className="h-3 w-3 text-green-600" />;
        case 'down': return <ArrowDown className="h-3 w-3 text-red-600" />;
        default: return <Minus className="h-3 w-3 text-gray-400" />;
    }
};

export default function AutismEcosystemPage() {
    const [selectedPatient, setSelectedPatient] = useState<typeof mockPatients[0] | null>(mockPatients[0]);
    const [activeTab, setActiveTab] = useState('overview');
    const [showActivityLibrary, setShowActivityLibrary] = useState(false);

    const totalPatients = mockPatients.length;
    const sessionsToday = todaySessions.length;
    const avgProgress = Math.round(mockPatients.reduce((sum, p) => sum + (p.currentIEP.goals.reduce((s, g) => s + g.current, 0) / p.currentIEP.goals.length), 0) / mockPatients.length * 10);

    const radarData = selectedPatient?.currentIEP.goals.map(g => ({
        skill: g.name.split(' ')[0],
        score: g.current,
        fullMark: g.max,
    })) || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Brain className="h-8 w-8 text-purple-600" />
                        Autism Ecosystem
                    </h1>
                    <p className="text-gray-500">Comprehensive ASD Care • Therapy • Parent Engagement</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setShowActivityLibrary(!showActivityLibrary)}>
                        <BookOpen className="h-4 w-4 mr-2" /> Activity Library
                    </Button>
                    <Button variant="outline">
                        <Video className="h-4 w-4 mr-2" /> Parent Call
                    </Button>
                    <Button className="bg-purple-600 hover:bg-purple-700 shadow-lg">
                        <Plus className="h-4 w-4 mr-2" /> New Session
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-xs">Active Patients</p>
                                <p className="text-2xl font-bold">{totalPatients}</p>
                            </div>
                            <Users className="h-8 w-8 text-purple-200" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-blue-500">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500">Sessions Today</p>
                                <p className="text-2xl font-bold text-blue-600">{sessionsToday}</p>
                            </div>
                            <Calendar className="h-6 w-6 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-green-500">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500">Avg Progress</p>
                                <p className="text-2xl font-bold text-green-600">{avgProgress}%</p>
                            </div>
                            <TrendingUp className="h-6 w-6 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-orange-500">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500">Goals Met</p>
                                <p className="text-2xl font-bold text-orange-600">12</p>
                            </div>
                            <Award className="h-6 w-6 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-pink-500">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500">Parent Msgs</p>
                                <p className="text-2xl font-bold text-pink-600">5</p>
                            </div>
                            <Bell className="h-6 w-6 text-pink-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Activity Library Modal */}
            {showActivityLibrary && (
                <Card className="shadow-lg border-2 border-purple-200">
                    <CardHeader className="py-3 bg-purple-50">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-purple-600" />
                                Activity Library
                            </CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => setShowActivityLibrary(false)}>×</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {activityLibrary.map((activity) => (
                                <div key={activity.id} className="p-3 border rounded-lg hover:bg-purple-50 cursor-pointer transition-colors">
                                    <div className="flex items-center gap-2 mb-2">
                                        <activity.icon className="h-5 w-5 text-purple-600" />
                                        <span className="font-medium text-sm">{activity.name}</span>
                                    </div>
                                    <div className="flex gap-2 text-xs">
                                        <span className="px-2 py-0.5 bg-gray-100 rounded">{activity.category}</span>
                                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded">{activity.duration}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Patient List */}
                <div className="lg:col-span-1">
                    <Card className="shadow-lg border-0">
                        <CardHeader className="py-3 bg-gray-50">
                            <CardTitle className="text-sm">Patients</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {mockPatients.map((patient) => (
                                    <div
                                        key={patient.id}
                                        className={`p-3 cursor-pointer transition-colors ${selectedPatient?.id === patient.id ? 'bg-purple-50 border-l-4 border-purple-500' : 'hover:bg-gray-50'}`}
                                        onClick={() => setSelectedPatient(patient)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                                                {patient.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">{patient.name}</p>
                                                <p className="text-xs text-gray-500">{patient.age} yrs • {patient.diagnosis}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Patient Details */}
                {selectedPatient && (
                    <div className="lg:col-span-3 space-y-6">
                        {/* Patient Header */}
                        <Card className="shadow-lg border-0">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                                        {selectedPatient.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h2 className="text-xl font-bold">{selectedPatient.name}</h2>
                                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-sm">
                                                {selectedPatient.diagnosis}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                            <span>{selectedPatient.age} years old</span>
                                            <span>Therapist: {selectedPatient.therapist}</span>
                                            <span>{selectedPatient.totalSessions} sessions</span>
                                        </div>
                                        <div className="flex gap-2 mt-3">
                                            {selectedPatient.strengths.map((s) => (
                                                <span key={s} className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">✓ {s}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">Next Session</p>
                                        <p className="font-medium text-purple-600">{selectedPatient.nextSession}</p>
                                        <Button size="sm" className="mt-2 bg-purple-600 hover:bg-purple-700">
                                            <PlayCircle className="h-3 w-3 mr-1" /> Start Session
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tabs */}
                        <div className="flex gap-2 border-b">
                            {['overview', 'progress', 'behavior', 'milestones', 'parent'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === tab
                                            ? 'border-purple-600 text-purple-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-2 gap-6">
                                {/* IEP Goals */}
                                <Card className="shadow-lg border-0">
                                    <CardHeader className="py-3">
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <Target className="h-4 w-4 text-purple-600" /> IEP Goals
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {selectedPatient.currentIEP.goals.map((goal) => (
                                                <div key={goal.id}>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-sm font-medium">{goal.name}</span>
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-sm font-bold text-purple-600">{goal.current}/{goal.max}</span>
                                                            {getTrendIcon(goal.trend)}
                                                        </div>
                                                    </div>
                                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all"
                                                            style={{ width: `${(goal.current / goal.max) * 100}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">Target: {goal.target}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Skills Radar */}
                                <Card className="shadow-lg border-0">
                                    <CardHeader className="py-3">
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <BarChart3 className="h-4 w-4 text-purple-600" /> Skills Profile
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <RadarChart data={radarData}>
                                                <PolarGrid />
                                                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10 }} />
                                                <PolarRadiusAxis domain={[0, 10]} tick={{ fontSize: 10 }} />
                                                <Radar name="Skills" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                {/* Sensory Profile */}
                                <Card className="shadow-lg border-0">
                                    <CardHeader className="py-3">
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <Sparkles className="h-4 w-4 text-orange-600" /> Sensory Profile
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {Object.entries(selectedPatient.sensoryProfile).map(([sense, status]) => (
                                                <div key={sense} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                    <span className="capitalize text-sm">{sense}</span>
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${status === 'Hypersensitive' ? 'bg-red-100 text-red-700' :
                                                            status === 'Seeking' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-green-100 text-green-700'
                                                        }`}>
                                                        {status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Recent Notes */}
                                <Card className="shadow-lg border-0">
                                    <CardHeader className="py-3">
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-blue-600" /> Recent Notes
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                                            {selectedPatient.recentNotes}
                                        </p>
                                        <Button variant="outline" size="sm" className="mt-3 w-full">
                                            <Plus className="h-3 w-3 mr-1" /> Add Note
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {activeTab === 'behavior' && (
                            <Card className="shadow-lg border-0">
                                <CardHeader className="py-3">
                                    <CardTitle className="text-sm">Weekly Behavior Tracking</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={selectedPatient.behaviorData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis domain={[0, 10]} />
                                            <Tooltip />
                                            <Bar dataKey="compliance" fill="#22c55e" name="Compliance" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="engagement" fill="#8b5cf6" name="Engagement" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="tantrums" fill="#ef4444" name="Tantrums" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                    <div className="flex justify-center gap-6 mt-4">
                                        <div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-green-500" /><span className="text-xs">Compliance</span></div>
                                        <div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-purple-500" /><span className="text-xs">Engagement</span></div>
                                        <div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-red-500" /><span className="text-xs">Tantrums</span></div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {activeTab === 'milestones' && (
                            <Card className="shadow-lg border-0">
                                <CardHeader className="py-3">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Award className="h-4 w-4 text-yellow-600" /> Milestones Achieved
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {selectedPatient.milestones.map((milestone, idx) => (
                                            <div key={idx} className="flex items-start gap-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                                                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                                                    <Star className="h-5 w-5 text-yellow-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium">{milestone.milestone}</p>
                                                    <div className="flex gap-2 mt-1">
                                                        <span className="text-xs text-gray-500">{milestone.date}</span>
                                                        <span className="px-2 py-0.5 bg-white rounded text-xs">{milestone.category}</span>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="sm">
                                                    <Camera className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        <Button variant="outline" className="w-full">
                                            <Plus className="h-4 w-4 mr-2" /> Record New Milestone
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {activeTab === 'parent' && (
                            <div className="grid grid-cols-2 gap-6">
                                <Card className="shadow-lg border-0">
                                    <CardHeader className="py-3">
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <Heart className="h-4 w-4 text-pink-600" /> Parent Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-xs text-gray-500">Parent Name</p>
                                                <p className="font-medium">{selectedPatient.parentName}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Phone</p>
                                                <p className="font-medium">{selectedPatient.parentPhone}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Email</p>
                                                <p className="font-medium">{selectedPatient.parentEmail || 'Not provided'}</p>
                                            </div>
                                            <div className="flex gap-2 pt-2">
                                                <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                                                    <MessageCircle className="h-3 w-3 mr-1" /> WhatsApp
                                                </Button>
                                                <Button size="sm" variant="outline" className="flex-1">
                                                    <Video className="h-3 w-3 mr-1" /> Video Call
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="shadow-lg border-0">
                                    <CardHeader className="py-3">
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <Bell className="h-4 w-4 text-blue-600" /> Send Update to Parent
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <Button variant="outline" className="w-full justify-start">
                                                <CheckCircle className="h-4 w-4 mr-2 text-green-600" /> Session Completed
                                            </Button>
                                            <Button variant="outline" className="w-full justify-start">
                                                <Star className="h-4 w-4 mr-2 text-yellow-600" /> Milestone Achieved
                                            </Button>
                                            <Button variant="outline" className="w-full justify-start">
                                                <FileText className="h-4 w-4 mr-2 text-blue-600" /> Weekly Report
                                            </Button>
                                            <Button variant="outline" className="w-full justify-start">
                                                <Calendar className="h-4 w-4 mr-2 text-purple-600" /> Schedule Change
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Today's Sessions Sidebar */}
            <Card className="shadow-lg border-0">
                <CardHeader className="py-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600" /> Today's Sessions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        {todaySessions.map((session, index) => (
                            <div key={index} className={`p-3 rounded-lg border ${session.status === 'completed' ? 'bg-green-50 border-green-200' :
                                    session.status === 'ongoing' ? 'bg-blue-50 border-blue-200' :
                                        'bg-gray-50 border-gray-200'
                                }`}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-sm">{session.time}</span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${session.type === 'ABA' ? 'bg-purple-100 text-purple-700' :
                                            session.type === 'Speech' ? 'bg-blue-100 text-blue-700' :
                                                'bg-green-100 text-green-700'
                                        }`}>
                                        {session.type}
                                    </span>
                                </div>
                                <p className="font-medium text-sm">{session.patient}</p>
                                <p className="text-xs text-gray-500">{session.therapist}</p>
                                <div className="flex items-center gap-1 mt-2">
                                    {session.status === 'completed' && <CheckCircle className="h-3 w-3 text-green-600" />}
                                    {session.status === 'ongoing' && <Clock className="h-3 w-3 text-blue-600 animate-pulse" />}
                                    <span className={`text-xs capitalize ${session.status === 'completed' ? 'text-green-600' :
                                            session.status === 'ongoing' ? 'text-blue-600' :
                                                'text-gray-500'
                                        }`}>
                                        {session.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
