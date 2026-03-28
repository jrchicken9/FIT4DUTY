import { ECIGradingResult, ECIQuestionKey } from "@/types/eciGrading";

export const gradeECIAnswer = (
  answer: string,
  questionKey: ECIQuestionKey
): ECIGradingResult => {
  const lowerAnswer = answer.toLowerCase();
  
  // Check for STAR elements
  const starAnalysis = analyzeSTARStructure(answer);
  
  // Check for ownership language
  const ownershipScore = analyzeOwnership(lowerAnswer);
  
  // Check for competency-specific signals
  const competencyScore = analyzeCompetencySignals(lowerAnswer, questionKey);
  
  // Check for clarity and structure
  const clarityScore = analyzeClarity(answer);
  
  // Calculate overall score
  const starScore = calculateSTARScore(starAnalysis);
  const totalScore = (starScore * 0.4) + (ownershipScore * 0.25) + (competencyScore * 0.2) + (clarityScore * 0.15);
  
  // Determine grade
  let grade: 'Competitive' | 'Effective' | 'Developing' | 'Needs Work';
  if (totalScore >= 85) grade = 'Competitive';
  else if (totalScore >= 70) grade = 'Effective';
  else if (totalScore >= 55) grade = 'Developing';
  else grade = 'Needs Work';
  
  // Generate feedback
  const feedback = generateFeedback(starAnalysis, ownershipScore, competencyScore, clarityScore, questionKey);
  
  return {
    grade,
    score: Math.round(totalScore),
    feedback,
    starAnalysis
  };
};

const analyzeSTARStructure = (answer: string) => {
  const lowerAnswer = answer.toLowerCase();
  
  // Situation indicators
  const situationPresent = /\b(when|during|while|at|in)\b.*\b(was|were|had|happened|occurred|took place)\b/.test(lowerAnswer) ||
                          /\b(situation|circumstance|time|event|incident)\b/.test(lowerAnswer);
  const situationQuality = situationPresent ? 'Good' : 'Poor';
  
  // Task indicators
  const taskPresent = /\b(needed|required|had to|was responsible|my job|my role|expected)\b/.test(lowerAnswer) ||
                     /\b(task|responsibility|objective|goal|challenge)\b/.test(lowerAnswer);
  const taskQuality = taskPresent ? 'Good' : 'Poor';
  
  // Action indicators (focus on "I" statements)
  const actionPresent = /\b(i\s+(did|took|decided|chose|implemented|created|developed|organized|managed|led|handled|resolved|addressed|approached|worked|collaborated|communicated|listened|investigated|analyzed|planned|executed|followed|ensured|made|built|established|maintained|improved|learned|adapted|changed|modified|adjusted|prioritized|focused|concentrated|dedicated|committed|persisted|continued|pushed|drove|motivated|inspired|guided|mentored|supported|helped|assisted|facilitated|coordinated|negotiated|mediated|advocated|represented|presented|explained|clarified|confirmed|verified|checked|monitored|evaluated|assessed|reviewed|reflected|considered|thought|realized|recognized|understood|identified|discovered|found|located|sought|searched|researched|studied|prepared|practiced|rehearsed|trained|developed|enhanced|strengthened|improved|optimized|maximized|minimized|reduced|eliminated|prevented|avoided|overcame|solved|fixed|resolved|addressed|handled|managed|controlled|regulated|maintained|sustained|preserved|protected|secured|ensured|guaranteed|promised|committed|pledged|vowed|swore|agreed|accepted|acknowledged|recognized|appreciated|valued|respected|honored|celebrated|commemorated|marked|noted|observed|witnessed|experienced|encountered|faced|confronted|met|greeted|welcomed|introduced|presented|offered|provided|supplied|delivered|gave|shared|contributed|donated|volunteered|participated|engaged|involved|included|incorporated|integrated|combined|merged|joined|connected|linked|associated|related|correlated|compared|contrasted|distinguished|differentiated|separated|divided|split|classified|categorized|grouped|organized|arranged|structured|designed|created|built|constructed|developed|established|founded|launched|started|initiated|began|commenced|opened|introduced|presented|revealed|disclosed|announced|declared|stated|said|told|informed|notified|advised|warned|alerted|reminded|recalled|remembered|memorized|learned|studied|researched|investigated|explored|examined|analyzed|evaluated|assessed|reviewed|considered|contemplated|reflected|pondered|thought|realized|understood|comprehended|grasped|recognized|identified|discovered|found|located|sought|searched|hunted|looked|watched|observed|monitored|tracked|followed|pursued|chased|hunted|tracked|traced|mapped|charted|plotted|planned|designed|strategized|organized|arranged|scheduled|timed|coordinated|synchronized|aligned|balanced|harmonized|integrated|unified|consolidated|centralized|focused|concentrated|prioritized|ranked|ordered|sequenced|structured|framed|outlined|drafted|sketched|drew|painted|colored|shaded|highlighted|emphasized|stressed|accentuated|underlined|bolded|italicized|formatted|styled|designed|created|built|constructed|developed|established|founded|launched|started|initiated|began|commenced|opened|introduced|presented|revealed|disclosed|announced|declared|stated|said|told|informed|notified|advised|warned|alerted|reminded|recalled|remembered|memorized|learned|studied|researched|investigated|explored|examined|analyzed|evaluated|assessed|reviewed|considered|contemplated|reflected|pondered|thought|realized|understood|comprehended|grasped|recognized|identified|discovered|found|located|sought|searched|hunted|looked|watched|observed|monitored|tracked|followed|pursued|chased|hunted|tracked|traced|mapped|charted|plotted|planned|designed|strategized|organized|arranged|scheduled|timed|coordinated|synchronized|aligned|balanced|harmonized|integrated|unified|consolidated|centralized|focused|concentrated|prioritized|ranked|ordered|sequenced|structured|framed|outlined|drafted|sketched|drew|painted|colored|shaded|highlighted|emphasized|stressed|accentuated|underlined|bolded|italicized|formatted|styled))\b/.test(lowerAnswer);
  const actionQuality = actionPresent ? 'Good' : 'Poor';
  
  // Result indicators
  const resultPresent = /\b(result|outcome|consequence|impact|effect|achieved|accomplished|succeeded|improved|learned|gained|benefited|helped|made a difference|positive|successful|effective|resolved|solved|fixed)\b/.test(lowerAnswer);
  const resultQuality = resultPresent ? 'Good' : 'Poor';
  
  return {
    situation: {
      present: situationPresent,
      quality: situationQuality as 'Good' | 'Fair' | 'Poor',
      feedback: situationPresent 
        ? "Good job setting the context with clear background information."
        : "Consider starting with 'During my time at...' or 'When I was working...' to set the scene."
    },
    task: {
      present: taskPresent,
      quality: taskQuality as 'Good' | 'Fair' | 'Poor',
      feedback: taskPresent
        ? "Well explained your specific role and responsibilities."
        : "Clarify what you needed to accomplish and your specific role in the situation."
    },
    action: {
      present: actionPresent,
      quality: actionQuality as 'Good' | 'Fair' | 'Poor',
      feedback: actionPresent
        ? "Excellent use of 'I' statements to describe your specific actions."
        : "Focus more on YOUR actions using 'I did...' statements rather than 'we' or 'the team'."
    },
    result: {
      present: resultPresent,
      quality: resultQuality as 'Good' | 'Fair' | 'Poor',
      feedback: resultPresent
        ? "Great job explaining the outcome and what you learned."
        : "Include the positive result, impact, or lesson learned from this experience."
    }
  };
};

