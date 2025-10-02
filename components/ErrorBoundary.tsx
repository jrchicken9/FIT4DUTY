import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { router } from 'expo-router';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Generate a unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (__DEV__) {
      console.error('ErrorBoundary: Error caught:', error);
      console.error('ErrorBoundary caught an error:', error, errorInfo);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // In production, you might want to send this to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });
  };

  handleGoHome = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });
    router.replace('/(tabs)/dashboard');
  };

  handleReportError = () => {
    const { error, errorInfo, errorId } = this.state;
    
    if (!error) return;

    const errorReport = {
      id: errorId,
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      componentStack: errorInfo?.componentStack,
      userAgent: 'React Native App',
      version: '1.0.0', // Replace with actual app version
    };

    // In a real app, you would send this to your error reporting service
    console.log('Error Report:', JSON.stringify(errorReport, null, 2));
    
    Alert.alert(
      'Error Reported',
      `Error ID: ${errorId}\n\nThis error has been logged for investigation.`,
      [{ text: 'OK' }]
    );
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Error Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <AlertTriangle size={48} color={Colors.error} />
              </View>
              <Text style={styles.title}>Oops! Something went wrong</Text>
              <Text style={styles.subtitle}>
                We're sorry, but something unexpected happened. Don't worry, your data is safe.
              </Text>
            </View>

            {/* Error Details (Development Only) */}
            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorDetailsTitle}>Error Details (Development)</Text>
                <Text style={styles.errorMessage}>
                  {this.state.error.name}: {this.state.error.message}
                </Text>
                {this.state.error.stack && (
                  <Text style={styles.errorStack}>
                    {this.state.error.stack}
                  </Text>
                )}
                {this.state.errorInfo?.componentStack && (
                  <Text style={styles.componentStack}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </View>
            )}

            {/* Error ID */}
            <View style={styles.errorIdContainer}>
              <Text style={styles.errorIdLabel}>Error ID:</Text>
              <Text style={styles.errorId}>{this.state.errorId}</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={this.handleRetry}
                activeOpacity={0.8}
              >
                <RefreshCw size={20} color={Colors.white} />
                <Text style={styles.primaryButtonText}>Try Again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={this.handleGoHome}
                activeOpacity={0.8}
              >
                <Home size={20} color={Colors.primary} />
                <Text style={styles.secondaryButtonText}>Go Home</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.reportButton]}
                onPress={this.handleReportError}
                activeOpacity={0.8}
              >
                <Bug size={20} color={Colors.warning} />
                <Text style={styles.reportButtonText}>Report Error</Text>
              </TouchableOpacity>
            </View>

            {/* Help Text */}
            <View style={styles.helpContainer}>
              <Text style={styles.helpTitle}>Need Help?</Text>
              <Text style={styles.helpText}>
                If this problem persists, please contact our support team with the Error ID above.
              </Text>
            </View>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.error + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.headingLarge,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorDetails: {
    backgroundColor: Colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.level2,
  },
  errorDetailsTitle: {
    ...typography.headingSmall,
    color: Colors.error,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    ...typography.bodySmall,
    color: Colors.text,
    fontFamily: 'monospace',
    marginBottom: spacing.sm,
  },
  errorStack: {
    ...typography.bodySmall,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
    fontSize: 10,
    lineHeight: 14,
  },
  componentStack: {
    ...typography.bodySmall,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
    fontSize: 10,
    lineHeight: 14,
    marginTop: spacing.sm,
  },
  errorIdContainer: {
    backgroundColor: Colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  errorIdLabel: {
    ...typography.labelSmall,
    color: Colors.textSecondary,
    marginBottom: spacing.xs,
  },
  errorId: {
    ...typography.bodySmall,
    color: Colors.text,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  actions: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    ...shadows.level2,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  primaryButtonText: {
    ...typography.labelLarge,
    color: Colors.white,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  secondaryButtonText: {
    ...typography.labelLarge,
    color: Colors.primary,
    fontWeight: '600',
  },
  reportButton: {
    backgroundColor: Colors.warning + '15',
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  reportButtonText: {
    ...typography.labelLarge,
    color: Colors.warning,
    fontWeight: '600',
  },
  helpContainer: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.level2,
  },
  helpTitle: {
    ...typography.headingSmall,
    color: Colors.text,
    marginBottom: spacing.sm,
  },
  helpText: {
    ...typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default ErrorBoundary;