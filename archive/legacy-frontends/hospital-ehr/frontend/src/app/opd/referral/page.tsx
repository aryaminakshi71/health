'use client';

import React, { useState } from 'react';
import {
    ArrowRightLeft,
    User,
    Building2,
    Building,
    Search,
    Send,
    FileText,
    Clock,
    AlertTriangle,
    Phone,
    MapPin,
    CheckCircle,
    XCircle,
    ExternalLink,
    Upload,
    Paperclip,
    Calendar,
    Stethoscope,
    Plus
} from 'lucide-react';

// Mock patient data
const currentPatient = {
    id: 'P001',
    name: 'Amit Kumar',
    age: 55,
    gender: 'Male',
    phone: '9876543212',
    token: 'A003',
    diagnosis: ['Chest Pain', 'Suspected Angina'],
    allergies: [],
    currentDoctor: 'Dr. Patel',
    currentDepartment: 'General Medicine',
};

// Mock departments
const internalDepartments = [
    { id: 'd1', name: 'Cardiology', doctors: ['Dr. Singh', 'Dr. Kapoor'], avgWaitTime: '30 min', availability: 'Available' },
    { id: 'd2', name: 'Orthopedics', doctors: ['Dr. Verma', 'Dr. Jain'], avgWaitTime: '45 min', availability: 'Available' },
    { id: 'd3', name: 'Neurology', doctors: ['Dr. Gupta'], avgWaitTime: '1 hr', availability: 'Limited' },
    { id: 'd4', name: 'Gastroenterology', doctors: ['Dr. Mehta', 'Dr. Shah'], avgWaitTime: '20 min', availability: 'Available' },
    { id: 'd5', name: 'Pulmonology', doctors: ['Dr. Kumar'], avgWaitTime: '35 min', availability: 'Busy' },
    { id: 'd6', name: 'Nephrology', doctors: ['Dr. Reddy'], avgWaitTime: '25 min', availability: 'Available' },
];

// Mock external hospitals
const externalHospitals = [
    { id: 'h1', name: 'AIIMS Delhi', type: 'Government', specialties: ['Cardiology', 'Oncology', 'Neurosurgery'], distance: '15 km', phone: '011-26588500' },
    { id: 'h2', name: 'Fortis Hospital', type: 'Private', specialties: ['Cardiac Surgery', 'Orthopedics', 'IVF'], distance: '8 km', phone: '011-42776222' },
    { id: 'h3', name: 'Max Super Specialty', type: 'Private', specialties: ['Oncology', 'Transplant', 'Neurology'], distance: '12 km', phone: '011-26515050' },
    { id: 'h4', name: 'Safdarjung Hospital', type: 'Government', specialties: ['General Surgery', 'Orthopedics', 'Burns'], distance: '10 km', phone: '011-26707437' },
];

// Mock referral history
const referralHistory = [
    { id: 'r1', date: '2024-12-15', patient: 'Suresh Yadav', from: 'General Medicine', to: 'Cardiology', status: 'COMPLETED', doctor: 'Dr. Singh' },
    { id: 'r2', date: '2024-12-14', patient: 'Meera Agarwal', from: 'OPD', to: 'Fortis Hospital', status: 'PENDING', doctor: '-', external: true },
    { id: 'r3', date: '2024-12-13', patient: 'Rajesh Verma', from: 'Emergency', to: 'ICU', status: 'COMPLETED', doctor: 'Dr. Gupta' },
    { id: 'r4', date: '2024-12-12', patient: 'Anita Desai', from: 'General Medicine', to: 'AIIMS Delhi', status: 'ACCEPTED', doctor: '-', external: true },
];

const referralStatusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    PENDING: { bg: 'bg-amber-100 dark:bg-amber-500/20', text: 'text-amber-700 dark:text-amber-400', icon: <Clock className="h-3 w-3" /> },
    ACCEPTED: { bg: 'bg-green-100 dark:bg-green-500/20', text: 'text-green-700 dark:text-green-400', icon: <CheckCircle className="h-3 w-3" /> },
    COMPLETED: { bg: 'bg-blue-100 dark:bg-blue-500/20', text: 'text-blue-700 dark:text-blue-400', icon: <CheckCircle className="h-3 w-3" /> },
    REJECTED: { bg: 'bg-red-100 dark:bg-red-500/20', text: 'text-red-700 dark:text-red-400', icon: <XCircle className="h-3 w-3" /> },
};

