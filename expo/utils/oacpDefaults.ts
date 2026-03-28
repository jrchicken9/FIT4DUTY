// utils/oacpDefaults.ts
import { OacpDailyEntry, OacpWeek, OacpLogState } from '@/types/oacpFitnessLog';

export const blankDay = (): OacpDailyEntry => ({
  dateISO: '',
  activity: '',
  durationMins: 0,
  intensity: 'Moderate',
  comments: '',
  signerInitials: '',
  signed: false,
  runDuration: 0,
  runDistance: 0,
  runLocation: '',
  strengthDuration: 0,
  strengthLocation: '',
  strengthSplit: '',
  strengthDescription: '',
  otherActivity: '',
  otherDuration: 0,
  otherLocation: '',
  stressMethod: '',
  sleepHours: 0,
});

export const ensureWeek7 = (w?: OacpWeek): OacpWeek => ({
  days: Array.from({ length: 7 }, (_, i) => w?.days?.[i] ?? blankDay()),
});

export const withOacpDefaults = (s: Partial<OacpLogState>): OacpLogState => ({
  fullName: s.fullName ?? '',
  dob: s.dob ?? '',
  address: s.address ?? '',
  email: s.email ?? '',
  phone: s.phone ?? '',
  week1: ensureWeek7(s.week1),
  week2: ensureWeek7(s.week2),
  declarationDateISO: s.declarationDateISO ?? new Date().toISOString().slice(0,10),
  applicantSignaturePngBase64: s.applicantSignaturePngBase64,
  declarationAcknowledged: s.declarationAcknowledged ?? false,
  verifierEnabled: s.verifierEnabled ?? false,
  verifier: s.verifierEnabled ? s.verifier : undefined,
});

// Helper to convert existing FitnessLogDay to OacpDailyEntry
export const fitnessLogDayToOacpEntry = (day: any, dateISO: string): OacpDailyEntry => ({
  dateISO,
  activity: day.other_activity_type || 'Run + Strength Training',
  durationMins: (day.run_duration_min || 0) + (day.strength_duration_min || 0) + (day.other_activity_duration_min || 0),
  intensity: 'Moderate', // default
  comments: day.notes || '',
  signerInitials: '',
  signed: false,
  runDuration: day.run_duration_min || 0,
  runDistance: day.run_distance_km || 0,
  runLocation: day.run_location || '',
  strengthDuration: day.strength_duration_min || 0,
  strengthLocation: day.strength_env === 'indoor' ? 'Indoor' : day.strength_env === 'outdoor' ? 'Outdoor' : '',
  strengthSplit: day.strength_split || '',
  strengthDescription: day.strength_description || '',
  otherActivity: day.other_activity_type || '',
  otherDuration: day.other_activity_duration_min || 0,
  otherLocation: day.other_activity_location || '',
  stressMethod: day.stress_method || '',
  sleepHours: day.sleep_hours || 0,
});

// Helper to convert existing FitnessLog to OacpLogState
export const fitnessLogToOacpState = (log: any, days: any[]): OacpLogState => {
  const startDate = new Date(log.start_date);
  
  // Group days into weeks
  const week1Days: OacpDailyEntry[] = [];
  const week2Days: OacpDailyEntry[] = [];
  
  days.forEach((day, index) => {
    const dayDate = new Date(day.day_date);
    const dayISO = dayDate.toISOString().slice(0, 10);
    const oacpEntry = fitnessLogDayToOacpEntry(day, dayISO);
    
    if (index < 7) {
      week1Days.push(oacpEntry);
    } else {
      week2Days.push(oacpEntry);
    }
  });
  
  // Pad weeks to ensure 7 days each
  while (week1Days.length < 7) {
    const dayIndex = week1Days.length;
    const dayDate = new Date(startDate);
    dayDate.setDate(startDate.getDate() + dayIndex);
    week1Days.push(blankDay());
    week1Days[week1Days.length - 1].dateISO = dayDate.toISOString().slice(0, 10);
  }
  
  while (week2Days.length < 7) {
    const dayIndex = week2Days.length + 7;
    const dayDate = new Date(startDate);
    dayDate.setDate(startDate.getDate() + dayIndex);
    week2Days.push(blankDay());
    week2Days[week2Days.length - 1].dateISO = dayDate.toISOString().slice(0, 10);
  }
  
  return withOacpDefaults({
    fullName: log.signed_name || '',
    dob: log.dob || '',
    address: log.address || '',
    email: log.email || '',
    phone: log.phone || '',
    week1: { days: week1Days },
    week2: { days: week2Days },
    declarationDateISO: log.declaration_date_iso || new Date().toISOString().slice(0, 10),
    applicantSignaturePngBase64: log.applicant_signature_png_base64,
    declarationAcknowledged: log.declaration_acknowledged || false,
    verifierEnabled: log.verifier_enabled || false,
    verifier: log.verifier_enabled ? {
      name: log.verifier_name || '',
      title: log.verifier_title,
      phone: log.verifier_phone,
      dateISO: log.verifier_date_iso,
      signaturePngBase64: log.verifier_signature_png_base64,
    } : undefined,
  });
};


