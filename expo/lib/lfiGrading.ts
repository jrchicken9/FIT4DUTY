import { LFIGradingInput, LFIGradingResult, MatchVerdict } from "@/types/lfiGrading";

// Simple Jaro-Winkler distance implementation
function jaroWinkler(s1: string, s2: string): number {
  if (s1 === s2) return 1.0;
  
  const len1 = s1.length;
  const len2 = s2.length;
  
  if (len1 === 0 || len2 === 0) return 0.0;
  
  const matchWindow = Math.floor(Math.max(len1, len2) / 2) - 1;
  if (matchWindow < 0) return 0.0;
  
  const s1Matches = new Array(len1).fill(false);
  const s2Matches = new Array(len2).fill(false);
  
  let matches = 0;
  let transpositions = 0;
  
  // Find matches
  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, len2);
    
    for (let j = start; j < end; j++) {
      if (s2Matches[j] || s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }
  
  if (matches === 0) return 0.0;
  
  // Count transpositions
  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }
  
  const jaro = (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3.0;
  
  // Winkler modification
  let prefix = 0;
  for (let i = 0; i < Math.min(len1, len2, 4); i++) {
    if (s1[i] === s2[i]) prefix++;
    else break;
  }
  
  return jaro + (prefix * 0.1 * (1 - jaro));
}

// Normalize name for fuzzy matching
function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .replace(/\b(chief|commissioner|of|police|sir|mr|mrs|ms|dr)\b/g, "")
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Check if a chief/leadership name is mentioned correctly
function checkChiefMention(answer: string, service: {
  lead_name: string;
  lead_aliases?: string[];
}): MatchVerdict {
  const hay = normalizeName(answer);
  const targets = [service.lead_name, ...(service.lead_aliases || [])].map(normalizeName);

  // Quick contains check
  if (targets.some(t => hay.includes(t))) return "correct";

  // Fuzzy scan across tokens (split answer into 2-3 word windows)
  const tokens = hay.split(" ").filter(Boolean);
  const windows: string[] = [];
  for (let n = 1; n <= 3; n++) {
    for (let i = 0; i + n <= tokens.length; i++) {
      windows.push(tokens.slice(i, i + n).join(" "));
    }
  }
  
  const isClose = (s: string) => targets.some(t => jaroWinkler(s, t) >= 0.90);
  if (windows.some(isClose)) return "correct";

  // Check if user asserts a different proper name
  const properNameRegex = /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)\b/g;
  const assertedNames = (answer.match(properNameRegex) || [])
    .map(normalizeName)
    .filter(n => n.length > 0);

  if (assertedNames.length && !assertedNames.some(isClose)) return "incorrect";

  return "not_mentioned";
}

