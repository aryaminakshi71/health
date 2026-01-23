'use client';

import { useState, useCallback } from 'react';

// Common validation rules
export const ValidationRules = {
    required: (value: any, fieldName: string = 'This field') => {
        if (value === null || value === undefined || value === '') {
            return `${fieldName} is required`;
        }
        if (typeof value === 'string' && !value.trim()) {
            return `${fieldName} is required`;
        }
        return undefined;
    },

    email: (value: string) => {
        if (!value) return undefined;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return 'Please enter a valid email address';
        }
        return undefined;
    },

    phone: (value: string, digits: number = 10) => {
        if (!value) return undefined;
        const phoneRegex = new RegExp(`^\\d{${digits}}$`);
        if (!phoneRegex.test(value.replace(/\D/g, ''))) {
            return `Phone number must be ${digits} digits`;
        }
        return undefined;
    },

    minLength: (value: string, min: number) => {
        if (!value) return undefined;
        if (value.trim().length < min) {
            return `Must be at least ${min} characters`;
        }
        return undefined;
    },

    maxLength: (value: string, max: number) => {
        if (!value) return undefined;
        if (value.length > max) {
            return `Must be no more than ${max} characters`;
        }
        return undefined;
    },

    pattern: (value: string, regex: RegExp, message: string) => {
        if (!value) return undefined;
        if (!regex.test(value)) {
            return message;
        }
        return undefined;
    },

    pincode: (value: string) => {
        if (!value) return undefined;
        if (!/^\d{6}$/.test(value)) {
            return 'Pincode must be 6 digits';
        }
        return undefined;
    },

    date: (value: string, options?: { notFuture?: boolean; notPast?: boolean; minAge?: number }) => {
        if (!value) return undefined;
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            return 'Please enter a valid date';
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (options?.notFuture && date > today) {
            return 'Date cannot be in the future';
        }
        if (options?.notPast && date < today) {
            return 'Date cannot be in the past';
        }
        if (options?.minAge) {
            const minDate = new Date();
            minDate.setFullYear(minDate.getFullYear() - options.minAge);
            if (date > minDate) {
                return `Must be at least ${options.minAge} years old`;
            }
        }
        return undefined;
    },

    time: (value: string) => {
        if (!value) return undefined;
        if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
            return 'Please enter a valid time (HH:MM)';
        }
        return undefined;
    },

    number: (value: string | number, options?: { min?: number; max?: number; integer?: boolean }) => {
        if (value === '' || value === null || value === undefined) return undefined;
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(num)) {
            return 'Please enter a valid number';
        }
        if (options?.integer && !Number.isInteger(num)) {
            return 'Please enter a whole number';
        }
        if (options?.min !== undefined && num < options.min) {
            return `Must be at least ${options.min}`;
        }
        if (options?.max !== undefined && num > options.max) {
            return `Must be no more than ${options.max}`;
        }
        return undefined;
    },

    currency: (value: string | number) => {
        if (value === '' || value === null || value === undefined) return undefined;
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(num) || num < 0) {
            return 'Please enter a valid amount';
        }
        return undefined;
    },

    aadhar: (value: string) => {
        if (!value) return undefined;
        if (!/^\d{12}$/.test(value.replace(/\s/g, ''))) {
            return 'Aadhar number must be 12 digits';
        }
        return undefined;
    },

    abhaId: (value: string) => {
        if (!value) return undefined;
        // ABHA ID format: XX-XXXX-XXXX-XXXX
        const cleaned = value.replace(/[-\s]/g, '');
        if (!/^\d{14}$/.test(cleaned)) {
            return 'ABHA ID must be 14 digits';
        }
        return undefined;
    },

    gstNumber: (value: string) => {
        if (!value) return undefined;
        if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value)) {
            return 'Please enter a valid GST number';
        }
        return undefined;
    },

    panNumber: (value: string) => {
        if (!value) return undefined;
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value.toUpperCase())) {
            return 'Please enter a valid PAN number';
        }
        return undefined;
    },

    password: (value: string, options?: { minLength?: number; requireUppercase?: boolean; requireNumber?: boolean; requireSpecial?: boolean }) => {
        if (!value) return undefined;
        const errors: string[] = [];
        const minLen = options?.minLength || 8;

        if (value.length < minLen) {
            errors.push(`at least ${minLen} characters`);
        }
        if (options?.requireUppercase && !/[A-Z]/.test(value)) {
            errors.push('one uppercase letter');
        }
        if (options?.requireNumber && !/\d/.test(value)) {
            errors.push('one number');
        }
        if (options?.requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
            errors.push('one special character');
        }

        if (errors.length > 0) {
            return `Password must contain ${errors.join(', ')}`;
        }
        return undefined;
    },

    confirmPassword: (value: string, password: string) => {
        if (!value) return undefined;
        if (value !== password) {
            return 'Passwords do not match';
        }
        return undefined;
    },

    url: (value: string) => {
        if (!value) return undefined;
        try {
            new URL(value);
            return undefined;
        } catch {
            return 'Please enter a valid URL';
        }
    },
};

