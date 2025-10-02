import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  Alert,
  Animated,
  Pressable,
  StatusBar,
} from 'react-native';
import { 
  Mail, 
  X, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows, strokeWidth, sizes } from '@/constants/designSystem';
import { useTapAnimation } from '@/hooks/useTapAnimation';
import { supabase } from '@/lib/supabase';

interface ResetPasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onBackToSignIn?: () => void;
}

const CloseButton = ({ onPress }: { onPress: () => void }) => {
  const { handlePressIn, handlePressOut, animatedStyle } = useTapAnimation();

  return (
    <Pressable 
      style={styles.closeButton} 
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.closeButtonContent, animatedStyle]}>
        <X size={sizes.lg} color={Colors.white} />
      </Animated.View>
    </Pressable>
  );
};

const BackButton = ({ onPress }: { onPress: () => void }) => {
  const { handlePressIn, handlePressOut, animatedStyle } = useTapAnimation();

  return (
    <Pressable 
      style={styles.backButton} 
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.backButtonContent, animatedStyle]}>
        <ArrowLeft size={sizes.lg} color={Colors.white} />
      </Animated.View>
    </Pressable>
  );
};

const SubmitButton = ({ 
  onPress, 
  disabled, 
  loading 
}: { 
  onPress: () => void; 
  disabled: boolean; 
  loading: boolean;
}) => {
  const { handlePressIn, handlePressOut, animatedStyle } = useTapAnimation();

  return (
    <Pressable 
      style={[styles.submitButton, disabled && styles.submitButtonDisabled]} 
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
    >
      <Animated.View style={[styles.submitButtonContent, animatedStyle]}>
        <Text style={[styles.submitButtonText, disabled && styles.submitButtonTextDisabled]}>
          {loading ? 'Sending...' : 'Send Reset Email'}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  visible,
  onClose,
  onBackToSignIn,
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'yourapp://reset-password',
      });

      if (error) {
        setError(error.message);
      } else {
        setEmailSent(true);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    setEmailSent(false);
    setLoading(false);
    onClose();
  };

  const handleBackToSignIn = () => {
    if (onBackToSignIn) {
      onBackToSignIn();
    } else {
      handleClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <View style={styles.container}>
        {/* Blue Header */}
        <View style={styles.blueHeader}>
          <View style={styles.headerContent}>
            <View style={styles.titleContainer}>
              <Mail size={sizes.lg} color={Colors.white} />
              <Text style={styles.title}>Reset Password</Text>
            </View>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>
          </View>
          <CloseButton onPress={handleClose} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {emailSent ? (
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <CheckCircle size={sizes.xxxl} color={Colors.success} />
              </View>
              <Text style={styles.successTitle}>Email Sent!</Text>
              <Text style={styles.successMessage}>
                We've sent a password reset link to:
              </Text>
              <Text style={styles.emailText}>{email}</Text>
              <Text style={styles.successInstructions}>
                Check your email and click the link to reset your password. 
                If you don't see the email, check your spam folder.
              </Text>
              
              <View style={styles.successActions}>
                <Pressable 
                  style={styles.resendButton}
                  onPress={() => {
                    setEmailSent(false);
                    setError('');
                  }}
                >
                  <Text style={styles.resendButtonText}>Resend Email</Text>
                </Pressable>
                
                <Pressable 
                  style={styles.backToSignInButton}
                  onPress={handleBackToSignIn}
                >
                  <Text style={styles.backToSignInText}>Back to Sign In</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <Mail size={sizes.md} color={Colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email address"
                    placeholderTextColor={Colors.textSecondary}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (error) setError('');
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    editable={!loading}
                  />
                </View>
                {error ? (
                  <View style={styles.errorContainer}>
                    <AlertCircle size={sizes.sm} color={Colors.error} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}
              </View>

              <SubmitButton 
                onPress={handleSubmit}
                disabled={!email.trim()}
                loading={loading}
              />

              <View style={styles.infoSection}>
                <Text style={styles.infoTitle}>Need help?</Text>
                <Text style={styles.infoText}>
                  If you're having trouble accessing your account, contact our support team for assistance.
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  blueHeader: {
    backgroundColor: Colors.primary,
    padding: spacing.lg,
    paddingTop: 50,
    paddingBottom: spacing.md,
    ...shadows.level4,
    position: 'relative',
    overflow: 'visible',
  },
  headerContent: {
    flex: 1,
    marginRight: spacing.xl,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.headingLarge,
    color: Colors.white,
    fontWeight: '700',
    marginLeft: spacing.sm,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: Colors.white + 'CC',
    lineHeight: 22,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: Colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.level2,
    zIndex: 10,
  },
  closeButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: Colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.level2,
    zIndex: 10,
  },
  backButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    ...typography.labelLarge,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    borderWidth: strokeWidth.thin,
    borderColor: Colors.border,
    ...shadows.level2,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.bodyLarge,
    color: Colors.text,
    paddingVertical: spacing.md,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  errorText: {
    ...typography.bodySmall,
    color: Colors.error,
    marginLeft: spacing.xs,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.level2,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.textSecondary + '40',
  },
  submitButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    ...typography.labelLarge,
    color: Colors.white,
    fontWeight: '600',
  },
  submitButtonTextDisabled: {
    color: Colors.textSecondary,
  },
  infoSection: {
    backgroundColor: Colors.primary + '10',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: strokeWidth.thin,
    borderColor: Colors.primary + '20',
  },
  infoTitle: {
    ...typography.labelLarge,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  infoText: {
    ...typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  successIcon: {
    marginBottom: spacing.lg,
  },
  successTitle: {
    ...typography.headingLarge,
    color: Colors.success,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  successMessage: {
    ...typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  emailText: {
    ...typography.labelLarge,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  successInstructions: {
    ...typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  successActions: {
    width: '100%',
    gap: spacing.sm,
  },
  resendButton: {
    backgroundColor: Colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...shadows.level2,
  },
  resendButtonText: {
    ...typography.labelLarge,
    color: Colors.white,
    fontWeight: '600',
  },
  backToSignInButton: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: strokeWidth.thin,
    borderColor: Colors.border,
    ...shadows.level2,
  },
  backToSignInText: {
    ...typography.labelLarge,
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default ResetPasswordModal;
