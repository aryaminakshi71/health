"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  User, 
  Calendar, 
  FileText, 
  Pill, 
  MessageSquare, 
  CreditCard, 
  Clipboard, 
  Settings,
  Bell,
  Search,
  LogOut,
  ChevronDown,
  ChevronRight,
  Home,
  Heart,
  Activity,
  BookOpen,
  Shield,
  HelpCircle,
  Info,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Menu,
  X,
  Plus,
  Eye,
  Download,
  Edit,
  Star,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { Patient, PatientNotification } from './interfaces/patient';

interface PatientPortalLayoutProps {
  patient: Patient;
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  notifications?: PatientNotification[];
  onNotificationClick?: (notification: PatientNotification) => void;
  onLogout?: () => void;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  color: string;
  badge?: string;
}

export default function PatientPortalLayout({
  patient,
  children,
  activeTab = 'dashboard',
  onTabChange,
  notifications = [],
  onNotificationClick,
  onLogout
}: PatientPortalLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const unreadNotifications = notifications.filter(n => !n.read);

  const quickActions: QuickAction[] = [
    {
      id: 'schedule-appointment',
      title: 'Schedule Appointment',
      description: 'Book a new appointment',
      icon: Calendar,
      action: () => onTabChange?.('appointments'),
      color: 'bg-blue-500',
      badge: 'New'
    },
    {
      id: 'request-refill',
      title: 'Request Refill',
      description: 'Refill your medications',
      icon: Pill,
      action: () => onTabChange?.('medications'),
      color: 'bg-green-500'
    },
    {
      id: 'send-message',
      title: 'Send Message',
      description: 'Contact your provider',
      icon: MessageSquare,
      action: () => onTabChange?.('messages'),
      color: 'bg-purple-500'
    },
    {
      id: 'view-results',
      title: 'View Results',
      description: 'Check test results',
      icon: FileText,
      action: () => onTabChange?.('test-results'),
      color: 'bg-orange-500'
    }
  ];

  const navigationTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'test-results', label: 'Test Results', icon: FileText },
    { id: 'medications', label: 'Medications', icon: Pill },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'forms', label: 'Forms', icon: Clipboard },
    { id: 'education', label: 'Education', icon: BookOpen },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment': return <Calendar className="w-4 h-4" />;
      case 'test-result': return <FileText className="w-4 h-4" />;
      case 'medication': return <Pill className="w-4 h-4" />;
      case 'payment': return <CreditCard className="w-4 h-4" />;
      case 'message': return <MessageSquare className="w-4 h-4" />;
      case 'reminder': return <Bell className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'normal': return 'text-blue-600';
      case 'low': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">Patient Portal</h1>
                <p className="text-xs text-gray-500">Healthcare Hub</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Patient Info */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-sm truncate">
                  {patient.firstName} {patient.lastName}
                </h2>
                <p className="text-xs text-gray-500 truncate">{patient.email}</p>
                <Badge className="text-xs mt-1" variant="outline">
                  {patient.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    onTabChange?.(tab.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Quick Actions */}
          <div className="p-4 border-t">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <div className={`w-6 h-6 ${action.color} rounded flex items-center justify-center`}>
                      <Icon className="w-3 h-3 text-white" />
                    </div>
                    <span className="flex-1 text-left">{action.title}</span>
                    {action.badge && (
                      <Badge className="text-xs bg-red-100 text-red-800">
                        {action.badge}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Secure Portal</span>
              <Shield className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              
              <div className="hidden md:flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifications.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs bg-red-500 text-white">
                      {unreadNotifications.length}
                    </Badge>
                  )}
                </Button>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                    <div className="p-4 border-b">
                      <h3 className="font-semibold">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => {
                              onNotificationClick?.(notification);
                              setNotificationsOpen(false);
                            }}
                            className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`mt-1 ${getNotificationColor(notification.priority)}`}>
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm">{notification.title}</h4>
                                <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                  {formatDate(notification.timestamp)}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No notifications</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="hidden md:block text-sm font-medium">
                    {patient.firstName}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </Button>

                {/* User Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                    <div className="p-4 border-b">
                      <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                      <p className="text-sm text-gray-500">{patient.email}</p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => {
                          onTabChange?.('profile');
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </button>
                      <button
                        onClick={() => {
                          onTabChange?.('settings');
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </button>
                      <button
                        onClick={() => {
                          onLogout?.();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Click outside to close dropdowns */}
      {(notificationsOpen || userMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setNotificationsOpen(false);
            setUserMenuOpen(false);
          }}
        />
      )}
    </div>
  );
} 