const analyzeOwnership = (answer: string): number => {
  const iStatements = (answer.match(/\bi\s+(did|took|decided|chose|implemented|created|developed|organized|managed|led|handled|resolved|addressed|approached|worked|collaborated|communicated|listened|investigated|analyzed|planned|executed|followed|ensured|made|built|established|maintained|improved|learned|adapted|changed|modified|adjusted|prioritized|focused|concentrated|dedicated|committed|persisted|continued|pushed|drove|motivated|inspired|guided|mentored|supported|helped|assisted|facilitated|coordinated|negotiated|mediated|advocated|represented|presented|explained|clarified|confirmed|verified|checked|monitored|evaluated|assessed|reviewed|reflected|considered|thought|realized|recognized|understood|identified|discovered|found|located|sought|searched|researched|studied|prepared|practiced|rehearsed|trained|developed|enhanced|strengthened|improved|optimized|maximized|minimized|reduced|eliminated|prevented|avoided|overcame|solved|fixed|resolved|addressed|handled|managed|controlled|regulated|maintained|sustained|preserved|protected|secured|ensured|guaranteed|promised|committed|pledged|vowed|swore|agreed|accepted|acknowledged|recognized|appreciated|valued|respected|honored|celebrated|commemorated|marked|noted|observed|witnessed|experienced|encountered|faced|confronted|met|greeted|welcomed|introduced|presented|offered|provided|supplied|delivered|gave|shared|contributed|donated|volunteered|participated|engaged|involved|included|incorporated|integrated|combined|merged|joined|connected|linked|associated|related|correlated|compared|contrasted|distinguished|differentiated|separated|divided|split|classified|categorized|grouped|organized|arranged|structured|designed|created|built|constructed|developed|established|founded|launched|started|initiated|began|commenced|opened|introduced|presented|revealed|disclosed|announced|declared|stated|said|told|informed|notified|advised|warned|alerted|reminded|recalled|remembered|memorized|learned|studied|researched|investigated|explored|examined|analyzed|evaluated|assessed|reviewed|considered|contemplated|reflected|pondered|thought|realized|understood|comprehended|grasped|recognized|identified|discovered|found|located|sought|searched|hunted|looked|watched|observed|monitored|tracked|followed|pursued|chased|hunted|tracked|traced|mapped|charted|plotted|planned|designed|strategized|organized|arranged|scheduled|timed|coordinated|synchronized|aligned|balanced|harmonized|integrated|unified|consolidated|centralized|focused|concentrated|prioritized|ranked|ordered|sequenced|structured|framed|outlined|drafted|sketched|drew|painted|colored|shaded|highlighted|emphasized|stressed|accentuated|underlined|bolded|italicized|formatted|styled)\b/g) || []).length;
  
  const weStatements = (answer.match(/\bwe\s+(did|took|decided|chose|implemented|created|developed|organized|managed|led|handled|resolved|addressed|approached|worked|collaborated|communicated|listened|investigated|analyzed|planned|executed|followed|ensured|made|built|established|maintained|improved|learned|adapted|changed|modified|adjusted|prioritized|focused|concentrated|dedicated|committed|persisted|continued|pushed|drove|motivated|inspired|guided|mentored|supported|helped|assisted|facilitated|coordinated|negotiated|mediated|advocated|represented|presented|explained|clarified|confirmed|verified|checked|monitored|evaluated|assessed|reviewed|reflected|considered|thought|realized|recognized|understood|identified|discovered|found|located|sought|searched|researched|studied|prepared|practiced|rehearsed|trained|developed|enhanced|strengthened|improved|optimized|maximized|minimized|reduced|eliminated|prevented|avoided|overcame|solved|fixed|resolved|addressed|handled|managed|controlled|regulated|maintained|sustained|preserved|protected|secured|ensured|guaranteed|promised|committed|pledged|vowed|swore|agreed|accepted|acknowledged|recognized|appreciated|valued|respected|honored|celebrated|commemorated|marked|noted|observed|witnessed|experienced|encountered|faced|confronted|met|greeted|welcomed|introduced|presented|offered|provided|supplied|delivered|gave|shared|contributed|donated|volunteered|participated|engaged|involved|included|incorporated|integrated|combined|merged|joined|connected|linked|associated|related|correlated|compared|contrasted|distinguished|differentiated|separated|divided|split|classified|categorized|grouped|organized|arranged|structured|designed|created|built|constructed|developed|established|founded|launched|started|initiated|began|commenced|opened|introduced|presented|revealed|disclosed|announced|declared|stated|said|told|informed|notified|advised|warned|alerted|reminded|recalled|remembered|memorized|learned|studied|researched|investigated|explored|examined|analyzed|evaluated|assessed|reviewed|considered|contemplated|reflected|pondered|thought|realized|understood|comprehended|grasped|recognized|identified|discovered|found|located|sought|searched|hunted|looked|watched|observed|monitored|tracked|followed|pursued|chased|hunted|tracked|traced|mapped|charted|plotted|planned|designed|strategized|organized|arranged|scheduled|timed|coordinated|synchronized|aligned|balanced|harmonized|integrated|unified|consolidated|centralized|focused|concentrated|prioritized|ranked|ordered|sequenced|structured|framed|outlined|drafted|sketched|drew|painted|colored|shaded|highlighted|emphasized|stressed|accentuated|underlined|bolded|italicized|formatted|styled)\b/g) || []).length;
  
  const totalStatements = iStatements + weStatements;
  if (totalStatements === 0) return 0;
  
  return Math.min(100, (iStatements / totalStatements) * 100);
};

