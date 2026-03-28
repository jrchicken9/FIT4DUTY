/**
 * Date utilities for consistent date handling across the fitness log system
 */

import { format, addDays } from 'date-fns';

/**
 * Format a date string to ISO format (YYYY-MM-DD) consistently
 */
export function formatDateISO(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
  // Use UTC methods to avoid timezone issues
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Create a date object with consistent timezone handling
 */
export function createConsistentDate(dateString: string): Date {
  // Ensure consistent timezone by adding T00:00:00 and using UTC
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
}

/**
 * Calculate the day number within a 14-day fitness log period
 */
export function calculateDayNumber(entryDate: string, startDate: string): number {
  const entry = new Date(entryDate + 'T00:00:00');
  const start = new Date(startDate + 'T00:00:00');
  const diffTime = entry.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Validate that entry date is within the log period
  if (diffDays < 0 || diffDays >= 14) {
    console.warn(`Entry date ${entryDate} is outside log period (${startDate})`);
  }
  
  return Math.max(1, Math.min(14, diffDays + 1));
}

/**
 * Check if a date is within the fitness log period
 */
export function isDateInLogPeriod(date: string, startDate: string, endDate: string): boolean {
  const entry = new Date(date + 'T00:00:00');
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  
  return entry >= start && entry <= end;
}

/**
 * Get the next incomplete day date or today if within range
 */
export function getTargetDateForEntry(
  logStartDate: string,
  logEndDate: string,
  days: Array<{ day_date: string; is_complete: boolean }>,
  today?: Date
): string {
  const todayDate = today || new Date();
  const todayString = format(todayDate, 'yyyy-MM-dd');
  
  // Check if today is within the log period
  if (isDateInLogPeriod(todayString, logStartDate, logEndDate)) {
    return todayString;
  }
  
  // Find the first incomplete day
  const incompleteDay = days.find(day => !day.is_complete);
  if (incompleteDay) {
    return incompleteDay.day_date;
  }
  
  // All days complete, return the end date
  return logEndDate;
}

/**
 * Generate all 14 days for a fitness log with consistent date formatting
 */
export function generateFitnessLogDays(logId: string, startDate: string): Array<{ log_id: string; day_date: string }> {
  const startDateObj = new Date(startDate + 'T00:00:00');
  
  return Array.from({ length: 14 }).map((_, i) => {
    // Use date-fns for consistency with start screen
    const dayDate = addDays(startDateObj, i);
    return {
      log_id: logId,
      day_date: format(dayDate, 'yyyy-MM-dd')
    };
  });
}

/**
 * Check if a date is today
 */
export function isToday(dateString: string): boolean {
  const date = new Date(dateString + 'T00:00:00');
  const today = new Date();
  return format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
}

/**
 * Get date range for display (e.g., "Dec 01 - Dec 14")
 */
export function getDateRangeDisplay(startDate: string, endDate: string): string {
  const start = createConsistentDate(startDate);
  const end = createConsistentDate(endDate);
  
  const startFormatted = start.toLocaleDateString('en-US', { 
    month: 'short', 
    day: '2-digit',
    timeZone: 'UTC'
  });
  const endFormatted = end.toLocaleDateString('en-US', { 
    month: 'short', 
    day: '2-digit',
    timeZone: 'UTC'
  });
  
  return `${startFormatted} - ${endFormatted}`;
}

/**
 * Validate date string format
 */
export function isValidDateString(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    return false;
  }
  
  const date = createConsistentDate(dateString);
  return !isNaN(date.getTime());
}