// Main grading function - content-first approach
export function gradeLFIAnswer({
  text,
  criteria,
  service
}: LFIGradingInput): LFIGradingResult {
  const t = (text || "").trim();
  const lower = t.toLowerCase();
  const words = t.split(/\s+/).filter(Boolean).length;

  // Initialize scoring buckets
  let relSpec = 0; // Relevance & Specificity (0-35)
  let insight = 0; // Insight & Reflection (0-20)
  let clarity = 0; // Structure & Clarity (0-20)
  let align = 0; // Values & Alignment (0-15)
  let ownership = 0; // Ownership & Accountability (0-10)
  let bonus = 0; // Enrichment bonus (max +10)
  
  const notes: string[] = [];
  const tips: string[] = [];

  // Helper function to check for signal hits
  const hit = (arr?: string[]) => (arr || []).filter(k => lower.includes(k));

  // Relevance & Specificity (35 points)
  if (t.length > 0) relSpec += 10; // Basic response
  
  const substanceHits = hit(criteria.substanceSignals);
  relSpec += Math.min(15, substanceHits.length * 3); // Substance signals
  
  // Connect to policing context
  if (/(community|public|polic|safety|trust|partnership)/.test(lower)) relSpec += 5;
  
  // Concrete details (numbers, proper nouns)
  const numerics = (t.match(/\b\d+\b/g) || []).length;
  if (numerics >= 1) relSpec += 2;
  
  const proper = (t.match(/\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)?\b/g) || []).length;
  if (proper >= 2) relSpec += 3;

  // Insight & Reflection (20 points)
  const reflHits = hit(criteria.reflectionSignals);
  insight += Math.min(12, reflHits.length * 4);
  
  // Explains why, not just what
  if (/\bwhy\b|\bbecause\b|\bso that\b/.test(lower)) insight += 8;

  // Structure & Clarity (20 points)
  if (words >= 60 && words <= 250) clarity += 8; 
  else clarity += 5; // Length appropriateness
  
  // STAR method indicators
  if (/(situation|task|action|result|as a result)/.test(lower)) clarity += 6;
  
  // Structure indicators
  if (/\n\n|[-•]/.test(t)) clarity += 6;

  // Values & Alignment (15 points)
  const valHits = hit(criteria.valuesSignals);
  align += Math.min(10, valHits.length * 3);
  
  if (/(mission|values|serve|respect|integrity|community)/.test(lower)) align += 5;

  // Ownership & Accountability (10 points)
  const iCount = (lower.match(/\bi\b/g) || []).length;
  if (iCount >= 3) ownership += 6;
  
  if (/(responsib|accountab|i changed|i improved)/.test(lower)) ownership += 4;

  // Enrichment BONUS ONLY (max +10)
  const capBonus = (val: number) => { bonus = Math.min(10, bonus + val); };
  
  if (criteria.enrichment?.includes("programsOrUnits") && service?.programsOrUnits) {
    const hits = service.programsOrUnits.filter(p => lower.includes(p.toLowerCase()));
    if (hits.length) capBonus(Math.min(6, hits.length * 3));
  }
  
  if (criteria.enrichment?.includes("jurisdictionNames") && service?.jurisdictionNames) {
    if (service.jurisdictionNames.some(j => lower.includes(j.toLowerCase()))) capBonus(2);
  }
  
  if (criteria.enrichment?.includes("divisionsCount") && typeof service?.divisionsCount === "number") {
    if ((t.match(/\b\d+\b/g) || []).map(Number).includes(service.divisionsCount)) capBonus(2);
  }
  
  if (criteria.enrichment?.includes("chiefName") && service?.chiefName) {
    if (lower.includes(service.chiefName.toLowerCase())) capBonus(2);
  }

  // Combine scores (max 110, clamp to 100)
  let score = relSpec + insight + clarity + align + ownership + bonus;
  score = Math.max(0, Math.min(100, score));

  // Determine label
  const label = score >= 85 ? "Competitive" : 
                score >= 70 ? "Effective" : 
                score >= 50 ? "Developing" : "Needs Work";

  // Add guidance tips if score < 85
  if (score < 85) {
    tips.push(...criteria.guidanceTips);
  }

  // Add enrichment notes
  if (bonus > 0) {
    notes.push(`Enrichment recognized +${bonus} points`);
  }

  return {
    score,
    label,
    notes,
    tips,
    detected: {
      words,
      substanceHits: substanceHits.length,
      valHits: valHits.length,
      bonusApplied: bonus
    }
  };
}

// Helper function to get service data for grading
export async function getServiceForGrading(serviceId: string) {
  // This would typically fetch from your database
  // For now, return mock data - replace with actual DB call
  const services: Record<string, any> = {
    'tps': {
      chiefName: 'Myron Demkiw',
      divisionsCount: 17,
      programsOrUnits: ['Community Response Unit', 'Emergency Task Force', 'Marine Unit', 'Traffic Services'],
      jurisdictionNames: ['City of Toronto']
    },
    'prp': {
      chiefName: 'Nishan Duraiappah',
      divisionsCount: 4,
      programsOrUnits: ['Community Mobilization Unit', 'Traffic Services', 'Criminal Investigation Bureau'],
      jurisdictionNames: ['City of Mississauga', 'City of Brampton', 'Town of Caledon']
    },
    'drps': {
      chiefName: 'Peter Moreira',
      divisionsCount: 4,
      programsOrUnits: ['Community Response Unit', 'Traffic Services', 'Criminal Investigation Bureau'],
      jurisdictionNames: ['City of Pickering', 'City of Ajax', 'Town of Whitby', 'City of Oshawa']
    },
    'hrps': {
      chiefName: 'Stephen Tanner',
      divisionsCount: 4,
      programsOrUnits: ['Community Response Unit', 'Traffic Services', 'Criminal Investigation Bureau'],
      jurisdictionNames: ['Town of Oakville', 'Town of Milton', 'City of Burlington', 'Town of Halton Hills']
    },
    'opp': {
      chiefName: 'Thomas Carrique',
      divisionsCount: 6,
      programsOrUnits: ['Highway Safety Division', 'Emergency Response Team', 'Marine Unit', 'Aviation Services'],
      jurisdictionNames: ['Province of Ontario']
    }
  };

  return services[serviceId] || null;
}
