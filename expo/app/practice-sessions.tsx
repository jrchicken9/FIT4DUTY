import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
  Animated,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import {
  Calendar,
  Filter,
  MapPin,
  Clock,
  Users,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Plus,
  BookOpen,
  UserCheck,
  Star,
  Target,
  Zap,
  CheckCircle,
  AlertCircle,
  X,
  Heart,
  Share2,
  Phone,
  Mail,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { usePracticeSessions } from '@/context/PracticeSessionsContext';
import { useAuth } from '@/context/AuthContext';
import type { TestType, SessionFilters, PracticeSession } from '@/types/practice-sessions';
import PoliceThemeBackground from '@/components/PoliceThemeBackground';

const { width, height } = Dimensions.get('window');

export default function PracticeSessionsScreen() {
  const { user, isAdmin } = useAuth();
  const params = useLocalSearchParams();
  const {
    sessions,
    bookings,
    loading,
    error,
    loadSessions,
    loadBookings,
    isUserBooked,
    isUserPendingApproval,
    isUserWaitlisted,
  } = usePracticeSessions();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filters, setFilters] = useState<SessionFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSession, setSelectedSession] = useState<PracticeSession | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [fadeAnim] = useState(new Animated.Value(0));

  // Handle URL parameters for filtering
  useEffect(() => {
    if (params.filter) {
      const filterType = params.filter as string;
      if (filterType === 'pin' || filterType === 'prep') {
        const newFilters = { test_type: filterType as TestType };
        setFilters(newFilters);
        loadSessions(newFilters);
      }
    }
  }, [params.filter, loadSessions]);

  // Load sessions and bookings on component mount
  useEffect(() => {
    if (user) {
      loadSessions();
      loadBookings();
    }
  }, [user, loadSessions, loadBookings]);

  // Animate fade in
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  // Calendar navigation
  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  // Generate calendar days with enhanced data
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.getTime() === today.getTime();
      const isSelected = date.toDateString() === selectedDate.toDateString();
      const isPast = date < today;
      
      // Get sessions for this date
      const daySessions: PracticeSession[] = sessions.filter((session: PracticeSession) => {
        const sessionDate = new Date(session.session_date);
        return sessionDate.toDateString() === date.toDateString();
      });

      // Calculate session types for visual indicators
      const prepSessions = daySessions.filter((s: PracticeSession) => s.test_type === 'prep').length;
      const pinSessions = daySessions.filter((s: PracticeSession) => s.test_type === 'pin').length;
      const customSessions = daySessions.filter((s: PracticeSession) => s.test_type === 'custom').length;

      days.push({
        date,
        isCurrentMonth,
        isToday,
        isSelected,
        isPast,
        sessions: daySessions,
        prepSessions,
        pinSessions,
        customSessions,
        totalSessions: daySessions.length,
      });
    }

    return days;
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

  // Get session status
  const getSessionStatus = (session: PracticeSession) => {
    if (isUserBooked(session.id)) return 'booked';
    if (isUserPendingApproval(session.id)) return 'pending';
    if (isUserWaitlisted(session.id)) return 'waitlisted';
    if (session.availability?.available_spots === 0) return 'full';
    return 'available';
  };

  // Get session status color
  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case 'booked': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'waitlisted': return '#f59e0b';
      case 'full': return '#ef4444';
      default: return '#3b82f6';
    }
  };

  // Handle session selection
  const handleSessionSelect = (session: PracticeSession) => {
    setSelectedSession(session);
    setShowSessionModal(true);
  };

  // Handle booking
  const handleBooking = (session: PracticeSession) => {
    setShowSessionModal(false);
    router.push(`/practice-sessions/${session.id}`);
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadSessions(filters),
      loadBookings(),
    ]);
    setRefreshing(false);
  };

  // Apply filters
  const applyFilters = (newFilters: SessionFilters) => {
    setFilters(newFilters);
    loadSessions(newFilters);
    setShowFilters(false);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({});
    loadSessions();
    setShowFilters(false);
  };

  const calendarDays = generateCalendarDays();
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  // Get sessions for selected date
  const selectedDateSessions = useMemo(() => {
    return sessions.filter((session: PracticeSession) => {
      const sessionDate = new Date(session.session_date);
      return sessionDate.toDateString() === selectedDate.toDateString();
    });
  }, [sessions, selectedDate]);

  // Get upcoming sessions (next 7 days)
  const upcomingSessions = useMemo(() => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    return sessions.filter((session: PracticeSession) => {
      const sessionDate = new Date(session.session_date);
      return sessionDate >= today && sessionDate <= nextWeek;
    }).slice(0, 3);
  }, [sessions]);

  return (
    <SafeAreaView style={styles.container}>
      <PoliceThemeBackground>
        <View />
      </PoliceThemeBackground>
      
      <Stack.Screen 
        options={{ 
          title: 'Practice Sessions',
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: Colors.white,
          headerTitleStyle: {
            color: Colors.white,
            fontWeight: '600',
          },
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => setViewMode(viewMode === 'calendar' ? 'list' : 'calendar')}
              >
                {viewMode === 'calendar' ? <BookOpen size={20} color={Colors.white} /> : <Calendar size={20} color={Colors.white} />}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => setShowFilters(!showFilters)}
              >
                <Filter size={20} color={Colors.white} />
              </TouchableOpacity>
              {isAdmin() && (
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={() => router.push('/admin/practice-sessions/create')}
                >
                  <Plus size={20} color={Colors.white} />
                </TouchableOpacity>
              )}
            </View>
          ),
        }} 
      />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Calendar size={20} color={Colors.primary} />
              </View>
              <Text style={styles.statNumber}>{sessions.length}</Text>
              <Text style={styles.statLabel}>Total Sessions</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <UserCheck size={20} color={Colors.success} />
              </View>
              <Text style={styles.statNumber}>{bookings.length}</Text>
              <Text style={styles.statLabel}>My Bookings</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Target size={20} color={Colors.accent} />
              </View>
              <Text style={styles.statNumber}>{upcomingSessions.length}</Text>
              <Text style={styles.statLabel}>Upcoming</Text>
            </View>
          </View>

          {/* Filters */}
          {showFilters && (
            <View style={styles.filtersContainer}>
              <View style={styles.filtersHeader}>
                <Text style={styles.filtersTitle}>Filter Sessions</Text>
                <TouchableOpacity onPress={() => setShowFilters(false)}>
                  <X size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.filterRow}>
                <Text style={styles.filterLabel}>Test Type:</Text>
                <View style={styles.filterButtons}>
                  {(['prep', 'pin', 'custom'] as TestType[]).map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.filterButton,
                        filters.test_type === type && styles.filterButtonActive,
                      ]}
                      onPress={() => applyFilters({ ...filters, test_type: filters.test_type === type ? undefined : type })}
                    >
                      <Text style={[
                        styles.filterButtonText,
                        filters.test_type === type && styles.filterButtonTextActive,
                      ]}>
                        {type.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterRow}>
                <Text style={styles.filterLabel}>Availability:</Text>
                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    filters.available_only && styles.filterButtonActive,
                  ]}
                  onPress={() => applyFilters({ ...filters, available_only: !filters.available_only })}
                >
                  <Text style={[
                    styles.filterButtonText,
                    filters.available_only && styles.filterButtonTextActive,
                  ]}>
                    Available Only
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.filterActions}>
                <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                  <Text style={styles.clearButtonText}>Clear All</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.applyButton} onPress={() => setShowFilters(false)}>
                  <Text style={styles.applyButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {viewMode === 'calendar' ? (
            <>
              {/* Single Card Calendar */}
              <View style={styles.calendarCard}>
                {/* Calendar Header */}
                <View style={styles.calendarHeader}>
                  <TouchableOpacity onPress={goToPreviousMonth} style={styles.calendarNav}>
                    <ChevronLeft size={24} color={Colors.white} />
                  </TouchableOpacity>
                  
                  <View style={styles.calendarTitleContainer}>
                    <Text style={styles.calendarTitle}>{monthName}</Text>
                    <Text style={styles.calendarSubtitle}>Practice Sessions</Text>
                  </View>
                  
                  <TouchableOpacity onPress={goToNextMonth} style={styles.calendarNav}>
                    <ChevronRight size={24} color={Colors.white} />
                  </TouchableOpacity>
                </View>

                {/* Day Headers */}
                <View style={styles.dayHeaders}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <View key={day} style={styles.dayHeaderContainer}>
                      <Text style={styles.dayHeader}>{day}</Text>
                    </View>
                  ))}
                </View>

                {/* Calendar Grid */}
                <View style={styles.daysGrid}>
                  {calendarDays.map((day, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dayCell,
                        !day.isCurrentMonth && styles.dayCellOtherMonth,
                        day.isToday && styles.dayCellToday,
                        day.isSelected && styles.dayCellSelected,
                        day.isPast && styles.dayCellPast,
                      ]}
                      onPress={() => setSelectedDate(day.date)}
                      disabled={day.isPast}
                    >
                      {/* Background gradient for selected days */}
                      {day.isSelected && (
                        <LinearGradient
                          colors={['#667eea', '#764ba2']}
                          style={styles.selectedDayGradient}
                        />
                      )}
                      
                      {/* Background gradient for today */}
                      {day.isToday && !day.isSelected && (
                        <LinearGradient
                          colors={['#3b82f6', '#1d4ed8']}
                          style={styles.todayGradient}
                        />
                      )}
                      
                      <Text style={[
                        styles.dayNumber,
                        !day.isCurrentMonth && styles.dayNumberOtherMonth,
                        day.isToday && styles.dayNumberToday,
                        day.isSelected && styles.dayNumberSelected,
                        day.isPast && styles.dayNumberPast,
                      ]}>
                        {day.date.getDate()}
                      </Text>
                      
                      {/* Enhanced session indicators */}
                      {day.totalSessions > 0 && (
                        <View style={styles.daySessions}>
                          {day.prepSessions > 0 && (
                            <LinearGradient
                              colors={['#667eea', '#764ba2']}
                              style={styles.sessionDotGradient}
                            >
                              <Text style={styles.sessionDotText}>{day.prepSessions}</Text>
                            </LinearGradient>
                          )}
                          {day.pinSessions > 0 && (
                            <LinearGradient
                              colors={['#ff6b6b', '#ee5a24']}
                              style={styles.sessionDotGradient}
                            >
                              <Text style={styles.sessionDotText}>{day.pinSessions}</Text>
                            </LinearGradient>
                          )}
                          {day.customSessions > 0 && (
                            <LinearGradient
                              colors={['#f59e0b', '#d97706']}
                              style={styles.sessionDotGradient}
                            >
                              <Text style={styles.sessionDotText}>{day.customSessions}</Text>
                            </LinearGradient>
                          )}
                          {day.totalSessions > 3 && (
                            <View style={styles.moreSessionsContainer}>
                              <Text style={styles.moreSessions}>+{day.totalSessions - 3}</Text>
                            </View>
                          )}
                        </View>
                      )}
                      
                      {/* Session count badge for days with sessions */}
                      {day.totalSessions > 0 && (
                        <View style={styles.sessionCountBadge}>
                          <Text style={styles.sessionCountText}>{day.totalSessions}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Session Type Legend */}
                <View style={styles.sessionLegend}>
                  <Text style={styles.legendTitle}>Session Types</Text>
                  <View style={styles.legendItems}>
                    <View style={styles.legendItem}>
                      <LinearGradient
                        colors={['#667eea', '#764ba2']}
                        style={styles.legendDot}
                      />
                      <Text style={styles.legendText}>PREP Test</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <LinearGradient
                        colors={['#ff6b6b', '#ee5a24']}
                        style={styles.legendDot}
                      />
                      <Text style={styles.legendText}>PIN Test</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <LinearGradient
                        colors={['#f59e0b', '#d97706']}
                        style={styles.legendDot}
                      />
                      <Text style={styles.legendText}>Custom</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Selected Date Sessions */}
              <View style={styles.sessionsSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Text>
                  <Text style={styles.sessionCount}>
                    {selectedDateSessions.length} session{selectedDateSessions.length !== 1 ? 's' : ''}
                  </Text>
                </View>

                {selectedDateSessions.length > 0 ? (
                  selectedDateSessions.map((session: PracticeSession) => {
                    const status = getSessionStatus(session);
                    const statusColor = getSessionStatusColor(status);
                    
                    return (
                      <TouchableOpacity
                        key={session.id}
                        style={styles.sessionCard}
                        onPress={() => handleSessionSelect(session)}
                      >
                        <LinearGradient
                          colors={session.test_type === 'prep' ? ['#667eea', '#764ba2'] : 
                                 session.test_type === 'pin' ? ['#ff6b6b', '#ee5a24'] : 
                                 ['#f59e0b', '#d97706']}
                          style={styles.sessionCardGradient}
                        >
                          <View style={styles.sessionHeader}>
                            <View style={styles.sessionType}>
                              <Text style={styles.sessionTypeText}>
                                {session.test_type.toUpperCase()} TEST
                              </Text>
                            </View>
                            
                            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                              <Text style={styles.statusText}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </Text>
                            </View>
                          </View>

                          <Text style={styles.sessionTitle}>{session.title}</Text>
                          
                          <View style={styles.sessionDetails}>
                            <View style={styles.sessionDetail}>
                              <MapPin size={14} color="rgba(255,255,255,0.8)" />
                              <Text style={styles.sessionDetailText}>
                                {session.location?.name}
                              </Text>
                            </View>
                            
                            <View style={styles.sessionDetail}>
                              <Clock size={14} color="rgba(255,255,255,0.8)" />
                              <Text style={styles.sessionDetailText}>
                                {formatTime(session.start_time)} - {formatTime(session.end_time)}
                              </Text>
                            </View>
                            
                            <View style={styles.sessionDetail}>
                              <Users size={14} color="rgba(255,255,255,0.8)" />
                              <Text style={styles.sessionDetailText}>
                                {session.availability?.available_spots || 0} spots available
                              </Text>
                            </View>
                            
                            <View style={styles.sessionDetail}>
                              <DollarSign size={14} color="rgba(255,255,255,0.8)" />
                              <Text style={styles.sessionDetailText}>
                                {formatPrice(session.price_cents)}
                              </Text>
                            </View>
                          </View>

                          <TouchableOpacity 
                            style={styles.sessionAction}
                            onPress={() => handleSessionSelect(session)}
                          >
                            <BookOpen size={16} color={session.test_type === 'prep' ? '#667eea' : '#ff6b6b'} />
                            <Text style={styles.sessionActionText}>
                              {status === 'booked' ? 'View Details' : 
                               status === 'pending' ? 'Pending Approval' : 
                               status === 'full' ? 'Join Waitlist' : 'Book Now'}
                            </Text>
                          </TouchableOpacity>
                        </LinearGradient>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <View style={styles.emptyState}>
                    <Calendar size={48} color={Colors.textSecondary} />
                    <Text style={styles.emptyStateTitle}>No Sessions</Text>
                    <Text style={styles.emptyStateText}>
                      No practice sessions scheduled for this date.
                    </Text>
                  </View>
                )}
              </View>
            </>
          ) : (
            /* List View */
            <View style={styles.listView}>
              <Text style={styles.sectionTitle}>All Sessions</Text>
              {sessions.map((session: PracticeSession) => {
                const status = getSessionStatus(session);
                const statusColor = getSessionStatusColor(status);
                
                return (
                  <TouchableOpacity
                    key={session.id}
                    style={styles.listSessionCard}
                    onPress={() => handleSessionSelect(session)}
                  >
                    <View style={styles.listSessionHeader}>
                      <View style={styles.listSessionType}>
                        <Text style={styles.listSessionTypeText}>
                          {session.test_type.toUpperCase()}
                        </Text>
                      </View>
                      <View style={[styles.listStatusBadge, { backgroundColor: statusColor }]}>
                        <Text style={styles.listStatusText}>{status}</Text>
                      </View>
                    </View>
                    
                    <Text style={styles.listSessionTitle}>{session.title}</Text>
                    <Text style={styles.listSessionDate}>
                      {new Date(session.session_date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })} • {formatTime(session.start_time)}
                    </Text>
                    
                    <View style={styles.listSessionFooter}>
                      <View style={styles.listSessionDetail}>
                        <MapPin size={12} color={Colors.textSecondary} />
                        <Text style={styles.listSessionDetailText}>{session.location?.name}</Text>
                      </View>
                      <Text style={styles.listSessionPrice}>{formatPrice(session.price_cents)}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.push('/practice-sessions')}
            >
              <BookOpen size={20} color={Colors.primary} />
              <Text style={styles.quickActionText}>My Bookings</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Session Detail Modal */}
      <Modal
        visible={showSessionModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSessionModal(false)}
      >
        {selectedSession && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowSessionModal(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Session Details</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.modalContent}>
              <LinearGradient
                colors={selectedSession.test_type === 'prep' ? ['#667eea', '#764ba2'] : 
                       selectedSession.test_type === 'pin' ? ['#ff6b6b', '#ee5a24'] : 
                       ['#f59e0b', '#d97706']}
                style={styles.modalSessionCard}
              >
                <View style={styles.modalSessionHeader}>
                  <Text style={styles.modalSessionType}>
                    {selectedSession.test_type.toUpperCase()} TEST
                  </Text>
                  <View style={[styles.modalStatusBadge, { backgroundColor: getSessionStatusColor(getSessionStatus(selectedSession)) }]}>
                    <Text style={styles.modalStatusText}>
                      {getSessionStatus(selectedSession).charAt(0).toUpperCase() + getSessionStatus(selectedSession).slice(1)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.modalSessionTitle}>{selectedSession.title}</Text>
                
                {selectedSession.description && (
                  <Text style={styles.modalSessionDescription}>{selectedSession.description}</Text>
                )}

                <View style={styles.modalSessionDetails}>
                  <View style={styles.modalSessionDetail}>
                    <MapPin size={16} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.modalSessionDetailText}>
                      {selectedSession.location?.name}
                    </Text>
                  </View>
                  
                  <View style={styles.modalSessionDetail}>
                    <Clock size={16} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.modalSessionDetailText}>
                      {formatTime(selectedSession.start_time)} - {formatTime(selectedSession.end_time)}
                    </Text>
                  </View>
                  
                  <View style={styles.modalSessionDetail}>
                    <Users size={16} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.modalSessionDetailText}>
                      {selectedSession.availability?.available_spots || 0} spots available
                    </Text>
                  </View>
                  
                  <View style={styles.modalSessionDetail}>
                    <DollarSign size={16} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.modalSessionDetailText}>
                      {formatPrice(selectedSession.price_cents)}
                    </Text>
                  </View>
                </View>
              </LinearGradient>

              {selectedSession.instructor && (
                <View style={styles.instructorCard}>
                  <Text style={styles.instructorTitle}>Instructor</Text>
                  <View style={styles.instructorInfo}>
                    <View style={styles.instructorAvatar}>
                      <Text style={styles.instructorInitials}>
                        {selectedSession.instructor.full_name.split(' ').map(n => n[0]).join('')}
                      </Text>
                    </View>
                    <View style={styles.instructorDetails}>
                      <Text style={styles.instructorName}>{selectedSession.instructor.full_name}</Text>
                      <Text style={styles.instructorEmail}>{selectedSession.instructor.email}</Text>
                      {selectedSession.instructor.rating && (
                        <View style={styles.instructorRating}>
                          <Star size={14} color={Colors.accent} fill={Colors.accent} />
                          <Text style={styles.instructorRatingText}>{selectedSession.instructor.rating}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              )}

              {selectedSession.requirements && selectedSession.requirements.length > 0 && (
                <View style={styles.requirementsCard}>
                  <Text style={styles.requirementsTitle}>Requirements</Text>
                  {selectedSession.requirements.map((requirement, index) => (
                    <View key={index} style={styles.requirementItem}>
                      <CheckCircle size={16} color={Colors.success} />
                      <Text style={styles.requirementText}>{requirement}</Text>
                    </View>
                  ))}
                </View>
              )}

              {selectedSession.equipment_provided && selectedSession.equipment_provided.length > 0 && (
                <View style={styles.equipmentCard}>
                  <Text style={styles.equipmentTitle}>Equipment Provided</Text>
                  {selectedSession.equipment_provided.map((equipment, index) => (
                    <View key={index} style={styles.equipmentItem}>
                      <Zap size={16} color={Colors.accent} />
                      <Text style={styles.equipmentText}>{equipment}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.modalActions}>
                {getSessionStatus(selectedSession) === 'available' && (
                  <TouchableOpacity
                    style={styles.bookButton}
                    onPress={() => handleBooking(selectedSession)}
                  >
                    <BookOpen size={20} color={Colors.white} />
                    <Text style={styles.bookButtonText}>Book Session</Text>
                  </TouchableOpacity>
                )}
                
                {getSessionStatus(selectedSession) === 'full' && (
                  <TouchableOpacity
                    style={[styles.bookButton, { backgroundColor: Colors.warning }]}
                    onPress={() => handleBooking(selectedSession)}
                  >
                    <AlertCircle size={20} color={Colors.white} />
                    <Text style={styles.bookButtonText}>Join Waitlist</Text>
                  </TouchableOpacity>
                )}

                <View style={styles.secondaryActions}>
                  <TouchableOpacity style={styles.secondaryAction}>
                    <Heart size={20} color={Colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.secondaryAction}>
                    <Share2 size={20} color={Colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.secondaryAction}>
                    <Phone size={20} color={Colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.secondaryAction}>
                    <Mail size={20} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
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
  // Stats
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.policeRedBorder,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.white + '30',
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
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filtersTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
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
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  clearButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  applyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.primary,
    borderRadius: 20,
  },
  applyButtonText: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: '600',
  },
  
  // Single Card Calendar
  calendarCard: {
    backgroundColor: Colors.card,
    margin: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: Colors.primary,
  },
  calendarNav: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarTitleContainer: {
    alignItems: 'center',
  },
  calendarTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.white,
  },
  calendarSubtitle: {
    fontSize: 12,
    color: Colors.white + '80',
    fontWeight: '500',
  },

  dayHeaders: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary + '20',
    backgroundColor: Colors.primary + '08',
    justifyContent: 'space-between',
  },
  dayHeaderContainer: {
    width: (width - 32) / 7, // Match day cell width
    paddingVertical: 16,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: Colors.primary + '15',
  },
  dayHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: Colors.white,
  },
  dayCell: {
    width: (width - 32) / 7, // Account for card margins
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.primary + '20',
    position: 'relative',
  },
  dayCellOtherMonth: {
    backgroundColor: Colors.background,
  },
  dayCellToday: {
    backgroundColor: Colors.primary + '20',
  },
  dayCellSelected: {
    backgroundColor: Colors.primary,
  },
  dayCellPast: {
    opacity: 0.5,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  dayNumberOtherMonth: {
    color: Colors.textSecondary,
  },
  dayNumberToday: {
    color: Colors.primary,
    fontWeight: '700',
  },
  dayNumberSelected: {
    color: Colors.white,
    fontWeight: '700',
  },
  dayNumberPast: {
    color: Colors.textSecondary,
  },
  selectedDayGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
  },
  todayGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
  },
  daySessions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  sessionDotGradient: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  sessionDotText: {
    fontSize: 8,
    fontWeight: '700',
    color: Colors.white,
  },
  moreSessionsContainer: {
    backgroundColor: Colors.primary + '20',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  moreSessions: {
    fontSize: 8,
    color: Colors.primary,
    fontWeight: '700',
  },
  sessionCountBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.accent,
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionCountText: {
    fontSize: 8,
    fontWeight: '700',
    color: Colors.white,
  },
  sessionLegend: {
    backgroundColor: Colors.primary + '05',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.primary + '15',
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
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
  sessionCount: {
    fontSize: 14,
    color: Colors.textSecondary,
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
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
  sessionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  sessionActionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  
  // Quick actions
  quickActions: {
    padding: 16,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  
  // List View
  listView: {
    margin: 16,
  },
  listSessionCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  listSessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listSessionType: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  listSessionTypeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  listStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  listStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  listSessionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  listSessionDate: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  listSessionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listSessionDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listSessionDetailText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  listSessionPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalSessionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  modalSessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalSessionType: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  modalStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modalStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  modalSessionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 12,
  },
  modalSessionDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
  },
  modalSessionDetails: {
    gap: 8,
    marginBottom: 16,
  },
  modalSessionDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalSessionDetailText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  instructorCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  instructorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  instructorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  instructorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructorInitials: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  instructorDetails: {
    flex: 1,
  },
  instructorName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  instructorEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  instructorRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  instructorRatingText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.accent,
  },
  requirementsCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  requirementsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  equipmentCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  equipmentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  equipmentText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  bookButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 20,
  },
  secondaryAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
