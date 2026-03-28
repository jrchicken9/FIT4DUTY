import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import AdminHeader from '@/components/AdminHeader';
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  Shield,
  AlertTriangle,
  Eye,
  MoreVertical,
  ChevronRight,
  ChevronLeft,
  Star,
  Award,
  Clock as ClockIcon,
  DollarSign,
  FileText,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { emitBadgeEvent } from '@/lib/badgeEvents';

type BookingStatus = 'pending' | 'approved' | 'confirmed' | 'rejected' | 'cancelled';

type Booking = {
  booking_id: string;
  user_id: string;
  session_id: string;
  booking_status: BookingStatus;
  amount_cents: number;
  payment_status: string;
  payment_method?: string;
  transaction_id?: string;
  created_at: string;
  updated_at: string;
  admin_reviewed_by?: string;
  admin_reviewed_at?: string;
  admin_notes?: string;
  rejection_reason?: string;
  waiver_signed: boolean;
  waiver_signed_name?: string;
  waiver_signed_at?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  emergency_relationship?: string;
  medical_conditions?: string;
  medications?: string;
  allergies?: string;
  heart_condition?: boolean;
  chest_pain?: boolean;
  dizziness?: boolean;
  bone_joint_problems?: boolean;
  high_blood_pressure?: boolean;
  diabetes?: boolean;
  asthma?: boolean;
  pregnancy?: boolean;
  other_medical_issues?: string;
  // Joined data
  user_email?: string;
  user_full_name?: string;
  user_phone?: string;
  session_title?: string;
  session_date?: string;
  start_time?: string;
  end_time?: string;
  test_type?: string;
  location_name?: string;
  location_address?: string;
  admin_reviewer_name?: string;
};

type FilterStatus = 'all' | 'pending' | 'approved' | 'confirmed' | 'rejected';

