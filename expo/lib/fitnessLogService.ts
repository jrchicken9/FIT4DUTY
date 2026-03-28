import { supabase } from '@/lib/supabase';
import type { FitnessLog, FitnessLogDay, FitnessLogDayFormData, FitnessLogProgress } from '@/types/fitness-log';
import type { ExtendedFitnessLog, ExtendedFitnessLogDay, OacpFitnessLogDayFormData } from '@/types/oacpFitnessLog';
import { generateFitnessLogDays } from './dateUtils';
import { format, addDays } from 'date-fns';
import { fitnessLogToOacpState, withOacpDefaults } from '@/utils/oacpDefaults';

export const fitnessLogService = {
  /**
   * Get the user's currently active fitness log
   */
  async getActiveLog(): Promise<FitnessLog | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('fitness_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'in_progress')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as FitnessLog | null;
    } catch (error) {
      console.error('Error getting active log:', error);
      throw error;
    }
  },

  /**
   * Create a new 14-day fitness log
   */
  async createLog(start_date: string): Promise<FitnessLog> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Calculate end date (start + 13 days) using date-fns for consistency with start screen
      const startDateObj = new Date(start_date + 'T00:00:00');
      const endDate = addDays(startDateObj, 13);
      const end_date = format(endDate, 'yyyy-MM-dd');

      // Create the log
      const { data: log, error } = await supabase
        .from('fitness_logs')
        .insert({ 
          user_id: user.id, 
          start_date, 
          end_date 
        })
        .select()
        .single();

      if (error) throw error;

      // Seed 14 days with consistent date formatting
      const days = generateFitnessLogDays(log.id, start_date);

      const { error: dayErr } = await supabase
        .from('fitness_log_days')
        .insert(days);

      if (dayErr) throw dayErr;

      return log as FitnessLog;
    } catch (error) {
      console.error('Error creating log:', error);
      throw error;
    }
  },

  /**
   * Get all days for a specific log
   */
  async getDays(log_id: string): Promise<FitnessLogDay[]> {
    try {
      const { data, error } = await supabase
        .from('fitness_log_days')
        .select('*')
        .eq('log_id', log_id)
        .order('day_date', { ascending: true });

      if (error) throw error;
      return data as FitnessLogDay[];
    } catch (error) {
      console.error('Error getting days:', error);
      throw error;
    }
  },

  /**
   * Get a specific day entry
   */
  async getDay(log_id: string, day_date: string): Promise<FitnessLogDay | null> {
    try {
      const { data, error } = await supabase
        .from('fitness_log_days')
        .select('*')
        .eq('log_id', log_id)
        .eq('day_date', day_date)
        .maybeSingle();

      if (error) throw error;
      return data as FitnessLogDay | null;
    } catch (error) {
      console.error('Error getting day:', error);
      throw error;
    }
  },

  /**
   * Update a day entry (save as draft)
   */
  async updateDay(logId: string, date: string, data: FitnessLogDayFormData | OacpFitnessLogDayFormData): Promise<void> {
    try {
      // Check if day exists
      const existingDay = await this.getDay(logId, date);
      
      if (existingDay) {
        // Update existing day
        const { error } = await supabase
          .from('fitness_log_days')
          .update(data)
          .eq('log_id', logId)
          .eq('day_date', date);

        if (error) throw error;
      } else {
        // Create new day entry
        const { error } = await supabase
          .from('fitness_log_days')
          .insert({
            log_id: logId,
            day_date: date,
            ...data
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating day:', error);
      throw error;
    }
  },

  /**
   * Mark a day as complete (requires stress_method and sleep_hours)
   */
  async markDayComplete(logId: string, date: string): Promise<void> {
    try {
      // First get the current day data to validate
      const day = await this.getDay(logId, date);
      
      // If day doesn't exist, we can't mark it complete
      if (!day) {
        throw new Error('Day entry not found. Please save your entry first before marking it complete.');
      }

      // Validate required fields
      if (!day.stress_method || day.sleep_hours === undefined || day.sleep_hours === null) {
        throw new Error('Stress management method and sleep hours are required to complete a day');
      }

      const { error } = await supabase
        .from('fitness_log_days')
        .update({ 
          is_complete: true 
        })
        .eq('log_id', logId)
        .eq('day_date', date);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking day complete:', error);
      throw error;
    }
  },

  /**
   * Sign and complete the fitness log
   */
  async signLog(log_id: string, signed_name: string, signature_blob?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('fitness_logs')
        .update({
          status: 'completed',
          signed: true,
          signed_name,
          signed_at: new Date().toISOString(),
          signature_blob: signature_blob || null
        })
        .eq('id', log_id);

      if (error) throw error;
    } catch (error) {
      console.error('Error signing log:', error);
      throw error;
    }
  },

  /**
   * Get a specific log by ID
   */
  async getLog(log_id: string): Promise<FitnessLog | null> {
    try {
      const { data, error } = await supabase
        .from('fitness_logs')
        .select('*')
        .eq('id', log_id)
        .single();

      if (error) throw error;
      return data as FitnessLog;
    } catch (error) {
      console.error('Error getting log:', error);
      throw error;
    }
  },

  /**
   * Get log progress information
   */
  async getLogProgress(log_id: string): Promise<FitnessLogProgress | null> {
    try {
      const log = await this.getLog(log_id);
      if (!log) return null;

      const days = await this.getDays(log_id);
      const completedDays = days.filter(day => day.is_complete).length;

      // Calculate current day (1-based)
      const today = new Date().toISOString().slice(0, 10);
      const startDate = new Date(log.start_date);
      const currentDate = new Date(today);
      const daysDiff = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const currentDay = Math.max(1, Math.min(14, daysDiff + 1));

      return {
        totalDays: 14,
        completedDays,
        currentDay,
        startDate: log.start_date,
        endDate: log.end_date,
        isComplete: log.status === 'completed',
        isSigned: log.signed
      };
    } catch (error) {
      console.error('Error getting log progress:', error);
      throw error;
    }
  },

  /**
   * Validate day data
   */
  validateDayData(data: FitnessLogDayFormData): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    // Required fields for completion
    if (!data.stress_method?.trim()) {
      errors.stress_method = 'Please enter how you managed stress today (meditation, exercise, etc.)';
    }

    if (data.sleep_hours === undefined || data.sleep_hours === null || data.sleep_hours < 0) {
      errors.sleep_hours = 'Please enter how many hours you slept (0 or more)';
    }

    // Optional validation for other fields with helpful messages
    if (data.run_duration_min !== undefined && data.run_duration_min < 0) {
      errors.run_duration_min = 'Run duration cannot be negative';
    }

    if (data.run_distance_km !== undefined && data.run_distance_km < 0) {
      errors.run_distance_km = 'Run distance cannot be negative';
    }

    if (data.strength_duration_min !== undefined && data.strength_duration_min < 0) {
      errors.strength_duration_min = 'Strength training duration cannot be negative';
    }

    if (data.other_activity_duration_min !== undefined && data.other_activity_duration_min < 0) {
      errors.other_activity_duration_min = 'Activity duration cannot be negative';
    }

    // Additional helpful validations
    if (data.sleep_hours !== undefined && data.sleep_hours > 24) {
      errors.sleep_hours = 'Sleep hours cannot exceed 24 hours';
    }

    if (data.run_duration_min !== undefined && data.run_duration_min > 480) {
      errors.run_duration_min = 'Run duration seems unusually long (over 8 hours)';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * Check if user can start a new log (no active logs)
   */
  async canStartNewLog(): Promise<boolean> {
    try {
      const activeLog = await this.getActiveLog();
      return !activeLog;
    } catch (error) {
      console.error('Error checking if can start new log:', error);
      return false;
    }
  },

  /**
   * Get all logs for the current user (for history)
   */
  async getUserLogs(): Promise<FitnessLog[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('fitness_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FitnessLog[];
    } catch (error) {
      console.error('Error getting user logs:', error);
      throw error;
    }
  },

  /**
   * Delete a fitness log and all its associated days
   */
  async deleteLog(log_id: string): Promise<void> {
    try {
      // Delete all log days first (due to foreign key constraint)
      const { error: daysError } = await supabase
        .from('fitness_log_days')
        .delete()
        .eq('log_id', log_id);

      if (daysError) throw daysError;

      // Then delete the log
      const { error: logError } = await supabase
        .from('fitness_logs')
        .delete()
        .eq('id', log_id);

      if (logError) throw logError;
    } catch (error) {
      console.error('Error deleting log:', error);
      throw error;
    }
  },

  /**
   * Get the active log as OACP state for enhanced UI
   */
  async getActiveLogAsOacpState() {
    try {
      const log = await this.getActiveLog();
      if (!log) return null;

      const days = await this.getDays(log.id);
      return fitnessLogToOacpState(log, days);
    } catch (error) {
      console.error('Error getting active log as OACP state:', error);
      throw error;
    }
  },

  /**
   * Update log with OACP-specific fields
   */
  async updateLogOacpFields(logId: string, oacpData: Partial<ExtendedFitnessLog>): Promise<void> {
    try {
      const { error } = await supabase
        .from('fitness_logs')
        .update({
          full_name: oacpData.full_name,
          dob: oacpData.dob,
          address: oacpData.address,
          email: oacpData.email,
          phone: oacpData.phone,
          declaration_date_iso: oacpData.declaration_date_iso,
          applicant_signature_png_base64: oacpData.applicant_signature_png_base64,
          declaration_acknowledged: oacpData.declaration_acknowledged,
          verifier_enabled: oacpData.verifier_enabled,
          verifier_name: oacpData.verifier_name,
          verifier_title: oacpData.verifier_title,
          verifier_phone: oacpData.verifier_phone,
          verifier_date_iso: oacpData.verifier_date_iso,
          verifier_signature_png_base64: oacpData.verifier_signature_png_base64,
        })
        .eq('id', logId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating log OACP fields:', error);
      throw error;
    }
  },

  /**
   * Update day with OACP-specific fields
   */
  async updateDayOacpFields(logId: string, date: string, oacpData: Partial<ExtendedFitnessLogDay>): Promise<void> {
    try {
      const existingDay = await this.getDay(logId, date);
      
      if (existingDay) {
        // Update existing day
        const { error } = await supabase
          .from('fitness_log_days')
          .update({
            activity: oacpData.activity,
            duration_mins: oacpData.duration_mins,
            intensity: oacpData.intensity,
            comments: oacpData.comments,
            signer_initials: oacpData.signer_initials,
            signed: oacpData.signed,
          })
          .eq('log_id', logId)
          .eq('day_date', date);

        if (error) throw error;
      } else {
        // Create new day entry with OACP fields
        const { error } = await supabase
          .from('fitness_log_days')
          .insert({
            log_id: logId,
            day_date: date,
            activity: oacpData.activity,
            duration_mins: oacpData.duration_mins,
            intensity: oacpData.intensity,
            comments: oacpData.comments,
            signer_initials: oacpData.signer_initials,
            signed: oacpData.signed,
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating day OACP fields:', error);
      throw error;
    }
  }
};
