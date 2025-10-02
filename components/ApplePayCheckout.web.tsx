import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native';
import {
  X,
  CreditCard,
  Shield,
  CheckCircle,
  AlertTriangle,
  Apple,
} from 'lucide-react-native';
import Colors from '@/constants/colors';

export interface PaymentData {
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed';
  paymentMethod: 'apple_pay' | 'card';
  receiptUrl?: string;
}

interface ApplePayCheckoutProps {
  visible: boolean;
  onClose: () => void;
  onPaymentSuccess: (paymentData: PaymentData) => Promise<void>;
  onPaymentError: (error: string) => void;
  sessionTitle: string;
  sessionPrice: number;
  sessionDate: string;
  sessionTime: string;
  sessionLocation: string;
  loading?: boolean;
}

export default function ApplePayCheckout({
  visible,
  onClose,
  onPaymentSuccess,
  onPaymentError,
  sessionTitle,
  sessionPrice,
  sessionDate,
  sessionTime,
  sessionLocation,
  loading = false,
}: ApplePayCheckoutProps) {
  const [paymentLoading, setPaymentLoading] = useState(false);

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleWebPayment = async () => {
    Alert.alert(
      'Mobile App Required',
      'Payments are only available on the mobile app. Please use the iOS or Android app to complete your booking.',
      [
        { text: 'OK', onPress: onClose },
      ]
    );
  };

  if (!visible) return null;

  const { height: screenHeight } = Dimensions.get('window');

  return (
    <View style={styles.overlay}>
      <TouchableOpacity 
        style={styles.backdrop} 
        activeOpacity={1} 
        onPress={onClose}
      />
      <View style={styles.modalContainer}>
        <View style={[styles.container, { maxHeight: screenHeight * 0.9 }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Complete Payment</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Session Summary */}
            <View style={styles.sessionSummary}>
              <Text style={styles.summaryTitle}>Session Details</Text>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Session:</Text>
                <Text style={styles.summaryValue}>{sessionTitle}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Date:</Text>
                <Text style={styles.summaryValue}>{formatDate(sessionDate)}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Time:</Text>
                <Text style={styles.summaryValue}>{formatTime(sessionTime)}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Location:</Text>
                <Text style={styles.summaryValue}>{sessionLocation}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total:</Text>
                <Text style={styles.summaryValue}>{formatPrice(sessionPrice)}</Text>
              </View>
            </View>

            {/* Web Platform Notice */}
            <View style={styles.webNotice}>
              <AlertTriangle size={24} color="#f59e0b" />
              <View style={styles.webNoticeContent}>
                <Text style={styles.webNoticeTitle}>Mobile App Required</Text>
                <Text style={styles.webNoticeText}>
                  Payments are only available on the mobile app. Please use the iOS or Android app to complete your booking and payment.
                </Text>
              </View>
            </View>

            {/* Download App Notice */}
            <View style={styles.downloadNotice}>
              <Text style={styles.downloadTitle}>Get the Mobile App</Text>
              <Text style={styles.downloadText}>
                Download the Fit4Duty mobile app from the App Store or Google Play Store to access all features including secure payments.
              </Text>
            </View>

            {/* Security Notice */}
            <View style={styles.securityNotice}>
              <Shield size={16} color={Colors.success} />
              <Text style={styles.securityText}>
                Your payment will be secured by Stripe. We never store your payment information.
              </Text>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleWebPayment}
            >
              <Text style={styles.primaryButtonText}>Use Mobile App</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.policeRedBorder,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  container: {
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  sessionSummary: {
    padding: 24,
    backgroundColor: '#F9FAFB',
    margin: 20,
    borderRadius: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  webNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
    backgroundColor: '#FEF3C7',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  webNoticeContent: {
    flex: 1,
    marginLeft: 12,
  },
  webNoticeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },
  webNoticeText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  downloadNotice: {
    padding: 20,
    backgroundColor: '#EFF6FF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  downloadTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 8,
  },
  downloadText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F0FDF4',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  securityText: {
    fontSize: 14,
    color: '#166534',
    marginLeft: 8,
    flex: 1,
  },
  actions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
