import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import {
  Plus,
  Calendar,
  Users,
  MapPin,
  Clock,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  Filter,
  ChevronRight,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { usePracticeSessions } from '@/context/PracticeSessionsContext';
import { useAuth } from '@/context/AuthContext';
import type { TestType, SessionStatus } from '@/types/practice-sessions';

export default function AdminPracticeSessionsScreen() {
  const { user, isAdmin } = useAuth();
  const {
    sessions,
    bookings,
    loading,
    loadSessions,
    loadBookings,
    deleteSession,
  } = usePracticeSessions();

  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<SessionStatus | 'all'>('all');
  const [testTypeFilter, setTestTypeFilter] = useState<TestType | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (user && isAdmin()) {
      loadSessions();
      loadBookings();
    }
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadSessions(),
      loadBookings(),
    ]);
    setRefreshing(false);
  };

  const handleDeleteSession = async (sessionId: string, sessionTitle: string) => {
    Alert.alert(
      'Delete Session',
      `Are you sure you want to delete "${sessionTitle}"? This action cannot be undone and will cancel all existing bookings.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteSession(sessionId);
            if (result.success) {
              Alert.alert('Session Deleted', 'The session has been deleted successfully.');
            } else {
              Alert.alert('Error', result.error || 'Failed to delete session.');
            }
          },
        },
      ]
    );
  };

  const handleViewBookings = (sessionId: string) => {
    router.push(`/admin/session-attendees/${sessionId}`);
  };

  const handleEditSession = (sessionId: string) => {
    router.push(`/admin/practice-sessions/create?id=${sessionId}`);
  };

  const handleCreateSession = () => {
    router.push('/admin/practice-sessions/create');
  };

  // Format price
  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Format time
  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Get status color
  const getStatusColor = (status: SessionStatus) => {
    switch (status) {
      case 'scheduled':
        return '#10b981';
      case 'cancelled':
        return '#ef4444';
      case 'completed':
        return '#6b7280';
      default:
        return Colors.textSecondary;
    }
  };

  // Filter sessions
  const filteredSessions = sessions.filter(session => {
    if (statusFilter !== 'all' && session.status !== statusFilter) return false;
    if (testTypeFilter !== 'all' && session.test_type !== testTypeFilter) return false;
    return true;
  });

  // Get booking count for a session
  const getBookingCount = (sessionId: string) => {
    return bookings.filter(booking => booking.session_id === sessionId).length;
  };

  if (!isAdmin()) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Practice Sessions Management' }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Access Denied</Text>
          <Text style={styles.errorText}>
            You don't have permission to access this page.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Practice Sessions Management',
          headerLeft: () => (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => setShowFilters(!showFilters)}
              >
                <Filter size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          ),
        }} 
      />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Filters */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            <Text style={styles.filtersTitle}>Filter Sessions</Text>
            
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Status:</Text>
              <View style={styles.filterButtons}>
                {(['all', 'scheduled', 'cancelled', 'completed'] as const).map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterButton,
                      statusFilter === status && styles.filterButtonActive,
                    ]}
                    onPress={() => setStatusFilter(status)}
                  >
                    <Text style={[
                      styles.filterButtonText,
                      statusFilter === status && styles.filterButtonTextActive,
                    ]}>
                      {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Test Type:</Text>
              <View style={styles.filterButtons}>
                {(['all', 'prep', 'pin'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.filterButton,
                      testTypeFilter === type && styles.filterButtonActive,
                    ]}
                    onPress={() => setTestTypeFilter(type)}
                  >
                    <Text style={[
                      styles.filterButtonText,
                      testTypeFilter === type && styles.filterButtonTextActive,
                    ]}>
                      {type === 'all' ? 'All' : type.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Summary Stats */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{sessions.length}</Text>
            <Text style={styles.summaryLabel}>Total Sessions</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>
              {sessions.filter(s => s.status === 'scheduled').length}
            </Text>
            <Text style={styles.summaryLabel}>Scheduled</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{bookings.length}</Text>
            <Text style={styles.summaryLabel}>Total Bookings</Text>
          </View>
        </View>

        {/* Sessions List */}
        <View style={styles.sessionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Practice Sessions</Text>
            <TouchableOpacity
              style={styles.addSessionButton}
              onPress={handleCreateSession}
            >
              <Plus size={20} color="#ffffff" />
              <Text style={styles.addSessionButtonText}>Add Session</Text>
            </TouchableOpacity>
          </View>
          
          {filteredSessions.map((session) => (
            <View key={session.id} style={styles.sessionCard}>
              <LinearGradient
                colors={session.test_type === 'prep' ? ['#667eea', '#764ba2'] : ['#ff6b6b', '#ee5a24']}
                style={styles.sessionCardGradient}
              >
                <View style={styles.sessionHeader}>
                  <View style={styles.sessionType}>
                    <Text style={styles.sessionTypeText}>
                      {session.test_type.toUpperCase()} TEST
                    </Text>
                  </View>
                  <View style={styles.sessionStatus}>
                    <Text style={[styles.sessionStatusText, { color: getStatusColor(session.status) }]}>
                      {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.sessionTitle}>{session.title}</Text>
                
                <View style={styles.sessionDetails}>
                  <View style={styles.sessionDetail}>
                    <Calendar size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.sessionDetailText}>
                      {formatDate(session.session_date)}
                    </Text>
                  </View>
                  
                  <View style={styles.sessionDetail}>
                    <Clock size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.sessionDetailText}>
                      {formatTime(session.start_time)} - {formatTime(session.end_time)}
                    </Text>
                  </View>
                  
                  <View style={styles.sessionDetail}>
                    <MapPin size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.sessionDetailText}>
                      {session.location?.name}
                    </Text>
                  </View>
                  
                  <View style={styles.sessionDetail}>
                    <Users size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.sessionDetailText}>
                      {getBookingCount(session.id)} / {session.capacity} booked
                    </Text>
                  </View>
                  
                  <View style={styles.sessionDetail}>
                    <DollarSign size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.sessionDetailText}>
                      {formatPrice(session.price_cents)}
                    </Text>
                  </View>
                </View>

                <View style={styles.sessionActions}>
                  <TouchableOpacity
                    style={styles.sessionActionButton}
                    onPress={() => handleViewBookings(session.id)}
                  >
                    <Eye size={16} color="#ffffff" />
                    <Text style={styles.sessionActionText}>View Bookings</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.sessionActionButton}
                    onPress={() => handleEditSession(session.id)}
                  >
                    <Edit size={16} color="#ffffff" />
                    <Text style={styles.sessionActionText}>Edit</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.sessionActionButton, styles.deleteButton]}
                    onPress={() => handleDeleteSession(session.id, session.title)}
                  >
                    <Trash2 size={16} color="#ffffff" />
                    <Text style={styles.sessionActionText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          ))}

          {filteredSessions.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <Calendar size={64} color={Colors.textSecondary} />
              <Text style={styles.emptyStateTitle}>No Sessions</Text>
              <Text style={styles.emptyStateText}>
                No practice sessions match your current filters.
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={handleCreateSession}
              >
                <Text style={styles.emptyStateButtonText}>Create Session</Text>
              </TouchableOpacity>
            </View>
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
  content: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  
  // Error state
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
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  
  // Filters
  filtersContainer: {
    backgroundColor: Colors.card,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filtersTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  filterRow: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  filterButtonTextActive: {
    color: Colors.white,
  },
  
  // Summary
  summaryContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  
  // Sessions
  sessionsSection: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  addSessionButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  addSessionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  sessionCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sessionCardGradient: {
    padding: 20,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sessionType: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sessionTypeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  sessionStatus: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sessionStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 16,
  },
  sessionDetails: {
    gap: 8,
    marginBottom: 16,
  },
  sessionDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sessionDetailText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  sessionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  sessionActionButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  sessionActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
  },
  
  // Empty state
  emptyState: {
    alignItems: 'center',
    padding: 32,
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
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
