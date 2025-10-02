import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';
import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import PoliceThemeBackground from '@/components/PoliceThemeBackground';
import ResetPasswordModal from '@/components/ResetPasswordModal';
import { Eye, EyeOff, Mail, Lock, Check } from 'lucide-react-native';


export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [stayLoggedIn, setStayLoggedIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

  const { signIn, resendConfirmationEmail, isAdmin } = useAuth();



  const handleSignIn = async () => {
    // Clear previous messages
    setErrorMessage('');
    setSuccessMessage('');

    // Validate required fields
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Starting sign in process...');
      const result = await signIn(email, password);
      console.log('Sign in result:', result);
      
      if (result.success) {
        setSuccessMessage('Sign in successful! Loading your profile...');
        
        // Wait a bit longer for profile loading to complete
        setTimeout(() => {
          console.log('Checking admin status and redirecting...');
          // Check if user is admin and redirect accordingly
          if (isAdmin()) {
            console.log('User is admin, redirecting to admin dashboard');
            router.replace('/admin/dashboard');
          } else {
            console.log('User is regular user, redirecting to main dashboard');
            router.replace('/(tabs)/dashboard');
          }
        }, 2000); // Increased delay to ensure profile is loaded
      } else {
        setErrorMessage(result.error || 'Failed to sign in. Please try again.');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Continue your police fitness and test preparation journey
            </Text>
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
            
            {/* Helpful Info Message */}
            <ErrorMessage 
              message="If you're having trouble signing in, make sure you've confirmed your email address after registration." 
              type="info" 
              visible={true}
              style={styles.infoMessage}
            />

            <View style={styles.inputContainer}>
              <Mail size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
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
                value={password}
                onChangeText={setPassword}
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

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setStayLoggedIn(!stayLoggedIn)}
            >
              <View style={[styles.checkbox, stayLoggedIn && styles.checkboxChecked]}>
                {stayLoggedIn && <Check size={16} color={Colors.white} />}
              </View>
              <Text style={styles.checkboxText}>Stay logged in</Text>
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleSignIn}
              loading={isLoading}
              style={styles.signInButton}
            />
            

            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={() => setShowResetPasswordModal(true)}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.resendConfirmation}
              onPress={async () => {
                if (!email) {
                  setErrorMessage('Please enter your email address first.');
                  return;
                }
                const result = await resendConfirmationEmail(email);
                if (result.success) {
                  setSuccessMessage('Confirmation email sent! Please check your inbox.');
                } else {
                  setErrorMessage(result.error || 'Failed to send confirmation email.');
                }
              }}
            >
              <Text style={styles.resendConfirmationText}>Resend Confirmation Email</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don&apos;t have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/sign-up')}>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Reset Password Modal */}
      <ResetPasswordModal
        visible={showResetPasswordModal}
        onClose={() => setShowResetPasswordModal(false)}
        onBackToSignIn={() => setShowResetPasswordModal(false)}
      />
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
    justifyContent: 'center',
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    backgroundColor: Colors.primary + '08',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: Colors.primary + '20',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: Colors.policeRedBorder,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxText: {
    fontSize: 16,
    color: Colors.text,
  },
  signInButton: {
    marginTop: 8,
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: Colors.primary,
  },
  resendConfirmation: {
    alignItems: 'center',
    marginTop: 8,
  },
  resendConfirmationText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
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
  signUpLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  infoMessage: {
    marginBottom: 16,
  },
});