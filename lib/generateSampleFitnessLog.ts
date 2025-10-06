import { generateOACPFitnessLogHTML, generateLogSummary } from './pdfTemplates/oacpFitnessLog';
import type { FitnessLog, FitnessLogDay, FitnessLogExportOptions } from '@/types/fitness-log';
import { addDays, format } from 'date-fns';

/**
 * Generate sample fitness log data for demonstration
 */
export function generateSampleFitnessLogData(): {
  log: FitnessLog;
  days: FitnessLogDay[];
  userInfo: { name: string; email: string };
  exportOptions: FitnessLogExportOptions;
} {
  const startDate = '2024-01-15';
  const endDate = format(addDays(new Date(startDate), 13), 'yyyy-MM-dd');
  
  // Sample user info
  const userInfo = {
    name: 'John Smith',
    email: 'john.smith@email.com'
  };

  // Sample fitness log
  const log: FitnessLog = {
    id: 'sample-log-123',
    user_id: 'sample-user-456',
    start_date: startDate,
    end_date: endDate,
    status: 'completed',
    signed: true,
    signed_at: '2024-01-29T14:30:00Z',
    signed_name: 'John Smith',
    signature_blob: null, // Would contain base64 signature data
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-01-29T14:30:00Z'
  };

  // Sample daily entries - realistic fitness activities
  const days: FitnessLogDay[] = [
    // Day 1 - Monday
    {
      id: 'day-1',
      log_id: log.id,
      day_date: '2024-01-15',
      day_number: 1,
      run_duration_min: 30,
      run_distance_km: 5.2,
      run_location: 'Central Park',
      strength_duration_min: 45,
      strength_env: 'Gym',
      strength_split: 'Upper Body',
      strength_description: 'Bench press, rows, shoulder press, bicep curls',
      other_activity_type: 'Yoga',
      other_activity_duration_min: 20,
      other_activity_location: 'Home',
      stress_method: 'Meditation',
      sleep_hours: 7.5,
      notes: 'Great start to the week!',
      is_complete: true,
      created_at: '2024-01-15T20:00:00Z',
      updated_at: '2024-01-15T20:00:00Z'
    },
    // Day 2 - Tuesday
    {
      id: 'day-2',
      log_id: log.id,
      day_date: '2024-01-16',
      day_number: 2,
      run_duration_min: null,
      run_distance_km: null,
      run_location: null,
      strength_duration_min: 60,
      strength_env: 'Gym',
      strength_split: 'Lower Body',
      strength_description: 'Squats, deadlifts, lunges, calf raises',
      other_activity_type: 'Swimming',
      other_activity_duration_min: 30,
      other_activity_location: 'Community Pool',
      stress_method: 'Deep breathing exercises',
      sleep_hours: 8.0,
      notes: 'Legs feeling strong after workout',
      is_complete: true,
      created_at: '2024-01-16T19:30:00Z',
      updated_at: '2024-01-16T19:30:00Z'
    },
    // Day 3 - Wednesday
    {
      id: 'day-3',
      log_id: log.id,
      day_date: '2024-01-17',
      day_number: 3,
      run_duration_min: 25,
      run_distance_km: 4.1,
      run_location: 'Neighborhood',
      strength_duration_min: null,
      strength_env: null,
      strength_split: null,
      strength_description: null,
      other_activity_type: 'Basketball',
      other_activity_duration_min: 45,
      other_activity_location: 'Local Court',
      stress_method: 'Reading',
      sleep_hours: 7.0,
      notes: 'Quick run before work',
      is_complete: true,
      created_at: '2024-01-17T21:00:00Z',
      updated_at: '2024-01-17T21:00:00Z'
    },
    // Day 4 - Thursday
    {
      id: 'day-4',
      log_id: log.id,
      day_date: '2024-01-18',
      day_number: 4,
      run_duration_min: null,
      run_distance_km: null,
      run_location: null,
      strength_duration_min: 50,
      strength_env: 'Gym',
      strength_split: 'Full Body',
      strength_description: 'Circuit training with weights',
      other_activity_type: 'Walking',
      other_activity_duration_min: 20,
      other_activity_location: 'Office break',
      stress_method: 'Music therapy',
      sleep_hours: 6.5,
      notes: 'Busy day at work',
      is_complete: true,
      created_at: '2024-01-18T20:15:00Z',
      updated_at: '2024-01-18T20:15:00Z'
    },
    // Day 5 - Friday
    {
      id: 'day-5',
      log_id: log.id,
      day_date: '2024-01-19',
      day_number: 5,
      run_duration_min: 35,
      run_distance_km: 6.0,
      run_location: 'Trail',
      strength_duration_min: null,
      strength_env: null,
      strength_split: null,
      strength_description: null,
      other_activity_type: 'Hiking',
      other_activity_duration_min: 90,
      other_activity_location: 'Mountain Trail',
      stress_method: 'Nature walk',
      sleep_hours: 8.5,
      notes: 'Weekend hike with friends',
      is_complete: true,
      created_at: '2024-01-19T18:00:00Z',
      updated_at: '2024-01-19T18:00:00Z'
    },
    // Day 6 - Saturday
    {
      id: 'day-6',
      log_id: log.id,
      day_date: '2024-01-20',
      day_number: 6,
      run_duration_min: null,
      run_distance_km: null,
      run_location: null,
      strength_duration_min: 75,
      strength_env: 'Home',
      strength_split: 'Upper Body',
      strength_description: 'Push-ups, pull-ups, dumbbell exercises',
      other_activity_type: 'Cycling',
      other_activity_duration_min: 60,
      other_activity_location: 'City bike path',
      stress_method: 'Journaling',
      sleep_hours: 9.0,
      notes: 'Rest day from running',
      is_complete: true,
      created_at: '2024-01-20T16:30:00Z',
      updated_at: '2024-01-20T16:30:00Z'
    },
    // Day 7 - Sunday
    {
      id: 'day-7',
      log_id: log.id,
      day_date: '2024-01-21',
      day_number: 7,
      run_duration_min: 40,
      run_distance_km: 7.5,
      run_location: 'Beach',
      strength_duration_min: null,
      strength_env: null,
      strength_split: null,
      strength_description: null,
      other_activity_type: 'Beach volleyball',
      other_activity_duration_min: 45,
      other_activity_location: 'Beach court',
      stress_method: 'Beach meditation',
      sleep_hours: 8.0,
      notes: 'Long run along the coast',
      is_complete: true,
      created_at: '2024-01-21T17:45:00Z',
      updated_at: '2024-01-21T17:45:00Z'
    },
    // Day 8 - Monday
    {
      id: 'day-8',
      log_id: log.id,
      day_date: '2024-01-22',
      day_number: 8,
      run_duration_min: 28,
      run_distance_km: 4.8,
      run_location: 'Track',
      strength_duration_min: 55,
      strength_env: 'Gym',
      strength_split: 'Lower Body',
      strength_description: 'Squats, leg press, hamstring curls',
      other_activity_type: 'Stretching',
      other_activity_duration_min: 15,
      other_activity_location: 'Gym',
      stress_method: 'Progressive muscle relaxation',
      sleep_hours: 7.5,
      notes: 'Track workout for speed',
      is_complete: true,
      created_at: '2024-01-22T20:30:00Z',
      updated_at: '2024-01-22T20:30:00Z'
    },
    // Day 9 - Tuesday
    {
      id: 'day-9',
      log_id: log.id,
      day_date: '2024-01-23',
      day_number: 9,
      run_duration_min: null,
      run_distance_km: null,
      run_location: null,
      strength_duration_min: 65,
      strength_env: 'Gym',
      strength_split: 'Upper Body',
      strength_description: 'Chest, back, shoulders, arms',
      other_activity_type: 'Pilates',
      other_activity_duration_min: 30,
      other_activity_location: 'Studio',
      stress_method: 'Guided meditation',
      sleep_hours: 7.0,
      notes: 'Focus on core strength',
      is_complete: true,
      created_at: '2024-01-23T19:15:00Z',
      updated_at: '2024-01-23T19:15:00Z'
    },
    // Day 10 - Wednesday
    {
      id: 'day-10',
      log_id: log.id,
      day_date: '2024-01-24',
      day_number: 10,
      run_duration_min: 32,
      run_distance_km: 5.5,
      run_location: 'Park',
      strength_duration_min: null,
      strength_env: null,
      strength_split: null,
      strength_description: null,
      other_activity_type: 'Rock climbing',
      other_activity_duration_min: 75,
      other_activity_location: 'Indoor gym',
      stress_method: 'Breathing exercises',
      sleep_hours: 8.5,
      notes: 'Challenging climbing session',
      is_complete: true,
      created_at: '2024-01-24T21:00:00Z',
      updated_at: '2024-01-24T21:00:00Z'
    },
    // Day 11 - Thursday
    {
      id: 'day-11',
      log_id: log.id,
      day_date: '2024-01-25',
      day_number: 11,
      run_duration_min: null,
      run_distance_km: null,
      run_location: null,
      strength_duration_min: 70,
      strength_env: 'Home',
      strength_split: 'Full Body',
      strength_description: 'Bodyweight exercises, resistance bands',
      other_activity_type: 'Dancing',
      other_activity_duration_min: 40,
      other_activity_location: 'Home',
      stress_method: 'Dance therapy',
      sleep_hours: 7.5,
      notes: 'Fun workout at home',
      is_complete: true,
      created_at: '2024-01-25T20:45:00Z',
      updated_at: '2024-01-25T20:45:00Z'
    },
    // Day 12 - Friday
    {
      id: 'day-12',
      log_id: log.id,
      day_date: '2024-01-26',
      day_number: 12,
      run_duration_min: 38,
      run_distance_km: 6.8,
      run_location: 'Forest trail',
      strength_duration_min: null,
      strength_env: null,
      strength_split: null,
      strength_description: null,
      other_activity_type: 'Kayaking',
      other_activity_duration_min: 120,
      other_activity_location: 'Lake',
      stress_method: 'Water meditation',
      sleep_hours: 9.0,
      notes: 'Weekend adventure activities',
      is_complete: true,
      created_at: '2024-01-26T17:30:00Z',
      updated_at: '2024-01-26T17:30:00Z'
    },
    // Day 13 - Saturday
    {
      id: 'day-13',
      log_id: log.id,
      day_date: '2024-01-27',
      day_number: 13,
      run_duration_min: null,
      run_distance_km: null,
      run_location: null,
      strength_duration_min: 80,
      strength_env: 'Gym',
      strength_split: 'Lower Body',
      strength_description: 'Heavy squats, deadlifts, leg accessories',
      other_activity_type: 'Yoga',
      other_activity_duration_min: 45,
      other_activity_location: 'Studio',
      stress_method: 'Yoga meditation',
      sleep_hours: 8.5,
      notes: 'Intense leg day',
      is_complete: true,
      created_at: '2024-01-27T16:00:00Z',
      updated_at: '2024-01-27T16:00:00Z'
    },
    // Day 14 - Sunday
    {
      id: 'day-14',
      log_id: log.id,
      day_date: '2024-01-28',
      day_number: 14,
      run_duration_min: 45,
      run_distance_km: 8.2,
      run_location: 'Marathon route',
      strength_duration_min: null,
      strength_env: null,
      strength_split: null,
      strength_description: null,
      other_activity_type: 'Cool down walk',
      other_activity_duration_min: 20,
      other_activity_location: 'Same route',
      stress_method: 'Reflection and gratitude',
      sleep_hours: 8.0,
      notes: 'Final day - longest run of the period!',
      is_complete: true,
      created_at: '2024-01-28T18:15:00Z',
      updated_at: '2024-01-28T18:15:00Z'
    }
  ];

  const exportOptions: FitnessLogExportOptions = {
    includeWatermark: false,
    includeSummary: true,
    format: 'pdf'
  };

  return {
    log,
    days,
    userInfo,
    exportOptions
  };
}

