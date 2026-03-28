import { LFIGradingCriteria } from "@/types/lfiGrading";

export const LFI_CRITERIA: LFIGradingCriteria[] = [
  {
    key: "about_you",
    prompts: ["Tell me about yourself / strengths and weaknesses"],
    substanceSignals: ["strength", "weakness", "improve", "learned", "feedback", "example"],
    reflectionSignals: ["learned", "growth", "improved", "reflect", "develop"],
    ownershipSignals: ["i", "i take responsibility", "i was accountable"],
    guidanceTips: [
      "Open with a 3–4 sentence summary tied to policing.",
      "Give one real strength with a brief example.",
      "Name one real weakness and what you're doing about it."
    ]
  },
  {
    key: "employment_volunteer",
    prompts: ["Describe your employment and volunteer history"],
    substanceSignals: ["customer", "public", "shift", "volunteer", "lead", "responsib", "team", "de-escalation"],
    reflectionSignals: ["learned", "growth", "challenge", "adapt", "improve"],
    ownershipSignals: ["i", "i led", "i handled", "i resolved"],
    guidanceTips: [
      "Summarize chronologically; emphasize duties and outcomes.",
      "Connect duties to policing competencies (communication, teamwork).",
      "Mention commitment length and responsibilities in volunteer roles."
    ]
  },
  {
    key: "knowledge_service",
    prompts: ["What do you know about our police service?"],
    substanceSignals: ["division", "district", "community policing", "core values", "mission", "priority"],
    valuesSignals: ["respect", "service", "integrity", "inclusion", "community"],
    enrichment: ["chiefName", "divisionsCount", "programsOrUnits", "jurisdictionNames"], // bonus only
    guidanceTips: [
      "Paraphrase the service's mission/values in your own words.",
      "Reference one current initiative or unit and why it matters.",
      "Explain how your background supports that mission."
    ]
  },
  {
    key: "community_issues",
    prompts: ["What issues affect this community / region?"],
    substanceSignals: ["auto theft", "youth", "mental health", "property crime", "traffic", "domestic", "substance", "road safety", "partnerships"],
    valuesSignals: ["prevention", "engagement", "partnerships", "trust"],
    guidanceTips: [
      "Name 2–3 local issues and why they matter here.",
      "Connect issues to practical policing approaches or partnerships.",
      "Avoid generic lists; show local awareness."
    ]
  },
  {
    key: "motivation",
    prompts: ["Why do you want to be a police officer? Why this service?"],
    substanceSignals: ["mentor", "serve", "community", "growth", "training", "fit", "values"],
    valuesSignals: ["service", "integrity", "respect", "community"],
    guidanceTips: [
      "Use one specific, personal reason tied to this service's values.",
      "Link long-term goals to units/opportunities they offer.",
      "Avoid clichés; show genuine alignment."
    ]
  },
  {
    key: "driving_record",
    prompts: ["Tell me about your driving history / background record"],
    substanceSignals: ["demerit", "collision", "ticket", "abstract", "suspension", "defensive", "conditions", "improved"],
    ownershipSignals: ["i", "i changed", "i now", "i take responsibility"],
    guidanceTips: [
      "Be transparent and explain what changed in your habits.",
      "If clean, note preventative habits (defensive driving, weather).",
      "Show accountability and learning if incidents occurred."
    ]
  }
];

export const LFI_QUESTION_THEMES = {
  about_you: {
    icon: "Users",
    title: "Tell me about yourself / strengths and weaknesses",
    description: "Personal assessment and self-awareness"
  },
  employment_volunteer: {
    icon: "FileText", 
    title: "Describe your employment and volunteer history",
    description: "Professional background and experience"
  },
  knowledge_service: {
    icon: "Building",
    title: "What do you know about our police service?",
    description: "Knowledge of jurisdiction, divisions, Chief/Commissioner"
  },
  community_issues: {
    icon: "Globe",
    title: "What issues affect this community / region?",
    description: "Local awareness and community understanding"
  },
  motivation: {
    icon: "Lightbulb",
    title: "Why do you want to be a police officer? Why this service?",
    description: "Motivations and service alignment"
  },
  driving_record: {
    icon: "Car",
    title: "Tell me about your driving history / background record",
    description: "Accountability and record transparency"
  }
};
