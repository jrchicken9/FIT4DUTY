import React, { useState, useRef, useEffect } from 'react';
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
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import {
  X,
  Shield,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Heart,
  Pill,
  FileText,
  CheckCircle,
  AlertTriangle,
  Download,
} from 'lucide-react-native';
import SignatureCanvas from './SignatureCanvas';
import Colors from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { ErrorAlert } from './ErrorAlert';

export interface EnhancedWaiverData {
  // Personal Information
  full_name: string;
  date_of_birth: string;
  phone: string;
  email: string;
  address?: string;
  city?: string;
  province?: string;
  
  // Emergency Contact
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  
  // Medical Information (Optional)
  medical_conditions?: string;
  medications?: string;
  allergies?: string;
  
  // Legal Acknowledgments
  medically_fit: boolean;
  understand_risks: boolean;
  release_liability: boolean;
  consent_emergency_care: boolean;
  agree_policies: boolean;
  
  // Signature
  signature_data: string;
  typed_legal_name: string;
  signature_timestamp: string;
  
  // Versioning
  waiver_version: string;
}

interface EnhancedWaiverModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (waiverData: EnhancedWaiverData) => Promise<void>;
  loading?: boolean;
  sessionTitle?: string;
  sessionPrice?: number;
  currentWaiverVersion?: string;
  userLastSignedVersion?: string;
}

const CURRENT_WAIVER_VERSION = '2025-01-01';

