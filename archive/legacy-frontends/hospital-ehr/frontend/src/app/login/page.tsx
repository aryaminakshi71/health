'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Eye,
    EyeOff,
    Lock,
    Mail,
    User,
    Phone,
    Building2,
    Shield,
    Award,
    ArrowRight,
    Loader2,
    AlertCircle,
    CheckCircle,
    Plus
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

type AuthMode = 'login' | 'register' | 'forgot';

export default function LoginPage() {
    const router = useRouter();
    const { login, register, isAuthenticated, isLoading, error, clearError } = useAuth();
    const { resolvedTheme } = useTheme();
    
    const [mode, setMode] = useState<AuthMode>('login');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    
    // Form fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [department, setDepartment] = useState('');
    const [role, setRole] = useState('doctor');
    const [rememberMe, setRememberMe] = useState(false);

    // Form validation errors
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.push('/');
        }
    }, [isAuthenticated, router]);

    // Clear error when switching modes
    useEffect(() => {
        clearError();
        setValidationErrors({});
        setSuccessMessage('');
    }, [mode, clearError]);

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!email) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = 'Invalid email format';
        }

        if (mode !== 'forgot') {
            if (!password) {
                errors.password = 'Password is required';
            } else if (password.length < 6) {
                errors.password = 'Password must be at least 6 characters';
            }
        }

        if (mode === 'register') {
            if (!name) {
                errors.name = 'Full name is required';
            }
            if (!phone) {
                errors.phone = 'Phone number is required';
            } else if (!/^[0-9]{10}$/.test(phone)) {
                errors.phone = 'Invalid phone number (10 digits required)';
            }
            if (password !== confirmPassword) {
                errors.confirmPassword = 'Passwords do not match';
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setFormLoading(true);
        setSuccessMessage('');

        try {
            if (mode === 'login') {
                await login({ email, password });
                router.push('/');
            } else if (mode === 'register') {
                await register({
                    email,
                    password,
                    name,
                    phone,
                    role: role as 'admin' | 'doctor' | 'nurse' | 'receptionist',
                    department,
                });
                router.push('/');
            } else if (mode === 'forgot') {
                // Simulate password reset
                await new Promise(resolve => setTimeout(resolve, 1500));
                setSuccessMessage('Password reset link sent to your email');
                setTimeout(() => setMode('login'), 2000);
            }
        } catch (err) {
            // Error is handled by AuthContext
        } finally {
            setFormLoading(false);
        }
    };

    const departments = [
        'General Medicine',
        'Cardiology',
        'Orthopedics',
        'Pediatrics',
        'Gynecology',
        'Neurology',
        'Dermatology',
        'ENT',
        'Ophthalmology',
        'Emergency',
        'ICU',
        'Radiology',
        'Laboratory',
        'Pharmacy',
        'Administration',
    ];

    const roles = [
        { value: 'doctor', label: 'Doctor' },
        { value: 'nurse', label: 'Nurse' },
        { value: 'receptionist', label: 'Receptionist' },
        { value: 'admin', label: 'Administrator' },
    ];

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white rounded-full translate-x-1/4 translate-y-1/4" />
                    <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between p-12 text-white">
                    {/* Logo */}
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl">
                            <Plus className="w-8 h-8 text-white rotate-45" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Heal & Health</h1>
                            <p className="text-sm text-white/80">Hospital Management System</p>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-4xl font-bold mb-4">Welcome to Modern Healthcare</h2>
                            <p className="text-lg text-white/80 max-w-md">
                                Comprehensive hospital management solution designed for efficiency, 
                                accuracy, and better patient outcomes.
                            </p>
                        </div>

                        {/* Features */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold">HIPAA Compliant</p>
                                    <p className="text-sm text-white/70">Enterprise-grade security</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                                    <Award className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold">NABH Ready</p>
                                    <p className="text-sm text-white/70">Quality accreditation support</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold">Multi-Branch Support</p>
                                    <p className="text-sm text-white/70">Manage multiple locations</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center gap-6 text-sm text-white/60">
                        <span>24/7 Emergency: 0124-4206860</span>
                        <span>|</span>
                        <span>support@healhealth.com</span>
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-slate-50 dark:bg-slate-900">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg">
                            <Plus className="w-7 h-7 text-white rotate-45" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Heal & Health</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Hospital Management</p>
                        </div>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                {mode === 'login' && 'Sign In'}
                                {mode === 'register' && 'Create Account'}
                                {mode === 'forgot' && 'Reset Password'}
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 mt-2">
                                {mode === 'login' && 'Enter your credentials to access the system'}
                                {mode === 'register' && 'Fill in your details to get started'}
                                {mode === 'forgot' && 'Enter your email to receive a reset link'}
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Success Message */}
                        {successMessage && (
                            <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                <p className="text-sm text-green-600 dark:text-green-400">{successMessage}</p>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Name (Register only) */}
                            {mode === 'register' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Dr. John Smith"
                                            className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                                                validationErrors.name 
                                                    ? 'border-red-300 dark:border-red-600' 
                                                    : 'border-slate-300 dark:border-slate-600'
                                            } bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                                        />
                                    </div>
                                    {validationErrors.name && (
                                        <p className="mt-1 text-sm text-red-500">{validationErrors.name}</p>
                                    )}
                                </div>
                            )}

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="doctor@hospital.com"
                                        className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                                            validationErrors.email 
                                                ? 'border-red-300 dark:border-red-600' 
                                                : 'border-slate-300 dark:border-slate-600'
                                        } bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                                    />
                                </div>
                                {validationErrors.email && (
                                    <p className="mt-1 text-sm text-red-500">{validationErrors.email}</p>
                                )}
                            </div>

                            {/* Phone (Register only) */}
                            {mode === 'register' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Phone Number
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            placeholder="9876543210"
                                            className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                                                validationErrors.phone 
                                                    ? 'border-red-300 dark:border-red-600' 
                                                    : 'border-slate-300 dark:border-slate-600'
                                            } bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                                        />
                                    </div>
                                    {validationErrors.phone && (
                                        <p className="mt-1 text-sm text-red-500">{validationErrors.phone}</p>
                                    )}
                                </div>
                            )}

                            {/* Role & Department (Register only) */}
                            {mode === 'register' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Role
                                        </label>
                                        <select
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        >
                                            {roles.map((r) => (
                                                <option key={r.value} value={r.value}>{r.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Department
                                        </label>
                                        <select
                                            value={department}
                                            onChange={(e) => setDepartment(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        >
                                            <option value="">Select...</option>
                                            {departments.map((d) => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* Password */}
                            {mode !== 'forgot' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter your password"
                                            className={`w-full pl-11 pr-12 py-3 rounded-lg border ${
                                                validationErrors.password 
                                                    ? 'border-red-300 dark:border-red-600' 
                                                    : 'border-slate-300 dark:border-slate-600'
                                            } bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {validationErrors.password && (
                                        <p className="mt-1 text-sm text-red-500">{validationErrors.password}</p>
                                    )}
                                </div>
                            )}

                            {/* Confirm Password (Register only) */}
                            {mode === 'register' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm your password"
                                            className={`w-full pl-11 pr-12 py-3 rounded-lg border ${
                                                validationErrors.confirmPassword 
                                                    ? 'border-red-300 dark:border-red-600' 
                                                    : 'border-slate-300 dark:border-slate-600'
                                            } bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {validationErrors.confirmPassword && (
                                        <p className="mt-1 text-sm text-red-500">{validationErrors.confirmPassword}</p>
                                    )}
                                </div>
                            )}

                            {/* Remember Me & Forgot Password (Login only) */}
                            {mode === 'login' && (
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-slate-600 dark:text-slate-400">Remember me</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setMode('forgot')}
                                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={formLoading || isLoading}
                                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {(formLoading || isLoading) ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        {mode === 'login' && 'Sign In'}
                                        {mode === 'register' && 'Create Account'}
                                        {mode === 'forgot' && 'Send Reset Link'}
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Mode Switch */}
                        <div className="mt-6 text-center text-sm">
                            {mode === 'login' && (
                                <p className="text-slate-600 dark:text-slate-400">
                                    Don't have an account?{' '}
                                    <button
                                        onClick={() => setMode('register')}
                                        className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                                    >
                                        Sign up
                                    </button>
                                </p>
                            )}
                            {mode === 'register' && (
                                <p className="text-slate-600 dark:text-slate-400">
                                    Already have an account?{' '}
                                    <button
                                        onClick={() => setMode('login')}
                                        className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                                    >
                                        Sign in
                                    </button>
                                </p>
                            )}
                            {mode === 'forgot' && (
                                <p className="text-slate-600 dark:text-slate-400">
                                    Remember your password?{' '}
                                    <button
                                        onClick={() => setMode('login')}
                                        className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                                    >
                                        Sign in
                                    </button>
                                </p>
                            )}
                        </div>

                        {/* Demo Credentials */}
                        {mode === 'login' && (
                            <div className="mt-6 p-4 rounded-lg bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">DEMO CREDENTIALS</p>
                                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                                    <div>
                                        <p className="font-medium">Admin:</p>
                                        <p>admin@hospital.com</p>
                                    </div>
                                    <div>
                                        <p className="font-medium">Doctor:</p>
                                        <p>doctor@hospital.com</p>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Password: password123</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
                        By signing in, you agree to our{' '}
                        <Link href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">Terms of Service</Link>
                        {' '}and{' '}
                        <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
