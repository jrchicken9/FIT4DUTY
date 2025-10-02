import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows } from '@/constants/designSystem';

const { width: screenWidth } = Dimensions.get('window');

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastNotificationProps {
  visible: boolean;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onDismiss: () => void;
  onPress?: () => void;
  actionText?: string;
}

export default function ToastNotification({
  visible,
  type,
  title,
  message,
  duration = 4000,
  onDismiss,
  onPress,
  actionText,
}: ToastNotificationProps) {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<number | undefined>();

  useEffect(() => {
    if (visible) {
      // Slide in from top
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after duration
      timeoutRef.current = window.setTimeout(() => {
        handleDismiss();
      }, duration);
    } else {
      handleDismiss();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [visible, duration]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return { backgroundColor: Colors.success, icon: CheckCircle };
      case 'error':
        return { backgroundColor: Colors.error, icon: AlertCircle };
      case 'warning':
        return { backgroundColor: Colors.warning, icon: AlertTriangle };
      case 'info':
        return { backgroundColor: Colors.primary, icon: Info };
      default:
        return { backgroundColor: Colors.primary, icon: Info };
    }
  };

  const { backgroundColor, icon: Icon } = getToastStyle();

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <StatusBar barStyle="light-content" backgroundColor={backgroundColor} />
      
      <TouchableOpacity
        style={[styles.toast, { backgroundColor }]}
        onPress={onPress}
        activeOpacity={onPress ? 0.8 : 1}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Icon size={20} color={Colors.white} />
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            {message && <Text style={styles.message}>{message}</Text>}
          </View>

          <View style={styles.actions}>
            {actionText && onPress && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onPress}
              >
                <Text style={styles.actionText}>{actionText}</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={handleDismiss}
            >
              <X size={16} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  toast: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.level8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    ...typography.bodyMedium,
    color: Colors.white,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  message: {
    ...typography.bodySmall,
    color: Colors.white + 'CC',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: Colors.white + '20',
  },
  actionText: {
    ...typography.labelSmall,
    color: Colors.white,
    fontWeight: '600',
  },
  dismissButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: Colors.white + '20',
  },
});
