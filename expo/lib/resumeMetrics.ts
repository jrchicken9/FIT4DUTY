// Utilities to compute derived resume metrics from application_profile JSON arrays
// These functions are pure and safe to run on client or server.

export type WorkEntry = {
  employer?: string;
  title?: string;
  role?: string;
  custom_role?: string;
  start?: string; // legacy YYYY-MM
  end?: string;   // legacy YYYY-MM
  start_date?: string; // new YYYY-MM
  end_date?: string;   // new YYYY-MM
  current?: boolean;
  months?: string | number; // legacy computed
  hours_per_week?: number | string;
};

export type VolunteerEntry = {
  org?: string;
  organization?: string; // legacy
  role?: string;
  date?: string; // legacy YYYY-MM for one-off
  start_date?: string; // new YYYY-MM
  end_date?: string;   // new YYYY-MM
  current?: boolean;
  hours?: number | string; // legacy
  hours_per_week?: number | string;
  total_hours?: number | string;
};

export type EducationEntry = {
  institution?: string;
  credential_level?: string;
  level?: string; // legacy
};

export type ResumeArrays = {
  work_history?: WorkEntry[];
  volunteer_history?: VolunteerEntry[];
  education_details?: EducationEntry[];
};

export type WorkMetrics = {
  totalMonthsWorked: number;
  totalYearsWorked: number;
  policeRelatedMonths: number;
  policeRelatedYears: number;
  fullTimeMonths: number;
  fullTimeYears: number;
  totalWorkHours: number; // aggregated from hours_per_week across entries over their durations
};

export type VolunteerMetrics = {
  totalVolunteerHours: number;
  avgVolunteerHoursPerYear: number;
  last12MonthsVolunteerHours: number;
  commitmentMonths: number;
};

export type EducationMetrics = {
  highestCredentialLabel: string;
  highestCredentialScore: number; // 0..7
};

export type ResumeMetrics = {
  work: WorkMetrics;
  volunteer: VolunteerMetrics;
  education: EducationMetrics;
};

// ---------------- Date helpers ----------------

function parseYearMonth(input?: string): { year: number; month: number } | null {
  if (!input || !/^\d{4}-\d{2}$/.test(input)) return null;
  const [y, m] = input.split('-').map((v) => parseInt(v, 10));
  if (!y || !m || m < 1 || m > 12) return null;
  return { year: y, month: m };
}

function monthsBetween(startYM?: string, endYM?: string, isCurrent?: boolean): number {
  const start = parseYearMonth(startYM);
  const end = endYM ? parseYearMonth(endYM) : null;
  if (!start) return 0;
  const endDate = end ? new Date(end.year, end.month - 1, 1) : new Date();
  const startDate = new Date(start.year, start.month - 1, 1);
  const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
  return Math.max(0, Math.floor(months));
}

function numberFromUnknown(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '' && !isNaN(Number(value))) return Number(value);
  return null;
}

// ---------------- Work metrics ----------------

const POLICE_RELATED_ROLES = new Set([
  'Security Guard',
  'Corrections Officer',
  'By-law Officer',
  'Border Services',
  'EMS Support',
  'Shelter/Crisis Worker',
]);

export function computeWorkMetrics(entries?: WorkEntry[]): WorkMetrics {
  const list = Array.isArray(entries) ? entries : [];
  let totalMonthsWorked = 0;
  let policeRelatedMonths = 0;
  let fullTimeMonths = 0;
  let totalWorkHours = 0;

  for (const e of list) {
    const startYM = e.start_date || e.start;
    const endYM = e.end_date || e.end;
    const months = e.months != null ? numberFromUnknown(e.months) ?? monthsBetween(startYM, endYM, e.current) : monthsBetween(startYM, endYM, e.current);
    const roleLabel = (e.role || e.custom_role || '').trim();
    const isPoliceRelated = POLICE_RELATED_ROLES.has(roleLabel);

    totalMonthsWorked += months;
    if (isPoliceRelated) policeRelatedMonths += months;

    const hpw = numberFromUnknown(e.hours_per_week);
    const isFullTime = hpw != null ? hpw >= 30 : true; // default assume FT if unknown
    if (isFullTime) fullTimeMonths += months;

    // Aggregate total hours across entries when hours_per_week is provided
    if (hpw != null) {
      const weeks = (months || 0) * 4.345; // approx weeks per month
      totalWorkHours += hpw * weeks;
    }
  }

  return {
    totalMonthsWorked,
    totalYearsWorked: roundTo(totalMonthsWorked / 12, 2),
    policeRelatedMonths,
    policeRelatedYears: roundTo(policeRelatedMonths / 12, 2),
    fullTimeMonths,
    fullTimeYears: roundTo(fullTimeMonths / 12, 2),
    totalWorkHours: roundTo(totalWorkHours, 0),
  };
}

// ---------------- Volunteer metrics ----------------