/**
 * Generate and save sample PDF HTML for preview
 */
export async function generateSamplePDFPreview(): Promise<string> {
  try {
    const sampleData = generateSampleFitnessLogData();
    const html = generateOACPFitnessLogHTML(sampleData);
    
    // Save HTML to file for preview
    const fs = require('fs');
    const path = require('path');
    
    const outputPath = path.join(process.cwd(), 'sample_fitness_log.html');
    fs.writeFileSync(outputPath, html);
    
    console.log('Sample PDF HTML generated and saved to:', outputPath);
    console.log('Open this file in a browser to preview the PDF layout');
    
    return html;
  } catch (error) {
    console.error('Error generating sample PDF:', error);
    throw error;
  }
}

/**
 * Generate summary statistics for the sample data
 */
export function generateSampleSummary() {
  const sampleData = generateSampleFitnessLogData();
  const summary = generateLogSummary(sampleData.days);
  
  console.log('=== Sample Fitness Log Summary ===');
  console.log(`Completed Days: ${summary.completedDays}/14`);
  console.log(`Total Run Time: ${summary.totalRunMinutes} minutes`);
  console.log(`Total Run Distance: ${summary.totalRunDistance.toFixed(1)} km`);
  console.log(`Total Strength Training: ${summary.totalStrengthMinutes} minutes`);
  console.log(`Total Other Activities: ${summary.totalOtherActivityMinutes} minutes`);
  console.log(`Average Sleep: ${summary.averageSleepHours.toFixed(1)} hours`);
  console.log(`Stress Management Methods: ${summary.stressMethods.join(', ')}`);
  
  return summary;
}

