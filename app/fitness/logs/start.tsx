import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  Calendar,
  Clock,
  CheckCircle2,
  ArrowLeft,
  AlertTriangle,
  Bell,
  BellOff,
  Info,
  Target,
  Dumbbell,
  Footprints,
  Brain,
  BedDouble,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { fitnessLogService } from '@/lib/fitnessLogService';
import { scheduleFitnessLogNotifications, requestNotificationPermissions } from '@/lib/notificationHelpers';
import Button from '@/components/Button';
import ProfessionalBackground from '@/components/ProfessionalBackground';

export default function StartFitnessLogScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    checkNotificationPermissions();
  }, []);

  const checkNotificationPermissions = async () => {
    const hasPermission = await requestNotificationPermissions();
    setNotificationsEnabled(hasPermission);
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
    }
  };

  const calculateEndDate = (startDate: Date): Date => {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 13);
    return endDate;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleStartLog = async () => {
    try {
      setLoading(true);

      // Check if user can start a new log
      const canStart = await fitnessLogService.canStartNewLog();
      if (!canStart) {
        Alert.alert(
          'Active Log Exists',
          'You already have an active fitness log. Please complete or cancel it before starting a new one.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Validate date (cannot be more than 30 days in the past)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      if (selectedDate < thirtyDaysAgo) {
        Alert.alert(
          'Invalid Date',
          'Start date cannot be more than 30 days in the past.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Create the log
      const startDateString = selectedDate.toISOString().slice(0, 10);
      const log = await fitnessLogService.createLog(startDateString);

      // Schedule notifications if enabled
      if (notificationsEnabled) {
        try {
          await scheduleFitnessLogNotifications(startDateString, log.id);
        } catch (error) {
          console.warn('Failed to schedule notifications:', error);
          // Don't fail the log creation if notifications fail
        }
      }

      Alert.alert(
        'Log Created Successfully!',
        `Your 14-day fitness log has been created. You'll receive daily reminders to complete your entries.`,
        [
          {
            text: 'Start Logging',
            onPress: () => {
              // Navigate to today's entry
              const today = new Date().toISOString().slice(0, 10);
              const startDate = new Date(log.start_date);
              const currentDate = new Date(today);
              const daysDiff = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
              const currentDay = Math.max(1, Math.min(14, daysDiff + 1));
              
              // Calculate the date for the current day
              const targetDate = new Date(startDate);
              targetDate.setDate(startDate.getDate() + (currentDay - 1));
              
              router.replace(`/fitness/logs/day/${targetDate.toISOString().slice(0, 10)}`);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error creating fitness log:', error);
      Alert.alert(
        'Error',
        'Failed to create fitness log. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const endDate = calculateEndDate(selectedDate);
  const today = new Date();
  const isToday = selectedDate.toDateString() === today.toDateString();
  const isPast = selectedDate < today;

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
            <Text style={styles.headerTitle}>Start 14-Day Log</Text>
            <Text style={styles.headerSubtitle}>
              Begin your OACP fitness tracking journey
            </Text>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Date Selection Card */}
          <View style={styles.dateCard}>
            <View style={styles.cardHeader}>
              <Calendar size={24} color={Colors.primary} />
              <Text style={styles.cardTitle}>Select Start Date</Text>
            </View>
            
            <View style={styles.dateSection}>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <View style={styles.dateButtonContent}>
                  <View style={styles.dateInfo}>
                    <Text style={styles.dateLabel}>Start Date</Text>
                    <Text style={styles.dateValue}>{formatDate(selectedDate)}</Text>
                  </View>
                  <Calendar size={20} color={Colors.primary} />
                </View>
              </TouchableOpacity>
              
              <View style={styles.dateInfo}>
                <Text style={styles.dateLabel}>End Date</Text>
                <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
              </View>
            </View>
            
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                maximumDate={new Date()}
                minimumDate={new Date(2020, 0, 1)}
              />
            )}
            
            {/* Date Status */}
            <View style={styles.dateStatus}>
              {isToday ? (
                <View style={styles.statusBadge}>
                  <Clock size={16} color={Colors.warning} />
                  <Text style={styles.statusText}>Starting Today</Text>
                </View>
              ) : isPast ? (
                <View style={styles.statusBadge}>
                  <AlertTriangle size={16} color={Colors.warning} />
                  <Text style={styles.statusText}>Past Date Selected</Text>
                </View>
              ) : (
                <View style={styles.statusBadge}>
                  <CheckCircle2 size={16} color={Colors.success} />
                  <Text style={styles.statusText}>Future Start Date</Text>
                </View>
              )}
            </View>
          </View>

          {/* Notifications Card */}
          <View style={styles.notificationsCard}>
            <View style={styles.cardHeader}>
              {notificationsEnabled ? (
                <Bell size={24} color={Colors.success} />
              ) : (
                <BellOff size={24} color={Colors.textSecondary} />
              )}
              <Text style={styles.cardTitle}>Daily Reminders</Text>
            </View>
            
            <View style={styles.notificationsContent}>
              <Text style={styles.notificationsDescription}>
                Get daily notifications at 8:00 PM to remind you to complete your fitness log entry.
              </Text>
              
              <View style={styles.notificationsStatus}>
                <Text style={[
                  styles.notificationsStatusText,
                  notificationsEnabled ? styles.notificationsEnabled : styles.notificationsDisabled
                ]}>
                  {notificationsEnabled ? 'Notifications Enabled' : 'Notifications Disabled'}
                </Text>
              </View>
              
              {!notificationsEnabled && (
                <TouchableOpacity
                  style={styles.enableNotificationsButton}
                  onPress={checkNotificationPermissions}
                >
                  <Bell size={16} color={Colors.white} />
                  <Text style={styles.enableNotificationsText}>Enable Notifications</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* What You'll Track Card */}
          <View style={styles.trackingCard}>
            <View style={styles.cardHeader}>
              <Target size={24} color={Colors.primary} />
              <Text style={styles.cardTitle}>What You'll Track</Text>
            </View>
            
            <View style={styles.trackingItems}>
              <View style={styles.trackingItem}>
                <Footprints size={20} color={Colors.success} />
                <View style={styles.trackingItemContent}>
                  <Text style={styles.trackingItemTitle}>Running & Cardio</Text>
                  <Text style={styles.trackingItemDescription}>
                    Duration, distance, and location
                  </Text>
                </View>
              </View>
              
              <View style={styles.trackingItem}>
                <Dumbbell size={20} color={Colors.success} />
                <View style={styles.trackingItemContent}>
                  <Text style={styles.trackingItemTitle}>Strength Training</Text>
                  <Text style={styles.trackingItemDescription}>
                    Duration, environment, split, and exercises
                  </Text>
                </View>
              </View>
              
              <View style={styles.trackingItem}>
                <Brain size={20} color={Colors.success} />
                <View style={styles.trackingItemContent}>
                  <Text style={styles.trackingItemTitle}>Stress Management</Text>
                  <Text style={styles.trackingItemDescription}>
                    Daily stress relief methods (required)
                  </Text>
                </View>
              </View>
              
              <View style={styles.trackingItem}>
                <BedDouble size={20} color={Colors.success} />
                <View style={styles.trackingItemContent}>
                  <Text style={styles.trackingItemTitle}>Sleep Tracking</Text>
                  <Text style={styles.trackingItemDescription}>
                    Hours of sleep per night (required)
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Important Information */}
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <Info size={24} color={Colors.warning} />
              <Text style={styles.cardTitle}>Important Information</Text>
            </View>
            
            <View style={styles.infoContent}>
              <Text style={styles.infoText}>
                • Each day requires stress management and sleep hours to be marked complete
              </Text>
              <Text style={styles.infoText}>
                • You can save partial entries as drafts and complete them later
              </Text>
              <Text style={styles.infoText}>
                • All 14 days must be completed before you can sign and export
              </Text>
              <Text style={styles.infoText}>
                • Once signed, the log cannot be edited
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <Button
            title="Start 14-Day Log"
            onPress={handleStartLog}
            variant="gradient"
            fullWidth
            loading={loading}
            disabled={loading}
            icon={<CheckCircle2 size={16} color={Colors.white} />}
            iconPosition="left"
          />
          
          <Button
            title="Cancel"
            onPress={() => router.back()}
            variant="outline"
            fullWidth
            style={styles.cancelButton}
          />
        </View>
      </ScrollView>
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
    paddingBottom: 100,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    ...shadows.level2,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.8,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  
  // Main Content
  mainContent: {
    paddingHorizontal: 20,
    gap: 20,
  },
  
  // Cards
  dateCard: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.xl,
    padding: 20,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  notificationsCard: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.xl,
    padding: 20,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  trackingCard: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.xl,
    padding: 20,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.xl,
    padding: 20,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: Colors.warning + '20',
  },
  
  // Card Header
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  
  // Date Section
  dateSection: {
    gap: 16,
  },
  dateButton: {
    backgroundColor: Colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  dateInfo: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  dateValue: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
  },
  dateStatus: {
    marginTop: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  
  // Notifications
  notificationsContent: {
    gap: 12,
  },
  notificationsDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  notificationsStatus: {
    marginVertical: 8,
  },
  notificationsStatusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  notificationsEnabled: {
    color: Colors.success,
  },
  notificationsDisabled: {
    color: Colors.textSecondary,
  },
  enableNotificationsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    alignSelf: 'flex-start',
  },
  enableNotificationsText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  
  // Tracking Items
  trackingItems: {
    gap: 16,
  },
  trackingItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  trackingItemContent: {
    flex: 1,
  },
  trackingItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  trackingItemDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  
  // Info Content
  infoContent: {
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  
  // Action Section
  actionSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  cancelButton: {
    marginTop: 8,
  },
});
