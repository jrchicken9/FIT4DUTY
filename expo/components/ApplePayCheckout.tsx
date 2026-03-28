/**
 * ApplePayCheckout Component
 * 
 * TEMPORARY TEST MODE IMPLEMENTATION:
 * This component includes a test payment mode that bypasses real Apple Pay/Stripe
 * payments when running in iOS Simulator or debug mode. This allows testing the
 * full booking flow without requiring real payment setup.
 * 
 * TO REMOVE TEST MODE (when ready for production):
 * 1. Remove the isTestPaymentMode() function
 * 2. Remove the simulateSuccessfulPayment() function  
 * 3. Remove the test mode checks in handleApplePay() and handleCardPayment()
 * 4. Remove the test mode indicator UI
 * 5. Remove the test mode styles
 * 6. Remove the Constants import
 * 
 * Test mode is automatically enabled when:
 * - Platform is iOS AND
 * - Running in Expo Go OR standalone debug build
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Dimensions,
  ScrollView,
} from 'react-native';
import { ErrorAlert } from './ErrorAlert';
import Constants from 'expo-constants';
import {
  X,
  CreditCard,
  Shield,
  CheckCircle,
  AlertTriangle,
  Apple,
} from 'lucide-react-native';
import { useStripe } from '@stripe/stripe-react-native';
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
  // Get Stripe instance
  const stripe = useStripe();
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'apple_pay' | 'card'>('apple_pay');

  // TEMPORARY: Test Payment Mode for iOS Simulator
  // This bypasses real Apple Pay/Stripe payments in simulator/debug mode
  // TODO: Remove this when testing on real device with Apple Pay
  const isTestPaymentMode = () => {
    // Check if running in iOS Simulator or debug mode
    const isSimulator = Constants.appOwnership === 'expo' || 
                       Constants.appOwnership === 'standalone' && __DEV__;
    const isDebugMode = __DEV__;
    
    // Enable test mode in simulator or debug builds
    const testMode = Platform.OS === 'ios' && (isSimulator || isDebugMode);
    
    // Log test mode status for debugging
    if (__DEV__) {
      }
    
    return testMode;
  };

  // TEMPORARY: Simulate successful payment for testing
  // TODO: Remove this when testing on real device with Apple Pay
  const simulateSuccessfulPayment = async (method: 'apple_pay' | 'card') => {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Create mock payment data
    const paymentData: PaymentData = {
      paymentIntentId: `pi_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: sessionPrice,
      currency: 'cad',
      status: 'succeeded',
      paymentMethod: method,
    };

    return paymentData;
  };

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

  const createPaymentIntent = async () => {
    try {
      // This would call your Supabase Edge Function
      const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          amount: sessionPrice,
          currency: 'cad',
          session_title: sessionTitle,
          session_date: sessionDate,
          session_time: sessionTime,
          session_location: sessionLocation,
        }),
      });

      const { clientSecret, error } = await response.json();
      
      if (error) {
        throw new Error(error);
      }

      return clientSecret;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error('Failed to create payment intent');
    }
  };

  const handleApplePay = async () => {
    if (Platform.OS === 'web') {
              ErrorAlert.showCustom('Apple Pay Not Available', 'Apple Pay is not available on web. Please use the mobile app.');
      return;
    }

    // TEMPORARY: Test Payment Mode - bypass real Apple Pay in simulator/debug
    // TODO: Remove this when testing on real device with Apple Pay
    if (isTestPaymentMode()) {
      setPaymentLoading(true);
      try {
        const paymentData = await simulateSuccessfulPayment('apple_pay');
        await onPaymentSuccess(paymentData);
      } catch (error: any) {
        console.error('Test payment error:', error);
        onPaymentError(error.message || 'Test payment failed');
      } finally {
        setPaymentLoading(false);
      }
      return;
    }

    // PRODUCTION: Real Apple Pay flow
    if (!stripe) {
      ErrorAlert.showCustom('Payment Not Available', 'Payment is not available on this platform.');
      return;
    }

    setPaymentLoading(true);
    try {
      // Create payment intent
      const clientSecret = await createPaymentIntent();

      // Initialize payment sheet
      const { error: initError } = await stripe.initPaymentSheet({
        merchantDisplayName: 'Fit4Duty',
        paymentIntentClientSecret: clientSecret,
        applePay: {
          merchantCountryCode: 'CA',
        },
        style: 'automatic',
      });

      if (initError) {
        throw new Error(initError.message);
      }

      // Present payment sheet
      const { error: presentError, paymentOption } = await stripe.presentPaymentSheet();

      if (presentError) {
        throw new Error(presentError.message);
      }

      // Payment successful
      const paymentData: PaymentData = {
        paymentIntentId: clientSecret.split('_secret_')[0],
        amount: sessionPrice,
        currency: 'cad',
        status: 'succeeded',
        paymentMethod: 'apple_pay',
      };

      await onPaymentSuccess(paymentData);
    } catch (error: any) {
      console.error('Apple Pay error:', error);
      onPaymentError(error.message || 'Payment failed');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleCardPayment = async () => {
    if (Platform.OS === 'web') {
      ErrorAlert.showCustom('Card Payment Not Available', 'Card payments are not available on web. Please use the mobile app.');
      return;
    }

    // TEMPORARY: Test Payment Mode - bypass real Stripe payments in simulator/debug
    // TODO: Remove this when testing on real device with Apple Pay
    if (isTestPaymentMode()) {
      setPaymentLoading(true);
      try {
        const paymentData = await simulateSuccessfulPayment('card');
        await onPaymentSuccess(paymentData);
      } catch (error: any) {
        console.error('Test payment error:', error);
        onPaymentError(error.message || 'Test payment failed');
      } finally {
        setPaymentLoading(false);
      }
      return;
    }

    // PRODUCTION: Real Stripe payment flow
    if (!stripe) {
      ErrorAlert.showCustom('Payment Not Available', 'Payment is not available on this platform.');
      return;
    }

    setPaymentLoading(true);
    try {
      // Create payment intent
      const clientSecret = await createPaymentIntent();

      // Initialize payment sheet
      const { error: initError } = await stripe.initPaymentSheet({
        merchantDisplayName: 'Fit4Duty',
        paymentIntentClientSecret: clientSecret,
        style: 'automatic',
      });

      if (initError) {
        throw new Error(initError.message);
      }

      // Present payment sheet
      const { error: presentError } = await stripe.presentPaymentSheet();

      if (presentError) {
        throw new Error(presentError.message);
      }

      // Payment successful
      const paymentData: PaymentData = {
        paymentIntentId: clientSecret.split('_secret_')[0],
        amount: sessionPrice,
        currency: 'cad',
        status: 'succeeded',
        paymentMethod: 'card',
      };

      await onPaymentSuccess(paymentData);
    } catch (error: any) {
      console.error('Card payment error:', error);
      onPaymentError(error.message || 'Payment failed');
    } finally {
      setPaymentLoading(false);
    }
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
        <View style={[styles.container, { height: screenHeight * 0.88 }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Shield size={24} color={Colors.primary} />
              <Text style={styles.title}>Complete Payment</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* TEMPORARY: Test Mode Indicator */}
          {isTestPaymentMode() && (
            <View style={styles.testModeIndicator}>
              <Text style={styles.testModeText}>
                🧪 TEST MODE: Payments will be simulated (Simulator/Debug)
              </Text>
            </View>
          )}

          {/* Scrollable Content Area */}
          <ScrollView 
            style={styles.contentContainer}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.scrollContent}
          >
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
          </View>

          {/* Payment Amount */}
          <View style={styles.paymentAmount}>
            <Text style={styles.amountLabel}>Total Amount</Text>
            <Text style={styles.amountValue}>{formatPrice(sessionPrice)}</Text>
            <Text style={styles.amountNote}>CAD (includes taxes if applicable)</Text>
          </View>

          {/* Payment Methods */}
          <View style={styles.paymentMethods}>
            <Text style={styles.methodsTitle}>Choose Payment Method</Text>
            
            {/* Apple Pay Option - Only on iOS */}
            {Platform.OS === 'ios' && (stripe || isTestPaymentMode()) && (
              <TouchableOpacity
                style={[
                  styles.paymentMethod,
                  paymentMethod === 'apple_pay' && styles.paymentMethodSelected
                ]}
                onPress={() => setPaymentMethod('apple_pay')}
                disabled={paymentLoading}
              >
                <View style={styles.methodContent}>
                  <Apple size={24} color="#000000" />
                  <View style={styles.methodInfo}>
                    <Text style={styles.methodName}>Apple Pay</Text>
                    <Text style={styles.methodDescription}>
                      Fast and secure payment with Apple Pay
                    </Text>
                  </View>
                </View>
                {paymentMethod === 'apple_pay' && (
                  <CheckCircle size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            )}

            {/* Credit/Debit Card Option - Only on native platforms */}
            {(Platform.OS !== 'web' || isTestPaymentMode()) && (
              <TouchableOpacity
                style={[
                  styles.paymentMethod,
                  paymentMethod === 'card' && styles.paymentMethodSelected
                ]}
                onPress={() => setPaymentMethod('card')}
                disabled={paymentLoading}
              >
                <View style={styles.methodContent}>
                  <CreditCard size={24} color={Colors.textSecondary} />
                  <View style={styles.methodInfo}>
                    <Text style={styles.methodName}>Credit/Debit Card</Text>
                    <Text style={styles.methodDescription}>
                      Pay with any major credit or debit card
                    </Text>
                  </View>
                </View>
                {paymentMethod === 'card' && (
                  <CheckCircle size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            )}

            {/* Web Platform Notice */}
            {Platform.OS === 'web' && (
              <View style={styles.webNotice}>
                <AlertTriangle size={20} color="#f59e0b" />
                <Text style={styles.webNoticeText}>
                  Payments are only available on the mobile app. Please use the iOS or Android app to complete your booking.
                </Text>
              </View>
            )}
          </View>

            {/* Security Notice */}
            <View style={styles.securityNotice}>
              <Shield size={16} color={Colors.success} />
              <Text style={styles.securityText}>
                Your payment is secured by Stripe. We never store your payment information.
              </Text>
            </View>
          </ScrollView>

          {/* Payment Button */}
          <View style={styles.paymentActions}>
            <TouchableOpacity
              style={[
                styles.payButton,
                paymentLoading && styles.payButtonDisabled
              ]}
              onPress={paymentMethod === 'apple_pay' ? handleApplePay : handleCardPayment}
              disabled={paymentLoading || loading}
            >
              {paymentLoading ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <>
                  {paymentMethod === 'apple_pay' ? (
                    <Apple size={20} color={Colors.white} />
                  ) : (
                    <CreditCard size={20} color={Colors.white} />
                  )}
                </>
              )}
              <Text style={styles.payButtonText}>
                {paymentLoading ? 'Processing...' : `Pay ${formatPrice(sessionPrice)}`}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            disabled={paymentLoading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.policeRedBorder,
    width: '100%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    flexDirection: 'column',
    display: 'flex',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: Colors.white,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionSummary: {
    padding: 16,
    backgroundColor: '#F0F9FF',
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0369A1',
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  paymentAmount: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  amountLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  amountNote: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  paymentMethods: {
    marginBottom: 16,
  },
  methodsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  paymentMethodSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F9FF',
  },
  methodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodInfo: {
    marginLeft: 12,
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  methodDescription: {
    fontSize: 14,
    color: '#6B7280',
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
  paymentActions: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: Colors.white,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    gap: 8,
  },
  payButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  webNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
    marginBottom: 12,
  },
  webNoticeText: {
    fontSize: 14,
    color: '#92400E',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  // TEMPORARY: Test Mode Styles
  testModeIndicator: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F59E0B',
  },
  testModeText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '600',
    textAlign: 'center',
  },
  // Content container for scrollable area
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
});
