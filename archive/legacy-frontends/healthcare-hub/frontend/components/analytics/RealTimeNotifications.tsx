"use client";

import React, { useEffect, useState } from 'react';
import { createWebSocketManager } from '@/utils/websocket';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export function RealTimeNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [wsManager, setWsManager] = useState<any>(null);

  useEffect(() => {
    const manager = createWebSocketManager('ws://localhost:8000/ws');
    setWsManager(manager);

    manager.on('message', (message: any) => {
      if (message.type === 'notification') {
        const notification: Notification = {
          id: Math.random().toString(36).substr(2, 9),
          type: message.data.type,
          title: message.data.title,
          message: message.data.message,
          timestamp: new Date(),
          read: false,
        };
        
        setNotifications(prev => [notification, ...prev]);
      }
    });

    manager.connect();

    return () => {
      manager.disconnect();
    };
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg shadow-lg max-w-sm ${
            notification.read ? 'opacity-75' : ''
          } ${
            notification.type === 'success' ? 'bg-green-500 text-white' :
            notification.type === 'error' ? 'bg-red-500 text-white' :
            notification.type === 'warning' ? 'bg-yellow-500 text-black' :
            'bg-blue-500 text-white'
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold">{notification.title}</h4>
              <p className="text-sm mt-1">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs opacity-75">
              {notification.timestamp.toLocaleTimeString()}
            </span>
            {!notification.read && (
              <button
                onClick={() => markAsRead(notification.id)}
                className="text-xs underline"
              >
                Mark as read
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
