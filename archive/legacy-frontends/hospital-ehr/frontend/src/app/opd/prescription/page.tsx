'use client';

import React, { useState } from 'react';
import {
    Pill,
    Plus,
    Trash2,
    Search,
    Printer,
    Save,
    Send,
    Clock,
    AlertTriangle,
    User,
    Calendar,
    FileText,
    Copy,
    ChevronDown,
    Info,
    Check
} from 'lucide-react';

// Mock patient data
const currentPatient = {
    id: 'P001',
    name: 'Rahul Sharma',
    age: 32,
    gender: 'Male',
    phone: '9876543210',
    token: 'A001',
    diagnosis: ['Viral Fever', 'Upper Respiratory Infection'],
    allergies: ['Penicillin', 'Sulfa drugs'],
};

// Mock medicine database
const medicineDatabase = [
    { id: 'm1', name: 'Paracetamol 500mg', category: 'Analgesic', genericName: 'Acetaminophen' },
    { id: 'm2', name: 'Azithromycin 500mg', category: 'Antibiotic', genericName: 'Azithromycin' },
    { id: 'm3', name: 'Cetirizine 10mg', category: 'Antihistamine', genericName: 'Cetirizine' },
    { id: 'm4', name: 'Pantoprazole 40mg', category: 'PPI', genericName: 'Pantoprazole' },
    { id: 'm5', name: 'Amoxicillin 500mg', category: 'Antibiotic', genericName: 'Amoxicillin', hasAllergy: true },
    { id: 'm6', name: 'Montelukast 10mg', category: 'Leukotriene Antagonist', genericName: 'Montelukast' },
    { id: 'm7', name: 'Dolo 650', category: 'Analgesic', genericName: 'Paracetamol' },
    { id: 'm8', name: 'Crocin Advance', category: 'Analgesic', genericName: 'Paracetamol' },
    { id: 'm9', name: 'ORS Powder', category: 'Electrolyte', genericName: 'Oral Rehydration Salts' },
    { id: 'm10', name: 'Vitamin C 500mg', category: 'Supplement', genericName: 'Ascorbic Acid' },
];

interface PrescriptionItem {
    id: string;
    medicine: string;
    dosage: string;
    frequency: string;
    duration: string;
    timing: string;
    instructions: string;
    quantity: number;
}

const frequencyOptions = [
    { value: 'OD', label: 'Once Daily (OD)' },
    { value: 'BD', label: 'Twice Daily (BD)' },
    { value: 'TDS', label: 'Three Times Daily (TDS)' },
    { value: 'QID', label: 'Four Times Daily (QID)' },
    { value: 'SOS', label: 'As Needed (SOS)' },
    { value: 'HS', label: 'At Bedtime (HS)' },
    { value: 'STAT', label: 'Immediately (STAT)' },
];

const durationOptions = [
    { value: '3 days', label: '3 Days' },
    { value: '5 days', label: '5 Days' },
    { value: '7 days', label: '7 Days' },
    { value: '10 days', label: '10 Days' },
    { value: '14 days', label: '14 Days' },
    { value: '1 month', label: '1 Month' },
    { value: '3 months', label: '3 Months' },
];

const timingOptions = [
    { value: 'Before Food', label: 'Before Food' },
    { value: 'After Food', label: 'After Food' },
    { value: 'With Food', label: 'With Food' },
    { value: 'Empty Stomach', label: 'Empty Stomach' },
    { value: 'Any Time', label: 'Any Time' },
];

const prescriptionTemplates = [
    { name: 'Fever & Cold', medicines: ['Paracetamol 500mg', 'Cetirizine 10mg', 'Vitamin C 500mg'] },
    { name: 'Gastritis', medicines: ['Pantoprazole 40mg', 'Domperidone 10mg'] },
    { name: 'Respiratory Infection', medicines: ['Azithromycin 500mg', 'Montelukast 10mg', 'Cetirizine 10mg'] },
];

