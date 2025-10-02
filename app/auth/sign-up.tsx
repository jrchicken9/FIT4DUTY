import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Calendar,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';
import PoliceThemeBackground from '@/components/PoliceThemeBackground';

export default function SignUpScreen() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: new Date(),
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { signUp } = useAuth();

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
    const metCount = Object.values(requirements).filter(Boolean).length;
    
    if (metCount < 3) return { strength: 'weak', color: Colors.error };
    if (metCount < 5) return { strength: 'medium', color: Colors.warning };
    return { strength: 'strong', color: Colors.success };
  };

  const handleSignUp = async () => {
    // Clear previous messages
    setErrorMessage('');
    setSuccessMessage('');

    // Validate required fields
    if (!formData.firstName.trim()) {
      setErrorMessage('First name is required');
      return;
    }
    if (!formData.lastName.trim()) {
      setErrorMessage('Last name is required');
      return;
    }
    if (!formData.email.trim()) {
      setErrorMessage('Email is required');
      return;
    }
    if (!formData.password) {
      setErrorMessage('Password is required');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    // Validate password strength
    const requirements = validatePassword(formData.password);
    const metCount = Object.values(requirements).filter(Boolean).length;
    if (metCount < 3) {
      setErrorMessage('Password is too weak. Please meet at least 3 requirements.');
      return;
    }

    setIsLoading(true);
    
    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    console.log('Signup form - First Name:', formData.firstName);
    console.log('Signup form - Last Name:', formData.lastName);
    console.log('Signup form - Combined Full Name:', fullName);
    
    const signupData = {
      // Basic information only
      full_name: fullName,
      first_name: formData.firstName.trim(),
      last_name: formData.lastName.trim(),
      date_of_birth: formData.dateOfBirth.toISOString(),
      phone: null,
    };
    
    console.log('Signup form - Final signupData:', signupData);
    console.log('Signup form - First name value:', formData.firstName);
    console.log('Signup form - Last name value:', formData.lastName);
    console.log('Signup form - Email value:', formData.email);
    
    try {
      const result = await signUp(
        formData.email,
        formData.password,
        signupData
      );
      setIsLoading(false);

      if (result.user) {
        setSuccessMessage('Account created successfully! Redirecting to setup...');
        setTimeout(() => {
          // Redirect to dashboard
          router.replace('/(tabs)/dashboard');
        }, 2000);
      } else {
        setErrorMessage('Failed to create account. Please try again.');
      }
    } catch (error: any) {
      setIsLoading(false);
      setErrorMessage(error.message || 'Failed to create account. Please try again.');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderDatePicker = () => {
    return (
      <View>
        <TouchableOpacity
          style={styles.inputContainer}
          onPress={() => setShowDatePicker(true)}
        >
          <Calendar size={16} color={Colors.textSecondary} />
          <Text style={styles.dropdownText}>
            {formatDate(formData.dateOfBirth)}
          </Text>
        </TouchableOpacity>
        
        {showDatePicker && (
          <DateTimePicker
            value={formData.dateOfBirth}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={new Date()}
            minimumDate={new Date(1950, 0, 1)}
            textColor={Colors.text}
            onChange={(event, date) => {
              if (Platform.OS === 'ios') {
                // On iOS, only update when user confirms
                if (event.type === 'dismissed') {
                  setShowDatePicker(false);
                } else if (event.type === 'set' && date) {
                  setFormData(prev => ({ ...prev, dateOfBirth: date }));
                  setShowDatePicker(false);
                }
              } else {
                // On Android, update immediately and close
                setShowDatePicker(false);
                if (date) {
                  setFormData(prev => ({ ...prev, dateOfBirth: date }));
                }
              }
            }}
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <PoliceThemeBackground>
        <View />
      </PoliceThemeBackground>
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Logo size="large" variant="primary" style={styles.logo} />
          </View>

        <View style={styles.form}>
          {/* Error and Success Messages */}
          <ErrorMessage 
            message={errorMessage} 
            type="error" 
            visible={!!errorMessage} 
          />
          <ErrorMessage 
            message={successMessage} 
            type="success" 
            visible={!!successMessage} 
          />

          {/* Simplified Form */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Create Your Account</Text>
            <Text style={styles.sectionSubtitle}>
              Get started with the essential information. You can complete your profile later.
            </Text>
          </View>

          {/* First Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>First Name *</Text>
            <View style={styles.inputContainer}>
              <User size={16} color={Colors.textSecondary} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter your first name"
                value={formData.firstName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Last Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Last Name *</Text>
            <View style={styles.inputContainer}>
              <User size={16} color={Colors.textSecondary} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter your last name"
                value={formData.lastName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address *</Text>
            <View style={styles.inputContainer}>
              <Mail size={16} color={Colors.textSecondary} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter your email address"
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Date of Birth */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date of Birth *</Text>
            {renderDatePicker()}
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password *</Text>
            <View style={styles.inputContainer}>
              <Lock size={16} color={Colors.textSecondary} />
              <TextInput
                style={styles.textInput}
                placeholder="Create a password"
                value={formData.password}
                onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} color={Colors.textSecondary} /> : <Eye size={16} color={Colors.textSecondary} />}
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
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm Password *</Text>
            <View style={styles.inputContainer}>
              <Lock size={16} color={Colors.textSecondary} />
              <TextInput
                style={styles.textInput}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={16} color={Colors.textSecondary} /> : <Eye size={16} color={Colors.textSecondary} />}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Create Account"
              onPress={handleSignUp}
              loading={isLoading}
              style={styles.fullWidthButton}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/sign-in')}>
            <Text style={styles.signInLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  logo: {
    marginBottom: 24,
  },
  form: {
    backgroundColor: Colors.primary + '08',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.policeRedBorder,
    shadowColor: Colors.primary + '20',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.policeRedBorder,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  eyeButton: {
    padding: 4,
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  passwordRequirements: {
    marginTop: 12,
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
  passwordStrengthLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  passwordStrength: {
    fontWeight: 'bold',
  },
  requirementsList: {
    gap: 6,
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
    fontSize: 12,
    color: Colors.textSecondary,
  },
  requirementTextMet: {
    color: Colors.text,
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  fullWidthButton: {
    width: '100%',
  },
  completeLaterContainer: {
    backgroundColor: Colors.primary + '10',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  completeLaterText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  signInLink: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },

});
