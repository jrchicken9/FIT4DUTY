export type ECIGradingCriteria = {
  key: string;
  title: string;
  description: string;
  examplePrompt: string;
  sampleQuestions: string[];
  starGuidance: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
};

export type ECIGradingResult = {
  grade: 'Competitive' | 'Effective' | 'Developing' | 'Needs Work';
  score: number;
  feedback: {
    strengths: string[];
    areasForImprovement: string[];
    specificTips: string[];
  };
  starAnalysis: {
    situation: { present: boolean; quality: 'Good' | 'Fair' | 'Poor'; feedback: string };
    task: { present: boolean; quality: 'Good' | 'Fair' | 'Poor'; feedback: string };
    action: { present: boolean; quality: 'Good' | 'Fair' | 'Poor'; feedback: string };
    result: { present: boolean; quality: 'Good' | 'Fair' | 'Poor'; feedback: string };
  };
};

export type ECIQuestionKey = 
  | 'communication'
  | 'self_control'
  | 'relationship_building'
  | 'problem_solving'
  | 'flexibility'
  | 'valuing_diversity'
  | 'initiative';

export type ECIAnswer = {
  questionKey: ECIQuestionKey;
  answerText: string;
  starBreakdown?: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type ECIDraft = {
  questionKey: ECIQuestionKey;
  draftText: string;
  lastSaved: string;
};