export default function EnhancedWaiverModal({
  visible,
  onClose,
  onSubmit,
  loading = false,
  sessionTitle = 'Practice Session',
  sessionPrice = 0,
  currentWaiverVersion = CURRENT_WAIVER_VERSION,
  userLastSignedVersion,
}: EnhancedWaiverModalProps) {
  const { user } = useAuth();
  const [signatureData, setSignatureData] = useState<string>('');
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showFullWaiverModal, setShowFullWaiverModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [waiverData, setWaiverData] = useState<EnhancedWaiverData>({
    full_name: user?.full_name || user?.user_metadata?.full_name || '',
    date_of_birth: user?.date_of_birth || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: user?.location || '',
    city: '',
    province: '',
    emergency_contact_name: user?.emergency_contact || '',
    emergency_contact_phone: user?.emergency_phone || '',
    emergency_contact_relationship: '',
    medical_conditions: user?.medical_conditions || '',
    medications: '',
    allergies: '',
    medically_fit: false,
    understand_risks: false,
    release_liability: false,
    consent_emergency_care: false,
    agree_policies: false,
    signature_data: '',
    typed_legal_name: '',
    signature_timestamp: '',
    waiver_version: currentWaiverVersion,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Helper function to clear specific error
  const clearError = (fieldName: string) => {
    if (errors[fieldName]) {
      const newErrors = { ...errors };
      delete newErrors[fieldName];
      setErrors(newErrors);
    }
  };

  // Check if user needs to re-sign waiver
  const needsResign = userLastSignedVersion && userLastSignedVersion < currentWaiverVersion;

  // Format date of birth for display
  const formatDateOfBirth = (dateString: string | null): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    } catch {
      return dateString;
    }
  };

  // Update waiver data when user profile changes
  useEffect(() => {
    if (user) {
      setWaiverData(prev => ({
        ...prev,
        full_name: user.full_name || user.user_metadata?.full_name || prev.full_name,
        date_of_birth: formatDateOfBirth(user.date_of_birth) || prev.date_of_birth,
        phone: user.phone || prev.phone,
        email: user.email || prev.email,
        address: user.location || prev.address,
        emergency_contact_name: user.emergency_contact || prev.emergency_contact_name,
        emergency_contact_phone: user.emergency_phone || prev.emergency_contact_phone,
        medical_conditions: user.medical_conditions || prev.medical_conditions,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (visible && needsResign) {
      Alert.alert(
        'Waiver Update Required',
        'The waiver has been updated. Please review and sign the new version.',
        [{ text: 'OK' }]
      );
    }
  }, [visible, needsResign]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required personal information
    if (!waiverData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }
    if (!waiverData.date_of_birth.trim()) {
      newErrors.date_of_birth = 'Date of birth is required';
    }
    if (!waiverData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!waiverData.email.trim()) {
      newErrors.email = 'Email is required';
    }

    // Required emergency contact
    if (!waiverData.emergency_contact_name.trim()) {
      newErrors.emergency_contact_name = 'Emergency contact name is required';
    }
    if (!waiverData.emergency_contact_phone.trim()) {
      newErrors.emergency_contact_phone = 'Emergency contact phone is required';
    }
    if (!waiverData.emergency_contact_relationship.trim()) {
      newErrors.emergency_contact_relationship = 'Relationship is required';
    }

    // Required legal acknowledgments
    if (!waiverData.medically_fit) {
      newErrors.medically_fit = 'You must confirm you are medically fit';
    }
    if (!waiverData.understand_risks) {
      newErrors.understand_risks = 'You must acknowledge the risks';
    }
    if (!waiverData.release_liability) {
      newErrors.release_liability = 'You must release liability';
    }
    if (!waiverData.consent_emergency_care) {
      newErrors.consent_emergency_care = 'You must consent to emergency care';
    }
    if (!waiverData.agree_policies) {
      newErrors.agree_policies = 'You must agree to policies';
    }

    // Required signature
    if (!waiverData.signature_data.trim()) {
      newErrors.signature_data = 'Signature is required';
    }
    if (!waiverData.typed_legal_name.trim()) {
      newErrors.typed_legal_name = 'Typed legal name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      ErrorAlert.showWaiverError('VALIDATION_ERROR: Please fill in all required fields correctly.');
      return;
    }

    try {
      // Add timestamp to signature
      const updatedWaiverData = {
        ...waiverData,
        signature_timestamp: new Date().toISOString(),
      };
      
      await onSubmit(updatedWaiverData);
    } catch (error) {
      ErrorAlert.showWaiverError(error);
    }
  };

  const handleSignatureConfirm = (signature: string) => {
    setWaiverData({ ...waiverData, signature_data: signature });
    setSignatureData(signature);
    setShowSignatureModal(false);
  };

  const handleSignatureClear = () => {
    setSignatureData('');
  };

  const handleSignatureSave = () => {
    if (signatureData) {
      handleSignatureConfirm(signatureData);
    }
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  // Check if all legal agreements are checked
  const allLegalAgreementsChecked = 
    waiverData.medically_fit &&
    waiverData.understand_risks &&
    waiverData.release_liability &&
    waiverData.consent_emergency_care &&
    waiverData.agree_policies;

  // Helper component to show auto-populated indicator
  const AutoPopulatedIndicator = ({ field }: { field: string }) => {
    const isAutoPopulated = 
      (field === 'full_name' && user?.full_name) ||
      (field === 'date_of_birth' && user?.date_of_birth) ||
      (field === 'phone' && user?.phone) ||
      (field === 'email' && user?.email) ||
      (field === 'address' && user?.location) ||
      (field === 'emergency_contact_name' && user?.emergency_contact) ||
      (field === 'emergency_contact_phone' && user?.emergency_phone) ||
      (field === 'medical_conditions' && user?.medical_conditions);

    if (!isAutoPopulated) return null;

    return (
      <View style={styles.autoPopulatedIndicator}>
        <Text style={styles.autoPopulatedText}>Auto-filled from profile</Text>
      </View>
    );
  };

  if (!visible) return null;

  const { height: screenHeight } = Dimensions.get('window');

  const renderStep1 = () => (
    <ScrollView 
      style={styles.content} 
      showsVerticalScrollIndicator={true}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.scrollContent}
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
        {needsResign && (
          <View style={styles.updateNotice}>
            <AlertTriangle size={16} color="#f59e0b" />
            <Text style={styles.updateNoticeText}>
              Waiver updated - re-signature required
            </Text>
          </View>
        )}
      </View>

      {/* Personal Information */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <View style={styles.inputGroup}>
          <View style={styles.inputLabel}>
            <User size={16} color={Colors.textSecondary} />
            <Text style={styles.label}>Full Legal Name</Text>
            <Text style={styles.required}>*</Text>
          </View>
          <TextInput
            style={[styles.input, errors.full_name && styles.inputError]}
            value={waiverData.full_name}
            onChangeText={(text) => {
              setWaiverData({ ...waiverData, full_name: text });
              clearError('full_name');
            }}
            placeholder="Enter your full legal name"
            placeholderTextColor={Colors.textSecondary}
          />
          <AutoPopulatedIndicator field="full_name" />
          {errors.full_name && (
            <Text style={styles.errorText}>{errors.full_name}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.inputLabel}>
            <Calendar size={16} color={Colors.textSecondary} />
            <Text style={styles.label}>Date of Birth</Text>
            <Text style={styles.required}>*</Text>
          </View>
          <TextInput
            style={[styles.input, errors.date_of_birth && styles.inputError]}
            value={waiverData.date_of_birth}
            onChangeText={(text) => {
              setWaiverData({ ...waiverData, date_of_birth: text });
              clearError('date_of_birth');
            }}
            placeholder="MM/DD/YYYY"
            placeholderTextColor={Colors.textSecondary}
          />
          <AutoPopulatedIndicator field="date_of_birth" />
          {errors.date_of_birth && (
            <Text style={styles.errorText}>{errors.date_of_birth}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.inputLabel}>
            <Phone size={16} color={Colors.textSecondary} />
            <Text style={styles.label}>Phone Number</Text>
            <Text style={styles.required}>*</Text>
          </View>
          <TextInput
            style={[styles.input, errors.phone && styles.inputError]}
            value={waiverData.phone}
            onChangeText={(text) => {
              setWaiverData({ ...waiverData, phone: text });
              clearError('phone');
            }}
            placeholder="Phone number"
            placeholderTextColor={Colors.textSecondary}
            keyboardType="phone-pad"
          />
          <AutoPopulatedIndicator field="phone" />
          {errors.phone && (
            <Text style={styles.errorText}>{errors.phone}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.inputLabel}>
            <Mail size={16} color={Colors.textSecondary} />
            <Text style={styles.label}>Email Address</Text>
            <Text style={styles.required}>*</Text>
          </View>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            value={waiverData.email}
            onChangeText={(text) => {
              setWaiverData({ ...waiverData, email: text });
              clearError('email');
            }}
            placeholder="Email address"
            placeholderTextColor={Colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <AutoPopulatedIndicator field="email" />
          {errors.email && (
            <Text style={styles.errorText}>{errors.email}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.inputLabel}>
            <MapPin size={16} color={Colors.textSecondary} />
            <Text style={styles.label}>Address</Text>
          </View>
          <TextInput
            style={styles.input}
            value={waiverData.address}
            onChangeText={(text) => setWaiverData({ ...waiverData, address: text })}
            placeholder="Street address"
            placeholderTextColor={Colors.textSecondary}
          />
          <AutoPopulatedIndicator field="address" />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <TextInput
              style={styles.input}
              value={waiverData.city}
              onChangeText={(text) => setWaiverData({ ...waiverData, city: text })}
              placeholder="City"
              placeholderTextColor={Colors.textSecondary}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <TextInput
              style={styles.input}
              value={waiverData.province}
              onChangeText={(text) => setWaiverData({ ...waiverData, province: text })}
              placeholder="Province"
              placeholderTextColor={Colors.textSecondary}
            />
          </View>
        </View>
      </View>

      {/* Emergency Contact */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Emergency Contact</Text>
        
        <View style={styles.inputGroup}>
          <View style={styles.inputLabel}>
            <User size={16} color={Colors.textSecondary} />
            <Text style={styles.label}>Emergency Contact Name</Text>
            <Text style={styles.required}>*</Text>
          </View>
          <TextInput
            style={[styles.input, errors.emergency_contact_name && styles.inputError]}
            value={waiverData.emergency_contact_name}
            onChangeText={(text) => {
              setWaiverData({ ...waiverData, emergency_contact_name: text });
              clearError('emergency_contact_name');
            }}
            placeholder="Emergency contact name"
            placeholderTextColor={Colors.textSecondary}
          />
          <AutoPopulatedIndicator field="emergency_contact_name" />
          {errors.emergency_contact_name && (
            <Text style={styles.errorText}>{errors.emergency_contact_name}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.inputLabel}>
            <Phone size={16} color={Colors.textSecondary} />
            <Text style={styles.label}>Emergency Contact Phone</Text>
            <Text style={styles.required}>*</Text>
          </View>
          <TextInput
            style={[styles.input, errors.emergency_contact_phone && styles.inputError]}
            value={waiverData.emergency_contact_phone}
            onChangeText={(text) => {
              setWaiverData({ ...waiverData, emergency_contact_phone: text });
              clearError('emergency_contact_phone');
            }}
            placeholder="Emergency contact phone"
            placeholderTextColor={Colors.textSecondary}
            keyboardType="phone-pad"
          />
          <AutoPopulatedIndicator field="emergency_contact_phone" />
          {errors.emergency_contact_phone && (
            <Text style={styles.errorText}>{errors.emergency_contact_phone}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.inputLabel}>
            <User size={16} color={Colors.textSecondary} />
            <Text style={styles.label}>Relationship to Emergency Contact</Text>
            <Text style={styles.required}>*</Text>
          </View>
          <TextInput
            style={[styles.input, errors.emergency_contact_relationship && styles.inputError]}
            value={waiverData.emergency_contact_relationship}
            onChangeText={(text) => {
              setWaiverData({ ...waiverData, emergency_contact_relationship: text });
              clearError('emergency_contact_relationship');
            }}
            placeholder="e.g., Spouse, Parent, Friend"
            placeholderTextColor={Colors.textSecondary}
          />
          {errors.emergency_contact_relationship && (
            <Text style={styles.errorText}>{errors.emergency_contact_relationship}</Text>
          )}
        </View>
      </View>

      {/* Medical Information */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Medical Information (Optional)</Text>
        
        <View style={styles.inputGroup}>
          <View style={styles.inputLabel}>
            <Heart size={16} color={Colors.textSecondary} />
            <Text style={styles.label}>Medical Conditions</Text>
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={waiverData.medical_conditions}
            onChangeText={(text) => setWaiverData({ ...waiverData, medical_conditions: text })}
            placeholder="List any medical conditions"
            placeholderTextColor={Colors.textSecondary}
            multiline
            numberOfLines={3}
          />
          <AutoPopulatedIndicator field="medical_conditions" />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.inputLabel}>
            <Pill size={16} color={Colors.textSecondary} />
            <Text style={styles.label}>Current Medications</Text>
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={waiverData.medications}
            onChangeText={(text) => setWaiverData({ ...waiverData, medications: text })}
            placeholder="List any current medications"
            placeholderTextColor={Colors.textSecondary}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.inputLabel}>
            <AlertTriangle size={16} color={Colors.textSecondary} />
            <Text style={styles.label}>Allergies</Text>
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={waiverData.allergies}
            onChangeText={(text) => setWaiverData({ ...waiverData, allergies: text })}
            placeholder="List any allergies"
            placeholderTextColor={Colors.textSecondary}
            multiline
            numberOfLines={3}
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => setCurrentStep(2)}
      >
        <Text style={styles.nextButtonText}>Continue to Legal Agreements</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView 
      style={styles.content} 
      showsVerticalScrollIndicator={true}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.scrollContent}
    >
      {/* Legal Agreements */}
      <View style={styles.formSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Legal Agreements</Text>
          <View style={styles.sectionHeaderButtons}>
            <TouchableOpacity
              style={[
                styles.agreeAllButton,
                allLegalAgreementsChecked && styles.agreeAllButtonActive
              ]}
              onPress={() => {
                const newValue = !allLegalAgreementsChecked;
                setWaiverData({
                  ...waiverData,
                  medically_fit: newValue,
                  understand_risks: newValue,
                  release_liability: newValue,
                  consent_emergency_care: newValue,
                  agree_policies: newValue,
                });
                // Clear any existing errors for these fields
                clearError('medically_fit');
                clearError('understand_risks');
                clearError('release_liability');
                clearError('consent_emergency_care');
                clearError('agree_policies');
              }}
            >
              <CheckCircle size={16} color={Colors.white} />
              <Text style={styles.agreeAllText}>
                {allLegalAgreementsChecked ? 'All Agreed' : 'Agree to All'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.viewWaiverButton}
              onPress={() => setShowFullWaiverModal(true)}
            >
              <FileText size={16} color={Colors.primary} />
              <Text style={styles.viewWaiverText}>View Full Waiver</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.waiverTextContainer}>
          <Text style={styles.waiverText}>
            By signing this waiver, you acknowledge and agree to the following terms and conditions for participation in fitness testing activities with Fit4Duty.
          </Text>
        </View>

        <View style={[
          styles.checklistItem,
          waiverData.medically_fit && styles.checklistItemChecked
        ]}>
          <Switch
            value={waiverData.medically_fit}
            onValueChange={(value) => {
              setWaiverData({ ...waiverData, medically_fit: value });
              clearError('medically_fit');
            }}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={Colors.white}
          />
          <Text style={[
            styles.checklistLabel,
            waiverData.medically_fit && styles.checklistLabelChecked
          ]}>
            I confirm that I am medically fit to participate in physical fitness testing activities
          </Text>
        </View>
        {errors.medically_fit && (
          <Text style={styles.errorText}>{errors.medically_fit}</Text>
        )}

        <View style={[
          styles.checklistItem,
          waiverData.understand_risks && styles.checklistItemChecked
        ]}>
          <Switch
            value={waiverData.understand_risks}
            onValueChange={(value) => {
              setWaiverData({ ...waiverData, understand_risks: value });
              clearError('understand_risks');
            }}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={Colors.white}
          />
          <Text style={[
            styles.checklistLabel,
            waiverData.understand_risks && styles.checklistLabelChecked
          ]}>
            I understand the risks of injury associated with physical fitness testing
          </Text>
        </View>
        {errors.understand_risks && (
          <Text style={styles.errorText}>{errors.understand_risks}</Text>
        )}

        <View style={[
          styles.checklistItem,
          waiverData.release_liability && styles.checklistItemChecked
        ]}>
          <Switch
            value={waiverData.release_liability}
            onValueChange={(value) => {
              setWaiverData({ ...waiverData, release_liability: value });
              clearError('release_liability');
            }}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={Colors.white}
          />
          <Text style={[
            styles.checklistLabel,
            waiverData.release_liability && styles.checklistLabelChecked
          ]}>
            I release Fit4Duty and its instructors from liability to the extent permitted by law
          </Text>
        </View>
        {errors.release_liability && (
          <Text style={styles.errorText}>{errors.release_liability}</Text>
        )}

        <View style={[
          styles.checklistItem,
          waiverData.consent_emergency_care && styles.checklistItemChecked
        ]}>
          <Switch
            value={waiverData.consent_emergency_care}
            onValueChange={(value) => {
              setWaiverData({ ...waiverData, consent_emergency_care: value });
              clearError('consent_emergency_care');
            }}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={Colors.white}
          />
          <Text style={[
            styles.checklistLabel,
            waiverData.consent_emergency_care && styles.checklistLabelChecked
          ]}>
            I consent to emergency medical care if needed during the session
          </Text>
        </View>
        {errors.consent_emergency_care && (
          <Text style={styles.errorText}>{errors.consent_emergency_care}</Text>
        )}

        <View style={[
          styles.checklistItem,
          waiverData.agree_policies && styles.checklistItemChecked
        ]}>
          <Switch
            value={waiverData.agree_policies}
            onValueChange={(value) => {
              setWaiverData({ ...waiverData, agree_policies: value });
              clearError('agree_policies');
            }}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={Colors.white}
          />
          <Text style={[
            styles.checklistLabel,
            waiverData.agree_policies && styles.checklistLabelChecked
          ]}>
            I agree to Fit4Duty's policies regarding refunds, cancellations, and conduct
          </Text>
        </View>
        {errors.agree_policies && (
          <Text style={styles.errorText}>{errors.agree_policies}</Text>
        )}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentStep(1)}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => setCurrentStep(3)}
        >
          <Text style={styles.nextButtonText}>Continue to Signature</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderStep3 = () => (
    <ScrollView 
      style={styles.content} 
      showsVerticalScrollIndicator={true}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.scrollContent}
    >
      {/* Signature Section */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Digital Signature</Text>
        
        <View style={styles.signatureContainer}>
          {waiverData.signature_data ? (
            <View style={styles.signaturePreview}>
              <Text style={styles.signaturePreviewText}>Signature captured</Text>
              <TouchableOpacity
                style={styles.resignButton}
                onPress={() => setShowSignatureModal(true)}
              >
                <Text style={styles.resignButtonText}>Re-sign</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.signatureButton}
              onPress={() => setShowSignatureModal(true)}
            >
              <FileText size={24} color={Colors.primary} />
              <Text style={styles.signatureButtonText}>Tap to sign</Text>
            </TouchableOpacity>
          )}
          {errors.signature_data && (
            <Text style={styles.errorText}>{errors.signature_data}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.inputLabel}>
            <User size={16} color={Colors.textSecondary} />
            <Text style={styles.label}>Type Your Legal Name</Text>
            <Text style={styles.required}>*</Text>
          </View>
          <TextInput
            style={[styles.input, errors.typed_legal_name && styles.inputError]}
            value={waiverData.typed_legal_name}
            onChangeText={(text) => {
              setWaiverData({ ...waiverData, typed_legal_name: text });
              clearError('typed_legal_name');
            }}
            placeholder="Type your full legal name as signature"
            placeholderTextColor={Colors.textSecondary}
          />
          {errors.typed_legal_name && (
            <Text style={styles.errorText}>{errors.typed_legal_name}</Text>
          )}
        </View>
      </View>


    </ScrollView>
  );

  return (
    <>
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <KeyboardAvoidingView 
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <View style={styles.container}>
            {/* Drag Indicator */}
            <View style={styles.dragIndicator} />
            
            {/* Sticky Header */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Shield size={24} color={Colors.primary} />
                <Text style={styles.title}>Fitness Assessment Waiver</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={24} color={Colors.white} />
              </TouchableOpacity>
            </View>

            {/* Sticky Step Indicator */}
            <View style={styles.stepIndicator}>
              {[1, 2, 3].map((step) => (
                <View key={step} style={styles.stepContainer}>
                  <View style={[
                    styles.stepCircle,
                    currentStep >= step && styles.stepCircleActive
                  ]}>
                    {currentStep > step ? (
                      <CheckCircle size={16} color={Colors.white} />
                    ) : (
                      <Text style={[
                        styles.stepNumber,
                        currentStep >= step && styles.stepNumberActive
                      ]}>
                        {step}
                      </Text>
                    )}
                  </View>
                  <Text style={[
                    styles.stepLabel,
                    currentStep >= step && styles.stepLabelActive
                  ]}>
                    {step === 1 ? 'Info' : step === 2 ? 'Agreements' : 'Signature'}
                  </Text>
                </View>
              ))}
            </View>

            {/* Scrollable Content Area */}
            <ScrollView 
              style={styles.contentContainer}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.scrollContent}
            >
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </ScrollView>

            {/* Sticky Footer */}
            <View style={styles.footer}>
              {currentStep > 1 && (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setCurrentStep(currentStep - 1)}
                >
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
              )}
              
              {currentStep < 3 ? (
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={() => setCurrentStep(currentStep + 1)}
                >
                  <Text style={styles.nextButtonText}>Next</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    (!waiverData.signature_data || !waiverData.typed_legal_name || loading) && styles.submitButtonDisabled
                  ]}
                  onPress={handleSubmit}
                  disabled={!waiverData.signature_data || !waiverData.typed_legal_name || loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={Colors.white} />
                  ) : (
                    <Shield size={20} color={Colors.white} />
                  )}
                  <Text style={styles.submitButtonText}>
                    {loading ? 'Processing...' : sessionPrice > 0 ? `Agree & Pay ${formatPrice(sessionPrice)}` : 'Agree & Continue'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>

      {/* Signature Modal */}
      <Modal
        visible={showSignatureModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.signatureModalContainer}>
          <View style={styles.signatureModalHeader}>
            <Text style={styles.signatureModalTitle}>Sign Your Name</Text>
            <TouchableOpacity
              style={styles.signatureModalClose}
              onPress={() => setShowSignatureModal(false)}
            >
              <X size={24} color={Colors.white} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.signatureCanvasContainer}>
            <SignatureCanvas
              onSignatureChange={setSignatureData}
              width={300}
              height={200}
              strokeWidth={3}
              strokeColor="#000000"
              backgroundColor="white"
            />
          </View>
          
          <View style={styles.signatureModalActions}>
            <TouchableOpacity
              style={styles.signatureClearButton}
              onPress={handleSignatureClear}
            >
              <Text style={styles.signatureClearButtonText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.signatureSaveButton}
              onPress={handleSignatureSave}
            >
              <Text style={styles.signatureSaveButtonText}>Save Signature</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Full Waiver Modal */}
      <Modal
        visible={showFullWaiverModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.fullWaiverModalContainer}>
          <View style={styles.fullWaiverModalHeader}>
            <Text style={styles.fullWaiverModalTitle}>Complete Waiver Text</Text>
            <TouchableOpacity
              style={styles.fullWaiverModalClose}
              onPress={() => setShowFullWaiverModal(false)}
            >
              <X size={24} color={Colors.white} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.fullWaiverContent}>
            <Text style={styles.fullWaiverText}>
              {/* Full legal waiver text would go here */}
              This is the complete legal waiver text that users can review before signing...
            </Text>
          </ScrollView>
          
          <View style={styles.fullWaiverModalActions}>
            <TouchableOpacity
              style={styles.fullWaiverCloseButton}
              onPress={() => setShowFullWaiverModal(false)}
            >
              <Text style={styles.fullWaiverCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
    height: '88%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    flexDirection: 'column',
    display: 'flex',
  },
  dragIndicator: {
    width: 50,
    height: 5,
    backgroundColor: '#9CA3AF',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 0,
    backgroundColor: Colors.primary,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: Colors.white,
  },
  stepContainer: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepCircleActive: {
    backgroundColor: Colors.primary,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  stepNumberActive: {
    color: Colors.white,
  },
  stepLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  stepLabelActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: Colors.white,
  },

  sessionInfo: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  sessionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0369A1',
    marginBottom: 6,
  },
  sessionSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 10,
  },
  sessionPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  updateNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  updateNoticeText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500',
  },
  formSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionHeaderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  agreeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    gap: 8,
  },
  agreeAllButtonActive: {
    backgroundColor: Colors.success,
  },
  agreeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  viewWaiverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewWaiverText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  waiverTextContainer: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  waiverText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  required: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.error,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: Colors.policeRedBorder,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    ...Platform.select({
      ios: {
        paddingVertical: 14,
      },
    }),
  },
  inputError: {
    borderColor: '#EF4444',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    ...Platform.select({
      ios: {
        paddingTop: 14,
      },
    }),
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 6,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  checklistItemChecked: {
    opacity: 0.8,
  },
  checklistLabel: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
    lineHeight: 22,
  },
  checklistLabelChecked: {
    color: Colors.success,
    fontWeight: '500',
  },
  signatureContainer: {
    marginBottom: 20,
  },
  signatureButton: {
    borderWidth: 2,
    borderColor: Colors.policeRedBorder,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  signatureButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 8,
  },
  signaturePreview: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 20,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
  },
  signaturePreviewText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 12,
  },
  resignButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  resignButtonText: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    minHeight: 52,
  },
  backButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#6B7280',
  },
  nextButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    gap: 8,
    minHeight: 52,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    gap: 8,
    minHeight: 52,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
  },
  // Signature Modal Styles
  signatureModalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  signatureModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0,
    backgroundColor: Colors.primary,
  },
  signatureModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  signatureModalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signatureCanvasContainer: {
    flex: 1,
    margin: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  signatureModalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  signatureClearButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  signatureClearButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#6B7280',
  },
  signatureSaveButton: {
    flex: 2,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  signatureSaveButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
  },
  // Full Waiver Modal Styles
  fullWaiverModalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  fullWaiverModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0,
    backgroundColor: Colors.primary,
  },
  fullWaiverModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  fullWaiverModalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWaiverContent: {
    flex: 1,
    padding: 20,
  },
  fullWaiverText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  fullWaiverModalActions: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  fullWaiverCloseButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  fullWaiverCloseButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
  },
  autoPopulatedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 4,
  },
  autoPopulatedText: {
    fontSize: 12,
    color: Colors.success,
    fontStyle: 'italic',
  },
  // New styles for full-screen modal
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20, // Account for home indicator on iOS
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: Colors.white,
    gap: 12,
  },
});
