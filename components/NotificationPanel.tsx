import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  X,
  CheckCircle,
  Filter,
  Trash2,
  Settings,
  Bell,
  BellOff,
} from 'lucide-react-native';
import { useNotifications, Notification } from '@/context/NotificationContext';
import { useToast } from '@/context/ToastContext';
import NotificationItem from './NotificationItem';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows } from '@/constants/designSystem';

interface NotificationPanelProps {
  visible: boolean;
  onClose: () => void;
}

type FilterType = 'unread' | 'all';

const NotificationPanel = React.memo(function NotificationPanel({
  visible,
  onClose,
}: NotificationPanelProps) {
  const {
    notifications,
    unreadCount,
    isLoading,
    hasMoreNotifications,
    hasExpiredNotifications,
    showExpiredNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadNotifications,
    loadMoreNotifications,
    loadExpiredNotifications,
    toggleExpiredNotifications,
  } = useNotifications();

  const { showSuccess, showError, showWarning, showInfo } = useToast();

  const [filter, setFilter] = useState<FilterType>('unread');
  const [refreshing, setRefreshing] = useState(false);

  const filteredNotifications = notifications.filter((notification: any) => {
    switch (filter) {
      case 'unread':
        return !notification.is_read;
      case 'all':
        return true;
      default:
        return true;
    }
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleMarkAllAsRead = () => {
    Alert.alert(
      'Mark All as Read',
      'Are you sure you want to mark all notifications as read?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark All Read',
          onPress: async () => {
            await markAllAsRead();
          },
        },
      ]
    );
  };

  const handleDeleteNotification = (notificationId: string) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteNotification(notificationId),
        },
      ]
    );
  };

  const handleNotificationPress = (notification: Notification) => {
    // Handle notification press - could open details or navigate
    };

  const getFilterButtonStyle = (filterType: FilterType) => ({
    ...styles.filterButton,
    ...(filter === filterType && styles.filterButtonActive),
  });

  const getFilterButtonTextStyle = (filterType: FilterType) => ({
    ...styles.filterButtonText,
    ...(filter === filterType && styles.filterButtonTextActive),
  });

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <TouchableOpacity 
          style={styles.container} 
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.headerActions}>
            {unreadCount > 0 && (
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleMarkAllAsRead}
              >
                <CheckCircle size={20} color={Colors.primary} />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.headerButton} 
              onPress={() => showSuccess('Test Toast', 'This is a test notification that will auto-dismiss!')}
            >
              <Settings size={20} color={Colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.headerButton} onPress={onClose}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={getFilterButtonStyle('unread')}
            onPress={() => setFilter('unread')}
          >
            <Text style={getFilterButtonTextStyle('unread')}>
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={getFilterButtonStyle('all')}
            onPress={() => setFilter('all')}
          >
            <Text style={getFilterButtonTextStyle('all')}>All</Text>
          </TouchableOpacity>
        </View>

        {/* Notifications List */}
        <ScrollView
          style={styles.notificationsList}
          contentContainerStyle={styles.notificationsContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[Colors.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
          // Note: onEndReached is not available in ScrollView, use FlatList for infinite scrolling
          // onEndReachedThreshold removed - not available in ScrollView
        >
          {filteredNotifications.length === 0 ? (
            <View style={styles.emptyState}>
              {filter === 'all' ? (
                <>
                  <BellOff size={48} color={Colors.textSecondary} />
                  <Text style={styles.emptyTitle}>No notifications yet</Text>
                  <Text style={styles.emptyMessage}>
                    You'll see notifications about your practice sessions, bookings, and updates here.
                  </Text>
                </>
              ) : (
                <>
                  <CheckCircle size={48} color={Colors.success} />
                  <Text style={styles.emptyTitle}>No unread notifications</Text>
                  <Text style={styles.emptyMessage}>
                    All caught up! Check back later for new notifications.
                  </Text>
                </>
              )}
            </View>
          ) : (
            <>
              {filteredNotifications.map((notification: any) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onPress={handleNotificationPress}
                  onDelete={handleDeleteNotification}
                  onMarkAsRead={markAsRead}
                />
              ))}
              
              {/* Load More Button */}
              {hasMoreNotifications && (
                <TouchableOpacity
                  style={styles.loadMoreButton}
                  onPress={loadMoreNotifications}
                  disabled={isLoading}
                >
                  <Text style={styles.loadMoreText}>
                    {isLoading ? 'Loading...' : 'Load More Notifications'}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Load Expired Notifications CTA */}
              {hasExpiredNotifications && !showExpiredNotifications && (
                <TouchableOpacity
                  style={styles.loadExpiredButton}
                  onPress={loadExpiredNotifications}
                  disabled={isLoading}
                >
                  <Text style={styles.loadExpiredText}>
                    {isLoading ? 'Loading...' : 'Load Older Notifications'}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Show/Hide Expired Notifications Toggle */}
              {showExpiredNotifications && (
                <TouchableOpacity
                  style={styles.toggleExpiredButton}
                  onPress={toggleExpiredNotifications}
                >
                  <Text style={styles.toggleExpiredText}>
                    Hide Older Notifications
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    minHeight: '50%',
    ...shadows.level4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.policeRedBorder,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  unreadBadge: {
    minWidth: 24,
    height: 24,
    backgroundColor: Colors.policeRed,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: Colors.white,
    ...shadows.police,
  },
  unreadBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterButtonTextActive: {
    color: Colors.white,
  },
  notificationsList: {
    flex: 1,
  },
  notificationsContent: {
    paddingVertical: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadMoreButton: {
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.primary + '10',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
    alignItems: 'center',
  },
  loadMoreText: {
    ...typography.bodyMedium,
    color: Colors.primary,
    fontWeight: '600',
  },
  loadExpiredButton: {
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  loadExpiredText: {
    ...typography.bodyMedium,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  toggleExpiredButton: {
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.warning + '10',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.warning + '20',
    alignItems: 'center',
  },
  toggleExpiredText: {
    ...typography.bodyMedium,
    color: Colors.warning,
    fontWeight: '600',
  },
});

export default NotificationPanel;
