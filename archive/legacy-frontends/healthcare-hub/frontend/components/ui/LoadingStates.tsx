"use client";

import React from 'react';
import { Loader2, Activity, Clock, CheckCircle, AlertCircle } from 'lucide-react';

// Loading spinner component
export function LoadingSpinner({ 
  size = 'md', 
  className = '' 
}: { 
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
}

// Loading skeleton component
export function LoadingSkeleton({ 
  className = '',
  lines = 3,
  height = 'h-4'
}: {
  className?: string;
  lines?: number;
  height?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`${height} bg-gray-200 rounded animate-pulse ${
            i === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
}

// Card loading skeleton
export function CardSkeleton({ 
  className = '',
  showImage = false 
}: {
  className?: string;
  showImage?: boolean;
}) {
  return (
    <div className={`p-6 border rounded-lg ${className}`}>
      {showImage && (
        <div className="w-full h-32 bg-gray-200 rounded mb-4 animate-pulse" />
      )}
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-full animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
      </div>
    </div>
  );
}

// Table loading skeleton
export function TableSkeleton({ 
  rows = 5, 
  columns = 4,
  className = ''
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden ${className}`}>
      {/* Header */}
      <div className="grid grid-cols-4 gap-4 p-4 border-b bg-gray-50">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-4 gap-4 p-4 border-b">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="h-4 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Page loading component
export function PageLoading({ 
  message = 'Loading...',
  showSpinner = true 
}: {
  message?: string;
  showSpinner?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      {showSpinner && <LoadingSpinner size="lg" />}
      <p className="text-gray-600 text-lg">{message}</p>
    </div>
  );
}

// Status indicator component
export function StatusIndicator({ 
  status,
  size = 'md',
  showLabel = false
}: {
  status: 'loading' | 'success' | 'error' | 'warning' | 'idle';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}) {
  const getStatusConfig = () => {
    switch (status) {
      case 'loading':
        return {
          icon: <Activity className="animate-pulse" />,
          color: 'text-blue-500',
          bgColor: 'bg-blue-100',
          label: 'Loading'
        };
      case 'success':
        return {
          icon: <CheckCircle />,
          color: 'text-green-500',
          bgColor: 'bg-green-100',
          label: 'Success'
        };
      case 'error':
        return {
          icon: <AlertCircle />,
          color: 'text-red-500',
          bgColor: 'bg-red-100',
          label: 'Error'
        };
      case 'warning':
        return {
          icon: <AlertCircle />,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-100',
          label: 'Warning'
        };
      case 'idle':
        return {
          icon: <Clock />,
          color: 'text-gray-500',
          bgColor: 'bg-gray-100',
          label: 'Idle'
        };
      default:
        return {
          icon: <Clock />,
          color: 'text-gray-500',
          bgColor: 'bg-gray-100',
          label: 'Unknown'
        };
    }
  };

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const config = getStatusConfig();

  return (
    <div className="flex items-center space-x-2">
      <div className={`${sizeClasses[size]} ${config.color}`}>
        {config.icon}
      </div>
      {showLabel && (
        <span className={`text-sm font-medium ${config.color}`}>
          {config.label}
        </span>
      )}
    </div>
  );
}

// Progress bar component
export function ProgressBar({ 
  progress, 
  className = '',
  showLabel = false,
  animated = false
}: {
  progress: number;
  className?: string;
  showLabel?: boolean;
  animated?: boolean;
}) {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  
  return (
    <div className={`w-full ${className}`}>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${
            animated ? 'animate-pulse' : ''
          } ${
            clampedProgress < 30 ? 'bg-red-500' :
            clampedProgress < 70 ? 'bg-yellow-500' : 'bg-green-500'
          }`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>Progress</span>
          <span>{Math.round(clampedProgress)}%</span>
        </div>
      )}
    </div>
  );
}

// Loading overlay component
export function LoadingOverlay({ 
  isVisible, 
  message = 'Loading...',
  className = ''
}: {
  isVisible: boolean;
  message?: string;
  className?: string;
}) {
  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white rounded-lg p-6 flex flex-col items-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-gray-700">{message}</p>
      </div>
    </div>
  );
}

// Infinite scroll loading component
export function InfiniteScrollLoading({ 
  hasMore, 
  isLoading 
}: {
  hasMore: boolean;
  isLoading: boolean;
}) {
  if (!hasMore) {
    return (
      <div className="text-center py-4 text-gray-500">
        No more items to load
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <LoadingSpinner />
      </div>
    );
  }

  return null;
}

// Button loading state
export function ButtonLoading({ 
  isLoading, 
  children, 
  loadingText = 'Loading...',
  className = ''
}: {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
}) {
  return (
    <button 
      disabled={isLoading} 
      className={`flex items-center space-x-2 ${className}`}
    >
      {isLoading && <LoadingSpinner size="sm" />}
      <span>{isLoading ? loadingText : children}</span>
    </button>
  );
} 