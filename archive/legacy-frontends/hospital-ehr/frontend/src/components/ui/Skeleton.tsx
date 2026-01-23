'use client';

import React from 'react';

interface SkeletonProps {
    variant?: 'text' | 'circular' | 'rectangular' | 'heading';
    width?: string | number;
    height?: string | number;
    className?: string;
}

export function Skeleton({
    variant = 'text',
    width,
    height,
    className = ''
}: SkeletonProps) {
    const baseClass = 'animate-pulse bg-slate-200 dark:bg-slate-700';
    
    const variantClasses = {
        text: 'rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-lg',
        heading: 'rounded-lg'
    };

    const style: React.CSSProperties = {
        width: width || (variant === 'text' ? '100%' : undefined),
        height: height || (variant === 'text' ? '1em' : undefined)
    };

    return (
        <div
            className={`${baseClass} ${variantClasses[variant]} ${className}`}
            style={style}
        />
    );
}

// Pre-built skeleton components
export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    variant="text"
                    width={i === lines - 1 ? '60%' : '100%'}
                />
            ))}
        </div>
    );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
    return (
        <div className={`p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 ${className}`}>
            <div className="flex items-center gap-4 mb-4">
                <Skeleton variant="circular" width={48} height={48} />
                <div className="flex-1">
                    <Skeleton variant="text" width="40%" />
                    <Skeleton variant="text" width="30%" className="mt-2" />
                </div>
            </div>
            <SkeletonText lines={3} />
        </div>
    );
}

export function SkeletonTable({ rows = 5, cols = 4, className = '' }: { rows?: number; cols?: number; className?: string }) {
    return (
        <div className={`space-y-3 ${className}`}>
            {/* Header */}
            <div className="flex gap-4 pb-3 border-b border-slate-100 dark:border-slate-700">
                {Array.from({ length: cols }).map((_, i) => (
                    <Skeleton key={i} variant="text" width={`${100 / cols}%`} height={20} />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex gap-4 py-2">
                    {Array.from({ length: cols }).map((_, colIndex) => (
                        <Skeleton
                            key={colIndex}
                            variant="text"
                            width={`${100 / cols}%`}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

export function SkeletonProfile({ className = '' }: { className?: string }) {
    return (
        <div className={`flex items-center gap-4 ${className}`}>
            <Skeleton variant="circular" width={64} height={64} />
            <div className="flex-1 space-y-2">
                <Skeleton variant="heading" width="40%" height={24} />
                <Skeleton variant="text" width="60%" />
            </div>
        </div>
    );
}

export function SkeletonForm({ fields = 5, className = '' }: { fields?: number; className?: string }) {
    return (
        <div className={`space-y-4 ${className}`}>
            {Array.from({ length: fields }).map((_, i) => (
                <div key={i}>
                    <Skeleton variant="text" width="30%" height={16} className="mb-2" />
                    <Skeleton variant="rectangular" width="100%" height={44} />
                </div>
            ))}
        </div>
    );
}

export function SkeletonMetric({ className = '' }: { className?: string }) {
    return (
        <div className={`p-6 rounded-xl ${className}`}>
            <Skeleton variant="text" width="40%" height={16} />
            <Skeleton variant="heading" width="60%" height={36} className="mt-2" />
            <Skeleton variant="text" width="30%" height={14} className="mt-2" />
        </div>
    );
}

// Page loading skeleton
export function PageSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="flex justify-between items-center">
                <Skeleton variant="heading" width={300} height={36} />
                <Skeleton variant="rectangular" width={120} height={40} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonMetric key={i} className="bg-white dark:bg-slate-800" />
                ))}
            </div>
            <SkeletonCard />
            <SkeletonTable rows={5} cols={5} />
        </div>
    );
}

// Dashboard skeleton with metrics and charts
export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                    <Skeleton variant="heading" width={250} height={32} />
                    <Skeleton variant="text" width={180} height={16} className="mt-2" />
                </div>
                <div className="flex gap-2">
                    <Skeleton variant="rectangular" width={120} height={40} />
                    <Skeleton variant="rectangular" width={120} height={40} />
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-4">
                            <Skeleton variant="circular" width={48} height={48} />
                            <Skeleton variant="text" width={60} height={20} />
                        </div>
                        <Skeleton variant="heading" width="70%" height={28} />
                        <Skeleton variant="text" width="50%" height={14} className="mt-2" />
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <Skeleton variant="text" width={150} height={20} className="mb-4" />
                    <Skeleton variant="rectangular" width="100%" height={250} />
                </div>
                <div className="p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <Skeleton variant="text" width={150} height={20} className="mb-4" />
                    <Skeleton variant="rectangular" width="100%" height={250} />
                </div>
            </div>

            {/* Table */}
            <div className="p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <Skeleton variant="text" width={200} height={24} className="mb-4" />
                <SkeletonTable rows={5} cols={5} />
            </div>
        </div>
    );
}

// Patient list skeleton
export function PatientListSkeleton() {
    return (
        <div className="space-y-4">
            {/* Search and filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <Skeleton variant="rectangular" width="100%" height={44} className="sm:max-w-md" />
                <div className="flex gap-2">
                    <Skeleton variant="rectangular" width={100} height={44} />
                    <Skeleton variant="rectangular" width={100} height={44} />
                </div>
            </div>

            {/* Patient cards */}
            <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                        <Skeleton variant="circular" width={56} height={56} />
                        <div className="flex-1 space-y-2">
                            <Skeleton variant="text" width="30%" height={18} />
                            <Skeleton variant="text" width="50%" height={14} />
                        </div>
                        <Skeleton variant="rectangular" width={80} height={32} />
                    </div>
                ))}
            </div>
        </div>
    );
}

// Appointment skeleton
export function AppointmentSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-3">
                        <Skeleton variant="circular" width={40} height={40} />
                        <div className="flex-1">
                            <Skeleton variant="text" width="60%" height={16} />
                            <Skeleton variant="text" width="40%" height={12} className="mt-1" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Skeleton variant="rectangular" width={16} height={16} />
                            <Skeleton variant="text" width="50%" height={14} />
                        </div>
                        <div className="flex items-center gap-2">
                            <Skeleton variant="rectangular" width={16} height={16} />
                            <Skeleton variant="text" width="40%" height={14} />
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between">
                        <Skeleton variant="rectangular" width={80} height={28} />
                        <Skeleton variant="rectangular" width={60} height={28} />
                    </div>
                </div>
            ))}
        </div>
    );
}
