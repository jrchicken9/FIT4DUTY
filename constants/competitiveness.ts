export type CompetitivenessBenchmarks = {
  education: {
    minimum: string;
    competitive: string;
    weight: number;
  };
  work_experience: {
    minimum_years: number;
    competitive_range: string;
    preferred_fields: string[];
    weight: number;
  };
  volunteer_experience: {
    minimum_hours: number;
    competitive_hours: string;
    notes: string;
    weight: number;
  };
  certifications: {
    required: string[];
    competitive_plus: string[];
    weight: number;
  };
  references: {
    required_count: number;
    rules: string;
    weight: number;
  };
};

export const DEFAULT_COMPETITIVENESS_BENCHMARKS: CompetitivenessBenchmarks = {
  education: {
    minimum: 'High School Diploma',
    competitive: '2-4 years Post-Secondary (College Diploma or University Degree)',
    weight: 30,
  },
  work_experience: {
    minimum_years: 2,
    competitive_range: '2-5 years stable full-time employment',
    preferred_fields: ['Public Safety', 'Customer Service', 'Security', 'Corrections', 'Leadership'],
    weight: 25,
  },
  volunteer_experience: {
    minimum_hours: 100,
    competitive_hours: '150-300+ hours',
    notes: 'Consistent long-term volunteering is valued',
    weight: 20,
  },
  certifications: {
    required: ['First Aid/CPR-C'],
    competitive_plus: ['Mental Health First Aid', 'Crisis Intervention', 'De-escalation', 'Second Language'],
    weight: 15,
  },
  references: {
    required_count: 3,
    rules: 'Non-family, preferably supervisors/teachers/volunteer coordinators',
    weight: 10,
  },
};

export const COMPETITIVENESS_BENCHMARKS_CONTENT_KEY = 'application.competitiveness.benchmarks';




