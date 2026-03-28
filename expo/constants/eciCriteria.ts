import { ECIGradingCriteria } from "../types/eciGrading";

export const ECI_COMPETENCIES: ECIGradingCriteria[] = [
  {
    key: "communication",
    title: "Communication",
    description: "Ability to communicate effectively with diverse populations, both verbally and in writing",
    examplePrompt: "Tell me about a time when you had to explain a complex situation to someone who didn't understand.",
    sampleQuestions: [
      "Describe a time when you had to deliver difficult news to someone.",
      "Give an example of when you had to communicate with someone from a different cultural background.",
      "Tell me about a time when your communication skills helped resolve a conflict."
    ],
    starGuidance: {
      situation: "Set the context - who, what, when, where",
      task: "Explain your specific role and responsibility",
      action: "Detail the specific steps you took to communicate effectively",
      result: "Describe the outcome and what you learned"
    }
  },
  {
    key: "self_control",
    title: "Self-Control",
    description: "Ability to maintain emotional regulation and composure under stress or provocation",
    examplePrompt: "Tell me about a time when you remained calm in a highly stressful situation.",
    sampleQuestions: [
      "Describe a situation where you were criticized unfairly. How did you respond?",
      "Give an example of when you had to control your emotions during a difficult conversation.",
      "Tell me about a time when you were under extreme pressure but maintained your composure."
    ],
    starGuidance: {
      situation: "Describe the challenging circumstances you faced",
      task: "Explain what was expected of you in that moment",
      action: "Detail how you managed your emotions and stayed focused",
      result: "Share the positive outcome and lessons learned about self-regulation"
    }
  },
  {
    key: "relationship_building",
    title: "Relationship Building",
    description: "Ability to establish trust, rapport, and positive relationships with colleagues and community members",
    examplePrompt: "Tell me about a time when you had to build trust with someone who was initially skeptical of you.",
    sampleQuestions: [
      "Describe a time when you had to work with someone you initially didn't get along with.",
      "Give an example of how you built rapport with a difficult person.",
      "Tell me about a time when you had to rebuild trust after a misunderstanding."
    ],
    starGuidance: {
      situation: "Explain the initial relationship dynamic and challenges",
      task: "Describe what needed to be accomplished together",
      action: "Detail the specific actions you took to build the relationship",
      result: "Share how the relationship improved and what you learned"
    }
  },
  {
    key: "problem_solving",
    title: "Problem Solving / Analytical Thinking",
    description: "Ability to analyze situations, identify problems, and develop effective solutions",
    examplePrompt: "Tell me about a time when you had to solve a complex problem with limited information.",
    sampleQuestions: [
      "Describe a situation where you had to think quickly to resolve an unexpected problem.",
      "Give an example of when you had to analyze a situation from multiple perspectives.",
      "Tell me about a time when your analytical skills led to a successful outcome."
    ],
    starGuidance: {
      situation: "Describe the problem or challenge you encountered",
      task: "Explain what needed to be solved and any constraints",
      action: "Detail your analytical process and the steps you took",
      result: "Share the solution and its effectiveness"
    }
  },
  {
    key: "flexibility",
    title: "Flexibility / Adaptability",
    description: "Ability to adapt to changing circumstances and remain effective in new situations",
    examplePrompt: "Tell me about a time when you had to quickly adapt to a significant change in your work environment.",
    sampleQuestions: [
      "Describe a situation where you had to change your approach mid-task due to new information.",
      "Give an example of when you had to learn something new quickly to meet a deadline.",
      "Tell me about a time when you had to work in an unfamiliar environment."
    ],
    starGuidance: {
      situation: "Explain the change or new circumstances you faced",
      task: "Describe what needed to be accomplished despite the change",
      action: "Detail how you adapted your approach or learned new skills",
      result: "Share the successful outcome and what you learned about adaptability"
    }
  },
  {
    key: "valuing_diversity",
    title: "Valuing Diversity / Inclusion",
    description: "Demonstrates respect for and understanding of diverse perspectives and backgrounds",
    examplePrompt: "Tell me about a time when you worked effectively with people from different backgrounds or perspectives.",
    sampleQuestions: [
      "Describe a situation where you had to consider different cultural perspectives to solve a problem.",
      "Give an example of when you advocated for someone who was being treated unfairly.",
      "Tell me about a time when you learned something valuable from someone different from you."
    ],
    starGuidance: {
      situation: "Describe the diverse group or situation you were in",
      task: "Explain what needed to be accomplished together",
      action: "Detail how you ensured everyone's perspective was valued",
      result: "Share the positive outcome and what you learned about inclusion"
    }
  },
  {
    key: "initiative",
    title: "Initiative / Achievement Orientation",
    description: "Demonstrates proactive behavior, drive to achieve goals, and willingness to go beyond basic requirements",
    examplePrompt: "Tell me about a time when you took initiative to improve a process or solve a problem.",
    sampleQuestions: [
      "Describe a situation where you went above and beyond what was expected of you.",
      "Give an example of when you identified an opportunity for improvement and acted on it.",
      "Tell me about a time when you set a challenging goal for yourself and achieved it."
    ],
    starGuidance: {
      situation: "Explain the circumstances and what was the status quo",
      task: "Describe what needed to be improved or achieved",
      action: "Detail the proactive steps you took beyond your basic responsibilities",
      result: "Share the positive impact and what you learned about taking initiative"
    }
  }
];

