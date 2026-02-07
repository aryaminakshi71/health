import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: { id: string; email: string; name: string } | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (user: { id: string; email: string; name: string }, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      login: (user, token) => set({ user, isAuthenticated: true, token }),
      logout: () => set({ user: null, isAuthenticated: false, token: null }),
    }),
    {
      name: 'mobile-auth-storage',
    }
  )
);

interface NotificationSettings {
  appointments: boolean;
  labResults: boolean;
  medications: boolean;
  messages: boolean;
  reminders: boolean;
}

interface SettingsState {
  notifications: NotificationSettings;
  biometricEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
  setNotifications: (notifications: Partial<NotificationSettings>) => void;
  setBiometricEnabled: (enabled: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notifications: {
        appointments: true,
        labResults: true,
        medications: true,
        messages: true,
        reminders: true,
      },
      biometricEnabled: false,
      theme: 'system',
      language: 'en',
      setNotifications: (notifications) =>
        set((state) => ({
          notifications: { ...state.notifications, ...notifications },
        })),
      setBiometricEnabled: (enabled) => set({ biometricEnabled: enabled }),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'mobile-settings-storage',
    }
  )
);

interface OfflineState {
  pendingActions: Array<{ id: string; type: string; data: any }>;
  lastSyncTime: Date | null;
  addPendingAction: (action: { type: string; data: any }) => void;
  removePendingAction: (id: string) => void;
  clearPendingActions: () => void;
  setLastSyncTime: (time: Date) => void;
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set) => ({
      pendingActions: [],
      lastSyncTime: null,
      addPendingAction: (action) =>
        set((state) => ({
          pendingActions: [...state.pendingActions, { ...action, id: crypto.randomUUID() }],
        })),
      removePendingAction: (id) =>
        set((state) => ({
          pendingActions: state.pendingActions.filter((a) => a.id !== id),
        })),
      clearPendingActions: () => set({ pendingActions: [] }),
      setLastSyncTime: (time) => set({ lastSyncTime: time }),
    }),
    {
      name: 'mobile-offline-storage',
    }
  )
);
