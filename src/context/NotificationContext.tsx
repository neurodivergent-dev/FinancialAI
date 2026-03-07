import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

interface NotificationSettings {
  enabled: boolean;
  paymentReminders: boolean;
  budgetAlerts: boolean;
  weeklyReports: boolean;
  dailyReminder: boolean;
  dailyReminderTime: string; // HH:MM format
}

interface NotificationContextType {
  settings: NotificationSettings;
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  requestPermissions: () => Promise<boolean>;
  hasPermission: boolean;
  schedulePaymentReminder: (title: string, body: string, date: Date) => Promise<void>;
  scheduleDailyReminder: () => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const SETTINGS_STORAGE_KEY = '@notification_settings';

const defaultSettings: NotificationSettings = {
  enabled: false,
  paymentReminders: true,
  budgetAlerts: true,
  weeklyReports: false,
  dailyReminder: false,
  dailyReminderTime: '09:00',
};

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Configure Android Channel for high priority
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#9333EA',
  });
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [hasPermission, setHasPermission] = useState(false);
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    loadSettings();
    checkPermissions();

    // Listener for notifications received while app is open
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Listener for when user interacts with notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const checkPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const requestPermissions = async (): Promise<boolean> => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    const granted = finalStatus === 'granted';
    setHasPermission(granted);

    if (!granted) {
      console.log('Notification permissions not granted');
    }

    return granted;
  };

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    try {
      const updated = { ...settings, ...newSettings };
      setSettings(updated);
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));

      // If notifications are being disabled, cancel all
      if (newSettings.enabled === false) {
        await cancelAllNotifications();
      }

      // If daily reminder settings changed, reschedule
      if (newSettings.dailyReminder !== undefined || newSettings.dailyReminderTime !== undefined) {
        if (updated.dailyReminder && updated.enabled) {
          await scheduleDailyReminder();
        } else {
          await Notifications.cancelAllScheduledNotificationsAsync();
        }
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  };

  const schedulePaymentReminder = async (title: string, body: string, date: Date) => {
    if (!settings.enabled || !settings.paymentReminders || !hasPermission) {
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: date,
      });
    } catch (error) {
      console.error('Error scheduling payment reminder:', error);
    }
  };

  const scheduleDailyReminder = async () => {
    if (!settings.enabled || !settings.dailyReminder || !hasPermission) {
      return;
    }

    try {
      // Cancel existing daily reminders first
      await Notifications.cancelAllScheduledNotificationsAsync();

      const [hours, minutes] = settings.dailyReminderTime.split(':').map(Number);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💰 Günlük Finansal Kontrol',
          body: 'Bugünün harcamalarını kontrol etmeyi unutma!',
          sound: true,
          priority: Notifications.AndroidNotificationPriority.DEFAULT,
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
        },
      });

      console.log(`Daily reminder scheduled for ${settings.dailyReminderTime}`);
    } catch (error) {
      console.error('Error scheduling daily reminder:', error);
    }
  };

  const cancelAllNotifications = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        settings,
        updateSettings,
        requestPermissions,
        hasPermission,
        schedulePaymentReminder,
        scheduleDailyReminder,
        cancelAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
