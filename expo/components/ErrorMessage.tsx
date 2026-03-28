import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertCircle, CheckCircle, Info } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { shadows } from '@/constants/designSystem';

export type ErrorType = 'error' | 'success' | 'info' | 'warning' | 'emergency' | 'alert';

interface ErrorMessageProps {
  message: string;
  type?: ErrorType;
  visible?: boolean;
  style?: any;
}

export default function ErrorMessage({ 
  message, 
  type = 'error', 
  visible = true,
  style 
}: ErrorMessageProps) {
  if (!visible || !message) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} color={Colors.success} />;
      case 'info':
        return <Info size={20} color={Colors.primary} />;
      case 'warning':
        return <AlertCircle size={20} color={Colors.warning} />;
      case 'emergency':
      case 'alert':
        return <AlertCircle size={20} color={Colors.policeRed} />;
      default:
        return <AlertCircle size={20} color={Colors.policeRed} />;
    }
  };

  const getContainerStyle = () => {
    switch (type) {
      case 'success':
        return styles.successContainer;
      case 'info':
        return styles.infoContainer;
      case 'warning':
        return styles.warningContainer;
      case 'emergency':
        return styles.emergencyContainer;
      case 'alert':
        return styles.alertContainer;
      default:
        return styles.errorContainer;
    }
  };

  const getTextStyle = () => {
    switch (type) {
      case 'success':
        return styles.successText;
      case 'info':
        return styles.infoText;
      case 'warning':
        return styles.warningText;
      case 'emergency':
        return styles.emergencyText;
      case 'alert':
        return styles.alertText;
      default:
        return styles.errorText;
    }
  };

  return (
    <View style={[styles.container, getContainerStyle(), style]}>
      <View style={styles.iconContainer}>
        {getIcon()}
      </View>
      <Text style={[styles.message, getTextStyle()]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 1,
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  message: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: Colors.policeRedLight,
    borderColor: Colors.policeRedBorder,
    ...shadows.police,
  },
  errorText: {
    color: Colors.policeRed,
  },
  successContainer: {
    backgroundColor: Colors.success + '10',
    borderColor: Colors.success + '30',
  },
  successText: {
    color: Colors.success,
  },
  infoContainer: {
    backgroundColor: Colors.primary + '10',
    borderColor: Colors.primary + '30',
  },
  infoText: {
    color: Colors.primary,
  },
  warningContainer: {
    backgroundColor: Colors.warning + '10',
    borderColor: Colors.warning + '30',
  },
  warningText: {
    color: Colors.warning,
  },
  emergencyContainer: {
    backgroundColor: Colors.policeRedLight,
    borderColor: Colors.policeRed,
    borderWidth: 2,
    ...shadows.alert,
  },
  emergencyText: {
    color: Colors.policeRed,
    fontWeight: '600',
  },
  alertContainer: {
    backgroundColor: Colors.policeRedMedium,
    borderColor: Colors.policeRedBorder,
    ...shadows.police,
  },
  alertText: {
    color: Colors.policeRed,
    fontWeight: '500',
  },
});