// Type definitions
export type ValidationRule<T = any> = (value: T, formData?: any) => string | undefined;

export interface FieldValidation {
    [fieldName: string]: ValidationRule[];
}

export interface ValidationErrors {
    [fieldName: string]: string | undefined;
}

export interface UseFormValidationReturn<T> {
    errors: ValidationErrors;
    touched: { [key: string]: boolean };
    isValid: boolean;
    validateField: (fieldName: keyof T, value: any) => string | undefined;
    validateForm: (data: T) => boolean;
    setFieldError: (fieldName: keyof T, error: string | undefined) => void;
    setFieldTouched: (fieldName: keyof T, touched?: boolean) => void;
    clearErrors: () => void;
    clearFieldError: (fieldName: keyof T) => void;
    getFieldProps: (fieldName: keyof T) => {
        error: string | undefined;
        touched: boolean;
        onBlur: () => void;
    };
}

// Main hook
export function useFormValidation<T extends Record<string, any>>(
    validationSchema: { [K in keyof T]?: ValidationRule[] },
    initialValues?: Partial<T>
): UseFormValidationReturn<T> {
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

    const validateField = useCallback((fieldName: keyof T, value: any, formData?: T): string | undefined => {
        const rules = validationSchema[fieldName];
        if (!rules) return undefined;

        for (const rule of rules) {
            const error = rule(value, formData);
            if (error) return error;
        }
        return undefined;
    }, [validationSchema]);

    const validateForm = useCallback((data: T): boolean => {
        const newErrors: ValidationErrors = {};
        let isValid = true;

        for (const fieldName of Object.keys(validationSchema) as (keyof T)[]) {
            const error = validateField(fieldName, data[fieldName], data);
            if (error) {
                newErrors[fieldName as string] = error;
                isValid = false;
            }
        }

        setErrors(newErrors);
        
        // Mark all fields as touched
        const allTouched: { [key: string]: boolean } = {};
        for (const fieldName of Object.keys(validationSchema)) {
            allTouched[fieldName] = true;
        }
        setTouched(allTouched);

        return isValid;
    }, [validationSchema, validateField]);

    const setFieldError = useCallback((fieldName: keyof T, error: string | undefined) => {
        setErrors(prev => ({ ...prev, [fieldName]: error }));
    }, []);

    const setFieldTouched = useCallback((fieldName: keyof T, isTouched: boolean = true) => {
        setTouched(prev => ({ ...prev, [fieldName]: isTouched }));
    }, []);

    const clearErrors = useCallback(() => {
        setErrors({});
        setTouched({});
    }, []);

    const clearFieldError = useCallback((fieldName: keyof T) => {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[fieldName as string];
            return newErrors;
        });
    }, []);

    const getFieldProps = useCallback((fieldName: keyof T) => ({
        error: errors[fieldName as string],
        touched: touched[fieldName as string] || false,
        onBlur: () => setFieldTouched(fieldName, true),
    }), [errors, touched, setFieldTouched]);

    const isValid = Object.keys(errors).length === 0;

    return {
        errors,
        touched,
        isValid,
        validateField,
        validateForm,
        setFieldError,
        setFieldTouched,
        clearErrors,
        clearFieldError,
        getFieldProps,
    };
}