export default function BookingApprovalsScreen() {
  const { user, isAdmin } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    if (!user || !isAdmin()) {
      router.replace('/');
      return;
    }
    loadBookings();
  }, [user, isAdmin]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('admin_pending_bookings')
        .select('*')
        .order('booking_created', { ascending: false });

      if (error) {
        console.error('Error loading bookings:', error);
        Alert.alert('Error', 'Failed to load bookings');
        return;
      }

      setBookings(data || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
      Alert.alert('Error', 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.user_full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.session_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.location_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.booking_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle size={16} color={Colors.success} />;
      case 'approved':
        return <CheckCircle size={16} color={Colors.warning} />;
      case 'pending':
        return <Clock size={16} color={Colors.primary} />;
      case 'rejected':
        return <XCircle size={16} color={Colors.error} />;
      case 'cancelled':
        return <XCircle size={16} color={Colors.textSecondary} />;
      default:
        return <Clock size={16} color={Colors.textSecondary} />;
    }
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return Colors.success;
      case 'approved':
        return Colors.warning;
      case 'pending':
        return Colors.primary;
      case 'rejected':
        return Colors.error;
      case 'cancelled':
        return Colors.textSecondary;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusText = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'approved':
        return 'Approved';
      case 'pending':
        return 'Pending';
      case 'rejected':
        return 'Rejected';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const handleApproveBooking = async () => {
    if (!selectedBooking) return;

    try {
      setProcessingAction(true);
      
      const { error } = await supabase.rpc('approve_booking', {
        booking_uuid: selectedBooking.booking_id,
        admin_uuid: user?.id,
        admin_notes_param: approvalNotes || null,
      });

      if (error) {
        console.error('Error approving booking:', error);
        Alert.alert('Error', 'Failed to approve booking');
        return;
      }

      Alert.alert('Success', 'Booking approved successfully');
      setShowApprovalModal(false);
      setSelectedBooking(null);
      setApprovalNotes('');
      await loadBookings();
    } catch (error) {
      console.error('Error approving booking:', error);
      Alert.alert('Error', 'Failed to approve booking');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRejectBooking = async () => {
    if (!selectedBooking || !rejectionReason.trim()) {
      Alert.alert('Error', 'Please provide a rejection reason');
      return;
    }

    try {
      setProcessingAction(true);
      
      const { error } = await supabase.rpc('reject_booking', {
        booking_uuid: selectedBooking.booking_id,
        admin_uuid: user?.id,
        rejection_reason_param: rejectionReason,
        admin_notes_param: approvalNotes || null,
      });

      if (error) {
        console.error('Error rejecting booking:', error);
        Alert.alert('Error', 'Failed to reject booking');
        return;
      }

      Alert.alert('Success', 'Booking rejected successfully');
      setShowApprovalModal(false);
      setSelectedBooking(null);
      setRejectionReason('');
      setApprovalNotes('');
      await loadBookings();
    } catch (error) {
      console.error('Error rejecting booking:', error);
      Alert.alert('Error', 'Failed to reject booking');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleConfirmBooking = async (booking: Booking) => {
    Alert.alert(
      'Confirm Booking',
      'Are you sure you want to confirm this booking? This will notify the user.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              setProcessingAction(true);
              
              const { error } = await supabase.rpc('confirm_booking', {
                booking_uuid: booking.booking_id,
                admin_uuid: user?.id,
              });

              if (error) {
                console.error('Error confirming booking:', error);
                Alert.alert('Error', 'Failed to confirm booking');
                return;
              }

              Alert.alert('Success', 'Booking confirmed successfully');
              // Emit booking.confirmed event for badge engine
              try {
                await emitBadgeEvent('booking.confirmed', { booking_id: booking.booking_id, session_id: booking.session_id });
              } catch {}
              await loadBookings();
            } catch (error) {
              console.error('Error confirming booking:', error);
              Alert.alert('Error', 'Failed to confirm booking');
            } finally {
              setProcessingAction(false);
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const formatDateSafe = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStats = () => {
    const total = bookings.length;
    const pending = bookings.filter(b => b.booking_status === 'pending').length;
    const approved = bookings.filter(b => b.booking_status === 'approved').length;
    const confirmed = bookings.filter(b => b.booking_status === 'confirmed').length;
    const rejected = bookings.filter(b => b.booking_status === 'rejected').length;

    return { total, pending, approved, confirmed, rejected };
  };

  const stats = getStats();

  if (!isAdmin()) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Booking Approvals' }} />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Access Denied</Text>
          <Text style={styles.errorSubtext}>You don't have permission to view this page.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <AdminHeader title="Booking Approvals" backTo="/admin/dashboard" />

      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: Colors.primary }]}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: Colors.warning }]}>{stats.approved}</Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: Colors.success }]}>{stats.confirmed}</Text>
          <Text style={styles.statLabel}>Confirmed</Text>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, email, or session..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.textSecondary}
          />
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { value: 'all', label: 'All', icon: Eye },
              { value: 'pending', label: 'Pending', icon: Clock },
              { value: 'approved', label: 'Approved', icon: CheckCircle },
              { value: 'confirmed', label: 'Confirmed', icon: Award },
              { value: 'rejected', label: 'Rejected', icon: XCircle },
            ].map((filter) => {
              const Icon = filter.icon;
              return (
                <TouchableOpacity
                  key={filter.value}
                  style={[
                    styles.filterChip,
                    statusFilter === filter.value && styles.activeFilterChip,
                  ]}
                  onPress={() => setStatusFilter(filter.value as FilterStatus)}
                >
                  <Icon size={16} color={statusFilter === filter.value ? Colors.white : Colors.textSecondary} />
                  <Text style={[
                    styles.filterChipText,
                    statusFilter === filter.value && styles.activeFilterChipText,
                  ]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading bookings...</Text>
          </View>
        ) : filteredBookings.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.noResultsText}>No bookings found</Text>
            <Text style={styles.noResultsSubtext}>
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'All bookings have been processed'}
            </Text>
          </View>
        ) : (
          filteredBookings.map((booking) => (
            <TouchableOpacity
              key={booking.booking_id}
              style={styles.bookingCard}
              onPress={() => {
                setSelectedBooking(booking);
                setShowBookingDetails(true);
              }}
            >
              <View style={styles.bookingHeader}>
                <View style={styles.bookingInfo}>
                  <Text style={styles.bookingTitle}>{booking.session_title}</Text>
                                     <Text style={styles.bookingDate}>
                     {formatDateSafe(booking.session_date)} • {booking.start_time || 'N/A'}
                   </Text>
                  <Text style={styles.bookingLocation}>{booking.location_name}</Text>
                </View>
                <View style={styles.bookingStatus}>
                  {getStatusIcon(booking.booking_status)}
                  <Text style={[
                    styles.bookingStatusText,
                    { color: getStatusColor(booking.booking_status) }
                  ]}>
                    {getStatusText(booking.booking_status)}
                  </Text>
                </View>
              </View>

              <View style={styles.bookingDetails}>
                <View style={styles.bookingDetailRow}>
                  <User size={16} color={Colors.textSecondary} />
                  <Text style={styles.bookingDetailText}>{booking.user_full_name}</Text>
                </View>
                <View style={styles.bookingDetailRow}>
                  <Mail size={16} color={Colors.textSecondary} />
                  <Text style={styles.bookingDetailText}>{booking.user_email}</Text>
                </View>
                <View style={styles.bookingDetailRow}>
                  <DollarSign size={16} color={Colors.textSecondary} />
                  <Text style={styles.bookingDetailText}>{formatCurrency(booking.amount_cents)}</Text>
                </View>
                <View style={styles.bookingDetailRow}>
                  <Shield size={16} color={Colors.textSecondary} />
                  <Text style={styles.bookingDetailText}>
                    {booking.waiver_signed ? 'Waiver Signed' : 'No Waiver'}
                  </Text>
                </View>
              </View>

              {booking.booking_status === 'pending' && (
                <View style={styles.bookingActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={() => {
                      setSelectedBooking(booking);
                      setShowApprovalModal(true);
                    }}
                  >
                    <CheckCircle size={16} color={Colors.white} />
                    <Text style={styles.actionButtonText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => {
                      setSelectedBooking(booking);
                      setShowApprovalModal(true);
                    }}
                  >
                    <XCircle size={16} color={Colors.white} />
                    <Text style={styles.actionButtonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}

              {booking.booking_status === 'approved' && (
                <View style={styles.bookingActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.confirmButton]}
                    onPress={() => handleConfirmBooking(booking)}
                  >
                    <Award size={16} color={Colors.white} />
                    <Text style={styles.actionButtonText}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity style={styles.viewDetailsButton}>
                <Text style={styles.viewDetailsText}>View Details</Text>
                <ChevronRight size={16} color={Colors.primary} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Booking Details Modal */}
      <Modal
        visible={showBookingDetails}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowBookingDetails(false)}>
              <XCircle size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Booking Details</Text>
            <View style={{ width: 24 }} />
          </View>
          
          {selectedBooking && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Session Information</Text>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Session</Text>
                  <Text style={styles.detailValue}>{selectedBooking.session_title}</Text>
                </View>
                                 <View style={styles.detailItem}>
                   <Text style={styles.detailLabel}>Date & Time</Text>
                   <Text style={styles.detailValue}>
                     {formatDateSafe(selectedBooking.session_date)} • {selectedBooking.start_time || 'N/A'} - {selectedBooking.end_time || 'N/A'}
                   </Text>
                 </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Location</Text>
                  <Text style={styles.detailValue}>{selectedBooking.location_name}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Test Type</Text>
                  <Text style={styles.detailValue}>{selectedBooking.test_type}</Text>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>User Information</Text>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Name</Text>
                  <Text style={styles.detailValue}>{selectedBooking.user_full_name}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Email</Text>
                  <Text style={styles.detailValue}>{selectedBooking.user_email}</Text>
                </View>
                {selectedBooking.user_phone && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Phone</Text>
                    <Text style={styles.detailValue}>{selectedBooking.user_phone}</Text>
                  </View>
                )}
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Payment Information</Text>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Amount</Text>
                  <Text style={styles.detailValue}>{formatCurrency(selectedBooking.amount_cents)}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Payment Status</Text>
                  <Text style={styles.detailValue}>{selectedBooking.payment_status}</Text>
                </View>
                {selectedBooking.payment_method && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Payment Method</Text>
                    <Text style={styles.detailValue}>{selectedBooking.payment_method}</Text>
                  </View>
                )}
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Waiver Information</Text>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Waiver Signed</Text>
                  <Text style={styles.detailValue}>
                    {selectedBooking.waiver_signed ? 'Yes' : 'No'}
                  </Text>
                </View>
                {selectedBooking.waiver_signed && (
                  <>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Signed By</Text>
                      <Text style={styles.detailValue}>{selectedBooking.waiver_signed_name}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Signed At</Text>
                      <Text style={styles.detailValue}>
                        {selectedBooking.waiver_signed_at ? formatDate(selectedBooking.waiver_signed_at) : 'N/A'}
                      </Text>
                    </View>
                  </>
                )}
              </View>

              {selectedBooking.emergency_contact && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Emergency Contact</Text>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Contact</Text>
                    <Text style={styles.detailValue}>{selectedBooking.emergency_contact}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Phone</Text>
                    <Text style={styles.detailValue}>{selectedBooking.emergency_phone}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Relationship</Text>
                    <Text style={styles.detailValue}>{selectedBooking.emergency_relationship}</Text>
                  </View>
                </View>
              )}

              {(selectedBooking.medical_conditions || selectedBooking.medications || selectedBooking.allergies) && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Medical Information</Text>
                  {selectedBooking.medical_conditions && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Medical Conditions</Text>
                      <Text style={styles.detailValue}>{selectedBooking.medical_conditions}</Text>
                    </View>
                  )}
                  {selectedBooking.medications && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Medications</Text>
                      <Text style={styles.detailValue}>{selectedBooking.medications}</Text>
                    </View>
                  )}
                  {selectedBooking.allergies && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Allergies</Text>
                      <Text style={styles.detailValue}>{selectedBooking.allergies}</Text>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Approval/Rejection Modal */}
      <Modal
        visible={showApprovalModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowApprovalModal(false)}>
              <XCircle size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Review Booking</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalSubtitle}>
              {selectedBooking?.session_title} • {selectedBooking?.user_full_name}
            </Text>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalActionButton, styles.approveButton]}
                onPress={handleApproveBooking}
                disabled={processingAction}
              >
                <CheckCircle size={20} color={Colors.white} />
                <Text style={styles.modalActionButtonText}>Approve Booking</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalActionButton, styles.rejectButton]}
                onPress={handleRejectBooking}
                disabled={processingAction}
              >
                <XCircle size={20} color={Colors.white} />
                <Text style={styles.modalActionButtonText}>Reject Booking</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Rejection Reason (Required for rejection)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter reason for rejection..."
                value={rejectionReason}
                onChangeText={setRejectionReason}
                multiline
                numberOfLines={3}
                placeholderTextColor={Colors.textSecondary}
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Admin Notes (Optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Add any additional notes..."
                value={approvalNotes}
                onChangeText={setApprovalNotes}
                multiline
                numberOfLines={3}
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {},
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.error,
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: Colors.text,
  },
  filterButton: {
    padding: 8,
  },
  filtersContainer: {
    backgroundColor: Colors.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.gray[100],
    marginRight: 8,
    gap: 4,
  },
  activeFilterChip: {
    backgroundColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  activeFilterChipText: {
    color: Colors.white,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  bookingCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookingInfo: {
    flex: 1,
    marginRight: 12,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  bookingDate: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  bookingLocation: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  bookingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bookingStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bookingDetails: {
    marginBottom: 12,
  },
  bookingDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  bookingDetailText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  bookingActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
  approveButton: {
    backgroundColor: Colors.success,
  },
  rejectButton: {
    backgroundColor: Colors.error,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  modalActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  modalActionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    textAlignVertical: 'top',
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.text,
    flex: 2,
    textAlign: 'right',
  },
});
