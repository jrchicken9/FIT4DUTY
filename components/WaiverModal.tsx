import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
  Platform,
  Dimensions,
  Animated,
  Pressable,
} from 'react-native';
import {
  X,
  Shield,
  User,
  Phone,
  Heart,
  Pill,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows, strokeWidth, sizes } from '@/constants/designSystem';
import { useTapAnimation } from '@/hooks/useTapAnimation';

export interface WaiverData {
  signed_name: string;
  signature_data: string;
  agreed_to_terms: boolean;
  emergency_contact: string;
  emergency_phone: string;
  emergency_relationship: string;
  medical_conditions: string;
  medications: string;
  allergies: string;
  injuries: string;
  surgeries: string;
  heart_condition: boolean;
  chest_pain: boolean;
  dizziness: boolean;
  bone_joint_problems: boolean;
  high_blood_pressure: boolean;
  diabetes: boolean;
  asthma: boolean;
  pregnancy: boolean;
  other_medical_issues: string;
  fitness_goals: string;
  current_activity_level: string;
  has_experience: boolean;
  experience_details: string;
  age_confirmation: boolean;
  photo_release: boolean;
  marketing_consent: boolean;
}

interface WaiverModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (waiverData: WaiverData) => Promise<void>;
  loading?: boolean;
  sessionTitle?: string;
  sessionPrice?: number;
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
        <X size={sizes.lg} color={Colors.textSecondary} />
      </Animated.View>
    </Pressable>
  );
};

const SubmitButton = ({ onPress, loading, disabled }: { 
  onPress: () => void; 
  loading: boolean; 
  disabled: boolean; 
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
        {loading ? (
          <ActivityIndicator size="small" color={Colors.white} />
        ) : (
          <Text style={styles.submitButtonText}>Submit Waiver</Text>
        )}
      </Animated.View>
    </Pressable>
  );
};

