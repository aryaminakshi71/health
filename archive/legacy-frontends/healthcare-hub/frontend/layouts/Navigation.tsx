"use client";

import React from 'react';
import { Bell, Search, User, Settings, LogOut, Menu } from 'lucide-react';

interface NavigationProps {
  title?: string;
  subtitle?: string;
  onToggleSidebar?: () => void;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export function Navigation({
  title = "Healthcare Hub",
  subtitle = "Patient Care Management",
  onToggleSidebar,
  user
}: NavigationProps) {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative">
            <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              3
            </span>
          </button>

          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-64 px-4 py-2 pl-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.name || "Dr. Smith"}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {user?.email || "doctor@healthcare.com"}
              </p>
            </div>
            
            <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <Settings className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <LogOut className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
