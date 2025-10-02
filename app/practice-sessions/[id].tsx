import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import {
  MapPin,
  Clock,
  Users,
  DollarSign,
  Calendar,
  User,
  Shield,
  CheckCircle,
  XCircle,
  ArrowLeft,
  BookOpen,
  Clock as ClockIcon,
  AlertTriangle,
  Star,
  Info,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { usePracticeSessions } from '@/context/PracticeSessionsContext';
import { useAuth } from '@/context/AuthContext';
import EnhancedWaiverModal, { EnhancedWaiverData } from '@/components/EnhancedWaiverModal';
import ApplePayCheckout, { PaymentData } from '@/components/ApplePayCheckout';
import StripeProvider from '@/components/StripeProvider';
import { RobustBookingService, WaiverData, RobustPaymentData } from '@/lib/robustBookingService';
import { ErrorAlert } from '@/components/ErrorAlert';

const { width, height } = Dimensions.get('window');

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const {
    getSessionById,
    isUserBooked,
    isUserWaitlisted,
    isUserPendingApproval,
    canBookSession,
    joinWaitlist,
    leaveWaitlist,
    getSessionAvailability,
    loadBookings,
  } = usePracticeSessions();

  const [session, setSession] = useState(getSessionById(id));
  const [availability, setAvailability] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showWaiver, setShowWaiver] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [waiverData, setWaiverData] = useState<EnhancedWaiverData | null>(null);
  useEffect(() => {
    if (id) {
      loadSessionData();
    }
  }, [id]);

  const loadSessionData = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const sessionData = getSessionById(id);
      if (sessionData) {
        setSession(sessionData);
        const availabilityData = await getSessionAvailability(id);
        setAvailability(availabilityData);
      }
    } catch (error) {
      console.error('Error loading session data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format price
  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  // Format time
  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Handle booking
  const handleBooking = async () => {
    if (!user) {
      ErrorAlert.show('AUTHENTICATION_REQUIRED: Please sign in to book this session.', 
        () => router.push('/auth/sign-in'));
      return;
    }

    // Monetization disabled: allow booking without subscription gating

    setShowWaiver(true);
  };

  // Handle waiver submission
  const handleWaiverSubmit = async (waiverData: EnhancedWaiverData) => {
    // Convert EnhancedWaiverData to WaiverData format
    const robustWaiverData: WaiverData = {
      full_name: waiverData.full_name,
      date_of_birth: waiverData.date_of_birth,
      phone: waiverData.phone,
      email: waiverData.email,
      address: waiverData.address,
      city: waiverData.city,
      province: waiverData.province,
      emergency_contact_name: waiverData.emergency_contact_name,
      emergency_contact_phone: waiverData.emergency_contact_phone,
      emergency_contact_relationship: waiverData.emergency_contact_relationship,
      medical_conditions: waiverData.medical_conditions,
      medications: waiverData.medications,
      allergies: waiverData.allergies,
      medically_fit: waiverData.medically_fit,
      understand_risks: waiverData.understand_risks,
      release_liability: waiverData.release_liability,
      consent_emergency_care: waiverData.consent_emergency_care,
      agree_policies: waiverData.agree_policies,
      signature_data: waiverData.signature_data,
      typed_legal_name: waiverData.typed_legal_name,
      signature_timestamp: waiverData.signature_timestamp,
      waiver_version: waiverData.waiver_version
    };
    
    setWaiverData(waiverData);
    setShowWaiver(false);
    setShowPayment(true);
  };

  // Handle payment success
  const handlePaymentSuccess = async (paymentData: PaymentData) => {
    if (!waiverData || !session) return;
    
    setBookingLoading(true);
    try {
      // Convert EnhancedWaiverData to WaiverData format
      const robustWaiverData: WaiverData = {
        full_name: waiverData.full_name,
        date_of_birth: waiverData.date_of_birth,
        phone: waiverData.phone,
        email: waiverData.email,
        address: waiverData.address,
        city: waiverData.city,
        province: waiverData.province,
        emergency_contact_name: waiverData.emergency_contact_name,
        emergency_contact_phone: waiverData.emergency_contact_phone,
        emergency_contact_relationship: waiverData.emergency_contact_relationship,
        medical_conditions: waiverData.medical_conditions,
        medications: waiverData.medications,
        allergies: waiverData.allergies,
        medically_fit: waiverData.medically_fit,
        understand_risks: waiverData.understand_risks,
        release_liability: waiverData.release_liability,
        consent_emergency_care: waiverData.consent_emergency_care,
        agree_policies: waiverData.agree_policies,
        signature_data: waiverData.signature_data,
        typed_legal_name: waiverData.typed_legal_name,
        signature_timestamp: waiverData.signature_timestamp,
        waiver_version: waiverData.waiver_version
      };

      // Use the new robust booking service
      const result = await RobustBookingService.completeBooking(
        id,
        robustWaiverData,
        {
          paymentMethod: paymentData.paymentMethod,
          paymentIntentId: paymentData.paymentIntentId,

        } as RobustPaymentData
      );

      if (result.success) {
        Alert.alert(
          'Booking Submitted!',
          result.message || 'Your practice session booking has been submitted for admin approval. You will receive a notification once it has been reviewed.',
          [
            {
              text: 'View My Sessions',
              onPress: () => router.push('/practice-sessions'),
            },
            { text: 'OK' },
          ]
        );
        setShowPayment(false);
        setWaiverData(null);
        loadSessionData(); // Refresh session data
        await loadBookings(); // Refresh bookings in context
      } else {
        throw new Error(result.error || 'Booking failed');
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      ErrorAlert.show(error, 
        () => {
          // Retry booking
          setShowPayment(true);
        },
        () => {
          setShowPayment(false);
          setWaiverData(null);
        }
      );
    } finally {
      setBookingLoading(false);
    }
  };

  // Handle payment error
  const handlePaymentError = (error: string) => {
    ErrorAlert.showPaymentError(error, 
      () => {
        // Retry payment
        setShowPayment(true);
      },
      () => {
        setShowPayment(false);
        setWaiverData(null);
      }
    );
  };

  // Handle waitlist
  const handleWaitlist = async () => {
    if (!user) {
      ErrorAlert.show('AUTHENTICATION_REQUIRED: Please sign in to join the waitlist.', 
        () => router.push('/auth/sign-in'));
      return;
    }

    if (isWaitlisted) {
      const result = await leaveWaitlist(id);
      if (result.success) {
        ErrorAlert.showSuccess('Removed from Waitlist', 'You have been removed from the waitlist.');
        loadSessionData();
      } else {
        ErrorAlert.show(result.error || 'Failed to remove from waitlist');
      }
    } else {
      const result = await joinWaitlist(id);
      if (result.success) {
        ErrorAlert.showSuccess('Added to Waitlist', 'You have been added to the waitlist. You will be notified if a spot becomes available.');
        loadSessionData();
      } else {
        ErrorAlert.show(result.error || 'Failed to join waitlist');
      }
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Session Details' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading session details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Session Not Found' }} />
        <View style={styles.errorContainer}>
          <XCircle size={64} color={Colors.error} />
          <Text style={styles.errorTitle}>Session Not Found</Text>
          <Text style={styles.errorText}>
            The session you're looking for doesn't exist or has been removed.
          </Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => router.back()}
          >
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isBooked = isUserBooked(id);
  const isPendingApproval = isUserPendingApproval(id);
  const isWaitlisted = isUserWaitlisted(id);
  const canBook = availability?.available_spots > 0;

  // Debug logging
  console.log('isBooked:', isBooked);
  console.log('isPendingApproval:', isPendingApproval);
  // Use the actual booking status from the context
  const actualIsBooked = isBooked || isPendingApproval;
  
  console.log('actualIsBooked:', actualIsBooked);
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Session Details',
          headerShown: false,
        }} 
      />

      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Session Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Session Header */}
        <LinearGradient
          colors={session.test_type === 'prep' ? ['#667eea', '#764ba2'] : ['#ff6b6b', '#ee5a24']}
          style={styles.sessionHeader}
        >
          <View style={styles.sessionType}>
            <Text style={styles.sessionTypeText}>
              {session.test_type.toUpperCase()} TEST
            </Text>
          </View>
          
          <Text style={styles.sessionTitle}>{session.title}</Text>
          
          <View style={styles.sessionStatus}>
            {isBooked && (
              <View style={styles.statusBadge}>
                <CheckCircle size={16} color="#ffffff" />
                <Text style={styles.statusText}>Booked</Text>
              </View>
            )}
            {isPendingApproval && (
              <View style={[styles.statusBadge, { backgroundColor: '#f59e0b' }]}>
                <ClockIcon size={16} color="#ffffff" />
                <Text style={styles.statusText}>Pending Approval</Text>
              </View>
            )}
            {isWaitlisted && (
              <View style={[styles.statusBadge, { backgroundColor: '#3b82f6' }]}>
                <ClockIcon size={16} color="#ffffff" />
                <Text style={styles.statusText}>Waitlisted</Text>
              </View>
            )}
            {!actualIsBooked && !isWaitlisted && !canBook && (
              <View style={[styles.statusBadge, { backgroundColor: '#ef4444' }]}>
                <AlertTriangle size={16} color="#ffffff" />
                <Text style={styles.statusText}>Full</Text>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Quick Info Cards */}
        <View style={styles.quickInfoContainer}>
          <View style={styles.quickInfoCard}>
            <Calendar size={20} color={Colors.primary} />
            <Text style={styles.quickInfoLabel}>Date</Text>
            <Text style={styles.quickInfoValue}>{formatDate(session.session_date)}</Text>
          </View>
          
          <View style={styles.quickInfoCard}>
            <Clock size={20} color={Colors.primary} />
            <Text style={styles.quickInfoLabel}>Time</Text>
            <Text style={styles.quickInfoValue}>
              {formatTime(session.start_time)} - {formatTime(session.end_time)}
            </Text>
          </View>
          
          <View style={styles.quickInfoCard}>
            <DollarSign size={20} color={Colors.primary} />
            <Text style={styles.quickInfoLabel}>Price</Text>
            <Text style={styles.quickInfoValue}>{formatPrice(session.price_cents)}</Text>
          </View>
          
          <View style={styles.quickInfoCard}>
            <Users size={20} color={Colors.primary} />
            <Text style={styles.quickInfoLabel}>Spots</Text>
            <Text style={styles.quickInfoValue}>
              {availability?.available_spots || 0} of {session.capacity}
            </Text>
          </View>
        </View>

        {/* Location Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MapPin size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>Location</Text>
          </View>
          <Text style={styles.locationName}>{session.location?.name}</Text>
          <Text style={styles.locationAddress}>
            {session.location?.address}, {session.location?.city}, {session.location?.province}
          </Text>
        </View>

        {/* Instructor Card */}
        {session.instructor && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <User size={20} color={Colors.primary} />
              <Text style={styles.cardTitle}>Instructor</Text>
            </View>
            <View style={styles.instructorInfo}>
              <Text style={styles.instructorName}>{session.instructor.full_name}</Text>
              {session.instructor.rating && session.instructor.rating > 0 && (
                <View style={styles.ratingContainer}>
                  <Star size={16} color="#fbbf24" fill="#fbbf24" />
                  <Text style={styles.ratingText}>{session.instructor.rating?.toFixed(1)}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Description Card */}
        {session.description && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Info size={20} color={Colors.primary} />
              <Text style={styles.cardTitle}>About This Session</Text>
            </View>
            <Text style={styles.descriptionText}>{session.description}</Text>
          </View>
        )}

        {/* Requirements Card */}
        {session.requirements && session.requirements.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>What to Bring</Text>
            {session.requirements.map((requirement: string, index: number) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.listDot} />
                <Text style={styles.listText}>{requirement}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Equipment Card */}
        {session.equipment_provided && session.equipment_provided.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Equipment Provided</Text>
            {session.equipment_provided.map((equipment: string, index: number) => (
              <View key={index} style={styles.listItem}>
                <View style={[styles.listDot, { backgroundColor: Colors.success }]} />
                <Text style={styles.listText}>{equipment}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Fixed Action Button */}
      <View style={styles.fixedActionContainer}>
        {isBooked ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelBookingButton]}
            onPress={() => {
              Alert.alert(
                'Cancel Booking',
                'Are you sure you want to cancel this booking? This action cannot be undone.',
                [
                  { text: 'Keep Booking', style: 'cancel' },
                  {
                    text: 'Cancel Booking',
                    style: 'destructive',
                    onPress: () => {
                      // Handle booking cancellation
                      Alert.alert('Booking Cancelled', 'Your booking has been cancelled successfully.');
                    },
                  },
                ]
              );
            }}
          >
            <XCircle size={20} color={Colors.white} />
            <Text style={styles.actionButtonText}>Cancel Booking</Text>
          </TouchableOpacity>
        ) : isPendingApproval ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.contactSupportButton]}
            onPress={() => {
              Alert.alert(
                'Contact Support',
                'Need help with your pending booking?\n\nEmail: support@fit4duty.com\nPhone: (555) 123-4567',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Copy Email', onPress: () => Alert.alert('Email copied to clipboard') },
                ]
              );
            }}
          >
            <Shield size={20} color={Colors.white} />
            <Text style={styles.actionButtonText}>Contact Support</Text>
          </TouchableOpacity>
        ) : canBook ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.bookButton]}
            onPress={handleBooking}
            disabled={bookingLoading}
          >
            {bookingLoading ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <BookOpen size={20} color={Colors.white} />
            )}
            <Text style={styles.actionButtonText}>
              {bookingLoading ? 'Processing...' : 'Book Session'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, isWaitlisted ? styles.leaveWaitlistButton : styles.joinWaitlistButton]}
            onPress={handleWaitlist}
          >
            <ClockIcon size={20} color={Colors.white} />
            <Text style={styles.actionButtonText}>
              {isWaitlisted ? 'Leave Waitlist' : 'Join Waitlist'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Enhanced Waiver Modal */}
      <EnhancedWaiverModal
        visible={showWaiver}
        onClose={() => setShowWaiver(false)}
        onSubmit={handleWaiverSubmit}
        loading={bookingLoading}
        sessionTitle={session?.title || 'Practice Session'}
        sessionPrice={session?.price_cents || 0}
      />

      {/* Apple Pay Checkout (Stripe provider is only mounted on this screen when needed) */}
      <StripeProvider>
        <ApplePayCheckout
          visible={showPayment}
          onClose={() => {
            setShowPayment(false);
            setWaiverData(null);
          }}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
          sessionTitle={session?.title || 'Practice Session'}
          sessionPrice={session?.price_cents || 0}
          sessionDate={session?.session_date || ''}
          sessionTime={session?.start_time || ''}
          sessionLocation={session?.location?.name || ''}
          loading={bookingLoading}
        />
      </StripeProvider>
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.policeRedBorder,
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
  scrollContent: {
    paddingBottom: 100, // Space for fixed action button
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Session Header
  sessionHeader: {
    padding: 24,
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 32,
  },
  sessionType: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  sessionTypeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  sessionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 34,
  },
  sessionStatus: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.policeRedBorder,
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  
  // Quick Info Cards
  quickInfoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginTop: -20,
    marginBottom: 16,
  },
  quickInfoCard: {
    width: (width - 48) / 2,
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.policeRedBorder,
    marginBottom: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  quickInfoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 8,
    marginBottom: 4,
  },
  quickInfoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 18,
  },
  
  // Cards
  card: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.policeRedBorder,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  instructorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  instructorName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  descriptionText: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  listDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.policeRed,
    marginTop: 8,
    marginRight: 12,
  },
  listText: {
    fontSize: 16,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 22,
  },
  
  // Fixed Action Button
  fixedActionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: Colors.policeRedBorder,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  bookButton: {
    backgroundColor: Colors.primary,
  },
  cancelBookingButton: {
    backgroundColor: Colors.error,
  },
  contactSupportButton: {
    backgroundColor: Colors.primary,
  },
  joinWaitlistButton: {
    backgroundColor: '#f59e0b',
  },
  leaveWaitlistButton: {
    backgroundColor: Colors.error,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  bottomSpacer: {
    height: 20,
  },
});
