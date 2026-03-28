// Types
export type CompetitivenessLevel =
  | "NEEDS_WORK"
  | "DEVELOPING"
  | "EFFECTIVE"
  | "COMPETITIVE";

export type CategoryKey =
  | "education"
  | "work"
  | "volunteer"
  | "certs"
  | "fitness"
  | "driving"
  | "background"
  | "softskills"
  | "references";

export interface Rule {
  id: string;
  points: number;
  repeatable?: boolean; // for stackable certs, etc.
  cap?: number;         // category cap for repeatables
  capCategory?: boolean;
}

export interface CategoryConfig {
  weight: number;         // internal only; UI never shows numbers
  rules: Rule[];
  displayName: string;
  summaryHints: {
    empty: string;        // shown if user has no entries
    improve: string;      // short tip for "what to do next"
  };
}

export interface Disqualifier {
  id: string;
  effect:
    | { level: CompetitivenessLevel }
    | { action: "set_driving_zero_and_flag" };
}

export interface LevelThreshold {
  level: CompetitivenessLevel;
  min: number; // mapped internally to total 0..100
}

export interface RelevanceMap {
  educationRelevantFields: string[];
  workRelevantTags: string[];
  volunteerFocusAreas: string[];
}

export interface DisplayTokens {
  levelLabels: Record<CompetitivenessLevel, string>;
  levelBadges: Record<CompetitivenessLevel, { tone: "neutral" | "warning" | "positive" | "critical"; className: string }>;
  categoryOrder: CategoryKey[];
}

export interface CompetitivenessConfig {
  categories: Record<CategoryKey, CategoryConfig>;
  thresholds: LevelThreshold[];
  disqualifiers: Disqualifier[];
  relevance: RelevanceMap;
  display: DisplayTokens;
  // Optional per-category stage thresholds (override global thresholds for section badges)
  categoryStages?: Partial<Record<CategoryKey, LevelThreshold[]>>;
}

