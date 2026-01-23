'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserPlus, FileText, ClipboardList, Calendar } from 'lucide-react';
import Link from 'next/link';

const departments = [
    'General Medicine',
    'Cardiology',
    'Orthopedics',
    'Neurology',
    'Pediatrics',
    'Obstetrics & Gynecology',
    'Dermatology',
    'ENT',
    'Ophthalmology',
    'Psychiatry',
    'Nephrology',
    'Urology',
    'Gastroenterology',
    'Pulmonology',
    'Endocrinology',
];

const doctors = [
    { id: 'D1', name: 'Dr. Rajesh Patel', department: 'General Medicine', specialization: 'MD Medicine' },
    { id: 'D2', name: 'Dr. Sunita Mehta', department: 'Cardiology', specialization: 'DM Cardiology' },
    { id: 'D3', name: 'Dr. Amit Singh', department: 'Orthopedics', specialization: 'MS Orthopedics' },
    { id: 'D4', name: 'Dr. Priya Reddy', department: 'Neurology', specialization: 'DM Neurology' },
    { id: 'D5', name: 'Dr. Vikram Kumar', department: 'Pediatrics', specialization: 'MD Pediatrics' },
    { id: 'D6', name: 'Dr. Anjali Sharma', department: 'Obstetrics & Gynecology', specialization: 'MS OBG' },
    { id: 'D7', name: 'Dr. Sanjay Gupta', department: 'Dermatology', specialization: 'MD Dermatology' },
    { id: 'D8', name: 'Dr. Meera Joshi', department: 'ENT', specialization: 'MS ENT' },
];

const visitTypes = [
    { value: 'NEW', label: 'New Visit', fee: 500 },
    { value: 'FOLLOWUP', label: 'Follow-up', fee: 300 },
    { value: 'EMERGENCY', label: 'Emergency', fee: 800 },
];

