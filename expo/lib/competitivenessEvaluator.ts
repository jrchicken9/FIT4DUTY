export type Tier = 'Exceptional' | 'Competitive' | 'Developing' | 'Needs Improvement' | 'Unknown';
export type CategoryKey = 'education' | 'work' | 'volunteer' | 'certs_skills' | 'references' | 'conduct';

type Attributes = Record<string, any>;

function boolOrFalse(value: any): boolean { return value === true; }
function intOrZero(value: any): number { return typeof value === 'number' ? value : 0; }
function textOrEmpty(value: any): string { return typeof value === 'string' ? value : ''; }

export type Thresholds = {
  work?: { fulltime_years_min?: number; relevant_months_min?: number };
  volunteer?: { hours_lifetime_min?: number; hours_12mo_min?: number };
  education?: { anchor_levels?: string[] };
};

const DEFAULT_THRESHOLDS: Required<Thresholds> = {
  work: { fulltime_years_min: 2, relevant_months_min: 12 },
  volunteer: { hours_lifetime_min: 150, hours_12mo_min: 75 },
  education: { anchor_levels: ['College Diploma', 'University Degree', 'Postgrad'] },
};

function getT<T extends number>(v: unknown, d: T): T { return (typeof v === 'number' && Number.isFinite(v) ? (v as T) : d); }

