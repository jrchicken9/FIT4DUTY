import { supabase } from './supabase';

export interface FitnessLogAnalytics {
  totalLogsCreated: number;
  totalDaysCompleted: number;
  averageCompletionRate: number;
  mostCommonStressMethods: string[];
  averageSleepHours: number;
  averageRunDistance: number;
  averageStrengthDuration: number;
  completionTimeDistribution: {
    completedInTime: number;
    completedLate: number;
    abandoned: number;
  };
}

export interface UserFitnessLogStats {
  logsCreated: number;
  daysCompleted: number;
  currentStreak: number;
  longestStreak: number;
  averageSleepHours: number;
  favoriteStressMethod: string;
  totalRunDistance: number;
  totalStrengthMinutes: number;
}

/**
 * Track fitness log creation
 */
export async function trackLogCreated(logId: string, userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('fitness_log_analytics')
      .insert({
        event_type: 'log_created',
        log_id: logId,
        user_id: userId,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      });

    if (error) {
      console.error('Error tracking log creation:', error);
    }
  } catch (error) {
    console.error('Error tracking log creation:', error);
  }
}

/**
 * Track day completion
 */
export async function trackDayCompleted(
  logId: string,
  userId: string,
  dayNumber: number,
  completionData: {
    sleepHours: number;
    stressMethod: string;
    runDistance?: number;
    strengthDuration?: number;
  }
): Promise<void> {
  try {
    const { error } = await supabase
      .from('fitness_log_analytics')
      .insert({
        event_type: 'day_completed',
        log_id: logId,
        user_id: userId,
        metadata: {
          day_number: dayNumber,
          completion_data: completionData,
          timestamp: new Date().toISOString(),
        },
      });

    if (error) {
      console.error('Error tracking day completion:', error);
    }
  } catch (error) {
    console.error('Error tracking day completion:', error);
  }
}

/**
 * Track log completion
 */
export async function trackLogCompleted(logId: string, userId: string, completionTime: number): Promise<void> {
  try {
    const { error } = await supabase
      .from('fitness_log_analytics')
      .insert({
        event_type: 'log_completed',
        log_id: logId,
        user_id: userId,
        metadata: {
          completion_time_days: completionTime,
          timestamp: new Date().toISOString(),
        },
      });

    if (error) {
      console.error('Error tracking log completion:', error);
    }
  } catch (error) {
    console.error('Error tracking log completion:', error);
  }
}

/**
 * Track log abandonment
 */
export async function trackLogAbandoned(logId: string, userId: string, daysCompleted: number): Promise<void> {
  try {
    const { error } = await supabase
      .from('fitness_log_analytics')
      .insert({
        event_type: 'log_abandoned',
        log_id: logId,
        user_id: userId,
        metadata: {
          days_completed: daysCompleted,
          timestamp: new Date().toISOString(),
        },
      });

    if (error) {
      console.error('Error tracking log abandonment:', error);
    }
  } catch (error) {
    console.error('Error tracking log abandonment:', error);
  }
}

/**
 * Track PDF generation
 */
export async function trackPDFGenerated(logId: string, userId: string, isSigned: boolean): Promise<void> {
  try {
    const { error } = await supabase
      .from('fitness_log_analytics')
      .insert({
        event_type: 'pdf_generated',
        log_id: logId,
        user_id: userId,
        metadata: {
          is_signed: isSigned,
          timestamp: new Date().toISOString(),
        },
      });

    if (error) {
      console.error('Error tracking PDF generation:', error);
    }
  } catch (error) {
    console.error('Error tracking PDF generation:', error);
  }
}

/**
 * Get user's fitness log statistics
 */
