"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

// Notification types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  autoClose?: boolean;
  timestamp: Date;
}

// Notification context
interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Notification provider component
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      autoClose: notification.autoClose ?? true,
      duration: notification.duration ?? 5000
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-close notification
    if (newNotification.autoClose && newNotification.duration) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, newNotification.duration);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Listen for real-time notifications
  useEffect(() => {
    const handleRealtimeNotification = (event: CustomEvent) => {
      const { title, message, type } = event.detail;
      addNotification({
        type: type || 'info',
        title,
        message,
        autoClose: true,
        duration: 5000
      });
    };

    window.addEventListener('show-notification', handleRealtimeNotification as EventListener);

    return () => {
      window.removeEventListener('show-notification', handleRealtimeNotification as EventListener);
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, clearAll }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

// Hook to use notifications
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

// Notification container component
function NotificationContainer() {
  const { notifications, removeNotification, clearAll } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={() => removeNotification(notification.id)}
        />
      ))}
      
      {notifications.length > 1 && (
        <button
          onClick={clearAll}
          className="w-full px-3 py-2 text-xs text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 transition-colors"
        >
          Clear All
        </button>
      )}
    </div>
  );
}

// Individual notification component
function NotificationItem({ 
  notification, 
  onRemove 
}: { 
  notification: Notification; 
  onRemove: () => void;
}) {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = () => {
    switch (notification.type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  return (
    <div className={`p-4 border rounded-lg shadow-lg ${getBackgroundColor()} ${getTextColor()} transition-all duration-300 ease-in-out transform hover:scale-105`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium">
            {notification.title}
          </h4>
          <p className="text-sm mt-1 opacity-90">
            {notification.message}
          </p>
          <p className="text-xs mt-2 opacity-70">
            {notification.timestamp.toLocaleTimeString()}
          </p>
        </div>
        
        <button
          onClick={onRemove}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Toast notification component (for quick messages)
export function Toast({ 
  type, 
  message, 
  duration = 3000 
}: { 
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}) {
  const { addNotification } = useNotifications();

  useEffect(() => {
    addNotification({
      type,
      title: type.charAt(0).toUpperCase() + type.slice(1),
      message,
      duration,
      autoClose: true
    });
  }, [type, message, duration, addNotification]);

  return null;
}

// Success toast
export function SuccessToast({ message, duration }: { message: string; duration?: number }) {
  return <Toast type="success" message={message} duration={duration} />;
}

// Error toast
export function ErrorToast({ message, duration }: { message: string; duration?: number }) {
  return <Toast type="error" message={message} duration={duration} />;
}

// Warning toast
export function WarningToast({ message, duration }: { message: string; duration?: number }) {
  return <Toast type="warning" message={message} duration={duration} />;
}

// Info toast
export function InfoToast({ message, duration }: { message: string; duration?: number }) {
  return <Toast type="info" message={message} duration={duration} />;
} 