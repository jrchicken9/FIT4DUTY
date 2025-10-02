import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  MapPin,
  Shield,
  CreditCard,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import Colors from '@/constants/colors';
import { WaiverService } from '@/lib/waiverService';

interface Attendee {
  booking_id: string;
  booking_status: string;
  payment_status: string;
  payment_method: string;
  transaction_id: string;
  receipt_url: string;
  booking_created: string;
  user_email: string;
  user_full_name: string;
  user_phone: string;
  waiver_id: string;
  waiver_full_name: string;
  signature_timestamp: string;
  waiver_version: string;
  signature_file_path: string;
  waiver_pdf_path: string;
}

export default function SessionAttendeesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (id) {
      loadSessionAttendees();
    }
  }, [id]);

  const loadSessionAttendees = async () => {
    setLoading(true);
    try {
      // Get session info
      const { data: sessionData, error: sessionError } = await supabase
        .from('practice_sessions')
        .select(`
          *,
          location:locations(*)
        `)
        .eq('id', id)
        .single();

      if (sessionError) throw sessionError;
      setSessionInfo(sessionData);

      // Get attendees
      const { data: attendeesData, error: attendeesError } = await supabase
        .from('session_attendees')
        .select('*')
        .eq('session_id', id)
        .order('booking_created', { ascending: true });

      if (attendeesError) throw attendeesError;
      setAttendees(attendeesData || []);
    } catch (error) {
      console.error('Error loading session attendees:', error);
      Alert.alert('Error', 'Failed to load session attendees');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSessionAttendees();
    setRefreshing(false);
  };

  const handleViewWaiver = async (attendee: Attendee) => {
    if (!attendee.waiver_pdf_path) {
      Alert.alert('No Waiver', 'Waiver PDF not available');
      return;
    }

    try {
      const waiverUrl = await WaiverService.getWaiverPDFUrl(attendee.waiver_pdf_path);
      await Linking.openURL(waiverUrl);
    } catch (error) {
      console.error('Error opening waiver:', error);
      Alert.alert('Error', 'Failed to open waiver PDF');
    }
  };

  const handleViewReceipt = async (attendee: Attendee) => {
    if (!attendee.receipt_url) {
      Alert.alert('No Receipt', 'Receipt not available');
      return;
    }

    try {
      await Linking.openURL(attendee.receipt_url);
    } catch (error) {
      console.error('Error opening receipt:', error);
      Alert.alert('Error', 'Failed to open receipt');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
        return Colors.success;
      case 'pending':
        return '#f59e0b';
      case 'failed':
        return Colors.error;
      default:
        return Colors.textSecondary;
    }
  };

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return Colors.success;
      case 'pending':
        return '#f59e0b';
      case 'cancelled':
        return Colors.error;
      default:
        return Colors.textSecondary;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Session Attendees' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading attendees...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Session Attendees',
          headerShown: false,
        }} 
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Session Attendees</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Session Info */}
        {sessionInfo && (
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionTitle}>{sessionInfo.title}</Text>
            <View style={styles.sessionDetails}>
              <View style={styles.sessionDetail}>
                <Calendar size={16} color={Colors.textSecondary} />
                <Text style={styles.sessionDetailText}>
                  {formatDate(sessionInfo.session_date)}
                </Text>
              </View>
              <View style={styles.sessionDetail}>
                <Clock size={16} color={Colors.textSecondary} />
                <Text style={styles.sessionDetailText}>
                  {formatTime(sessionInfo.start_time)} - {formatTime(sessionInfo.end_time)}
                </Text>
              </View>
              <View style={styles.sessionDetail}>
                <MapPin size={16} color={Colors.textSecondary} />
                <Text style={styles.sessionDetailText}>
                  {sessionInfo.location?.name}
                </Text>
              </View>
            </View>
            <View style={styles.attendeeCount}>
              <Users size={16} color={Colors.primary} />
              <Text style={styles.attendeeCountText}>
                {attendees.length} Attendee{attendees.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        )}

        {/* Attendees List */}
        <View style={styles.attendeesContainer}>
          {attendees.length === 0 ? (
            <View style={styles.emptyState}>
              <Users size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyStateTitle}>No Attendees</Text>
              <Text style={styles.emptyStateText}>
                No one has booked this session yet.
              </Text>
            </View>
          ) : (
            attendees.map((attendee, index) => (
              <View key={attendee.booking_id} style={styles.attendeeCard}>
                {/* Attendee Header */}
                <View style={styles.attendeeHeader}>
                  <View style={styles.attendeeInfo}>
                    <Text style={styles.attendeeName}>
                      {attendee.user_full_name || attendee.waiver_full_name || 'Unknown'}
                    </Text>
                    <Text style={styles.attendeeEmail}>{attendee.user_email}</Text>
                  </View>
                  <View style={styles.statusContainer}>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: getBookingStatusColor(attendee.booking_status) }
                    ]}>
                      <Text style={styles.statusText}>
                        {attendee.booking_status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Contact Info */}
                <View style={styles.contactInfo}>
                  <View style={styles.contactItem}>
                    <Phone size={14} color={Colors.textSecondary} />
                    <Text style={styles.contactText}>{attendee.user_phone || 'Not provided'}</Text>
                  </View>
                  <View style={styles.contactItem}>
                    <Calendar size={14} color={Colors.textSecondary} />
                    <Text style={styles.contactText}>
                      Booked: {formatDate(attendee.booking_created)}
                    </Text>
                  </View>
                </View>

                {/* Payment Info */}
                <View style={styles.paymentInfo}>
                  <View style={styles.paymentHeader}>
                    <CreditCard size={16} color={Colors.primary} />
                    <Text style={styles.paymentTitle}>Payment</Text>
                  </View>
                  <View style={styles.paymentDetails}>
                    <View style={styles.paymentRow}>
                      <Text style={styles.paymentLabel}>Status:</Text>
                      <View style={[
                        styles.paymentStatus,
                        { backgroundColor: getPaymentStatusColor(attendee.payment_status) }
                      ]}>
                        <Text style={styles.paymentStatusText}>
                          {attendee.payment_status.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    {attendee.payment_method && (
                      <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Method:</Text>
                        <Text style={styles.paymentValue}>
                          {attendee.payment_method === 'apple_pay' ? 'Apple Pay' : 'Card'}
                        </Text>
                      </View>
                    )}
                    {attendee.transaction_id && (
                      <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Transaction:</Text>
                        <Text style={styles.paymentValue} numberOfLines={1}>
                          {attendee.transaction_id}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Waiver Info */}
                <View style={styles.waiverInfo}>
                  <View style={styles.waiverHeader}>
                    <Shield size={16} color={Colors.primary} />
                    <Text style={styles.waiverTitle}>Waiver</Text>
                  </View>
                  <View style={styles.waiverDetails}>
                    <View style={styles.waiverRow}>
                      <Text style={styles.waiverLabel}>Signed:</Text>
                      <Text style={styles.waiverValue}>
                        {formatDate(attendee.signature_timestamp)}
                      </Text>
                    </View>
                    <View style={styles.waiverRow}>
                      <Text style={styles.waiverLabel}>Version:</Text>
                      <Text style={styles.waiverValue}>{attendee.waiver_version}</Text>
                    </View>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.waiverButton]}
                    onPress={() => handleViewWaiver(attendee)}
                  >
                    <FileText size={16} color={Colors.white} />
                    <Text style={styles.actionButtonText}>View Waiver</Text>
                  </TouchableOpacity>
                  
                  {attendee.receipt_url && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.receiptButton]}
                      onPress={() => handleViewReceipt(attendee)}
                    >
                      <Download size={16} color={Colors.white} />
                      <Text style={styles.actionButtonText}>Receipt</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  sessionInfo: {
    backgroundColor: Colors.white,
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sessionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  sessionDetails: {
    marginBottom: 16,
  },
  sessionDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  sessionDetailText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  attendeeCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  attendeeCountText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  attendeesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  attendeeCard: {
    backgroundColor: Colors.white,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  attendeeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  attendeeInfo: {
    flex: 1,
  },
  attendeeName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  attendeeEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statusContainer: {
    marginLeft: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  contactInfo: {
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  paymentInfo: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  paymentDetails: {
    gap: 6,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    flex: 1,
    textAlign: 'right',
  },
  paymentStatus: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  waiverInfo: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
  },
  waiverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  waiverTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  waiverDetails: {
    gap: 6,
  },
  waiverRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  waiverLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  waiverValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  waiverButton: {
    backgroundColor: Colors.primary,
  },
  receiptButton: {
    backgroundColor: Colors.success,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
});