export async function getUserFitnessLogStats(userId: string): Promise<UserFitnessLogStats> {
  try {
    // Get user's logs
    const { data: logs, error: logsError } = await supabase
      .from('fitness_logs')
      .select('id, start_date, end_date, status, signed')
      .eq('user_id', userId);

    if (logsError) throw logsError;

    // Get user's completed days
    const { data: days, error: daysError } = await supabase
      .from('fitness_log_days')
      .select('log_id, is_complete, sleep_hours, stress_method, run_distance_km, strength_duration_min')
      .eq('log_id', logs?.map(log => log.id) || []);

    if (daysError) throw daysError;

    const completedDays = days?.filter(day => day.is_complete) || [];
    
    // Calculate statistics
    const stats: UserFitnessLogStats = {
      logsCreated: logs?.length || 0,
      daysCompleted: completedDays.length,
      currentStreak: calculateCurrentStreak(logs || []),
      longestStreak: calculateLongestStreak(logs || []),
      averageSleepHours: calculateAverageSleepHours(completedDays),
      favoriteStressMethod: getMostCommonStressMethod(completedDays),
      totalRunDistance: completedDays.reduce((sum, day) => sum + (day.run_distance_km || 0), 0),
      totalStrengthMinutes: completedDays.reduce((sum, day) => sum + (day.strength_duration_min || 0), 0),
    };

    return stats;
  } catch (error) {
    console.error('Error getting user fitness log stats:', error);
    return {
      logsCreated: 0,
      daysCompleted: 0,
      currentStreak: 0,
      longestStreak: 0,
      averageSleepHours: 0,
      favoriteStressMethod: 'None',
      totalRunDistance: 0,
      totalStrengthMinutes: 0,
    };
  }
}

/**
 * Get overall fitness log analytics (admin only)
 */
export async function getFitnessLogAnalytics(): Promise<FitnessLogAnalytics> {
  try {
    // This would typically be restricted to admin users
    const { data: logs, error: logsError } = await supabase
      .from('fitness_logs')
      .select('id, status, start_date, end_date');

    if (logsError) throw logsError;

    const { data: days, error: daysError } = await supabase
      .from('fitness_log_days')
      .select('log_id, is_complete, sleep_hours, stress_method, run_distance_km, strength_duration_min');

    if (daysError) throw daysError;

    const completedDays = days?.filter(day => day.is_complete) || [];
    const totalLogs = logs?.length || 0;
    const completedLogs = logs?.filter(log => log.status === 'completed').length || 0;

    const analytics: FitnessLogAnalytics = {
      totalLogsCreated: totalLogs,
      totalDaysCompleted: completedDays.length,
      averageCompletionRate: totalLogs > 0 ? (completedLogs / totalLogs) * 100 : 0,
      mostCommonStressMethods: getMostCommonStressMethods(completedDays),
      averageSleepHours: calculateAverageSleepHours(completedDays),
      averageRunDistance: calculateAverageRunDistance(completedDays),
      averageStrengthDuration: calculateAverageStrengthDuration(completedDays),
      completionTimeDistribution: calculateCompletionTimeDistribution(logs || []),
    };

    return analytics;
  } catch (error) {
    console.error('Error getting fitness log analytics:', error);
    throw error;
  }
}

// Helper functions
function calculateCurrentStreak(logs: any[]): number {
  // Implementation would calculate current completion streak
  return 0;
}

function calculateLongestStreak(logs: any[]): number {
  // Implementation would calculate longest completion streak
  return 0;
}

function calculateAverageSleepHours(days: any[]): number {
  if (days.length === 0) return 0;
  const totalSleep = days.reduce((sum, day) => sum + (day.sleep_hours || 0), 0);
  return totalSleep / days.length;
}

function getMostCommonStressMethod(days: any[]): string {
  if (days.length === 0) return 'None';
  const stressMethods = days.map(day => day.stress_method).filter(Boolean);
  const counts = stressMethods.reduce((acc, method) => {
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(counts).reduce((a, b) => counts[a[0]] > counts[b[0]] ? a : b)[0];
}

function getMostCommonStressMethods(days: any[]): string[] {
  if (days.length === 0) return [];
  const stressMethods = days.map(day => day.stress_method).filter(Boolean);
  const counts = stressMethods.reduce((acc, method) => {
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(counts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([method]) => method);
}

function calculateAverageRunDistance(days: any[]): number {
  if (days.length === 0) return 0;
  const totalDistance = days.reduce((sum, day) => sum + (day.run_distance_km || 0), 0);
  return totalDistance / days.length;
}

function calculateAverageStrengthDuration(days: any[]): number {
  if (days.length === 0) return 0;
  const totalDuration = days.reduce((sum, day) => sum + (day.strength_duration_min || 0), 0);
  return totalDuration / days.length;
}

function calculateCompletionTimeDistribution(logs: any[]): {
  completedInTime: number;
  completedLate: number;
  abandoned: number;
} {
  const completed = logs.filter(log => log.status === 'completed').length;
  const inProgress = logs.filter(log => log.status === 'in_progress').length;
  
  return {
    completedInTime: completed, // Simplified - would need more logic for "in time" vs "late"
    completedLate: 0,
    abandoned: inProgress,
  };
}
