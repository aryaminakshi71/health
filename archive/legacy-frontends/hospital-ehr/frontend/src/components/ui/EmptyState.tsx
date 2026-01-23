'use client';

import React from 'react';
import { Search, FileText, Users, Calendar, Pill, FlaskConical } from 'lucide-react';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    variant?: 'default' | 'search' | 'patients' | 'appointments' | 'inventory' | 'lab';
}

const variantConfig = {
    default: {
        icon: <FileText className="h-12 w-12 text-gray-300" />,
        bgGradient: 'from-gray-50 to-gray-100'
    },
    search: {
        icon: <Search className="h-12 w-12 text-gray-300" />,
        bgGradient: 'from-blue-50 to-indigo-50'
    },
    patients: {
        icon: <Users className="h-12 w-12 text-blue-300" />,
        bgGradient: 'from-blue-50 to-cyan-50'
    },
    appointments: {
        icon: <Calendar className="h-12 w-12 text-purple-300" />,
        bgGradient: 'from-purple-50 to-pink-50'
    },
    inventory: {
        icon: <Pill className="h-12 w-12 text-teal-300" />,
        bgGradient: 'from-teal-50 to-emerald-50'
    },
    lab: {
        icon: <FlaskConical className="h-12 w-12 text-amber-300" />,
        bgGradient: 'from-amber-50 to-orange-50'
    }
};

export function EmptyState({
    icon,
    title,
    description,
    actionLabel,
    onAction,
    variant = 'default'
}: EmptyStateProps) {
    const config = variantConfig[variant];
    
    return (
        <div className={`
            flex flex-col items-center justify-center
            px-8 py-16 rounded-2xl
            bg-gradient-to-b ${config.bgGradient}
            text-center
        `}>
            <div className="mb-4">
                {icon || config.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {title}
            </h3>
            {description && (
                <p className="text-gray-500 max-w-md mb-6">
                    {description}
                </p>
            )}
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl
                               font-medium hover:bg-blue-700 transition-colors
                               shadow-lg shadow-blue-200"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}

// Pre-configured empty states for common scenarios
export function EmptyPatients({ onNewPatient }: { onNewPatient?: () => void }) {
    return (
        <EmptyState
            variant="patients"
            title="No Patients Found"
            description="Get started by registering your first patient in the system."
            actionLabel="Register New Patient"
            onAction={onNewPatient}
        />
    );
}

export function EmptySearchResults({ searchTerm, onClear }: { searchTerm: string; onClear?: () => void }) {
    return (
        <EmptyState
            variant="search"
            title="No Results Found"
            description={`We couldn't find any results for "${searchTerm}". Try a different search term or clear the filter.`}
            actionLabel="Clear Search"
            onAction={onClear}
        />
    );
}

export function EmptyAppointments({ onSchedule }: { onSchedule?: () => void }) {
    return (
        <EmptyState
            variant="appointments"
            title="No Appointments Today"
            description="You don't have any appointments scheduled for today."
            actionLabel="Schedule Appointment"
            onAction={onSchedule}
        />
    );
}

export function EmptyInventory({ onAdd }: { onAdd?: () => void }) {
    return (
        <EmptyState
            variant="inventory"
            title="No Inventory Items"
            description="Add medicines and supplies to your pharmacy inventory."
            actionLabel="Add Item"
            onAction={onAdd}
        />
    );
}

export function EmptyLabOrders({ onNewOrder }: { onNewOrder?: () => void }) {
    return (
        <EmptyState
            variant="lab"
            title="No Lab Orders"
            description="There are no lab orders to display at the moment."
            actionLabel="Create New Order"
            onAction={onNewOrder}
        />
    );
}
