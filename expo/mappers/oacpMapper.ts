// mappers/oacpMapper.ts
import type { OacpLogState } from '@/types/oacpFitnessLog';
import type { OacpLogPayload, OacpDailyEntry as ExporterDailyEntry } from '@/lib/pdf/oacpFitnessExporter';

export const toOacpPayload = (s: OacpLogState): OacpLogPayload => ({
  fullName: s.fullName,
  dob: s.dob,
  address: s.address,
  email: s.email,
  phone: s.phone,
  week1: {
    days: s.week1.days.map(day => toExporterDailyEntry(day))
  },
  week2: {
    days: s.week2.days.map(day => toExporterDailyEntry(day))
  },
  applicantDeclarationDateISO: s.declarationDateISO,
  applicantSignaturePngBase64: s.applicantSignaturePngBase64,
  verifier: s.verifierEnabled && s.verifier ? {
    name: s.verifier.name,
    title: s.verifier.title,
    phone: s.verifier.phone,
    dateISO: s.verifier.dateISO,
    signaturePngBase64: s.verifier.signaturePngBase64,
  } : undefined,
});

// Helper to convert OacpDailyEntry to ExporterDailyEntry
const toExporterDailyEntry = (day: any): ExporterDailyEntry => ({
  dateISO: day.dateISO,
  activity: day.activity,
  durationMins: day.durationMins,
  intensity: day.intensity,
  comments: day.comments,
  signed: day.signed,
  
  // Map the detailed fields for the exporter
  runDuration: day.runDuration,
  runDistance: day.runDistance,
  runLocation: day.runLocation,
  strengthDuration: day.strengthDuration,
  strengthLocation: day.strengthLocation,
  strengthSplit: day.strengthSplit,
  strengthDescription: day.strengthDescription,
  otherActivity: day.otherActivity,
  otherDuration: day.otherDuration,
  otherLocation: day.otherLocation,
  stressMethod: day.stressMethod,
  sleepHours: day.sleepHours,
});

// Helper to create a summary activity description from detailed fields
export const createActivityDescription = (day: any): string => {
  const activities: string[] = [];
  
  if (day.runDuration && day.runDuration > 0) {
    const runDesc = `Run ${day.runDuration}min`;
    if (day.runDistance && day.runDistance > 0) {
      activities.push(`${runDesc} (${day.runDistance}km)`);
    } else {
      activities.push(runDesc);
    }
  }
  
  if (day.strengthDuration && day.strengthDuration > 0) {
    activities.push(`Strength ${day.strengthDuration}min`);
  }
  
  if (day.otherDuration && day.otherDuration > 0 && day.otherActivity) {
    activities.push(`${day.otherActivity} ${day.otherDuration}min`);
  }
  
  return activities.length > 0 ? activities.join(' + ') : 'Rest Day';
};

// Helper to calculate total duration from detailed fields
export const calculateTotalDuration = (day: any): number => {
  return (day.runDuration || 0) + (day.strengthDuration || 0) + (day.otherDuration || 0);
};

// Helper to determine intensity based on duration and activity type
export const determineIntensity = (day: any): 'Low' | 'Moderate' | 'Vigorous' => {
  const totalDuration = calculateTotalDuration(day);
  
  if (totalDuration === 0) return 'Low';
  if (totalDuration < 30) return 'Low';
  if (totalDuration < 60) return 'Moderate';
  return 'Vigorous';
};


