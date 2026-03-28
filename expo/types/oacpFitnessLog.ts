// types/oacpFitnessLog.ts
// Updated to match the JSON schema specification

export interface DayStrength {
  location?: string;      // "Fitness Center", "Home Gym"
  upperBody?: boolean;    // Upper Body checkbox
  lowerBody?: boolean;    // Lower Body checkbox
  description?: string;   // "Bench press 3x8, Rows 3x10, Shoulder press 3x8"
  duration?: string;      // "27", "45" (duration in minutes)
}

export interface DayRun { 
  distance?: string;      // "25", "6.0", "3.0"
  location?: string;      // "Stanley Park", "Seawall"
  duration?: string;      // "46", "31", "30"
  indoors?: boolean;      // Indoors checkbox
  outdoors?: boolean;     // Outdoors checkbox
}

export interface DayOther { 
  activity?: string;      // "Swimming", "Cycling" (Sport/Activity field)
  duration?: string;      // "20", "30"
  location?: string;      // "Community Pool", "Studio"
}

export interface DayStress { 
  method?: string;        // "Yoga", "Pilates"
  duration?: string;      // "20", "30"
  location?: string;      // "Home Studio", "Seawall"
}

export interface DaySleep { 
  hours?: string;         // "5.0", "7.0"
}

export interface DayBlock {
  run?: DayRun;
  strength?: DayStrength;
  other?: DayOther;
  stress?: DayStress;
  sleep?: DaySleep;
}

export interface Oacp14DayLog {
  candidateName: string;
  dateFrom?: string;  // YYYY-MM-DD
  dateTo?: string;    // YYYY-MM-DD
  days: Record<number, DayBlock>; // 1..14
  week1Signature?: string; // base64 PNG (optional if signature only on week 2)
  week2Signature?: string; // base64 PNG
  journal?: {
    strengthExercises?: string; // Large text area for exercises, reps, sets, weights
    strengthTime?: string;      // Time spent strength training
    runSpeedCircle?: ('Moderate walk'|'Fast walk'|'Moderate Jog'|'Fast Jog'|'Sprint')[]; // Can circle multiple
    runDynamics?: string;       // Dynamics of run (uphill, downhill, weights, etc.)
    runBreakDuration?: string;  // Duration of breaks during run
    correspondingDate?: string; // Corresponding date to fitness log (e.g., "Day 4")
    signature?: string;         // base64 PNG
    dateSigned?: string;        // YYYY-MM-DD
  };
}

// Legacy types for backward compatibility
export type Intensity = 'Low' | 'Moderate' | 'Vigorous';

export interface OacpDailyEntry {
  dateISO: string;             // "YYYY-MM-DD"
  activity: string;            // e.g., "Run + Mobility"
  durationMins: number;        // e.g., 30
  intensity: Intensity;        // Low / Moderate / Vigorous
  comments?: string;           // optional notes
  signerInitials?: string;     // optional initials for "Signature (Applicant or Supervisor)"
  signed?: boolean;            // fallback: show ✔ if true and no initials provided
  
  // Extended fields from existing fitness log structure for backward compatibility
  runDuration?: number;
  runDistance?: number;
  runLocation?: string;
  strengthDuration?: number;
  strengthLocation?: string;
  strengthSplit?: string;
  strengthDescription?: string;
  otherActivity?: string;
  otherDuration?: number;
  otherLocation?: string;
  stressMethod?: string;
  sleepHours?: number;
}

export interface OacpWeek {
  days: OacpDailyEntry[];      // always length 7, pad blanks when needed
}

export interface OacpVerifier {
  name: string;
  title?: string;
  phone?: string;
  dateISO?: string;
  signaturePngBase64?: string; // "data:image/png;base64,..."
}

export interface OacpLogState {
  // Personal (displayed on the form's top block)
  fullName: string;
  dob?: string;
  address?: string;
  email?: string;
  phone?: string;

  // Two-week log
  week1: OacpWeek;
  week2: OacpWeek;

  // Applicant declaration
  declarationDateISO: string;
  applicantSignaturePngBase64?: string;
  declarationAcknowledged?: boolean; // UI: "I declare the above is true"

  // Optional verifier block
  verifierEnabled?: boolean;
  verifier?: OacpVerifier;
}

// Extended FitnessLog interface to include OACP fields
export interface ExtendedFitnessLog {
  id: string;
  user_id: string;
  start_date: string; // ISO date
  end_date: string;   // ISO date
  status: 'in_progress' | 'completed';
  signed: boolean;
  signed_name?: string | null;
  signed_at?: string | null;
  signature_blob?: string | null; // base64 PNG
  created_at: string;
  updated_at: string;
  
  // OACP-specific fields
  full_name?: string;
  dob?: string;
  address?: string;
  email?: string;
  phone?: string;
  declaration_date_iso?: string;
  applicant_signature_png_base64?: string;
  declaration_acknowledged?: boolean;
  verifier_enabled?: boolean;
  verifier_name?: string;
  verifier_title?: string;
  verifier_phone?: string;
  verifier_date_iso?: string;
  verifier_signature_png_base64?: string;
}

// Extended FitnessLogDay interface to include OACP fields
export interface ExtendedFitnessLogDay {
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
  
  // OACP-specific fields
  activity?: string;
  duration_mins?: number;
  intensity?: Intensity;
  comments?: string;
  signer_initials?: string;
  signed?: boolean;
}

// Helper types for form handling with OACP fields
export interface OacpFitnessLogDayFormData {
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
  
  // OACP-specific fields
  activity?: string;
  duration_mins?: number;
  intensity?: Intensity;
  comments?: string;
  signer_initials?: string;
  signed?: boolean;
}