// Helper function to create validation schema
export function createValidationSchema<T extends Record<string, any>>(
    schema: { [K in keyof T]?: ValidationRule[] }
): { [K in keyof T]?: ValidationRule[] } {
    return schema;
}

// Pre-built schemas for common forms
export const PatientValidationSchema = {
    firstName: [
        (v: string) => ValidationRules.required(v, 'First name'),
        (v: string) => ValidationRules.minLength(v, 2),
    ],
    lastName: [],
    dateOfBirth: [
        (v: string) => ValidationRules.required(v, 'Date of birth'),
        (v: string) => ValidationRules.date(v, { notFuture: true }),
    ],
    gender: [
        (v: string) => ValidationRules.required(v, 'Gender'),
    ],
    phone: [
        (v: string) => ValidationRules.required(v, 'Phone number'),
        (v: string) => ValidationRules.phone(v, 10),
    ],
    email: [
        (v: string) => ValidationRules.email(v),
    ],
    pincode: [
        (v: string) => ValidationRules.pincode(v),
    ],
    emergencyContactPhone: [
        (v: string) => ValidationRules.phone(v, 10),
    ],
};

export const AppointmentValidationSchema = {
    patientId: [
        (v: string) => ValidationRules.required(v, 'Patient'),
    ],
    doctorId: [
        (v: string) => ValidationRules.required(v, 'Doctor'),
    ],
    department: [
        (v: string) => ValidationRules.required(v, 'Department'),
    ],
    date: [
        (v: string) => ValidationRules.required(v, 'Date'),
        (v: string) => ValidationRules.date(v, { notPast: true }),
    ],
    time: [
        (v: string) => ValidationRules.required(v, 'Time'),
        (v: string) => ValidationRules.time(v),
    ],
    reason: [
        (v: string) => ValidationRules.required(v, 'Reason for visit'),
        (v: string) => ValidationRules.minLength(v, 10),
    ],
};

export const BillingValidationSchema = {
    patientId: [
        (v: string) => ValidationRules.required(v, 'Patient'),
    ],
    items: [
        (v: any[]) => {
            if (!v || v.length === 0) return 'At least one item is required';
            return undefined;
        },
    ],
    paymentMethod: [
        (v: string) => ValidationRules.required(v, 'Payment method'),
    ],
    totalAmount: [
        (v: number) => ValidationRules.required(v, 'Total amount'),
        (v: number) => ValidationRules.currency(v),
    ],
};

export const AdmissionValidationSchema = {
    patientId: [
        (v: string) => ValidationRules.required(v, 'Patient'),
    ],
    wardId: [
        (v: string) => ValidationRules.required(v, 'Ward'),
    ],
    bedId: [
        (v: string) => ValidationRules.required(v, 'Bed'),
    ],
    admittingDoctorId: [
        (v: string) => ValidationRules.required(v, 'Admitting doctor'),
    ],
    admissionDate: [
        (v: string) => ValidationRules.required(v, 'Admission date'),
        (v: string) => ValidationRules.date(v),
    ],
    diagnosis: [
        (v: string) => ValidationRules.required(v, 'Diagnosis'),
        (v: string) => ValidationRules.minLength(v, 5),
    ],
    emergencyContact: [
        (v: string) => ValidationRules.required(v, 'Emergency contact'),
    ],
    emergencyPhone: [
        (v: string) => ValidationRules.required(v, 'Emergency phone'),
        (v: string) => ValidationRules.phone(v, 10),
    ],
};

export default useFormValidation;
