# Notification System Enhancements

## Overview

The notification system has been enhanced with modern iOS-style UX features including auto-dismissing toast notifications and the ability to load previous notifications.

## New Features

### 1. Toast Notifications (Auto-Dismiss)

Toast notifications provide temporary, non-intrusive feedback that automatically disappear after a set duration.

#### Features:
- **Auto-dismiss**: Notifications automatically disappear after 4 seconds (configurable)
- **Modern iOS Design**: Clean, modern design with smooth animations
- **Multiple Types**: Success, Error, Warning, and Info variants
- **Action Support**: Optional action buttons for user interaction
- **Manual Dismiss**: Users can manually dismiss toasts
- **Stacking**: Multiple toasts can be displayed simultaneously

#### Usage:

```typescript
import { useToast } from '@/context/ToastContext';

const { showSuccess, showError, showWarning, showInfo } = useToast();

// Basic usage
showSuccess('Success!', 'Your action was completed successfully.');

// With custom duration (in milliseconds)
showError('Error!', 'Something went wrong.', 6000);

// With action button
showWarning(
  'Session Reminder', 
  'Your practice session starts in 30 minutes.',
  8000,
  () => navigateToSession(),
  'View Session'
);
```

#### Toast Types:
- `success`: Green background with checkmark icon
- `error`: Red background with alert icon  
- `warning`: Orange background with warning icon
- `info`: Blue background with info icon

### 2. Enhanced Notification Panel

The notification panel now includes improved functionality for managing notifications.

#### New Features:
- **Load More**: Automatically loads more notifications when scrolling to the bottom
- **Pagination**: Efficient loading with 20 notifications per page
- **Infinite Scroll**: Seamless loading of previous notifications
- **Load More Button**: Manual option to load more notifications
- **Better Performance**: Optimized loading and state management

#### Usage:

```typescript
import { useNotifications } from '@/context/NotificationContext';

const { 
  notifications, 
  hasMoreNotifications, 
  loadMoreNotifications,
  isLoading 
} = useNotifications();

// Load more notifications manually
if (hasMoreNotifications && !isLoading) {
  loadMoreNotifications();
}
```

### 3. Auto-Dismiss Functionality

Notifications can now be configured to automatically dismiss based on:
- **Time-based**: Dismiss after a specific duration
- **User interaction**: Dismiss when user taps or takes action
- **Priority-based**: Different durations for different notification types

## Implementation Details

### Components Created:

1. **ToastNotification.tsx**: Individual toast component with animations
2. **ToastContainer.tsx**: Container for managing multiple toasts
3. **ToastContext.tsx**: Global state management for toasts

### Context Providers:

1. **ToastProvider**: Manages toast notifications globally
2. **Enhanced NotificationProvider**: Added pagination and load more functionality

### Database Changes:

The notification system now supports:
- Pagination with `range` queries
- Efficient loading with `count` queries
- Better performance with smaller batch sizes

## Configuration

### Toast Duration Settings:
- **Default**: 4000ms (4 seconds)
- **Success**: 4000ms
- **Error**: 6000ms (longer for important errors)
- **Warning**: 8000ms (longer for important warnings)
- **Info**: 4000ms

### Notification Loading Settings:
- **Page Size**: 20 notifications per page
- **Auto-load Threshold**: 0.1 (10% from bottom)
- **Refresh Control**: Pull-to-refresh functionality

## Usage Examples

### Basic Toast Notifications:

```typescript
// Success notification
showSuccess('Booking Confirmed', 'Your practice session has been booked successfully.');

// Error notification with longer duration
showError('Booking Failed', 'Unable to book session. Please try again.', 8000);

// Warning with action
showWarning(
  'Session Full', 
  'This session is at capacity. Join the waitlist?',
  10000,
  () => joinWaitlist(),
  'Join Waitlist'
);

// Info notification
showInfo('System Update', 'New features are now available.');
```

### Advanced Toast Usage:

```typescript
// Custom duration and action
showSuccess(
  'Profile Updated',
  'Your profile has been saved successfully.',
  3000,
  () => viewProfile(),
  'View Profile'
);

// Error with retry action
showError(
  'Connection Lost',
  'Unable to sync data. Check your connection.',
  0, // No auto-dismiss
  () => retrySync(),
  'Retry'
);
```

### Notification Panel Integration:

```typescript
// In your component
const { 
  notifications, 
  hasMoreNotifications, 
  loadMoreNotifications,
  isLoading 
} = useNotifications();

// Load more when scrolling
<ScrollView
  onEndReached={hasMoreNotifications ? loadMoreNotifications : undefined}
  onEndReachedThreshold={0.1}
>
  {/* Notification items */}
</ScrollView>
```

## Best Practices

### Toast Notifications:
1. **Keep messages concise**: Toast notifications should be brief and actionable
2. **Use appropriate types**: Match the toast type to the message importance
3. **Provide actions when needed**: Use action buttons for important notifications
4. **Don't overuse**: Reserve toasts for important feedback, not every action

### Notification Panel:
1. **Efficient loading**: Use pagination to avoid loading too many notifications at once
2. **User feedback**: Show loading states during data fetching
3. **Error handling**: Provide clear error messages when loading fails
4. **Performance**: Implement proper cleanup and memory management

## Migration Guide

### For Existing Code:

1. **Import the toast context**:
```typescript
import { useToast } from '@/context/ToastContext';
```

2. **Replace Alert.alert with toasts** where appropriate:
```typescript
// Before
Alert.alert('Success', 'Action completed');

// After
showSuccess('Success', 'Action completed');
```

3. **Update notification loading** to use pagination:
```typescript
// The enhanced context automatically handles pagination
const { notifications, hasMoreNotifications, loadMoreNotifications } = useNotifications();
```

## Future Enhancements

Potential future improvements:
- **Notification preferences**: User-configurable auto-dismiss durations
- **Rich notifications**: Support for images and rich content
- **Notification history**: Persistent storage of dismissed notifications
- **Smart grouping**: Group similar notifications together
- **Push notifications**: Integration with push notification system
- **Analytics**: Track notification engagement and effectiveness

## Troubleshooting

### Common Issues:

1. **Toasts not appearing**: Ensure ToastProvider is wrapped around your app
2. **Notifications not loading**: Check network connection and user authentication
3. **Performance issues**: Verify pagination is working correctly
4. **Memory leaks**: Ensure proper cleanup of timeouts and subscriptions

### Debug Tips:

1. **Check console logs** for error messages
2. **Verify context providers** are properly nested
3. **Test with different network conditions**
4. **Monitor memory usage** during extended use