/**
 * Display sample data in a readable format
 */
export function displaySampleData() {
  const sampleData = generateSampleFitnessLogData();
  
  console.log('=== Sample Fitness Log Data ===');
  console.log(`Log ID: ${sampleData.log.id}`);
  console.log(`Period: ${sampleData.log.start_date} to ${sampleData.log.end_date}`);
  console.log(`Status: ${sampleData.log.status}`);
  console.log(`Signed: ${sampleData.log.signed ? 'Yes' : 'No'}`);
  console.log(`Signed by: ${sampleData.log.signed_name || 'N/A'}`);
  console.log(`Signed at: ${sampleData.log.signed_at || 'N/A'}`);
  
  console.log('\n=== Sample Daily Entries ===');
  sampleData.days.forEach((day, index) => {
    console.log(`\nDay ${day.day_number} (${day.day_date}):`);
    console.log(`  Run: ${day.run_duration_min ? `${day.run_duration_min}min, ${day.run_distance_km}km` : 'No run'}`);
    console.log(`  Strength: ${day.strength_duration_min ? `${day.strength_duration_min}min - ${day.strength_description}` : 'No strength training'}`);
    console.log(`  Other: ${day.other_activity_type ? `${day.other_activity_type} - ${day.other_activity_duration_min}min` : 'No other activity'}`);
    console.log(`  Stress: ${day.stress_method}`);
    console.log(`  Sleep: ${day.sleep_hours} hours`);
    console.log(`  Complete: ${day.is_complete ? 'Yes' : 'No'}`);
  });
  
  return sampleData;
}


