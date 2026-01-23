'use client';

import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Droplet, AlertCircle, CheckCircle, Upload, Camera, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/Select';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { SkeletonForm } from '@/components/ui/Skeleton';

interface FormData {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    bloodGroup: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    allergies: string;
    abhaId: string;
}

const genderOptions = [
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' },
    { value: 'OTHER', label: 'Other' }
];

const bloodGroupOptions = [
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' }
];

const stateOptions = [
    { value: 'MH', label: 'Maharashtra' },
    { value: 'DL', label: 'Delhi' },
    { value: 'KA', label: 'Karnataka' },
    { value: 'TN', label: 'Tamil Nadu' },
    { value: 'UP', label: 'Uttar Pradesh' },
    { value: 'GJ', label: 'Gujarat' },
    { value: 'RJ', label: 'Rajasthan' },
    { value: 'WB', label: 'West Bengal' }
];

export default function PatientRegistrationForm() {
    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        bloodGroup: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        allergies: '',
        abhaId: ''
    });

    const [errors, setErrors] = useState<Partial<FormData>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [generatedMRN, setGeneratedMRN] = useState('');
    const [currentStep, setCurrentStep] = useState(1);

    const validateField = (name: keyof FormData, value: string): string | undefined => {
        switch (name) {
            case 'firstName':
                if (!value.trim()) return 'First name is required';
                if (value.trim().length < 2) return 'At least 2 characters';
                break;
            case 'phone':
                if (!value) return 'Phone number is required';
                if (!/^\d{10}$/.test(value)) return 'Enter valid 10-digit number';
                break;
            case 'email':
                if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    return 'Enter a valid email address';
                }
                break;
            case 'dateOfBirth':
                if (!value) return 'Date of birth is required';
                const dob = new Date(value);
                if (dob > new Date()) return 'Invalid date';
                break;
            case 'pincode':
                if (value && !/^\d{6}$/.test(value)) {
                    return 'Enter 6-digit pincode';
                }
                break;
        }
        return undefined;
    };

    const handleChange = (name: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<FormData> = {};
        let isValid = true;

        const requiredFields: (keyof FormData)[] = ['firstName', 'dateOfBirth', 'gender', 'phone'];
        
        requiredFields.forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) {
                newErrors[field] = error;
                isValid = false;
            }
        });

        // Validate optional fields if filled
        if (formData.email) {
            const error = validateField('email', formData.email);
            if (error) newErrors.email = error;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setIsSubmitting(true);
        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            // Mock successful response
            setGeneratedMRN('MRN-' + Date.now().toString().slice(-8));
            setShowSuccess(true);
            
            // Reset form
            setFormData({
                firstName: '', lastName: '', dateOfBirth: '', gender: '',
                phone: '', email: '', address: '', city: '', state: '',
                pincode: '', bloodGroup: '', emergencyContactName: '',
                emergencyContactPhone: '', allergies: '', abhaId: ''
            });
        } catch (error) {
            console.error('Registration failed:', error);
        } finally {
            setIsSubmitting(false);
            setIsLoading(false);
        }
    };

    const inputClass = (fieldName: keyof FormData) => `
        w-full px-4 py-3 rounded-xl border transition-all duration-200
        ${errors[fieldName] 
            ? 'border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400' 
            : 'border-gray-200 bg-white focus:ring-gray-200 focus:border-blue-400'
        }
        focus:outline-none focus:ring-2
        placeholder:text-gray-400
    `;

    const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

    return (
        <div className="max-w-4xl mx-auto">
            {/* Progress Steps */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    {['Personal', 'Contact', 'Medical'].map((step, index) => (
                        <React.Fragment key={step}>
                            <div className="flex flex-col items-center">
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center
                                    font-medium transition-all duration-300
                                    ${currentStep > index + 1 
                                        ? 'bg-green-500 text-white' 
                                        : currentStep === index + 1
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-400'
                                    }
                                `}>
                                    {currentStep > index + 1 ? (
                                        <CheckCircle className="h-5 w-5" />
                                    ) : (
                                        index + 1
                                    )}
                                </div>
                                <span className="text-xs mt-2 text-gray-500">{step}</span>
                            </div>
                            {index < 2 && (
                                <div className={`flex-1 h-1 mx-2 rounded ${
                                    currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-200'
                                }`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border-0 overflow-hidden">
                {/* Form Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <User className="h-6 w-6" />
                        Patient Registration
                    </h2>
                    <p className="text-blue-100 mt-1">Enter patient details to create a new medical record</p>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-8">
                    {isLoading ? (
                        <SkeletonForm fields={10} />
                    ) : (
                        <>
                            {/* Step 1: Personal Information */}
                            {currentStep === 1 && (
                                <div className="space-y-6 animate-fadeIn">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="relative">
                                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-400 transition-colors">
                                                <Camera className="h-8 w-8 text-gray-400" />
                                            </div>
                                            <button
                                                type="button"
                                                className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                                            >
                                                <Upload className="h-3 w-3" />
                                            </button>
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">Patient Photo</h3>
                                            <p className="text-sm text-gray-500">Upload a passport photo for identification</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className={labelClass}>First Name *</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={formData.firstName}
                                                    onChange={(e) => handleChange('firstName', e.target.value)}
                                                    className={`${inputClass('firstName')} pl-10`}
                                                    placeholder="Enter first name"
                                                />
                                            </div>
                                            {errors.firstName && (
                                                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {errors.firstName}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className={labelClass}>Last Name</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={formData.lastName}
                                                    onChange={(e) => handleChange('lastName', e.target.value)}
                                                    className={`${inputClass('lastName')} pl-10`}
                                                    placeholder="Enter last name"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className={labelClass}>Date of Birth *</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <input
                                                    type="date"
                                                    value={formData.dateOfBirth}
                                                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                                                    className={`${inputClass('dateOfBirth')} pl-10`}
                                                />
                                            </div>
                                            {errors.dateOfBirth && (
                                                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {errors.dateOfBirth}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className={labelClass}>Gender *</label>
                                            <Select
                                                options={genderOptions}
                                                value={formData.gender}
                                                onChange={(value) => handleChange('gender', value)}
                                                placeholder="Select gender"
                                                error={errors.gender}
                                            />
                                        </div>

                                        <div>
                                            <label className={labelClass}>Blood Group</label>
                                            <Select
                                                options={bloodGroupOptions}
                                                value={formData.bloodGroup}
                                                onChange={(value) => handleChange('bloodGroup', value)}
                                                placeholder="Select blood group"
                                            />
                                        </div>

                                        <div>
                                            <label className={labelClass}>ABHA ID</label>
                                            <div className="relative">
                                                <Droplet className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={formData.abhaId}
                                                    onChange={(e) => handleChange('abhaId', e.target.value)}
                                                    className={`${inputClass('abhaId')} pl-10`}
                                                    placeholder="XX-XX-XX-XX-XXXX"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Contact Information */}
                            {currentStep === 2 && (
                                <div className="space-y-6 animate-fadeIn">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className={labelClass}>Phone Number *</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <input
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={(e) => handleChange('phone', e.target.value)}
                                                    className={`${inputClass('phone')} pl-10`}
                                                    placeholder="9876543210"
                                                    maxLength={10}
                                                />
                                            </div>
                                            {errors.phone && (
                                                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {errors.phone}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className={labelClass}>Email</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => handleChange('email', e.target.value)}
                                                    className={`${inputClass('email')} pl-10`}
                                                    placeholder="patient@example.com"
                                                />
                                            </div>
                                            {errors.email && (
                                                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {errors.email}
                                                </p>
                                            )}
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className={labelClass}>Address</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                                <textarea
                                                    value={formData.address}
                                                    onChange={(e) => handleChange('address', e.target.value)}
                                                    className={`${inputClass('address')} pl-10 min-h-[80px] resize-none`}
                                                    placeholder="Enter full address"
                                                    rows={3}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className={labelClass}>City</label>
                                            <input
                                                type="text"
                                                value={formData.city}
                                                onChange={(e) => handleChange('city', e.target.value)}
                                                className={inputClass('city')}
                                                placeholder="Enter city"
                                            />
                                        </div>

                                        <div>
                                            <label className={labelClass}>State</label>
                                            <Select
                                                options={stateOptions}
                                                value={formData.state}
                                                onChange={(value) => handleChange('state', value)}
                                                placeholder="Select state"
                                            />
                                        </div>

                                        <div>
                                            <label className={labelClass}>Pincode</label>
                                            <input
                                                type="text"
                                                value={formData.pincode}
                                                onChange={(e) => handleChange('pincode', e.target.value)}
                                                className={inputClass('pincode')}
                                                placeholder="110001"
                                                maxLength={6}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Medical Information */}
                            {currentStep === 3 && (
                                <div className="space-y-6 animate-fadeIn">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className={labelClass}>Emergency Contact Name</label>
                                            <input
                                                type="text"
                                                value={formData.emergencyContactName}
                                                onChange={(e) => handleChange('emergencyContactName', e.target.value)}
                                                className={inputClass('emergencyContactName')}
                                                placeholder="Contact person's name"
                                            />
                                        </div>

                                        <div>
                                            <label className={labelClass}>Emergency Contact Phone</label>
                                            <input
                                                type="tel"
                                                value={formData.emergencyContactPhone}
                                                onChange={(e) => handleChange('emergencyContactPhone', e.target.value)}
                                                className={inputClass('emergencyContactPhone')}
                                                placeholder="9876543210"
                                                maxLength={10}
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className={labelClass}>Known Allergies</label>
                                            <textarea
                                                value={formData.allergies}
                                                onChange={(e) => handleChange('allergies', e.target.value)}
                                                className={`${inputClass('allergies')} min-h-[100px] resize-none`}
                                                placeholder="List any known allergies (medications, food, etc.)"
                                                rows={4}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                                    disabled={currentStep === 1}
                                    className={currentStep === 1 ? 'invisible' : ''}
                                >
                                    Previous
                                </Button>

                                {currentStep < 3 ? (
                                    <Button
                                        type="button"
                                        onClick={() => setCurrentStep(prev => Math.min(3, prev + 1))}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        Next Step
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="bg-green-600 hover:bg-green-700 min-w-[150px]"
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center gap-2">
                                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                Registering...
                                            </span>
                                        ) : (
                                            'Register Patient'
                                        )}
                                    </Button>
                                )}
                            </div>
                        </>
                    )}
                </form>
            </div>

            {/* Success Modal */}
            <Modal
                isOpen={showSuccess}
                onClose={() => setShowSuccess(false)}
                size="sm"
            >
                <div className="text-center py-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Registration Successful!</h3>
                    <p className="text-gray-600 mb-4">Patient has been registered with the following MRN:</p>
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-mono text-xl font-bold mb-6">
                        {generatedMRN}
                    </div>
                    <div className="flex gap-3 justify-center">
                        <Button variant="outline" onClick={() => setShowSuccess(false)}>
                            Close
                        </Button>
                        <Button onClick={() => {
                            setShowSuccess(false);
                            setCurrentStep(1);
                        }}>
                            Register Another
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
