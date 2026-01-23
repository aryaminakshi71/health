'use client';

import React, { useState } from 'react';
import {
    User,
    Heart,
    Thermometer,
    Activity,
    Droplets,
    Scale,
    Ruler,
    Stethoscope,
    FileText,
    Pill,
    Save,
    Send,
    Clock,
    AlertTriangle,
    ChevronRight,
    History,
    Clipboard,
    Plus,
    X,
    CheckCircle,
    Loader2,
    AlertCircle
} from 'lucide-react';

// Mock patient data
const currentPatient = {
    id: 'P001',
    name: 'Rahul Sharma',
    age: 32,
    gender: 'Male',
    phone: '9876543210',
    email: 'rahul.sharma@email.com',
    bloodGroup: 'B+',
    address: '123, MG Road, Bangalore - 560001',
    token: 'A001',
    registeredAt: '09:15 AM',
    chiefComplaint: 'Fever and headache for 3 days',
    allergies: ['Penicillin', 'Sulfa drugs'],
    chronicConditions: ['Hypertension'],
    lastVisit: '2024-10-15',
};

const vitals = {
    temperature: { value: '101.2', unit: '°F', status: 'HIGH' },
    bloodPressure: { systolic: 140, diastolic: 90, status: 'ELEVATED' },
    pulse: { value: 88, unit: 'bpm', status: 'NORMAL' },
    spO2: { value: 97, unit: '%', status: 'NORMAL' },
    weight: { value: 72, unit: 'kg', status: 'NORMAL' },
    height: { value: 175, unit: 'cm', status: 'NORMAL' },
    bmi: { value: 23.5, status: 'NORMAL' },
    respiratoryRate: { value: 18, unit: '/min', status: 'NORMAL' },
};

const visitHistory = [
    { date: '2024-10-15', complaint: 'Back pain', diagnosis: 'Muscle strain', doctor: 'Dr. Verma' },
    { date: '2024-08-20', complaint: 'Seasonal flu', diagnosis: 'Viral infection', doctor: 'Dr. Patel' },
    { date: '2024-05-10', complaint: 'Annual checkup', diagnosis: 'Healthy', doctor: 'Dr. Patel' },
];

const commonDiagnoses = [
    'Viral Fever', 'Upper Respiratory Infection', 'Migraine', 'Hypertension', 
    'Type 2 Diabetes', 'Gastritis', 'Allergic Rhinitis', 'Lower Back Pain'
];

const vitalStatusColors: Record<string, string> = {
    NORMAL: 'text-green-600 dark:text-green-400',
    HIGH: 'text-red-600 dark:text-red-400',
    LOW: 'text-amber-600 dark:text-amber-400',
    ELEVATED: 'text-amber-600 dark:text-amber-400',
};

