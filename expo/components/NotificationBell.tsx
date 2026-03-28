import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Pressable } from 'react-native';
import { Bell, BellOff } from 'lucide-react-native';
import { useNotifications } from '@/context/NotificationContext';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows, strokeWidth, sizes } from '@/constants/designSystem';
import { useTapAnimation } from '@/hooks/useTapAnimation';

interface NotificationBellProps {
  onPress: () => void;
  size?: number;
  showBadge?: boolean;
}

export default function NotificationBell({ 
  onPress, 
  size = sizes.md, 
  showBadge = true 
}: NotificationBellProps) {
  const { unreadCount, isLoading } = useNotifications();
  const { handlePressIn, handlePressOut, animatedStyle } = useTapAnimation();

  return (
    <Pressable 
      style={styles.container} 
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isLoading}
    >
      <Animated.View style={[styles.iconContainer, animatedStyle]}>
        {unreadCount > 0 ? (
          <Bell size={size} color={Colors.white} />
        ) : (
          <BellOff size={size} color={Colors.white + '80'} />
        )}
        
        {showBadge && unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -spacing.sm,
    right: -spacing.sm,
    minWidth: sizes.md,
    height: sizes.md,
    backgroundColor: Colors.policeRed,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.white,
    ...shadows.police,
  },
  badgeText: {
    color: Colors.white,
    ...typography.labelSmall,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
