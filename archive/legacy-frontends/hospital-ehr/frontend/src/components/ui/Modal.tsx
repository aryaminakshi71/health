'use client';

import React, { Fragment, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    showClose?: boolean;
}

const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[90vw]'
};

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showClose = true
}: ModalProps) {
    const handleEscape = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, handleEscape]);

    if (!isOpen) return null;

    return (
        <Fragment>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fadeIn"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className={`
                        bg-white rounded-2xl shadow-2xl w-full pointer-events-auto
                        animate-slideUp
                        ${sizeClasses[size]}
                        max-h-[90vh] overflow-hidden flex flex-col
                    `}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    {(title || showClose) && (
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            {title && (
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {title}
                                </h2>
                            )}
                            {showClose && (
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-gray-100 transition-colors group"
                                >
                                    <X className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                                </button>
                            )}
                        </div>
                    )}
                    
                    {/* Content */}
                    <div className="p-6 overflow-y-auto">
                        {children}
                    </div>
                </div>
            </div>
        </Fragment>
    );
}

// Confirmation Dialog
interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'info',
    isLoading = false
}: ConfirmDialogProps) {
    const variantClasses = {
        danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        warning: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
        info: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm" showClose={false}>
            <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`
                            px-4 py-2 text-white rounded-lg transition-colors font-medium
                            focus:outline-none focus:ring-2 focus:ring-offset-2
                            ${variantClasses[variant]}
                            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Processing...
                            </span>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
