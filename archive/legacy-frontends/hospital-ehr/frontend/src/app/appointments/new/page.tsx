'use client';

import React, { useState } from 'react';
import { Calendar, Clock, User, Stethoscope, FileText, CheckCircle, AlertCircle, Search, Phone, Loader2 } from 'lucide-react';
import { useFormValidation, ValidationRules } from '@/hooks/useFormValidation';

interface FormData {
    patientMrn: string;
    patientName: string;
    patientPhone: string;
    department: string;
    doctor: string;
    date: string;
    time: string;
    reason: string;
    appointmentType: string;
    notes: string;
}

const doctors = [
    { id: 1, name: 'Dr. Rajesh Sharma', department: 'Cardiology', available: true, fee: 800 },
    { id: 2, name: 'Dr. Priya Gupta', department: 'Gynecology', available: true, fee: 700 },
    { id: 3, name: 'Dr. Amit Singh', department: 'Orthopedics', available: false, fee: 900 },
    { id: 4, name: 'Dr. Sneha Patel', department: 'Pediatrics', available: true, fee: 600 },
    { id: 5, name: 'Dr. Vikram Verma', department: 'Neurology', available: true, fee: 1000 },
    { id: 6, name: 'Dr. Anita Desai', department: 'General Medicine', available: true, fee: 500 },
];

const departments = [
    { value: 'cardiology', label: 'Cardiology' },
    { value: 'orthopedics', label: 'Orthopedics' },
    { value: 'neurology', label: 'Neurology' },
    { value: 'gynecology', label: 'Gynecology' },
    { value: 'pediatrics', label: 'Pediatrics' },
    { value: 'general-medicine', label: 'General Medicine' },
    { value: 'ent', label: 'ENT' },
    { value: 'dermatology', label: 'Dermatology' },
];

const appointmentTypes = [
    { value: 'new', label: 'New Consultation' },
    { value: 'followup', label: 'Follow-up Visit' },
    { value: 'report', label: 'Report Review' },
    { value: 'procedure', label: 'Minor Procedure' },
];

const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM',
    '04:30 PM', '05:00 PM'
];

// Mock booked slots
const bookedSlots = ['10:00 AM', '02:30 PM', '04:00 PM'];