export function computeVolunteerMetrics(entries?: VolunteerEntry[]): VolunteerMetrics {
  const list = Array.isArray(entries) ? entries : [];
  let totalVolunteerHours = 0;
  let earliest: Date | null = null;
  let latest: Date | null = null;
  let last12MonthsVolunteerHours = 0;
  let commitmentMonths = 0;

  const now = new Date();
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 12, 1);

  for (const v of list) {
    // Determine hours for the entry
    let entryHours = 0;
    const explicitTotal = numberFromUnknown(v.total_hours) ?? numberFromUnknown(v.hours);
    if (explicitTotal != null) {
      entryHours = explicitTotal;
    } else if (v.hours_per_week != null) {
      const hpw = numberFromUnknown(v.hours_per_week) ?? 0;
      const months = monthsBetween(v.start_date || v.date, v.end_date, v.current);
      const weeks = months * 4.345; // Approx weeks per month
      entryHours = hpw * weeks;
    }

    totalVolunteerHours += entryHours;

    // Track date span
    const s = parseYearMonth(v.start_date || v.date);
    const e = v.end_date ? parseYearMonth(v.end_date) : null;
    const startDate = s ? new Date(s.year, s.month - 1, 1) : null;
    const endDate = e ? new Date(e.year, e.month - 1, 1) : (v.current ? now : startDate);
    if (startDate) {
      if (!earliest || startDate < earliest) earliest = startDate;
      if (endDate && (!latest || endDate > latest)) latest = endDate;
    }

    // Hours in last 12 months (roughly)
    if (v.hours_per_week != null && startDate) {
      const hpw = numberFromUnknown(v.hours_per_week) ?? 0;
      const effectiveEnd = endDate || now;
      const activeStart = effectiveEnd < twelveMonthsAgo ? null : startDate > twelveMonthsAgo ? startDate : twelveMonthsAgo;
      if (activeStart) {
        const monthsInWindow = monthsBetween(
          `${activeStart.getFullYear()}-${String(activeStart.getMonth() + 1).padStart(2, '0')}`,
          `${effectiveEnd.getFullYear()}-${String(effectiveEnd.getMonth() + 1).padStart(2, '0')}`
        );
        const weeksInWindow = monthsInWindow * 4.345;
        last12MonthsVolunteerHours += hpw * weeksInWindow;
      }
    } else if (explicitTotal != null && startDate) {
      // Approximate allocation: if only a total is provided, and it ends within last 12 months, count it fully; otherwise ignore
      if ((endDate || startDate) >= twelveMonthsAgo) last12MonthsVolunteerHours += explicitTotal;
    }
  }

  // Average per year across the span of volunteering
  let yearsSpan = 1; // avoid division by zero
  if (earliest && latest && latest > earliest) {
    yearsSpan = (latest.getFullYear() - earliest.getFullYear()) + (latest.getMonth() - earliest.getMonth()) / 12;
    if (yearsSpan <= 0) yearsSpan = 1;
  }
  commitmentMonths = Math.max(1, Math.round(yearsSpan * 12));
  const avgVolunteerHoursPerYear = totalVolunteerHours / yearsSpan;

  return {
    totalVolunteerHours: roundTo(totalVolunteerHours, 0),
    avgVolunteerHoursPerYear: roundTo(avgVolunteerHoursPerYear, 0),
    last12MonthsVolunteerHours: roundTo(last12MonthsVolunteerHours, 0),
    commitmentMonths,
  };
}

// ---------------- Education metrics ----------------

const EDUCATION_RANKS: Array<{ match: (s: string) => boolean; score: number; label: string }> = [
  { match: (s) => /phd|doctor|doctoral/.test(s), score: 7, label: 'PhD/Doctorate' },
  { match: (s) => /master|msc|ma|mba/.test(s), score: 6, label: 'Master’s' },
  { match: (s) => /post\s?-?grad|postgrad/.test(s), score: 5, label: 'Post‑Grad Certificate' },
  { match: (s) => /bachelor|university/.test(s), score: 4, label: 'Bachelor’s/University Degree' },
  { match: (s) => /advanced diploma|3[- ]?year/.test(s), score: 3, label: 'Advanced Diploma (3‑year)' },
  { match: (s) => /diploma|college/.test(s), score: 2, label: 'College Diploma (2‑year)' },
  { match: (s) => /certificate/.test(s), score: 1, label: 'Certificate (incl. online)' },
  { match: (_s) => true, score: 0, label: 'High School/Other' },
];

export function computeEducationMetrics(entries?: EducationEntry[]): EducationMetrics {
  const list = Array.isArray(entries) ? entries : [];
  let bestScore = -1;
  let bestLabel = 'Unknown';
  for (const e of list) {
    const raw = String(e.credential_level || e.level || '').toLowerCase();
    for (const tier of EDUCATION_RANKS) {
      if (tier.match(raw)) {
        if (tier.score > bestScore) {
          bestScore = tier.score;
          bestLabel = tier.label;
        }
        break;
      }
    }
  }
  if (bestScore < 0) { bestScore = 0; bestLabel = 'Unknown'; }
  return { highestCredentialLabel: bestLabel, highestCredentialScore: bestScore };
}

// ---------------- Composite ----------------

export function computeResumeMetrics(arrays: ResumeArrays): ResumeMetrics {
  const work = computeWorkMetrics(arrays.work_history);
  const volunteer = computeVolunteerMetrics(arrays.volunteer_history);
  const education = computeEducationMetrics(arrays.education_details);
  return { work, volunteer, education };
}

function roundTo(v: number, places: number): number {
  const p = Math.pow(10, places);
  return Math.round(v * p) / p;
}


