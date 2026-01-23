// User-related interfaces

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: string;
  department: string;
  manager: string;
  hireDate: string;
  status: 'active' | 'inactive' | 'terminated';
  permissions: string[];
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
  categories: string[];
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'team';
  dataSharing: boolean;
  analytics: boolean;
  marketing: boolean;
}