export default function OPDPrescriptionPage() {
    const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([
        { id: '1', medicine: 'Paracetamol 500mg', dosage: '1 tablet', frequency: 'TDS', duration: '5 days', timing: 'After Food', instructions: '', quantity: 15 },
        { id: '2', medicine: 'Cetirizine 10mg', dosage: '1 tablet', frequency: 'OD', duration: '5 days', timing: 'At Bedtime', instructions: 'May cause drowsiness', quantity: 5 },
    ]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showMedicineSearch, setShowMedicineSearch] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState<typeof medicineDatabase[0] | null>(null);
    const [advice, setAdvice] = useState('Rest well, drink plenty of fluids, avoid cold drinks.');

    const filteredMedicines = medicineDatabase.filter(m => 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.genericName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const addMedicine = (medicine: typeof medicineDatabase[0]) => {
        const newItem: PrescriptionItem = {
            id: Date.now().toString(),
            medicine: medicine.name,
            dosage: '1 tablet',
            frequency: 'OD',
            duration: '5 days',
            timing: 'After Food',
            instructions: '',
            quantity: 5,
        };
        setPrescriptionItems([...prescriptionItems, newItem]);
        setSearchQuery('');
        setShowMedicineSearch(false);
    };

    const removeMedicine = (id: string) => {
        setPrescriptionItems(prescriptionItems.filter(item => item.id !== id));
    };

    const updatePrescriptionItem = (id: string, field: keyof PrescriptionItem, value: string | number) => {
        setPrescriptionItems(prescriptionItems.map(item => 
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const applyTemplate = (template: typeof prescriptionTemplates[0]) => {
        const newItems = template.medicines.map((medicineName, index) => ({
            id: `template-${Date.now()}-${index}`,
            medicine: medicineName,
            dosage: '1 tablet',
            frequency: 'OD',
            duration: '5 days',
            timing: 'After Food',
            instructions: '',
            quantity: 5,
        }));
        setPrescriptionItems([...prescriptionItems, ...newItems]);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">Prescription</h1>
                    <p className="text-slate-600 dark:text-slate-400">Create and manage patient prescriptions</p>
                </div>
                <div className="flex gap-3">
                    <button className="btn btn-secondary flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        Save Draft
                    </button>
                    <button className="btn btn-secondary flex items-center gap-2">
                        <Printer className="h-4 w-4" />
                        Print
                    </button>
                    <button className="btn btn-primary flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Send to Pharmacy
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Left Sidebar - Patient Info */}
                <div className="space-y-4">
                    {/* Patient Card */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <User className="h-5 w-5 text-blue-500" />
                                Patient
                            </h3>
                        </div>
                        <div className="card-body space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                    {currentPatient.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">{currentPatient.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{currentPatient.age} yrs, {currentPatient.gender}</p>
                                </div>
                            </div>
                            <div className="h-px bg-slate-200 dark:bg-slate-700" />
                            <div>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">DIAGNOSIS</p>
                                <div className="flex flex-wrap gap-1">
                                    {currentPatient.diagnosis.map((d, i) => (
                                        <span key={i} className="badge bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-xs">
                                            {d}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            {currentPatient.allergies.length > 0 && (
                                <div className="p-2 rounded bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30">
                                    <div className="flex items-center gap-1 mb-1">
                                        <AlertTriangle className="h-3 w-3 text-red-500" />
                                        <p className="text-xs font-medium text-red-600 dark:text-red-400">ALLERGIES</p>
                                    </div>
                                    <p className="text-xs text-red-600 dark:text-red-400">{currentPatient.allergies.join(', ')}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Templates */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <Copy className="h-5 w-5 text-purple-500" />
                                Quick Templates
                            </h3>
                        </div>
                        <div className="card-body space-y-2">
                            {prescriptionTemplates.map((template, index) => (
                                <button
                                    key={index}
                                    onClick={() => applyTemplate(template)}
                                    className="w-full text-left p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-500 transition-colors"
                                >
                                    <p className="font-medium text-sm text-slate-900 dark:text-white">{template.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{template.medicines.length} medicines</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content - Prescription */}
                <div className="xl:col-span-3 space-y-4">
                    {/* Add Medicine */}
                    <div className="card">
                        <div className="card-body">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search medicine by name or generic name..."
                                    className="input pl-10"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setShowMedicineSearch(e.target.value.length > 0);
                                    }}
                                    onFocus={() => searchQuery.length > 0 && setShowMedicineSearch(true)}
                                />
                                
                                {/* Medicine Search Dropdown */}
                                {showMedicineSearch && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-64 overflow-y-auto z-10">
                                        {filteredMedicines.map((medicine) => (
                                            <button
                                                key={medicine.id}
                                                onClick={() => addMedicine(medicine)}
                                                className={`w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700 last:border-b-0 ${
                                                    medicine.hasAllergy ? 'bg-red-50 dark:bg-red-500/10' : ''
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                                            {medicine.name}
                                                            {medicine.hasAllergy && (
                                                                <span className="badge bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-xs">
                                                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                                                    Allergy Alert
                                                                </span>
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">{medicine.genericName} | {medicine.category}</p>
                                                    </div>
                                                    <Plus className="h-5 w-5 text-blue-500" />
                                                </div>
                                            </button>
                                        ))}
                                        {filteredMedicines.length === 0 && (
                                            <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">No medicines found</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Prescription Items */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <Pill className="h-5 w-5 text-green-500" />
                                Medicines ({prescriptionItems.length})
                            </h3>
                        </div>
                        <div className="card-body space-y-4">
                            {prescriptionItems.length === 0 ? (
                                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                    <Pill className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                    <p>No medicines added yet</p>
                                    <p className="text-sm">Search and add medicines above</p>
                                </div>
                            ) : (
                                prescriptionItems.map((item, index) => (
                                    <div key={item.id} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center">
                                                    {index + 1}
                                                </span>
                                                <h4 className="font-semibold text-slate-900 dark:text-white">{item.medicine}</h4>
                                            </div>
                                            <button 
                                                onClick={() => removeMedicine(item.id)}
                                                className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Dosage</label>
                                                <input
                                                    type="text"
                                                    value={item.dosage}
                                                    onChange={(e) => updatePrescriptionItem(item.id, 'dosage', e.target.value)}
                                                    className="input text-sm py-1.5"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Frequency</label>
                                                <select
                                                    value={item.frequency}
                                                    onChange={(e) => updatePrescriptionItem(item.id, 'frequency', e.target.value)}
                                                    className="input text-sm py-1.5"
                                                >
                                                    {frequencyOptions.map(opt => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Duration</label>
                                                <select
                                                    value={item.duration}
                                                    onChange={(e) => updatePrescriptionItem(item.id, 'duration', e.target.value)}
                                                    className="input text-sm py-1.5"
                                                >
                                                    {durationOptions.map(opt => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Timing</label>
                                                <select
                                                    value={item.timing}
                                                    onChange={(e) => updatePrescriptionItem(item.id, 'timing', e.target.value)}
                                                    className="input text-sm py-1.5"
                                                >
                                                    {timingOptions.map(opt => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Qty</label>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => updatePrescriptionItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                                    className="input text-sm py-1.5"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="mt-3">
                                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Special Instructions</label>
                                            <input
                                                type="text"
                                                placeholder="e.g., Take with plenty of water..."
                                                value={item.instructions}
                                                onChange={(e) => updatePrescriptionItem(item.id, 'instructions', e.target.value)}
                                                className="input text-sm py-1.5"
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Advice Section */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <Info className="h-5 w-5 text-amber-500" />
                                General Advice
                            </h3>
                        </div>
                        <div className="card-body">
                            <textarea
                                placeholder="Diet, lifestyle, precautions, and other instructions..."
                                className="input min-h-[100px] resize-none"
                                value={advice}
                                onChange={(e) => setAdvice(e.target.value)}
                            />
                            <div className="flex flex-wrap gap-2 mt-3">
                                {['Rest well', 'Drink plenty of fluids', 'Avoid cold foods', 'Follow-up if symptoms persist', 'Complete the full course'].map((tip, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setAdvice(prev => prev ? `${prev}, ${tip}` : tip)}
                                        className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        + {tip}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 border-blue-200 dark:border-blue-500/30">
                        <div className="card-body">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{prescriptionItems.length}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Medicines</p>
                                    </div>
                                    <div className="h-8 w-px bg-slate-300 dark:bg-slate-600" />
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                            {prescriptionItems.reduce((acc, item) => acc + item.quantity, 0)}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Total Units</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button className="btn btn-secondary flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Preview
                                    </button>
                                    <button className="btn btn-success flex items-center gap-2">
                                        <Check className="h-4 w-4" />
                                        Finalize Prescription
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
