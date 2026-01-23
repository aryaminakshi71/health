'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const toastIcons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />
};

const toastBgColors: Record<ToastType, string> = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-amber-50 border-amber-200',
    info: 'bg-blue-50 border-blue-200'
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast = { ...toast, id };
        setToasts((prev) => [...prev, newToast]);

        // Auto-remove after duration
        const duration = toast.duration || 5000;
        if (duration > 0) {
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            
            {/* Toast Container */}
            <div className="fixed bottom-4 right-4 z-[100] space-y-3 w-96 max-w-[90vw]">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`
                            flex items-start gap-3 p-4 rounded-xl shadow-lg border
                            animate-slideInRight
                            ${toastBgColors[toast.type]}
                        `}
                    >
                        {toastIcons[toast.type]}
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900">{toast.title}</p>
                            {toast.message && (
                                <p className="text-sm text-gray-600 mt-1">{toast.message}</p>
                            )}
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                            <X className="h-4 w-4 text-gray-400" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

// Convenience functions
export function useToastHelpers() {
    const { addToast } = useToast();

    return {
        success: (title: string, message?: string) => 
            addToast({ type: 'success', title, message }),
        error: (title: string, message?: string) => 
            addToast({ type: 'error', title, message }),
        warning: (title: string, message?: string) => 
            addToast({ type: 'warning', title, message }),
        info: (title: string, message?: string) => 
            addToast({ type: 'info', title, message }),
    };
}
