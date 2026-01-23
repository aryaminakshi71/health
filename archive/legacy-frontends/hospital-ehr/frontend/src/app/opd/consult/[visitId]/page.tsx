'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Printer, Mic, MicOff, Plus, Trash2, Stethoscope, Pill, FileText, Activity } from 'lucide-react';

// Mock patient data
const mockPatient = {
    id: '1',
    name: 'Rahul Sharma',
    age: 32,
    gender: 'Male',
    phone: '9876543210',
    bloodGroup: 'O+',
    allergies: 'Penicillin',
    lastVisit: '2024-11-15',
};

const commonDiagnoses = [
    'Acute Upper Respiratory Infection',
    'Viral Fever',
    'Gastroenteritis',
    'Hypertension',
    'Type 2 Diabetes Mellitus',
    'Migraine',
    'Allergic Rhinitis',
    'Lower Back Pain',
];

const commonMedicines = [
    { name: 'Paracetamol 500mg', dosage: '1-0-1', duration: '3 days' },
    { name: 'Azithromycin 500mg', dosage: '1-0-0', duration: '3 days' },
    { name: 'Pantoprazole 40mg', dosage: '1-0-0', duration: '7 days' },
    { name: 'Cetirizine 10mg', dosage: '0-0-1', duration: '5 days' },
    { name: 'Amoxicillin 500mg', dosage: '1-1-1', duration: '5 days' },
];

