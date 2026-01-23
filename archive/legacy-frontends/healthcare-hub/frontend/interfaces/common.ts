// Common interfaces used across all applications

export interface AppContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  user: Record<string, unknown> | null;
  setUser: (user: Record<string, unknown> | null) => void;
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  isOnline: boolean;
  isMobile: boolean;
  theme: string;
  setTheme: (theme: string) => void;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  status: 'online' | 'offline' | 'busy' | 'away';
  lastLogin: string;
  permissions: string[];
}

export interface BusinessModule {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  price: string;
  roi: string;
  timeToValue: string;
  businessOutcomes: string[];
  features: string[];
  status: 'active' | 'inactive';
  category: string;
  metrics: {
    revenue: string;
    costSavings: string;
    efficiency: string;
    userAdoption: string;
  };
}

export interface BusinessMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number;
  changeType: 'increase' | 'decrease';
  trend: 'up' | 'down' | 'stable';
  target: number;
  period: string;
}

export interface BusinessOpportunity {
  id: string;
  title: string;
  description: string;
  value: number;
  probability: number;
  expectedValue: number;
  status: 'open' | 'qualified' | 'proposal' | 'negotiation' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string;
  dueDate: string;
  tags: string[];
}
