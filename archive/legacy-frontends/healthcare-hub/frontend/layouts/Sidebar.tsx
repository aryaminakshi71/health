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
} from 'lucide-react';

interface SidebarProps {
  appType?: string;
  modules?: Module[];
  onModuleClick?: (module: Module) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
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
  appType = "general",
  modules = [],
  onModuleClick,
  collapsed = false,
  onToggleCollapse
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
            icon: FileText,
            href: '/medical-records'
          }
        ];
      case 'communication':
        return [
          ...baseModules,
          {
            id: 'calls',
            name: 'Calls',
            icon: Phone,
            href: '/calls'
          },
          {
            id: 'messages',
            name: 'Messages',
            icon: MessageSquare,
            href: '/messages'
          },
          {
            id: 'video-conferences',
            name: 'Video Conferences',
            icon: Video,
            href: '/video-conferences'
          }
        ];
      case 'business':
        return [
          ...baseModules,
          {
            id: 'projects',
            name: 'Projects',
            icon: Target,
            href: '/projects'
          },
          {
            id: 'clients',
            name: 'Clients',
            icon: Users,
            href: '/clients'
          },
          {
            id: 'reports',
            name: 'Reports',
            icon: FileText,
            href: '/reports'
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
                    {module.children && module.children.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpanded(module.id);
                        }}
                        className="ml-2 p-0 h-4 w-4"
                      >
                        {expandedItems.includes(module.id) ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronRight className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                  </>
                )}
              </Button>

              {/* Sub-modules */}
              {module.children && module.children.length > 0 && expandedItems.includes(module.id) && !collapsed && (
                <div className="ml-4 mt-2 space-y-1">
                  {module.children.map((child) => (
                    <Button
                      key={child.id}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-sm"
                      onClick={() => onModuleClick?.(child)}
                    >
                      <child.icon className="h-3 w-3 mr-2" />
                      <span>{child.name}</span>
                      {child.badge && (
                        <Badge variant="secondary" className="ml-2">
                          {child.badge}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
