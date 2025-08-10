import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Target, 
  Calendar, 
  MapPin, 
  Phone,
  Shield,
  Clock,
  CheckCircle,
  ChevronDown,
  Ruler,
  Weight,
  Activity,
  Timer
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';

export default function SignUpScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: new Date(),
    gender: '' as 'male' | 'female' | 'other' | '',
    height: '',
    weight: '',
    location: '',
    emergencyContact: '',
    emergencyPhone: '',
    experienceLevel: '' as 'beginner' | 'intermediate' | 'advanced' | '',
    goal: '',
    targetTestDate: new Date(),
    departmentInterest: '',
    currentFitnessLevel: '' as 'beginner' | 'intermediate' | 'advanced' | '',
    workoutFrequency: '' as '1-2 times/week' | '3-4 times/week' | '5+ times/week' | '',
    availableTime: '' as '15-30 minutes' | '30-60 minutes' | '60+ minutes' | '',
    injuries: '',
    medicalConditions: '',
    motivation: '',
    hasExperience: false,
    previousTraining: '',
    // Police Test Current Levels
    prepCircuitLevel: '' as 'never_attempted' | 'below_average' | 'average' | 'good' | 'excellent' | '',
    shuttleRunLevel: '',
    pushUpsMax: '',
    sitReachDistance: '',
    mileRunTime: '',
    coreEnduranceTime: '',
    backExtensionTime: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTargetDatePicker, setShowTargetDatePicker] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { signUp } = useAuth();

  const totalSteps = 5;

  const validatePassword = (password: string) => {
    const requirements = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=[\]{};':"<>?,./`~]/.test(password)
    };
    
    return requirements;
  };

  const getPasswordStrength = (password: string) => {
    const requirements = validatePassword(password);
    const metRequirements = Object.values(requirements).filter(Boolean).length;
    
    if (metRequirements < 2) return { strength: 'weak', color: '#ef4444' };
    if (metRequirements < 4) return { strength: 'fair', color: '#f59e0b' };
    if (metRequirements < 5) return { strength: 'good', color: '#10b981' };
    return { strength: 'strong', color: '#059669' };
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        if (!formData.name || !formData.email || !formData.password) {
          Alert.alert('Missing Information', 'Please fill in all required fields: Full Name, Email, and Password.');
          return false;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          Alert.alert('Invalid Email', 'Please enter a valid email address.');
          return false;
        }
        
        if (formData.password !== formData.confirmPassword) {
          Alert.alert('Password Mismatch', 'Passwords do not match. Please make sure both password fields are identical.');
          return false;
        }
        
        // Enhanced password validation
        const passwordReqs = validatePassword(formData.password);
        const unmetRequirements = [];
        
        if (!passwordReqs.length) unmetRequirements.push('at least 8 characters');
        if (!passwordReqs.lowercase) unmetRequirements.push('one lowercase letter');
        if (!passwordReqs.uppercase) unmetRequirements.push('one uppercase letter');
        if (!passwordReqs.number) unmetRequirements.push('one number');
        if (!passwordReqs.special) unmetRequirements.push('one special character (!@#$%^&*()_+-=[]{};\':"<>?,./`~)');
        
        if (unmetRequirements.length > 0) {
          Alert.alert(
            'Password Requirements', 
            `Your password must contain:\n\n• ${unmetRequirements.join('\n• ')}\n\nPlease update your password to meet these requirements.`
          );
          return false;
        }
        
        return true;
      case 2:
      case 3:
      case 4:
      case 5:
        // All steps after step 1 are optional and can be skipped
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSignUp = async () => {
    if (!validateStep(currentStep)) return;

    setIsLoading(true);
    const age = formData.dateOfBirth ? new Date().getFullYear() - formData.dateOfBirth.getFullYear() : undefined;
    
    const signupData = {
      // Personal Information
      phone: formData.phone || undefined,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender ? formData.gender : undefined,
      height: parseInt(formData.height) || undefined,
      weight: parseInt(formData.weight) || undefined,
      location: formData.location || undefined,
      emergencyContact: formData.emergencyContact || undefined,
      emergencyPhone: formData.emergencyPhone || undefined,
      
      // Goals and Aspirations
      goal: formData.goal || undefined,
      targetTestDate: formData.targetTestDate,
      departmentInterest: formData.departmentInterest || undefined,
      experienceLevel: formData.experienceLevel ? formData.experienceLevel : undefined,
      motivation: formData.motivation || undefined,
      hasExperience: formData.hasExperience,
      previousTraining: formData.previousTraining || undefined,
      
      // Fitness Profile
      currentFitnessLevel: formData.currentFitnessLevel ? formData.currentFitnessLevel : undefined,
      workoutFrequency: formData.workoutFrequency ? formData.workoutFrequency : undefined,
      availableTime: formData.availableTime ? formData.availableTime : undefined,
      injuries: formData.injuries || undefined,
      medicalConditions: formData.medicalConditions || undefined,
      
      // Police Test Current Levels
      prepCircuitLevel: formData.prepCircuitLevel ? formData.prepCircuitLevel : undefined,
      shuttleRunLevel: formData.shuttleRunLevel || undefined,
      pushUpsMax: formData.pushUpsMax || undefined,
      sitReachDistance: formData.sitReachDistance || undefined,
      mileRunTime: formData.mileRunTime || undefined,
      coreEnduranceTime: formData.coreEnduranceTime || undefined,
      backExtensionTime: formData.backExtensionTime || undefined,
      
      // Legacy fields for backward compatibility
      age: age,
      fitnessLevel: formData.currentFitnessLevel ? formData.currentFitnessLevel : undefined,
      goals: [formData.goal, formData.motivation].filter(Boolean),
    };
    
    const result = await signUp(
      formData.email,
      formData.password,
      formData.name,
      signupData
    );
    setIsLoading(false);

    if (result.success) {
      Alert.alert(
        'Account Created Successfully! 🎉', 
        'Welcome to Fit4Duty! Please check your email to verify your account before signing in.',
        [{ text: 'Continue to Sign In', onPress: () => router.replace('/auth/sign-in') }]
      );
    } else {
      // Show user-friendly error with helpful suggestions
      const errorTitle = result.error?.includes('Password') ? 'Password Issue' : 
                        result.error?.includes('email') ? 'Email Issue' : 
                        result.error?.includes('Network') ? 'Connection Issue' : 'Account Creation Failed';
      
      Alert.alert(errorTitle, result.error || 'Failed to create account. Please try again.');
    }
  };

  const handleSkipToSignUp = () => {
    Alert.alert(
      'Complete Setup Later?',
      'You can skip the remaining steps and complete your profile later from the Profile tab. Your basic account will be created with the information you\'ve provided.',
      [
        { text: 'Continue Setup', style: 'cancel' },
        { text: 'Skip & Create Account', onPress: handleSignUp }
      ]
    );
  };

  const updateFormData = (field: string, value: string | Date | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderDropdown = (field: string, options: string[], placeholder: string, icon?: React.ReactNode) => {
    const isActive = activeDropdown === field;
    const selectedValue = formData[field as keyof typeof formData] as string;
    
    return (
      <View style={styles.dropdownContainer}>
        <TouchableOpacity
          style={[styles.inputContainer, isActive && styles.inputContainerActive]}
          onPress={() => setActiveDropdown(isActive ? null : field)}
        >
          {icon && <View style={styles.inputIcon}>{icon}</View>}
          <Text style={[styles.dropdownText, !selectedValue && styles.placeholderText]}>
            {selectedValue || placeholder}
          </Text>
          <ChevronDown 
            size={20} 
            color={Colors.textSecondary} 
            style={[styles.chevronIcon, isActive && styles.chevronIconActive]} 
          />
        </TouchableOpacity>
        
        {isActive && (
          <View style={styles.dropdownOptions}>
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.dropdownOption, selectedValue === option && styles.selectedDropdownOption]}
                onPress={() => {
                  updateFormData(field, option);
                  setActiveDropdown(null);
                }}
              >
                <Text style={[styles.dropdownOptionText, selectedValue === option && styles.selectedDropdownOptionText]}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderDatePicker = (field: 'dateOfBirth' | 'targetTestDate', placeholder: string, icon?: React.ReactNode) => {
    const isDateOfBirth = field === 'dateOfBirth';
    const showPicker = isDateOfBirth ? showDatePicker : showTargetDatePicker;
    const setShowPicker = isDateOfBirth ? setShowDatePicker : setShowTargetDatePicker;
    const selectedDate = formData[field];
    
    return (
      <View>
        <TouchableOpacity
          style={styles.inputContainer}
          onPress={() => setShowPicker(true)}
        >
          {icon && <View style={styles.inputIcon}>{icon}</View>}
          <Text style={styles.dropdownText}>
            {formatDate(selectedDate)}
          </Text>
          <Calendar size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
        
        {showPicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={isDateOfBirth ? new Date() : undefined}
            minimumDate={isDateOfBirth ? new Date(1950, 0, 1) : new Date()}
            onChange={(event, date) => {
              setShowPicker(false);
              if (date) {
                updateFormData(field, date);
              }
            }}
          />
        )}
      </View>
    );
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={styles.progressBarContainer}>
        <View style={[
          styles.progressBar,
          { width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }
        ]} />
      </View>
      <View style={styles.stepDots}>
        {Array.from({ length: totalSteps }, (_, index) => (
          <View key={index} style={[
            styles.stepDot,
            currentStep > index + 1 && styles.stepDotCompleted,
            currentStep === index + 1 && styles.stepDotActive,
          ]}>
            {currentStep > index + 1 && (
              <CheckCircle size={12} color={Colors.white} />
            )}
          </View>
        ))}
      </View>
      <View style={styles.stepLabels}>
        <Text style={[styles.stepLabel, currentStep === 1 && styles.stepLabelActive]}>Account</Text>
        <Text style={[styles.stepLabel, currentStep === 2 && styles.stepLabelActive]}>Personal</Text>
        <Text style={[styles.stepLabel, currentStep === 3 && styles.stepLabelActive]}>Goals</Text>
        <Text style={[styles.stepLabel, currentStep === 4 && styles.stepLabelActive]}>Fitness</Text>
        <Text style={[styles.stepLabel, currentStep === 5 && styles.stepLabelActive]}>Tests</Text>
      </View>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Create Your Account</Text>
      <Text style={styles.stepSubtitle}>Let&apos;s start with the basics (required)</Text>

      <View style={styles.inputContainer}>
        <User size={20} color={Colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={formData.name}
          onChangeText={(value) => updateFormData('name', value)}
          autoCapitalize="words"
          placeholderTextColor={Colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Mail size={20} color={Colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          value={formData.email}
          onChangeText={(value) => updateFormData('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor={Colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Lock size={20} color={Colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, styles.passwordInput]}
          placeholder="Password"
          value={formData.password}
          onChangeText={(value) => updateFormData('password', value)}
          secureTextEntry={!showPassword}
          placeholderTextColor={Colors.textSecondary}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff size={20} color={Colors.textSecondary} />
          ) : (
            <Eye size={20} color={Colors.textSecondary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Password Requirements */}
      {formData.password.length > 0 && (
        <View style={styles.passwordRequirements}>
          <Text style={styles.passwordStrengthLabel}>
            Password Strength: <Text style={[styles.passwordStrength, { color: getPasswordStrength(formData.password).color }]}>
              {getPasswordStrength(formData.password).strength.toUpperCase()}
            </Text>
          </Text>
          
          <View style={styles.requirementsList}>
            {[
              { key: 'length', label: 'At least 8 characters', met: validatePassword(formData.password).length },
              { key: 'lowercase', label: 'One lowercase letter (a-z)', met: validatePassword(formData.password).lowercase },
              { key: 'uppercase', label: 'One uppercase letter (A-Z)', met: validatePassword(formData.password).uppercase },
              { key: 'number', label: 'One number (0-9)', met: validatePassword(formData.password).number },
              { key: 'special', label: 'One special character (!@#$%^&*)', met: validatePassword(formData.password).special },
            ].map((req) => (
              <View key={req.key} style={styles.requirement}>
                <View style={[styles.requirementDot, req.met && styles.requirementMet]} />
                <Text style={[styles.requirementText, req.met && styles.requirementTextMet]}>
                  {req.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={[styles.inputContainer, formData.confirmPassword && formData.password !== formData.confirmPassword && styles.inputContainerError]}>
        <Lock size={20} color={Colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, styles.passwordInput]}
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChangeText={(value) => updateFormData('confirmPassword', value)}
          secureTextEntry={!showConfirmPassword}
          placeholderTextColor={Colors.textSecondary}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          {showConfirmPassword ? (
            <EyeOff size={20} color={Colors.textSecondary} />
          ) : (
            <Eye size={20} color={Colors.textSecondary} />
          )}
        </TouchableOpacity>
        {formData.confirmPassword && formData.password === formData.confirmPassword && (
          <View style={styles.passwordMatchIcon}>
            <CheckCircle size={20} color={Colors.success} />
          </View>
        )}
      </View>
      
      {/* Password Match Indicator */}
      {formData.confirmPassword.length > 0 && (
        <View style={styles.passwordMatchContainer}>
          {formData.password === formData.confirmPassword ? (
            <View style={styles.passwordMatchSuccess}>
              <CheckCircle size={16} color={Colors.success} />
              <Text style={styles.passwordMatchText}>Passwords match!</Text>
            </View>
          ) : (
            <View style={styles.passwordMatchError}>
              <Text style={styles.passwordMismatchText}>Passwords do not match</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Personal Information</Text>
      <Text style={styles.stepSubtitle}>Tell us more about yourself (optional)</Text>

      <View style={styles.inputContainer}>
        <Phone size={20} color={Colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={formData.phone}
          onChangeText={(value) => updateFormData('phone', value)}
          keyboardType="phone-pad"
          placeholderTextColor={Colors.textSecondary}
        />
      </View>

      {renderDatePicker('dateOfBirth', 'Date of Birth', <Calendar size={20} color={Colors.textSecondary} />)}

      {renderDropdown('gender', ['male', 'female', 'other'], 'Select Gender', <User size={20} color={Colors.textSecondary} />)}

      <View style={styles.inputContainer}>
        <Ruler size={20} color={Colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Height (cm)"
          value={formData.height}
          onChangeText={(value) => updateFormData('height', value)}
          keyboardType="numeric"
          placeholderTextColor={Colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Weight size={20} color={Colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Weight (kg)"
          value={formData.weight}
          onChangeText={(value) => updateFormData('weight', value)}
          keyboardType="numeric"
          placeholderTextColor={Colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <MapPin size={20} color={Colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Location (City, Province)"
          value={formData.location}
          onChangeText={(value) => updateFormData('location', value)}
          placeholderTextColor={Colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <User size={20} color={Colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Emergency Contact Name"
          value={formData.emergencyContact}
          onChangeText={(value) => updateFormData('emergencyContact', value)}
          autoCapitalize="words"
          placeholderTextColor={Colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Phone size={20} color={Colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Emergency Contact Phone"
          value={formData.emergencyPhone}
          onChangeText={(value) => updateFormData('emergencyPhone', value)}
          keyboardType="phone-pad"
          placeholderTextColor={Colors.textSecondary}
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Your Goals</Text>
      <Text style={styles.stepSubtitle}>Tell us about your aspirations (optional)</Text>

      <View style={styles.inputContainer}>
        <Target size={20} color={Colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Your Goal (e.g., Pass PREP test, Join OPP)"
          value={formData.goal}
          onChangeText={(value) => updateFormData('goal', value)}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          placeholderTextColor={Colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Shield size={20} color={Colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Department of Interest (e.g., OPP, Toronto Police)"
          value={formData.departmentInterest}
          onChangeText={(value) => updateFormData('departmentInterest', value)}
          placeholderTextColor={Colors.textSecondary}
        />
      </View>

      {renderDatePicker('targetTestDate', 'Target Test Date', <Calendar size={20} color={Colors.textSecondary} />)}

      {renderDropdown('experienceLevel', ['beginner', 'intermediate', 'advanced'], 'Police/Security Experience Level')}

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="What motivates you to become a police officer?"
          value={formData.motivation}
          onChangeText={(value) => updateFormData('motivation', value)}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          placeholderTextColor={Colors.textSecondary}
        />
      </View>

      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => updateFormData('hasExperience', !formData.hasExperience)}
        >
          {formData.hasExperience && (
            <CheckCircle size={20} color={Colors.primary} />
          )}
        </TouchableOpacity>
        <Text style={styles.checkboxLabel}>
          I have previous law enforcement or security experience
        </Text>
      </View>

      {formData.hasExperience && (
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your previous experience..."
            value={formData.previousTraining}
            onChangeText={(value) => updateFormData('previousTraining', value)}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            placeholderTextColor={Colors.textSecondary}
          />
        </View>
      )}
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Fitness Profile</Text>
      <Text style={styles.stepSubtitle}>Help us personalize your training (optional)</Text>

      {renderDropdown('currentFitnessLevel', ['beginner', 'intermediate', 'advanced'], 'Current Fitness Level', <Activity size={20} color={Colors.textSecondary} />)}

      {renderDropdown('workoutFrequency', ['1-2 times/week', '3-4 times/week', '5+ times/week'], 'How often do you currently workout?')}

      {renderDropdown('availableTime', ['15-30 minutes', '30-60 minutes', '60+ minutes'], 'Available Training Time per Session', <Clock size={20} color={Colors.textSecondary} />)}

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Any injuries or physical limitations? (Optional)"
          value={formData.injuries}
          onChangeText={(value) => updateFormData('injuries', value)}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          placeholderTextColor={Colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Any medical conditions we should know about? (Optional)"
          value={formData.medicalConditions}
          onChangeText={(value) => updateFormData('medicalConditions', value)}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          placeholderTextColor={Colors.textSecondary}
        />
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Police Test Experience</Text>
      <Text style={styles.stepSubtitle}>Help us understand your current level (optional)</Text>

      <View style={styles.testLevelsHeader}>
        <Shield size={24} color={Colors.primary} />
        <Text style={styles.testLevelsTitle}>Current Test Levels</Text>
        <Text style={styles.testLevelsSubtitle}>
          Share your current performance levels to get personalized training recommendations
        </Text>
      </View>

      {renderDropdown('prepCircuitLevel', ['never_attempted', 'below_average', 'average', 'good', 'excellent'], 'PREP Circuit Test Experience', <Target size={20} color={Colors.textSecondary} />)}

      <View style={styles.inputContainer}>
        <Activity size={20} color={Colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Shuttle Run Level (e.g., 8.5) - Optional"
          value={formData.shuttleRunLevel}
          onChangeText={(value) => updateFormData('shuttleRunLevel', value)}
          keyboardType="decimal-pad"
          placeholderTextColor={Colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Target size={20} color={Colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Max Push-ups (in 1 minute) - Optional"
          value={formData.pushUpsMax}
          onChangeText={(value) => updateFormData('pushUpsMax', value)}
          keyboardType="numeric"
          placeholderTextColor={Colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ruler size={20} color={Colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Sit & Reach Distance (inches) - Optional"
          value={formData.sitReachDistance}
          onChangeText={(value) => updateFormData('sitReachDistance', value)}
          keyboardType="decimal-pad"
          placeholderTextColor={Colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Clock size={20} color={Colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="1.5 Mile Run Time (mm:ss) - Optional"
          value={formData.mileRunTime}
          onChangeText={(value) => updateFormData('mileRunTime', value)}
          placeholderTextColor={Colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Timer size={20} color={Colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Plank Hold Time (seconds) - Optional"
          value={formData.coreEnduranceTime}
          onChangeText={(value) => updateFormData('coreEnduranceTime', value)}
          keyboardType="numeric"
          placeholderTextColor={Colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Activity size={20} color={Colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Back Extension Hold (seconds) - Optional"
          value={formData.backExtensionTime}
          onChangeText={(value) => updateFormData('backExtensionTime', value)}
          keyboardType="numeric"
          placeholderTextColor={Colors.textSecondary}
        />
      </View>

      <View style={styles.welcomeContainer}>
        <Shield size={48} color={Colors.primary} />
        <Text style={styles.welcomeTitle}>Ready to Start Your Journey!</Text>
        <Text style={styles.welcomeText}>
          You&apos;re all set to begin your police fitness and test preparation journey. 
          We&apos;ll help you every step of the way.
        </Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Logo size="large" variant="primary" style={styles.logo} />
        </View>

        {renderStepIndicator()}

        <View style={styles.form}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}

          <View style={styles.buttonContainer}>
            {currentStep > 1 && (
              <TouchableOpacity style={styles.backButton} onPress={handlePrevious}>
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            
            {currentStep < totalSteps ? (
              <Button
                title="Next"
                onPress={handleNext}
                style={[styles.nextButton, currentStep === 1 && styles.fullWidthButton]}
              />
            ) : (
              <Button
                title="Create Account"
                onPress={handleSignUp}
                loading={isLoading}
                style={styles.nextButton}
              />
            )}
          </View>

          {/* Skip Option - Show after step 1 */}
          {currentStep > 1 && currentStep < totalSteps && (
            <View style={styles.skipContainer}>
              <TouchableOpacity style={styles.skipButton} onPress={handleSkipToSignUp}>
                <Text style={styles.skipButtonText}>
                  Skip & Create Account
                </Text>
              </TouchableOpacity>
              <Text style={styles.skipSubtext}>
                You can complete your profile later from the Profile tab
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/sign-in')}>
            <Text style={styles.signInLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  stepIndicator: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: Colors.gray[200],
    borderRadius: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  stepDots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: {
    backgroundColor: Colors.primary,
  },
  stepDotCompleted: {
    backgroundColor: Colors.success,
  },
  stepLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  stepLabelActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  form: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  stepContent: {
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    minHeight: 56,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    paddingVertical: 16,
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  optionsContainer: {
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedOption: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  selectedOptionText: {
    color: Colors.white,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  welcomeContainer: {
    alignItems: 'center',
    backgroundColor: Colors.primary + '10',
    borderRadius: 16,
    padding: 24,
    marginTop: 16,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
  },
  fullWidthButton: {
    flex: 1,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  signInLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  inputContainerActive: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    paddingVertical: 16,
  },
  placeholderText: {
    color: Colors.textSecondary,
  },
  chevronIcon: {
    transform: [{ rotate: '0deg' }],
  },
  chevronIconActive: {
    transform: [{ rotate: '180deg' }],
  },
  dropdownOptions: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    maxHeight: 200,
  },
  dropdownOption: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  selectedDropdownOption: {
    backgroundColor: Colors.primary + '10',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: Colors.text,
  },
  selectedDropdownOptionText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  testLevelsHeader: {
    alignItems: 'center',
    backgroundColor: Colors.primary + '10',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  testLevelsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  testLevelsSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  skipContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  skipButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
    alignItems: 'center',
    marginBottom: 8,
    minWidth: 200,
  },
  skipButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  skipSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  passwordRequirements: {
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  passwordStrengthLabel: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 12,
  },
  passwordStrength: {
    fontWeight: 'bold',
  },
  requirementsList: {
    gap: 8,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requirementDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gray[300],
  },
  requirementMet: {
    backgroundColor: Colors.success,
  },
  requirementText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  requirementTextMet: {
    color: Colors.success,
    fontWeight: '500',
  },
  inputContainerError: {
    borderColor: Colors.error,
    borderWidth: 2,
  },
  passwordMatchIcon: {
    position: 'absolute',
    right: 50,
  },
  passwordMatchContainer: {
    marginBottom: 16,
    marginTop: -8,
  },
  passwordMatchSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  passwordMatchError: {
    paddingHorizontal: 16,
  },
  passwordMatchText: {
    fontSize: 14,
    color: Colors.success,
    fontWeight: '500',
  },
  passwordMismatchText: {
    fontSize: 14,
    color: Colors.error,
    fontWeight: '500',
  },
});