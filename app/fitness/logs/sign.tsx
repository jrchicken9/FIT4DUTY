import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import {
  ArrowLeft,
  PenTool,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Save,
  Download,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { fitnessLogService } from '@/lib/fitnessLogService';
import { cancelFitnessLogNotifications } from '@/lib/notificationHelpers';
import type { FitnessLog, FitnessLogProgress } from '@/types/fitness-log';
import Button from '@/components/Button';
import ProfessionalBackground from '@/components/ProfessionalBackground';

const { width: screenWidth } = Dimensions.get('window');

interface SignaturePoint {
  x: number;
  y: number;
}

export default function SignFitnessLogScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [activeLog, setActiveLog] = useState<FitnessLog | null>(null);
  const [progress, setProgress] = useState<FitnessLogProgress | null>(null);
  
  // Signature state
  const [signature, setSignature] = useState<SignaturePoint[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signedName, setSignedName] = useState('');
  const [attestationChecked, setAttestationChecked] = useState(false);
  
  // Signature canvas dimensions
  const signatureHeight = 150;

  const loadLogData = async () => {
    try {
      setLoading(true);
      
      const log = await fitnessLogService.getActiveLog();
      if (!log) {
        Alert.alert('Error', 'No active fitness log found');
        router.back();
        return;
      }

      setActiveLog(log);
      
      const logProgress = await fitnessLogService.getLogProgress(log.id);
      setProgress(logProgress);
      
      if (!logProgress?.isComplete) {
        Alert.alert(
          'Incomplete Log',
          'All 14 days must be completed before you can sign the log.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
        return;
      }
    } catch (error) {
      console.error('Error loading log data:', error);
      Alert.alert('Error', 'Failed to load fitness log data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleTouchStart = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    setIsDrawing(true);
    setSignature([{ x: locationX, y: locationY }]);
  };

  const handleTouchMove = (event: any) => {
    if (!isDrawing) return;
    
    const { locationX, locationY } = event.nativeEvent;
    setSignature(prev => [...prev, { x: locationX, y: locationY }]);
  };

  const handleTouchEnd = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    setSignature([]);
  };

  const generateSignaturePath = () => {
    if (signature.length < 2) return '';
    
    let path = `M${signature[0].x},${signature[0].y}`;
    
    for (let i = 1; i < signature.length; i++) {
      path += ` L${signature[i].x},${signature[i].y}`;
    }
    
    return path;
  };

  const convertSignatureToBase64 = async (): Promise<string | null> => {
    if (signature.length < 2) return null;
    
    try {
      // In a real implementation, you would use a library like react-native-signature-canvas
      // or react-native-svg-to-png to convert the SVG signature to base64
      // For now, we'll return a placeholder
      return 'data:image/svg+xml;base64,' + btoa(`
        <svg width="${screenWidth - 40}" height="150" xmlns="http://www.w3.org/2000/svg">
          <path d="${generateSignaturePath()}" stroke="#000" stroke-width="2" fill="none"/>
        </svg>
      `);
    } catch (error) {
      console.error('Error converting signature to base64:', error);
      return null;
    }
  };

  const handleSignLog = async () => {
    if (!signedName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }
    
    if (!attestationChecked) {
      Alert.alert('Error', 'Please confirm the attestation statement');
      return;
    }
    
    if (signature.length < 2) {
      Alert.alert('Error', 'Please provide your signature');
      return;
    }
    
    try {
      setSigning(true);
      
      const signatureBlob = await convertSignatureToBase64();
      
      if (!activeLog) {
        Alert.alert('Error', 'No active log found');
        return;
      }
      
      await fitnessLogService.signLog(activeLog.id, signedName.trim(), signatureBlob);
      
      // Cancel notifications since log is complete
      try {
        await cancelFitnessLogNotifications(activeLog.id);
      } catch (error) {
        console.warn('Failed to cancel notifications:', error);
      }
      
      Alert.alert(
        'Log Signed Successfully!',
        'Your fitness log has been signed and completed. You can now export the final PDF.',
        [
          {
            text: 'View Summary',
            onPress: () => router.replace('/fitness/logs/summary')
          }
        ]
      );
    } catch (error) {
      console.error('Error signing log:', error);
      Alert.alert('Error', 'Failed to sign the log. Please try again.');
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ProfessionalBackground variant="fitness">
          <View />
        </ProfessionalBackground>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading signature screen...</Text>
        </View>
      </View>
    );
  }

  if (!activeLog || !progress) {
    return (
      <View style={styles.container}>
        <ProfessionalBackground variant="fitness">
          <View />
        </ProfessionalBackground>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load log data</Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            variant="primary"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProfessionalBackground variant="fitness">
        <View />
      </ProfessionalBackground>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Sign Fitness Log</Text>
            <Text style={styles.headerSubtitle}>Complete your 14-day log</Text>
          </View>
        </View>

        {/* Log Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>Ready to Sign</Text>
              <View style={styles.completeBadge}>
                <CheckCircle2 size={16} color={Colors.success} />
                <Text style={styles.completeBadgeText}>All Days Complete</Text>
              </View>
            </View>
            
            <View style={styles.summaryContent}>
              <Text style={styles.summaryText}>
                <Text style={styles.summaryBold}>Log Period:</Text> {formatDate(progress.startDate)} - {formatDate(progress.endDate)}
              </Text>
              <Text style={styles.summaryText}>
                <Text style={styles.summaryBold}>Days Completed:</Text> {progress.completedDays}/{progress.totalDays}
              </Text>
              <Text style={styles.summaryText}>
                <Text style={styles.summaryBold}>Status:</Text> Ready for signature
              </Text>
            </View>
          </View>
        </View>

        {/* Attestation Statement */}
        <View style={styles.attestationSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Attestation Statement</Text>
          </View>
          
          <View style={styles.attestationCard}>
            <Text style={styles.attestationText}>
              I certify that the information provided in this 14-day fitness log is true and accurate to the best of my knowledge. 
              I understand that providing false information may result in disqualification from the application process. 
              This log represents my actual physical activity, stress management practices, and sleep patterns during the 
              specified period from {formatDate(progress.startDate)} to {formatDate(progress.endDate)}.
            </Text>
            
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setAttestationChecked(!attestationChecked)}
            >
              <View style={[
                styles.checkbox,
                attestationChecked && styles.checkboxChecked
              ]}>
                {attestationChecked && (
                  <CheckCircle2 size={16} color={Colors.white} />
                )}
              </View>
              <Text style={styles.checkboxLabel}>
                I have read and agree to the attestation statement above
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Electronic Signature</Text>
          </View>
          
          <View style={styles.signatureCard}>
            {/* Signature Canvas */}
            <View style={styles.signatureCanvas}>
              <View
                style={styles.signatureArea}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {signature.length > 0 && (
                  <Svg width={screenWidth - 40} height={150}>
                    <Path
                      d={generateSignaturePath()}
                      stroke={Colors.text}
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                )}
                
                {signature.length === 0 && (
                  <View style={styles.signaturePlaceholder}>
                    <PenTool size={32} color={Colors.textSecondary} />
                    <Text style={styles.signaturePlaceholderText}>
                      Sign above with your finger or stylus
                    </Text>
                  </View>
                )}
              </View>
              
              <TouchableOpacity
                style={styles.clearSignatureButton}
                onPress={clearSignature}
              >
                <Trash2 size={16} color={Colors.error} />
                <Text style={styles.clearSignatureText}>Clear</Text>
              </TouchableOpacity>
            </View>
            
            {/* Name Input */}
            <View style={styles.nameInputContainer}>
              <Text style={styles.nameInputLabel}>Full Name (as it appears on official documents)</Text>
              <TextInput
                style={styles.nameInput}
                value={signedName}
                onChangeText={setSignedName}
                placeholder="Enter your full name"
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>
          </View>
        </View>

        {/* Important Notice */}
        <View style={styles.noticeSection}>
          <View style={styles.noticeCard}>
            <AlertTriangle size={24} color={Colors.warning} />
            <View style={styles.noticeContent}>
              <Text style={styles.noticeTitle}>Important Notice</Text>
              <Text style={styles.noticeText}>
                Once you sign this log, it cannot be edited or modified. 
                Please review all entries carefully before signing.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <View style={styles.actionButtons}>
          <Button
            title="Cancel"
            onPress={() => router.back()}
            variant="outline"
            style={styles.actionButton}
          />
          
          <Button
            title="Sign & Complete Log"
            onPress={handleSignLog}
            variant="gradient"
            loading={signing}
            disabled={signing || !signedName.trim() || !attestationChecked || signature.length < 2}
            icon={<CheckCircle2 size={16} color={Colors.white} />}
            iconPosition="left"
            style={styles.actionButton}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 120,
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.bodyLarge,
    color: Colors.textSecondary,
  },
  
  // Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 20,
  },
  errorText: {
    ...typography.bodyLarge,
    color: Colors.error,
    textAlign: 'center',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  
  // Summary Section
  summarySection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.xl,
    padding: 20,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    gap: 6,
  },
  completeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.success,
  },
  summaryContent: {
    gap: 8,
  },
  summaryText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  summaryBold: {
    fontWeight: '600',
    color: Colors.text,
  },
  
  // Section Headers
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  
  // Attestation Section
  attestationSection: {
    marginBottom: 24,
  },
  attestationCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    borderRadius: borderRadius.xl,
    padding: 20,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  attestationText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    fontWeight: '500',
  },
  
  // Signature Section
  signatureSection: {
    marginBottom: 24,
  },
  signatureCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    borderRadius: borderRadius.xl,
    padding: 20,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  signatureCanvas: {
    marginBottom: 20,
  },
  signatureArea: {
    width: screenWidth - 40,
    height: 150,
    backgroundColor: Colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  signaturePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  signaturePlaceholderText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  clearSignatureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 6,
  },
  clearSignatureText: {
    fontSize: 14,
    color: Colors.error,
    fontWeight: '500',
  },
  nameInputContainer: {
    gap: 8,
  },
  nameInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  nameInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: borderRadius.md,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
  },
  
  // Notice Section
  noticeSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  noticeCard: {
    flexDirection: 'row',
    backgroundColor: Colors.warning + '10',
    borderRadius: borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.warning + '30',
    gap: 12,
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.warning,
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  
  // Action Section
  actionSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});