export default function WaiverModal({
  visible,
  onClose,
  onSubmit,
  loading = false,
  sessionTitle = 'Practice Session',
  sessionPrice = 0,
}: WaiverModalProps) {
  const [waiverData, setWaiverData] = useState<WaiverData>({
    signed_name: '',
    signature_data: '',
    agreed_to_terms: false,
    emergency_contact: '',
    emergency_phone: '',
    emergency_relationship: '',
    medical_conditions: '',
    medications: '',
    allergies: '',
    injuries: '',
    surgeries: '',
    heart_condition: false,
    chest_pain: false,
    dizziness: false,
    bone_joint_problems: false,
    high_blood_pressure: false,
    diabetes: false,
    asthma: false,
    pregnancy: false,
    other_medical_issues: '',
    fitness_goals: '',
    current_activity_level: '',
    has_experience: false,
    experience_details: '',
    age_confirmation: false,
    photo_release: false,
    marketing_consent: false,
  });

  const [errors, setErrors] = useState<Partial<WaiverData>>({});

  const handleClose = () => {
    Alert.alert(
      'Cancel Waiver',
      'Are you sure you want to cancel? Your progress will be lost.',
      [
        { text: 'Continue Editing', style: 'cancel' },
        { text: 'Cancel', style: 'destructive', onPress: onClose }
      ]
    );
  };

  const validateForm = () => {
    const newErrors: Partial<WaiverData> = {};

    if (!waiverData.signed_name.trim()) {
      newErrors.signed_name = 'Full name is required';
    }

    if (!waiverData.emergency_contact.trim()) {
      newErrors.emergency_contact = 'Emergency contact is required';
    }

    if (!waiverData.emergency_phone.trim()) {
      newErrors.emergency_phone = 'Emergency phone is required';
    }

    if (!waiverData.agreed_to_terms) {
      newErrors.agreed_to_terms = true;
    }

    if (!waiverData.age_confirmation) {
      newErrors.age_confirmation = true;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return;
    }

    try {
      await onSubmit(waiverData);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit waiver. Please try again.');
    }
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  if (!visible) return null;

  const { height: screenHeight } = Dimensions.get('window');

  return (
    <View style={styles.overlay}>
      <Pressable 
        style={styles.backdrop} 
        onPress={handleClose}
      />
      <View style={styles.modalContainer}>
        <View style={[styles.container, { maxHeight: screenHeight * 0.85 }]}>
          {/* Drag Indicator */}
          <View style={styles.dragIndicator} />
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Shield size={sizes.lg} color={Colors.primary} />
              <Text style={styles.title}>Fitness Assessment Waiver</Text>
            </View>
            <CloseButton onPress={handleClose} />
          </View>

          {/* Content */}
          <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Session Info */}
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionTitle}>{sessionTitle}</Text>
              <Text style={styles.sessionSubtitle}>
                Complete this waiver to confirm your booking
              </Text>
              {sessionPrice > 0 && (
                <Text style={styles.sessionPrice}>
                  Session Fee: {formatPrice(sessionPrice)}
                </Text>
              )}
            </View>

            {/* Personal Information */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              
              <View style={styles.inputGroup}>
                <View style={styles.inputLabel}>
                  <User size={sizes.sm} color={Colors.textSecondary} />
                  <Text style={styles.label}>Full Name (as signature)</Text>
                  <Text style={styles.required}>*</Text>
                </View>
                <TextInput
                  style={[styles.input, errors.signed_name && styles.inputError]}
                  value={waiverData.signed_name}
                  onChangeText={(text) => {
                    setWaiverData({ ...waiverData, signed_name: text });
                    if (errors.signed_name) {
                      setErrors({ ...errors, signed_name: undefined });
                    }
                  }}
                  placeholder="Enter your full name"
                  placeholderTextColor={Colors.textSecondary}
                />
                {errors.signed_name && (
                  <Text style={styles.errorText}>{errors.signed_name}</Text>
                )}
              </View>
            </View>

            {/* Emergency Contact */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Emergency Contact</Text>
              
              <View style={styles.inputGroup}>
                <View style={styles.inputLabel}>
                  <User size={sizes.sm} color={Colors.textSecondary} />
                  <Text style={styles.label}>Emergency Contact Name</Text>
                  <Text style={styles.required}>*</Text>
                </View>
                <TextInput
                  style={[styles.input, errors.emergency_contact && styles.inputError]}
                  value={waiverData.emergency_contact}
                  onChangeText={(text) => {
                    setWaiverData({ ...waiverData, emergency_contact: text });
                    if (errors.emergency_contact) {
                      setErrors({ ...errors, emergency_contact: undefined });
                    }
                  }}
                  placeholder="Enter emergency contact name"
                  placeholderTextColor={Colors.textSecondary}
                />
                {errors.emergency_contact && (
                  <Text style={styles.errorText}>{errors.emergency_contact}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputLabel}>
                  <Phone size={sizes.sm} color={Colors.textSecondary} />
                  <Text style={styles.label}>Emergency Phone Number</Text>
                  <Text style={styles.required}>*</Text>
                </View>
                <TextInput
                  style={[styles.input, errors.emergency_phone && styles.inputError]}
                  value={waiverData.emergency_phone}
                  onChangeText={(text) => {
                    setWaiverData({ ...waiverData, emergency_phone: text });
                    if (errors.emergency_phone) {
                      setErrors({ ...errors, emergency_phone: undefined });
                    }
                  }}
                  placeholder="Enter emergency phone number"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="phone-pad"
                />
                {errors.emergency_phone && (
                  <Text style={styles.errorText}>{errors.emergency_phone}</Text>
                )}
              </View>
            </View>

            {/* Terms and Conditions */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Terms and Conditions</Text>
              
              <View style={styles.checkboxGroup}>
                <View style={styles.checkboxRow}>
                  <Switch
                    value={waiverData.agreed_to_terms}
                    onValueChange={(value) => {
                      setWaiverData({ ...waiverData, agreed_to_terms: value });
                      if (errors.agreed_to_terms) {
                        setErrors({ ...errors, agreed_to_terms: undefined });
                      }
                    }}
                    trackColor={{ false: Colors.gray[300], true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                  <Text style={styles.checkboxLabel}>
                    I agree to the terms and conditions *
                  </Text>
                </View>
                {errors.agreed_to_terms && (
                  <Text style={styles.errorText}>You must agree to the terms</Text>
                )}
              </View>

              <View style={styles.checkboxGroup}>
                <View style={styles.checkboxRow}>
                  <Switch
                    value={waiverData.age_confirmation}
                    onValueChange={(value) => {
                      setWaiverData({ ...waiverData, age_confirmation: value });
                      if (errors.age_confirmation) {
                        setErrors({ ...errors, age_confirmation: undefined });
                      }
                    }}
                    trackColor={{ false: Colors.gray[300], true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                  <Text style={styles.checkboxLabel}>
                    I confirm I am 18 years or older *
                  </Text>
                </View>
                {errors.age_confirmation && (
                  <Text style={styles.errorText}>Age confirmation is required</Text>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <SubmitButton 
              onPress={handleSubmit} 
              loading={loading} 
              disabled={!waiverData.agreed_to_terms || !waiverData.age_confirmation}
            />
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    ...shadows.level8,
  },
  container: {
    backgroundColor: Colors.background,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: Colors.gray[300],
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: strokeWidth.thin,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.headingMedium,
    color: Colors.text,
    fontWeight: '600',
  },
  closeButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.full,
  },
  closeButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  sessionInfo: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.level2,
  },
  sessionTitle: {
    ...typography.headingSmall,
    color: Colors.text,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  sessionSubtitle: {
    ...typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: spacing.sm,
  },
  sessionPrice: {
    ...typography.labelLarge,
    color: Colors.primary,
    fontWeight: '600',
  },
  formSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.headingSmall,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  label: {
    ...typography.labelMedium,
    color: Colors.text,
    fontWeight: '500',
  },
  required: {
    ...typography.labelMedium,
    color: Colors.error,
    fontWeight: '600',
  },
  input: {
    borderWidth: strokeWidth.thin,
    borderColor: Colors.policeRedBorder,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.bodyMedium,
    color: Colors.text,
    backgroundColor: Colors.white,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    ...typography.labelSmall,
    color: Colors.error,
    marginTop: spacing.xs,
  },
  checkboxGroup: {
    marginBottom: spacing.md,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkboxLabel: {
    ...typography.bodyMedium,
    color: Colors.text,
    flex: 1,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: strokeWidth.thin,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...shadows.level2,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.gray[300],
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
});
