export type LfiCategoryKey = 'community' | 'service' | 'motivation' | 'situational';

export type LfiConfig = {
  overview: { 
    intro: string; 
    bullets: string[] 
  };
  categories: Array<{
    key: LfiCategoryKey;
    title: string;
    tips: string[];
    questions: string[];
  }>;
};

export type LfiResponse = {
  id?: string;
  user_id: string;
  category_key: LfiCategoryKey;
  question: string;
  answer?: string | null;
  practiced: boolean;
  updated_at?: string;
  created_at?: string;
};

export type LfiNotes = {
  user_id: string;
  notes?: string | null;
  updated_at?: string;
  created_at?: string;
};

export type LfiProgress = {
  totalQuestions: number;
  practicedQuestions: number;
  percentage: number;
};

