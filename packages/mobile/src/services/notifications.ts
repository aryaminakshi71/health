import { apiClient } from './api';

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  icon?: string;
  badge?: string;
}

export class PushNotificationService {
  private static instance: PushNotificationService;
  private notificationPermission: NotificationPermission = 'default';
  private fcmToken: string | null = null;

  private constructor() {}

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  async initialize(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (!('serviceWorker' in navigator)) {
      console.warn('Service workers are not supported');
      return false;
    }

    this.notificationPermission = await Notification.requestPermission();
    return this.notificationPermission === 'granted';
  }

  async registerForPush(): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.VAPID_PUBLIC_KEY,
      });

      const subscriptionJson = subscription.toJSON();
      
      await apiClient.post('/mobile/push/subscribe', {
        endpoint: subscriptionJson.endpoint,
        keys: subscriptionJson.keys,
      });

      return true;
    } catch (error) {
      console.error('Failed to register for push:', error);
      return false;
    }
  }

  async showLocalNotification(payload: PushNotificationPayload): Promise<void> {
    if (this.notificationPermission !== 'granted') {
      const granted = await this.initialize();
      if (!granted) return;
    }

    const registration = await navigator.serviceWorker.ready;
    registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/icons/notification-icon.png',
      badge: payload.badge || '/icons/badge-icon.png',
      data: payload.data,
      vibrate: [200, 100, 200],
      requireInteraction: true,
    });
  }

  onNotificationClick(callback: (event: NotificationEvent) => void): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('notificationclick', callback);
    }
  }

  getPermissionStatus(): NotificationPermission {
    return this.notificationPermission;
  }
}

export const pushNotifications = PushNotificationService.getInstance();
