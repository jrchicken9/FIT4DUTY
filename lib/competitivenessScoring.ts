import { computeResumeMetrics, ResumeMetrics } from '@/lib/resumeMetrics';

export type CategoryKey = 'education' | 'work' | 'volunteer' | 'certs' | 'fitness' | 'driving' | 'background' | 'softskills' | 'references';

export type RuleConfig = {
  id: string;
  points: number;
  repeatable?: boolean;
  cap?: number; // cap when repeatable
  capCategory?: boolean; // cap category at weight max
};

export type Config = {
  weights: Record<CategoryKey, number>;
  rules: Record<CategoryKey, RuleConfig[]>;
  disqualifiers?: Array<{ id: string; level?: string; action?: string }>;
  levelThresholds: Array<{ level: string; min: number }>;
};

export type ProfileArrays = {
  work_history?: any[];
  volunteer_history?: any[];
  education_details?: any[];
  certs_details?: any[];
  refs_list?: any[];
  // Optional fields from application_profile (booleans or text)
  fitness_prep_observed_verified?: boolean;
  fitness_prep_digital_attempted?: boolean;
  driver_licence_class?: string | null;
  driver_clean_abstract?: boolean | null;
  conduct_no_major_issues?: boolean | null;
};

export type EvaluationDetail = {
  category: CategoryKey;
  rawPoints: number;
  cappedPoints: number;
  categoryMax: number;
  matchedRules: string[];
};

export type EvaluationResult = {
  total: number; // 0..100
  level: string; // label from thresholds
  details: EvaluationDetail[];
  disqualified?: boolean;
  disqualifierId?: string;
};

// ---------------- Predicates ----------------

const RELEVANT_EDU_RE = /(police foundation|criminology|justice|criminal|psychology|sociology|law|legal|public admin|public administration)/i;
const CPR_RE = /(first aid|cpr-?c)/i;
const MHFA_RE = /(mental health first aid|mhfa)/i;
const DEESC_RE = /(cpi|nvci|de-?escalation|crisis prevention)/i;
const NALOXONE_RE = /(naloxone)/i;
const CUSTOMER_FACING_RE = /(retail|hospitality|customer|front desk|call centre|call center)/i;

function tagFromRegex(re: RegExp): string {
  if (re === CPR_RE) return 'cpr_c';
  if (re === MHFA_RE) return 'mhfa';
  if (re === DEESC_RE) return 'cpi_nvci';
  if (re === NALOXONE_RE) return 'naloxone';
  return '';
}

function getEducationRecencyYears(education: any[] | undefined): number | null {
  if (!Array.isArray(education)) return null;
  let latestYear: number | null = null;
  for (const e of education) {
    const ym = (e?.end_date || e?.year) as string | number | undefined;
    let year: number | null = null;
    if (typeof ym === 'string' && /^\d{4}-\d{2}$/.test(ym)) year = parseInt(ym.slice(0, 4), 10);
    else if (typeof ym === 'number') year = ym;
    if (year) {
      if (latestYear == null || year > latestYear) latestYear = year;
    }
  }
  if (!latestYear) return null;
  const nowYear = new Date().getFullYear();
  return nowYear - latestYear;
}

function countExtraRelevantCerts(certs: any[] | undefined): number {
  if (!Array.isArray(certs)) return 0;
  let count = 0;
  for (const c of certs) {
    const name = String(c?.name || '').toLowerCase();
    if (CPR_RE.test(name) || MHFA_RE.test(name) || DEESC_RE.test(name)) continue; // base rules cover these
    if (!name) continue;
    count += 1;
  }
  return count;
}

// ---------------- Scoring ----------------

