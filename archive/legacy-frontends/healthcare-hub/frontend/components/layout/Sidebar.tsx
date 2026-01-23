"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Home,
  Users,
  Settings,
  BarChart3,
  FileText,
  Calendar,
  MessageSquare,
  Phone,
  Video,
  Mail,
  Database,
  Shield,
  Globe,
  Smartphone,
  Palette,
  Code,
  Activity,
  TrendingUp,
  Target,
  Award,
  Star,
  Plus,
  ChevronDown,
  ChevronRight,
  LogOut,
  Stethoscope,
  Clipboard
} from 'lucide-react';

interface SidebarProps {
  appType?: string;
  modules?: Module[];
  onModuleClick?: (module: Module) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onLogout?: () => void;
}

interface Module {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: string;
  children?: Module[];
  isActive?: boolean;
}

export function Sidebar({ 
  appType = "healthcare",
  modules = [],
  onModuleClick,
  collapsed = false,
  onToggleCollapse,
  onLogout
}: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getDefaultModules = (type: string): Module[] => {
    const baseModules = [
      {
        id: 'dashboard',
        name: 'Dashboard',
        icon: Home,
        href: '/',
        isActive: true
      },
      {
        id: 'addons',
        name: 'Add-ons',
        icon: Plus,
        href: '/addons'
      },
      {
        id: 'analytics',
        name: 'Analytics',
        icon: BarChart3,
        href: '/analytics'
      },
      {
        id: 'users',
        name: 'Users',
        icon: Users,
        href: '/users'
      },
      {
        id: 'settings',
        name: 'Settings',
        icon: Settings,
        href: '/settings'
      }
    ];

    switch (type) {
      case 'healthcare':
        return [
          ...baseModules,
          {
            id: 'patients',
            name: 'Patients',
            icon: Users,
            href: '/patients'
          },
          {
            id: 'appointments',
            name: 'Appointments',
            icon: Calendar,
            href: '/appointments'
          },
          {
            id: 'medical-records',
            name: 'Medical Records',
            icon: Clipboard,
            href: '/medical-records'
          }
        ];
      default:
        return baseModules;
    }
  };

  const displayModules = modules.length > 0 ? modules : getDefaultModules(appType);

  return (
    <div className={`bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="p-4">
        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="w-full mb-4"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        {/* Navigation Items */}
        <nav className="space-y-2">
          {displayModules.map((module) => (
            <div key={module.id}>
              <Button
                variant={module.isActive ? "default" : "ghost"}
                size="sm"
                className={`w-full justify-start ${
                  collapsed ? 'justify-center' : ''
                }`}
                onClick={() => onModuleClick?.(module)}
              >
                <module.icon className="h-4 w-4 mr-2" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{module.name}</span>
                    {module.badge && (
                      <Badge variant="secondary" className="ml-2">
                        {module.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            </div>
          ))}
        </nav>

        {/* Logout Button */}
        {onLogout && (
          <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className={`w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 ${
                collapsed ? 'justify-center' : ''
              }`}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {!collapsed && <span>Logout</span>}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}