import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, CheckCircle, FileText } from 'lucide-react-native';
import { format } from 'date-fns';

import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { fitnessLogService } from '@/lib/fitnessLogService';
import { FitnessLog } from '@/types/fitness-log';

export default function SignFitnessLogScreen() {
  const { logId } = useLocalSearchParams<{ logId: string }>();
  const [log, setLog] = useState<FitnessLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [signedName, setSignedName] = useState('');
  const [agreementChecked, setAgreementChecked] = useState(false);

  useEffect(() => {
    if (logId) {
      loadLog();
    }
  }, [logId]);

  const loadLog = async () => {
    if (!logId) return;
    
    setLoading(true);
    try {
      const logData = await fitnessLogService.getLog(logId);
      setLog(logData);
      if (logData?.signed_name) {
        setSignedName(logData.signed_name);
      }
    } catch (error) {
      console.error('Error loading log:', error);
      Alert.alert('Error', 'Failed to load fitness log.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignLog = async () => {
    if (!log || !logId) return;

    if (!signedName.trim()) {
      Alert.alert('Missing Information', 'Please enter your full name.');
      return;
    }

    if (!agreementChecked) {
      Alert.alert('Agreement Required', 'Please check the certification agreement.');
      return;
    }

    setSigning(true);
    try {
      // For now, we'll use a placeholder signature
      // In a real implementation, you'd use a signature capture component
      const signatureBlob = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      await fitnessLogService.signLog(logId, signedName.trim(), signatureBlob);

      Alert.alert(
        'Success!',
        'Your fitness log has been signed and completed. You can now generate the official PDF.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)/fitness')
          }
        ]
      );
    } catch (error) {
      console.error('Error signing log:', error);
      Alert.alert('Error', 'Failed to sign fitness log. Please try again.');
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!log) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Fitness log not found</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
        <LinearGradient
        colors={['#3B82F6', '#1E40AF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sign & Complete</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Log Summary */}
          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>Log Summary</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Start Date</Text>
                <Text style={styles.summaryValue}>{format(new Date(log.start_date), 'MMM dd, yyyy')}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>End Date</Text>
                <Text style={styles.summaryValue}>{format(new Date(log.end_date), 'MMM dd, yyyy')}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Status</Text>
                <Text style={styles.summaryValue}>Ready for Signature</Text>
              </View>
            </View>
          </View>

          {/* Signature Section */}
          <View style={styles.signatureSection}>
            <Text style={styles.sectionTitle}>Digital Signature</Text>
            <View style={styles.signatureCard}>
              <View style={styles.signaturePlaceholder}>
                <FileText size={48} color={Colors.white + '60'} />
                <Text style={styles.signaturePlaceholderText}>
                  Digital signature will be captured here
                </Text>
                <Text style={styles.signatureNote}>
                  (Signature capture component would be implemented here)
                </Text>
              </View>
            </View>
          </View>

          {/* Name Input */}
          <View style={styles.nameSection}>
            <Text style={styles.sectionTitle}>Printed Name</Text>
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.nameInput}
                value={signedName}
                onChangeText={setSignedName}
                placeholder="Enter your full name as it appears on official documents"
                placeholderTextColor={Colors.white + '60'}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Agreement */}
          <View style={styles.agreementSection}>
            <Text style={styles.sectionTitle}>Certification</Text>
            <View style={styles.agreementCard}>
              <TouchableOpacity 
                style={styles.checkboxContainer}
                onPress={() => setAgreementChecked(!agreementChecked)}
              >
                <View style={[styles.checkbox, agreementChecked && styles.checkboxChecked]}>
                  {agreementChecked && <CheckCircle size={16} color={Colors.white} />}
                </View>
                <Text style={styles.agreementText}>
                  I certify that the information provided in this 14-day fitness log is true and accurate to the best of my knowledge. I understand that providing false information may result in disqualification from the OACP application process.
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Important Notes */}
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Important Notes</Text>
            <View style={styles.notesCard}>
              <View style={styles.noteItem}>
                <CheckCircle size={16} color={Colors.white} />
                <Text style={styles.noteText}>
                  Once signed, this log cannot be modified
                </Text>
              </View>
              <View style={styles.noteItem}>
                <CheckCircle size={16} color={Colors.white} />
                <Text style={styles.noteText}>
                  You can generate the official PDF after signing
                </Text>
              </View>
              <View style={styles.noteItem}>
                <CheckCircle size={16} color={Colors.white} />
                <Text style={styles.noteText}>
                  Keep a copy of the PDF for your records
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Action Button */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={[styles.signButton, (!signedName.trim() || !agreementChecked || signing) && styles.signButtonDisabled]}
            onPress={handleSignLog}
            disabled={!signedName.trim() || !agreementChecked || signing}
          >
            <LinearGradient
              colors={(!signedName.trim() || !agreementChecked || signing) ? ['#9CA3AF', '#6B7280'] : ['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.signButtonGradient}
            >
              <Text style={styles.signButtonText}>
                {signing ? 'Signing...' : 'Sign & Complete Log'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.bodyLarge,
    color: Colors.white,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  errorText: {
    ...typography.headingMedium,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingTop: 60, // Increased to account for status bar since we removed the navigation header
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.headingMedium,
    color: Colors.white,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    ...typography.headingSmall,
    color: Colors.white,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  summarySection: {
    marginBottom: spacing.xl,
  },
  summaryCard: {
    backgroundColor: Colors.white + '15',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: Colors.white + '20',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    ...typography.bodyMedium,
    color: Colors.white + 'CC',
  },
  summaryValue: {
    ...typography.bodyMedium,
    color: Colors.white,
    fontWeight: '600',
  },
  signatureSection: {
    marginBottom: spacing.xl,
  },
  signatureCard: {
    backgroundColor: Colors.white + '15',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: Colors.white + '20',
  },
  signaturePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  signaturePlaceholderText: {
    ...typography.bodyMedium,
    color: Colors.white + 'CC',
    marginTop: spacing.md,
    textAlign: 'center',
  },
  signatureNote: {
    ...typography.bodySmall,
    color: Colors.white + '80',
    marginTop: spacing.sm,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  nameSection: {
    marginBottom: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  nameInput: {
    backgroundColor: Colors.white + '15',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: Colors.white + '20',
    ...typography.bodyMedium,
    color: Colors.white,
  },
  agreementSection: {
    marginBottom: spacing.xl,
  },
  agreementCard: {
    backgroundColor: Colors.white + '15',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: Colors.white + '20',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.white + '60',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  agreementText: {
    ...typography.bodySmall,
    color: Colors.white + 'CC',
    lineHeight: 20,
    flex: 1,
  },
  notesSection: {
    marginBottom: spacing.xl,
  },
  notesCard: {
    backgroundColor: Colors.white + '15',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: Colors.white + '20',
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  noteText: {
    ...typography.bodySmall,
    color: Colors.white + 'CC',
    flex: 1,
    lineHeight: 20,
  },
  actionSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  signButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.large,
  },
  signButtonDisabled: {
    opacity: 0.7,
  },
  signButtonGradient: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signButtonText: {
    ...typography.labelLarge,
    color: Colors.white,
    fontWeight: '700',
  },
});