const analyzeCompetencySignals = (answer: string, questionKey: ECIQuestionKey): number => {
  const competencySignals: Record<ECIQuestionKey, string[]> = {
    communication: ['communicated', 'explained', 'listened', 'spoke', 'wrote', 'presented', 'clarified', 'understood', 'message', 'conversation', 'dialogue'],
    self_control: ['calm', 'composed', 'controlled', 'managed', 'regulated', 'stayed focused', 'remained professional', 'handled stress', 'emotional'],
    relationship_building: ['trust', 'rapport', 'relationship', 'collaborated', 'worked together', 'built', 'established', 'maintained', 'connection'],
    problem_solving: ['analyzed', 'identified', 'solved', 'resolved', 'figured out', 'determined', 'evaluated', 'assessed', 'investigated', 'solution'],
    flexibility: ['adapted', 'adjusted', 'changed', 'modified', 'flexible', 'pivoted', 'shifted', 'learned quickly', 'new approach'],
    valuing_diversity: ['diverse', 'different', 'inclusive', 'respectful', 'understanding', 'perspective', 'background', 'culture', 'inclusion'],
    initiative: ['took initiative', 'proactive', 'volunteered', 'suggested', 'improved', 'enhanced', 'went beyond', 'extra effort', 'self-directed']
  };
  
  const signals = competencySignals[questionKey] || [];
  const matches = signals.filter(signal => answer.includes(signal)).length;
  
  return Math.min(100, (matches / signals.length) * 100);
};

