import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Notification configuration
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface FitnessLogNotification {
  id: string;
  title: string;
  body: string;
  day: number;
  scheduledDate: Date;
}

const NOTIFICATION_STORAGE_KEY = 'fitness_log_notifications';
const NOTIFICATION_CATEGORY = 'fitness_log_reminder';

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Notification permission not granted');
      return false;
    }

    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(NOTIFICATION_CATEGORY, {
        name: 'Fitness Log Reminders',
        description: 'Daily reminders to complete your OACP fitness log entries',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1E40AF',
        sound: 'default',
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Schedule notifications for a 14-day fitness log
 */
export async function scheduleFitnessLogNotifications(
  startDate: string,
  logId: string
): Promise<FitnessLogNotification[]> {
  try {
    // Request permissions first
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn('Cannot schedule notifications without permission');
      return [];
    }

    const notifications: FitnessLogNotification[] = [];
    const start = new Date(startDate);

    // Cancel any existing notifications for this log
    await cancelFitnessLogNotifications(logId);

    // Schedule 14 daily notifications at 8:00 PM
    for (let day = 1; day <= 14; day++) {
      const notificationDate = new Date(start);
      notificationDate.setDate(start.getDate() + (day - 1));
      notificationDate.setHours(20, 0, 0, 0); // 8:00 PM

      // Don't schedule past notifications
      if (notificationDate <= new Date()) {
        continue;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'OACP Fitness Log Reminder',
          body: `Complete Day ${day} of your 14-day fitness log`,
          data: {
            logId,
            day,
            type: 'fitness_log_reminder'
          },
          categoryIdentifier: NOTIFICATION_CATEGORY,
        },
        trigger: {
          date: notificationDate,
        },
      });

      notifications.push({
        id: notificationId,
        title: 'OACP Fitness Log Reminder',
        body: `Complete Day ${day} of your 14-day fitness log`,
        day,
        scheduledDate: notificationDate,
      });
    }

    // Store notification IDs for this log
    await storeNotificationIds(logId, notifications.map(n => n.id));

    console.log(`Scheduled ${notifications.length} notifications for fitness log ${logId}`);
    return notifications;
  } catch (error) {
    console.error('Error scheduling fitness log notifications:', error);
    return [];
  }
}

/**
 * Cancel all notifications for a specific fitness log
 */
export async function cancelFitnessLogNotifications(logId: string): Promise<void> {
  try {
    // Get stored notification IDs for this log
    const notificationIds = await getStoredNotificationIds(logId);
    
    if (notificationIds.length > 0) {
      // Cancel each notification individually
      for (const notificationId of notificationIds) {
        try {
          await Notifications.cancelScheduledNotificationAsync(notificationId);
        } catch (error) {
          console.warn(`Failed to cancel notification ${notificationId}:`, error);
        }
      }
      
      // Remove from storage
      await removeStoredNotificationIds(logId);
      
      console.log(`Cancelled ${notificationIds.length} notifications for log ${logId}`);
    }

    // Also cancel any notifications that might not be in storage
    const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
    const fitnessLogNotifications = allScheduled.filter(
      notification => notification.content.data?.logId === logId
    );

    for (const notification of fitnessLogNotifications) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  } catch (error) {
    console.error('Error cancelling fitness log notifications:', error);
  }
}

/**
 * Cancel all fitness log notifications (cleanup)
 */
export async function cancelAllFitnessLogNotifications(): Promise<void> {
  try {
    const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
    const fitnessLogNotifications = allScheduled.filter(
      notification => notification.content.data?.type === 'fitness_log_reminder'
    );

    for (const notification of fitnessLogNotifications) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }

    // Clear stored notification IDs
    await AsyncStorage.removeItem(NOTIFICATION_STORAGE_KEY);
    
    console.log(`Cancelled ${fitnessLogNotifications.length} fitness log notifications`);
  } catch (error) {
    console.error('Error cancelling all fitness log notifications:', error);
  }
}

/**
 * Get all scheduled fitness log notifications
 */
export async function getScheduledFitnessLogNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
    return allScheduled.filter(
      notification => notification.content.data?.type === 'fitness_log_reminder'
    );
  } catch (error) {
    console.error('Error getting scheduled fitness log notifications:', error);
    return [];
  }
}

/**
 * Store notification IDs for a log
 */
async function storeNotificationIds(logId: string, notificationIds: string[]): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEY);
    const notifications = stored ? JSON.parse(stored) : {};
    
    notifications[logId] = notificationIds;
    
    await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.error('Error storing notification IDs:', error);
  }
}

/**
 * Get stored notification IDs for a log
 */
async function getStoredNotificationIds(logId: string): Promise<string[]> {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (!stored) return [];
    
    const notifications = JSON.parse(stored);
    return notifications[logId] || [];
  } catch (error) {
    console.error('Error getting stored notification IDs:', error);
    return [];
  }
}

/**
 * Remove stored notification IDs for a log
 */
async function removeStoredNotificationIds(logId: string): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (!stored) return;
    
    const notifications = JSON.parse(stored);
    delete notifications[logId];
    
    await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.error('Error removing stored notification IDs:', error);
  }
}

/**
 * Check if notifications are enabled
 */
export async function areNotificationsEnabled(): Promise<boolean> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking notification permissions:', error);
    return false;
  }
}

/**
 * Get notification settings
 */
export async function getNotificationSettings(): Promise<{
  enabled: boolean;
  scheduledCount: number;
}> {
  try {
    const enabled = await areNotificationsEnabled();
    const scheduled = await getScheduledFitnessLogNotifications();
    
    return {
      enabled,
      scheduledCount: scheduled.length,
    };
  } catch (error) {
    console.error('Error getting notification settings:', error);
    return {
      enabled: false,
      scheduledCount: 0,
    };
  }
}

/**
 * Handle notification response (when user taps notification)
 */
export function handleNotificationResponse(
  response: Notifications.NotificationResponse,
  onNavigate?: (logId: string, day: number) => void
): void {
  try {
    const { logId, day } = response.notification.request.content.data as {
      logId: string;
      day: number;
      type: string;
    };

    if (logId && day && onNavigate) {
      onNavigate(logId, day);
    }
  } catch (error) {
    console.error('Error handling notification response:', error);
  }
}

/**
 * Setup notification listener
 */
export function setupNotificationListener(
  onNavigate?: (logId: string, day: number) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(response => {
    handleNotificationResponse(response, onNavigate);
  });
}

/**
 * Cleanup function to remove notification listener
 */
export function removeNotificationListener(subscription: Notifications.Subscription): void {
  Notifications.removeNotificationSubscription(subscription);
}