export function evaluateCategoryTier(category: CategoryKey, attributes: Attributes, verifiedMap: Record<string, boolean | null>, thresholds?: Thresholds): Tier {
  let anchorMet = false;
  let supportingMet = 0;
  let infoPresent = false;
  // Verification signals are disabled; ignore any verification-specific boosts

  switch (category) {
    case 'education': {
      // Choose the highest-rated credential if multiple are present
      const rawLevel = textOrEmpty(attributes?.education?.level);
      const derivedLevel = highestEducationFromDetails(attributes?.education_details, rawLevel);
      const level = derivedLevel;
      const fieldRelevant = boolOrFalse(attributes?.education?.field_relevant);
      const contEdRecent = boolOrFalse(attributes?.education?.cont_ed_recent);
      infoPresent = !!(level || fieldRelevant || contEdRecent);
      const anchorLevels = (thresholds && thresholds.education && Array.isArray(thresholds.education.anchor_levels))
        ? (thresholds.education.anchor_levels as string[])
        : DEFAULT_THRESHOLDS.education.anchor_levels;
      anchorMet = (anchorLevels || []).includes(level);
      supportingMet += fieldRelevant ? 1 : 0;
      supportingMet += contEdRecent ? 1 : 0;
      break;
    }
    case 'work': {
      const fulltimeYears = intOrZero(attributes?.work?.fulltime_years);
      const relevantMonths = intOrZero(attributes?.work?.relevant_months);
      const publicFacing = boolOrFalse(attributes?.work?.public_facing);
      const continuityOk = boolOrFalse(attributes?.work?.continuity_ok);
      const leadership = boolOrFalse(attributes?.work?.leadership);
      const shiftExposure = boolOrFalse(attributes?.work?.shift_exposure);
      // Extra anchor: frontline public safety 12m (if client passes detailed attribute)
      const frontline12m = boolOrFalse(attributes?.work?.frontline_public_safety_12m);
      infoPresent = (fulltimeYears > 0) || (relevantMonths > 0) || publicFacing || continuityOk || leadership || shiftExposure || (Array.isArray(attributes?.work_history) && attributes.work_history.length > 0);
      const minYears: number = Number(((thresholds as any)?.work?.fulltime_years_min) ?? DEFAULT_THRESHOLDS.work.fulltime_years_min);
      const minMonths: number = Number(((thresholds as any)?.work?.relevant_months_min) ?? DEFAULT_THRESHOLDS.work.relevant_months_min);
      anchorMet = frontline12m || fulltimeYears >= minYears || relevantMonths >= minMonths;
      supportingMet += publicFacing ? 1 : 0;
      supportingMet += continuityOk ? 1 : 0;
      supportingMet += leadership ? 1 : 0;
      supportingMet += shiftExposure ? 1 : 0;
      break;
    }
    case 'volunteer': {
      const lifetime = intOrZero(attributes?.volunteer?.hours_lifetime);
      const last12 = intOrZero(attributes?.volunteer?.hours_12mo);
      const consistency = boolOrFalse(attributes?.volunteer?.consistency_6mo);
      const roleType = textOrEmpty(attributes?.volunteer?.role_type);
      const leadRole = boolOrFalse(attributes?.volunteer?.lead_role);
      infoPresent = (lifetime > 0) || (last12 > 0) || consistency || !!roleType || leadRole || (Array.isArray(attributes?.volunteer_history) && attributes.volunteer_history.length > 0);
      const minLife: number = Number(((thresholds as any)?.volunteer?.hours_lifetime_min) ?? DEFAULT_THRESHOLDS.volunteer.hours_lifetime_min);
      const min12: number = Number(((thresholds as any)?.volunteer?.hours_12mo_min) ?? DEFAULT_THRESHOLDS.volunteer.hours_12mo_min);
      anchorMet = lifetime >= minLife || last12 >= min12;
      supportingMet += consistency ? 1 : 0;
      supportingMet += ['youth','seniors','vulnerable','coaching','community_safety'].includes(roleType) ? 1 : 0;
      supportingMet += leadRole ? 1 : 0;
      break;
    }
    case 'certs_skills': {
      const cpr = boolOrFalse(attributes?.certs?.cpr_c_current);
      const mhfa = boolOrFalse(attributes?.certs?.mhfa);
      const cpi = boolOrFalse(attributes?.certs?.cpi_nvci);
      const asist = boolOrFalse(attributes?.certs?.asist);
      const lang2 = boolOrFalse(attributes?.skills?.language_second);
      const licenceG = textOrEmpty(attributes?.driver?.licence_class) === 'G';
      const cleanAbstract = boolOrFalse(attributes?.driver?.clean_abstract);
      const prepDigital = boolOrFalse(attributes?.fitness?.prep_digital_attempted);
      // Additional supporting derived flags
      const naloxone = boolOrFalse(attributes?.certs?.naloxone_trained);
      const deescAdv = boolOrFalse(attributes?.certs?.deescalation_advanced);
      const priorityLang = boolOrFalse(attributes?.skills?.priority_language);
      const cprOkFor6mo = boolOrFalse(attributes?.certs?.cpr_valid_6mo);
      const pinAttempts3 = boolOrFalse(attributes?.fitness?.pin_digital_attempts_3);
      infoPresent = cpr || mhfa || cpi || asist || lang2 || licenceG || cleanAbstract || prepDigital;
      anchorMet = cpr === true;
      supportingMet += mhfa ? 1 : 0;
      supportingMet += cpi ? 1 : 0;
      supportingMet += asist ? 1 : 0;
      supportingMet += lang2 ? 1 : 0;
      supportingMet += licenceG ? 1 : 0;
      supportingMet += cleanAbstract ? 1 : 0;
      supportingMet += prepDigital ? 1 : 0;
      supportingMet += naloxone ? 1 : 0;
      supportingMet += deescAdv ? 1 : 0;
      supportingMet += priorityLang ? 1 : 0;
      supportingMet += cprOkFor6mo ? 1 : 0;
      supportingMet += pinAttempts3 ? 1 : 0;
      break;
    }
    case 'references': {
      const count = intOrZero(attributes?.refs?.count);
      const diverse = boolOrFalse(attributes?.refs?.diverse_contexts);
      const confirmed = boolOrFalse(attributes?.refs?.confirmed_recent);
      const supervisor12 = boolOrFalse(attributes?.refs?.supervisor_within_12mo);
      const noFamily = boolOrFalse(attributes?.refs?.no_family);
      const contactable = boolOrFalse(attributes?.refs?.contactable_verified);
      infoPresent = (count > 0) || diverse || confirmed || (Array.isArray(attributes?.refs_list) && attributes.refs_list.length > 0);
      anchorMet = count >= 3;
      supportingMet += diverse ? 1 : 0;
      supportingMet += confirmed ? 1 : 0;
      supportingMet += supervisor12 ? 1 : 0;
      supportingMet += noFamily ? 1 : 0;
      supportingMet += contactable ? 1 : 0;
      break;
    }
    case 'conduct': {
      const noIssues = boolOrFalse(attributes?.conduct?.no_major_issues);
      const cleanDriving = boolOrFalse(attributes?.conduct?.clean_driving_24mo);
      const socialAck = boolOrFalse(attributes?.conduct?.social_media_ack);
      infoPresent = noIssues || cleanDriving || socialAck;
      anchorMet = noIssues;
      supportingMet += cleanDriving ? 1 : 0;
      supportingMet += socialAck ? 1 : 0;
      break;
    }
  }

  const hasAnyInfo = infoPresent || anchorMet || supportingMet > 0;
  if (!hasAnyInfo) return 'Unknown';

  if (anchorMet && supportingMet >= 2) return 'Exceptional';
  if (anchorMet) return 'Competitive';
  if (supportingMet >= 2) return 'Developing';
  return 'Needs Improvement';
}