const analyzeClarity = (answer: string): number => {
  const sentences = answer.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLength = sentences.reduce((sum, sentence) => sum + sentence.split(' ').length, 0) / sentences.length;
  
  let clarityScore = 100;
  
  // Penalize overly long sentences
  if (avgSentenceLength > 25) clarityScore -= 20;
  else if (avgSentenceLength > 20) clarityScore -= 10;
  
  // Penalize very short answers
  if (answer.length < 100) clarityScore -= 30;
  else if (answer.length < 200) clarityScore -= 15;
  
  // Reward good structure
  if (answer.includes('First') || answer.includes('Then') || answer.includes('Finally')) clarityScore += 10;
  
  return Math.max(0, Math.min(100, clarityScore));
};

const calculateSTARScore = (starAnalysis: any): number => {
  let score = 0;
  
  if (starAnalysis.situation.present) score += 25;
  if (starAnalysis.task.present) score += 25;
  if (starAnalysis.action.present) score += 25;
  if (starAnalysis.result.present) score += 25;
  
  return score;
};

const generateFeedback = (
  starAnalysis: any,
  ownershipScore: number,
  competencyScore: number,
  clarityScore: number,
  questionKey: ECIQuestionKey
) => {
  const strengths: string[] = [];
  const areasForImprovement: string[] = [];
  const specificTips: string[] = [];
  
  // STAR feedback
  if (starAnalysis.situation.present) strengths.push("Well-structured situation setup");
  else areasForImprovement.push("Provide clearer background context");
  
  if (starAnalysis.task.present) strengths.push("Clear explanation of your role");
  else areasForImprovement.push("Clarify your specific responsibilities");
  
  if (starAnalysis.action.present) strengths.push("Good use of 'I' statements for actions");
  else areasForImprovement.push("Focus more on YOUR specific actions");
  
  if (starAnalysis.result.present) strengths.push("Effective outcome description");
  else areasForImprovement.push("Include the positive result or lesson learned");
  
  // Ownership feedback
  if (ownershipScore >= 80) strengths.push("Strong ownership of your actions");
  else if (ownershipScore < 50) areasForImprovement.push("Use more 'I' statements instead of 'we'");
  
  // Competency feedback
  if (competencyScore >= 70) strengths.push("Good demonstration of the competency");
  else areasForImprovement.push("Include more specific examples of the competency in action");
  
  // Clarity feedback
  if (clarityScore >= 80) strengths.push("Clear and well-structured response");
  else if (clarityScore < 60) areasForImprovement.push("Improve clarity and organization");
  
  // Specific tips based on competency
  const competencyTips: Record<ECIQuestionKey, string[]> = {
    communication: [
      "Focus on how you adapted your communication style",
      "Include specific words or phrases you used",
      "Mention how you ensured understanding"
    ],
    self_control: [
      "Describe your internal thought process during stress",
      "Explain specific techniques you used to stay calm",
      "Show how you maintained professionalism"
    ],
    relationship_building: [
      "Detail the specific actions you took to build trust",
      "Explain how you found common ground",
      "Describe the relationship before and after"
    ],
    problem_solving: [
      "Walk through your analytical process step by step",
      "Explain how you gathered information",
      "Detail your decision-making criteria"
    ],
    flexibility: [
      "Describe what changed and why",
      "Explain how you adapted your approach",
      "Show your learning curve"
    ],
    valuing_diversity: [
      "Explain how you ensured all perspectives were heard",
      "Describe what you learned from different viewpoints",
      "Show respect for cultural differences"
    ],
    initiative: [
      "Explain what motivated you to take action",
      "Describe the extra effort you put in",
      "Show how you went beyond expectations"
    ]
  };
  
  specificTips.push(...competencyTips[questionKey]);
  
  return {
    strengths,
    areasForImprovement,
    specificTips
  };
};
