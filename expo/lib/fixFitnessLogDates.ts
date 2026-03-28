import { supabase } from './supabase';
import { formatDateISO } from './dateUtils';
import { format, addDays } from 'date-fns';

/**
 * Utility function to fix existing fitness log dates that may have timezone issues
 * This should be run once to fix existing logs in the database
 */
export async function fixExistingFitnessLogDates(): Promise<void> {
  try {
    console.log('Starting fitness log date fix...');
    
    // Get all fitness logs
    const { data: logs, error: logsError } = await supabase
      .from('fitness_logs')
      .select('id, start_date, end_date');
    
    if (logsError) {
      throw logsError;
    }
    
    if (!logs || logs.length === 0) {
      console.log('No fitness logs found to fix');
      return;
    }
    
    console.log(`Found ${logs.length} fitness logs to check`);
    
    for (const log of logs) {
      console.log(`Checking log ${log.id} with start_date: ${log.start_date}`);
      
      // Get all days for this log
      const { data: days, error: daysError } = await supabase
        .from('fitness_log_days')
        .select('id, day_date')
        .eq('log_id', log.id)
        .order('day_date');
      
      if (daysError) {
        console.error(`Error getting days for log ${log.id}:`, daysError);
        continue;
      }
      
      if (!days || days.length === 0) {
        console.log(`No days found for log ${log.id}`);
        continue;
      }
      
      console.log(`Found ${days.length} days for log ${log.id}`);
      
      // Check if all days match the expected dates
      const { generateFitnessLogDays } = await import('./dateUtils');
      const expectedDays = generateFitnessLogDays(log.id, log.start_date);
      const expectedDates = expectedDays.map(day => day.day_date);
      const actualDates = days.map(day => day.day_date);
      
      const hasIssues = !actualDates.every((date, index) => date === expectedDates[index]);
      
      if (hasIssues) {
        console.log(`Mismatch found for log ${log.id}:`);
        console.log(`  Start date: ${log.start_date}`);
        console.log(`  Expected dates: ${expectedDates.join(', ')}`);
        console.log(`  Actual dates: ${actualDates.join(', ')}`);
        
        // Delete existing days
        const { error: deleteError } = await supabase
          .from('fitness_log_days')
          .delete()
          .eq('log_id', log.id);
        
        if (deleteError) {
          console.error(`Error deleting days for log ${log.id}:`, deleteError);
          continue;
        }
        
        // Regenerate days with correct dates
        const newDays = generateFitnessLogDays(log.id, log.start_date);
        
        // Also fix the end_date if it's incorrect
        const startDateObj = new Date(log.start_date + 'T00:00:00');
        const correctEndDate = addDays(startDateObj, 13);
        const correctEndDateString = format(correctEndDate, 'yyyy-MM-dd');
        
        if (log.end_date !== correctEndDateString) {
          console.log(`Fixing end_date for log ${log.id}: ${log.end_date} -> ${correctEndDateString}`);
          
          const { error: updateError } = await supabase
            .from('fitness_logs')
            .update({ end_date: correctEndDateString })
            .eq('id', log.id);
          
          if (updateError) {
            console.error(`Error updating end_date for log ${log.id}:`, updateError);
          }
        }
        
        const { error: insertError } = await supabase
          .from('fitness_log_days')
          .insert(newDays);
        
        if (insertError) {
          console.error(`Error inserting new days for log ${log.id}:`, insertError);
          continue;
        }
        
        console.log(`Fixed log ${log.id} - regenerated ${newDays.length} days`);
      } else {
        console.log(`Log ${log.id} dates are correct`);
      }
    }
    
    console.log('Fitness log date fix completed');
  } catch (error) {
    console.error('Error fixing fitness log dates:', error);
    throw error;
  }
}

/**
 * Check if a fitness log has date issues
 */
export async function checkFitnessLogDates(logId: string): Promise<{
  hasIssues: boolean;
  startDate: string;
  firstDayDate: string;
  daysCount: number;
  expectedDates: string[];
  actualDates: string[];
}> {
  try {
    // Get the log
    const { data: log, error: logError } = await supabase
      .from('fitness_logs')
      .select('start_date')
      .eq('id', logId)
      .single();
    
    if (logError || !log) {
      throw logError || new Error('Log not found');
    }
    
    // Get all days
    const { data: days, error: daysError } = await supabase
      .from('fitness_log_days')
      .select('day_date')
      .eq('log_id', logId)
      .order('day_date');
    
    if (daysError || !days || days.length === 0) {
      throw daysError || new Error('No days found');
    }
    
    const actualDates = days.map(day => day.day_date);
    const firstDayDate = actualDates[0];
    
    // Generate expected dates using the same logic as the database
    const { generateFitnessLogDays } = await import('./dateUtils');
    const expectedDays = generateFitnessLogDays(logId, log.start_date);
    const expectedDates = expectedDays.map(day => day.day_date);
    
    // Check if dates match
    const hasIssues = !actualDates.every((date, index) => date === expectedDates[index]);
    
    return {
      hasIssues,
      startDate: log.start_date,
      firstDayDate,
      daysCount: actualDates.length,
      expectedDates,
      actualDates
    };
  } catch (error) {
    console.error('Error checking fitness log dates:', error);
    throw error;
  }
}
