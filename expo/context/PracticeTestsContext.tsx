import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

export type PracticeTestType = 'PREP' | 'PIN' | 'Combined';

export type RegistrationStatus = 'registered' | 'waitlisted' | 'cancelled' | 'attended' | 'no_show';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';

export type PracticeTest = {
  id: string;
  title: string;
  description: string | null;
  test_type: PracticeTestType;
  location: string;
  address: string | null;
  instructor_name: string | null;
  instructor_email: string | null;
  start_time: string;
  end_time: string;
  total_capacity: number;
  current_registrations: number;
  price: number;
  is_active: boolean;
  is_recurring: boolean;
  recurring_pattern: any;
  requirements: string | null;
  what_to_bring: string | null;
  cancellation_policy: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type PracticeTestRegistration = {
  id: string;
  practice_test_id: string;
  user_id: string;
  registration_status: RegistrationStatus;
  payment_status: PaymentStatus;
  payment_intent_id: string | null;
  special_requirements: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  registered_at: string;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
  practice_test?: PracticeTest;
};

export type PracticeTestWaitlist = {
  id: string;
  practice_test_id: string;
  user_id: string;
  position: number;
  joined_at: string;
  notified_at: string | null;
  expires_at: string | null;
  created_at: string;
  practice_test?: PracticeTest;
};

// Create context
const PracticeTestsContext = createContext<any>(null);

// Provider component
export const PracticeTestsProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin } = useAuth();
  const [practiceTests, setPracticeTests] = useState<PracticeTest[]>([]);
  const [userRegistrations, setUserRegistrations] = useState<PracticeTestRegistration[]>([]);
  const [userWaitlists, setUserWaitlists] = useState<PracticeTestWaitlist[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load practice tests
  const loadPracticeTests = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('practice_tests')
        .select('*')
        .eq('is_active', true)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error loading practice tests:', error);
        console.error('ERROR Error loading practice tests:', JSON.stringify(error));
        
        // Handle missing table error specifically
        if (error.code === 'PGRST205' && error.message?.includes('practice_tests')) {
          const setupMessage = 'Database setup required: The practice_tests table does not exist. Please run the SQL setup script in your Supabase dashboard.';
          console.error(setupMessage);
          setError(setupMessage);
        } else if (error.code === '42P01') {
          const setupMessage = 'Database setup required: Please run the SQL setup script in your Supabase dashboard to create the required tables.';
          console.error(setupMessage);
          setError(setupMessage);
        } else {
          const errorMessage = error.message || error.details || error.hint || 'Failed to load practice tests';
          setError(errorMessage);
        }
        return;
      }

      setPracticeTests(data || []);
    } catch (err: any) {
      console.error('Error loading practice tests:', err);
      console.error('ERROR Error loading practice tests:', typeof err === 'object' ? JSON.stringify(err) : err);
      const errorMessage = typeof err === 'string' ? err : err?.message || err?.details || err?.hint || 'Failed to load practice tests';
      setError(errorMessage);
    }
  }, []);

  // Load user registrations
  const loadUserRegistrations = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('practice_test_registrations')
        .select(`
          *,
          practice_test:practice_tests(*)
        `)
        .eq('user_id', user.id)
        .order('registered_at', { ascending: false });

      if (error) {
        console.error('Error loading user registrations:', error);
        return;
      }

      setUserRegistrations(data || []);
    } catch (err: any) {
      console.error('Error loading user registrations:', err);
    }
  }, [user]);

  // Load user waitlists
  const loadUserWaitlists = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('practice_test_waitlist')
        .select(`
          *,
          practice_test:practice_tests(*)
        `)
        .eq('user_id', user.id)
        .order('joined_at', { ascending: false });

      if (error) {
        console.error('Error loading user waitlists:', error);
        return;
      }

      setUserWaitlists(data || []);
    } catch (err: any) {
      console.error('Error loading user waitlists:', err);
    }
  }, [user]);

  // Register for a practice test
  const registerForTest = useCallback(async (
    testId: string,
    emergencyContactName?: string,
    emergencyContactPhone?: string,
    specialRequirements?: string
  ) => {
    if (!user) {
      Alert.alert('Error', 'Please sign in to register for tests');
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const test = practiceTests.find(t => t.id === testId);
      if (!test) {
        return { success: false, error: 'Test not found' };
      }

      // Check if already registered
      const existingRegistration = userRegistrations.find(
        r => r.practice_test_id === testId && r.registration_status !== 'cancelled'
      );
      if (existingRegistration) {
        return { success: false, error: 'Already registered for this test' };
      }

      // Check capacity
      const shouldWaitlist = test.current_registrations >= test.total_capacity;
      
      if (shouldWaitlist) {
        // Add to waitlist
        const { error } = await supabase
          .from('practice_test_waitlist')
          .insert({
            practice_test_id: testId,
            user_id: user.id,
            position: 1 // Will be updated by trigger
          })
          .select()
          .single();

        if (error) {
          console.error('Error joining waitlist:', error);
          return { success: false, error: error.message };
        }

        await loadUserWaitlists();
        Alert.alert('Joined Waitlist', 'You have been added to the waitlist for this test.');
        return { success: true, waitlisted: true };
      } else {
        // Register directly
        const { error } = await supabase
          .from('practice_test_registrations')
          .insert({
            practice_test_id: testId,
            user_id: user.id,
            emergency_contact_name: emergencyContactName,
            emergency_contact_phone: emergencyContactPhone,
            special_requirements: specialRequirements
          })
          .select()
          .single();

        if (error) {
          console.error('Error registering for test:', error);
          return { success: false, error: error.message };
        }

        await loadUserRegistrations();
        await loadPracticeTests(); // Refresh to update capacity
        Alert.alert('Registration Successful', 'You have been registered for this test.');
        return { success: true, waitlisted: false };
      }
    } catch (err: any) {
      console.error('Error registering for test:', err);
      return { success: false, error: err.message || 'Failed to register' };
    }
  }, [user, practiceTests, userRegistrations, loadUserWaitlists, loadUserRegistrations, loadPracticeTests]);

  // Cancel registration
  const cancelRegistration = useCallback(async (registrationId: string, reason?: string) => {
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const { error } = await supabase
        .from('practice_test_registrations')
        .update({
          registration_status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason
        })
        .eq('id', registrationId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error cancelling registration:', error);
        return { success: false, error: error.message };
      }

      await loadUserRegistrations();
      await loadPracticeTests(); // Refresh to update capacity
      Alert.alert('Registration Cancelled', 'Your registration has been cancelled.');
      return { success: true };
    } catch (err: any) {
      console.error('Error cancelling registration:', err);
      return { success: false, error: err.message || 'Failed to cancel registration' };
    }
  }, [user, loadUserRegistrations, loadPracticeTests]);

  // Leave waitlist
  const leaveWaitlist = useCallback(async (waitlistId: string) => {
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const { error } = await supabase
        .from('practice_test_waitlist')
        .delete()
        .eq('id', waitlistId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error leaving waitlist:', error);
        return { success: false, error: error.message };
      }

      await loadUserWaitlists();
      Alert.alert('Left Waitlist', 'You have been removed from the waitlist.');
      return { success: true };
    } catch (err: any) {
      console.error('Error leaving waitlist:', err);
      return { success: false, error: err.message || 'Failed to leave waitlist' };
    }
  }, [user, loadUserWaitlists]);

  // Admin functions
  const createPracticeTest = useCallback(async (testData: Omit<PracticeTest, 'id' | 'created_at' | 'updated_at' | 'current_registrations'>) => {
    if (!isAdmin()) {
      return { success: false, error: 'Admin privileges required' };
    }

    try {
      const { data, error } = await supabase
        .from('practice_tests')
        .insert({
          ...testData,
          created_by: user?.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating practice test:', error);
        return { success: false, error: error.message };
      }

      await loadPracticeTests();
      Alert.alert('Success', 'Practice test created successfully.');
      return { success: true, data };
    } catch (err: any) {
      console.error('Error creating practice test:', err);
      return { success: false, error: err.message || 'Failed to create practice test' };
    }
  }, [isAdmin, user, loadPracticeTests]);

  const updatePracticeTest = useCallback(async (testId: string, updates: Partial<PracticeTest>) => {
    if (!isAdmin()) {
      return { success: false, error: 'Admin privileges required' };
    }

    try {
      const { data, error } = await supabase
        .from('practice_tests')
        .update(updates)
        .eq('id', testId)
        .select()
        .single();

      if (error) {
        console.error('Error updating practice test:', error);
        return { success: false, error: error.message };
      }

      await loadPracticeTests();
      Alert.alert('Success', 'Practice test updated successfully.');
      return { success: true, data };
    } catch (err: any) {
      console.error('Error updating practice test:', err);
      return { success: false, error: err.message || 'Failed to update practice test' };
    }
  }, [isAdmin, loadPracticeTests]);

  const deletePracticeTest = useCallback(async (testId: string) => {
    if (!isAdmin()) {
      return { success: false, error: 'Admin privileges required' };
    }

    try {
      const { error } = await supabase
        .from('practice_tests')
        .delete()
        .eq('id', testId);

      if (error) {
        console.error('Error deleting practice test:', error);
        return { success: false, error: error.message };
      }

      await loadPracticeTests();
      Alert.alert('Success', 'Practice test deleted successfully.');
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting practice test:', err);
      return { success: false, error: err.message || 'Failed to delete practice test' };
    }
  }, [isAdmin, loadPracticeTests]);

  // Get availability status for a test
  const getAvailabilityStatus = useCallback((test: PracticeTest) => {
    const availableSeats = test.total_capacity - test.current_registrations;
    const percentFull = (test.current_registrations / test.total_capacity) * 100;
    
    if (availableSeats <= 0) {
      return { status: 'full', color: '#ef4444', text: 'Fully Booked' };
    } else if (percentFull >= 80) {
      return { status: 'limited', color: '#f59e0b', text: `${availableSeats} seats left` };
    } else {
      return { status: 'available', color: '#10b981', text: `${availableSeats} seats available` };
    }
  }, []);

  // Check if user is registered for a test
  const isUserRegistered = useCallback((testId: string) => {
    return userRegistrations.some(
      r => r.practice_test_id === testId && r.registration_status !== 'cancelled'
    );
  }, [userRegistrations]);

  // Check if user is on waitlist for a test
  const isUserWaitlisted = useCallback((testId: string) => {
    return userWaitlists.some(w => w.practice_test_id === testId);
  }, [userWaitlists]);

  // Initialize data loading
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        await loadPracticeTests();
        if (user) {
          await Promise.all([
            loadUserRegistrations(),
            loadUserWaitlists()
          ]);
        }
      } catch (err: any) {
        console.error('Error initializing practice tests data:', err);
        const errorMessage = typeof err === 'string' ? err : err?.message || 'Failed to load data';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [user, loadPracticeTests, loadUserRegistrations, loadUserWaitlists]);

  const contextValue = useMemo(() => ({
    // Data
    practiceTests,
    userRegistrations,
    userWaitlists,
    isLoading,
    error,
    
    // Actions
    loadPracticeTests,
    registerForTest,
    cancelRegistration,
    leaveWaitlist,
    
    // Admin actions
    createPracticeTest,
    updatePracticeTest,
    deletePracticeTest,
    
    // Utilities
    getAvailabilityStatus,
    isUserRegistered,
    isUserWaitlisted,
  }), [
    practiceTests,
    userRegistrations,
    userWaitlists,
    isLoading,
    error,
    loadPracticeTests,
    registerForTest,
    cancelRegistration,
    leaveWaitlist,
    createPracticeTest,
    updatePracticeTest,
    deletePracticeTest,
    getAvailabilityStatus,
    isUserRegistered,
    isUserWaitlisted,
  ]);

  return (
    <PracticeTestsContext.Provider value={contextValue}>
      {children}
    </PracticeTestsContext.Provider>
  );
};

// Hook to use the context
export const usePracticeTests = () => {
  const context = useContext(PracticeTestsContext);
  if (!context) {
    throw new Error('usePracticeTests must be used within a PracticeTestsProvider');
  }
  return context;
};