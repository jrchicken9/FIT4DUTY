export type LFIQuestionKey =
  | "about_you"
  | "employment_volunteer"
  | "knowledge_service"
  | "community_issues"
  | "motivation"
  | "driving_record";

export type MatchVerdict = "correct" | "incorrect" | "not_mentioned";

export interface LFIGradingCriteria {
  key: LFIQuestionKey;
  prompts: string[];
  // keywords to detect substance; these raise Relevance & Specificity when present with context
  substanceSignals?: string[];
  // signals for values alignment
  valuesSignals?: string[];
  // reflection markers
  reflectionSignals?: string[];
  // ownership markers
  ownershipSignals?: string[];
  // enrichment facts (bonus only, no penalties)
  enrichment?: Array<"chiefName" | "divisionsCount" | "programsOrUnits" | "jurisdictionNames">;
  // guidance shown if <85
  guidanceTips: string[];
}

export interface PoliceService {
  id: string;
  name: string;
  lead_title: string;
  lead_name: string;
  lead_aliases: string[];
  divisions_count?: number;
  jurisdiction_names: string[];
  programs_or_units: string[];
  valid_from?: string;
  valid_to?: string;
  updated_by?: string;
  updated_at?: string;
}

export interface LFIGradingResult {
  score: number; // 0-100
  label: "Competitive" | "Effective" | "Developing" | "Needs Work";
  notes: string[];
  tips: string[];
  detected: {
    words: number;
    substanceHits: number;
    valHits: number;
    bonusApplied: number;
    starTokensFound?: number;
    depthBoost?: number;
  };
}

export interface UserLFIAnswer {
  id: string;
  user_id: string;
  question_key: LFIQuestionKey;
  answer_text: string;
  score: number;
  label: string;
  notes: string[];
  tips: string[];
  detected: any;
  service_id?: string;
  created_at: string;
}

export interface LFIGradingInput {
  text: string;
  criteria: LFIGradingCriteria;
  service?: {
    chiefName?: string;
    divisionsCount?: number;
    programsOrUnits?: string[];
    jurisdictionNames?: string[];
  };
}
