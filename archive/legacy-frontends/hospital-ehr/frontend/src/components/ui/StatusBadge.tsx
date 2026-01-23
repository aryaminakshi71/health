'use client';

import React from 'react';

type StatusType = 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'gray' | 'pending' | 'completed' | 'cancelled';

interface StatusBadgeProps {
    status: string;
    type?: StatusType;
    size?: 'sm' | 'md' | 'lg';
    pulse?: boolean;
}

const statusConfig: Record<string, StatusType> = {
    // Success states
    'COMPLETED': 'success',
    'PAID': 'success',
    'ACTIVE': 'success',
    'AVAILABLE': 'success',
    'CONFIRMED': 'success',
    'DISCHARGED': 'success',
    'NORMAL': 'success',
    
    // Warning states
    'PENDING': 'warning',
    'IN_PROGRESS': 'warning',
    'PARTIAL': 'warning',
    'LOW': 'warning',
    'URGENT': 'warning',
    'COLLECTED': 'info',
    
    // Danger states
    'CANCELLED': 'danger',
    'OVERDUE': 'danger',
    'OUT': 'danger',
    'EXPIRED': 'danger',
    'REJECTED': 'danger',
    'ABNORMAL': 'danger',
    
    // Info states
    'PROCESSING': 'info',
    'REGISTERED': 'info',
    'SCHEDULED': 'info',
    
    // Primary states
    'NEW': 'primary',
    'ADMITTED': 'primary',
    
    // Gray states
    'DRAFT': 'gray',
    'INACTIVE': 'gray',
    'MAINTENANCE': 'gray',
};

const typeStyles: Record<StatusType, string> = {
    success: 'bg-green-500/15 text-green-400 border-green-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    danger: 'bg-red-500/15 text-red-400 border-red-500/30',
    info: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    primary: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    gray: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    completed: 'bg-green-500/15 text-green-400 border-green-500/30',
    cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1 text-sm',
};

export function StatusBadge({ status, type, size = 'md', pulse }: StatusBadgeProps) {
    const statusType = type || statusConfig[status] || 'gray';
    const displayStatus = status.replace(/_/g, ' ');
    
    return (
        <span className={`
            inline-flex items-center gap-1.5 font-medium rounded-full border
            ${typeStyles[statusType]}
            ${sizeStyles[size]}
        `}>
            {pulse && (
                <span className={`relative flex h-2 w-2`}>
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        statusType === 'success' ? 'bg-green-400' :
                        statusType === 'warning' ? 'bg-amber-400' :
                        statusType === 'danger' ? 'bg-red-400' :
                        'bg-blue-400'
                    }`} />
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${
                        statusType === 'success' ? 'bg-green-500' :
                        statusType === 'warning' ? 'bg-amber-500' :
                        statusType === 'danger' ? 'bg-red-500' :
                        'bg-blue-500'
                    }`} />
                </span>
            )}
            {displayStatus}
        </span>
    );
}

// For simple dot badges
interface DotBadgeProps {
    status: string;
    size?: 'sm' | 'md';
}

export function DotBadge({ status, size = 'md' }: DotBadgeProps) {
    const statusType = statusConfig[status] || 'gray';
    
    const dotColors: Record<StatusType, string> = {
        success: 'bg-green-500',
        warning: 'bg-amber-500',
        danger: 'bg-red-500',
        info: 'bg-cyan-500',
        primary: 'bg-blue-500',
        gray: 'bg-slate-500',
        pending: 'bg-amber-500',
        completed: 'bg-green-500',
        cancelled: 'bg-red-500',
    };
    
    const sizeClasses = size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2';
    
    return (
        <span className={`inline-flex items-center gap-1.5`}>
            <span className={`${dotColors[statusType]} ${sizeClasses} rounded-full`} />
        </span>
    );
}