export default function ConsultationPage() {
    const params = useParams();
    const router = useRouter();
    const [isRecording, setIsRecording] = useState(false);
    const [activeTab, setActiveTab] = useState('vitals');

    // Form states
    const [vitals, setVitals] = useState({
        bp: '120/80',
        pulse: '78',
        temp: '98.6',
        spo2: '98',
        weight: '72',
        height: '175',
    });

    const [clinicalNotes, setClinicalNotes] = useState({
        chiefComplaint: 'Fever and headache for 2 days',
        history: 'Patient reports fever with chills, headache, and body ache. No cough or cold. No vomiting.',
        examination: 'General condition: Fair. Throat: Mild congestion. Chest: Clear. Abdomen: Soft, non-tender.',
        diagnosis: '',
    });

    const [prescriptions, setPrescriptions] = useState<Array<{ name: string, dosage: string, duration: string, instructions: string }>>([]);
    const [labOrders, setLabOrders] = useState<string[]>([]);

    const addPrescription = (med?: typeof commonMedicines[0]) => {
        if (med) {
            setPrescriptions([...prescriptions, { ...med, instructions: 'After food' }]);
        } else {
            setPrescriptions([...prescriptions, { name: '', dosage: '', duration: '', instructions: '' }]);
        }
    };

    const removePrescription = (index: number) => {
        setPrescriptions(prescriptions.filter((_, i) => i !== index));
    };

    const printPrescription = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Prescription - ${mockPatient.name}</title>
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                        .header { display: flex; justify-content: space-between; border-bottom: 3px solid #1e40af; padding-bottom: 20px; margin-bottom: 20px; }
                        .hospital { color: #1e40af; }
                        .hospital h1 { font-size: 24px; margin-bottom: 5px; }
                        .hospital p { font-size: 12px; color: #666; }
                        .rx { font-size: 48px; color: #1e40af; font-weight: bold; }
                        .patient-info { background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
                        .patient-info div { font-size: 13px; }
                        .patient-info label { color: #666; font-size: 11px; display: block; }
                        .patient-info span { font-weight: 600; }
                        .vitals { display: flex; gap: 20px; margin-bottom: 20px; flex-wrap: wrap; }
                        .vital { background: #eff6ff; padding: 10px 15px; border-radius: 6px; text-align: center; }
                        .vital-value { font-size: 18px; font-weight: bold; color: #1e40af; }
                        .vital-label { font-size: 10px; color: #666; }
                        .section { margin-bottom: 20px; }
                        .section-title { font-size: 14px; font-weight: 600; color: #1e40af; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
                        .diagnosis { background: #fef3c7; padding: 10px 15px; border-radius: 6px; font-weight: 500; }
                        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                        th { background: #1e40af; color: white; padding: 10px; text-align: left; font-size: 12px; }
                        td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
                        .footer { margin-top: 40px; display: flex; justify-content: space-between; }
                        .signature { text-align: right; }
                        .signature-line { border-top: 1px solid #333; width: 200px; margin-top: 60px; padding-top: 5px; }
                        @media print { body { padding: 20px; } }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="hospital">
                            <h1>Apollo City Hospital</h1>
                            <p>123 Health Avenue, Mumbai - 400001</p>
                            <p>Tel: 022-12345678 | Email: info@apollocity.com</p>
                        </div>
                        <div class="rx">℞</div>
                    </div>
                    
                    <div class="patient-info">
                        <div><label>Patient Name</label><span>${mockPatient.name}</span></div>
                        <div><label>Age / Gender</label><span>${mockPatient.age} yrs / ${mockPatient.gender}</span></div>
                        <div><label>Date</label><span>${new Date().toLocaleDateString('en-IN')}</span></div>
                        <div><label>Blood Group</label><span>${mockPatient.bloodGroup}</span></div>
                        <div><label>Phone</label><span>${mockPatient.phone}</span></div>
                        <div><label>Allergies</label><span style="color: #dc2626;">${mockPatient.allergies || 'None'}</span></div>
                    </div>
                    
                    <div class="vitals">
                        <div class="vital"><div class="vital-value">${vitals.bp}</div><div class="vital-label">BP (mmHg)</div></div>
                        <div class="vital"><div class="vital-value">${vitals.pulse}</div><div class="vital-label">Pulse (bpm)</div></div>
                        <div class="vital"><div class="vital-value">${vitals.temp}°F</div><div class="vital-label">Temperature</div></div>
                        <div class="vital"><div class="vital-value">${vitals.spo2}%</div><div class="vital-label">SpO2</div></div>
                        <div class="vital"><div class="vital-value">${vitals.weight} kg</div><div class="vital-label">Weight</div></div>
                    </div>
                    
                    <div class="section">
                        <div class="section-title">Chief Complaint</div>
                        <p>${clinicalNotes.chiefComplaint}</p>
                    </div>
                    
                    <div class="section">
                        <div class="section-title">Diagnosis</div>
                        <div class="diagnosis">${clinicalNotes.diagnosis || 'Viral Fever'}</div>
                    </div>
                    
                    <div class="section">
                        <div class="section-title">Prescription</div>
                        <table>
                            <thead>
                                <tr><th>#</th><th>Medicine</th><th>Dosage</th><th>Duration</th><th>Instructions</th></tr>
                            </thead>
                            <tbody>
                                ${prescriptions.map((p, i) => `
                                    <tr>
                                        <td>${i + 1}</td>
                                        <td><strong>${p.name}</strong></td>
                                        <td>${p.dosage}</td>
                                        <td>${p.duration}</td>
                                        <td>${p.instructions}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="footer">
                        <div>
                            <p style="font-size: 12px; color: #666;">Follow up: After 3 days or as needed</p>
                        </div>
                        <div class="signature">
                            <div class="signature-line">
                                <strong>Dr. Patel</strong><br/>
                                <span style="font-size: 11px; color: #666;">MBBS, MD (General Medicine)</span><br/>
                                <span style="font-size: 11px; color: #666;">Reg. No: MH12345</span>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    const tabs = [
        { id: 'vitals', label: 'Vitals', icon: Activity },
        { id: 'notes', label: 'Clinical Notes', icon: FileText },
        { id: 'prescription', label: 'Prescription', icon: Pill },
        { id: 'labs', label: 'Lab Orders', icon: Stethoscope },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Consultation</h1>
                        <p className="text-gray-500">Patient ID: {params.visitId}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={printPrescription}>
                        <Printer className="h-4 w-4 mr-2" /> Print Rx
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700">
                        <Save className="h-4 w-4 mr-2" /> Save & Complete
                    </Button>
                </div>
            </div>

            {/* Patient Card */}
            <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
                                {mockPatient.name.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{mockPatient.name}</h2>
                                <p className="text-blue-100">{mockPatient.age} yrs • {mockPatient.gender} • {mockPatient.bloodGroup}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-blue-100">Last Visit</p>
                            <p className="font-medium">{mockPatient.lastVisit}</p>
                            {mockPatient.allergies && (
                                <p className="mt-2 px-3 py-1 bg-red-500/80 rounded-full text-sm">
                                    ⚠️ Allergic: {mockPatient.allergies}
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <div className="flex gap-2 border-b">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                    </button>
                ))}

                {/* Voice Recording Toggle */}
                <div className="ml-auto flex items-center gap-2 px-4">
                    <Button
                        variant={isRecording ? 'destructive' : 'outline'}
                        size="sm"
                        onClick={() => setIsRecording(!isRecording)}
                    >
                        {isRecording ? <MicOff className="h-4 w-4 mr-1" /> : <Mic className="h-4 w-4 mr-1" />}
                        {isRecording ? 'Stop' : 'Voice'}
                    </Button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === 'vitals' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Vital Signs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                {[
                                    { key: 'bp', label: 'Blood Pressure', unit: 'mmHg', placeholder: '120/80' },
                                    { key: 'pulse', label: 'Pulse Rate', unit: 'bpm', placeholder: '72' },
                                    { key: 'temp', label: 'Temperature', unit: '°F', placeholder: '98.6' },
                                    { key: 'spo2', label: 'SpO2', unit: '%', placeholder: '98' },
                                    { key: 'weight', label: 'Weight', unit: 'kg', placeholder: '70' },
                                    { key: 'height', label: 'Height', unit: 'cm', placeholder: '175' },
                                ].map((vital) => (
                                    <div key={vital.key} className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">{vital.label}</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={vitals[vital.key as keyof typeof vitals]}
                                                onChange={(e) => setVitals({ ...vitals, [vital.key]: e.target.value })}
                                                placeholder={vital.placeholder}
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{vital.unit}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'notes' && (
                    <div className="grid gap-4">
                        <Card>
                            <CardHeader className="py-3">
                                <CardTitle className="text-base">Chief Complaint</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <textarea
                                    value={clinicalNotes.chiefComplaint}
                                    onChange={(e) => setClinicalNotes({ ...clinicalNotes, chiefComplaint: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                                    placeholder="Enter chief complaint..."
                                />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="py-3">
                                <CardTitle className="text-base">History of Present Illness</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <textarea
                                    value={clinicalNotes.history}
                                    onChange={(e) => setClinicalNotes({ ...clinicalNotes, history: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                                    placeholder="Enter history..."
                                />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="py-3">
                                <CardTitle className="text-base">Examination Findings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <textarea
                                    value={clinicalNotes.examination}
                                    onChange={(e) => setClinicalNotes({ ...clinicalNotes, examination: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                                    placeholder="Enter examination findings..."
                                />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="py-3">
                                <CardTitle className="text-base">Diagnosis</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <input
                                    type="text"
                                    value={clinicalNotes.diagnosis}
                                    onChange={(e) => setClinicalNotes({ ...clinicalNotes, diagnosis: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter diagnosis..."
                                    list="diagnoses"
                                />
                                <datalist id="diagnoses">
                                    {commonDiagnoses.map((d) => <option key={d} value={d} />)}
                                </datalist>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {commonDiagnoses.slice(0, 4).map((d) => (
                                        <button
                                            key={d}
                                            onClick={() => setClinicalNotes({ ...clinicalNotes, diagnosis: d })}
                                            className="px-3 py-1 text-xs bg-gray-100 hover:bg-blue-100 rounded-full transition-colors"
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeTab === 'prescription' && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Prescription</CardTitle>
                            <Button size="sm" onClick={() => addPrescription()}>
                                <Plus className="h-4 w-4 mr-1" /> Add Medicine
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Quick Add */}
                                <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-500 w-full mb-2">Quick Add:</span>
                                    {commonMedicines.map((med) => (
                                        <button
                                            key={med.name}
                                            onClick={() => addPrescription(med)}
                                            className="px-3 py-1.5 text-xs bg-white border hover:border-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            {med.name}
                                        </button>
                                    ))}
                                </div>

                                {/* Prescription List */}
                                {prescriptions.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <Pill className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                        <p>No medicines added yet</p>
                                        <p className="text-sm">Click "Add Medicine" or use Quick Add above</p>
                                    </div>
                                ) : (
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left text-sm text-gray-500 border-b">
                                                <th className="pb-2">#</th>
                                                <th className="pb-2">Medicine</th>
                                                <th className="pb-2">Dosage</th>
                                                <th className="pb-2">Duration</th>
                                                <th className="pb-2">Instructions</th>
                                                <th className="pb-2"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {prescriptions.map((p, index) => (
                                                <tr key={index} className="border-b">
                                                    <td className="py-3">{index + 1}</td>
                                                    <td className="py-3 font-medium">{p.name}</td>
                                                    <td className="py-3">{p.dosage}</td>
                                                    <td className="py-3">{p.duration}</td>
                                                    <td className="py-3 text-gray-500">{p.instructions}</td>
                                                    <td className="py-3">
                                                        <Button size="sm" variant="ghost" onClick={() => removePrescription(index)}>
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'labs' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Lab Orders</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {['CBC', 'LFT', 'KFT', 'Blood Sugar', 'Lipid Profile', 'Thyroid', 'Urine R/M', 'X-Ray Chest', 'ECG', 'USG Abdomen'].map((test) => (
                                    <label key={test} className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={labOrders.includes(test)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setLabOrders([...labOrders, test]);
                                                } else {
                                                    setLabOrders(labOrders.filter(t => t !== test));
                                                }
                                            }}
                                            className="h-4 w-4 text-blue-600"
                                        />
                                        <span className="text-sm">{test}</span>
                                    </label>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
