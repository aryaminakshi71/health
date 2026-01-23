'use client';

import React, { useState } from 'react';
import { Scissors, Calendar, Clock, User, UserCog, Stethoscope, FileText, AlertTriangle, CheckCircle } from 'lucide-react';

const surgeons = [
    { id: 1, name: 'Dr. Sharma', specialty: 'General Surgery', available: true },
    { id: 2, name: 'Dr. Gupta', specialty: 'General Surgery', available: true },
    { id: 3, name: 'Dr. Reddy', specialty: 'Cardiac Surgery', available: false },
    { id: 4, name: 'Dr. Patel', specialty: 'Orthopedics', available: true },
    { id: 5, name: 'Dr. Verma', specialty: 'Gynecology', available: true },
    { id: 6, name: 'Dr. Singh', specialty: 'Neurosurgery', available: true },
];

const anesthetists = [
    { id: 1, name: 'Dr. Mehta', available: true },
    { id: 2, name: 'Dr. Kumar', available: true },
    { id: 3, name: 'Dr. Joshi', available: false },
    { id: 4, name: 'Dr. Agarwal', available: true },
];

const otRooms = [
    { id: 'OT-1', name: 'Main OT 1', type: 'General', available: ['09:00', '11:00', '14:00', '16:00'] },
    { id: 'OT-2', name: 'Main OT 2', type: 'General', available: ['10:00', '13:00', '15:00'] },
    { id: 'OT-3', name: 'Cardiac OT', type: 'Cardiac', available: ['08:00', '14:00'] },
    { id: 'OT-4', name: 'Emergency OT', type: 'Emergency', available: ['Now'] },
    { id: 'OT-5', name: 'Minor OT', type: 'Minor', available: ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'] },
];

const procedures = [
    'Appendectomy',
    'Cholecystectomy',
    'Hernia Repair',
    'Cesarean Section',
    'Hip Replacement',
    'Knee Replacement',
    'CABG',
    'Valve Replacement',
    'Thyroidectomy',
    'Mastectomy',
    'Laparotomy',
    'Craniotomy',
    'Laminectomy',
    'Other',
];

export default function OTBookingPage() {
    const [formData, setFormData] = useState({
        patientId: '',
        patientName: '',
        age: '',
        gender: '',
        procedure: '',
        otherProcedure: '',
        surgeon: '',
        anesthetist: '',
        otRoom: '',
        date: '',
        time: '',
        estimatedDuration: '',
        priority: 'Elective',
        preOpDiagnosis: '',
        specialRequirements: '',
        bloodReserve: false,
        icuRequired: false,
    });

    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Booking submitted:', formData);
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Scissors className="w-7 h-7 text-purple-500" />
                        Book Operation Theatre
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Schedule a new surgery</p>
                </div>
                <div className="flex gap-2">
                    <a href="/ot" className="btn btn-secondary">
                        <Scissors className="w-4 h-4" /> Dashboard
                    </a>
                    <a href="/ot/schedule" className="btn btn-secondary">
                        <Calendar className="w-4 h-4" /> View Schedule
                    </a>
                </div>
            </div>

            {submitted && (
                <div className="alert alert-success">
                    <CheckCircle className="w-5 h-5" />
                    <span>OT booking submitted successfully! Confirmation will be sent shortly.</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Patient Information */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-500" />
                            Patient Information
                        </h2>
                    </div>
                    <div className="card-body space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Patient ID</label>
                                <input
                                    type="text"
                                    name="patientId"
                                    value={formData.patientId}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="Enter patient ID"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Patient Name</label>
                                <input
                                    type="text"
                                    name="patientName"
                                    value={formData.patientName}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="Enter patient name"
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Age</label>
                                <input
                                    type="number"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="Age"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                                <select name="gender" value={formData.gender} onChange={handleChange} className="input" required>
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pre-operative Diagnosis</label>
                            <textarea
                                name="preOpDiagnosis"
                                value={formData.preOpDiagnosis}
                                onChange={handleChange}
                                className="input min-h-[80px]"
                                placeholder="Enter diagnosis details"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Surgery Details */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <Stethoscope className="w-5 h-5 text-green-500" />
                            Surgery Details
                        </h2>
                    </div>
                    <div className="card-body space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Procedure</label>
                            <select name="procedure" value={formData.procedure} onChange={handleChange} className="input" required>
                                <option value="">Select Procedure</option>
                                {procedures.map(proc => (
                                    <option key={proc} value={proc}>{proc}</option>
                                ))}
                            </select>
                        </div>
                        {formData.procedure === 'Other' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Specify Procedure</label>
                                <input
                                    type="text"
                                    name="otherProcedure"
                                    value={formData.otherProcedure}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="Enter procedure name"
                                    required
                                />
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Surgeon</label>
                                <select name="surgeon" value={formData.surgeon} onChange={handleChange} className="input" required>
                                    <option value="">Select Surgeon</option>
                                    {surgeons.map(surgeon => (
                                        <option key={surgeon.id} value={surgeon.name} disabled={!surgeon.available}>
                                            {surgeon.name} - {surgeon.specialty} {!surgeon.available && '(Unavailable)'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Anesthetist</label>
                                <select name="anesthetist" value={formData.anesthetist} onChange={handleChange} className="input" required>
                                    <option value="">Select Anesthetist</option>
                                    {anesthetists.map(anesthetist => (
                                        <option key={anesthetist.id} value={anesthetist.name} disabled={!anesthetist.available}>
                                            {anesthetist.name} {!anesthetist.available && '(Unavailable)'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Estimated Duration (hours)</label>
                            <input
                                type="number"
                                name="estimatedDuration"
                                value={formData.estimatedDuration}
                                onChange={handleChange}
                                className="input"
                                placeholder="Enter estimated duration"
                                min="0.5"
                                step="0.5"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                            <div className="flex gap-4">
                                {['Elective', 'Urgent', 'Emergency'].map(priority => (
                                    <label key={priority} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="priority"
                                            value={priority}
                                            checked={formData.priority === priority}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-purple-600"
                                        />
                                        <span className={`text-sm ${priority === 'Emergency' ? 'text-red-600 dark:text-red-400 font-medium' : priority === 'Urgent' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                            {priority}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scheduling */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-purple-500" />
                            Scheduling
                        </h2>
                    </div>
                    <div className="card-body space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Operation Theatre</label>
                            <select name="otRoom" value={formData.otRoom} onChange={handleChange} className="input" required>
                                <option value="">Select OT Room</option>
                                {otRooms.map(ot => (
                                    <option key={ot.id} value={ot.id}>
                                        {ot.id} - {ot.name} ({ot.type})
                                    </option>
                                ))}
                            </select>
                        </div>
                        {formData.otRoom && (
                            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Available Slots:</p>
                                <div className="flex flex-wrap gap-2">
                                    {otRooms.find(ot => ot.id === formData.otRoom)?.available.map(slot => (
                                        <button
                                            key={slot}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, time: slot }))}
                                            className={`px-3 py-1 rounded-full text-sm ${formData.time === slot ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-purple-100 dark:hover:bg-purple-900/30'}`}
                                        >
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    className="input"
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Time</label>
                                <input
                                    type="time"
                                    name="time"
                                    value={formData.time}
                                    onChange={handleChange}
                                    className="input"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Requirements */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-amber-500" />
                            Additional Requirements
                        </h2>
                    </div>
                    <div className="card-body space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Special Requirements</label>
                            <textarea
                                name="specialRequirements"
                                value={formData.specialRequirements}
                                onChange={handleChange}
                                className="input min-h-[80px]"
                                placeholder="Any special equipment, instruments, or requirements"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="bloodReserve"
                                    checked={formData.bloodReserve}
                                    onChange={handleChange}
                                    className="w-5 h-5 rounded text-purple-600"
                                />
                                <span className="text-slate-700 dark:text-slate-300">Blood Reserve Required</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="icuRequired"
                                    checked={formData.icuRequired}
                                    onChange={handleChange}
                                    className="w-5 h-5 rounded text-purple-600"
                                />
                                <span className="text-slate-700 dark:text-slate-300">Post-operative ICU Required</span>
                            </label>
                        </div>

                        {formData.priority === 'Emergency' && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-red-800 dark:text-red-300">Emergency Surgery</p>
                                    <p className="text-xs text-red-600 dark:text-red-400">This booking will be prioritized and may override scheduled surgeries.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="lg:col-span-2">
                    <div className="card p-4">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Please verify all details before submitting. The booking will be confirmed after approval.
                            </p>
                            <div className="flex gap-3">
                                <button type="button" className="btn btn-secondary">
                                    Save as Draft
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    <Scissors className="w-4 h-4" /> Submit Booking
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