export function evaluateCompetitiveness(config: Config, profile: ProfileArrays): EvaluationResult {
  const metrics: ResumeMetrics = computeResumeMetrics({
    work_history: profile.work_history,
    volunteer_history: profile.volunteer_history,
    education_details: profile.education_details,
  });
  
  const details: EvaluationDetail[] = [];

  // Potential disqualifiers (simple)
  const disq = ((): { id?: string } | null => {
    const c = config.disqualifiers || [];
    const hasMajor = profile.conduct_no_major_issues === false;
    if (hasMajor) {
      const rule = c.find(d => d.id === 'criminal_open_or_recent_conviction');
      return { id: rule?.id || 'criminal_open_or_recent_conviction' };
    }
    return null;
  })();

  // Helper for rule accumulation with optional caps
  const evalRules = (category: CategoryKey, f: (id: string) => number): EvaluationDetail => {
    const rules = config.rules[category] || [];
    let raw = 0;
    const matched: string[] = [];
    for (const r of rules) {
      let pts = f(r.id);
      if (r.repeatable && r.cap != null) pts = Math.min(pts, r.cap);
      if (pts > 0) {
        raw += pts;
        matched.push(`${r.id}:${pts}`);
      }
    }
    const categoryMax = config.weights[category] || 0;
    const capped = Math.min(raw, categoryMax);
    return { category, rawPoints: raw, cappedPoints: capped, categoryMax, matchedRules: matched };
  };

  // Education
  const eduRes = evalRules('education', (id) => {
    const highest = metrics.education.highestCredentialLabel;
    const recYears = getEducationRecencyYears(profile.education_details);
    const eduList = (profile.education_details || []);
    const hasRelevant = eduList.some(e => RELEVANT_EDU_RE.test(String(e?.program || e?.field_of_study || '')));
    
    switch (id) {
      case 'bachelor_relevant':
        return /bachelor|university/i.test(highest) && hasRelevant ? 15 : 0;
      case 'diploma_police_foundations':
        return /diploma/i.test(highest) && eduList.some(e => /police foundation/i.test(String(e?.program || ''))) ? 12 : 0;
      case 'any_post_secondary':
        return /diploma|post|bachelor|university|master|phd/i.test(highest) ? 9 : 0;
      case 'extra_post_secondary': {
        // Award small stacking points for additional post-secondary credentials beyond the highest
        const count = eduList.filter((e: any) => {
          const lvl = String(e?.credential_level || e?.level || '').toLowerCase();
          return /diploma|post|bachelor|university|master|phd/.test(lvl);
        }).length;
        const extra = Math.max(0, count - 1); // every additional beyond the first
        return extra * 3; // will be capped by rule.cap
      }
      case 'high_school_only':
        return /high school|other|unknown/i.test(highest) ? 4 : 0;
      case 'recent_grad_bonus':
        return recYears != null && recYears <= 5 ? 1 : 0;
      case 'cont_ed_recent_24m': {
        // Treat as bonus if any education end_date within 24 months
        const nowY = new Date().getFullYear();
        const hit = (profile.education_details || []).some((e: any) => {
          const ym = String(e?.end_date || '');
          if (!/^\d{4}-\d{2}$/.test(ym)) return false;
          const yr = parseInt(ym.slice(0,4),10);
          return nowY - yr <= 2;
        });
        return hit ? 1 : 0;
      }
      case 'transcript_verified':
        // Requires upstream flag; default to 0 if not present
        return 0;
      default:
        return 0;
    }
  });
  details.push(eduRes);

  // Work
  const w = metrics.work;
  const workRes = evalRules('work', (id) => {
    
    switch (id) {
      case 'relevant_3y_plus':
        return w.policeRelatedYears >= 3 ? 20 : 0;
      case 'relevant_1to2y':
        return w.policeRelatedYears >= 1 && w.policeRelatedYears < 3 ? 14 : 0;
      case 'nonrel_leadership_3y_plus': {
        const hasLead = (profile.work_history || []).some((e: any) => e?.leadership === 'true' || e?.leadership === true);
        return w.totalYearsWorked >= 3 && hasLead ? 12 : 0;
      }
      case 'ft_1to2y':
        return w.fullTimeYears >= 1 && w.fullTimeYears < 2 ? 8 : 0;
      case 'ft_2y_plus':
        return w.fullTimeYears >= 2 ? 10 : 0;
      case 'under_1y':
        return w.totalYearsWorked < 1 ? 4 : 0;
      case 'public_facing_history': {
        const hasPF = (profile.work_history || []).some((e: any) =>
          (Array.isArray(e?.police_relevant) && e.police_relevant.includes('customer-facing')) ||
          CUSTOMER_FACING_RE.test(String(e?.role || e?.title || ''))
        );
        return hasPF ? 2 : 0;
      }
      case 'shift_exposure': {
        const hasShift = (profile.work_history || []).some((e: any) =>
          (Array.isArray(e?.police_relevant) && e.police_relevant.includes('shift work'))
        );
        return hasShift ? 2 : 0;
      }
      case 'continuity_no_gaps_6mo': {
        // Heuristic: total months worked >= 30 in last 36 months → treat as continuous
        // We lack precise windowing; approximate using overall FT months
        return w.fullTimeYears >= 2.5 ? 2 : 0;
      }
      case 'employment_letter_verified':
        return 0;
      default:
        return 0;
    }
  });
  details.push(workRes);

  // Volunteer
  const v = metrics.volunteer;
  const volRes = evalRules('volunteer', (id) => {
    const avgPerMonthLast12 = v.last12MonthsVolunteerHours / 12;
    switch (id) {
      case 'committed_8h_12m': {
        const commitmentOK = v.commitmentMonths >= 12; // at least a year active
        return commitmentOK && avgPerMonthLast12 >= 8 ? 10 : 0;
      }
      case 'steady_4h_6m': {
        const commitmentOK = v.commitmentMonths >= 6;
        return commitmentOK && avgPerMonthLast12 >= 4 && avgPerMonthLast12 < 8 ? 7 : 0;
      }
      case 'occasional': {
        // Occasional or short-term, show as developing when some hours present
        return v.totalVolunteerHours > 0 ? 4 : 0;
      }
      default:
        return 0;
    }
  });
  details.push(volRes);

  // Certs
  const certsRes = evalRules('certs', (id) => {
    const certs = profile.certs_details || [];
    const has = (re: RegExp) => certs.some((c: any) => re.test(String(c?.name || '')) || String(c?.type || '') === tagFromRegex(re));
    const tagFromType = (tag: string) => certs.some((c: any) => String(c?.type || '') === tag);
    switch (id) {
      case 'cpr_c_current': return has(CPR_RE) || tagFromType('cpr_c') ? 3 : 0;
      case 'mh_first_aid': return has(MHFA_RE) || tagFromType('mhfa') ? 3 : 0;
      case 'deescalation': return has(DEESC_RE) || tagFromType('cpi_nvci') ? 2 : 0;
      case 'extra_relevant_cert': return countExtraRelevantCerts(certs) * 2; // will be capped by rule.cap
      case 'naloxone_trained': return has(NALOXONE_RE) || tagFromType('naloxone') ? 1 : 0;
      case 'credential_recent_24m': {
        const now = new Date();
        const hit = certs.some((c: any) => {
          const d = String(c?.issue_date || '');
          if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
          const yr = parseInt(d.slice(0,4),10);
          const mo = parseInt(d.slice(5,7),10) - 1;
          const dt = new Date(yr, mo, 1);
          const diffY = (now.getFullYear() - dt.getFullYear()) + (now.getMonth() - dt.getMonth())/12;
          return diffY <= 2;
        });
        return hit ? 1 : 0;
      }
      default: return 0;
    }
  });
  details.push(certsRes);

  // Fitness
  const fitRes = evalRules('fitness', (id) => {
    switch (id) {
      case 'prep_pass_6m': return profile.fitness_prep_observed_verified ? 15 : 0;
      case 'strong_indicators': return profile.fitness_prep_observed_verified ? 12 : 0;
      case 'average_indicators': return profile.fitness_prep_digital_attempted ? 8 : 0;
      case 'below_avg_or_unknown': return (!profile.fitness_prep_observed_verified && !profile.fitness_prep_digital_attempted) ? 4 : 0;
      default: return 0;
    }
  });
  details.push(fitRes);

  // Driving
  const drvRes = evalRules('driving', (id) => {
    const cls = (profile.driver_licence_class || '').toUpperCase();
    const clean = !!profile.driver_clean_abstract;
    switch (id) {
      case 'full_license_clean_24m': return (cls === 'G' || cls === 'G2') && clean ? 10 : 0;
      case 'one_minor_infraction': return (cls === 'G' || cls === 'G2') && !clean ? 8 : 0;
      case 'multi_minor': return 0; // unknown
      default: return 0;
    }
  });
  details.push(drvRes);

  // Background
  const bgRes = evalRules('background', (id) => {
    const clean = profile.conduct_no_major_issues !== false;
    switch (id) {
      case 'clean_all': return clean ? 10 : 0;
      case 'minor_credit': return clean ? 8 : 0;
      case 'discipline_or_credit_trend': return clean ? 4 : 0;
      default: return 0;
    }
  });
  details.push(bgRes);

  // Soft skills
  const softRes = evalRules('softskills', (id) => {
    const hasLead = (profile.work_history || []).some((e: any) => e?.leadership === 'true' || e?.leadership === true) || (profile.volunteer_history || []).some((e: any) => e?.lead_role === 'true' || e?.lead_role === true);
    const hasCust = (profile.work_history || []).some((e: any) => /retail|hospitality|call centre|call center/i.test(String(e?.role || e?.title || '')) || (Array.isArray(e?.police_relevant) && e.police_relevant.includes('customer-facing')));
    switch (id) {
      case 'leadership_role': return hasLead ? 3 : 0;
      case 'customer_service_1y': {
        const months = (profile.work_history || []).reduce((acc: number, e: any) => acc + (/retail|hospitality|call centre|call center/i.test(String(e?.role || e?.title || '')) ? (Number(e?.months) || 0) : 0), 0);
        return months >= 12 ? 2 : (hasCust ? 1 : 0);
      }
      case 'second_language_proficient': {
        const langs = profile as any;
        const hasLang = Array.isArray((langs as any).skills_languages) && (langs as any).skills_languages.some((l: any) => /professional|native/i.test(String(l?.proficiency || '')));
        return hasLang ? 2 : 0;
      }
      case 'skills_two_plus': {
        const count = Array.isArray((profile as any).skills_details) ? (profile as any).skills_details.length : 0;
        return count >= 2 ? 1 : 0;
      }
      default: return 0;
    }
  });
  details.push(softRes);

  // References
  const refRes = evalRules('references', (id) => {
    const refs = Array.isArray(profile.refs_list) ? profile.refs_list : [];
    const cnt = refs.length;
    switch (id) {
      case 'three_refs_mock_done': {
        const strongTenure = refs.filter((r: any) => r?.known_2y === true).length;
        // bonus within cap: add +1 if at least two references know the user ≥2 years
        const base = cnt >= 3 ? 5 : 0;
        return base + (base > 0 && strongTenure >= 2 ? 1 : 0);
      }
      case 'two_refs_or_some_prep': return cnt === 2 ? 3 : 0;
      case 'minimal': return cnt === 1 ? 1 : 0;
      default: return 0;
    }
  });
  details.push(refRes);

  // Finalize
  const total = details.reduce((sum, d) => sum + d.cappedPoints, 0);
  const thresholds = [...config.levelThresholds].sort((a, b) => b.min - a.min);
  const level = disq ? 'Not Eligible' : (thresholds.find(t => total >= t.min)?.level || 'Needs Work');

  return { total, level, details, disqualified: !!disq, disqualifierId: disq?.id };
}