export const ECI_QUESTION_THEMES = {
  communication: {
    icon: "MessageSquare",
    title: "Communication",
    description: "Verbal and written communication skills with diverse populations"
  },
  self_control: {
    icon: "Shield",
    title: "Self-Control",
    description: "Emotional regulation and composure under stress"
  },
  relationship_building: {
    icon: "Users",
    title: "Relationship Building",
    description: "Building trust and rapport with colleagues and community"
  },
  problem_solving: {
    icon: "Target",
    title: "Problem Solving",
    description: "Analytical thinking and solution development"
  },
  flexibility: {
    icon: "RefreshCw",
    title: "Flexibility",
    description: "Adaptability to changing circumstances"
  },
  valuing_diversity: {
    icon: "Globe",
    title: "Valuing Diversity",
    description: "Respect for diverse perspectives and inclusion"
  },
  initiative: {
    icon: "TrendingUp",
    title: "Initiative",
    description: "Proactive behavior and achievement orientation"
  }
};

export const STAR_METHOD_GUIDANCE = {
  situation: {
    title: "Situation",
    description: "Set the context",
    guidance: "Briefly describe the background and circumstances. Keep it concise but provide enough detail for understanding.",
    example: "During my summer job as a retail supervisor, we had a customer complaint about a product defect..."
  },
  task: {
    title: "Task",
    description: "Explain your responsibility",
    guidance: "Describe what you needed to accomplish and your specific role in the situation.",
    example: "As the supervisor on duty, I was responsible for resolving the customer's concern while maintaining our store's reputation..."
  },
  action: {
    title: "Action",
    description: "Detail what you did",
    guidance: "Focus on YOUR specific actions and decisions. Use 'I' statements and be specific about your behavior.",
    example: "I listened to the customer's concerns, investigated the product issue, and offered a replacement along with an apology..."
  },
  result: {
    title: "Result",
    description: "Share the outcome",
    guidance: "Describe the positive outcome, what you learned, and how it demonstrates the competency being assessed.",
    example: "The customer left satisfied, and I learned the importance of proactive customer service. This experience strengthened my communication skills..."
  }
};

export const ECI_PREPARATION_TIPS = [
  {
    category: "Story Preparation",
    tips: [
      "Prepare 2-3 STAR stories for each competency area",
      "Use recent examples from the last 2-3 years when possible",
      "Practice your stories until you can tell them naturally in 2-3 minutes",
      "Be honest - failures are okay if you show learning and growth"
    ]
  },
  {
    category: "Interview Strategy",
    tips: [
      "Listen carefully to the question and identify which competency is being assessed",
      "Take a moment to think before answering - it's better to pause than rush",
      "Stay focused on your role and actions, not just the situation",
      "Expect follow-up questions like 'What else?' or 'Why did you do that?'"
    ]
  },
  {
    category: "Common Pitfalls",
    tips: [
      "Avoid hypothetical answers - use real examples from your experience",
      "Don't blame others or make excuses - focus on your actions and learning",
      "Don't use the same story for multiple competencies",
      "Avoid overly complex situations - clarity is more important than drama"
    ]
  }
];