// Default Config (v1)
export const DEFAULT_COMPETITIVENESS_CONFIG: CompetitivenessConfig = {
  categories: {
    education: {
      weight: 15,
      displayName: "Education",
      summaryHints: {
        empty: "Add your highest credential and program details.",
        improve: "Relevant 2-year+ programs (e.g., Police Foundations, Criminology) strengthen your profile."
      },
      rules: [
        { id: "bachelor_relevant", points: 15 },
        { id: "diploma_police_foundations", points: 12 },
        { id: "any_post_secondary", points: 9 },
        { id: "extra_post_secondary", points: 3, repeatable: true, cap: 9 },
        { id: "high_school_only", points: 4 },
        { id: "recent_grad_bonus", points: 1, capCategory: true }
      ]
    },
    work: {
      weight: 20,
      displayName: "Work Experience",
      summaryHints: {
        empty: "Add past and current jobs (title, dates, hours/week).",
        improve: "Sustained public-facing or safety roles and leadership responsibilities help most."
      },
      rules: [
        { id: "relevant_3y_plus", points: 20 },
        { id: "relevant_1to2y", points: 14 },
        { id: "nonrel_leadership_3y_plus", points: 12 },
        { id: "ft_2y_plus", points: 10 },
        { id: "ft_1to2y", points: 8 },
        { id: "under_1y", points: 4 }
      ]
    },
    volunteer: {
      weight: 10,
      displayName: "Volunteer & Community",
      summaryHints: {
        empty: "Add community service, coaching, mentoring, or outreach.",
        improve: "Aim for 6–12 months of consistent service (4–8 hrs/month) with responsibility."
      },
      rules: [
        { id: "committed_8h_12m", points: 10 },
        { id: "steady_4h_6m", points: 7 },
        { id: "occasional", points: 4 },
        { id: "vol_lead_role", points: 1, capCategory: true },
        { id: "hours_lifetime_150", points: 1, capCategory: true },
        { id: "hours_12m_75", points: 1, capCategory: true }
      ]
    },
    certs: {
      weight: 10,
      displayName: "Certifications",
      summaryHints: {
        empty: "Add First Aid/CPR, Mental Health First Aid, and any conflict management training.",
        improve: "Keep certifications current; stack relevant ones for breadth."
      },
      rules: [
        { id: "cpr_c_current", points: 3 },
        { id: "mh_first_aid", points: 3 },
        { id: "deescalation", points: 2 },
        { id: "extra_relevant_cert", points: 2, repeatable: true, cap: 10 },
        { id: "naloxone_trained", points: 1, capCategory: true },
        { id: "credential_recent_24m", points: 1, capCategory: true }
      ]
    },
    fitness: {
      weight: 15,
      displayName: "Physical Readiness",
      summaryHints: {
        empty: "Log PREP/PIN status or recent fitness indicators.",
        improve: "Verified recent PREP/PIN or strong indicators (e.g., shuttle, plank) boosts readiness."
      },
      rules: [
        { id: "prep_pass_6m", points: 15 },
        { id: "strong_indicators", points: 12 },
        { id: "average_indicators", points: 8 },
        { id: "below_avg_or_unknown", points: 4 }
      ]
    },
    driving: {
      weight: 10,
      displayName: "Driving & Record",
      summaryHints: {
        empty: "Add licence class and recent abstract if available.",
        improve: "Maintain a clean abstract for 24 months; avoid new infractions."
      },
      rules: [
        { id: "full_license_clean_24m", points: 10 },
        { id: "one_minor_infraction", points: 8 },
        { id: "multi_minor", points: 5 }
      ]
    },
    background: {
      weight: 10,
      displayName: "Background & Integrity",
      summaryHints: {
        empty: "Confirm legal status, education verification, and general integrity items.",
        improve: "Resolve minor credit issues and document stable history."
      },
      rules: [
        { id: "clean_all", points: 10 },
        { id: "minor_credit", points: 8 },
        { id: "discipline_or_credit_trend", points: 4 },
        { id: "social_media_ack", points: 1, capCategory: true }
      ]
    },
    softskills: {
      weight: 5,
      displayName: "Soft Skills",
      summaryHints: {
        empty: "Add leadership, communication, community-facing roles.",
        improve: "Highlight coaching, team lead, and customer-service experience."
      },
      rules: [
        { id: "leadership_role", points: 3 },
        { id: "customer_service_1y", points: 2 },
        { id: "second_language_proficient", points: 2, capCategory: true },
        { id: "skills_two_plus", points: 1, capCategory: true }
      ]
    },
    references: {
      weight: 5,
      displayName: "References & Prep",
      summaryHints: {
        empty: "Add 2–3 references and interview prep activities.",
        improve: "Line up 3 strong references; complete a mock interview."
      },
      rules: [
        { id: "three_refs_mock_done", points: 5 },
        { id: "two_refs_or_some_prep", points: 3 },
        { id: "minimal", points: 1 },
        { id: "tenure_two_refs_2y", points: 1, capCategory: true }
      ]
    }
  },

  thresholds: [
    { level: "COMPETITIVE", min: 75 },
    { level: "EFFECTIVE", min: 55 },
    { level: "DEVELOPING", min: 35 },
    { level: "NEEDS_WORK", min: 0 }
  ],

  disqualifiers: [
    { id: "criminal_open_or_recent_conviction", effect: { level: "NEEDS_WORK" } },
    { id: "dishonesty", effect: { level: "NEEDS_WORK" } },
    { id: "recent_major_driving_offense", effect: { action: "set_driving_zero_and_flag" } }
  ],

  relevance: {
    educationRelevantFields: [
      "police foundations","criminology","justice studies","law enforcement",
      "psychology","sociology","political science","public safety","security"
    ],
    workRelevantTags: [
      "security/public safety","corrections","military","auxiliary police",
      "customer-facing","conflict resolution","report writing","leadership",
      "community outreach","shift work","first aid"
    ],
    volunteerFocusAreas: [
      "youth","seniors","vulnerable","community events","coaching/mentoring","emergency response"
    ]
  },

  display: {
    levelLabels: {
      NEEDS_WORK: "Needs Work",
      DEVELOPING: "Developing",
      EFFECTIVE: "Effective",
      COMPETITIVE: "Competitive"
    },
    // Tailwind / shadcn-friendly badge classes (adjust to your design system)
    levelBadges: {
      NEEDS_WORK:   { tone: "critical", className: "bg-red-100 text-red-700 border border-red-200" },
      DEVELOPING:   { tone: "warning",  className: "bg-amber-100 text-amber-700 border border-amber-200" },
      EFFECTIVE:    { tone: "neutral",  className: "bg-blue-100 text-blue-700 border border-blue-200" },
      COMPETITIVE:  { tone: "positive", className: "bg-emerald-100 text-emerald-700 border border-emerald-200" }
    },
    categoryOrder: [
      "education","work","volunteer","certs","fitness","driving","background","softskills","references"
    ]
  },
  categoryStages: {
    education: [
      { level: "COMPETITIVE", min: 75 },
      { level: "EFFECTIVE", min: 55 },
      { level: "DEVELOPING", min: 35 },
      { level: "NEEDS_WORK", min: 0 }
    ],
    work: [
      { level: "COMPETITIVE", min: 75 },
      { level: "EFFECTIVE", min: 55 },
      { level: "DEVELOPING", min: 35 },
      { level: "NEEDS_WORK", min: 0 }
    ],
    volunteer: [
      { level: "COMPETITIVE", min: 75 },
      { level: "EFFECTIVE", min: 55 },
      { level: "DEVELOPING", min: 35 },
      { level: "NEEDS_WORK", min: 0 }
    ],
    certs: [
      { level: "COMPETITIVE", min: 75 },
      { level: "EFFECTIVE", min: 55 },
      { level: "DEVELOPING", min: 35 },
      { level: "NEEDS_WORK", min: 0 }
    ],
    softskills: [
      { level: "COMPETITIVE", min: 75 },
      { level: "EFFECTIVE", min: 55 },
      { level: "DEVELOPING", min: 35 },
      { level: "NEEDS_WORK", min: 0 }
    ],
    references: [
      { level: "COMPETITIVE", min: 75 },
      { level: "EFFECTIVE", min: 55 },
      { level: "DEVELOPING", min: 35 },
      { level: "NEEDS_WORK", min: 0 }
    ],
    driving: [
      { level: "COMPETITIVE", min: 75 },
      { level: "EFFECTIVE", min: 55 },
      { level: "DEVELOPING", min: 35 },
      { level: "NEEDS_WORK", min: 0 }
    ]
  }
};

// Helper to map a 0..100 internal score to a level + display bundle
export function mapScoreToLevel(total0to100: number, hasNotEligible: boolean) {
  if (hasNotEligible) return { level: "NEEDS_WORK" as CompetitivenessLevel };
  const t = DEFAULT_COMPETITIVENESS_CONFIG.thresholds;
  const sorted = [...t].sort((a, b) => b.min - a.min);
  const hit = sorted.find(x => total0to100 >= x.min) ?? { level: "NEEDS_WORK" as CompetitivenessLevel, min: 0 };
  return { level: hit.level };
}

export function mapScoreToCategoryLevel(category: CategoryKey, percent0to100: number) {
  const stages = DEFAULT_COMPETITIVENESS_CONFIG.categoryStages?.[category] || DEFAULT_COMPETITIVENESS_CONFIG.thresholds;
  const sorted = [...stages].sort((a, b) => b.min - a.min);
  const hit = sorted.find(x => percent0to100 >= x.min) ?? { level: "NEEDS_WORK" as CompetitivenessLevel, min: 0 };
  return hit.level;
}


