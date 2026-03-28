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
  Animated,
  Dimensions,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  Shield,
  RefreshCw,
  BookOpen,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Play,
  Award,
  Zap,
  Bookmark,
  Building2,
  MapPin,
  Heart,
  User,
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
  
  // New state for enhanced UX
  const [expandedCompetencies, setExpandedCompetencies] = useState<Set<LFIQuestionKey>>(new Set());
  const [activeTab, setActiveTab] = useState<'overview' | 'practice'>('overview');
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [practiceAnswer, setPracticeAnswer] = useState('');
  const { width } = Dimensions.get('window');
  
  // Debug modal state changes
  useEffect(() => {
    console.log('Modal state changed:', showGradingModal);
  }, [showGradingModal]);

  // Load existing answers and grades
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        await loadUserAnswers();
        // Also sync any local storage data to Supabase
        await syncLocalStorageToSupabase();
      } else {
        // No user, load from local storage only
        await loadFromLocalStorage();
      }
    };
    loadData();
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

  const loadFromLocalStorage = async () => {
    try {
      const savedAnswers = await AsyncStorage.getItem('lfi_user_answers');
      const savedGrades = await AsyncStorage.getItem('lfi_user_grades');
      const savedDrafts = await AsyncStorage.getItem('lfi_user_drafts');
      const savedGraded = await AsyncStorage.getItem('lfi_graded_answers');
      
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

  const saveToLocalStorage = async (answers: Record<LFIQuestionKey, string>, grades: Record<LFIQuestionKey, LFIGradingResult>, drafts?: Record<LFIQuestionKey, string>, graded?: Record<LFIQuestionKey, string>) => {
    try {
      await AsyncStorage.setItem('lfi_user_answers', JSON.stringify(answers));
      await AsyncStorage.setItem('lfi_user_grades', JSON.stringify(grades));
      if (drafts) await AsyncStorage.setItem('lfi_user_drafts', JSON.stringify(drafts));
      if (graded) await AsyncStorage.setItem('lfi_graded_answers', JSON.stringify(graded));
    } catch (error) {
      console.log('Local storage save failed');
    }
  };

  const syncLocalStorageToSupabase = async () => {
    if (!user?.id) return;

    try {
      console.log('Syncing local storage data to Supabase...');
      
      const savedAnswers = await AsyncStorage.getItem('lfi_user_answers');
      const savedGrades = await AsyncStorage.getItem('lfi_user_grades');
      
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
      await saveToLocalStorage(userAnswers, userGrades, newDrafts, gradedAnswers);
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
      await loadFromLocalStorage();
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
        await loadFromLocalStorage();
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
        await saveToLocalStorage({} as Record<LFIQuestionKey, string>, grades, drafts, gradedAnswers);
        console.log('Successfully synced data from Supabase to local storage');
      } else {
        console.log('No answers found in database, checking local storage...');
        await loadFromLocalStorage();
      }
    } catch (error) {
      console.log('Database not available, using local storage only:', error);
      await loadFromLocalStorage();
    }
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

  // Enhanced UX helper functions
  const toggleCompetencyExpansion = (competencyKey: LFIQuestionKey) => {
    const newExpanded = new Set(expandedCompetencies);
    if (newExpanded.has(competencyKey)) {
      newExpanded.delete(competencyKey);
    } else {
      newExpanded.add(competencyKey);
    }
    setExpandedCompetencies(newExpanded);
  };

  const getCompetencyStatus = (competencyKey: LFIQuestionKey) => {
    const hasAnswer = gradedAnswers[competencyKey];
    const hasDraft = userDrafts[competencyKey];
    const hasGrade = userGrades[competencyKey];
    
    // If there's a grade, it's completed regardless of other states
    if (hasGrade) return 'completed';
    // If there's an answer or draft, it's in progress
    if (hasDraft || hasAnswer) return 'in_progress';
    // Otherwise, not started
    return 'not_started';
  };

  const handleQuestionSelect = (questionKey: LFIQuestionKey) => {
    setUserAnswer(gradedAnswers[questionKey] || userDrafts[questionKey] || '');
    setGradingResult(userGrades[questionKey] || null);
    setPreviousAnswer(gradedAnswers[questionKey] || '');
    setPreviousGrade(userGrades[questionKey] || null);
    setIsNewAttempt(false);
    setPracticeAnswer(gradedAnswers[questionKey] || userDrafts[questionKey] || '');
    setSelectedQuestion(questionKey); // Set this temporarily for the modal
    setShowPracticeModal(true);
  };

  const handlePracticeModalClose = () => {
    setShowPracticeModal(false);
    setSelectedQuestion(null); // Reset to go back to competencies list
    setPracticeAnswer('');
  };

  const handlePracticeGrade = async () => {
    if (!selectedQuestion || !practiceAnswer.trim()) {
      Alert.alert('Error', 'Please enter an answer before grading.');
      return;
    }

    try {
      setIsGrading(true);
      const result = gradeAnswerIntelligently(practiceAnswer, selectedQuestion);
      
      setUserAnswer(practiceAnswer);
      setGradingResult(result);
      setPreviousGrade(result);
      setIsNewAttempt(true);
      
      // Update userGrades state so competency cards show completed status
      setUserGrades(prev => ({ ...prev, [selectedQuestion]: result }));
      
      // Save graded answer
      const newGradedAnswers = {
        ...gradedAnswers,
        [selectedQuestion]: practiceAnswer
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
      await saveToLocalStorage(userAnswers, newGrades, newDrafts, newGradedAnswers);
      
      handlePracticeModalClose();
      setShowGradingModal(true);
    } catch (error) {
      console.error('Error grading practice answer:', error);
      Alert.alert('Error', 'Failed to grade your answer. Please try again.');
    } finally {
      setIsGrading(false);
    }
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
      await saveToLocalStorage(userAnswers, newGrades, newDrafts, newGradedAnswers);

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
        return styles.enhancedCompetencyCard;
      case "Effective":
        return styles.enhancedCompetencyCard;
      case "Developing":
        return styles.enhancedCompetencyCard;
      case "Needs Work":
        return styles.enhancedCompetencyCard;
      default:
        return styles.enhancedCompetencyCard;
    }
  };

  const getScoreIcon = (score: number) => {
    if (score >= 85) return Star;
    if (score >= 70) return TrendingUp;
    return MessageSquare;
  };

  // Icon mapping for the themes
  const iconMap = {
    Users,
    FileText,
    Building,
    Globe,
    Lightbulb,
    Car,
  };

  // Convert LFI_QUESTION_THEMES to array with proper icon components
  const questionThemes = Object.entries(LFI_QUESTION_THEMES).map(([key, theme]) => ({
    key: key as LFIQuestionKey,
    icon: iconMap[theme.icon as keyof typeof iconMap],
    title: theme.title,
    description: theme.description,
  }));

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
    <ProfessionalBackground>
      <ScrollView 
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* LFI Hero Card - Moved to Top */}
        <View style={styles.lfiHeroSection}>
          <View style={styles.lfiHeroIcon}>
            <Shield size={32} color={Colors.white} strokeWidth={2} />
          </View>
          <Text style={styles.lfiHeroTitle}>Local Focus Interview</Text>
          <Text style={styles.lfiHeroSubtitle}>
            Demonstrate your knowledge of the service and community awareness
          </Text>
        </View>

        {/* Enhanced Tab Navigation */}
        <View style={styles.enhancedTabContainer}>
          <View style={styles.tabBackground}>
            {[
              { key: 'overview', label: 'Overview', icon: Target },
              { key: 'practice', label: 'Practice', icon: Edit3 },
            ].map((tab, index) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.enhancedTabButton,
                  activeTab === tab.key && styles.enhancedTabButtonActive,
                  index === 0 && styles.firstTab,
                  index === 1 && styles.lastTab,
                ]}
                onPress={() => setActiveTab(tab.key as any)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.tabIconContainer,
                  activeTab === tab.key && styles.tabIconContainerActive
                ]}>
                  <tab.icon 
                    size={20} 
                    color={activeTab === tab.key ? Colors.white : Colors.gray[500]} 
                  />
                </View>
                <Text style={[
                  styles.enhancedTabButtonText,
                  activeTab === tab.key && styles.enhancedTabButtonTextActive
                ]}>
                  {tab.label}
                </Text>
                {activeTab === tab.key && (
                  <View style={styles.activeTabIndicator} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <View style={styles.tabContent}>
            {/* Key Focus Areas Grid */}
            <View style={styles.competenciesGrid}>
              <Text style={styles.gridTitle}>Assessment Focus Areas</Text>
              <View style={styles.gridContainer}>
                <View style={styles.gridItem}>
                  <View style={styles.gridIcon}>
                    <Building2 size={20} color={Colors.primary} />
                  </View>
                  <Text style={styles.gridLabel}>Service Knowledge</Text>
                </View>
                <View style={styles.gridItem}>
                  <View style={styles.gridIcon}>
                    <MapPin size={20} color={Colors.primary} />
                  </View>
                  <Text style={styles.gridLabel}>Community Awareness</Text>
                </View>
                <View style={styles.gridItem}>
                  <View style={styles.gridIcon}>
                    <Heart size={20} color={Colors.primary} />
                  </View>
                  <Text style={styles.gridLabel}>Motivation</Text>
                </View>
                <View style={styles.gridItem}>
                  <View style={styles.gridIcon}>
                    <User size={20} color={Colors.primary} />
                  </View>
                  <Text style={styles.gridLabel}>Background</Text>
                </View>
              </View>
            </View>

            {/* Process Overview */}
            <View style={styles.processSection}>
              <Text style={styles.processTitle}>Interview Structure</Text>
              <View style={styles.processSteps}>
                <View style={styles.processStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>1</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>Service Knowledge</Text>
                    <Text style={styles.stepDescription}>Questions about the police service's mission, values, and recent initiatives</Text>
                  </View>
                </View>
                <View style={styles.processStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>2</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>Community Understanding</Text>
                    <Text style={styles.stepDescription}>Discuss local demographics, issues, and community policing approaches</Text>
                  </View>
                </View>
                <View style={styles.processStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>3</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>Personal Fit</Text>
                    <Text style={styles.stepDescription}>Share your motivations, background, and why you're suited for this service</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Quick Preparation Tips */}
            <View style={styles.quickTipsSection}>
              <Text style={styles.quickTipsTitle}>Key Preparation Areas</Text>
              <View style={styles.tipsGrid}>
                <View style={styles.tipCard}>
                  <Building2 size={16} color={Colors.primary} />
                  <Text style={styles.tipCardText}>Research the service</Text>
                </View>
                <View style={styles.tipCard}>
                  <MapPin size={16} color={Colors.primary} />
                  <Text style={styles.tipCardText}>Know the community</Text>
                </View>
                <View style={styles.tipCard}>
                  <Heart size={16} color={Colors.primary} />
                  <Text style={styles.tipCardText}>Express motivation</Text>
                </View>
                <View style={styles.tipCard}>
                  <User size={16} color={Colors.primary} />
                  <Text style={styles.tipCardText}>Share background</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Practice Tab Content */}
        {activeTab === 'practice' && (
          <View style={styles.tabContent}>
            <View style={styles.practiceContent}>
              <View style={styles.competenciesSection}>
                <View style={styles.sectionHeader}>
                  <Target size={20} color={Colors.primary} />
                  <Text style={styles.sectionTitle}>LFI Question Themes</Text>
                </View>
                <Text style={styles.sectionDescription}>
                  Tap to expand and see sample questions, then practice your responses.
                </Text>
                
                {questionThemes.map((theme) => {
                  const status = getCompetencyStatus(theme.key);
                  const isExpanded = expandedCompetencies.has(theme.key);
                  
                  return (
                    <View
                      key={theme.key}
                      style={[
                        styles.enhancedCompetencyCard,
                        status === 'completed' && styles.competencyCardCompleted
                      ]}
                    >
                      <TouchableOpacity
                        style={styles.competencyMainHeader}
                        onPress={() => toggleCompetencyExpansion(theme.key)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.competencyHeaderContent}>
                          <View style={[
                            styles.competencyIcon,
                            { backgroundColor: Colors.primary }
                          ]}>
                            <theme.icon size={24} color={Colors.white} strokeWidth={2} />
                          </View>
                          
                          <View style={styles.competencyInfo}>
                            <Text style={styles.competencyTitle}>{theme.title}</Text>
                            
                            <View style={styles.competencyStatusRow}>
                              <View style={[
                                styles.competencyStatusBadge,
                                {
                                  backgroundColor: status === 'completed' ? Colors.success + '20' : Colors.gray[100],
                                  borderColor: status === 'completed' ? Colors.success : Colors.gray[200]
                                }
                              ]}>
                                <View style={[
                                  styles.statusIndicator,
                                  {
                                    backgroundColor: status === 'completed' ? Colors.success : Colors.gray[400]
                                  }
                                ]} />
                                <Text style={[
                                  styles.statusText,
                                  {
                                    color: status === 'completed' ? Colors.success : Colors.gray[600]
                                  }
                                ]}>
                                  {status === 'completed' ? 'Completed' : status === 'in_progress' ? 'In Progress' : 'Not Started'}
                                </Text>
                              </View>
                            </View>
                            
                            <Text style={styles.competencyDescription}>{theme.description}</Text>
                          </View>
                          
                          <TouchableOpacity style={styles.expandIcon}>
                            {isExpanded ? (
                              <ChevronUp size={20} color={Colors.gray[500]} />
                            ) : (
                              <ChevronDown size={20} color={Colors.gray[500]} />
                            )}
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                      
                      {isExpanded && (
                        <View style={styles.competencyExpandedContent}>
                          <View style={styles.exampleSection}>
                            <Text style={styles.exampleLabel}>Sample Question</Text>
                            <Text style={styles.examplePrompt}>
                              "Describe a time when you had to work effectively with a diverse team to achieve a common goal. What challenges did you face and how did you overcome them?"
                            </Text>
                          </View>
                          
                          <View style={styles.competencyActions}>
                            <View style={styles.verticalActions}>
                              <TouchableOpacity
                                style={styles.fullWidthButton}
                                onPress={() => handleQuestionSelect(theme.key)}
                                activeOpacity={0.8}
                              >
                                <View style={styles.buttonContent}>
                                  <Play size={16} color={Colors.white} />
                                  <Text style={styles.buttonText}>Practice Answer</Text>
                                </View>
                              </TouchableOpacity>
                              
                              <View style={styles.horizontalActions}>
                                <TouchableOpacity
                                  style={styles.halfWidthButton}
                                  onPress={() => {
                                    // Handle tips
                                  }}
                                  activeOpacity={0.8}
                                >
                                  <View style={styles.buttonContent}>
                                    <HelpCircle size={14} color={Colors.white} />
                                    <Text style={styles.buttonText}>Tips</Text>
                                  </View>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                  style={styles.halfWidthButton}
                                  onPress={() => {
                                    // Handle review
                                  }}
                                  activeOpacity={0.8}
                                >
                                  <View style={styles.buttonContent}>
                                    <BookOpen size={14} color={Colors.white} />
                                    <Text style={styles.buttonText}>Review</Text>
                                  </View>
                                </TouchableOpacity>
                              </View>
                            </View>
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* Enhanced iOS-style Modals */}
        <Modal
          visible={showPracticeModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.iOSModalContainer}>
            <View style={styles.iOSModalHeader}>
              <View style={styles.modalHandle} />
              
              <View style={styles.modalHeaderRow}>
                <TouchableOpacity 
                  style={styles.modalCloseButton}
                  onPress={handlePracticeModalClose}
                >
                  <X size={24} color={Colors.white} />
                </TouchableOpacity>
                
                <View style={styles.modalShieldContainer}>
                  <View style={styles.modalShieldIcon}>
                    <Shield size={24} color={Colors.white} strokeWidth={2} />
                    <View style={styles.modalShieldDot}>
                      <View style={styles.modalRedDot} />
                    </View>
                  </View>
                </View>
                
                <View style={styles.modalSpacer} />
              </View>
            </View>

            <ScrollView style={styles.iOSModalContent} showsVerticalScrollIndicator={false}>
              {selectedQuestion && (
                <View>
                  <View style={styles.iOSQuestionCard}>
                    <Text style={styles.iOSQuestionLabel}>SAMPLE QUESTION</Text>
                    <Text style={styles.iOSQuestionText}>
                      "Describe a time when you had to work effectively with a diverse team to achieve a common goal. What challenges did you face and how did you overcome them?"
                    </Text>
                  </View>

                  <View style={styles.starGuidanceSection}>
                    <Text style={styles.promptLabel}>Your Answer:</Text>
                    <TextInput
                      style={styles.questionPrompt}
                      value={practiceAnswer}
                      onChangeText={setPracticeAnswer}
                      placeholder="Write your answer here..."
                      placeholderTextColor={Colors.gray[400]}
                      multiline
                      textAlignVertical="top"
                      maxLength={2000}
                    />
                    <Text style={styles.characterCount}>
                      {practiceAnswer.length}/2000 characters
                    </Text>
                  </View>

                  <View style={styles.practiceActions}>
                    <TouchableOpacity
                      style={[styles.saveDraftButton, { opacity: practiceAnswer.trim() ? 1 : 0.5 }]}
                      onPress={() => {
                        // Save draft functionality
                      }}
                      disabled={!practiceAnswer.trim() || isSaving}
                    >
                      <Bookmark size={16} color={Colors.white} />
                      <Text style={styles.saveDraftButtonText}>
                        {isSaving ? 'Saving...' : 'Save Draft'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.gradeButton, { opacity: practiceAnswer.trim() ? 1 : 0.5 }]}
                      onPress={handlePracticeGrade}
                      disabled={!practiceAnswer.trim() || isGrading}
                    >
                      <Award size={16} color={Colors.white} />
                      <Text style={styles.gradeButtonText}>
                        {isGrading ? 'Grading...' : 'Grade Answer'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </Modal>

        <Modal
          visible={showGradingModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.iOSModalContainer}>
            <View style={styles.iOSModalHeader}>
              <View style={styles.modalHandle} />
              <View style={styles.iOSModalTitleContainer}>
                <Award size={24} color={Colors.primary} />
                <Text style={styles.iOSModalTitle}>Answer Assessment</Text>
              </View>
              <TouchableOpacity 
                style={styles.iOSCloseButton}
                onPress={() => setShowGradingModal(false)}
              >
                <X size={20} color={Colors.gray[500]} />
              </TouchableOpacity>
            </View>
            
            {gradingResult && (
              <ScrollView style={styles.iOSModalContent} showsVerticalScrollIndicator={false}>
                <View style={styles.iOSGradeHeader}>
                  <View style={[styles.iOSGradeIcon, { backgroundColor: `${getScoreColor(gradingResult.score)}15` }]}>
                    {getGradeIcon(gradingResult.score)}
                  </View>
                  <Text style={[styles.iOSGradeTitle, { color: getScoreColor(gradingResult.score) }]}>
                    {gradingResult.label}
                  </Text>
                  <Text style={styles.iOSGradeScore}>Score: {gradingResult.score}/100</Text>
                </View>
                
                {/* User's Answer Section */}
                <View style={styles.iOSAnswerSection}>
                  <View style={styles.iOSAnswerHeader}>
                    <FileText size={20} color={Colors.primary} />
                    <Text style={styles.iOSAnswerTitle}>Your Answer</Text>
                  </View>
                  <View style={styles.iOSAnswerContent}>
                    <Text style={styles.iOSAnswerText}>
                      {userAnswer}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.iOSFeedbackSection}>
                  <View style={styles.iOSFeedbackHeader}>
                    <CheckCircle size={20} color={Colors.success} />
                    <Text style={styles.iOSFeedbackTitle}>Strengths</Text>
                  </View>
                  {gradingResult.notes.filter(note => note.includes('Good') || note.includes('Strong')).map((strength, index) => (
                    <View key={index} style={styles.iOSFeedbackItem}>
                      <View style={[styles.iOSFeedbackBullet, { backgroundColor: Colors.success }]} />
                      <Text style={styles.iOSFeedbackText}>{strength}</Text>
                    </View>
                  ))}
                </View>
                
                <View style={styles.iOSFeedbackSection}>
                  <View style={styles.iOSFeedbackHeader}>
                    <AlertCircle size={20} color={Colors.warning} />
                    <Text style={styles.iOSFeedbackTitle}>Areas for Improvement</Text>
                  </View>
                  {gradingResult.notes.filter(note => note.includes('Consider') || note.includes('Try')).map((area, index) => (
                    <View key={index} style={styles.iOSFeedbackItem}>
                      <View style={[styles.iOSFeedbackBullet, { backgroundColor: Colors.warning }]} />
                      <Text style={styles.iOSFeedbackText}>{area}</Text>
                    </View>
                  ))}
                </View>
                
                <View style={styles.iOSFeedbackSection}>
                  <View style={styles.iOSFeedbackHeader}>
                    <Lightbulb size={20} color={Colors.primary} />
                    <Text style={styles.iOSFeedbackTitle}>Specific Tips</Text>
                  </View>
                  {gradingResult.tips.map((tip, index) => (
                    <View key={index} style={styles.iOSFeedbackItem}>
                      <View style={[styles.iOSFeedbackBullet, { backgroundColor: Colors.primary }]} />
                      <Text style={styles.iOSFeedbackText}>{tip}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>
        </Modal>
      </ScrollView>
    </ProfessionalBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 115,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: '#1a1a1a',
    lineHeight: 26,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  enhancedTabContainer: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  tabBackground: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 6,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  enhancedTabButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    position: 'relative',
  },
  enhancedTabButtonActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  firstTab: {
    marginRight: 3,
  },
  lastTab: {
    marginLeft: 3,
  },
  tabIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  tabIconContainerActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  enhancedTabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  enhancedTabButtonTextActive: {
    color: Colors.white,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: -2,
    left: '50%',
    marginLeft: -8,
    width: 16,
    height: 3,
    backgroundColor: Colors.white,
    borderRadius: 2,
  },
  tabContent: {
    flex: 1,
  },
  quickIntroCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  quickIntroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickIntroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginLeft: 12,
    letterSpacing: -0.2,
  },
  quickIntroText: {
    fontSize: 15,
    color: '#1a1a1a',
    lineHeight: 24,
    marginBottom: 20,
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  keyPoints: {
    gap: 12,
    marginTop: 20,
  },
  keyPoint: {
    fontSize: 15,
    color: '#1a1a1a',
    lineHeight: 22,
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  tipsSection: {
    flex: 1,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginLeft: 12,
    letterSpacing: -0.3,
  },
  tipCategoryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  tipCategoryTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 18,
    letterSpacing: -0.2,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 6,
    marginRight: 12,
  },
  tipText: {
    fontSize: 15,
    color: '#1a1a1a',
    lineHeight: 22,
    flex: 1,
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  practiceContent: {
    gap: 20,
  },
  competenciesSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginLeft: 12,
    flex: 1,
    letterSpacing: -0.3,
  },
  sectionDescription: {
    fontSize: 15,
    color: '#1a1a1a',
    marginBottom: 24,
    lineHeight: 22,
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  enhancedCompetencyCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 0,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  competencyCardCompleted: {
    borderWidth: 2,
    borderColor: Colors.success,
    shadowColor: Colors.success,
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  competencyMainHeader: {
    padding: 20,
  },
  competencyHeaderContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  competencyIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  competencyInfo: {
    flex: 1,
  },
  competencyTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1f2937',
    letterSpacing: -0.2,
    lineHeight: 24,
    marginBottom: 6,
  },
  competencyStatusRow: {
    marginBottom: 8,
  },
  competencyStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  competencyDescription: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
    marginBottom: 10,
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  gradeBadge: {
    alignSelf: 'flex-start',
  },
  gradeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  expandIcon: {
    marginLeft: 12,
    padding: 4,
  },
  competencyExpandedContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
    backgroundColor: Colors.gray[50],
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
  },
  exampleSection: {
    marginBottom: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.gray[100],
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  exampleLabel: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.1,
    color: Colors.primary,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  examplePrompt: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0.1,
    color: '#1a1a1a',
    fontStyle: 'italic',
  },
  competencyActions: {
    marginTop: 8,
  },
  verticalActions: {
    gap: 12,
  },
  horizontalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  fullWidthButton: {
    backgroundColor: Colors.success,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  halfWidthButton: {
    backgroundColor: Colors.gray[600],
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: Colors.gray[600],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  // iOS Modal Styles
  iOSModalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  iOSModalHeader: {
    backgroundColor: Colors.primary,
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
  },
  modalCloseButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalShieldContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalShieldIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  modalShieldDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalRedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4444',
  },
  modalSpacer: {
    width: 44,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.gray[300],
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  iOSModalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iOSModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
    marginLeft: 12,
    letterSpacing: -0.3,
  },
  iOSCloseButton: {
    position: 'absolute',
    right: 20,
    top: -12,
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 10,
  },
  iOSModalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  iOSQuestionCard: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 0,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  iOSQuestionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  iOSQuestionText: {
    fontSize: 16,
    color: Colors.white,
    lineHeight: 24,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  starGuidanceSection: {
    marginBottom: 20,
  },
  promptLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 10,
    letterSpacing: -0.1,
  },
  questionPrompt: {
    fontSize: 16,
    fontStyle: 'italic',
    color: Colors.primary,
    lineHeight: 24,
    backgroundColor: `${Colors.primary}10`,
    padding: 18,
    borderRadius: 12,
    fontWeight: '500',
    letterSpacing: 0.1,
    borderWidth: 1,
    borderColor: Colors.border,
    textAlignVertical: 'top',
    minHeight: 120,
  },
  characterCount: {
    fontSize: 12,
    color: Colors.gray[500],
    textAlign: 'right',
    marginTop: 8,
  },
  practiceActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  saveDraftButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gray[600],
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveDraftButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  gradeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  gradeButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  iOSGradeHeader: {
    alignItems: 'center',
    marginBottom: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iOSGradeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iOSGradeTitle: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  iOSGradeScore: {
    fontSize: 17,
    color: '#6b7280',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  iOSAnswerSection: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iOSAnswerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iOSAnswerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 12,
  },
  iOSAnswerContent: {
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iOSAnswerText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text,
    letterSpacing: 0.1,
  },
  iOSFeedbackSection: {
    marginBottom: 24,
  },
  iOSFeedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iOSFeedbackTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1f2937',
    marginLeft: 12,
    letterSpacing: -0.2,
  },
  iOSFeedbackItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iOSFeedbackBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: 12,
  },
  iOSFeedbackText: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
    flex: 1,
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  // LFI Overview Styles
  lfiHeroSection: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  lfiHeroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  lfiHeroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 8,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  lfiHeroSubtitle: {
    fontSize: 16,
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
    opacity: 0.9,
    letterSpacing: 0.1,
  },
  competenciesGrid: {
    marginBottom: 24,
  },
  gridTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  gridIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  processSection: {
    marginBottom: 24,
  },
  processTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  processSteps: {
    gap: 16,
  },
  processStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
    letterSpacing: -0.1,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  quickTipsSection: {
    marginBottom: 24,
  },
  quickTipsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  tipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tipCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tipCardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
    letterSpacing: -0.1,
  },
});

