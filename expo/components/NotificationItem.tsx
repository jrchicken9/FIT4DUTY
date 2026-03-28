import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Pressable } from 'react-native';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  ChevronRight,
  Trash2 
} from 'lucide-react-native';
import { Notification, NotificationPriority } from '@/context/NotificationContext';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows, strokeWidth, sizes } from '@/constants/designSystem';
import { useTapAnimation } from '@/hooks/useTapAnimation';
import { router } from 'expo-router';

interface NotificationItemProps {
  notification: Notification;
  onPress: (notification: Notification) => void;
  onDelete: (notificationId: string) => void;
  onMarkAsRead: (notificationId: string) => void;
}

export default function NotificationItem({
  notification,
  onPress,
  onDelete,
  onMarkAsRead,
}: NotificationItemProps) {
  const { handlePressIn, handlePressOut, animatedStyle } = useTapAnimation();

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case 'urgent':
        return Colors.error;
      case 'high':
        return Colors.warning;
      case 'medium':
        return Colors.primary;
      case 'low':
        return Colors.textSecondary;
      default:
        return Colors.textSecondary;
    }
  };

  const getPriorityIcon = (priority: NotificationPriority) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle size={sizes.sm} color={Colors.error} />;
      case 'high':
        return <AlertCircle size={sizes.sm} color={Colors.warning} />;
      case 'medium':
        return <Info size={sizes.sm} color={Colors.primary} />;
      case 'low':
        return <Info size={sizes.sm} color={Colors.textSecondary} />;
      default:
        return <Info size={sizes.sm} color={Colors.textSecondary} />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };



  const handlePress = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
    
    if (notification.action_url) {
      router.push(notification.action_url as any);
    } else {
      onPress(notification);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={({ pressed }) => [
        styles.container,
        !notification.is_read && styles.unread,
        { borderLeftColor: getPriorityColor(notification.priority) },
        pressed && { opacity: 0.8 }
      ]}
    >
      <Animated.View style={[styles.animatedContainer, animatedStyle]}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              {getPriorityIcon(notification.priority)}
              <Text style={[
                styles.title,
                !notification.is_read && styles.unreadTitle
              ]}>
                {notification.title}
              </Text>
            </View>
            
            <View style={styles.actions}>
              {!notification.is_read && (
                <Pressable
                  style={styles.actionButton}
                  onPress={() => onMarkAsRead(notification.id)}
                >
                  <CheckCircle size={sizes.sm} color={Colors.success} />
                </Pressable>
              )}
              
              <Pressable
                style={styles.actionButton}
                onPress={() => onDelete(notification.id)}
              >
                <Trash2 size={sizes.sm} color={Colors.textSecondary} />
              </Pressable>
            </View>
          </View>

          <Text style={[
            styles.message,
            !notification.is_read && styles.unreadMessage
          ]}>
            {notification.message}
          </Text>

          <View style={styles.footer}>
            <View style={styles.timeContainer}>
              <Clock size={sizes.xs} color={Colors.textSecondary} />
              <Text style={styles.timeText}>
                {formatTime(notification.created_at)}
              </Text>
            </View>



            {notification.is_actionable && (
              <View style={styles.actionContainer}>
                <Text style={styles.actionText}>
                  {notification.action_text || 'View'}
                </Text>
                <ChevronRight size={sizes.xs} color={Colors.primary} />
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    borderLeftWidth: strokeWidth.normal,
    borderWidth: 1,
    borderColor: Colors.policeRedBorder,
    ...shadows.level2,
  },
  animatedContainer: {
    flex: 1,
  },
  unread: {
    backgroundColor: Colors.background,
    borderLeftWidth: strokeWidth.thick,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  title: {
    ...typography.labelLarge,
    color: Colors.text,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    padding: spacing.xs,
  },
  message: {
    ...typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: spacing.sm,
  },
  unreadMessage: {
    color: Colors.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  timeText: {
    ...typography.labelSmall,
    color: Colors.textSecondary,
  },

  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionText: {
    ...typography.labelSmall,
    color: Colors.primary,
    fontWeight: '600',
  },
});
