import React, { createContext, useContext } from 'react';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { RobustBookingService } from '@/lib/robustBookingService';
import type {
  PracticeSession,
  Booking,
  Waitlist,
  SessionAvailability,
  SessionFilters,
  BookingFilters,
  CreateSessionData,
  UpdateSessionData,
  WaiverData,
  BookingFormData,
  ApiResponse,
  PaginatedResponse,
  BookingError,
  TestType,
} from '@/types/practice-sessions';

type PracticeSessionsState = {
  sessions: PracticeSession[];
  bookings: Booking[];
  waitlist: Waitlist[];
  loading: boolean;
  error: string | null;
};

// Create context
const PracticeSessionsContext = createContext<any>(null);

// Provider component
export const PracticeSessionsProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [state, setState] = useState<PracticeSessionsState>({
    sessions: [],
    bookings: [],
    waitlist: [],
    loading: false,
    error: null,
  });

  // Load practice sessions
  const loadSessions = useCallback(async (filters?: SessionFilters) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      let query = supabase
        .from('practice_sessions')
        .select(`
          *,
          location:locations(*),
          instructor:instructors(*)
        `)
        .eq('status', 'scheduled')
        .gte('session_date', new Date().toISOString().split('T')[0])
        .order('session_date', { ascending: true })
        .order('start_time', { ascending: true });

      // Apply filters
      if (filters?.test_type) {
        query = query.eq('test_type', filters.test_type);
      }
      if (filters?.date_from) {
        query = query.gte('session_date', filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte('session_date', filters.date_to);
      }
      if (filters?.location_id) {
        query = query.eq('location_id', filters.location_id);
      }
      if (filters?.instructor_id) {
        query = query.eq('instructor_id', filters.instructor_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Query error:', error);
        throw error;
      }

      // Load availability for each session - optimize with Promise.allSettled for better error handling
      const sessionsWithAvailability = await Promise.allSettled(
        (data || []).map(async (session) => {
          try {
            const availability = await getSessionAvailability(session.id);
            return { ...session, availability };
          } catch (error) {
            console.error(`Error loading availability for session ${session.id}:`, error);
            return { ...session, availability: null };
          }
        })
      );

      const processedSessions = sessionsWithAvailability
        .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
        .map(result => result.value);

      setState(prev => ({
        ...prev,
        sessions: processedSessions,
        loading: false,
        error: null,
      }));
    } catch (error: any) {
      console.error('❌ Error loading sessions:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load sessions',
      }));
    }
  }, [user?.id]);

  // Load user's bookings
  const loadBookings = useCallback(async (filters?: BookingFilters) => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // First test if bookings table exists
      const { data: testData, error: testError } = await supabase
        .from('bookings')
        .select('id')
        .limit(1);
      
      if (testError) {
        console.warn('⚠️ Context: Bookings table test failed:', testError.message);
        // If table doesn't exist, set empty array and return
        setState(prev => ({
          ...prev,
          bookings: [],
          loading: false,
          error: null, // Don't set error for missing table
        }));
        return;
      }

      let query = supabase
        .from('bookings')
        .select(`
          *,
          practice_sessions(
            *,
            locations(*),
            instructors(*)
          ),
          attendance(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Apply filters with safer syntax
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.date_from) {
        // Use simpler filter syntax to avoid nested field issues
        query = query.gte('created_at', filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to);
      }
      // Skip nested filters that might cause issues
      // if (filters?.test_type) {
      //   query = query.eq('session.test_type', filters.test_type);
      // }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Context: Error loading bookings:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        // Don't throw, just set empty array
        setState(prev => ({
          ...prev,
          bookings: [],
          loading: false,
          error: null, // Don't show error to user for database issues
        }));
        return;
      }

      if (data && data.length > 0) {
        data.forEach((booking, index) => {
          });
      }

      setState(prev => ({
        ...prev,
        bookings: data || [],
        loading: false,
      }));
    } catch (error: any) {
      console.error('❌ Context: Error in loadBookings:', {
        message: error.message,
        code: error.code,
        details: error.details
      });
      // Always set empty array on error to prevent UI crashes
      setState(prev => ({
        ...prev,
        bookings: [],
        error: null, // Don't show database errors to users
        loading: false,
      }));
    }
  }, [user]);

  // Load user's waitlist entries
  const loadWaitlist = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('waitlist')
        .select(`
          *,
          session:practice_sessions(
            *,
            location:locations(*),
            instructor:instructors(*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        // If waitlist table doesn't exist, just set empty array
        console.warn('Waitlist table not available:', error.message);
        setState(prev => ({
          ...prev,
          waitlist: [],
        }));
        return;
      }

      setState(prev => ({
        ...prev,
        waitlist: data || [],
      }));
    } catch (error: any) {
      console.error('Error loading waitlist:', error);
      // Set empty array on any error
      setState(prev => ({
        ...prev,
        waitlist: [],
      }));
    }
  }, [user]);

  // Get session availability
  const getSessionAvailability = useCallback(async (sessionId: string): Promise<SessionAvailability | null> => {
    try {
      const { data, error } = await supabase
        .rpc('get_session_availability', { session_uuid: sessionId });

      if (error) {
        throw error;
      }

      return data?.[0] || null;
    } catch (error: any) {
      console.error('Error getting session availability:', error);
      return null;
    }
  }, []);

  // Check if user can book a session
  const canBookSession = useCallback(async (sessionId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .rpc('can_book_session', { 
          session_uuid: sessionId, 
          user_uuid: user.id 
        });

      if (error) {
        throw error;
      }

      return data || false;
    } catch (error: any) {
      console.error('Error checking booking availability:', error);
      return false;
    }
  }, [user]);

  // Create a booking
  const createBooking = useCallback(async (bookingData: BookingFormData): Promise<ApiResponse<Booking>> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      // Use the new RobustBookingService instead of the old RPC function
      const result = await RobustBookingService.completeBooking(
        bookingData.session_id,
        bookingData.waiver_data,
        {
          paymentMethod: 'card', // Default payment method
          paymentIntentId: bookingData.payment_intent_id,
          transactionId: undefined // Not available in BookingFormData
        }
      );

      if (!result.success) {
        return { success: false, error: result.error || 'Failed to create booking' };
      }

      // Get the created booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', result.bookingId)
        .single();

      if (bookingError || !booking) {
        return { success: false, error: 'Failed to retrieve booking details' };
      }

      // Reload bookings
      await loadBookings();

      return { success: true, data: booking };
    } catch (error: any) {
      console.error('❌ Error creating booking:', error);
      return { success: false, error: error.message };
    }
  }, [user, loadBookings]);

  // Cancel a booking
  const cancelBooking = useCallback(async (bookingId: string, reason?: string): Promise<ApiResponse<Booking>> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      // Check if booking belongs to user
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .eq('user_id', user.id)
        .single();

      if (bookingError || !booking) {
        return { success: false, error: 'Booking not found' };
      }

      // Check if booking can be cancelled (24h before session)
      const session = state.sessions.find(s => s.id === booking.session_id);
      if (session) {
        const sessionDate = new Date(session.session_date + 'T' + session.start_time);
        const now = new Date();
        const hoursUntilSession = (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        if (hoursUntilSession < 24) {
          return { success: false, error: 'Bookings can only be cancelled up to 24 hours before the session' };
        }
      }

      // Update booking status
      const { data: updatedBooking, error: updateError } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          cancellation_reason: reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Reload bookings
      await loadBookings();

      return { success: true, data: updatedBooking };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [user, state.sessions, loadBookings]);

  // Join waitlist
  const joinWaitlist = useCallback(async (sessionId: string): Promise<ApiResponse<Waitlist>> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const { data, error } = await supabase
        .rpc('join_session_waitlist', {
          session_uuid: sessionId,
          user_uuid: user.id,
        });

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return { success: false, error: 'Failed to join waitlist' };
      }

      const result = data[0];
      
      if (!result.success) {
        return { success: false, error: result.error_message || 'Failed to join waitlist' };
      }

      // Reload waitlist
      await loadWaitlist();

      return { success: true, data: { id: '', user_id: user.id, session_id: sessionId, position: result.waitlist_position, notified: false, created_at: new Date().toISOString() } };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [user, loadWaitlist]);

  // Leave waitlist
  const leaveWaitlist = useCallback(async (sessionId: string): Promise<ApiResponse<boolean>> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const { data, error } = await supabase
        .rpc('leave_session_waitlist', {
          session_uuid: sessionId,
          user_uuid: user.id,
        });

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return { success: false, error: 'Failed to leave waitlist' };
      }

      const result = data[0];
      
      if (!result.success) {
        return { success: false, error: result.error_message || 'Failed to leave waitlist' };
      }

      // Reload waitlist
      await loadWaitlist();

      return { success: true, data: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [user, loadWaitlist]);

  // Admin functions
  const createSession = useCallback(async (sessionData: CreateSessionData): Promise<ApiResponse<PracticeSession>> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const { data, error } = await supabase
        .from('practice_sessions')
        .insert({
          ...sessionData,
          status: 'scheduled', // Ensure sessions are created with 'scheduled' status
          created_by: user.id,
        })
        .select(`
          *,
          location:locations(*),
          instructor:instructors(*)
        `)
        .single();

      if (error) {
        throw error;
      }

      // Reload sessions
      await loadSessions();

      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [user, loadSessions]);

  const updateSession = useCallback(async (sessionId: string, sessionData: UpdateSessionData): Promise<ApiResponse<PracticeSession>> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const { data, error } = await supabase
        .from('practice_sessions')
        .update({
          ...sessionData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId)
        .select(`
          *,
          location:locations(*),
          instructor:instructors(*)
        `)
        .single();

      if (error) {
        throw error;
      }

      // Reload sessions
      await loadSessions();

      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [user, loadSessions]);

  const deleteSession = useCallback(async (sessionId: string): Promise<ApiResponse<boolean>> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const { error } = await supabase
        .from('practice_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) {
        throw error;
      }

      // Reload sessions
      await loadSessions();

      return { success: true, data: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [user, loadSessions]);

  // Load data on mount
  useEffect(() => {
    if (user) {
      loadSessions();
      loadBookings();
      loadWaitlist();
    }
  }, [user, loadSessions, loadBookings, loadWaitlist]);

  const contextValue = {
    // State
    sessions: state.sessions,
    bookings: state.bookings,
    waitlist: state.waitlist,
    loading: state.loading,
    error: state.error,

    // Actions
    loadSessions,
    loadBookings,
    loadWaitlist,
    getSessionAvailability,
    canBookSession,
    createBooking,
    cancelBooking,
    joinWaitlist,
    leaveWaitlist,

    // Admin actions
    createSession,
    updateSession,
    deleteSession,

    // Utility functions
    getSessionById: useCallback((id: string) => 
      state.sessions.find(s => s.id === id), [state.sessions]),
    
    getBookingById: useCallback((id: string) => 
      state.bookings.find(b => b.id === id), [state.bookings]),
    
    getUserBookingsForSession: useCallback((sessionId: string) => 
      state.bookings.filter(b => b.session_id === sessionId), [state.bookings]),
    
    isUserBooked: useCallback((sessionId: string) => {
      const isBooked = state.bookings.some(b => b.session_id === sessionId && b.status === 'confirmed');
      console.log(`User booked status for session ${sessionId}: ${isBooked} (${state.bookings.length} total bookings)`);
      return isBooked;
    }, [state.bookings]),
    
    isUserPendingApproval: useCallback((sessionId: string) => {
      const isPending = state.bookings.some(b => b.session_id === sessionId && 
        (b.status === 'pending' || b.status === 'submitted_for_approval' || b.status === 'approved'));
      console.log(`User pending approval status for session ${sessionId}: ${isPending}`);
      return isPending;
    }, [state.bookings]),
    
    isUserWaitlisted: useCallback((sessionId: string) => 
      state.waitlist?.some(w => w.session_id === sessionId) || false, [state.waitlist]),
  };

  return (
    <PracticeSessionsContext.Provider value={contextValue}>
      {children}
    </PracticeSessionsContext.Provider>
  );
};

// Hook to use the context
export const usePracticeSessions = () => {
  const context = useContext(PracticeSessionsContext);
  if (!context) {
    throw new Error('usePracticeSessions must be used within a PracticeSessionsProvider');
  }
  return context;
};
