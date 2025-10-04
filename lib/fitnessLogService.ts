import { supabase } from '@/lib/supabase';
import type { FitnessLog, FitnessLogDay, FitnessLogDayFormData, FitnessLogProgress } from '@/types/fitness-log';

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

      // Calculate end date (start + 13 days)
      const end = new Date(start_date);
      end.setDate(end.getDate() + 13);
      const end_date = end.toISOString().slice(0, 10);

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

      // Seed 14 days
      const days = Array.from({ length: 14 }).map((_, i) => {
        const d = new Date(start_date);
        d.setDate(d.getDate() + i);
        return { 
          log_id: log.id, 
          day_date: d.toISOString().slice(0, 10) 
        };
      });

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
  async updateDay(day: Partial<FitnessLogDay> & { id: string }): Promise<void> {
    try {
      const { error } = await supabase
        .from('fitness_log_days')
        .update(day)
        .eq('id', day.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating day:', error);
      throw error;
    }
  },

  /**
   * Mark a day as complete (requires stress_method and sleep_hours)
   */
  async markDayComplete(id: string, data: FitnessLogDayFormData): Promise<void> {
    try {
      // Validate required fields
      if (!data.stress_method || !data.sleep_hours) {
        throw new Error('Stress management method and sleep hours are required to complete a day');
      }

      const { error } = await supabase
        .from('fitness_log_days')
        .update({ 
          ...data,
          is_complete: true 
        })
        .eq('id', id);

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
      errors.stress_method = 'Stress management method is required';
    }

    if (data.sleep_hours === undefined || data.sleep_hours === null || data.sleep_hours < 0) {
      errors.sleep_hours = 'Sleep hours must be a valid number (0 or greater)';
    }

    // Optional validation for other fields
    if (data.run_duration_min !== undefined && data.run_duration_min < 0) {
      errors.run_duration_min = 'Run duration must be 0 or greater';
    }

    if (data.run_distance_km !== undefined && data.run_distance_km < 0) {
      errors.run_distance_km = 'Run distance must be 0 or greater';
    }

    if (data.strength_duration_min !== undefined && data.strength_duration_min < 0) {
      errors.strength_duration_min = 'Strength duration must be 0 or greater';
    }

    if (data.other_activity_duration_min !== undefined && data.other_activity_duration_min < 0) {
      errors.other_activity_duration_min = 'Activity duration must be 0 or greater';
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
  }
};
