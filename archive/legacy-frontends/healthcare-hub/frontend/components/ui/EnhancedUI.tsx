"use client";

import React from 'react';

// Loading Skeleton Component
export const LoadingSkeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}>
    <div className="h-4 bg-gray-300 rounded mb-2"></div>
    <div className="h-4 bg-gray-300 rounded mb-2 w-3/4"></div>
    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
  </div>
);

// Error Boundary Component
export const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="error-boundary">{children}</div>;
};

// Status Indicator Component
export const StatusIndicator: React.FC<{ 
  status: 'online' | 'offline' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
}> = ({ status, size = 'md' }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-gray-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'w-2 h-2';
      case 'md': return 'w-3 h-3';
      case 'lg': return 'w-4 h-4';
      default: return 'w-3 h-3';
    }
  };

  return (
    <div className={`inline-block rounded-full ${getStatusColor()} ${getSizeClass()}`}></div>
  );
};

// Progress Bar Component
export const ProgressBar: React.FC<{
  progress: number;
  className?: string;
  showLabel?: boolean;
}> = ({ progress, className = "", showLabel = false }) => (
  <div className={`w-full bg-gray-200 rounded-full ${className}`}>
    <div 
      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
      style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
    ></div>
    {showLabel && (
      <div className="text-xs text-gray-600 mt-1">
        {Math.round(progress)}%
      </div>
    )}
  </div>
);

// Badge Component
export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
}> = ({ children, variant = 'default', size = 'md' }) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'px-2 py-1 text-xs';
      case 'md': return 'px-3 py-1 text-sm';
      case 'lg': return 'px-4 py-2 text-base';
      default: return 'px-3 py-1 text-sm';
    }
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${getVariantClasses()} ${getSizeClasses()}`}>
      {children}
    </span>
  );
};

// Tooltip Component
export const Tooltip: React.FC<{
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}> = ({ children, content, position = 'top' }) => {
  const getPositionClasses = () => {
    switch (position) {
      case 'top': return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom': return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left': return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right': return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default: return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  return (
    <div className="relative group">
      {children}
      <div className={`absolute z-10 px-2 py-1 text-sm text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${getPositionClasses()}`}>
        {content}
      </div>
    </div>
  );
};

// Modal Component
export const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'max-w-sm';
      case 'md': return 'max-w-md';
      case 'lg': return 'max-w-lg';
      case 'xl': return 'max-w-xl';
      default: return 'max-w-md';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <div className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${getSizeClasses()} w-full`}>
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Notification Component
export const Notification: React.FC<{
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  onClose?: () => void;
}> = ({ type, title, message, onClose }) => {
  const getTypeClasses = () => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className={`border rounded-md p-4 ${getTypeClasses()}`}>
      <div className="flex">
        <div className="flex-1">
          <h4 className="text-sm font-medium">{title}</h4>
          <p className="text-sm mt-1">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}; 