function highestEducationFromDetails(details: any, fallbackLevel: string): string {
  const rank = (lvl?: string) => {
    const v = (lvl || '').toLowerCase();
    if (v.includes('postgrad') || v.includes('post-grad') || v.includes('masters') || v.includes('master') || v.includes('ma') || v.includes('msc') || v.includes('mba') || v.includes('phd')) return 4;
    if (v.includes('university')) return 3;
    if (v.includes('college')) return 2;
    if (v.includes('high') || v.includes('secondary') || v.includes('hs')) return 1;
    return 0;
  };
  const normalize = (lvl?: string) => {
    const v = (lvl || '').toLowerCase();
    if (v.includes('postgrad') || v.includes('post-grad') || v.includes('masters') || v.includes('master') || v.includes('ma') || v.includes('msc') || v.includes('mba') || v.includes('phd')) return 'Postgrad';
    if (v.includes('university')) return 'University Degree';
    if (v.includes('college')) return 'College Diploma';
    if (v.includes('high') || v.includes('secondary') || v.includes('hs')) return 'High School';
    return lvl || '';
  };
  const list: string[] = Array.isArray(details) ? details.map(d => String(d?.level || '')).filter(Boolean) : [];
  const all = [...list, fallbackLevel].filter(Boolean);
  let bestLabel = normalize(all[0]);
  let best = rank(all[0]);
  for (let i = 1; i < all.length; i++) {
    const s = rank(all[i]);
    if (s > best) { best = s; bestLabel = normalize(all[i]); }
  }
  return bestLabel || fallbackLevel;
}

export function computeOverallTier(categoryTiers: Record<CategoryKey, Tier>): Tier {
  const tiers = Object.values(categoryTiers).filter(t => t !== 'Unknown') as Tier[];
  if (tiers.length === 0) return 'Unknown';
  const counts: Record<Tier, number> = {
    'Exceptional': 0,
    'Competitive': 0,
    'Developing': 0,
    'Needs Improvement': 0,
    'Unknown': 0,
  };
  tiers.forEach(t => { counts[t] = (counts[t] || 0) + 1; });

  const high = (counts['Exceptional'] + counts['Competitive']);
  const low = (counts['Developing'] + counts['Needs Improvement']);
  if (high >= 3) {
    if (counts['Exceptional'] >= 2 && (counts['Developing'] + counts['Needs Improvement']) === 0) {
      return 'Exceptional';
    }
    return 'Competitive';
  }
  if (low >= 3) {
    if (counts['Needs Improvement'] >= 2) return 'Needs Improvement';
    return 'Developing';
  }
  if (high >= low) return 'Competitive';
  return 'Developing';
}


// Weighted readiness computation and human-readable status summaries

export const DEFAULT_CATEGORY_WEIGHTS: Record<Exclude<CategoryKey, 'conduct'>, number> = {
  education: 0.25,
  work: 0.30,
  volunteer: 0.20,
  certs_skills: 0.15,
  references: 0.10,
};

const TIER_TO_SCORE: Record<Tier, number> = {
  Exceptional: 1.0,
  Competitive: 0.75,
  Developing: 0.4,
  'Needs Improvement': 0.2,
  Unknown: 0.0,
};

function scoreToTier(score: number): Tier {
  if (score >= 0.85) return 'Exceptional';
  if (score >= 0.65) return 'Competitive';
  if (score >= 0.40) return 'Developing';
  return 'Needs Improvement';
}

export function computeOverallWeightedTier(
  categoryTiers: Partial<Record<CategoryKey, Tier>>,
  weights: Record<string, number> = DEFAULT_CATEGORY_WEIGHTS
): { tier: Tier; score: number } {
  let weightedSum = 0;
  let totalWeight = 0;
  (Object.keys(weights) as Array<keyof typeof DEFAULT_CATEGORY_WEIGHTS>).forEach((key) => {
    const tier = categoryTiers[key as CategoryKey] || 'Unknown';
    const w = weights[key] ?? 0;
    weightedSum += TIER_TO_SCORE[tier] * w;
    totalWeight += w;
  });
  const normalized = totalWeight > 0 ? weightedSum / totalWeight : 0;
  return { tier: scoreToTier(normalized), score: Math.round(normalized * 100) };
}

