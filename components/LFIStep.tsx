import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import {
  Users,
  FileText,
  Building,
  Globe,
  Lightbulb,
  Car,
  CheckCircle,
  ArrowRight,
  ArrowDown,
  Target,
  Clock,
  AlertCircle,
  Edit3,
  Edit,
  Star,
  TrendingUp,
  MessageSquare,
  X,
  Eye,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { LFI_CRITERIA, LFI_QUESTION_THEMES } from "@/constants/lfiCriteria";
import { gradeLFIAnswer, getServiceForGrading } from "@/lib/lfiGrading";
import { LFIGradingResult, LFIQuestionKey } from "@/types/lfiGrading";
import ProfessionalBackground from "@/components/ProfessionalBackground";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export default function LFIStep() {
  const { user } = useAuth();
  const [selectedQuestion, setSelectedQuestion] = useState<LFIQuestionKey | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [gradingResult, setGradingResult] = useState<LFIGradingResult | null>(null);
  const [isGrading, setIsGrading] = useState(false);
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [previousAnswer, setPreviousAnswer] = useState<string>("");
  const [previousGrade, setPreviousGrade] = useState<LFIGradingResult | null>(null);
  const [isNewAttempt, setIsNewAttempt] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<LFIQuestionKey, string>>({} as any);
  const [userGrades, setUserGrades] = useState<Record<LFIQuestionKey, LFIGradingResult>>({} as any);
  const [userDrafts, setUserDrafts] = useState<Record<LFIQuestionKey, string>>({} as any);
  const [gradedAnswers, setGradedAnswers] = useState<Record<LFIQuestionKey, string>>({} as any);
  const [showExample, setShowExample] = useState<LFIQuestionKey | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const scrollViewRef = useRef<ScrollView>(null);
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Debug modal state changes
  useEffect(() => {
    console.log('Modal state changed:', showGradingModal);
  }, [showGradingModal]);

  // Load existing answers and grades
  useEffect(() => {
    if (user) {
      loadUserAnswers();
      // Also sync any local storage data to Supabase
      syncLocalStorageToSupabase();
    } else {
      // No user, load from local storage only
      loadFromLocalStorage();
    }
  }, [user]);

  // Network connectivity check
  useEffect(() => {
    const checkConnectivity = async () => {
      try {
        const response = await fetch('https://www.google.com/favicon.ico', {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-cache'
        });
        setIsOnline(true);
        if (user && syncStatus === 'idle') {
          // Try to sync when coming back online
          setSyncStatus('syncing');
          await syncLocalStorageToSupabase();
          setSyncStatus('success');
        }
      } catch {
        setIsOnline(false);
        setSyncStatus('error');
      }
    };

    checkConnectivity();
    const interval = setInterval(checkConnectivity, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [user, syncStatus]);

  const loadFromLocalStorage = () => {
    try {
      const savedAnswers = localStorage.getItem('lfi_user_answers');
      const savedGrades = localStorage.getItem('lfi_user_grades');
      const savedDrafts = localStorage.getItem('lfi_user_drafts');
      const savedGraded = localStorage.getItem('lfi_graded_answers');
      
      if (savedAnswers) {
        setUserAnswers(JSON.parse(savedAnswers));
      }
      if (savedGrades) {
        setUserGrades(JSON.parse(savedGrades));
      }
      if (savedDrafts) {
        setUserDrafts(JSON.parse(savedDrafts));
      }
      if (savedGraded) {
        setGradedAnswers(JSON.parse(savedGraded));
      }
    } catch (error) {
      console.log('Local storage not available');
    }
  };

  const saveToLocalStorage = (answers: Record<LFIQuestionKey, string>, grades: Record<LFIQuestionKey, LFIGradingResult>, drafts?: Record<LFIQuestionKey, string>, graded?: Record<LFIQuestionKey, string>) => {
    try {
      localStorage.setItem('lfi_user_answers', JSON.stringify(answers));
      localStorage.setItem('lfi_user_grades', JSON.stringify(grades));
      if (drafts) localStorage.setItem('lfi_user_drafts', JSON.stringify(drafts));
      if (graded) localStorage.setItem('lfi_graded_answers', JSON.stringify(graded));
    } catch (error) {
      console.log('Local storage save failed');
    }
  };

  const syncLocalStorageToSupabase = async () => {
    if (!user?.id) return;

    try {
      console.log('Syncing local storage data to Supabase...');
      
      const savedAnswers = localStorage.getItem('lfi_user_answers');
      const savedGrades = localStorage.getItem('lfi_user_grades');
      
      if (!savedAnswers || !savedGrades) {
        console.log('No local data to sync');
        return;
      }

      const localAnswers = JSON.parse(savedAnswers);
      const localGrades = JSON.parse(savedGrades);

      // Get current database answers to avoid overwriting newer data
      const { data: dbAnswers } = await supabase
        .from('user_lfi_answers')
        .select('question_key, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const dbAnswerKeys = new Set(dbAnswers?.map(item => item.question_key) || []);

      // Sync each local answer that's not in database or is newer
      for (const [questionKey, answerText] of Object.entries(localAnswers)) {
        const grade = localGrades[questionKey];
        if (!grade) continue;

        // Check if this answer exists in database
        const existingAnswer = dbAnswers?.find(item => item.question_key === questionKey);
        
        if (!existingAnswer) {
          // Insert new answer
          await supabase.from('user_lfi_answers').insert({
            user_id: user.id,
            question_key: questionKey,
            answer_text: answerText,
            score: grade.score,
            label: grade.label,
            notes: grade.notes,
            tips: grade.tips,
            detected: grade.detected,
            service_id: 'tps'
          });
          console.log(`Synced new answer for ${questionKey}`);
        }
      }
      
      console.log('Local storage sync completed');
    } catch (error) {
      console.log('Failed to sync local storage to Supabase:', error);
    }
  };

  // Auto-save functionality
  const autoSaveDraft = async (answerText: string, questionKey: LFIQuestionKey) => {
    if (!user?.id || !answerText.trim()) {
      console.log('Auto-save skipped - no user or empty answer:', { userId: user?.id, answerLength: answerText.trim().length });
      return;
    }

    setAutoSaveStatus('saving');

    try {
      console.log('Auto-saving draft for question:', questionKey, 'Answer length:', answerText.length);
      
      // Save draft separately from graded answers
      const newDrafts = {
        ...userDrafts,
        [questionKey]: answerText
      };
      setUserDrafts(newDrafts);
      saveToLocalStorage(userAnswers, userGrades, newDrafts, gradedAnswers);
      console.log('Auto-save: Local storage updated');

      // Save to database if online
      if (isOnline) {
        console.log('Auto-save: Saving to database...');
        
        // Delete existing drafts for this question
        const { error: deleteError } = await supabase
          .from('user_lfi_answers')
          .delete()
          .eq('user_id', user.id)
          .eq('question_key', questionKey)
          .eq('score', 0); // Only delete drafts (score = 0)

        if (deleteError) {
          console.log('Auto-save: Delete error (non-critical):', deleteError);
        }

        // Insert new draft
        const { data, error: insertError } = await supabase
          .from('user_lfi_answers')
          .insert({
            user_id: user.id,
            question_key: questionKey,
            answer_text: answerText,
            score: 0, // Draft score
            label: 'Draft',
            notes: [],
            tips: [],
            detected: { words: answerText.split(' ').length, substanceHits: 0, valHits: 0, bonusApplied: 0 },
            service_id: 'tps'
          });

        if (insertError) {
          console.log('Auto-save: Database insert error:', insertError);
          setAutoSaveStatus('error');
          setTimeout(() => setAutoSaveStatus('idle'), 2000);
        } else {
          console.log('Auto-save: Database save successful');
          setAutoSaveStatus('saved');
          setTimeout(() => setAutoSaveStatus('idle'), 2000);
        }
      } else {
        console.log('Auto-save: Offline, saved to local storage only');
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      }
    } catch (error) {
      console.log('Auto-save: Unexpected error:', error);
      setAutoSaveStatus('error');
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    }
  };

  // Manual save function
  const saveDraft = async () => {
    if (!selectedQuestion || !userAnswer.trim()) {
      Alert.alert('No Content', 'Please enter some text before saving.');
      return;
    }

    setIsSaving(true);
    setSaveStatus('saving');

    try {
      await autoSaveDraft(userAnswer, selectedQuestion);
      setSaveStatus('saved');
      
      // Show success feedback
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
      
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } finally {
      setIsSaving(false);
    }
  };

  // Enhanced grading function with improved signal detection
  const gradeAnswerIntelligently = (text: string, questionKey: LFIQuestionKey): LFIGradingResult => {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    const charCount = text.length;
    
    // Normalize text for better matching
    const answerNorm = text.normalize('NFKD').toLowerCase();
    
    // Enhanced signal detection with regex patterns
    const SUBSTANCE = [
      /strength/, /weakness/, /learn/, /improv/, /develop/,
      /de.?escalat/, /lead/, /responsib/, /accountab/, /team/,
      /conflict/, /report/, /mentor/, /volunteer/, /growth/,
      /experience/, /challenge/, /situation/, /example/, /specific/
    ];
    
    const VALUES = [
      /integrit/, /respect/, /profession/, /servic/, /community/,
      /trust/, /fair(?:ness)?/, /inclusion/, /equity/, /justice/,
      /honest/, /transparen/, /dignit/, /compassion/
    ];
    
    const STAR_TOKENS = ['situation', 'task', 'action', 'result'];
    
    // Count unique hits for each category
    const substanceHits = [...new Set(SUBSTANCE.filter(r => r.test(answerNorm)).map(String))].length;
    const valuesHits = [...new Set(VALUES.filter(r => r.test(answerNorm)).map(String))].length;
    const starHits = STAR_TOKENS.filter(t => answerNorm.includes(t)).length;
    
    // Personal pronoun count
    const iCount = (answerNorm.match(/\bi\b/g) || []).length;
    
    // Word count bands (soft scoring)
    let wordBandBonus = 0;
    if (wordCount >= 60 && wordCount <= 280) wordBandBonus = 6;
    else if (wordCount >= 281 && wordCount <= 450) wordBandBonus = 4;
    else if (wordCount >= 40 && wordCount <= 59) wordBandBonus = 3;
    else if (wordCount >= 20) wordBandBonus = 2;
    
    // Minimum word requirement checks
    let hardCapScore = 100;
    if (wordCount < 5) {
      hardCapScore = 5;
    } else if (wordCount < 10) {
      hardCapScore = 15;
    }
    
    // Relevance guard - if no substance OR values signals, cap at 20
    if (substanceHits === 0 && valuesHits === 0) {
      hardCapScore = Math.min(hardCapScore, 20);
    }
    
    // Nonsense/gibberish detection
    const dictionaryWords = words.filter(word => 
      word.length > 2 && 
      /[aeiou]/i.test(word) && 
      !/^[^a-zA-Z]*$/.test(word)
    );
    if (dictionaryWords.length < 3) {
      hardCapScore = Math.min(hardCapScore, 5);
    }
    
    // Calculate scores with new weights
    let relevance = Math.min(30, 10 + substanceHits * 4);
    let values = Math.min(22, 8 + valuesHits * 3);
    
    // Clarity only adds points if length > 20 words AND relevance > 0
    let structure = 8 + (starHits >= 2 ? 4 : 0);
    if (wordCount > 20 && (substanceHits > 0 || valuesHits > 0)) {
      structure += wordBandBonus;
    }
    
    let insight = Math.min(18, (answerNorm.includes('why') || answerNorm.includes('because') ? 8 : 4) + Math.min(10, substanceHits * 2));
    let ownership = Math.min(12, (iCount >= 3 ? 6 : 3) + (answerNorm.includes('accountab') || answerNorm.includes('responsib') ? 4 : 0));
    
    // Depth boost for strong answers
    let depthBoost = (substanceHits >= 4 && valuesHits >= 4) ? 6 : 0;
    
    // Enrichment bonus (optional facts)
    let enrichmentBonus = 0;
    // Add specific service knowledge bonuses here if needed
    
    // Calculate final score
    let finalScore = relevance + values + structure + insight + ownership + enrichmentBonus + depthBoost;
    
    // Apply hard caps
    finalScore = Math.min(hardCapScore, finalScore);
    finalScore = Math.min(100, Math.max(0, finalScore));
    
    // Debug logging
    console.log('Enhanced Grading Debug:', {
      substanceHits,
      valuesHits,
      starHits,
      iCount,
      wordCount,
      wordBandBonus,
      hardCapScore,
      dictionaryWords: dictionaryWords.length,
      relevance,
      values,
      structure,
      insight,
      ownership,
      depthBoost,
      enrichmentBonus,
      finalScore
    });
    
    // Determine label
    let label: "Competitive" | "Effective" | "Developing" | "Needs Work";
    if (finalScore >= 85) label = "Competitive";
    else if (finalScore >= 70) label = "Effective";
    else if (finalScore >= 50) label = "Developing";
    else label = "Needs Work";
    
    // Generate feedback
    const notes = generateEnhancedFeedback(finalScore, substanceHits, valuesHits, starHits, wordCount);
    const tips = generateTips(finalScore, questionKey, wordCount);
    
    return {
      score: Math.round(finalScore),
      label,
      notes,
      tips,
      detected: { 
        words: wordCount, 
        substanceHits: substanceHits, 
        valHits: valuesHits, 
        bonusApplied: enrichmentBonus,
        starTokensFound: starHits,
        depthBoost: depthBoost
      }
    };
  };

  // Spam detection - extremely conservative, only flag obvious spam
  const detectSpam = (text: string): number => {
    const lower = text.toLowerCase();
    let spamScore = 0;
    
    // Only flag extremely obvious spam patterns
    const words = text.split(/\s+/).filter(word => word.length > 0);
    
    // Repeated characters (like "aaaaaaa") - only if very obvious and long
    const repeatedChars = (text.match(/(.)\1{8,}/g) || []).length;
    spamScore += repeatedChars * 0.5;
    
    // Random keyboard patterns (like "qwertyuiop") - only if very long
    const randomPatterns = /[qwertyuiopasdfghjklzxcvbnm]{10,}/g;
    spamScore += (lower.match(randomPatterns) || []).length * 0.4;
    
    // Very short with no punctuation AND no meaningful words - only if extremely short
    if (text.length < 10 && !/[.!?]/.test(text)) {
      const meaningfulWords = words.filter(word => 
        word.length > 2 && /[aeiou]/i.test(word)
      );
      if (meaningfulWords.length < 1) spamScore += 0.6;
    }
    
    // All caps for very long text - only if extremely long
    if (text === text.toUpperCase() && text.length > 100) spamScore += 0.4;
    
    // No vowels at all (likely random typing) - only if very obvious
    const vowelCount = (text.match(/[aeiou]/gi) || []).length;
    if (text.length > 30 && vowelCount < text.length * 0.03) spamScore += 0.7;
    
    // Repeated single words (like "test test test test test") - only if very repetitive
    const wordFreq: Record<string, number> = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    const maxFreq = Math.max(...Object.values(wordFreq));
    if (words.length > 10 && maxFreq > words.length * 0.8) spamScore += 0.6;
    
    // Only flag as spam if multiple strong indicators are present
    return Math.min(1, spamScore);
  };

  // Quality assessment
  const assessQuality = (text: string, questionKey: LFIQuestionKey): number => {
    const lower = text.toLowerCase();
    let score = 0;
    
    // Personal pronouns (shows personal engagement)
    const personalPronouns = (lower.match(/\b(i|my|me|myself)\b/g) || []).length;
    score += Math.min(30, personalPronouns * 5);
    
    // Specific examples and details
    const specificWords = ['example', 'instance', 'specifically', 'particular', 'detailed', 'concrete', 'specific'];
    const specificCount = specificWords.filter(word => lower.includes(word)).length;
    score += specificCount * 6;
    
    // Professional language and skills
    const professionalWords = ['responsibility', 'leadership', 'experience', 'skills', 'development', 'growth', 'challenge', 'achievement', 'teamwork', 'communication', 'accountability', 'supervisor', 'managed', 'taught', 'learned', 'team lead', 'supervise', 'compliance', 'safety', 'scheduling', 'performance', 'problem-solving', 'decision-making', 'mentor', 'volunteer', 'community'];
    const professionalCount = professionalWords.filter(word => lower.includes(word)).length;
    score += professionalCount * 5;
    
    // Time indicators (shows specific experience)
    const timeWords = ['years', 'months', 'weeks', 'full-time', 'part-time', 'rotating', 'shifts', 'two years', 'five years', 'six years', '2018', '2021', '2019', 'since', 'weekly', 'monthly'];
    const timeCount = timeWords.filter(word => lower.includes(word)).length;
    score += timeCount * 4;
    
    // Action verbs (shows active experience)
    const actionVerbs = ['worked', 'managed', 'coached', 'organized', 'handled', 'dealt', 'moved', 'taught', 'reinforced', 'prepared', 'monitoring', 'conducting', 'responding', 'writing', 'supervise', 'assign', 'ensure', 'handle', 'meet', 'helping', 'sort', 'distribute'];
    const actionCount = actionVerbs.filter(word => lower.includes(word)).length;
    score += actionCount * 4;
    
    // Question-specific quality indicators
    if (questionKey === 'about_you') {
      if (lower.includes('strength') || lower.includes('weakness')) score += 12;
      if (lower.includes('improve') || lower.includes('develop')) score += 10;
    } else if (questionKey === 'employment_volunteer') {
      if (lower.includes('worked') || lower.includes('job') || lower.includes('position') || lower.includes('role')) score += 15;
      if (lower.includes('volunteer') || lower.includes('community')) score += 12;
      if (lower.includes('supervisor') || lower.includes('managed') || lower.includes('team') || lower.includes('team lead')) score += 10;
      if (lower.includes('shifts') || lower.includes('rotating') || lower.includes('full-time')) score += 8;
      if (lower.includes('loss prevention') || lower.includes('cctv') || lower.includes('patrols')) score += 10;
      if (lower.includes('warehouse') || lower.includes('logistics') || lower.includes('compliance')) score += 8;
      if (lower.includes('big brothers') || lower.includes('food bank') || lower.includes('mentor')) score += 10;
    } else if (questionKey === 'knowledge_service') {
      if (lower.includes('police') || lower.includes('service') || lower.includes('community')) score += 15;
      if (lower.includes('values') || lower.includes('mission')) score += 10;
    }
    
    // Bonus for detailed, well-structured answers
    if (text.length > 200 && personalPronouns > 3) score += 15;
    if (text.length > 300 && professionalCount > 5) score += 10;
    
    return Math.min(100, score);
  };

  // Substance assessment
  const assessSubstance = (text: string, questionKey: LFIQuestionKey): number => {
    const words = text.split(/\s+/).filter(word => word.length > 0);
    let score = 0;
    
    // Length appropriateness - very generous for good content
    if (words.length >= 30 && words.length <= 200) score += 30;
    else if (words.length >= 20 && words.length <= 300) score += 25;
    else if (words.length >= 15 && words.length <= 400) score += 20;
    else if (words.length >= 10) score += 15;
    else if (words.length >= 5) score += 10;
    
    // Sentence structure
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWordsPerSentence = words.length / sentences.length;
    if (avgWordsPerSentence >= 8 && avgWordsPerSentence <= 25) score += 20;
    else if (avgWordsPerSentence >= 5 && avgWordsPerSentence <= 30) score += 15;
    else if (avgWordsPerSentence >= 3) score += 10;
    
    // Specific details and numbers
    const numbers = (text.match(/\b\d+\b/g) || []).length;
    score += Math.min(15, numbers * 3);
    
    // Proper nouns (names, places, organizations)
    const properNouns = (text.match(/\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)*\b/g) || []).length;
    score += Math.min(20, properNouns * 4);
    
    // Specific experience indicators
    const experienceWords = ['worked', 'job', 'position', 'role', 'supervisor', 'managed', 'team', 'shifts', 'rotating', 'full-time', 'part-time', 'team lead', 'supervise', 'warehouse', 'logistics', 'loss prevention', 'cctv', 'patrols'];
    const experienceCount = experienceWords.filter(word => text.toLowerCase().includes(word)).length;
    score += Math.min(15, experienceCount * 3);
    
    // Volunteer/community indicators
    const communityWords = ['volunteer', 'community', 'coached', 'organized', 'mentored', 'youth', 'program', 'big brothers', 'food bank', 'mentor', 'weekly', 'monthly'];
    const communityCount = communityWords.filter(word => text.toLowerCase().includes(word)).length;
    score += Math.min(10, communityCount * 2);
    
    // Question-specific substance
    const lower = text.toLowerCase();
    if (questionKey === 'about_you' && (lower.includes('example') || lower.includes('situation'))) score += 10;
    if (questionKey === 'employment_volunteer') {
      if (lower.includes('worked') || lower.includes('job') || lower.includes('position')) score += 15;
      if (lower.includes('volunteer') || lower.includes('community')) score += 12;
      if (lower.includes('supervisor') || lower.includes('managed') || lower.includes('team lead')) score += 10;
      if (lower.includes('shifts') || lower.includes('rotating')) score += 8;
      if (lower.includes('coached') || lower.includes('mentored')) score += 8;
      if (lower.includes('loss prevention') || lower.includes('cctv') || lower.includes('patrols')) score += 10;
      if (lower.includes('warehouse') || lower.includes('logistics') || lower.includes('compliance')) score += 8;
      if (lower.includes('big brothers') || lower.includes('food bank')) score += 10;
      if (lower.includes('six years') || lower.includes('2018') || lower.includes('2021')) score += 8;
    }
    if (questionKey === 'community_issues' && (lower.includes('local') || lower.includes('area'))) score += 8;
    
    // Bonus for comprehensive answers
    if (words.length > 100 && properNouns > 3 && numbers > 0) score += 10;
    
    return Math.min(100, score);
  };

  // Structure assessment
  const assessStructure = (text: string): number => {
    let score = 0;
    
    // Proper capitalization
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const properlyCapitalized = sentences.filter(s => /^[A-Z]/.test(s.trim())).length;
    score += (properlyCapitalized / sentences.length) * 20;
    
    // Punctuation usage
    const hasPunctuation = /[.!?]/.test(text);
    if (hasPunctuation) score += 15;
    
    // Paragraph structure
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    if (paragraphs.length > 1) score += 15;
    
    // Transition words
    const transitions = ['however', 'therefore', 'furthermore', 'additionally', 'moreover', 'consequently', 'overall', 'since', 'from', 'after', 'also', 'then', 'next'];
    const transitionCount = transitions.filter(word => text.toLowerCase().includes(word)).length;
    score += transitionCount * 4;
    
    // Avoid run-on sentences
    const avgWordsPerSentence = text.split(/\s+/).length / sentences.length;
    if (avgWordsPerSentence <= 30) score += 15;
    
    // Basic structure bonus
    if (text.length > 50) score += 10;
    
    return Math.min(100, score);
  };

  // Relevance assessment
  const assessRelevance = (text: string, questionKey: LFIQuestionKey): number => {
    const lower = text.toLowerCase();
    let score = 0;
    
    // Question-specific relevance
    if (questionKey === 'about_you') {
      if (lower.includes('i am') || lower.includes('i have') || lower.includes('i can')) score += 20;
      if (lower.includes('strength') || lower.includes('weakness')) score += 15;
    } else if (questionKey === 'employment_volunteer') {
      if (lower.includes('work') || lower.includes('job') || lower.includes('employ') || lower.includes('worked')) score += 20;
      if (lower.includes('volunteer') || lower.includes('experience') || lower.includes('team') || lower.includes('supervisor')) score += 15;
    } else if (questionKey === 'knowledge_service') {
      if (lower.includes('police') || lower.includes('service')) score += 20;
      if (lower.includes('community') || lower.includes('public')) score += 15;
    } else if (questionKey === 'community_issues') {
      if (lower.includes('issue') || lower.includes('problem') || lower.includes('challenge')) score += 20;
      if (lower.includes('community') || lower.includes('local')) score += 15;
    } else if (questionKey === 'motivation') {
      if (lower.includes('want') || lower.includes('desire') || lower.includes('goal')) score += 20;
      if (lower.includes('police') || lower.includes('officer')) score += 15;
    } else if (questionKey === 'driving_record') {
      if (lower.includes('driv') || lower.includes('license') || lower.includes('record')) score += 20;
      if (lower.includes('ticket') || lower.includes('violation')) score += 15;
    }
    
    // General relevance indicators
    if (lower.includes('i') || lower.includes('my') || lower.includes('me')) score += 10;
    if (lower.includes('experience') || lower.includes('learned') || lower.includes('taught')) score += 10;
    
    return Math.min(100, score);
  };

  // Generate feedback
  const generateFeedback = (finalScore: number, quality: number, substance: number, structure: number, relevance: number): string[] => {
    const feedback: string[] = [];
    
    if (finalScore >= 85) {
      feedback.push("Excellent response! Your answer demonstrates strong preparation and insight.");
    } else if (finalScore >= 70) {
      feedback.push("Good response with solid content and structure.");
    } else if (finalScore >= 50) {
      feedback.push("Your answer shows potential but needs more development.");
    } else {
      feedback.push("This answer needs significant improvement to be competitive.");
    }
    
    if (quality < 50) feedback.push("Add more personal details and specific examples.");
    if (substance < 50) feedback.push("Provide more concrete details and specific information.");
    if (structure < 50) feedback.push("Improve sentence structure and organization.");
    if (relevance < 50) feedback.push("Make sure your answer directly addresses the question.");
    
    return feedback;
  };

  // Enhanced feedback generation
  const generateEnhancedFeedback = (score: number, substanceHits: number, valuesHits: number, starHits: number, wordCount: number): string[] => {
    const notes: string[] = [];
    
    // Handle very low quality answers
    if (wordCount < 5) {
      notes.push("This answer is too short to be meaningful. Please provide a complete response with specific details.");
      return notes;
    }
    
    if (wordCount < 10) {
      notes.push("This answer is very brief. Expand with specific examples and details from your experience.");
      return notes;
    }
    
    if (substanceHits === 0 && valuesHits === 0) {
      notes.push("This answer lacks substance and values alignment. Add specific examples and connect to policing values.");
      return notes;
    }
    
    if (score >= 85) {
      notes.push("Excellent answer with strong substance and clear structure.");
    } else if (score >= 70) {
      notes.push("Good answer with solid content and organization.");
    } else if (score >= 50) {
      notes.push("Developing answer with some good elements.");
    } else {
      notes.push("Answer needs more substance and structure.");
    }
    
    // Specific feedback based on detected signals
    if (substanceHits >= 4) {
      notes.push(`Strong substance detected (${substanceHits} signals): good use of specific examples and experience.`);
    } else if (substanceHits >= 2) {
      notes.push(`Some substance detected (${substanceHits} signals): add more specific examples.`);
    } else if (substanceHits > 0) {
      notes.push(`Limited substance detected (${substanceHits} signal): add more specific examples and concrete details.`);
    } else {
      notes.push("Add more specific examples and concrete details from your experience.");
    }
    
    if (valuesHits >= 4) {
      notes.push(`Strong values alignment (${valuesHits} signals): excellent connection to policing values.`);
    } else if (valuesHits >= 2) {
      notes.push(`Some values alignment (${valuesHits} signals): consider connecting more to service values.`);
    } else if (valuesHits > 0) {
      notes.push(`Limited values alignment (${valuesHits} signal): connect more directly to policing values.`);
    } else {
      notes.push("Connect your answer more directly to policing values like integrity, respect, and service.");
    }
    
    if (starHits >= 2) {
      notes.push(`Good structure detected (${starHits} STAR elements): well-organized response.`);
    } else if (starHits > 0) {
      notes.push(`Some structure detected (${starHits} STAR element): consider using more STAR elements.`);
    } else {
      notes.push("Consider using the STAR method (Situation, Task, Action, Result) to structure your examples.");
    }
    
    // Word count feedback
    if (wordCount < 40) {
      notes.push("Consider expanding your answer with more detail and examples.");
    } else if (wordCount > 450) {
      notes.push("Your answer is quite long - consider being more concise while keeping key details.");
    }
    
    return notes;
  };

  // Generate tips
  const generateTips = (score: number, questionKey: LFIQuestionKey, wordCount: number): string[] => {
    const tips: string[] = [];
    
    if (score < 50) {
      tips.push("Write a complete, thoughtful response (aim for 50+ words)");
      tips.push("Use specific examples from your experience");
      tips.push("Be honest and authentic in your answer");
    } else if (score < 70) {
      tips.push("Add more specific details and examples");
      tips.push("Use 'I' statements to make it personal");
      tips.push("Connect your experience to the question asked");
    } else if (score < 85) {
      tips.push("Consider adding one more specific example");
      tips.push("Make sure your answer flows logically");
    } else {
      tips.push("Excellent work! This is a strong, competitive answer.");
    }
    
    // Question-specific tips
    if (questionKey === 'about_you') {
      tips.push("Mention one specific strength with an example");
      tips.push("Discuss one area for improvement and how you're working on it");
    } else if (questionKey === 'employment_volunteer') {
      tips.push("Include job titles, responsibilities, and achievements");
      tips.push("Mention volunteer work and community involvement");
    } else if (questionKey === 'knowledge_service') {
      tips.push("Research the specific police service you're applying to");
      tips.push("Mention their values, mission, or recent initiatives");
    }
    
    return tips.slice(0, 3); // Limit to 3 tips
  };

  const loadUserAnswers = async () => {
    if (!user?.id) {
      console.log('No user ID available, loading from local storage only');
      loadFromLocalStorage();
      return;
    }

    try {
      console.log('Loading user answers from Supabase...');
      
      // Get all answers for the user
      const { data, error } = await supabase
        .from('user_lfi_answers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Database error, falling back to local storage:', error.message);
        loadFromLocalStorage();
        return;
      }

      if (data && data.length > 0) {
        console.log('Loaded answers from database:', data.length, 'questions');
        console.log('Raw database data:', data);
        
        const gradedAnswers: Record<LFIQuestionKey, string> = {} as any;
        const drafts: Record<LFIQuestionKey, string> = {} as any;
        const grades: Record<LFIQuestionKey, LFIGradingResult> = {} as any;

        // Separate graded answers and drafts
        data.forEach((item: any) => {
          const questionKey = item.question_key as LFIQuestionKey;
          
          if (item.score > 0) {
            // This is a graded answer
            gradedAnswers[questionKey] = item.answer_text;
            grades[questionKey] = {
              score: item.score,
              label: item.label,
              notes: item.notes || [],
              tips: item.tips || [],
              detected: item.detected || { 
                words: 0, 
                substanceHits: 0, 
                valHits: 0, 
                bonusApplied: 0,
                starTokensFound: 0,
                depthBoost: 0
              }
            };
          } else {
            // This is a draft (score = 0)
            drafts[questionKey] = item.answer_text;
          }
        });

        setGradedAnswers(gradedAnswers);
        setUserDrafts(drafts);
        setUserGrades(grades);
        
        console.log('Processed graded answers:', gradedAnswers);
        console.log('Processed drafts:', drafts);
        console.log('Processed grades:', grades);
        
        // Also save to local storage as backup
        saveToLocalStorage({} as Record<LFIQuestionKey, string>, grades, drafts, gradedAnswers);
        console.log('Successfully synced data from Supabase to local storage');
      } else {
        console.log('No answers found in database, checking local storage...');
        loadFromLocalStorage();
      }
    } catch (error) {
      console.log('Database not available, using local storage only:', error);
      loadFromLocalStorage();
    }
  };

  const handleQuestionSelect = (questionKey: LFIQuestionKey) => {
    setSelectedQuestion(questionKey);
    
    // Check if there's a previous graded answer
    const existingGrade = userGrades[questionKey];
    const existingGradedAnswer = gradedAnswers[questionKey];
    const existingDraft = userDrafts[questionKey];
    
    if (existingGrade && existingGradedAnswer) {
      // There's a previous graded answer
      setPreviousAnswer(existingGradedAnswer);
      setPreviousGrade(existingGrade);
      setUserAnswer(existingDraft || ""); // Load draft if exists, otherwise empty
      setIsNewAttempt(true);
    } else if (existingDraft) {
      // There's a draft but no grade
      setPreviousAnswer("");
      setPreviousGrade(null);
      setUserAnswer(existingDraft); // Load the draft
      setIsNewAttempt(false);
    } else {
      // No previous answer, start fresh
      setPreviousAnswer("");
      setPreviousGrade(null);
      setUserAnswer("");
      setIsNewAttempt(false);
    }
    
    setGradingResult(null);
  };

  // Auto-save effect when user types
  useEffect(() => {
    if (!selectedQuestion || !userAnswer.trim()) {
      console.log('Auto-save skipped:', { selectedQuestion, userAnswerLength: userAnswer.length });
      return;
    }

    console.log('Auto-save timer started for:', selectedQuestion, 'Answer length:', userAnswer.length);

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout for auto-save (500ms after user stops typing)
    autoSaveTimeoutRef.current = setTimeout(() => {
      console.log('Auto-save timeout triggered for:', selectedQuestion);
      autoSaveDraft(userAnswer, selectedQuestion);
    }, 500);

    // Cleanup timeout on unmount
    return () => {
      if (autoSaveTimeoutRef.current) {
        console.log('Auto-save timeout cleared');
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [userAnswer, selectedQuestion]);

  const handleReviewGrade = (questionKey: LFIQuestionKey) => {
    const existingGrade = userGrades[questionKey];
    if (existingGrade) {
      setGradingResult(existingGrade);
      setShowGradingModal(true);
    }
  };

  const handleNewAttempt = (questionKey: LFIQuestionKey) => {
    setSelectedQuestion(questionKey);
    setPreviousAnswer(gradedAnswers[questionKey] || "");
    setPreviousGrade(userGrades[questionKey] || null);
    setUserAnswer(userDrafts[questionKey] || "");
    setIsNewAttempt(true);
    setGradingResult(null);
  };

  const handleGradeAnswer = async () => {
    if (!selectedQuestion || !userAnswer.trim()) {
      console.log('Missing question or answer:', { selectedQuestion, userAnswer: userAnswer.trim() });
      return;
    }

    try {
      setIsGrading(true);
      console.log('Starting grading process...');
      
      // Get service data for grading (you might want to get this from user's selected service)
      const serviceData = await getServiceForGrading('tps'); // Default to TPS for now
      console.log('Service data:', serviceData);
      
      const criteria = LFI_CRITERIA.find(c => c.key === selectedQuestion);
      if (!criteria) {
        console.log('No criteria found for:', selectedQuestion);
        return;
      }
      console.log('Found criteria:', criteria);

      // Intelligent grading system
      const result = gradeAnswerIntelligently(userAnswer, selectedQuestion);
      console.log('Intelligent grading result:', result);

      setGradingResult(result);
      setShowGradingModal(true);
      console.log('Modal should be showing now');

      // Update local state first
      // Move draft to graded answer and clear draft
      const newGradedAnswers = {
        ...gradedAnswers,
        [selectedQuestion]: userAnswer
      };
      const newGrades = {
        ...userGrades,
        [selectedQuestion]: result
      };
      const newDrafts = {
        ...userDrafts
      };
      delete newDrafts[selectedQuestion]; // Remove draft after grading

      setGradedAnswers(newGradedAnswers);
      setUserGrades(newGrades);
      setUserDrafts(newDrafts);

      // Save to local storage
      saveToLocalStorage(userAnswers, newGrades, newDrafts, newGradedAnswers);

      // Close the answer input modal
      setSelectedQuestion(null);

      // Save the answer to database with proper error handling
      if (user) {
        try {
          console.log('Saving answer to Supabase...');
          
          // First, delete any existing answer for this question
          await supabase
            .from('user_lfi_answers')
            .delete()
            .eq('user_id', user.id)
            .eq('question_key', selectedQuestion);

          // Then insert the new answer
          const { data, error } = await supabase
            .from('user_lfi_answers')
            .insert({
              user_id: user.id,
              question_key: selectedQuestion,
              answer_text: userAnswer,
              score: result.score,
              label: result.label,
              notes: result.notes,
              tips: result.tips,
              detected: result.detected,
              service_id: 'tps'
            });

          if (error) {
            console.log('Database save error:', error);
            // Still save to local storage as backup
            console.log('Falling back to local storage only');
          } else {
            console.log('Answer successfully saved to Supabase');
          }
        } catch (dbError) {
          console.log('Database connection failed, using local storage only:', dbError);
          // Don't show error to user since grading worked
        }
      }

    } catch (error) {
      console.error('Error grading answer:', error);
      Alert.alert('Error', `Failed to grade your answer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGrading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return Colors.success;
    if (score >= 70) return Colors.primary;
    if (score >= 50) return Colors.warning;
    return Colors.error;
  };

  const getGradeIcon = (score: number) => {
    const color = getScoreColor(score);
    
    if (score >= 85) {
      // Competitive - Star with check
      return <Star size={18} color={color} fill={color} />;
    } else if (score >= 70) {
      // Effective - Check circle
      return <CheckCircle size={18} color={color} />;
    } else if (score >= 50) {
      // Developing - Alert triangle
      return <AlertCircle size={18} color={color} />;
    } else {
      // Needs Work - X circle
      return <X size={18} color={color} strokeWidth={3} />;
    }
  };

  const getQuestionCardStyle = (label: string) => {
    switch (label) {
      case "Competitive":
        return styles.questionThemeItemCompetitive;
      case "Effective":
        return styles.questionThemeItemEffective;
      case "Developing":
        return styles.questionThemeItemDeveloping;
      case "Needs Work":
        return styles.questionThemeItemNeedsWork;
      default:
        return styles.questionThemeItemUnanswered;
    }
  };

  const getScoreIcon = (score: number) => {
    if (score >= 85) return Star;
    if (score >= 70) return TrendingUp;
    return MessageSquare;
  };

  const questionThemes = [
    {
      key: "about_you" as LFIQuestionKey,
      icon: Users,
      title: "Tell me about yourself / strengths and weaknesses",
      description: "Personal assessment and self-awareness",
    },
    {
      key: "employment_volunteer" as LFIQuestionKey,
      icon: FileText,
      title: "Describe your employment and volunteer history",
      description: "Professional background and experience",
    },
    {
      key: "knowledge_service" as LFIQuestionKey,
      icon: Building,
      title: "What do you know about our police service?",
      description: "Knowledge of jurisdiction, divisions, Chief/Commissioner",
    },
    {
      key: "community_issues" as LFIQuestionKey,
      icon: Globe,
      title: "What issues affect this community / region?",
      description: "Local awareness and community understanding",
    },
    {
      key: "motivation" as LFIQuestionKey,
      icon: Lightbulb,
      title: "Why do you want to be a police officer? Why this service?",
      description: "Motivations and service alignment",
    },
    {
      key: "driving_record" as LFIQuestionKey,
      icon: Car,
      title: "Tell me about your driving history / background record",
      description: "Accountability and record transparency",
    },
  ];

  // Example answers that would score 100% on the grading system
  const exampleAnswers = {
    about_you: `I am a dedicated professional with six years of experience in customer service and community engagement. My greatest strength is my ability to de-escalate conflicts and build trust with diverse populations. In my role as a team supervisor, I've learned to lead by example and take responsibility for both successes and challenges. 

One specific situation that demonstrates my leadership was when I had to resolve a conflict between two team members. The situation required me to listen to both perspectives, identify the root cause, and take action to implement a solution that addressed the underlying issues. As a result, both employees felt heard and respected, and our team's productivity improved significantly.

My area for development is public speaking. I recognize that effective communication is crucial in policing, so I've been taking courses in presentation skills and volunteering to lead team meetings to practice. I believe continuous learning and self-improvement are essential for professional growth.

I am drawn to policing because of my deep respect for the profession's commitment to service, integrity, and community safety. My experience has taught me the importance of accountability, teamwork, and maintaining high ethical standards - values that align perfectly with policing.`,

    employment_volunteer: `I have worked full-time for the past six years in roles that have built strong communication, leadership, and responsibility skills.

From 2018 to 2021, I worked as a Loss Prevention Officer at Mapleview Retail Centre in Mississauga. My responsibilities included monitoring CCTV cameras, conducting floor patrols, and responding to thefts or disturbances. I learned to de-escalate confrontations, document incidents clearly, and work collaboratively with Peel Regional Police when charges were laid. This experience taught me situational awareness, conflict resolution, and the importance of accurate reporting.

Since 2021, I've been employed as a Team Lead at Horizon Logistics in Brampton. I supervise a team of eight warehouse staff, assign daily tasks, and ensure compliance with safety procedures. I handle shift scheduling, conduct performance reviews, and resolve conflicts between staff members. This role has strengthened my leadership skills, decision-making under pressure, and ability to hold others accountable while maintaining a positive work environment.

In addition to my employment, I've been a volunteer mentor with Big Brothers Big Sisters of Peel since 2019. I meet weekly with a 15-year-old student, helping him with schoolwork, fitness goals, and career planning. I also volunteer at the Mississauga Food Bank one Saturday a month, helping sort donations and distribute food hampers to families in need.

These experiences have deepened my connection to the community and taught me patience, empathy, and the importance of giving back. My work and volunteer history demonstrate a consistent pattern of responsibility, teamwork, and service to others - skills I believe are directly transferable to a policing career.`,

    knowledge_service: `I have researched your police service extensively and am impressed by your commitment to community policing and public safety. Your service's mission to serve with integrity, respect, and professionalism aligns perfectly with my personal values and career aspirations.

I understand that your service operates across [jurisdiction] and maintains several divisions including patrol, investigations, and community services. Your community policing initiatives, such as the neighborhood watch programs and youth engagement activities, demonstrate your dedication to building trust and partnerships within the community.

Your service's core values of integrity, respect, service, and accountability resonate strongly with me. I particularly admire your commitment to diversity and inclusion, ensuring that all community members feel represented and protected. The recent initiatives to address mental health calls with specialized response teams show your progressive approach to modern policing challenges.

I am drawn to your service because of your reputation for professional development and career advancement opportunities. The comprehensive training programs, from recruit training to specialized units, would allow me to grow and contribute meaningfully to public safety.

Your service's focus on community engagement and crime prevention, rather than just enforcement, aligns with my belief that effective policing requires building relationships and trust within the community. I am excited about the opportunity to contribute to your mission of keeping our community safe while maintaining the highest standards of professionalism and service.`,

    community_issues: `Based on my research and community involvement, I am aware of several key issues affecting our region that require focused policing attention.

Property crime, particularly auto theft and break-ins, has been a significant concern. The situation requires proactive patrol strategies and community education about prevention measures. The task involves working with residents to implement security measures and building relationships that encourage reporting. The action should include increased patrol presence in high-risk areas and collaboration with community groups. The result would be reduced property crime rates and increased community confidence in police services.

Mental health calls have increased substantially, requiring specialized response approaches. The situation involves individuals in crisis who need compassionate, professional intervention. The task is to ensure officer safety while providing appropriate care and connecting individuals with mental health resources. The action requires ongoing training in de-escalation techniques and partnerships with mental health professionals. The result should be improved outcomes for individuals in crisis and reduced use of force incidents.

Youth engagement and crime prevention remain priorities. The situation involves young people who may be at risk of involvement in criminal activity. The task is to build positive relationships and provide alternatives to criminal behavior. The action includes school programs, mentorship opportunities, and recreational activities. The result would be reduced youth crime and stronger community relationships.

These issues require a collaborative approach between police services, community organizations, and residents. I am committed to working with all stakeholders to address these challenges and improve community safety and well-being.`,

    motivation: `I want to be a police officer because I am deeply committed to serving my community and making a positive difference in people's lives. My motivation stems from a genuine desire to protect the vulnerable, uphold justice, and contribute to public safety.

I am drawn to this specific service because of your reputation for community policing and professional excellence. Your service's commitment to integrity, respect, and accountability aligns perfectly with my personal values and career aspirations. I am particularly impressed by your progressive approach to modern policing challenges and your dedication to building trust within the community.

My professional experience has prepared me well for this career. As a team supervisor, I have developed strong leadership skills, conflict resolution abilities, and a commitment to accountability. My volunteer work has taught me empathy, patience, and the importance of community service. These experiences have reinforced my belief that effective policing requires both professional competence and genuine care for community members.

I am motivated by the opportunity to work in a profession that combines my desire to serve others with my interest in problem-solving and community engagement. Policing offers the chance to make a meaningful impact every day, whether through preventing crime, helping victims, or building positive relationships within the community.

I am committed to upholding the highest standards of professionalism, integrity, and service. I believe that effective policing requires continuous learning, self-reflection, and a genuine commitment to community well-being. I am excited about the opportunity to contribute to your service's mission and to grow as a professional in this challenging and rewarding career.`,

    driving_record: `I maintain a clean driving record and take great pride in my responsible driving habits. I have held a valid driver's license for eight years without any traffic violations, accidents, or suspensions.

I practice defensive driving techniques consistently, including maintaining appropriate following distances, scanning for potential hazards, and adjusting my driving for weather conditions. I believe that safe driving is not just about following rules, but about being aware of your surroundings and making responsible decisions that protect yourself and others.

I have completed a defensive driving course through my employer, which reinforced the importance of situational awareness and proactive safety measures. I also ensure that my vehicle is properly maintained, with regular inspections and prompt attention to any mechanical issues.

I understand that driving history is an important consideration in policing, as officers must operate vehicles safely in various conditions and situations. My clean record demonstrates my commitment to responsibility and accountability, which are essential qualities for police work.

I am committed to maintaining these high standards throughout my career and understand that any driving infractions could impact my professional standing. I take my responsibility as a driver seriously and will continue to prioritize safety and compliance in all my driving activities.`
  };


  const formatDetails = [
    "Always includes an oral interview with recruiters",
    "Some services also require a written LFI component (Toronto explicitly; Peel uses standardized LFI sheets)",
    "Questions are standardized and structured to ensure fairness",
  ];

  const stageOrder = [
    "Comes after the Pre-Background Questionnaire / Application stage",
    "Occurs before the Essential Competency Interview (ECI), psychological testing, and background check",
    "In blended models, the LFI portion is embedded directly in the main interview",
  ];

  return (
    <View style={styles.pageContainer}>
      <ProfessionalBackground variant="fitness">
        <View />
      </ProfessionalBackground>
      
      {/* Sync Status Indicator */}
      {!isOnline && (
        <View style={styles.offlineIndicator}>
          <Text style={styles.offlineText}>📱 Working offline - data will sync when online</Text>
        </View>
      )}
      
      {syncStatus === 'syncing' && (
        <View style={styles.syncIndicator}>
          <Text style={styles.syncText}>🔄 Syncing your data...</Text>
        </View>
      )}
      
      <ScrollView ref={scrollViewRef} style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Introduction Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Target size={24} color={Colors.primary} />
          <Text style={styles.sectionTitle}>What is the LFI?</Text>
        </View>
        <View style={styles.contentCard}>
          <Text style={styles.introText}>
            The Local Focus Interview (LFI) is a formal stage in Ontario police hiring. 
            It is used by most services and may appear as either:
          </Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.bulletText}>
                A separate stage before the Essential Competency Interview (e.g., Peel, Halton)
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.bulletText}>
                A blended interview where LFI and competency questions are combined (e.g., Toronto, Durham)
              </Text>
            </View>
          </View>
          <View style={styles.alertBox}>
            <AlertCircle size={20} color={Colors.primary} />
            <Text style={styles.alertText}>
              Passing the LFI is required to move forward.
            </Text>
          </View>
        </View>
      </View>

      {/* Practice CTA */}
      <TouchableOpacity 
        style={styles.practiceCTA}
        onPress={() => {
          // Scroll to practice section
          scrollViewRef.current?.scrollTo({ y: 800, animated: true });
        }}
        activeOpacity={0.7}
      >
        <View style={styles.practiceCTAHeader}>
          <MessageSquare size={20} color={Colors.primary} />
          <Text style={styles.practiceCTATitle}>🚀 Ready to Practice?</Text>
        </View>
        <Text style={styles.practiceCTADescription}>
          Test your knowledge with interactive practice questions and get instant feedback.
        </Text>
        <View style={styles.practiceCTAButton}>
          <ArrowDown size={16} color="white" />
          <Text style={styles.practiceCTAButtonText}>Start Practicing</Text>
        </View>
      </TouchableOpacity>

      {/* What the LFI Assesses Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <CheckCircle size={24} color={Colors.primary} />
          <Text style={styles.sectionTitle}>What the LFI Assesses</Text>
        </View>
        <View style={styles.contentCard}>
          <View style={styles.assessmentGrid}>
            <View style={styles.assessmentItem}>
              <Text style={styles.assessmentTitle}>Fit for the service and community</Text>
              <Text style={styles.assessmentDesc}>Values, motivations, alignment</Text>
            </View>
            <View style={styles.assessmentItem}>
              <Text style={styles.assessmentTitle}>Personal background</Text>
              <Text style={styles.assessmentDesc}>Employment, volunteer work, education, leadership, responsibilities</Text>
            </View>
            <View style={styles.assessmentItem}>
              <Text style={styles.assessmentTitle}>Knowledge of the police service</Text>
              <Text style={styles.assessmentDesc}>Jurisdiction, divisions, leadership, priorities</Text>
            </View>
            <View style={styles.assessmentItem}>
              <Text style={styles.assessmentTitle}>Community awareness</Text>
              <Text style={styles.assessmentDesc}>Local issues, crime trends, demographics</Text>
            </View>
            <View style={styles.assessmentItem}>
              <Text style={styles.assessmentTitle}>Motivations</Text>
              <Text style={styles.assessmentDesc}>"Why policing?" and "Why this service?"</Text>
            </View>
            <View style={styles.assessmentItem}>
              <Text style={styles.assessmentTitle}>Record / accountability</Text>
              <Text style={styles.assessmentDesc}>Driving history, disciplinary or background matters</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Format Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <FileText size={24} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Format</Text>
        </View>
        <View style={styles.contentCard}>
          {formatDetails.map((detail, index) => (
            <View key={index} style={styles.formatItem}>
              <View style={styles.formatBullet} />
              <Text style={styles.formatText}>{detail}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Stage Order Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Clock size={24} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Stage Order in Process</Text>
        </View>
        <View style={styles.contentCard}>
          {stageOrder.map((order, index) => (
            <View key={index} style={styles.stageItem}>
              <View style={styles.stageNumber}>
                <Text style={styles.stageNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.stageText}>{order}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Interactive Practice Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Edit3 size={24} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Practice Your Answers</Text>
        </View>
        <View style={styles.contentCard}>
          <Text style={styles.practiceIntro}>
            Practice answering these common LFI questions. Get instant feedback on your responses to improve your interview performance.
          </Text>
          
          <View style={styles.questionThemesList}>
            {questionThemes.map((theme, index) => {
              const IconComponent = theme.icon;
              const hasGradedAnswer = gradedAnswers[theme.key];
              const hasDraft = userDrafts[theme.key];
              const hasGrade = userGrades[theme.key];
              const hasAnswer = hasGradedAnswer || hasDraft;
              return (
                <View key={index} style={[
                  styles.questionThemeItem, 
                  hasGradedAnswer && hasGrade ? getQuestionCardStyle(hasGrade.label) : styles.questionThemeItemUnanswered
                ]}>
                  <TouchableOpacity
                    style={styles.questionThemeMain}
                    onPress={() => handleQuestionSelect(theme.key)}
                  >
                    <View style={styles.questionThemeIcon}>
                      <IconComponent 
                        size={20} 
                        color={hasAnswer && hasGrade ? getScoreColor(hasGrade.score) : Colors.primary} 
                      />
                    </View>
                    <View style={styles.questionThemeContent}>
                      <Text style={styles.questionThemeTitle}>{theme.title}</Text>
                      <Text style={styles.questionThemeDesc}>{theme.description}</Text>
                      {hasAnswer && (
                        <View style={styles.answeredBadge}>
                          {hasGrade ? (
                            <View style={styles.completedBadge}>
                              <View style={[styles.completedIconContainer, { backgroundColor: getScoreColor(hasGrade.score) + "15" }]}>
                                {getGradeIcon(hasGrade.score)}
                              </View>
                              <View style={styles.completedTextContainer}>
                                <Text style={styles.answeredText}>Answered</Text>
                                <View style={styles.questionScoreContainer}>
                                  <Text style={[styles.scoreNumber, { color: getScoreColor(hasGrade.score) }]}>
                                    {hasGrade.score}%
                                  </Text>
                                  <Text style={[styles.scoreLabel, { color: getScoreColor(hasGrade.score) }]} numberOfLines={1}>
                                    {hasGrade.label}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          ) : (
                            <View style={styles.draftBadge}>
                              <View style={styles.draftIconContainer}>
                                <Clock size={16} color={Colors.warning} />
                                <View style={styles.draftDot} />
                              </View>
                              <View style={styles.draftTextContainer}>
                                <Text style={styles.draftText}>Draft Saved</Text>
                                <Text style={styles.draftSubText}>Continue editing</Text>
                              </View>
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                    <ArrowRight 
                      size={20} 
                      color={hasAnswer && hasGrade ? getScoreColor(hasGrade.score) : Colors.primary} 
                    />
                  </TouchableOpacity>
                  
                  <View style={styles.questionActions}>
                    <TouchableOpacity
                      style={styles.exampleButton}
                      onPress={() => setShowExample(theme.key)}
                    >
                      <FileText size={16} color={Colors.primary} />
                      <Text style={styles.exampleButtonText}>View Example</Text>
                    </TouchableOpacity>
                    {hasGradedAnswer && hasGrade && (
                      <>
                        <TouchableOpacity
                          style={styles.reviewButton}
                          onPress={() => handleReviewGrade(theme.key)}
                        >
                          <Eye size={16} color={Colors.white} />
                          <Text style={styles.reviewButtonText}>Review Grade</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.newAttemptButton}
                          onPress={() => handleNewAttempt(theme.key)}
                        >
                          <Edit size={16} color={Colors.white} />
                          <Text style={styles.newAttemptButtonText}>New Attempt</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Answer Input Modal */}
      <Modal visible={selectedQuestion !== null} animationType="slide" presentationStyle="pageSheet">
        <ProfessionalBackground variant="application">
          <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedQuestion && questionThemes.find(q => q.key === selectedQuestion)?.title}
            </Text>
            <TouchableOpacity onPress={() => setSelectedQuestion(null)} style={styles.modalCloseButton}>
              <X size={24} color={Colors.white} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {/* Show previous answer if this is a new attempt */}
            {isNewAttempt && previousAnswer && (
              <View style={styles.previousAnswerContainer}>
                <Text style={styles.previousAnswerLabel}>Previous Answer ({previousGrade?.label})</Text>
                <View style={styles.previousAnswerBox}>
                  <Text style={styles.previousAnswerText}>{previousAnswer}</Text>
                </View>
                {previousGrade && (
                    <View style={styles.previousGradeBox}>
                      <Text style={styles.previousGradeText}>
                        Score: {previousGrade.score}% - {previousGrade.label}
                      </Text>
                    </View>
                )}
              </View>
            )}
            
            <View style={styles.answerInputContainer}>
              <View style={styles.answerInputHeader}>
                <Text style={styles.answerInputLabel}>
                  {isNewAttempt ? 'New Answer' : 'Your Answer'}
                </Text>
                <View style={styles.inputActions}>
                  {userAnswer.length > 0 && (
                    <TouchableOpacity 
                      style={styles.clearButton}
                      onPress={() => setUserAnswer('')}
                    >
                      <X size={16} color="#666" />
                      <Text style={styles.clearButtonText}>Clear</Text>
                    </TouchableOpacity>
                  )}
                  {userAnswer.length > 0 && (
                    <TouchableOpacity 
                      style={styles.testAutoSaveButton}
                      onPress={() => autoSaveDraft(userAnswer, selectedQuestion!)}
                    >
                      <Text style={styles.testAutoSaveButtonText}>Test Auto-Save</Text>
                    </TouchableOpacity>
                  )}
                  {saveStatus === 'saved' && (
                    <Text style={styles.saveStatusText}>✓ Saved</Text>
                  )}
                  {saveStatus === 'saving' && (
                    <Text style={styles.saveStatusTextSaving}>💾 Saving...</Text>
                  )}
                  {saveStatus === 'error' && (
                    <Text style={styles.saveStatusTextError}>⚠️ Save failed</Text>
                  )}
                  {autoSaveStatus === 'saving' && (
                    <Text style={styles.autoSaveStatusTextSaving}>⚡ Auto-saving...</Text>
                  )}
                  {autoSaveStatus === 'saved' && (
                    <Text style={styles.autoSaveStatusText}>✓ Auto-saved</Text>
                  )}
                  {autoSaveStatus === 'error' && (
                    <Text style={styles.autoSaveStatusTextError}>⚠️ Auto-save failed</Text>
                  )}
                </View>
              </View>
              <TextInput
                style={styles.answerInput}
                value={userAnswer}
                onChangeText={setUserAnswer}
                placeholder="Type your answer here... Be specific and use examples from your experience. (Auto-saves every 0.5 seconds)"
                multiline
                numberOfLines={8}
                textAlignVertical="top"
              />
              <View style={styles.answerActions}>
                <TouchableOpacity
                  onPress={() => setSelectedQuestion(null)}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={saveDraft}
                  style={[styles.saveButton, (!userAnswer.trim() || isSaving) && styles.saveButtonDisabled]}
                  disabled={!userAnswer.trim() || isSaving}
                >
                  <Text style={styles.saveButtonText}>
                    {isSaving ? "Saving..." : "Save Draft"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleGradeAnswer}
                  style={[styles.gradeButton, (!userAnswer.trim() || isGrading) && styles.gradeButtonDisabled]}
                  disabled={!userAnswer.trim() || isGrading}
                >
                  <Text style={styles.gradeButtonText}>
                    {isGrading ? "Grading..." : "Grade Answer"}
                  </Text>
                </TouchableOpacity>
                
              </View>
            </View>
          </ScrollView>
          </View>
        </ProfessionalBackground>
      </Modal>

      {/* Grading Results Modal */}
      <Modal visible={showGradingModal} animationType="slide" presentationStyle="pageSheet">
        <ProfessionalBackground variant="application">
          <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Grading Results</Text>
            <TouchableOpacity onPress={() => {
              console.log('Closing modal');
              setShowGradingModal(false);
            }} style={styles.modalCloseButton}>
              <X size={24} color={Colors.white} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {gradingResult && (
              <View style={styles.gradingResults}>
                <View style={styles.scoreContainer}>
                    <View style={styles.scoreCircle}>
                      <Text style={[styles.scoreText, { color: getScoreColor(gradingResult.score) }]}>
                        {gradingResult.score}%
                      </Text>
                    </View>
                  <View style={styles.scoreInfo}>
                    <Text style={[styles.scoreLabel, { color: getScoreColor(gradingResult.score) }]}>
                      {gradingResult.label}
                    </Text>
                    <Text style={styles.scoreDescription}>
                      {gradingResult.score >= 85 
                        ? "Excellent! Your answer demonstrates strong preparation and insight."
                        : gradingResult.score >= 70
                        ? "Good work! Your answer shows solid understanding with room for improvement."
                        : gradingResult.score >= 50
                        ? "Developing. Focus on the tips below to strengthen your response."
                        : "Needs work. Review the guidance below to improve your answer."
                      }
                    </Text>
                  </View>
                </View>

                {gradingResult.notes.length > 0 && (
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesTitle}>Feedback</Text>
                    {gradingResult.notes.map((note, index) => (
                      <View key={index} style={styles.noteItem}>
                        <CheckCircle size={16} color={Colors.success} />
                        <Text style={styles.noteText}>{note}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {gradingResult.tips.length > 0 && (
                  <View style={styles.tipsContainer}>
                    <Text style={styles.tipsTitle}>Improvement Tips</Text>
                    {gradingResult.tips.map((tip, index) => (
                      <View key={index} style={styles.tipItem}>
                        <View style={styles.tipBullet} />
                        <Text style={styles.tipText}>{tip}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.detectedSignals}>
                  <Text style={styles.detectedTitle}>Interview Tips</Text>
                  {(() => {
                    const tips = [];
                    const questionKey = selectedQuestion;
                    
                    // Question-specific tips
                    if (questionKey === 'about_you') {
                      const aboutYouTips = [
                        { icon: "💪", text: gradingResult.score >= 85 ? 
                          "Excellent self-awareness! Your ability to articulate strengths and weaknesses shows maturity." :
                          "Start with a brief professional summary, then highlight 2-3 key strengths with specific examples." },
                        { icon: "🎯", text: gradingResult.score < 70 ? 
                          "Be honest about a real weakness, but show how you're actively working to improve it." :
                          "Great job balancing strengths and weaknesses! This shows self-reflection." },
                        { icon: "⭐", text: "Choose strengths that relate to policing: communication, problem-solving, leadership, or teamwork." },
                        { icon: "🔄", text: "For weaknesses, pick something you're genuinely improving, not a fake strength in disguise." }
                      ];
                      tips.push(...aboutYouTips.slice(0, 3));
                    }
                    
                    else if (questionKey === 'employment_volunteer') {
                      const employmentTips = [
                        { icon: "📅", text: gradingResult.score >= 85 ? 
                          "Perfect chronological structure! Your work history tells a clear story of growth." :
                          "Start with your most recent role and work backwards chronologically." },
                        { icon: "🎯", text: gradingResult.score < 70 ? 
                          "Include specific duties, responsibilities, and achievements for each role." :
                          "Excellent detail! Your specific examples demonstrate relevant experience." },
                        { icon: "🤝", text: "Connect your work experience to policing skills: customer service, teamwork, leadership, problem-solving." },
                        { icon: "💼", text: "Don't forget volunteer work - it shows community commitment and relevant skills." }
                      ];
                      tips.push(...employmentTips.slice(0, 3));
                    }
                    
                    else if (questionKey === 'knowledge_service') {
                      const knowledgeTips = [
                        { icon: "🏢", text: gradingResult.score >= 85 ? 
                          "Outstanding service knowledge! You clearly understand their mission and priorities." :
                          "Research the service's mission statement, core values, and recent initiatives." },
                        { icon: "👮", text: gradingResult.score < 70 ? 
                          "Mention specific divisions, programs, or community initiatives you're familiar with." :
                          "Great job showing specific knowledge! This demonstrates genuine interest." },
                        { icon: "🎯", text: "Connect your background to their values: 'My experience in customer service aligns with your commitment to community service.'" },
                        { icon: "📰", text: "Stay updated on recent news, community events, or new programs the service has launched." }
                      ];
                      tips.push(...knowledgeTips.slice(0, 3));
                    }
                    
                    else if (questionKey === 'community_issues') {
                      const communityTips = [
                        { icon: "🌍", text: gradingResult.score >= 85 ? 
                          "Excellent local awareness! Your knowledge of community issues shows genuine engagement." :
                          "Research current local issues: crime trends, traffic problems, youth programs, or community events." },
                        { icon: "🤝", text: gradingResult.score < 70 ? 
                          "Connect issues to policing solutions: 'Community policing could address this through...'" :
                          "Great connection between issues and policing approaches!" },
                        { icon: "📊", text: "Use specific examples: 'Auto theft has increased 15% in the downtown core, which could be addressed through...'" },
                        { icon: "💡", text: "Show understanding of root causes, not just symptoms of community problems." }
                      ];
                      tips.push(...communityTips.slice(0, 3));
                    }
                    
                    else if (questionKey === 'motivation') {
                      const motivationTips = [
                        { icon: "❤️", text: gradingResult.score >= 85 ? 
                          "Powerful motivation! Your personal connection to policing is compelling and authentic." :
                          "Share a specific, personal reason why you want to be a police officer." },
                        { icon: "🎯", text: gradingResult.score < 70 ? 
                          "Connect your motivation to this specific service: 'I want to serve Toronto because...'" :
                          "Excellent service-specific motivation! This shows genuine interest." },
                        { icon: "🌟", text: "Avoid clichés like 'I want to help people' - be specific about what draws you to policing." },
                        { icon: "🔗", text: "Link your personal values to policing values: integrity, service, respect, community." }
                      ];
                      tips.push(...motivationTips.slice(0, 3));
                    }
                    
                    else if (questionKey === 'driving_record') {
                      const drivingTips = [
                        { icon: "🚗", text: gradingResult.score >= 85 ? 
                          "Excellent transparency! Your honest approach to your driving history shows integrity." :
                          "Be completely honest about your driving record - they will check your abstract." },
                        { icon: "📋", text: gradingResult.score < 70 ? 
                          "If you have violations, explain what you learned and how you've improved your driving habits." :
                          "Great job explaining any past issues and showing growth!" },
                        { icon: "✅", text: "If your record is clean, mention your defensive driving habits and safety practices." },
                        { icon: "🔄", text: "Show accountability: 'I made a mistake, learned from it, and now I...'" }
                      ];
                      tips.push(...drivingTips.slice(0, 3));
                    }
                    
                    // Add one general interview tip
                    const generalTips = [
                      { icon: "🎤", text: "Speak confidently and maintain eye contact during your actual interview." },
                      { icon: "⏰", text: "Practice timing: aim for 2-3 minutes per answer in the real interview." },
                      { icon: "📝", text: "Use the STAR method: Situation, Task, Action, Result for behavioral examples." },
                      { icon: "🤝", text: "Show enthusiasm for the role and genuine interest in serving the community." }
                    ];
                    tips.push(generalTips[Math.floor(Math.random() * generalTips.length)]);
                    
                    return tips.map((tip, index) => (
                      <View key={index} style={styles.tipItem}>
                        <Text style={styles.tipBullet}>{tip.icon}</Text>
                        <Text style={styles.tipText}>{tip.text}</Text>
                      </View>
                    ));
                  })()}
                </View>
              </View>
            )}
          </ScrollView>
          </View>
        </ProfessionalBackground>
      </Modal>

      {/* Example Answer Modal */}
      <Modal visible={showExample !== null} animationType="slide" presentationStyle="pageSheet">
        <ProfessionalBackground variant="application">
          <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {showExample && questionThemes.find(q => q.key === showExample)?.title}
            </Text>
            <TouchableOpacity onPress={() => setShowExample(null)} style={styles.modalCloseButton}>
              <X size={24} color={Colors.white} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.exampleContainer}>
              <View style={styles.exampleHeader}>
                <FileText size={20} color={Colors.primary} />
                <Text style={styles.exampleTitle}>Competitive Scoring Example</Text>
              </View>
              <Text style={styles.exampleDescription}>
                This example answer demonstrates all the key elements that would achieve a "Competitive" rating (85+ points) on our grading system:
              </Text>
              <View style={styles.exampleFeatures}>
                <View style={styles.exampleFeature}>
                  <CheckCircle size={16} color={Colors.success} />
                  <Text style={styles.exampleFeatureText}>Strong substance signals (specific examples, experience)</Text>
                </View>
                <View style={styles.exampleFeature}>
                  <CheckCircle size={16} color={Colors.success} />
                  <Text style={styles.exampleFeatureText}>Values alignment (integrity, respect, service, community)</Text>
                </View>
                <View style={styles.exampleFeature}>
                  <CheckCircle size={16} color={Colors.success} />
                  <Text style={styles.exampleFeatureText}>STAR structure (Situation, Task, Action, Result)</Text>
                </View>
                <View style={styles.exampleFeature}>
                  <CheckCircle size={16} color={Colors.success} />
                  <Text style={styles.exampleFeatureText}>Personal engagement and accountability</Text>
                </View>
                <View style={styles.exampleFeature}>
                  <CheckCircle size={16} color={Colors.success} />
                  <Text style={styles.exampleFeatureText}>Appropriate length and professional tone</Text>
                </View>
              </View>
              <View style={styles.exampleAnswer}>
                <Text style={styles.exampleAnswerText}>
                  {showExample && exampleAnswers[showExample]}
                </Text>
              </View>
            </View>
          </ScrollView>
          </View>
        </ProfessionalBackground>
      </Modal>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: 20,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text,
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  contentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  // Practice CTA Styles
  practiceCTA: {
    backgroundColor: Colors.primary,
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 20,
    borderRadius: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
    transform: [{ scale: 1 }],
  },
  practiceCTAHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  practiceCTATitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
  practiceCTADescription: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 18,
    marginBottom: 12,
  },
  practiceCTAButton: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    alignSelf: "flex-start",
  },
  practiceCTAButtonText: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
  },
  introText: {
    fontSize: 17,
    lineHeight: 26,
    color: Colors.text,
    marginBottom: 20,
    fontWeight: "400",
  },
  bulletList: {
    marginBottom: 16,
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 8,
    marginRight: 12,
  },
  bulletText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text,
    flex: 1,
  },
  alertBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.policeBlueLight,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  alertText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
    marginLeft: 8,
    flex: 1,
  },
  assessmentGrid: {
    gap: 16,
  },
  assessmentItem: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  assessmentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  assessmentDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  formatItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  formatBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 8,
    marginRight: 12,
  },
  formatText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text,
    flex: 1,
  },
  stageItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  stageNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  stageNumberText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.white,
  },
  stageText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text,
    flex: 1,
  },
  themesIntro: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    fontStyle: "italic",
  },
  questionThemesList: {
    gap: 16,
  },
  questionThemeItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(30, 64, 175, 0.15)',
    overflow: "hidden",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 16,
  },
  questionThemeIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  questionThemeContent: {
    flex: 1,
    marginRight: 12,
  },
  questionThemeTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  questionThemeDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.warning + "15",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  warningText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.warning,
    marginLeft: 8,
    flex: 1,
  },
  // Interactive Practice Styles
  practiceIntro: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  questionThemeItemAnswered: {
    backgroundColor: Colors.success + "10",
    borderLeftColor: Colors.success,
  },
  questionThemeItemUnanswered: {
    backgroundColor: Colors.surface,
    borderColor: Colors.primary + "60",
    borderWidth: 3,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionThemeItemCompetitive: {
    backgroundColor: Colors.success + "08",
    borderColor: Colors.success + "40",
    borderWidth: 2,
    shadowColor: Colors.success,
    shadowOpacity: 0.15,
  },
  questionThemeItemEffective: {
    backgroundColor: Colors.primary + "08",
    borderColor: Colors.primary + "40",
    borderWidth: 2,
    shadowColor: Colors.primary,
    shadowOpacity: 0.15,
  },
  questionThemeItemDeveloping: {
    backgroundColor: Colors.warning + "08",
    borderColor: Colors.warning + "40",
    borderWidth: 2,
    shadowColor: Colors.warning,
    shadowOpacity: 0.15,
  },
  questionThemeItemNeedsWork: {
    backgroundColor: Colors.error + "08",
    borderColor: Colors.error + "40",
    borderWidth: 2,
    shadowColor: Colors.error,
    shadowOpacity: 0.15,
  },
  questionThemeMain: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 20,
    flex: 1,
  },
  questionActions: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    flexDirection: "column",
    gap: 12,
    backgroundColor: 'rgba(248, 250, 252, 0.5)',
  },
  exampleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.primary + "20",
    borderRadius: 12,
    width: "100%",
    borderWidth: 1,
    borderColor: Colors.primary + "30",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  exampleButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.primary,
  },
  reviewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    backgroundColor: Colors.success,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.success,
    width: "100%",
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  reviewButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.white,
  },
  newAttemptButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    width: "100%",
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  newAttemptButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.white,
  },
  previousAnswerContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  previousAnswerLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 12,
  },
  previousAnswerBox: {
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  previousAnswerText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  previousGradeBox: {
    padding: 8,
    backgroundColor: Colors.primary + "10",
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  previousGradeText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary,
  },
  scoreDisplayText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  answeredBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 4,
  },
  answeredText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: "600",
  },
  draftText: {
    fontSize: 13,
    color: Colors.warning,
    fontWeight: "600",
  },
  draftBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.warning + "20",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.warning + "40",
    gap: 10,
    shadowColor: Colors.warning,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  draftIconContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 24,
  },
  draftDot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.warning,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  draftTextContainer: {
    flex: 1,
  },
  draftSubText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: "400",
    marginTop: 1,
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completedIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
    backgroundColor: Colors.success + "15",
    borderRadius: 14,
  },
  completedTextContainer: {
    flex: 1,
    gap: 4,
  },
  questionScoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    marginTop: 2,
    minWidth: 0,
  },
  scoreNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    lineHeight: 22,
    flexShrink: 0,
  },
  scoreLabelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  questionScoreLabel: {
    fontSize: 12,
    fontWeight: "500",
    flexShrink: 1,
    maxWidth: "60%",
    overflow: "hidden",
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.policeRedBorder,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.white,
    flex: 1,
  },
  modalCloseButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalContent: {
    flex: 1,
    padding: 16,
    backgroundColor: 'transparent',
  },
  // Answer Input Styles
  answerInputContainer: {
    gap: 12,
  },
  answerInputHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  answerInputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text,
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#f5f5f5",
    borderRadius: 6,
  },
  clearButtonText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  // Example Modal Styles
  exampleContainer: {
    gap: 16,
    padding: 16,
    backgroundColor: 'rgba(248, 250, 252, 0.3)',
    borderRadius: 12,
    margin: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  exampleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  exampleDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
    fontWeight: "400",
  },
  exampleFeatures: {
    gap: 8,
    marginBottom: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 8,
  },
  exampleFeature: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingVertical: 4,
  },
  exampleFeatureText: {
    fontSize: 13,
    color: Colors.text,
    flex: 1,
    lineHeight: 18,
    fontWeight: "400",
  },
  exampleAnswer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  exampleAnswerText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
    fontWeight: "400",
  },
  answerInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.background,
    minHeight: 200,
  },
  answerActions: {
    flexDirection: "row",
    gap: 8,
  },
  inputActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.warning,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#ccc",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.white,
  },
  saveStatusText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: "500",
  },
  saveStatusTextSaving: {
    fontSize: 12,
    color: Colors.warning,
    fontWeight: "500",
  },
  saveStatusTextError: {
    fontSize: 12,
    color: Colors.error,
    fontWeight: "500",
  },
  autoSaveStatusTextSaving: {
    fontSize: 11,
    color: Colors.warning,
    fontWeight: "500",
  },
  autoSaveStatusText: {
    fontSize: 11,
    color: Colors.success,
    fontWeight: "500",
  },
  autoSaveStatusTextError: {
    fontSize: 11,
    color: Colors.error,
    fontWeight: "500",
  },
  testAutoSaveButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.primary + "20",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.primary + "40",
  },
  testAutoSaveButtonText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: "500",
  },
  gradeButton: {
    flex: 2,
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
  },
  gradeButtonDisabled: {
    backgroundColor: Colors.border,
  },
  gradeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.white,
  },
  // Grading Results Styles
  gradingResults: {
    gap: 24,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 20,
    backgroundColor: Colors.surface,
    borderRadius: 12,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: Colors.border,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: "700",
  },
  scoreInfo: {
    flex: 1,
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  scoreDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  notesContainer: {
    gap: 12,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  noteItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: Colors.success + "10",
    borderRadius: 8,
  },
  noteText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  tipsContainer: {
    gap: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 8,
  },
  tipText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
    lineHeight: 20,
  },
  offlineIndicator: {
    backgroundColor: Colors.warning,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  offlineText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  syncIndicator: {
    backgroundColor: Colors.primary,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  syncText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  detectedSignals: {
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    gap: 8,
  },
  detectedTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
});