export default function OPDRegisterPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        patientType: 'NEW',
        patientId: '',
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        age: '',
        gender: '',
        address: '',
        city: '',
        pincode: '',
        emergencyName: '',
        emergencyPhone: '',
        department: '',
        doctor: '',
        visitType: 'NEW',
        symptoms: '',
        priority: 'ROUTINE',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const generateToken = () => {
        const prefix = formData.visitType === 'EMERGENCY' ? 'E' : formData.visitType === 'FOLLOWUP' ? 'F' : 'A';
        const num = Math.floor(Math.random() * 900) + 100;
        return `${prefix}${num}`;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (step < 3) {
            setStep(step + 1);
        } else {
            const token = generateToken();
            alert(`Patient registered successfully! Token Number: ${token}`);
        }
    };

    const selectedDoctor = doctors.find(d => d.id === formData.doctor);
    const selectedVisitType = visitTypes.find(v => v.value === formData.visitType);

    return (
        <div className="min-h-screen bg-slate-900 p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/opd">
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white">OPD Registration</h1>
                    <p className="text-slate-400">Register new outpatient visit</p>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-4">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                            step >= s ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'
                        }`}>
                            {s}
                        </div>
                        {s < 3 && (
                            <div className={`w-20 h-1 mx-2 ${
                                step > s ? 'bg-blue-600' : 'bg-slate-700'
                            }`} />
                        )}
                    </div>
                ))}
            </div>

            <div className="flex gap-6">
                {/* Main Form */}
                <div className="flex-1">
                    <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl border border-slate-700 p-6 space-y-6">
                        {step === 1 && (
                            <>
                                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                    <UserPlus className="h-5 w-5 text-blue-500" />
                                    Patient Information
                                </h2>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm text-slate-400 mb-1">Patient Type</label>
                                        <div className="flex gap-3">
                                            {['NEW', 'EXISTING'].map((type) => (
                                                <label key={type} className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="patientType"
                                                        value={type}
                                                        checked={formData.patientType === type}
                                                        onChange={handleInputChange}
                                                        className="accent-blue-500"
                                                    />
                                                    <span className="text-slate-300">{type === 'NEW' ? 'New Patient' : 'Existing Patient'}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {formData.patientType === 'EXISTING' && (
                                        <div className="col-span-2">
                                            <label className="block text-sm text-slate-400 mb-1">Patient ID / MRN</label>
                                            <input
                                                type="text"
                                                name="patientId"
                                                value={formData.patientId}
                                                onChange={handleInputChange}
                                                placeholder="Enter patient ID"
                                                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">First Name *</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Last Name *</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Phone *</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Age *</label>
                                        <input
                                            type="number"
                                            name="age"
                                            value={formData.age}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Gender *</label>
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="M">Male</option>
                                            <option value="F">Female</option>
                                            <option value="O">Other</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm text-slate-400 mb-1">Address</label>
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            rows={2}
                                            className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Pincode</label>
                                        <input
                                            type="text"
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                    <ClipboardList className="h-5 w-5 text-blue-500" />
                                    Visit Details
                                </h2>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Department *</label>
                                        <select
                                            name="department"
                                            value={formData.department}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select Department</option>
                                            {departments.map((dept) => (
                                                <option key={dept} value={dept}>{dept}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Doctor *</label>
                                        <select
                                            name="doctor"
                                            value={formData.doctor}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select Doctor</option>
                                            {doctors
                                                .filter(d => !formData.department || d.department === formData.department)
                                                .map((doc) => (
                                                    <option key={doc.id} value={doc.id}>{doc.name} - {doc.specialization}</option>
                                                ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Visit Type *</label>
                                        <select
                                            name="visitType"
                                            value={formData.visitType}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            {visitTypes.map((type) => (
                                                <option key={type.value} value={type.value}>{type.label} (₹{type.fee})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Priority</label>
                                        <select
                                            name="priority"
                                            value={formData.priority}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="ROUTINE">Routine</option>
                                            <option value="URGENT">Urgent</option>
                                            <option value="STAT">STAT (Emergency)</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm text-slate-400 mb-1">Chief Complaints / Symptoms</label>
                                        <textarea
                                            name="symptoms"
                                            value={formData.symptoms}
                                            onChange={handleInputChange}
                                            rows={3}
                                            placeholder="Describe the patient's main complaints or symptoms..."
                                            className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {step === 3 && (
                            <>
                                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-blue-500" />
                                    Emergency Contact & Review
                                </h2>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm text-slate-400 mb-1">Emergency Contact Name</label>
                                        <input
                                            type="text"
                                            name="emergencyName"
                                            value={formData.emergencyName}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm text-slate-400 mb-1">Emergency Contact Phone</label>
                                        <input
                                            type="tel"
                                            name="emergencyPhone"
                                            value={formData.emergencyPhone}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="col-span-2 mt-4">
                                        <h3 className="text-lg font-medium text-white mb-3">Review Registration</h3>
                                        <div className="bg-slate-700/50 rounded-lg p-4 space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Patient Name:</span>
                                                <span className="text-white">{formData.firstName} {formData.lastName}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Phone:</span>
                                                <span className="text-white">{formData.phone}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Age/Gender:</span>
                                                <span className="text-white">{formData.age} yrs / {formData.gender}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Department:</span>
                                                <span className="text-white">{formData.department}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Doctor:</span>
                                                <span className="text-white">{selectedDoctor?.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Visit Type:</span>
                                                <span className="text-white">{selectedVisitType?.label} (₹{selectedVisitType?.fee})</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between pt-4 border-t border-slate-700">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setStep(step - 1)}
                                disabled={step === 1}
                            >
                                Previous
                            </Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                {step === 3 ? 'Complete Registration' : 'Next'}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Summary Sidebar */}
                <div className="w-80">
                    <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 sticky top-8">
                        <h3 className="font-semibold text-white mb-4">Registration Summary</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Step</span>
                                <span className="text-white">3 of 3</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Patient Type</span>
                                <span className="text-white">{formData.patientType === 'NEW' ? 'New' : 'Existing'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Visit Fee</span>
                                <span className="text-white">₹{selectedVisitType?.fee || 0}</span>
                            </div>
                            {selectedDoctor && (
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Doctor</span>
                                    <span className="text-white text-right">{selectedDoctor.name}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-slate-400">Priority</span>
                                <span className={`px-2 py-0.5 rounded text-xs ${
                                    formData.priority === 'STAT' ? 'bg-red-500/20 text-red-400' :
                                    formData.priority === 'URGENT' ? 'bg-amber-500/20 text-amber-400' :
                                    'bg-slate-600 text-slate-300'
                                }`}>
                                    {formData.priority}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
