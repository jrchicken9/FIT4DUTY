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
import { router } from 'expo-router';
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
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { ECI_COMPETENCIES, ECI_QUESTION_THEMES, STAR_METHOD_GUIDANCE, ECI_PREPARATION_TIPS } from "@/constants/eciCriteria";
import { gradeECIAnswer } from "@/lib/eciGrading";
import { ECIGradingResult, ECIQuestionKey } from "@/types/eciGrading";

// Animated Grade Display Component
const AnimatedGradeDisplay = ({ grade }: { grade: ECIGradingResult }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start the animation when component mounts
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    const scaleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    // Start animations with a slight delay for a staggered effect
    setTimeout(() => {
      pulseAnimation.start();
      scaleAnimation.start();
    }, 300);

    return () => {
      pulseAnimation.stop();
      scaleAnimation.stop();
    };
  }, []);

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'Competitive': return Colors.success;
      case 'Effective': return Colors.primary;
      case 'Developing': return Colors.warning;
      case 'Needs Work': return Colors.error;
      default: return Colors.gray[600];
    }
  };

  return (
    <Animated.View 
      style={[
        styles.gradeBadge,
        {
          opacity: pulseAnim,
          transform: [{ scale: scaleAnim }],
        }
      ]}
    >
      <Text style={[styles.gradeText, { color: getGradeColor(grade.grade) }]}>
        {grade.grade}
      </Text>
    </Animated.View>
  );
};