const availabilityColors: Record<string, string> = {
    Available: 'text-green-600 dark:text-green-400',
    Limited: 'text-amber-600 dark:text-amber-400',
    Busy: 'text-red-600 dark:text-red-400',
};

export default function OPDReferralPage() {
    const [referralType, setReferralType] = useState<'internal' | 'external'>('internal');
    const [selectedDepartment, setSelectedDepartment] = useState<string>('');
    const [selectedDoctor, setSelectedDoctor] = useState<string>('');
    const [selectedHospital, setSelectedHospital] = useState<string>('');
    const [referralReason, setReferralReason] = useState('');
    const [clinicalSummary, setClinicalSummary] = useState('');
    const [urgency, setUrgency] = useState<'ROUTINE' | 'URGENT' | 'EMERGENCY'>('ROUTINE');
    const [searchQuery, setSearchQuery] = useState('');
    const [attachments, setAttachments] = useState<string[]>([]);

    const selectedDept = internalDepartments.find(d => d.id === selectedDepartment);

    const filteredDepartments = internalDepartments.filter(d => 
        d.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredHospitals = externalHospitals.filter(h => 
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">Patient Referral</h1>
                    <p className="text-slate-600 dark:text-slate-400">Refer patients to other departments or hospitals</p>
                </div>
                <div className="flex gap-3">
                    <button className="btn btn-secondary flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        View History
                    </button>
                    <button className="btn btn-primary flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Submit Referral
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left Sidebar */}
                <div className="space-y-4">
                    {/* Patient Card */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <User className="h-5 w-5 text-blue-500" />
                                Patient Details
                            </h3>
                        </div>
                        <div className="card-body space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                                    {currentPatient.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">{currentPatient.name}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{currentPatient.age} yrs, {currentPatient.gender}</p>
                                </div>
                            </div>
                            <div className="h-px bg-slate-200 dark:bg-slate-700" />
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-slate-400" />
                                    <span className="text-slate-600 dark:text-slate-300">{currentPatient.phone}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Stethoscope className="h-4 w-4 text-slate-400" />
                                    <span className="text-slate-600 dark:text-slate-300">{currentPatient.currentDoctor} | {currentPatient.currentDepartment}</span>
                                </div>
                            </div>
                            <div className="h-px bg-slate-200 dark:bg-slate-700" />
                            <div>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">CURRENT DIAGNOSIS</p>
                                <div className="flex flex-wrap gap-1">
                                    {currentPatient.diagnosis.map((d, i) => (
                                        <span key={i} className="badge bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs">
                                            {d}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Referrals */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <Clock className="h-5 w-5 text-purple-500" />
                                Recent Referrals
                            </h3>
                        </div>
                        <div className="card-body space-y-2 max-h-80 overflow-y-auto">
                            {referralHistory.map((referral) => (
                                <div key={referral.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-start justify-between mb-1">
                                        <p className="font-medium text-sm text-slate-900 dark:text-white">{referral.patient}</p>
                                        <span className={`badge text-xs flex items-center gap-1 ${referralStatusConfig[referral.status].bg} ${referralStatusConfig[referral.status].text}`}>
                                            {referralStatusConfig[referral.status].icon}
                                            {referral.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {referral.from} <ArrowRightLeft className="h-3 w-3 inline mx-1" /> {referral.to}
                                        {referral.external && <ExternalLink className="h-3 w-3 inline ml-1" />}
                                    </p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{referral.date}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="xl:col-span-2 space-y-4">
                    {/* Referral Type Toggle */}
                    <div className="card">
                        <div className="card-body">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setReferralType('internal')}
                                    className={`flex-1 py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                                        referralType === 'internal'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    <Building2 className="h-5 w-5" />
                                    Internal Referral
                                </button>
                                <button
                                    onClick={() => setReferralType('external')}
                                    className={`flex-1 py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                                        referralType === 'external'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    <Building className="h-5 w-5" />
                                    External Referral
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Search & Selection */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                {referralType === 'internal' ? 'Select Department' : 'Select Hospital'}
                            </h3>
                        </div>
                        <div className="card-body space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder={referralType === 'internal' ? 'Search departments...' : 'Search hospitals or specialties...'}
                                    className="input pl-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {referralType === 'internal' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {filteredDepartments.map((dept) => (
                                        <button
                                            key={dept.id}
                                            onClick={() => {
                                                setSelectedDepartment(dept.id);
                                                setSelectedDoctor('');
                                            }}
                                            className={`p-4 rounded-lg border text-left transition-all ${
                                                selectedDepartment === dept.id
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/50'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="font-semibold text-slate-900 dark:text-white">{dept.name}</h4>
                                                <span className={`text-xs font-medium ${availabilityColors[dept.availability]}`}>
                                                    {dept.availability}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                                                {dept.doctors.length} doctor(s) | Avg wait: {dept.avgWaitTime}
                                            </p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500">
                                                {dept.doctors.join(', ')}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredHospitals.map((hospital) => (
                                        <button
                                            key={hospital.id}
                                            onClick={() => setSelectedHospital(hospital.id)}
                                            className={`w-full p-4 rounded-lg border text-left transition-all ${
                                                selectedHospital === hospital.id
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/50'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                                        {hospital.name}
                                                        <ExternalLink className="h-4 w-4 text-slate-400" />
                                                    </h4>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{hospital.type}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {hospital.distance}
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                        <Phone className="h-3 w-3" />
                                                        {hospital.phone}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {hospital.specialties.map((s, i) => (
                                                    <span key={i} className="badge bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs">
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Doctor Selection for Internal Referral */}
                            {referralType === 'internal' && selectedDept && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Select Doctor (Optional)
                                    </label>
                                    <select
                                        className="input"
                                        value={selectedDoctor}
                                        onChange={(e) => setSelectedDoctor(e.target.value)}
                                    >
                                        <option value="">Any Available Doctor</option>
                                        {selectedDept.doctors.map((doc, i) => (
                                            <option key={i} value={doc}>{doc}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Referral Details */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="font-semibold text-slate-900 dark:text-white">Referral Details</h3>
                        </div>
                        <div className="card-body space-y-4">
                            {/* Urgency */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Urgency Level
                                </label>
                                <div className="flex gap-2">
                                    {(['ROUTINE', 'URGENT', 'EMERGENCY'] as const).map((level) => (
                                        <button
                                            key={level}
                                            onClick={() => setUrgency(level)}
                                            className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                                                urgency === level
                                                    ? level === 'EMERGENCY'
                                                        ? 'bg-red-600 text-white'
                                                        : level === 'URGENT'
                                                        ? 'bg-amber-500 text-white'
                                                        : 'bg-green-600 text-white'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                            }`}
                                        >
                                            {level === 'EMERGENCY' && <AlertTriangle className="h-4 w-4 inline mr-1" />}
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Reason */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Reason for Referral *
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., Suspected cardiac involvement, requires specialist evaluation"
                                    className="input"
                                    value={referralReason}
                                    onChange={(e) => setReferralReason(e.target.value)}
                                />
                            </div>

                            {/* Clinical Summary */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Clinical Summary
                                </label>
                                <textarea
                                    placeholder="Brief clinical history, examination findings, investigations done..."
                                    className="input min-h-[120px] resize-none"
                                    value={clinicalSummary}
                                    onChange={(e) => setClinicalSummary(e.target.value)}
                                />
                            </div>

                            {/* Attachments */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Attachments
                                </label>
                                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center">
                                    <Upload className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        Drag & drop files or <span className="text-blue-600 dark:text-blue-400 cursor-pointer">browse</span>
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                                        Reports, X-rays, ECG, etc.
                                    </p>
                                </div>
                                {attachments.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                        {attachments.map((file, i) => (
                                            <div key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                <Paperclip className="h-4 w-4" />
                                                {file}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 border-blue-200 dark:border-blue-500/30">
                        <div className="card-body">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">
                                        {referralType === 'internal' 
                                            ? selectedDept 
                                                ? `Referring to ${selectedDept.name}${selectedDoctor ? ` - ${selectedDoctor}` : ''}`
                                                : 'Select a department to continue'
                                            : selectedHospital
                                                ? `Referring to ${externalHospitals.find(h => h.id === selectedHospital)?.name}`
                                                : 'Select a hospital to continue'
                                        }
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {urgency} priority | Patient will be notified
                                    </p>
                                </div>
                                <button 
                                    className="btn btn-primary flex items-center gap-2"
                                    disabled={(!selectedDepartment && referralType === 'internal') || (!selectedHospital && referralType === 'external') || !referralReason}
                                >
                                    <Send className="h-4 w-4" />
                                    Submit Referral
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
