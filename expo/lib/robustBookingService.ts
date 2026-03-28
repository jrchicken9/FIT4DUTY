import { supabase } from './supabase';

// Retry utility function
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 2,
  delay: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      const isNetworkError = error.message?.includes('Network request failed') ||
                            error.message?.includes('timeout') ||
                            error.message?.includes('fetch') ||
                            error.name === 'AbortError';
      
      if (attempt <= maxRetries && isNetworkError) {
        console.warn(`⚠️ Attempt ${attempt} failed, retrying in ${delay}ms:`, error.message);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 1.5; // Exponential backoff
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

// Import notification types
export type NotificationType = 
  | 'practice_session_reminder'
  | 'booking_confirmation'
  | 'booking_cancelled'
  | 'waitlist_position'
  | 'session_full'
  | 'session_cancelled'
  | 'payment_required'
  | 'waiver_required'
  | 'general_announcement'
  | 'fitness_reminder'
  | 'test_reminder'
  | 'booking_pending'
  | 'booking_approved'
  | 'booking_rejected';

export interface WaiverData {
  // Personal Information
  full_name: string;
  date_of_birth: string;
  phone: string;
  email: string;
  address?: string;
  city?: string;
  province?: string;
  
  // Emergency Contact
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  
  // Medical Information (Optional)
  medical_conditions?: string;
  medications?: string;
  allergies?: string;
  
  // Legal Acknowledgments
  medically_fit: boolean;
  understand_risks: boolean;
  release_liability: boolean;
  consent_emergency_care: boolean;
  agree_policies: boolean;
  
  // Signature
  signature_data: string;
  typed_legal_name: string;
  signature_timestamp: string;
  
  // Versioning
  waiver_version: string;
}

export interface BookingResult {
  success: boolean;
  bookingId?: string;
  message?: string;
  error?: string;
}

export interface RobustPaymentData {
  paymentMethod: string;
  paymentIntentId?: string;
  transactionId?: string;
}

export class RobustBookingService {
  /**
   * Complete booking flow with waiver and payment
   * Now keeps booking in pending status for admin approval
   */
  static async completeBooking(
    sessionId: string,
    waiverData: WaiverData,
    paymentData: RobustPaymentData
  ): Promise<BookingResult> {
    try {
      // Step 1: Validate user and session
      const validation = await this.validateBooking(sessionId);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Step 2: Create booking with waiver data
      const bookingResult = await this.createBookingWithWaiver(sessionId, waiverData);
      if (!bookingResult.success) {
        return bookingResult;
      }

      // Step 3: Update payment status (keeps booking in pending status)
      const paymentResult = await this.updatePaymentStatus(
        bookingResult.bookingId!,
        'succeeded',
        paymentData
      );

      if (!paymentResult.success) {
        // Clean up booking if payment fails
        await this.cleanupBooking(bookingResult.bookingId!);
        return { success: false, error: 'Payment failed. Please try again.' };
      }

      // Step 4: Create notification for booking submission
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const session = await this.getSessionById(sessionId);
          if (session) {
            await this.notifyBookingSubmitted(user.id, session.title, bookingResult.bookingId!);
          }
        }
      } catch (error) {
        console.error('Error creating notification:', error);
        // Don't fail the booking if notification fails
      }

      return {
        success: true,
        bookingId: bookingResult.bookingId,
        message: 'Booking submitted successfully! Your booking is now pending admin approval. You will receive a notification once it has been reviewed.'
      };

    } catch (error) {
      console.error('❌ Booking flow failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Validate booking request
   */
  private static async validateBooking(sessionId: string): Promise<{ valid: boolean; error?: string }> {
    try {
      // Check user authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { valid: false, error: 'User not authenticated' };
      }

      // Check session exists and is available
      const { data: session, error: sessionError } = await supabase
        .from('practice_sessions')
        .select('id, status, capacity, price_cents')
        .eq('id', sessionId)
        .single();

      if (sessionError || !session) {
        return { valid: false, error: 'Session not found' };
      }

      if (session.status !== 'scheduled') {
        return { valid: false, error: `Session is ${session.status}` };
      }

      // Check if user already has a booking
      const { data: existingBooking } = await supabase
        .from('bookings')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('session_id', sessionId)
        .in('status', ['pending', 'approved', 'confirmed'])
        .single();

      if (existingBooking) {
        return { valid: false, error: `You already have a ${existingBooking.status} booking for this session` };
      }

      // Check capacity (only count confirmed bookings for capacity)
      const { count: confirmedBookings } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', sessionId)
        .eq('status', 'confirmed');

      if (confirmedBookings && confirmedBookings >= session.capacity) {
        return { valid: false, error: 'Session is full' };
      }

      return { valid: true };
    } catch (error) {
      console.error('Validation error:', error);
      return { valid: false, error: 'Validation failed' };
    }
  }

  /**
   * Create booking with waiver data stored in booking record
   */
  private static async createBookingWithWaiver(
    sessionId: string,
    waiverData: WaiverData
  ): Promise<BookingResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ User not authenticated');
        return { success: false, error: 'User not authenticated' };
      }

      // Get session price
      const { data: session, error: sessionError } = await supabase
        .from('practice_sessions')
        .select('price_cents')
        .eq('id', sessionId)
        .single();

      if (sessionError || !session) {
        console.error('❌ Session not found:', sessionError);
        return { success: false, error: 'Session not found' };
      }

      // Prepare booking data
      const bookingData = {
        user_id: user.id,
        session_id: sessionId,
        status: 'pending', // Always start as pending
        payment_status: 'pending',
        amount_cents: session.price_cents,
        
        // Store waiver data in booking record
        waiver_signed: true,
        waiver_signed_at: new Date().toISOString(),
        waiver_signed_name: waiverData.typed_legal_name,
        
        // Store full waiver data as JSON
        waiver_data: JSON.stringify(waiverData),
        
        // Emergency contact info
        emergency_contact: waiverData.emergency_contact_name,
        emergency_phone: waiverData.emergency_contact_phone,
        emergency_relationship: waiverData.emergency_contact_relationship,
        
        // Medical info
        medical_conditions: waiverData.medical_conditions,
        medications: waiverData.medications,
        allergies: waiverData.allergies,
        
        created_at: new Date().toISOString()
      };

      // Create booking with waiver data stored as JSON
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select('id')
        .single();

      if (bookingError) {
        console.error('❌ Booking creation failed:', bookingError);
        return { success: false, error: `Failed to create booking: ${bookingError.message}` };
      }

      if (!booking) {
        console.error('❌ No booking data returned');
        return { success: false, error: 'No booking data returned' };
      }

      return {
        success: true,
        bookingId: booking.id
      };

    } catch (error) {
      console.error('❌ Error creating booking:', error);
      return { success: false, error: `Failed to create booking: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  /**
   * Update payment status (keeps booking in pending status for admin approval)
   */
  private static async updatePaymentStatus(
    bookingId: string,
    paymentStatus: string,
    paymentData: RobustPaymentData
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData: any = {
        payment_status: paymentStatus,
        payment_method: paymentData.paymentMethod,
        updated_at: new Date().toISOString()
      };

      if (paymentData.paymentIntentId) {
        updateData.payment_intent_id = paymentData.paymentIntentId;
      }

      if (paymentData.transactionId) {
        updateData.transaction_id = paymentData.transactionId;
      }

      // IMPORTANT: Keep status as pending even after successful payment
      // Only admin approval should change status to confirmed
      if (paymentStatus === 'failed') {
        updateData.status = 'cancelled';
      }
      // For successful payments, keep the existing status (should be 'pending')

      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId);

      if (error) {
        console.error('❌ Payment status update failed:', error);
        return { success: false, error: `Failed to update payment status: ${error.message}` };
      }

      return { success: true };

    } catch (error) {
      console.error('❌ Error updating payment status:', error);
      return { success: false, error: `Failed to update payment status: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  /**
   * Clean up failed booking
   */
  private static async cleanupBooking(bookingId: string): Promise<void> {
    try {
      await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);
      
      } catch (error) {
      console.error('Error cleaning up booking:', error);
    }
  }

  /**
   * Get user's bookings with proper status display and retry logic
   */
  static async getUserBookings(): Promise<any[]> {
    try {
      return await withRetry(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        // Simplified query to reduce timeout risk
        const { data: bookings, error } = await supabase
          .from('bookings')
          .select(`
            *,
            practice_sessions (
              id,
              title,
              session_date,
              start_time,
              end_time,
              test_type,
              price_cents
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50); // Limit results to prevent large payloads

        if (error) {
          console.error('❌ Error fetching bookings:', error);
          throw error; // Let retry logic handle this
        }

        return bookings || [];
      }, 3, 1000); // 3 retries with 1 second initial delay
    } catch (error) {
      console.error('❌ Error fetching user bookings after retries:', error);
      return []; // Always return empty array to prevent UI crashes
    }
  }

  /**
   * Get booking status display text
   */
  static getBookingStatusText(status: string): string {
    switch (status) {
      case 'pending':
        return 'Pending Admin Review';
      case 'approved':
        return 'Approved - Awaiting Confirmation';
      case 'confirmed':
        return 'Confirmed';
      case 'rejected':
        return 'Rejected';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  }

  /**
   * Get booking status color
   */
  static getBookingStatusColor(status: string): string {
    switch (status) {
      case 'pending':
        return '#f59e0b'; // Orange
      case 'approved':
        return '#3b82f6'; // Blue
      case 'confirmed':
        return '#10b981'; // Green
      case 'rejected':
        return '#ef4444'; // Red
      case 'cancelled':
        return '#6b7280'; // Gray
      default:
        return '#6b7280';
    }
  }

  /**
   * Cancel a booking
   */
  static async cancelBooking(bookingId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId)
        .eq('user_id', user.id);

      if (error) {
        return { success: false, error: 'Failed to cancel booking' };
      }

      return { success: true, message: 'Booking cancelled successfully' };
    } catch (error) {
      console.error('Error cancelling booking:', error);
      return { success: false, error: 'Failed to cancel booking' };
    }
  }

  /**
   * Get session by ID
   */
  static async getSessionById(sessionId: string): Promise<any> {
    try {
      const { data: session, error } = await supabase
        .from('practice_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error || !session) {
        console.error('❌ Error fetching session:', error);
        return null;
      }

      return session;
    } catch (error) {
      console.error('❌ Error fetching session:', error);
      return null;
    }
  }

  /**
   * Get booking details
   */
  static async getBooking(bookingId: string): Promise<any> {
    try {
      const { data: booking, error } = await supabase
        .from('bookings')
        .select('*, practice_sessions (id, title, session_date, start_time, end_time, test_type, price_cents, location:locations (id, name, address, city, province), instructor:instructors (id, full_name))')
        .eq('id', bookingId)
        .single();

      if (error || !booking) {
        console.error('❌ Error fetching booking:', error);
        return null;
      }

      return booking;
    } catch (error) {
      console.error('❌ Error fetching booking:', error);
      return null;
    }
  }

  /**
   * Create a notification for booking events
   */
  static async createBookingNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data: Record<string, any> = {},
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
    isActionable = false,
    actionUrl?: string,
    actionText?: string
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc('create_notification', {
        p_user_id: userId,
        p_type: type,
        p_title: title,
        p_message: message,
        p_priority: priority,
        p_data: data,
        p_is_actionable: isActionable,
        p_action_url: actionUrl,
        p_action_text: actionText,
        p_scheduled_for: null,
      });

      if (error) {
        console.error('Error creating notification:', error);
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  /**
   * Create notification when booking is submitted for approval
   */
  static async notifyBookingSubmitted(userId: string, sessionTitle: string, bookingId: string): Promise<void> {
    await this.createBookingNotification(
      userId,
      'booking_pending',
      'Booking Submitted for Review',
      'Your booking for "' + sessionTitle + '" has been submitted and is pending admin approval.',
      { sessionTitle, bookingId },
      'medium',
      true,
      `/practice-sessions/bookings`,
      'View Booking'
    );
  }

  /**
   * Create notification when booking is approved
   */
  static async notifyBookingApproved(userId: string, sessionTitle: string, bookingId: string): Promise<void> {
    await this.createBookingNotification(
      userId,
      'booking_approved',
      'Booking Approved!',
      'Your booking for "' + sessionTitle + '" has been approved and is now confirmed.',
      { sessionTitle, bookingId },
      'high',
      true,
      `/practice-sessions/bookings`,
      'View Booking'
    );
  }

  /**
   * Create notification when booking is rejected
   */
  static async notifyBookingRejected(userId: string, sessionTitle: string, bookingId: string, reason?: string): Promise<void> {
    const message = reason 
      ? 'Your booking for "' + sessionTitle + '" has been rejected. Reason: ' + reason
      : 'Your booking for "' + sessionTitle + '" has been rejected.';

    await this.createBookingNotification(
      userId,
      'booking_rejected',
      'Booking Rejected',
      message,
      { sessionTitle, bookingId, reason },
      'high',
      true,
      `/practice-sessions`,
      'Book New Session'
    );
  }
}