import ProfessionalBackground from "@/components/ProfessionalBackground";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export default function ECIStep() {
  const { user } = useAuth();
  const [selectedQuestion, setSelectedQuestion] = useState<ECIQuestionKey | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [gradingResult, setGradingResult] = useState<ECIGradingResult | null>(null);
  const [isGrading, setIsGrading] = useState(false);
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [previousAnswer, setPreviousAnswer] = useState<string>("");
  const [previousGrade, setPreviousGrade] = useState<ECIGradingResult | null>(null);
  const [isNewAttempt, setIsNewAttempt] = useState(false);
  const [isAnswerExpanded, setIsAnswerExpanded] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<ECIQuestionKey, string>>({} as any);
  const [userGrades, setUserGrades] = useState<Record<ECIQuestionKey, ECIGradingResult>>({} as any);
  const [userDrafts, setUserDrafts] = useState<Record<ECIQuestionKey, string>>({} as any);
  const [gradedAnswers, setGradedAnswers] = useState<Record<ECIQuestionKey, string>>({} as any);
  const [showExample, setShowExample] = useState<ECIQuestionKey | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showStarModal, setShowStarModal] = useState(false);
  const [selectedCompetencyForStar, setSelectedCompetencyForStar] = useState<string | null>(null);
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [practiceAnswer, setPracticeAnswer] = useState('');

  // Competency-specific STAR examples
  const competencyStarExamples = {
    communication: {
      title: "Communication",
      question: "Tell me about a time when you had to explain a complex situation to someone who didn't understand.",
      example: {
        situation: "While working as a security guard at a large shopping mall, I encountered an elderly woman who was lost and appeared distressed. She was speaking rapidly in Spanish, and I could see she was trying to find her family members who had gotten separated from her.",
        task: "As the security officer on duty, I needed to help her locate her family while ensuring she felt safe and understood. I also had to maintain my professional duties and coordinate with other security personnel.",
        action: "I used my basic Spanish phrases and hand gestures to communicate that I was there to help. I called our bilingual staff member, Maria, to assist with translation. While waiting, I guided the woman to a comfortable seating area and used the mall's PA system to announce a description of her family members. I also coordinated with other security officers to search different sections of the mall.",
        result: "Within 15 minutes, we successfully reunited the woman with her family. She was extremely grateful and even taught me a few Spanish phrases for future situations. This experience reinforced the importance of clear communication and led me to take a basic Spanish course to better serve our diverse community."
      }
    },
    self_control: {
      title: "Self-Control",
      question: "Tell me about a time when you remained calm in a highly stressful situation.",
      example: {
        situation: "During a late-night shift as a security guard, I was called to respond to a disturbance in the parking lot where a group of intoxicated individuals was being verbally aggressive and refusing to leave the premises after being asked by another security officer.",
        task: "I needed to de-escalate the situation peacefully while ensuring the safety of all parties involved, including bystanders and other security staff. I also had to maintain my professional demeanor despite the aggressive behavior and personal insults being directed at me.",
        action: "I remained calm and used a steady, non-confrontational tone while clearly explaining the consequences of their continued behavior. I positioned myself to create physical space and gave them clear options: leave peacefully or face police intervention. When one individual became physically threatening, I used de-escalation techniques I'd learned in training, including active listening and acknowledging their concerns while maintaining firm boundaries.",
        result: "The situation was resolved without physical confrontation. The group left the premises after about 20 minutes of negotiation. My supervisor commended my handling of the situation, and I later trained other staff on de-escalation techniques. This experience taught me that maintaining composure under pressure is often more effective than aggressive responses."
      }
    },
    relationship_building: {
      title: "Relationship Building",
      question: "Tell me about a time when you had to build trust with someone who was initially skeptical of you.",
      example: {
        situation: "As a community outreach officer, I was assigned to work with a neighborhood that had historically poor relationships with law enforcement. The community leaders were initially very skeptical of my presence and made it clear they didn't trust 'another cop' coming in to 'fix' their problems.",
        task: "I needed to build genuine relationships with community members and leaders, demonstrate that I was there to listen and support rather than impose solutions, and gradually establish trust that would allow for meaningful collaboration on community safety initiatives.",
        action: "I started by attending community meetings without speaking, just listening and taking notes. I spent time in local businesses, getting to know residents in informal settings. I organized small, low-pressure events like coffee meetings where people could voice concerns without feeling interrogated. I also followed through on every promise I made, no matter how small, and was transparent about what I could and couldn't do as an officer.",
        result: "After six months of consistent effort, community leaders began inviting me to planning meetings and asking for my input on local initiatives. We successfully launched a neighborhood watch program and reduced petty crime by 30% in the area. Several community members even wrote letters to my supervisor praising my approach. This experience taught me that trust is built through consistent actions over time, not through promises or presentations."
      }
    },
    problem_solving: {
      title: "Problem-Solving",
      question: "Tell me about a time when you had to solve a complex problem with limited information.",
      example: {
        situation: "During my role as a security supervisor at a busy hospital, we were experiencing a significant increase in theft of medical equipment and personal belongings from patients and staff. The traditional security measures weren't working, and the problem was affecting both staff morale and patient care quality.",
        task: "I needed to develop a comprehensive solution that would reduce theft while maintaining the hospital's welcoming atmosphere and not making patients or families feel like they were under constant surveillance. The solution had to be cost-effective and sustainable long-term.",
        action: "I conducted a detailed analysis of theft patterns, identifying that most incidents occurred in specific areas and times. I organized focus groups with staff and patients to understand their concerns and get their input on potential solutions. I implemented a multi-layered approach: improved lighting in high-risk areas, strategic placement of security cameras (with clear signage), a 'buddy system' for staff working late shifts, and educational sessions for families about securing valuables. I also established a confidential reporting system for suspicious behavior.",
        result: "Within three months, theft incidents decreased by 65%, and staff reported feeling safer. Patient satisfaction scores actually improved because the new measures were implemented thoughtfully and with their input. The hospital administration was so pleased with the results that they implemented similar programs at other facilities. This experience taught me that the best solutions often come from involving all stakeholders in the problem-solving process."
      }
    },
    flexibility: {
      title: "Flexibility",
      question: "Tell me about a time when you had to quickly adapt to a significant change in your work environment.",
      example: {
        situation: "I was working as a security officer at a corporate headquarters when a major water main break occurred in our building during business hours. The building had to be evacuated immediately, but we also had several high-profile clients in the building for important meetings, and our normal evacuation procedures weren't suitable for the situation.",
        task: "I needed to quickly adapt our evacuation plan to ensure everyone's safety while minimizing disruption to critical business operations and maintaining our company's professional reputation with important clients.",
        action: "I immediately assessed the situation and realized we needed a phased evacuation approach. I coordinated with building management to prioritize the affected floors while allowing safe floors to continue operations temporarily. I personally escorted the VIP clients through an alternative route that avoided the affected areas and arranged for them to continue their meetings at a nearby conference center. I also established a communication system to keep all departments informed about the situation and next steps.",
        result: "All 300+ employees were safely evacuated within 45 minutes, and the VIP clients were able to complete their meetings with minimal disruption. Our company received praise from the clients for our professional handling of the situation. The building management adopted our phased evacuation approach as their new standard procedure. This experience taught me that flexibility and quick thinking are crucial in emergency situations, and that clear communication can turn a potential crisis into a demonstration of competence."
      }
    },
    valuing_diversity: {
      title: "Valuing Diversity",
      question: "Tell me about a time when you worked effectively with people from different backgrounds or perspectives.",
      example: {
        situation: "As a security team leader, I was tasked with organizing a new training program for our department. Our team consisted of officers from various cultural backgrounds, ages (ranging from 22 to 58), and experience levels. Some team members were uncomfortable with the new training approach, and there were concerns about cultural insensitivity in some of the scenarios we'd be practicing.",
        task: "I needed to create an inclusive training environment where all team members felt comfortable participating and contributing, while ensuring the training was effective for everyone regardless of their background or experience level.",
        action: "I started by meeting individually with each team member to understand their concerns and learning preferences. I adapted the training materials to include scenarios that reflected our diverse community, and I incorporated input from team members about cultural considerations. I established ground rules that emphasized respect and open dialogue, and I created smaller discussion groups that allowed quieter team members to participate more comfortably. I also brought in guest speakers from different cultural backgrounds to share their perspectives on community safety.",
        result: "The training program was highly successful, with 95% of team members rating it as valuable and inclusive. Team collaboration improved significantly, and we received positive feedback from community members who noticed our more culturally sensitive approach. Several team members requested additional diversity training, and our department became a model for other agencies. This experience reinforced my belief that diversity strengthens teams and that taking time to understand different perspectives leads to better outcomes for everyone."
      }
    }
  };
  const [starBreakdown, setStarBreakdown] = useState({
    situation: '',
    task: '',
    action: '',
    result: ''
  });
  
  // New state for enhanced UX
  const [expandedCompetencies, setExpandedCompetencies] = useState<Set<ECIQuestionKey>>(new Set());
  const [activeTab, setActiveTab] = useState<'overview' | 'practice'>('overview');
  
  const scrollViewRef = useRef<ScrollView>(null);
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { width } = Dimensions.get('window');

  // Load existing answers and grades
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        await loadUserAnswers();
        await syncLocalStorageToSupabase();
      } else {
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
          setSyncStatus('syncing');
          await syncLocalStorageToSupabase();
          setSyncStatus('success');
        }
      } catch (error) {
        setIsOnline(false);
        setSyncStatus('error');
      }
    };
    checkConnectivity();
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (userAnswer && selectedQuestion) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(async () => {
        await saveDraft(selectedQuestion, userAnswer);
      }, 2000);
    }
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [userAnswer, selectedQuestion]);

  const loadUserAnswers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_eci_answers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading ECI answers:', error);
        return;
      }

      const answers: Record<ECIQuestionKey, string> = {} as any;
      const grades: Record<ECIQuestionKey, ECIGradingResult> = {} as any;
      const drafts: Record<ECIQuestionKey, string> = {} as any;

      data?.forEach((item: any) => {
        const key = item.question_key as ECIQuestionKey;
        if (item.is_draft) {
          drafts[key] = item.answer_text;
        } else {
          answers[key] = item.answer_text;
          // Check if this is a graded answer (has score and label)
          if (item.score !== undefined && item.score !== null && item.label && item.label !== 'Draft') {
            // Reconstruct the grading result from the saved data
            grades[key] = {
              grade: item.label,
              score: item.score,
              feedback: {
                strengths: item.detected?.strengths || [],
                areasForImprovement: item.notes || [],
                specificTips: item.tips || []
              },
              starAnalysis: item.detected?.starAnalysis || {
                situation: { present: false, quality: 'Poor', feedback: '' },
                task: { present: false, quality: 'Poor', feedback: '' },
                action: { present: false, quality: 'Poor', feedback: '' },
                result: { present: false, quality: 'Poor', feedback: '' }
              }
            };
          }
        }
      });

      console.log('Loaded from Supabase:', { answers, grades, drafts });
      
      setUserAnswers(answers);
      setUserGrades(grades);
      setUserDrafts(drafts);
    } catch (error) {
      console.error('Error loading user answers:', error);
    }
  };

  const loadFromLocalStorage = async () => {
    try {
      const [answersData, gradesData, draftsData] = await Promise.all([
        AsyncStorage.getItem('eci_user_answers'),
        AsyncStorage.getItem('eci_user_grades'),
        AsyncStorage.getItem('eci_user_drafts'),
      ]);

      if (answersData) {
        setUserAnswers(JSON.parse(answersData));
      }
      if (gradesData) {
        setUserGrades(JSON.parse(gradesData));
      }
      if (draftsData) {
        setUserDrafts(JSON.parse(draftsData));
      }
    } catch (error) {
      console.error('Error loading from local storage:', error);
    }
  };

  const syncLocalStorageToSupabase = async () => {
    if (!user || !isOnline) return;

    try {
      setSyncStatus('syncing');
      
      // Get current database answers to avoid overwriting newer data
      const { data: dbAnswers } = await supabase
        .from('user_eci_answers')
        .select('question_key, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const dbAnswerMap = new Map();
      dbAnswers?.forEach((item: any) => {
        if (!dbAnswerMap.has(item.question_key)) {
          dbAnswerMap.set(item.question_key, item.created_at);
        }
      });

      // Sync local answers to database
      for (const [questionKey, answerText] of Object.entries(userAnswers)) {
        const localKey = `eci_answer_${questionKey}`;
        const localTimestamp = await AsyncStorage.getItem(localKey);
        
        if (localTimestamp) {
          const dbTimestamp = dbAnswerMap.get(questionKey);
          
          if (!dbTimestamp || new Date(localTimestamp) > new Date(dbTimestamp)) {
            const existingAnswer = dbAnswers?.find((item: any) => 
              item.question_key === questionKey && !item.is_draft
            );
            
            if (!existingAnswer) {
              await supabase.from('user_eci_answers').insert({
                user_id: user.id,
                question_key: questionKey,
                answer_text: answerText,
                is_draft: false,
                created_at: localTimestamp,
                updated_at: new Date().toISOString(),
              });
            }
          }
        }
      }

      setSyncStatus('success');
    } catch (error) {
      console.error('Error syncing to Supabase:', error);
      setSyncStatus('error');
    }
  };

  const saveAnswer = async (questionKey: ECIQuestionKey, answerText: string, gradingResult?: ECIGradingResult) => {
    if (!user) {
      // Save to local storage only
      await saveToLocalStorage(questionKey, answerText, false);
      return;
    }

    try {
      setIsSaving(true);
      setSaveStatus('saving');

      // First, delete any existing answer for this question
      await supabase
        .from('user_eci_answers')
        .delete()
        .eq('user_id', user.id)
        .eq('question_key', questionKey);

      // Prepare the answer data
      const answerData: any = {
        user_id: user.id,
        question_key: questionKey,
        answer_text: answerText,
        is_draft: !gradingResult,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Add grading result data if provided
      if (gradingResult) {
        answerData.score = gradingResult.score;
        answerData.label = gradingResult.grade;
        answerData.notes = gradingResult.feedback.areasForImprovement || [];
        answerData.tips = gradingResult.feedback.specificTips || [];
        answerData.detected = {
          starAnalysis: gradingResult.starAnalysis,
          strengths: gradingResult.feedback.strengths || [],
          improvements: gradingResult.feedback.areasForImprovement || []
        };
      }

      // Then insert the new answer
      const { data, error } = await supabase
        .from('user_eci_answers')
        .insert(answerData);

      if (error) {
        console.error('Error saving answer to Supabase:', error);
        console.error('Answer data attempted:', answerData);
        setSaveStatus('error');
        return;
      }

      // Update local state
      setUserAnswers(prev => ({ ...prev, [questionKey]: answerText }));
      setUserDrafts(prev => {
        const newDrafts = { ...prev };
        delete newDrafts[questionKey];
        return newDrafts;
      });

      console.log('Successfully saved to Supabase:', { questionKey, answerText, gradingResult });

      // Save to local storage as backup
      await saveToLocalStorage(questionKey, answerText, false);
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving answer:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const saveDraft = async (questionKey: ECIQuestionKey, draftText: string) => {
    if (!user) {
      await saveToLocalStorage(questionKey, draftText, true);
      return;
    }

    try {
      setAutoSaveStatus('saving');

      // Delete existing drafts for this question
      const { error: deleteError } = await supabase
        .from('user_eci_answers')
        .delete()
        .eq('user_id', user.id)
        .eq('question_key', questionKey)
        .eq('is_draft', true);

      if (deleteError) {
        console.error('Error deleting draft:', deleteError);
      }

      // Insert new draft
      const { data, error: insertError } = await supabase
        .from('user_eci_answers')
        .insert({
          user_id: user.id,
          question_key: questionKey,
          answer_text: draftText,
          is_draft: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error('Error saving draft:', insertError);
        setAutoSaveStatus('error');
        return;
      }

      // Update local state
      setUserDrafts(prev => ({ ...prev, [questionKey]: draftText }));
      
      // Save to local storage as backup
      await saveToLocalStorage(questionKey, draftText, true);
      
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 1000);
    } catch (error) {
      console.error('Error saving draft:', error);
      setAutoSaveStatus('error');
    }
  };

  const saveToLocalStorage = async (questionKey: ECIQuestionKey, text: string, isDraft: boolean) => {
    try {
      const timestamp = new Date().toISOString();
      const storageKey = isDraft ? 'eci_user_drafts' : 'eci_user_answers';
      
      const currentData = await AsyncStorage.getItem(storageKey);
      const data = currentData ? JSON.parse(currentData) : {};
      data[questionKey] = text;
      
      await AsyncStorage.setItem(storageKey, JSON.stringify(data));
      await AsyncStorage.setItem(`eci_answer_${questionKey}`, timestamp);
    } catch (error) {
      console.error('Error saving to local storage:', error);
    }
  };

  const handleQuestionSelect = (questionKey: ECIQuestionKey) => {
    setUserAnswer(userAnswers[questionKey] || userDrafts[questionKey] || '');
    setGradingResult(userGrades[questionKey] || null);
    setPreviousAnswer(userAnswers[questionKey] || '');
    setPreviousGrade(userGrades[questionKey] || null);
    setIsNewAttempt(false);
    setPracticeAnswer(userAnswers[questionKey] || userDrafts[questionKey] || '');
    setSelectedQuestion(questionKey); // Set this temporarily for the modal
    setShowPracticeModal(true);
  };

  const handlePracticeModalClose = () => {
    setShowPracticeModal(false);
    setSelectedQuestion(null); // Reset to go back to competencies list
    setPracticeAnswer('');
  };

  const handleSaveDraft = async (questionKey: ECIQuestionKey | null, answerText: string) => {
    if (!questionKey || !answerText.trim()) {
      Alert.alert('Error', 'Please enter some text before saving as draft.');
      return;
    }

    try {
      setIsSaving(true);
      await saveDraft(questionKey, answerText);
      Alert.alert('Success', 'Draft saved successfully!');
    } catch (error) {
      console.error('Error saving draft:', error);
      Alert.alert('Error', 'Failed to save draft. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNewAttempt = async (questionKey: ECIQuestionKey) => {
    const competency = ECI_COMPETENCIES.find(c => c.key === questionKey);
    const competencyTitle = competency?.title || 'this competency';
    
    Alert.alert(
      'Start New Attempt',
      `This will reset your previous answer and grade for ${competencyTitle}. You'll need to press "Start Practice" again to begin a fresh attempt.\n\nAre you sure you want to continue?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear from Supabase if user is logged in
              if (user) {
                await supabase
                  .from('user_eci_answers')
                  .delete()
                  .eq('user_id', user.id)
                  .eq('question_key', questionKey);
              }

              // Clear from local storage
              try {
                const answersData = await AsyncStorage.getItem('eci_user_answers');
                const gradesData = await AsyncStorage.getItem('eci_user_grades');
                const draftsData = await AsyncStorage.getItem('eci_user_drafts');
                
                const answers = answersData ? JSON.parse(answersData) : {};
                const grades = gradesData ? JSON.parse(gradesData) : {};
                const drafts = draftsData ? JSON.parse(draftsData) : {};
                
                delete answers[questionKey];
                delete grades[questionKey];
                delete drafts[questionKey];
                
                await AsyncStorage.setItem('eci_user_answers', JSON.stringify(answers));
                await AsyncStorage.setItem('eci_user_grades', JSON.stringify(grades));
                await AsyncStorage.setItem('eci_user_drafts', JSON.stringify(drafts));
              } catch (storageError) {
                console.error('Error clearing local storage:', storageError);
              }

              // Clear from state
              setUserAnswers(prev => {
                const newAnswers = { ...prev };
                delete newAnswers[questionKey];
                return newAnswers;
              });
              setUserGrades(prev => {
                const newGrades = { ...prev };
                delete newGrades[questionKey];
                return newGrades;
              });
              setUserDrafts(prev => {
                const newDrafts = { ...prev };
                delete newDrafts[questionKey];
                return newDrafts;
              });

              // Show success message
              Alert.alert('Reset Complete', `Your ${competencyTitle} attempt has been reset. You can now start a new practice session.`);
            } catch (error) {
              console.error('Error clearing previous attempt:', error);
              Alert.alert('Error', 'Failed to reset your attempt. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handlePracticeGrade = async () => {
    if (!selectedQuestion || !practiceAnswer.trim()) {
      Alert.alert('Error', 'Please enter an answer before grading.');
      return;
    }

    try {
      setIsGrading(true);
      const grade = gradeECIAnswer(practiceAnswer, selectedQuestion);
      
      setUserAnswer(practiceAnswer);
      setGradingResult(grade);
      setPreviousGrade(grade);
      setIsNewAttempt(true);
      
      // Update userGrades state so competency cards show completed status
      setUserGrades(prev => ({ ...prev, [selectedQuestion]: grade }));
      
      console.log('About to save graded answer to Supabase:', { selectedQuestion, practiceAnswer, grade });
      
      // Save to Supabase and local storage with grading result
      await saveAnswer(selectedQuestion, practiceAnswer, grade);
      
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
      Alert.alert('Error', 'Please enter an answer before grading.');
      return;
    }

    setIsGrading(true);
    
    try {
      const result = gradeECIAnswer(userAnswer, selectedQuestion);
      setGradingResult(result);
      setUserGrades(prev => ({ ...prev, [selectedQuestion]: result }));
      setShowGradingModal(true);
      
      // Save graded answer with grading result
      await saveAnswer(selectedQuestion, userAnswer, result);
      
      // Save grade to local storage
      try {
        const gradesData = await AsyncStorage.getItem('eci_user_grades');
        const grades = gradesData ? JSON.parse(gradesData) : {};
        grades[selectedQuestion] = result;
        await AsyncStorage.setItem('eci_user_grades', JSON.stringify(grades));
      } catch (error) {
        console.error('Error saving grade to local storage:', error);
      }
      
    } catch (error) {
      console.error('Error grading answer:', error);
      Alert.alert('Error', 'Failed to grade your answer. Please try again.');
    } finally {
      setIsGrading(false);
    }
  };

  const handleSaveAnswer = async () => {
    if (!selectedQuestion || !userAnswer.trim()) {
      Alert.alert('Error', 'Please enter an answer before saving.');
      return;
    }

    await saveAnswer(selectedQuestion, userAnswer);
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'Competitive': return Colors.success;
      case 'Effective': return Colors.primary;
      case 'Developing': return Colors.warning;
      case 'Needs Work': return Colors.error;
      default: return Colors.gray[500];
    }
  };

  const getGradeIcon = (grade: string) => {
    switch (grade) {
      case 'Competitive': return <CheckCircle size={20} color={Colors.success} />;
      case 'Effective': return <Target size={20} color={Colors.primary} />;
      case 'Developing': return <TrendingUp size={20} color={Colors.warning} />;
      case 'Needs Work': return <AlertCircle size={20} color={Colors.error} />;
      default: return <HelpCircle size={20} color={Colors.gray[500]} />;
    }
  };

  // Enhanced UX helper functions
  const toggleCompetencyExpansion = (competencyKey: ECIQuestionKey) => {
    const newExpanded = new Set(expandedCompetencies);
    if (newExpanded.has(competencyKey)) {
      newExpanded.delete(competencyKey);
    } else {
      newExpanded.add(competencyKey);
    }
    setExpandedCompetencies(newExpanded);
  };

  const getCompetencyStatus = (competencyKey: ECIQuestionKey) => {
    const hasAnswer = userAnswers[competencyKey];
    const hasDraft = userDrafts[competencyKey];
    const hasGrade = userGrades[competencyKey];
    
    // If there's a grade, it's completed regardless of other states
    if (hasGrade) return 'completed';
    // If there's an answer or draft, it's in progress
    if (hasDraft || hasAnswer) return 'in_progress';
    // Otherwise, not started
    return 'not_started';
  };

  const getFilteredCompetencies = () => {
    return ECI_COMPETENCIES;
  };


  const renderCompetencyCard = (competency: any) => {
    const questionKey = competency.key as ECIQuestionKey;
    const hasAnswer = userAnswers[questionKey];
    const hasDraft = userDrafts[questionKey];
    const grade = userGrades[questionKey];
    const status = getCompetencyStatus(questionKey);
    const isExpanded = expandedCompetencies.has(questionKey);
    
    const getStatusColor = () => {
      switch (status) {
        case 'completed': return Colors.success;
        case 'in_progress': return Colors.warning;
        default: return Colors.primary;
      }
    };

    const getCompetencyColor = () => {
      switch (competency.key) {
        case 'communication': return '#3B82F6'; // Blue
        case 'self_control': return '#10B981'; // Green
        case 'relationship_building': return '#8B5CF6'; // Purple
        case 'problem_solving': return '#F59E0B'; // Orange
        case 'flexibility': return '#06B6D4'; // Cyan
        case 'valuing_diversity': return '#EF4444'; // Red
        default: return Colors.primary;
      }
    };

    const getStatusIcon = () => {
      switch (status) {
        case 'completed': return <CheckCircle size={16} color={Colors.success} />;
        case 'in_progress': return <Clock size={16} color={Colors.warning} />;
        default: return <Play size={16} color={Colors.gray[400]} />;
      }
    };

    return (
      <View key={competency.key} style={[styles.enhancedCompetencyCard, status === 'completed' && styles.competencyCardCompleted]}>
        {/* Main Card Header */}
        <TouchableOpacity
          style={styles.competencyMainHeader}
          onPress={() => toggleCompetencyExpansion(questionKey)}
          activeOpacity={0.7}
        >
          <View style={styles.competencyHeaderContent}>
            <View style={[styles.competencyIcon, { backgroundColor: `${getCompetencyColor()}15` }]}>
              {competency.key === 'communication' ? <MessageSquare size={24} color={getCompetencyColor()} /> :
               competency.key === 'self_control' ? <Shield size={24} color={getCompetencyColor()} /> :
               competency.key === 'relationship_building' ? <Users size={24} color={getCompetencyColor()} /> :
               competency.key === 'problem_solving' ? <Target size={24} color={getCompetencyColor()} /> :
               competency.key === 'flexibility' ? <RefreshCw size={24} color={getCompetencyColor()} /> :
               competency.key === 'valuing_diversity' ? <Globe size={24} color={getCompetencyColor()} /> :
               <TrendingUp size={24} color={getCompetencyColor()} />}
            </View>
            
            <View style={styles.competencyInfo}>
              <Text style={styles.competencyTitle}>{competency.title}</Text>
              <View style={styles.competencyStatusRow}>
                <View style={[styles.competencyStatusBadge, { 
                  backgroundColor: status === 'completed' ? `${Colors.success}15` : 
                                  status === 'in_progress' ? `${Colors.warning}15` : 
                                  `${getCompetencyColor()}15`,
                  borderColor: status === 'completed' ? Colors.success : 
                              status === 'in_progress' ? Colors.warning : 
                              getCompetencyColor()
                }]}>
                  {getStatusIcon()}
                  <Text style={[styles.statusText, { color: getStatusColor() }]}>
                    {status === 'completed' ? 'Complete' : status === 'in_progress' ? 'In Progress' : 'Not Started'}
                  </Text>
                </View>
              </View>
              <Text style={styles.competencyDescription}>{competency.description}</Text>
              {grade && (
                <AnimatedGradeDisplay grade={grade} />
              )}
            </View>
            
            <View style={styles.expandIcon}>
              {isExpanded ? <ChevronUp size={20} color={Colors.gray[500]} /> : <ChevronDown size={20} color={Colors.gray[500]} />}
            </View>
          </View>
        </TouchableOpacity>

        {/* Expanded Content */}
        {isExpanded && (
          <View style={styles.competencyExpandedContent}>
            <View style={styles.exampleSection}>
              <Text style={styles.exampleLabel}>Sample Question:</Text>
              <Text style={styles.examplePrompt}>"{competency.examplePrompt}"</Text>
            </View>
            
            
            <View style={styles.competencyActions}>
              {grade ? (
                // Show 3 CTAs when there's a graded answer - vertical layout
                <View style={styles.verticalActions}>
                  <TouchableOpacity
                    style={styles.fullWidthButton}
                    onPress={() => {
                      setGradingResult(grade);
                      setUserAnswer(userAnswers[questionKey] || '');
                      setIsAnswerExpanded(false); // Reset expand state
                      setShowGradingModal(true);
                    }}
                  >
                    <View style={styles.buttonContent}>
                      <Eye size={18} color={Colors.white} />
                      <Text style={styles.buttonText}>Review Grade</Text>
                    </View>
                  </TouchableOpacity>
                  
                  <View style={styles.horizontalActions}>
                    <TouchableOpacity
                      style={styles.halfWidthButton}
                      onPress={() => handleNewAttempt(questionKey)}
                    >
                      <View style={styles.buttonContent}>
                        <RefreshCw size={16} color={Colors.white} />
                        <Text style={styles.buttonText}>New Attempt</Text>
                      </View>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.halfWidthButton, { backgroundColor: Colors.warning, shadowColor: Colors.warning }]}
                      onPress={() => {
                        setSelectedCompetencyForStar(questionKey);
                        setShowStarModal(true);
                      }}
                    >
                      <View style={styles.buttonContent}>
                        <Star size={16} color={Colors.white} />
                        <Text style={styles.buttonText}>STAR Guide</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                // Show 2 CTAs when no graded answer yet
                <View style={styles.horizontalActions}>
                  <TouchableOpacity
                    style={[styles.halfWidthButton, { backgroundColor: Colors.primary, shadowColor: Colors.primary }]}
                    onPress={() => {
                      handleQuestionSelect(questionKey);
                    }}
                  >
                    <View style={styles.buttonContent}>
                      <Play size={16} color={Colors.white} />
                      <Text style={styles.buttonText}>
                        {hasAnswer ? 'Review Answer' : hasDraft ? 'Continue Draft' : 'Start Practice'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.halfWidthButton, { backgroundColor: Colors.warning, shadowColor: Colors.warning }]}
                    onPress={() => {
                      setSelectedCompetencyForStar(questionKey);
                      setShowStarModal(true);
                    }}
                  >
                    <View style={styles.buttonContent}>
                      <Star size={16} color={Colors.white} />
                      <Text style={styles.buttonText}>STAR Guide</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  const filteredCompetencies = getFilteredCompetencies();

  return (
    <ProfessionalBackground>
      <ScrollView 
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Essential Competency Interview</Text>
            <Text style={styles.subtitle}>
              Master behavioral competencies through structured practice
            </Text>
          </View>
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
            {/* What is ECI Card */}
            <View style={styles.quickIntroCard}>
              <View style={styles.quickIntroHeader}>
                <Clock size={20} color={Colors.primary} />
                <Text style={styles.quickIntroTitle}>What is the ECI?</Text>
              </View>
              <Text style={styles.quickIntroText}>
                The Essential Competency Interview (ECI) is a formal, structured behavioral interview that typically lasts up to 2 hours and is conducted by a panel of one to two recruiting officers. Unlike the LFI which focuses on service knowledge and motivations, the ECI assesses your behavioral competencies through real past experiences using the STAR method.
              </Text>
              
              <View style={styles.keyPoints}>
                <Text style={styles.keyPoint}>• Focuses on past behaviors and demonstrated performance</Text>
                <Text style={styles.keyPoint}>• Uses STAR method (Situation, Task, Action, Result)</Text>
                <Text style={styles.keyPoint}>• Assesses essential competencies required for policing</Text>
                <Text style={styles.keyPoint}>• Expects real examples, not hypothetical scenarios</Text>
              </View>
            </View>

            {/* Preparation Tips */}
            <View style={styles.tipsSection}>
              <View style={styles.tipsHeader}>
                <BookOpen size={20} color={Colors.primary} />
                <Text style={styles.tipsTitle}>ECI Preparation Tips</Text>
              </View>
              
              {ECI_PREPARATION_TIPS.map((category, index) => (
                <View key={index} style={styles.tipCategoryCard}>
                  <Text style={styles.tipCategoryTitle}>{category.category}</Text>
                  {category.tips.map((tip, tipIndex) => (
                    <View key={tipIndex} style={styles.tipItem}>
                      <View style={styles.tipBullet} />
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>

          </View>
        )}


        {/* Practice Tab Content */}
        {activeTab === 'practice' && (
          <View style={styles.tabContent}>
            {selectedQuestion && !showPracticeModal ? (
              <View style={styles.practiceSection}>
                <View style={styles.practiceHeader}>
                  <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => {
                      setSelectedQuestion(null);
                      setUserAnswer("");
                      setGradingResult(null);
                    }}
                  >
                    <ArrowRight size={20} color={Colors.primary} style={{ transform: [{ rotate: '180deg' }] }} />
                    <Text style={styles.backButtonText}>Back to Competencies</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.practiceCard}>
                  <View style={styles.questionHeader}>
                    <View style={styles.questionIcon}>
                      {selectedQuestion === 'communication' ? <MessageSquare size={24} color={Colors.primary} /> :
                       selectedQuestion === 'self_control' ? <Shield size={24} color={Colors.primary} /> :
                       selectedQuestion === 'relationship_building' ? <Users size={24} color={Colors.primary} /> :
                       selectedQuestion === 'problem_solving' ? <Target size={24} color={Colors.primary} /> :
                       selectedQuestion === 'flexibility' ? <RefreshCw size={24} color={Colors.primary} /> :
                       selectedQuestion === 'valuing_diversity' ? <Globe size={24} color={Colors.primary} /> :
                       <TrendingUp size={24} color={Colors.primary} />}
                    </View>
                    <View style={styles.questionInfo}>
                      <Text style={styles.questionTitle}>
                        {ECI_COMPETENCIES.find(c => c.key === selectedQuestion)?.title}
                      </Text>
                      <Text style={styles.questionDescription}>
                        {ECI_COMPETENCIES.find(c => c.key === selectedQuestion)?.description}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.questionPromptSection}>
                    <Text style={styles.promptLabel}>Your Question:</Text>
                    <Text style={styles.questionPrompt}>
                      "{ECI_COMPETENCIES.find(c => c.key === selectedQuestion)?.examplePrompt}"
                    </Text>
                  </View>
                  
                  <View style={styles.starGuidanceSection}>
                    <Text style={styles.starGuidanceLabel}>STAR Method:</Text>
                    <View style={styles.starGuidanceGrid}>
                      {Object.entries(ECI_COMPETENCIES.find(c => c.key === selectedQuestion)?.starGuidance || {}).map(([key, guidance]) => (
                        <View key={key} style={styles.starGuidanceItem}>
                          <Text style={styles.starGuidanceKey}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                          <Text style={styles.starGuidanceText}>{guidance}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.browseButton}
                    onPress={() => handleQuestionSelect(selectedQuestion)}
                  >
                    <Text style={styles.browseButtonText}>Start Practice</Text>
                  </TouchableOpacity>
                  
                  {autoSaveStatus === 'saving' && (
                    <Text style={styles.autoSaveText}>Auto-saving...</Text>
                  )}
                  {autoSaveStatus === 'saved' && (
                    <Text style={styles.autoSaveText}>Draft saved</Text>
                  )}
                </View>
              </View>
            ) : (
              <View style={styles.practiceContent}>
                {/* STAR Method Tutorial Card */}
                <TouchableOpacity 
                  style={styles.tutorialCard}
                  onPress={() => router.push('/star-tutorial')}
                  activeOpacity={0.7}
                >
                  <View style={styles.tutorialHeader}>
                    <View style={styles.tutorialIconContainer}>
                      <Star size={28} color={Colors.white} />
                    </View>
                    <View style={styles.tutorialContent}>
                      <Text style={styles.tutorialTitle}>STAR Method Tutorial</Text>
                      <Text style={styles.tutorialSubtitle}>Interactive learning experience</Text>
                    </View>
                    <ArrowRight size={24} color={Colors.primary} />
                  </View>
                  
                  <Text style={styles.tutorialDescription}>
                    Master the STAR method with an interactive tutorial. Tap statements to place them in the correct components and learn how to structure perfect behavioral interview answers.
                  </Text>
                  
                  <View style={styles.tutorialFeatures}>
                    <View style={styles.featureItem}>
                      <CheckCircle size={16} color={Colors.success} />
                      <Text style={styles.featureText}>Interactive tap-based practice</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <CheckCircle size={16} color={Colors.success} />
                      <Text style={styles.featureText}>Real example practice</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <CheckCircle size={16} color={Colors.success} />
                      <Text style={styles.featureText}>Step-by-step guidance</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                <View style={styles.competenciesSection}>
                  <View style={styles.sectionHeader}>
                    <Target size={20} color={Colors.primary} />
                    <Text style={styles.sectionTitle}>Essential Competencies</Text>
                  </View>
                  <Text style={styles.sectionDescription}>
                    Tap to expand and see sample questions, then practice with the STAR method.
                  </Text>
                  
                  {filteredCompetencies.map(renderCompetencyCard)}
                </View>
              </View>
            )}
          </View>
        )}



        {/* Enhanced iOS-style Modals */}
        <Modal
          visible={showStarModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.iOSModalContainer}>
            <View style={styles.iOSModalHeader}>
              <View style={styles.modalHandle} />
              <View style={styles.iOSModalTitleContainer}>
                <Star size={24} color={Colors.white} />
                <Text style={styles.iOSModalTitle}>
                  {selectedCompetencyForStar ? 
                    `${competencyStarExamples[selectedCompetencyForStar as keyof typeof competencyStarExamples]?.title} - STAR Example` : 
                    'STAR Method Guide'
                  }
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.iOSCloseButton}
                onPress={() => {
                  setShowStarModal(false);
                  setSelectedCompetencyForStar(null);
                }}
              >
                <X size={20} color={Colors.gray[500]} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.iOSModalContent} showsVerticalScrollIndicator={false}>
              {selectedCompetencyForStar ? (
                <View>
                  {/* Question */}
                  <View style={styles.iOSQuestionCard}>
                    <Text style={styles.iOSQuestionLabel}>Sample Question:</Text>
                    <Text style={styles.iOSQuestionText}>
                      {competencyStarExamples[selectedCompetencyForStar as keyof typeof competencyStarExamples]?.question}
                    </Text>
                  </View>

                  {/* STAR Example */}
                  {selectedCompetencyForStar && competencyStarExamples[selectedCompetencyForStar as keyof typeof competencyStarExamples] && (() => {
                    const example = competencyStarExamples[selectedCompetencyForStar as keyof typeof competencyStarExamples].example;
                    const starComponents = [
                      { key: 'situation', title: 'Situation', subtitle: 'Set the context', description: example.situation, color: Colors.primary, icon: '📍' },
                      { key: 'task', title: 'Task', subtitle: 'Explain your responsibility', description: example.task, color: Colors.accent, icon: '🎯' },
                      { key: 'action', title: 'Action', subtitle: 'Detail what you did', description: example.action, color: Colors.secondary, icon: '⚡' },
                      { key: 'result', title: 'Result', subtitle: 'Share the outcome', description: example.result, color: Colors.success, icon: '🏆' }
                    ];

                    return starComponents.map((component, index) => (
                      <View key={component.key} style={[styles.iOSStarCard, { marginTop: index === 0 ? 0 : 16 }]}>
                        <View style={styles.iOSStarHeader}>
                          <View style={[styles.iOSStarIcon, { backgroundColor: `${component.color}15` }]}>
                            <Text style={styles.iOSStarLetter}>{component.icon}</Text>
                          </View>
                          <View style={styles.iOSStarInfo}>
                            <Text style={styles.iOSStarTitle}>{component.title}</Text>
                            <Text style={[styles.iOSStarDescription, { color: component.color, fontWeight: '600' }]}>{component.subtitle}</Text>
                          </View>
                        </View>
                        <Text style={styles.iOSStarGuidance}>{component.description}</Text>
                      </View>
                    ));
                  })()}
                </View>
              ) : (
                // Fallback to generic STAR guidance if no competency selected
                Object.entries(STAR_METHOD_GUIDANCE).map(([key, guidance], index) => (
                  <View key={key} style={[styles.iOSStarCard, { marginTop: index === 0 ? 0 : 16 }]}>
                    <View style={styles.iOSStarHeader}>
                      <View style={[styles.iOSStarIcon, { backgroundColor: `${Colors.primary}15` }]}>
                        <Text style={styles.iOSStarLetter}>{key.charAt(0).toUpperCase()}</Text>
                      </View>
                      <View style={styles.iOSStarInfo}>
                        <Text style={styles.iOSStarTitle}>{guidance.title}</Text>
                        <Text style={styles.iOSStarDescription}>{guidance.description}</Text>
                      </View>
                    </View>
                    <Text style={styles.iOSStarGuidance}>{guidance.guidance}</Text>
                    <View style={styles.iOSStarExampleContainer}>
                      <Text style={styles.iOSStarExampleLabel}>Example:</Text>
                      <Text style={styles.iOSStarExample}>{guidance.example}</Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </Modal>

        <Modal
          visible={showTipsModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.iOSModalContainer}>
            <View style={styles.iOSModalHeader}>
              <View style={styles.modalHandle} />
              <View style={styles.iOSModalTitleContainer}>
                <BookOpen size={24} color={Colors.primary} />
                <Text style={styles.iOSModalTitle}>ECI Preparation Tips</Text>
              </View>
              <TouchableOpacity 
                style={styles.iOSCloseButton}
                onPress={() => setShowTipsModal(false)}
              >
                <X size={20} color={Colors.gray[500]} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.iOSModalContent} showsVerticalScrollIndicator={false}>
              {ECI_PREPARATION_TIPS.map((category, index) => (
                <View key={index} style={[styles.iOSTipCard, { marginTop: index === 0 ? 0 : 20 }]}>
                  <View style={styles.iOSTipHeader}>
                    <View style={[styles.iOSTipIcon, { backgroundColor: `${Colors.primary}15` }]}>
                      <BookOpen size={20} color={Colors.primary} />
                    </View>
                    <Text style={styles.iOSTipCategoryTitle}>{category.category}</Text>
                  </View>
                  <View style={styles.iOSTipList}>
                    {category.tips.map((tip, tipIndex) => (
                      <View key={tipIndex} style={styles.iOSTipItem}>
                        <View style={styles.iOSTipBullet} />
                        <Text style={styles.iOSTipText}>{tip}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </Modal>

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
                      {ECI_COMPETENCIES.find(c => c.key === selectedQuestion)?.examplePrompt}
                    </Text>
                  </View>

                  <View style={styles.compactStarSection}>
                    <Text style={styles.starGuidanceLabel}>Use the STAR Method:</Text>
                    <View style={styles.compactStarGrid}>
                      {Object.entries(ECI_COMPETENCIES.find(c => c.key === selectedQuestion)?.starGuidance || {}).map(([key, guidance]) => (
                        <View key={key} style={styles.compactStarItem}>
                          <View style={styles.compactStarIcon}>
                            <Text style={styles.compactStarLetter}>
                              {key.charAt(0).toUpperCase()}
                            </Text>
                          </View>
                          <Text style={styles.compactStarText}>{guidance}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.starGuidanceSection}>
                    <Text style={styles.promptLabel}>Your Answer:</Text>
                    <TextInput
                      style={styles.questionPrompt}
                      value={practiceAnswer}
                      onChangeText={setPracticeAnswer}
                      placeholder="Write your STAR method answer here..."
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
                      onPress={() => handleSaveDraft(selectedQuestion, practiceAnswer)}
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
                  <View style={[styles.iOSGradeIcon, { backgroundColor: `${getGradeColor(gradingResult.grade)}15` }]}>
                    {getGradeIcon(gradingResult.grade)}
                  </View>
                  <Text style={[styles.iOSGradeTitle, { color: getGradeColor(gradingResult.grade) }]}>
                    {gradingResult.grade}
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
                    <Text style={styles.iOSAnswerText} numberOfLines={isAnswerExpanded ? undefined : 4}>
                      {userAnswer}
                    </Text>
                    {userAnswer.length > 200 && (
                      <TouchableOpacity 
                        style={styles.iOSExpandButton}
                        onPress={() => setIsAnswerExpanded(!isAnswerExpanded)}
                      >
                        <Text style={styles.iOSExpandButtonText}>
                          {isAnswerExpanded ? 'Show Less' : 'Show More'}
                        </Text>
                        {isAnswerExpanded ? <ChevronUp size={16} color={Colors.primary} /> : <ChevronDown size={16} color={Colors.primary} />}
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                
                <View style={styles.iOSStarAnalysis}>
                  <Text style={styles.iOSAnalysisTitle}>STAR Analysis</Text>
                  {Object.entries(gradingResult.starAnalysis).map(([key, analysis]) => (
                    <View key={key} style={styles.iOSStarAnalysisItem}>
                      <View style={styles.iOSStarAnalysisHeader}>
                        <Text style={styles.iOSStarAnalysisKey}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                        <View style={[styles.iOSStarAnalysisBadge, { 
                          backgroundColor: analysis.quality === 'Good' ? `${Colors.success}15` : 
                                        analysis.quality === 'Fair' ? `${Colors.warning}15` : `${Colors.error}15`
                        }]}>
                          <Text style={[styles.iOSStarAnalysisQuality, { 
                            color: analysis.quality === 'Good' ? Colors.success : 
                                  analysis.quality === 'Fair' ? Colors.warning : Colors.error 
                          }]}>
                            {analysis.quality}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.iOSStarAnalysisFeedback}>{analysis.feedback}</Text>
                    </View>
                  ))}
                </View>
                
                <View style={styles.iOSFeedbackSection}>
                  <View style={styles.iOSFeedbackHeader}>
                    <CheckCircle size={20} color={Colors.success} />
                    <Text style={styles.iOSFeedbackTitle}>Strengths</Text>
                  </View>
                  {gradingResult.feedback.strengths.map((strength, index) => (
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
                  {gradingResult.feedback.areasForImprovement.map((area, index) => (
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
                  {gradingResult.feedback.specificTips.map((tip, index) => (
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerContent: {
    flex: 1,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    paddingTop: 12,
  },
  searchButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    marginLeft: 12,
  },
  progressOverview: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
  },
  progressItem: {
    flex: 1,
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: Colors.gray[500],
    textAlign: 'center',
  },
  searchSection: {
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.text,
  },
  filterContainer: {
    marginBottom: 10,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: Colors.gray[600],
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: Colors.white,
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
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  learnMoreText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginRight: 8,
  },
  practiceContent: {
    gap: 20,
  },
  competenciesSection: {
    marginBottom: 20,
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
  practiceButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  reviewButton: {
    backgroundColor: Colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
  },
  newAttemptButton: {
    backgroundColor: Colors.gray[600],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    shadowColor: Colors.gray[600],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
  },
  starButton: {
    backgroundColor: Colors.warning,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    shadowColor: Colors.warning,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
  },
  practiceButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  reviewButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  newAttemptButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  starButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  practiceSection: {
    flex: 1,
  },
  practiceHeader: {
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  questionHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  questionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  questionInfo: {
    flex: 1,
  },
  questionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  questionDescription: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  questionPromptSection: {
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
  },
  starGuidanceSection: {
    marginBottom: 20,
  },
  starGuidanceLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 14,
    letterSpacing: -0.1,
  },
  starGuidanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  starGuidanceItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  starGuidanceKey: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 6,
    letterSpacing: -0.1,
  },
  starGuidanceText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  practiceEmptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  practiceEmptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  practiceEmptyDescription: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 40,
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: '600',
    marginRight: 8,
    letterSpacing: -0.1,
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
  section: {
    marginBottom: 30,
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
  helpButton: {
    padding: 5,
  },
  autoSaveText: {
    fontSize: 12,
    color: Colors.gray[500],
    textAlign: 'center',
    marginTop: 8,
  },
  practiceCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tutorialCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: Colors.primary + '20',
  },
  tutorialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tutorialIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  tutorialContent: {
    flex: 1,
  },
  tutorialTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  tutorialSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  tutorialDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  tutorialFeatures: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 8,
    fontWeight: '500',
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
  iOSModalTitleDark: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primary,
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
  iOSStarCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iOSStarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iOSStarIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iOSStarLetter: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  iOSStarInfo: {
    flex: 1,
  },
  iOSStarTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  iOSStarDescription: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  iOSStarGuidance: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
    marginBottom: 18,
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  iOSStarExampleContainer: {
    backgroundColor: `${Colors.primary}08`,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  iOSStarExampleLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 10,
    letterSpacing: -0.1,
  },
  iOSStarExample: {
    fontSize: 15,
    color: '#6b7280',
    fontStyle: 'italic',
    lineHeight: 22,
    fontWeight: '400',
    letterSpacing: 0.1,
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
  iOSTipCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iOSTipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iOSTipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iOSTipCategoryTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1f2937',
    letterSpacing: -0.2,
  },
  iOSTipList: {
    gap: 12,
  },
  iOSTipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iOSTipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 6,
    marginRight: 12,
  },
  iOSTipText: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
    flex: 1,
    fontWeight: '400',
    letterSpacing: 0.1,
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
  iOSExpandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.primary + '10',
    borderRadius: 8,
    gap: 6,
  },
  iOSExpandButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.1,
  },
  iOSStarAnalysis: {
    marginBottom: 32,
  },
  iOSAnalysisTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 22,
    letterSpacing: -0.3,
  },
  iOSStarAnalysisItem: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iOSStarAnalysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iOSStarAnalysisKey: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2937',
    letterSpacing: -0.2,
  },
  iOSStarAnalysisBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  iOSStarAnalysisQuality: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  iOSStarAnalysisFeedback: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
    fontWeight: '400',
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
  characterCount: {
    fontSize: 12,
    color: Colors.gray[500],
    textAlign: 'right',
    marginTop: 8,
  },
  compactStarSection: {
    marginBottom: 20,
  },
  compactStarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  compactStarItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.gray[100],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  compactStarIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  compactStarLetter: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  compactStarText: {
    fontSize: 12,
    color: Colors.gray[700],
    lineHeight: 16,
    flex: 1,
    fontWeight: '400',
  },
  modalHeaderLogo: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -16 }, { translateY: -8 }],
    zIndex: 10,
  },
  shieldIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  shieldDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4444',
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
});