export default function NewAppointmentPage() {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [appointmentId, setAppointmentId] = useState('');
    const [formData, setFormData] = useState<FormData>({
        patientMrn: '',
        patientName: '',
        patientPhone: '',
        department: '',
        doctor: '',
        date: '',
        time: '',
        reason: '',
        appointmentType: 'new',
        notes: '',
    });

    // Validation schema
    const validationSchema = {
        patientName: [
            (v: string) => ValidationRules.required(v, 'Patient name'),
            (v: string) => ValidationRules.minLength(v, 2),
        ],
        patientPhone: [
            (v: string) => ValidationRules.required(v, 'Phone number'),
            (v: string) => ValidationRules.phone(v, 10),
        ],
        department: [
            (v: string) => ValidationRules.required(v, 'Department'),
        ],
        doctor: [
            (v: string) => ValidationRules.required(v, 'Doctor'),
        ],
        date: [
            (v: string) => ValidationRules.required(v, 'Date'),
            (v: string) => ValidationRules.date(v, { notPast: true }),
        ],
        time: [
            (v: string) => ValidationRules.required(v, 'Time slot'),
        ],
        reason: [
            (v: string) => ValidationRules.required(v, 'Reason for visit'),
            (v: string) => ValidationRules.minLength(v, 5),
        ],
        appointmentType: [
            (v: string) => ValidationRules.required(v, 'Appointment type'),
        ],
    };

    const { errors, validateField, validateForm, setFieldError, clearFieldError } = useFormValidation<FormData>(validationSchema);

    const handleChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            clearFieldError(field);
        }
    };

    const handleBlur = (field: keyof FormData) => {
        const error = validateField(field, formData[field]);
        if (error) {
            setFieldError(field, error);
        }
    };

    const validateStep = (currentStep: number): boolean => {
        let fieldsToValidate: (keyof FormData)[] = [];
        
        switch (currentStep) {
            case 1:
                fieldsToValidate = ['patientName', 'patientPhone', 'department', 'reason', 'appointmentType'];
                break;
            case 2:
                fieldsToValidate = ['doctor'];
                break;
            case 3:
                fieldsToValidate = ['date', 'time'];
                break;
        }

        let isValid = true;
        fieldsToValidate.forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) {
                setFieldError(field, error);
                isValid = false;
            }
        });

        return isValid;
    };

    const handleNextStep = () => {
        if (validateStep(step)) {
            setStep(step + 1);
        }
    };

    const handleSubmit = async () => {
        if (!validateStep(3)) return;

        setIsSubmitting(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Generate appointment ID
        setAppointmentId('APT-' + Date.now().toString().slice(-8));
        setIsSubmitting(false);
        setStep(4);
    };

    const selectedDoctor = doctors.find(d => d.name === formData.doctor);
    const filteredDoctors = formData.department 
        ? doctors.filter(d => d.department.toLowerCase().replace(' ', '-') === formData.department)
        : doctors;

    const inputClass = (field: keyof FormData) => `
        w-full px-4 py-3 border rounded-lg transition-all duration-200
        ${errors[field] 
            ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/10 focus:ring-red-200 dark:focus:ring-red-800' 
            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-blue-200 dark:focus:ring-blue-800'
        }
        focus:outline-none focus:ring-2 focus:border-transparent
        text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500
    `;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Book New Appointment</h1>
                <p className="text-slate-500 dark:text-slate-400">Schedule a new appointment for a patient</p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2 md:gap-4">
                {[
                    { num: 1, label: 'Patient Info' },
                    { num: 2, label: 'Select Doctor' },
                    { num: 3, label: 'Date & Time' },
                ].map((s, i) => (
                    <React.Fragment key={s.num}>
                        <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                                step >= s.num ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                            }`}>
                                {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
                            </div>
                            <span className="text-xs mt-1 text-slate-500 dark:text-slate-400 hidden sm:block">{s.label}</span>
                        </div>
                        {i < 2 && <div className={`w-12 md:w-20 h-1 rounded ${step > s.num ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`} />}
                    </React.Fragment>
                ))}
            </div>

            <div className="card">
                {/* Step 1: Patient Details */}
                {step === 1 && (
                    <div className="p-6 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-700">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Patient Details</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Enter patient information</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Patient MRN */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    Patient MRN <span className="text-slate-400">(Optional)</span>
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={formData.patientMrn}
                                        onChange={(e) => handleChange('patientMrn', e.target.value)}
                                        placeholder="Search by MRN"
                                        className={`${inputClass('patientMrn')} pl-10`}
                                    />
                                </div>
                            </div>

                            {/* Patient Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    Patient Name <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={formData.patientName}
                                        onChange={(e) => handleChange('patientName', e.target.value)}
                                        onBlur={() => handleBlur('patientName')}
                                        placeholder="Enter patient name"
                                        className={`${inputClass('patientName')} pl-10`}
                                    />
                                </div>
                                {errors.patientName && (
                                    <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.patientName}
                                    </p>
                                )}
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="tel"
                                        value={formData.patientPhone}
                                        onChange={(e) => handleChange('patientPhone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        onBlur={() => handleBlur('patientPhone')}
                                        placeholder="9876543210"
                                        className={`${inputClass('patientPhone')} pl-10`}
                                    />
                                </div>
                                {errors.patientPhone && (
                                    <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.patientPhone}
                                    </p>
                                )}
                            </div>

                            {/* Appointment Type */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    Appointment Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.appointmentType}
                                    onChange={(e) => handleChange('appointmentType', e.target.value)}
                                    className={inputClass('appointmentType')}
                                >
                                    {appointmentTypes.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Department */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    Department <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.department}
                                    onChange={(e) => {
                                        handleChange('department', e.target.value);
                                        handleChange('doctor', ''); // Reset doctor when department changes
                                    }}
                                    onBlur={() => handleBlur('department')}
                                    className={inputClass('department')}
                                >
                                    <option value="">Select Department</option>
                                    {departments.map(dept => (
                                        <option key={dept.value} value={dept.value}>{dept.label}</option>
                                    ))}
                                </select>
                                {errors.department && (
                                    <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.department}
                                    </p>
                                )}
                            </div>

                            {/* Reason for Visit */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    Reason for Visit <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.reason}
                                    onChange={(e) => handleChange('reason', e.target.value)}
                                    onBlur={() => handleBlur('reason')}
                                    placeholder="Brief description of the reason for appointment"
                                    rows={3}
                                    className={`${inputClass('reason')} resize-none`}
                                />
                                {errors.reason && (
                                    <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.reason}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700">
                            <button 
                                onClick={handleNextStep} 
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Next: Select Doctor
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Select Doctor */}
                {step === 2 && (
                    <div className="p-6 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-700">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <Stethoscope className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Select Doctor</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Choose a doctor from {formData.department ? departments.find(d => d.value === formData.department)?.label : 'available doctors'}
                                </p>
                            </div>
                        </div>

                        {errors.doctor && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-red-500" />
                                <span className="text-sm text-red-600 dark:text-red-400">{errors.doctor}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredDoctors.length === 0 ? (
                                <div className="col-span-full text-center py-8 text-slate-500 dark:text-slate-400">
                                    No doctors available for the selected department
                                </div>
                            ) : (
                                filteredDoctors.map((doctor) => (
                                    <div
                                        key={doctor.id}
                                        onClick={() => {
                                            if (doctor.available) {
                                                handleChange('doctor', doctor.name);
                                                clearFieldError('doctor');
                                            }
                                        }}
                                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                            formData.doctor === doctor.name
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                                                : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600'
                                        } ${!doctor.available && 'opacity-50 cursor-not-allowed'}`}
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                                {doctor.name.split(' ').pop()?.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-slate-900 dark:text-white">{doctor.name}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{doctor.department}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                                doctor.available 
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                                                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                            }`}>
                                                {doctor.available ? 'Available' : 'Unavailable'}
                                            </span>
                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                ₹{doctor.fee}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                            <button 
                                onClick={() => setStep(1)} 
                                className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium text-slate-700 dark:text-slate-300"
                            >
                                Back
                            </button>
                            <button 
                                onClick={handleNextStep} 
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Next: Select Time
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Date & Time */}
                {step === 3 && (
                    <div className="p-6 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-700">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Select Date & Time</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Choose a convenient slot for the appointment</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Date Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Select Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => handleChange('date', e.target.value)}
                                    onBlur={() => handleBlur('date')}
                                    min={new Date().toISOString().split('T')[0]}
                                    className={inputClass('date')}
                                />
                                {errors.date && (
                                    <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.date}
                                    </p>
                                )}
                            </div>

                            {/* Time Slots */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Select Time Slot <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {timeSlots.map((slot) => {
                                        const isBooked = bookedSlots.includes(slot);
                                        return (
                                            <button
                                                key={slot}
                                                type="button"
                                                onClick={() => {
                                                    if (!isBooked) {
                                                        handleChange('time', slot);
                                                        clearFieldError('time');
                                                    }
                                                }}
                                                disabled={isBooked}
                                                className={`px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                                                    isBooked
                                                        ? 'border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed line-through'
                                                        : formData.time === slot
                                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium'
                                                            : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 text-slate-700 dark:text-slate-300'
                                                }`}
                                            >
                                                {slot}
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors.time && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.time}
                                    </p>
                                )}
                                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                    <span className="inline-block w-3 h-3 bg-slate-100 dark:bg-slate-800 rounded mr-1"></span>
                                    Unavailable slots
                                </p>
                            </div>
                        </div>

                        {/* Additional Notes */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Additional Notes <span className="text-slate-400">(Optional)</span>
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => handleChange('notes', e.target.value)}
                                placeholder="Any special instructions or notes for the doctor"
                                rows={2}
                                className={`${inputClass('notes')} resize-none`}
                            />
                        </div>

                        {/* Appointment Summary */}
                        {formData.date && formData.time && (
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">Appointment Summary</h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-blue-600 dark:text-blue-400">Patient:</span>
                                        <p className="font-medium text-blue-900 dark:text-blue-100">{formData.patientName}</p>
                                    </div>
                                    <div>
                                        <span className="text-blue-600 dark:text-blue-400">Doctor:</span>
                                        <p className="font-medium text-blue-900 dark:text-blue-100">{formData.doctor}</p>
                                    </div>
                                    <div>
                                        <span className="text-blue-600 dark:text-blue-400">Date & Time:</span>
                                        <p className="font-medium text-blue-900 dark:text-blue-100">
                                            {new Date(formData.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} at {formData.time}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-blue-600 dark:text-blue-400">Consultation Fee:</span>
                                        <p className="font-medium text-blue-900 dark:text-blue-100">₹{selectedDoctor?.fee || 0}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                            <button 
                                onClick={() => setStep(2)} 
                                className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium text-slate-700 dark:text-slate-300"
                            >
                                Back
                            </button>
                            <button 
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Booking...
                                    </>
                                ) : (
                                    'Confirm Appointment'
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Success */}
                {step === 4 && (
                    <div className="p-8 text-center">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Appointment Booked!</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">
                            The appointment has been successfully scheduled
                        </p>
                        
                        <div className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-mono text-lg font-bold mb-6">
                            {appointmentId}
                        </div>

                        <div className="max-w-md mx-auto bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-6 text-left">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-slate-500 dark:text-slate-400">Patient:</span>
                                    <p className="font-medium text-slate-900 dark:text-white">{formData.patientName}</p>
                                </div>
                                <div>
                                    <span className="text-slate-500 dark:text-slate-400">Doctor:</span>
                                    <p className="font-medium text-slate-900 dark:text-white">{formData.doctor}</p>
                                </div>
                                <div>
                                    <span className="text-slate-500 dark:text-slate-400">Date:</span>
                                    <p className="font-medium text-slate-900 dark:text-white">
                                        {new Date(formData.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-slate-500 dark:text-slate-400">Time:</span>
                                    <p className="font-medium text-slate-900 dark:text-white">{formData.time}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => {
                                    setStep(1);
                                    setFormData({
                                        patientMrn: '', patientName: '', patientPhone: '', department: '',
                                        doctor: '', date: '', time: '', reason: '', appointmentType: 'new', notes: ''
                                    });
                                }}
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Book Another
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium text-slate-700 dark:text-slate-300"
                            >
                                Print Slip
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