// Helper to map a single category detail to stage with anchor overrides
export function mapDetailToStage(
  detail: EvaluationDetail,
  cfg: Config | undefined,
  categoryStages: Array<{ level: string; min: number }>
): string {
  const percent = detail.categoryMax > 0 ? (detail.cappedPoints / detail.categoryMax) * 100 : 0;
  const sorted = [...categoryStages].sort((a, b) => b.min - a.min);
  let base = (sorted.find(t => percent >= t.min) || sorted[sorted.length - 1]).level;
  // Parse rule ids (strip points suffix if present 'id:pts')
  const matchedIds = (detail.matchedRules || []).map(s => String(s).split(':')[0]);
  const cat = detail.category;
  const lift = (lvl: string) => {
    const order = ['NEEDS_WORK','DEVELOPING','EFFECTIVE','COMPETITIVE'];
    return order.indexOf(lvl) > order.indexOf(base) ? lvl : base;
  };
  // Anchor heuristics per category
  switch (cat) {
    case 'work':
      if (matchedIds.includes('relevant_3y_plus')) base = 'COMPETITIVE';
      else if (
        matchedIds.includes('relevant_1to2y') ||
        matchedIds.includes('ft_1to2y') ||
        matchedIds.includes('ft_2y_plus')
      ) base = lift('EFFECTIVE');
      break;
    case 'education':
      if (matchedIds.includes('bachelor_relevant')) base = 'COMPETITIVE';
      else if (matchedIds.includes('diploma_police_foundations') || matchedIds.includes('any_post_secondary')) base = lift('EFFECTIVE');
      break;
    case 'volunteer':
      if (matchedIds.includes('committed_8h_12m')) base = 'COMPETITIVE';
      else if (matchedIds.includes('steady_4h_6m')) base = lift('EFFECTIVE');
      break;
    case 'certs':
      if (matchedIds.includes('cpr_c_current')) base = lift('EFFECTIVE');
      if (matchedIds.includes('deescalation') || matchedIds.includes('mh_first_aid')) base = lift('EFFECTIVE');
      break;
    case 'softskills':
      if (matchedIds.includes('second_language_proficient') && matchedIds.includes('skills_two_plus')) base = lift('EFFECTIVE');
      break;
    case 'references':
      if (matchedIds.includes('three_refs_mock_done')) base = lift('EFFECTIVE');
      break;
    case 'driving':
      if (matchedIds.includes('full_license_clean_24m')) base = lift('EFFECTIVE');
      break;
    case 'background':
      if (matchedIds.includes('clean_all')) base = lift('EFFECTIVE');
      break;
  }
  return base;
}


