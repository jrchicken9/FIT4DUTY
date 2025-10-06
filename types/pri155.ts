export interface PRI155Domain {
  code: string;
  name: string;
}

export interface PRI155Item {
  id: number;
  text: string;
  domain: string;
  adaptive_key: "T" | "F";
  type: "true_false" | "likert";
}

export interface PRI155Scoring {
  method: string;
  scale: string;
  domains: {
    [key: string]: {
      items: number[];
    };
  };
  scaling_formula: string;
  bands: {
    label: string;
    min: number;
    max: number;
  }[];
}

export interface PRI155Meta {
  instrument: string;
  version: string;
  format: string;
  purpose: string;
  disclaimer: string;
  scoring_policy: string;
}

export interface PRI155Data {
  meta: PRI155Meta;
  domains: PRI155Domain[];
  items: PRI155Item[];
  scoring: PRI155Scoring;
}

export interface PRI155Response {
  itemId: number;
  response: "T" | "F" | "strongly_disagree" | "disagree" | "agree" | "strongly_agree";
  score?: number; // For Likert scale items
}

export interface PRI155Result {
  domain: string;
  domainName: string;
  score: number;
  percentage: number;
  band: string;
  adaptiveResponses: number;
  totalItems: number;
  trueFalseScore: number;
  likertScore: number;
  maxLikertScore: number;
}

export interface PRI155AssessmentResult {
  responses: PRI155Response[];
  results: PRI155Result[];
  completedAt: Date;
  totalScore: number;
  overallBand: string;
}