export default function OPDConsultationPage() {
    const [diagnosis, setDiagnosis] = useState('');
    const [clinicalNotes, setClinicalNotes] = useState('');
    const [selectedDiagnoses, setSelectedDiagnoses] = useState<string[]>([]);
    const [investigations, setInvestigations] = useState<string[]>([]);
    const [newInvestigation, setNewInvestigation] = useState('');
    const [followUpDays, setFollowUpDays] = useState('7');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{ clinicalNotes?: string; diagnosis?: string }>({});

    const addDiagnosis = (d: string) => {
        if (!selectedDiagnoses.includes(d)) {
            setSelectedDiagnoses([...selectedDiagnoses, d]);
        }
    };

    const removeDiagnosis = (d: string) => {
        setSelectedDiagnoses(selectedDiagnoses.filter(diag => diag !== d));
    };

    const addInvestigation = () => {
        if (newInvestigation.trim() && !investigations.includes(newInvestigation.trim())) {
            setInvestigations([...investigations, newInvestigation.trim()]);
            setNewInvestigation('');
        }
    };

    const removeInvestigation = (inv: string) => {
        setInvestigations(investigations.filter(i => i !== inv));
    };

    const validateForm = (): boolean => {
        const errors: { clinicalNotes?: string; diagnosis?: string } = {};
        
        if (!clinicalNotes.trim() || clinicalNotes.trim().length < 10) {
            errors.clinicalNotes = 'Clinical notes must be at least 10 characters';
        }
        
        if (selectedDiagnoses.length === 0) {
            errors.diagnosis = 'At least one diagnosis is required';
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveDraft = async () => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
        // Show toast or notification
    };

    const handleComplete = async () => {
        if (!validateForm()) {
            return;
        }
        
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsSubmitting(false);
        setShowSuccess(true);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">OPD Consultation</h1>
                    <p className="text-slate-600 dark:text-slate-400">Patient consultation and clinical documentation</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={handleSaveDraft}
                        disabled={isSaving}
                        className="btn btn-secondary flex items-center gap-2"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {isSaving ? 'Saving...' : 'Save Draft'}
                    </button>
                    <button 
                        onClick={handleComplete}
                        disabled={isSubmitting}
                        className="btn btn-success flex items-center gap-2"
                    >
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        {isSubmitting ? 'Completing...' : 'Complete & Send'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left Column - Patient Info & Vitals */}
                <div className="space-y-6">
                    {/* Patient Info Card */}
                    <div className="card">
                        <div className="card-header bg-blue-50 dark:bg-blue-500/10">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                                    {currentPatient.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white">{currentPatient.name}</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        {currentPatient.age} yrs, {currentPatient.gender} | {currentPatient.bloodGroup}
                                    </p>
                                </div>
                            </div>
                            <span className="badge bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold">
                                {currentPatient.token}
                            </span>
                        </div>
                        <div className="card-body space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-slate-400" />
                                <span className="text-slate-600 dark:text-slate-400">Registered: {currentPatient.registeredAt}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <User className="h-4 w-4 text-slate-400" />
                                <span className="text-slate-600 dark:text-slate-400">{currentPatient.phone}</span>
                            </div>
                            
                            {/* Chief Complaint */}
                            <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30">
                                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">CHIEF COMPLAINT</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300">{currentPatient.chiefComplaint}</p>
                            </div>

                            {/* Allergies */}
                            {currentPatient.allergies.length > 0 && (
                                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertTriangle className="h-4 w-4 text-red-500" />
                                        <p className="text-xs font-semibold text-red-700 dark:text-red-400">ALLERGIES</p>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {currentPatient.allergies.map((allergy, i) => (
                                            <span key={i} className="badge bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-xs">
                                                {allergy}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Chronic Conditions */}
                            {currentPatient.chronicConditions.length > 0 && (
                                <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30">
                                    <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-2">CHRONIC CONDITIONS</p>
                                    <div className="flex flex-wrap gap-1">
                                        {currentPatient.chronicConditions.map((condition, i) => (
                                            <span key={i} className="badge bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs">
                                                {condition}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Vitals Card */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <Activity className="h-5 w-5 text-green-500" />
                                Vitals
                            </h3>
                        </div>
                        <div className="card-body">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Thermometer className="h-4 w-4 text-red-500" />
                                        <span className="text-xs text-slate-500 dark:text-slate-400">Temp</span>
                                    </div>
                                    <p className={`text-lg font-bold ${vitalStatusColors[vitals.temperature.status]}`}>
                                        {vitals.temperature.value}{vitals.temperature.unit}
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Heart className="h-4 w-4 text-red-500" />
                                        <span className="text-xs text-slate-500 dark:text-slate-400">BP</span>
                                    </div>
                                    <p className={`text-lg font-bold ${vitalStatusColors[vitals.bloodPressure.status]}`}>
                                        {vitals.bloodPressure.systolic}/{vitals.bloodPressure.diastolic}
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Activity className="h-4 w-4 text-pink-500" />
                                        <span className="text-xs text-slate-500 dark:text-slate-400">Pulse</span>
                                    </div>
                                    <p className={`text-lg font-bold ${vitalStatusColors[vitals.pulse.status]}`}>
                                        {vitals.pulse.value} {vitals.pulse.unit}
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Droplets className="h-4 w-4 text-blue-500" />
                                        <span className="text-xs text-slate-500 dark:text-slate-400">SpO2</span>
                                    </div>
                                    <p className={`text-lg font-bold ${vitalStatusColors[vitals.spO2.status]}`}>
                                        {vitals.spO2.value}{vitals.spO2.unit}
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Scale className="h-4 w-4 text-amber-500" />
                                        <span className="text-xs text-slate-500 dark:text-slate-400">Weight</span>
                                    </div>
                                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                                        {vitals.weight.value} {vitals.weight.unit}
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Ruler className="h-4 w-4 text-green-500" />
                                        <span className="text-xs text-slate-500 dark:text-slate-400">BMI</span>
                                    </div>
                                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                                        {vitals.bmi.value}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Visit History */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <History className="h-5 w-5 text-purple-500" />
                                Visit History
                            </h3>
                        </div>
                        <div className="card-body space-y-2">
                            {visitHistory.map((visit, index) => (
                                <div key={index} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-sm font-medium text-slate-900 dark:text-white">{visit.complaint}</span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">{visit.date}</span>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                        Dx: {visit.diagnosis} | {visit.doctor}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Middle & Right Columns - Clinical Notes */}
                <div className="xl:col-span-2 space-y-6">
                    {/* Clinical Notes */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <Clipboard className="h-5 w-5 text-blue-500" />
                                Clinical Notes <span className="text-red-500">*</span>
                            </h3>
                        </div>
                        <div className="card-body">
                            <textarea
                                placeholder="Enter clinical findings, examination notes, observations..."
                                className={`input min-h-[150px] resize-none ${validationErrors.clinicalNotes ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/10' : ''}`}
                                value={clinicalNotes}
                                onChange={(e) => {
                                    setClinicalNotes(e.target.value);
                                    if (validationErrors.clinicalNotes) {
                                        setValidationErrors(prev => ({ ...prev, clinicalNotes: undefined }));
                                    }
                                }}
                            />
                            {validationErrors.clinicalNotes && (
                                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {validationErrors.clinicalNotes}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Diagnosis */}
                    <div className={`card ${validationErrors.diagnosis ? 'ring-2 ring-red-300 dark:ring-red-600' : ''}`}>
                        <div className="card-header">
                            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <Stethoscope className="h-5 w-5 text-green-500" />
                                Diagnosis <span className="text-red-500">*</span>
                            </h3>
                        </div>
                        <div className="card-body space-y-4">
                            {validationErrors.diagnosis && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                    <span className="text-sm text-red-600 dark:text-red-400">{validationErrors.diagnosis}</span>
                                </div>
                            )}
                            {/* Selected Diagnoses */}
                            {selectedDiagnoses.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {selectedDiagnoses.map((d, i) => (
                                        <span key={i} className="badge bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 flex items-center gap-1">
                                            {d}
                                            <button onClick={() => removeDiagnosis(d)} className="hover:text-red-500">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                            
                            {/* Custom Diagnosis Input */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Enter diagnosis or ICD code..."
                                    className="input flex-1"
                                    value={diagnosis}
                                    onChange={(e) => setDiagnosis(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && diagnosis.trim()) {
                                            addDiagnosis(diagnosis.trim());
                                            setDiagnosis('');
                                        }
                                    }}
                                />
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => {
                                        if (diagnosis.trim()) {
                                            addDiagnosis(diagnosis.trim());
                                            setDiagnosis('');
                                        }
                                    }}
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Common Diagnoses */}
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Quick Add:</p>
                                <div className="flex flex-wrap gap-2">
                                    {commonDiagnoses.map((d, i) => (
                                        <button
                                            key={i}
                                            onClick={() => addDiagnosis(d)}
                                            className={`text-xs px-2 py-1 rounded border transition-colors ${
                                                selectedDiagnoses.includes(d)
                                                    ? 'bg-green-100 dark:bg-green-500/20 border-green-300 dark:border-green-500/30 text-green-700 dark:text-green-400'
                                                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-green-400 dark:hover:border-green-500'
                                            }`}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Investigations */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <FileText className="h-5 w-5 text-amber-500" />
                                Investigations
                            </h3>
                        </div>
                        <div className="card-body space-y-4">
                            {/* Selected Investigations */}
                            {investigations.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {investigations.map((inv, i) => (
                                        <span key={i} className="badge bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center gap-1">
                                            {inv}
                                            <button onClick={() => removeInvestigation(inv)} className="hover:text-red-500">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                            
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Add investigation (CBC, X-Ray, etc.)..."
                                    className="input flex-1"
                                    value={newInvestigation}
                                    onChange={(e) => setNewInvestigation(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') addInvestigation();
                                    }}
                                />
                                <button className="btn btn-primary" onClick={addInvestigation}>
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Quick Add Investigations */}
                            <div className="flex flex-wrap gap-2">
                                {['CBC', 'Blood Sugar', 'Lipid Profile', 'Thyroid Profile', 'Urine R/M', 'Chest X-Ray', 'ECG', 'USG Abdomen'].map((inv, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            if (!investigations.includes(inv)) {
                                                setInvestigations([...investigations, inv]);
                                            }
                                        }}
                                        className={`text-xs px-2 py-1 rounded border transition-colors ${
                                            investigations.includes(inv)
                                                ? 'bg-amber-100 dark:bg-amber-500/20 border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-400'
                                                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-amber-400 dark:hover:border-amber-500'
                                        }`}
                                    >
                                        {inv}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Follow Up & Actions */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="font-semibold text-slate-900 dark:text-white">Follow Up & Actions</h3>
                        </div>
                        <div className="card-body">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Follow-up After
                                    </label>
                                    <select 
                                        className="input"
                                        value={followUpDays}
                                        onChange={(e) => setFollowUpDays(e.target.value)}
                                    >
                                        <option value="3">3 Days</option>
                                        <option value="7">7 Days</option>
                                        <option value="14">14 Days</option>
                                        <option value="30">1 Month</option>
                                        <option value="0">No Follow-up</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2 flex items-end gap-3">
                                    <button className="btn btn-secondary flex items-center gap-2 flex-1">
                                        <Pill className="h-4 w-4" />
                                        Add Prescription
                                    </button>
                                    <button className="btn btn-secondary flex items-center gap-2 flex-1">
                                        <ChevronRight className="h-4 w-4" />
                                        Refer Patient
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
                    <div className="card max-w-md w-full p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Consultation Completed!</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">
                            The consultation for {currentPatient.name} has been saved successfully.
                        </p>
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mb-6 text-left">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div><span className="text-slate-500">Diagnosis:</span></div>
                                <div className="font-medium text-slate-900 dark:text-white">{selectedDiagnoses.join(', ')}</div>
                                <div><span className="text-slate-500">Follow-up:</span></div>
                                <div className="font-medium text-slate-900 dark:text-white">
                                    {followUpDays === '0' ? 'No follow-up' : `${followUpDays} days`}
                                </div>
                                {investigations.length > 0 && (
                                    <>
                                        <div><span className="text-slate-500">Investigations:</span></div>
                                        <div className="font-medium text-slate-900 dark:text-white">{investigations.length} ordered</div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowSuccess(false)}
                                className="flex-1 btn btn-secondary"
                            >
                                Close
                            </button>
                            <button 
                                onClick={() => {
                                    setShowSuccess(false);
                                    // Reset form for next patient
                                    setClinicalNotes('');
                                    setSelectedDiagnoses([]);
                                    setInvestigations([]);
                                    setFollowUpDays('7');
                                }}
                                className="flex-1 btn btn-primary"
                            >
                                Next Patient
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