export function getCategoryStatusSummary(category: CategoryKey, attributes: Attributes): string {
  switch (category) {
    case 'education': {
      const level = highestEducationFromDetails(attributes?.education_details, textOrEmpty(attributes?.education?.level));
      const fieldRelevant = boolOrFalse(attributes?.education?.field_relevant);
      const contEdRecent = boolOrFalse(attributes?.education?.cont_ed_recent);
      const hasAnchor = level === 'College Diploma' || level === 'University Degree' || level === 'Postgrad';
      const parts: string[] = [];
      parts.push(hasAnchor ? `Has ${level}` : 'No post-secondary credential yet');
      if (fieldRelevant) parts.push('relevant field');
      if (contEdRecent) parts.push('recent upskilling');
      return parts.join(' • ');
    }
    case 'work': {
      const y = intOrZero(attributes?.work?.fulltime_years);
      const m = intOrZero(attributes?.work?.relevant_months);
      const pf = boolOrFalse(attributes?.work?.public_facing);
      const cont = boolOrFalse(attributes?.work?.continuity_ok);
      const lead = boolOrFalse(attributes?.work?.leadership);
      const shift = boolOrFalse(attributes?.work?.shift_exposure);
      const frontline = boolOrFalse(attributes?.work?.frontline_public_safety_12m);
      const anchor = frontline || (y >= 2) || (m >= 12);
      const parts: string[] = [];
      if (frontline) {
        parts.push('Anchor met (frontline 12m)');
      } else {
        parts.push(anchor ? `Experience anchor met (${y}y FT / ${m}m relevant)` : `Experience below anchor (${y}y FT / ${m}m relevant)`);
      }
      if (pf) parts.push('public-facing');
      if (cont) parts.push('continuous');
      if (lead) parts.push('leadership');
      if (shift) parts.push('shift exposure');
      return parts.join(' • ');
    }
    case 'volunteer': {
      const life = intOrZero(attributes?.volunteer?.hours_lifetime);
      const last12 = intOrZero(attributes?.volunteer?.hours_12mo);
      const consist = boolOrFalse(attributes?.volunteer?.consistency_6mo);
      const roleType = textOrEmpty(attributes?.volunteer?.role_type);
      const leadRole = boolOrFalse(attributes?.volunteer?.lead_role);
      const anchor = life >= 150 || last12 >= 75;
      const parts: string[] = [];
      parts.push(anchor ? `Service anchor met (${life}h lifetime / ${last12}h 12mo)` : `Service below anchor (${life}h lifetime / ${last12}h 12mo)`);
      if (consist) parts.push('consistent (6+ mo)');
      if (roleType) parts.push(`role: ${roleType}`);
      if (leadRole) parts.push('lead role');
      return parts.join(' • ');
    }
    case 'certs_skills': {
      const cpr = boolOrFalse(attributes?.certs?.cpr_c_current);
      const mhfa = boolOrFalse(attributes?.certs?.mhfa);
      const cpi = boolOrFalse(attributes?.certs?.cpi_nvci);
      const asist = boolOrFalse(attributes?.certs?.asist);
      const lang2 = boolOrFalse(attributes?.skills?.language_second);
      const licenceG = textOrEmpty(attributes?.driver?.licence_class) === 'G';
      const clean = boolOrFalse(attributes?.driver?.clean_abstract);
      const parts: string[] = [];
      parts.push(cpr ? 'CPR‑C current' : 'CPR‑C missing');
      const extras: string[] = [];
      if (mhfa) extras.push('MHFA');
      if (cpi) extras.push('CPI/NVCI');
      if (asist) extras.push('ASIST');
      if (lang2) extras.push('2nd language');
      if (licenceG) extras.push('G licence');
      if (clean) extras.push('clean abstract');
      if (extras.length) parts.push(extras.join(', '));
      return parts.join(' • ');
    }
    case 'references': {
      const count = intOrZero(attributes?.refs?.count);
      const diverse = boolOrFalse(attributes?.refs?.diverse_contexts);
      const confirmed = boolOrFalse(attributes?.refs?.confirmed_recent);
      const parts: string[] = [];
      parts.push(count >= 3 ? `${count} references` : `${count} references (need 3+)`);
      if (diverse) parts.push('diverse contexts');
      if (confirmed) parts.push('confirmed recently');
      return parts.join(' • ');
    }
    case 'conduct': {
      const noIssues = boolOrFalse(attributes?.conduct?.no_major_issues);
      const cleanDriving = boolOrFalse(attributes?.conduct?.clean_driving_24mo);
      const socialAck = boolOrFalse(attributes?.conduct?.social_media_ack);
      const parts: string[] = [];
      parts.push(noIssues ? 'no major issues' : 'issues present');
      if (cleanDriving) parts.push('clean driving (24 mo)');
      if (socialAck) parts.push('social media policy acknowledged');
      return parts.join(' • ');
    }
  }
}


