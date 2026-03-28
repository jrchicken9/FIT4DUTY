export type FitnessLogStatus = 'in_progress' | 'completed';

export interface FitnessLog {
  id: string;
  user_id: string;
  start_date: string; // ISO date
  end_date: string;   // ISO date
  status: FitnessLogStatus;
  signed: boolean;
  signed_name?: string | null;
  signed_at?: string | null;
  signature_blob?: string | null; // base64 PNG
  created_at: string;
  updated_at: string;
}

export interface FitnessLogDay {
  id: string;
  log_id: string;
  day_date: string; // ISO date
  run_duration_min?: number | null;
  run_distance_km?: number | null;
  run_location?: string | null;
  strength_duration_min?: number | null;
  strength_env?: 'indoor' | 'outdoor' | null;
  strength_split?: 'upper' | 'lower' | 'full' | 'other' | null;
  strength_description?: string | null;
  other_activity_type?: string | null;
  other_activity_duration_min?: number | null;
  other_activity_location?: string | null;
  stress_method?: string | null; // REQUIRED for completion
  sleep_hours?: number | null;   // REQUIRED for completion
  notes?: string | null;
  is_complete: boolean;
  created_at: string;
  updated_at: string;
}

// Helper types for form handling
export interface FitnessLogDayFormData {
  run_duration_min?: number;
  run_distance_km?: number;
  run_location?: string;
  strength_duration_min?: number;
  strength_env?: 'indoor' | 'outdoor';
  strength_split?: 'upper' | 'lower' | 'full' | 'other';
  strength_description?: string;
  other_activity_type?: string;
  other_activity_duration_min?: number;
  other_activity_location?: string;
  stress_method?: string;
  sleep_hours?: number;
  notes?: string;
}

// Validation result type
export interface FitnessLogValidationResult {
  isValid: boolean;
  errors: {
    stress_method?: string;
    sleep_hours?: string;
    [key: string]: string | undefined;
  };
}

// Progress tracking type
export interface FitnessLogProgress {
  totalDays: number;
  completedDays: number;
  currentDay: number;
  startDate: string;
  endDate: string;
  isComplete: boolean;
  isSigned: boolean;
}

// PDF export options
export interface FitnessLogExportOptions {
  includeSignature: boolean;
  includeWatermark: boolean;
  format: 'pdf';
}
