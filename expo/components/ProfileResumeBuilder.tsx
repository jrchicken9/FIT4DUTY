import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Switch, Modal, Animated, Easing } from 'react-native';
import { Check, ChevronDown, ChevronUp, ChevronRight, Crown, BookOpen, Briefcase, Heart, Award, Car, Users, FileText, CheckCircle, Target, AlertTriangle, TrendingUp, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Standalone competitive badge component (declared before usage to avoid reference errors)
const CompetitiveBadge: React.FC = () => {
  const pulse = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 0, duration: 900, easing: Easing.in(Easing.quad), useNativeDriver: false })
      ])
    );
    loop.start();
    return () => { loop.stop(); };
  }, [pulse]);
  const bg = pulse.interpolate({ inputRange: [0,1], outputRange: ['#D1FAE5', '#A7F3D0'] });
  const bd = pulse.interpolate({ inputRange: [0,1], outputRange: ['#6EE7B7', '#34D399'] });
  return (
    <Animated.View style={{ backgroundColor: bg as any, borderColor: bd as any, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, flexDirection: 'row', alignItems: 'center' }}> 
      <LinearGradient colors={[ '#34D399', '#10B981' ]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginRight: 6 }}>
        <Check size={12} color={'#FFFFFF'} />
      </LinearGradient>
      <Text style={{ fontSize: 12, fontWeight: '700', color: '#065F46' }}>Competitive</Text>
    </Animated.View>
  );
};
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import ResumeEntryModal, { EntryType } from '@/components/ResumeEntryModal';
import UnifiedSectionModal from '@/components/UnifiedSectionModal';
import DrivingBackgroundModal from '@/components/DrivingBackgroundModal';
import { evaluateCompetitiveness, mapDetailToStage } from '@/lib/competitivenessScoring';
import { DEFAULT_COMPETITIVENESS_CONFIG as CFG_DEFAULT, CategoryKey, CompetitivenessLevel, mapScoreToCategoryLevel } from '@/constants/competitivenessConfig';
import { contentService } from '@/lib/contentService';
import ResumeGradingTooltip from '@/components/ResumeGradingTooltip';

type JsonArray = any[];

type SectionKey = 'education_details' | 'work_history' | 'volunteer_history' | 'certs_details' | 'skills_languages' | 'skills_details' | 'awards_details' | 'refs_list' | 'driving_record' | 'background_fitness';

type SectionSpec = {
  key: SectionKey;
  title: string;
  guidance: string;
  type: EntryType | 'skill' | 'award';
  hasNotApplicable?: boolean;
};

const SECTIONS: SectionSpec[] = [
  {
    key: 'education_details',
    title: 'Education',
    guidance: 'List your highest and most relevant credentials. Competitive: 2-4 years post-secondary.',
    type: 'education',
  },
  {
    key: 'work_history',
    title: 'Work Experience',
    guidance: 'Stable, customer-facing or public safety adjacent roles stand out. Aim for 2+ years FT.',
    type: 'work',
  },
  {
    key: 'volunteer_history',
    title: 'Volunteer',
    guidance: 'Consistent volunteering matters. Competitive: 150-300+ hours, ideally youth/seniors/vulnerable.',
    type: 'volunteer',
    hasNotApplicable: true,
  },
  {
    key: 'certs_details',
    title: 'Credentials, Languages & Skills',
    guidance: 'Track certifications (CPR/MHFA/etc.), languages with proficiency, practical skills, and awards – all in one place.',
    type: 'cert',
  },
  {
    key: 'driving_record',
    title: 'Driver\'s License & Record',
    guidance: 'G license required. Clean driving abstract for last 24 months. No major infractions.',
    type: 'work',
  },
  {
    key: 'background_fitness',
    title: 'Background & Physical Readiness',
    guidance: 'Clean background check, credit check, and current PREP test status. Must be able to pass PREP test.',
    type: 'work',
  },
  {
    key: 'refs_list',
    title: 'References',
    guidance: 'Identify 3 non-family references across different contexts.',
    type: 'reference',
  },
];

export default function ProfileResumeBuilder() {
  console.log('ProfileResumeBuilder: Component rendering');
  
  const { user } = useAuth();
  const { isAdmin } = useAuth();
  
  console.log('ProfileResumeBuilder: User:', user?.id);
  console.log('ProfileResumeBuilder: Is Admin:', isAdmin);
  
  const [details, setDetails] = useState<Record<SectionKey, JsonArray>>({
    education_details: [],
    work_history: [],
    volunteer_history: [],
    certs_details: [],
    skills_languages: [],
    skills_details: [],
    awards_details: [],
    refs_list: [],
    driving_record: [],
    background_fitness: [],
  } as any);
  const [loading, setLoading] = useState<boolean>(false);
  const [notApplicable, setNotApplicable] = useState<Record<SectionKey, boolean>>({} as any);
  const [categoryLevels, setCategoryLevels] = useState<Partial<Record<CategoryKey, CompetitivenessLevel>>>({});
  const [showTooltip, setShowTooltip] = useState(false);
  const [chooseTypeVisible, setChooseTypeVisible] = useState(false);
  const [hasSkillsColumn, setHasSkillsColumn] = useState<boolean>(true);
  const [hasAwardsColumn, setHasAwardsColumn] = useState<boolean>(true);
  const [overallStage, setOverallStage] = useState<CompetitivenessLevel | undefined>(undefined);
  const [overallTotal, setOverallTotal] = useState<number>(0);
  const [isTopApplicant, setIsTopApplicant] = useState<boolean>(false);
  const [drivingModalVisible, setDrivingModalVisible] = useState<boolean>(false);
  const [currentSection, setCurrentSection] = useState<'driving_record' | 'background_fitness'>('driving_record');
  const [selectedSection, setSelectedSection] = useState<SectionSpec | null>(null);
  const [unifiedModalVisible, setUnifiedModalVisible] = useState(false);
  
  // Computed values for the new layout
  const arrays = details;
  const levels = categoryLevels;
  const overallScore = Math.round((Object.values(levels).filter(level => level === 'COMPETITIVE').length / Object.keys(levels).length) * 100) || 0;
  
  // Helper functions for the new layout
  const handleSectionPress = (section: SectionSpec) => {
    console.log('ProfileResumeBuilder: handleSectionPress called for section:', section.key);
    if (section.key === 'driving_record' || section.key === 'background_fitness') {
      console.log('ProfileResumeBuilder: Opening driving/background modal for section:', section.key);
      setCurrentSection(section.key as 'driving_record' | 'background_fitness');
      setDrivingModalVisible(true);
    } else {
      console.log('ProfileResumeBuilder: Opening unified modal for section:', section.key);
      setSelectedSection(section);
      setUnifiedModalVisible(true);
    }
  };

  const handleSaveEntry = async (entry: any) => {
    console.log('ProfileResumeBuilder: handleSaveEntry called with entry:', entry);
    console.log('ProfileResumeBuilder: Current user:', user?.id);
    console.log('ProfileResumeBuilder: Selected section:', selectedSection?.key);
    
    if (!user || !selectedSection) {
      console.log('ProfileResumeBuilder: Missing user or selectedSection, returning');
      return;
    }
    
    try {
      const sectionKey = selectedSection.key;
      const currentArray = arrays[sectionKey] || [];
      console.log('ProfileResumeBuilder: Current array for section', sectionKey, ':', currentArray);
      
      let updatedArray;
      
      if (entry.id !== undefined) {
        // Editing existing entry - remove the id from the data to be stored
        const { id, ...entryData } = entry;
        console.log('ProfileResumeBuilder: Editing entry with id:', id, 'data:', entryData);
        updatedArray = currentArray.map((item: any, index: number) => 
          index === id ? { ...item, ...entryData } : item
        );
      } else {
        // Adding new entry
        console.log('ProfileResumeBuilder: Adding new entry:', entry);
        updatedArray = [...currentArray, entry];
      }
      
      console.log('ProfileResumeBuilder: Updated array:', updatedArray);
      
      // Update local state
      console.log('ProfileResumeBuilder: Updating local state for section:', sectionKey);
      setDetails(prev => {
        const newState = {
          ...prev,
          [sectionKey]: updatedArray
        };
        console.log('ProfileResumeBuilder: New details state:', newState);
        return newState;
      });
      
      // Save to database
      console.log('ProfileResumeBuilder: Saving to database for user:', user.id, 'section:', sectionKey);
      const { error } = await supabase
        .from('application_profile')
        .upsert({
          user_id: user.id,
          [sectionKey]: updatedArray,
        });
      
      if (error) {
        console.error('ProfileResumeBuilder: Database error saving entry:', error);
        Alert.alert('Error', 'Failed to save entry');
        return;
      }
      
      console.log('ProfileResumeBuilder: Database save successful');
      
      // Recompute levels after saving with updated details
      const newDetails = {
        ...details,
        [sectionKey]: updatedArray
      };
      console.log('ProfileResumeBuilder: Calling recomputeLevels with new details:', newDetails);
      setDetails(newDetails);
      recomputeLevels(newDetails, extras);
    } catch (error) {
      console.error('Error saving entry:', error);
      Alert.alert('Error', 'Failed to save entry');
    }
  };

  const handleDeleteEntry = async (index: number) => {
    console.log('ProfileResumeBuilder: handleDeleteEntry called with index:', index);
    console.log('ProfileResumeBuilder: Current user:', user?.id);
    console.log('ProfileResumeBuilder: Selected section:', selectedSection?.key);
    
    if (!user || !selectedSection) {
      console.log('ProfileResumeBuilder: Missing user or selectedSection, returning');
      return;
    }
    
    // Show confirmation dialog
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const sectionKey = selectedSection.key;
              const currentArray = arrays[sectionKey] || [];
              console.log('ProfileResumeBuilder: Deleting entry from section:', sectionKey, 'at index:', index);
              console.log('ProfileResumeBuilder: Current array:', currentArray);
              
              const updatedArray = currentArray.filter((_: any, i: number) => i !== index);
              console.log('ProfileResumeBuilder: Updated array after deletion:', updatedArray);
              
              // Update local state
              console.log('ProfileResumeBuilder: Updating local state after deletion');
              setDetails(prev => {
                const newState = {
                  ...prev,
                  [sectionKey]: updatedArray
                };
                console.log('ProfileResumeBuilder: New details state after deletion:', newState);
                return newState;
              });
              
              // Save to database
              console.log('ProfileResumeBuilder: Saving deletion to database');
              const { error } = await supabase
                .from('application_profile')
                .upsert({
                  user_id: user.id,
                  [sectionKey]: updatedArray,
                });
              
              if (error) {
                console.error('ProfileResumeBuilder: Database error deleting entry:', error);
                Alert.alert('Error', 'Failed to delete entry');
                return;
              }
              
              console.log('ProfileResumeBuilder: Database deletion successful');
              
              // Recompute levels after deleting with updated details
              const newDetails = {
                ...details,
                [sectionKey]: updatedArray
              };
              console.log('ProfileResumeBuilder: Calling recomputeLevels after deletion');
              setDetails(newDetails);
              recomputeLevels(newDetails, extras);
              
              Alert.alert('Success', 'Entry deleted successfully');
            } catch (error) {
              console.error('Error deleting entry:', error);
              Alert.alert('Error', 'Failed to delete entry');
            }
          },
        },
      ]
    );
  };

  const handleSaveDrivingData = async (data: any) => {
    console.log('ProfileResumeBuilder: handleSaveDrivingData called with:', data);
    setDrivingModalVisible(false);
    await saveExtrasField(data);
  };

  const getSectionIcon = (sectionKey: string) => {
    switch (sectionKey) {
      case 'education_details':
        return <BookOpen size={20} color={Colors.primary} />;
      case 'work_history':
        return <Briefcase size={20} color={Colors.primary} />;
      case 'volunteer_history':
        return <Heart size={20} color={Colors.primary} />;
      case 'certs_details':
        return <Award size={20} color={Colors.primary} />;
      case 'driving_record':
        return <Car size={20} color={Colors.primary} />;
      case 'background_fitness':
        return <Heart size={20} color={Colors.primary} />;
      case 'refs_list':
        return <Users size={20} color={Colors.primary} />;
      default:
        return <FileText size={20} color={Colors.primary} />;
    }
  };

  const getImprovementTips = (sectionKey: SectionKey) => {
    const sectionData = arrays[sectionKey] || [];
    const level = levels[sectionToCategory[sectionKey as SectionKey] as CategoryKey] || 'NEEDS_WORK';
    const tips: string[] = [];

    switch (sectionKey) {
      case 'education_details':
        if (level === 'NEEDS_WORK') {
          if (sectionData.length === 0) {
            tips.push("Add your highest level of education completed");
            tips.push("Include any post-secondary programs or certifications");
          } else {
            const hasPostSecondary = sectionData.some((edu: any) => 
              edu.program_type === 'diploma' || edu.program_type === 'degree' || edu.program_type === 'certificate'
            );
            if (!hasPostSecondary) {
              tips.push("Consider pursuing a relevant post-secondary program (Police Foundations, Criminology, etc.)");
            }
            const hasRelevantField = sectionData.some((edu: any) => 
              edu.field_of_study?.toLowerCase().includes('police') || 
              edu.field_of_study?.toLowerCase().includes('criminology') ||
              edu.field_of_study?.toLowerCase().includes('justice')
            );
            if (!hasRelevantField) {
              tips.push("Focus on education in relevant fields like Criminal Justice, Law Enforcement, or Public Safety");
            }
          }
        } else if (level === 'DEVELOPING') {
          tips.push("Add more specialized training or certifications");
          tips.push("Consider pursuing advanced education in law enforcement");
        } else if (level === 'EFFECTIVE') {
          tips.push("Add any recent professional development courses");
          tips.push("Consider specialized certifications to reach competitive level");
        }
        break;

      case 'work_history':
        if (level === 'NEEDS_WORK') {
          if (sectionData.length === 0) {
            tips.push("Add your current and previous employment history");
            tips.push("Include detailed job titles, responsibilities, and duration");
          } else {
            const hasLawEnforcement = sectionData.some((work: any) => 
              /police|officer|law enforcement|constable|sheriff/i.test(work.title || work.role || '')
            );
            const hasMilitary = sectionData.some((work: any) => 
              /military|army|navy|air force|marine|veteran/i.test(work.title || work.role || '')
            );
            const hasSecurity = sectionData.some((work: any) => 
              /security|guard|protection|patrol/i.test(work.title || work.role || '')
            );
            const hasEmergencyServices = sectionData.some((work: any) => 
              /emergency|paramedic|firefighter|ems|first responder/i.test(work.title || work.role || '')
            );
            
            if (!hasLawEnforcement && !hasMilitary && !hasSecurity && !hasEmergencyServices) {
              tips.push("Seek experience in law enforcement, military, security, or emergency services");
              tips.push("Consider roles in corrections, social services, or healthcare");
            }
            
            const hasLeadership = sectionData.some((work: any) => 
              /manager|supervisor|lead|coordinator|director|chief|captain|sergeant/i.test(work.title || work.role || '')
            );
            if (!hasLeadership) {
              tips.push("Look for opportunities to take on leadership or supervisory roles");
            }
            
            const hasPublicInteraction = sectionData.some((work: any) => 
              /customer service|public|community|interact|serve|assist/i.test(work.title || work.role || '')
            );
            if (!hasPublicInteraction) {
              tips.push("Seek roles with high public interaction and customer service");
            }
          }
        } else if (level === 'DEVELOPING') {
          tips.push("Add more detail about your responsibilities and achievements");
          tips.push("Seek roles with greater responsibility and public interaction");
          tips.push("Consider security, corrections, or emergency services positions");
          tips.push("Look for opportunities to demonstrate leadership skills");
        } else if (level === 'EFFECTIVE') {
          tips.push("Focus on quantifiable achievements and results");
          tips.push("Consider specialized training or certifications");
          tips.push("Seek supervisory or management positions");
          tips.push("Highlight emergency response or crisis management experience");
        } else if (level === 'COMPETITIVE') {
          tips.push("Maintain current certifications and training");
          tips.push("Consider advanced leadership or specialized roles");
          tips.push("Document specific achievements and community impact");
        }
        break;

      case 'volunteer_history':
        if (level === 'NEEDS_WORK') {
          if (sectionData.length === 0) {
            tips.push("Start volunteering in your community");
            tips.push("Look for opportunities with youth, seniors, or community events");
          } else {
            const hasConsistentService = sectionData.some((vol: any) => 
              vol.duration_months && vol.duration_months >= 6
            );
            if (!hasConsistentService) {
              tips.push("Commit to longer-term volunteer positions (6+ months)");
            }
            const hasLeadership = sectionData.some((vol: any) => 
              vol.role?.toLowerCase().includes('coordinator') || 
              vol.role?.toLowerCase().includes('organizer')
            );
            if (!hasLeadership) {
              tips.push("Seek leadership roles in volunteer organizations");
            }
          }
        } else if (level === 'DEVELOPING') {
          tips.push("Increase your volunteer hours to 8+ hours per month");
          tips.push("Take on more responsibility in your volunteer roles");
        } else if (level === 'EFFECTIVE') {
          tips.push("Focus on community leadership and specialized volunteer work");
          tips.push("Consider mentoring or coaching opportunities");
        }
        break;

      case 'certs_details':
        if (level === 'NEEDS_WORK') {
          if (sectionData.length === 0) {
            tips.push("Obtain First Aid and CPR certifications");
            tips.push("Consider Mental Health First Aid training");
          } else {
            const hasFirstAid = sectionData.some((cert: any) => 
              cert.name?.toLowerCase().includes('first aid') || 
              cert.name?.toLowerCase().includes('cpr')
            );
            if (!hasFirstAid) {
              tips.push("Obtain current First Aid and CPR certifications");
            }
            const hasMentalHealth = sectionData.some((cert: any) => 
              cert.name?.toLowerCase().includes('mental health')
            );
            if (!hasMentalHealth) {
              tips.push("Consider Mental Health First Aid certification");
            }
          }
        } else if (level === 'DEVELOPING') {
          tips.push("Add conflict resolution and de-escalation training");
          tips.push("Consider specialized security or law enforcement certifications");
        } else if (level === 'EFFECTIVE') {
          tips.push("Keep certifications current and add specialized training");
          tips.push("Consider advanced certifications in your field");
        }
        break;

      case 'skills_languages':
      case 'skills_details':
        if (level === 'NEEDS_WORK') {
          if (sectionData.length === 0) {
            tips.push("Add your language skills and technical abilities");
            tips.push("Include computer proficiency and communication skills");
          } else {
            const hasLanguages = sectionData.some((skill: any) => 
              skill.type === 'language' || skill.category === 'language'
            );
            if (!hasLanguages) {
              tips.push("Add any additional languages you speak");
            }
            const hasTechnical = sectionData.some((skill: any) => 
              skill.type === 'technical' || skill.category === 'technical'
            );
            if (!hasTechnical) {
              tips.push("Include computer and technical skills");
            }
          }
        } else if (level === 'DEVELOPING') {
          tips.push("Add more specialized skills relevant to policing");
          tips.push("Focus on leadership and communication abilities");
        } else if (level === 'EFFECTIVE') {
          tips.push("Highlight advanced technical or specialized skills");
          tips.push("Consider additional language training");
        }
        break;

      case 'driving_record':
        // Check driving data from extras
        const licenseClass = extras?.driver_licence_class;
        const cleanAbstract = extras?.driver_clean_abstract;
        const prepVerified = extras?.fitness_prep_observed_verified;
        const prepAttempted = extras?.fitness_prep_digital_attempted;
        const conductClean = extras?.conduct_no_major_issues;

        if (level === 'NEEDS_WORK') {
          if (!licenseClass || licenseClass === 'G1' || licenseClass === 'G2') {
            tips.push("Upgrade to a full G license - required for most police positions");
          }
          if (!cleanAbstract) {
            tips.push("Maintain a clean driving record for at least 24 months");
          }
          if (!prepVerified && !prepAttempted) {
            tips.push("Complete the PREP test to demonstrate physical readiness");
          }
          if (!conductClean) {
            tips.push("Ensure your conduct record is clean and up-to-date");
          }
        } else if (level === 'DEVELOPING') {
          if (licenseClass === 'G2') {
            tips.push("Upgrade to full G license for better competitiveness");
          }
          if (!prepVerified) {
            tips.push("Complete verified PREP test to reach competitive level");
          }
        } else if (level === 'EFFECTIVE') {
          tips.push("Maintain clean driving record and current PREP certification");
          tips.push("Consider specialized driving training");
        }
        break;

              case 'background_fitness':
          // Check background and fitness data from extras
          const backgroundCheckComplete = extras?.background_check_complete;
          const creditCheckComplete = extras?.credit_check_complete;
          const socialMediaClean = extras?.social_media_clean;
          const educationVerified = extras?.education_verified;
          const employmentVerified = extras?.employment_verified;
          const hasVerifiedPrep = extras?.fitness_prep_observed_verified;
          const hasAttemptedPrep = extras?.fitness_prep_digital_attempted;
          const circuitTime = extras?.fitness_circuit_time;
          const shuttleRun = extras?.fitness_shuttle_run;

          if (level === 'NEEDS_WORK') {
            if (!hasVerifiedPrep && !hasAttemptedPrep) {
              tips.push("Complete the PREP fitness test - this is required for police recruitment");
            } else if (hasAttemptedPrep && circuitTime && shuttleRun) {
              const timeParts = circuitTime.split(':');
              if (timeParts.length === 2) {
                const minutes = parseInt(timeParts[0]) || 0;
                const seconds = parseInt(timeParts[1]) || 0;
                const totalSeconds = minutes * 60 + seconds;
                if (totalSeconds > 157) {
                  tips.push(`Improve your PREP circuit time - current time ${circuitTime} is too slow (must be 2:37 or under)`);
                }
              }
              
              const shuttleLevel = parseFloat(shuttleRun) || 0;
              if (shuttleLevel < 7.0) {
                tips.push(`Improve your shuttle run level - current level ${shuttleRun} is too low (must be 7.0 or higher)`);
              }
            }
            if (!backgroundCheckComplete) {
              tips.push("Complete your background check");
            }
            if (!creditCheckComplete) {
              tips.push("Complete your credit check");
            }
            if (!socialMediaClean) {
              tips.push("Ensure your social media presence is clean and professional");
            }
          } else if (level === 'DEVELOPING') {
            tips.push("Complete all background verification checks");
            tips.push("Ensure PREP test is verified by an observer");
          } else if (level === 'EFFECTIVE') {
            tips.push("Maintain clean background and fitness standards");
            tips.push("Keep PREP test current and verified");
          }
          break;

      case 'refs_list':
        if (level === 'NEEDS_WORK') {
          if (sectionData.length === 0) {
            tips.push("Add 2-3 professional references");
            tips.push("Include supervisors, managers, or community leaders");
          } else if (sectionData.length < 2) {
            tips.push("Add more references to reach the recommended 2-3");
          }
        } else if (level === 'DEVELOPING') {
          tips.push("Ensure all references are current and professional");
          tips.push("Add references from diverse professional backgrounds");
        } else if (level === 'EFFECTIVE') {
          tips.push("Consider adding references from law enforcement or public safety");
          tips.push("Keep reference contact information current");
        }
        break;

      case 'awards_details':
        if (level === 'NEEDS_WORK') {
          if (sectionData.length === 0) {
            tips.push("Add any academic, professional, or community awards");
            tips.push("Include recognition for leadership or service");
          }
        } else if (level === 'DEVELOPING') {
          tips.push("Add more specific achievements and recognitions");
          tips.push("Include quantifiable accomplishments");
        } else if (level === 'EFFECTIVE') {
          tips.push("Focus on awards that demonstrate leadership and service");
          tips.push("Keep adding new achievements as they occur");
        }
        break;
    }

    // Add general tips if no specific tips were generated
    if (tips.length === 0) {
      tips.push("Review and update your information regularly");
      tips.push("Ensure all information is accurate and verifiable");
    }

    return tips;
  };

  const getRandomTip = () => {
    const competitiveCount = Object.values(levels).filter(level => level === 'COMPETITIVE').length;
    const needsWorkCount = Object.values(levels).filter(level => level === 'NEEDS_WORK').length;
    const totalSections = Object.keys(levels).length;
    
    // Get sections that need work
    const needsWorkSections = Object.entries(levels)
      .filter(([_, level]) => level === 'NEEDS_WORK')
      .map(([section, _]) => section);
    
    // Get sections that are effective but not competitive
    const effectiveSections = Object.entries(levels)
      .filter(([_, level]) => level === 'EFFECTIVE')
      .map(([section, _]) => section);

    const tips = [
      // General tips based on overall status
      ...(competitiveCount === 0 ? [
        "Start by completing your basic profile sections to build a foundation",
        "Focus on adding your education and work experience first",
        "Begin with the sections that require the least information"
      ] : []),
      
      ...(competitiveCount >= totalSections * 0.7 ? [
        "Excellent progress! Consider adding specialized certifications to stand out",
        "You're almost there! Review your achievements section for any missed opportunities",
        "Strong application! Focus on volunteer work to demonstrate community commitment"
      ] : []),
      
      ...(needsWorkCount > competitiveCount ? [
        "Prioritize improving your weakest sections first",
        "Focus on quality over quantity - ensure each section is well-developed",
        "Consider seeking feedback on your current entries"
      ] : []),
      
      // Specific section tips
      ...(needsWorkSections.includes('education') ? [
        "Add any relevant certifications or training to your education section",
        "Include academic achievements and relevant coursework in your education"
      ] : []),
      
      ...(needsWorkSections.includes('work') ? [
        "Highlight leadership roles and responsibilities in your work experience",
        "Emphasize transferable skills from your work experience"
      ] : []),
      
      ...(needsWorkSections.includes('softskills') ? [
        "Add technical skills and soft skills that are relevant to policing",
        "Include language skills and computer proficiency in your skills section"
      ] : []),
      
      ...(needsWorkSections.includes('certs') ? [
        "Add relevant certifications like First Aid, CPR, or security licenses",
        "Include any specialized training or professional development courses"
      ] : []),
      
      ...(needsWorkSections.includes('volunteer') ? [
        "Add community service and volunteer work to demonstrate commitment",
        "Include any leadership roles in community organizations"
      ] : []),
      
      ...(needsWorkSections.includes('driving') ? [
        "Ensure your driving record is clean and up-to-date",
        "Add any specialized driving certifications or training"
      ] : []),
      
      // Tips for effective sections that could be improved
      ...(effectiveSections.includes('education') ? [
        "Consider adding post-secondary education or specialized training"
      ] : []),
      
      ...(effectiveSections.includes('work') ? [
        "Add more detail about your responsibilities and achievements"
      ] : []),
      
      // Default tips
      "Review and update your information regularly to keep it current",
      "Ensure all information is accurate and verifiable",
      "Focus on achievements and experiences that demonstrate leadership",
      "Add specific examples and quantifiable results where possible",
      "Consider how each section contributes to your overall profile"
    ];

    // Return a random tip from the filtered list
    const randomIndex = Math.floor(Math.random() * tips.length);
    return tips[randomIndex] || "Keep building your profile to improve your competitiveness";
  };
  
  const [collapsed, setCollapsed] = useState<Record<SectionKey, boolean>>({
    education_details: true,
    work_history: true,
    volunteer_history: true,
    certs_details: true,
    skills_languages: true,
    skills_details: true,
    awards_details: true,
    refs_list: true,
    driving_record: true,
    background_fitness: true,
  } as any);

  const [extras, setExtras] = useState<{
    // Driving & Record
    driver_licence_class?: string | null;
    driver_clean_abstract?: boolean | null;
    driver_abstract_date?: string | null;
    driver_infractions?: string | null;
    driver_infraction_date?: string | null; // Date of most recent infraction
    
    // Physical Readiness
    fitness_prep_observed_verified?: boolean | null;
    fitness_prep_digital_attempted?: boolean | null;
    fitness_prep_date?: string | null;
    fitness_shuttle_run?: string | null;
    fitness_circuit_time?: string | null; // Changed from fitness_plank_time
    fitness_push_ups?: string | null;
    fitness_sit_ups?: string | null;
    
    // Background & Integrity
    conduct_no_major_issues?: boolean | null;
    background_check_complete?: boolean | null;
    credit_check_complete?: boolean | null;
    social_media_clean?: boolean | null;
    education_verified?: boolean | null;
    employment_verified?: boolean | null;
  }>({});

  // Dynamic competitiveness config with default fallback
  const [cfg, setCfg] = useState<any>(CFG_DEFAULT);
  const [configReady, setConfigReady] = useState(false);

  const sectionToCategory: Partial<Record<SectionKey, CategoryKey>> = {
    education_details: 'education',
    work_history: 'work',
    volunteer_history: 'volunteer',
    certs_details: 'certs',
    skills_details: 'softskills',
    skills_languages: 'softskills',
    refs_list: 'references',
    // Note: driving_record and background_fitness sections use extras data, not array data
    driving_record: 'driving',
    background_fitness: 'background',
  };
  
  console.log('ProfileResumeBuilder: sectionToCategory mapping:', sectionToCategory);

  const toScoringConfig = () => {
    // Always fall back to default config if the loaded config is invalid
    const effectiveCfg = cfg && typeof cfg === 'object' && Object.keys(cfg).length > 0 ? cfg : CFG_DEFAULT;
    
    // Validate that the config has the required structure
    if (!effectiveCfg.categories || !effectiveCfg.thresholds) {
      console.warn('Invalid config structure, using default');
      return {
        weights: Object.fromEntries(Object.entries(CFG_DEFAULT.categories).map(([k, v]) => [k, v.weight])),
        rules: Object.fromEntries(Object.entries(CFG_DEFAULT.categories).map(([k, v]) => [k, v.rules])),
        levelThresholds: CFG_DEFAULT.thresholds.map((t: any) => ({ level: t.level, min: t.min })),
        disqualifiers: CFG_DEFAULT.disqualifiers || []
      };
    }
    
    const weights: Record<CategoryKey, number> = {} as any;
    const rules: Record<CategoryKey, any[]> = {} as any;
    
    if (Array.isArray(effectiveCfg?.categories)) {
      (effectiveCfg.categories as any[]).forEach((cat: any) => {
        const key = cat.key as CategoryKey;
        if (!key) return;
        weights[key] = Number(cat.maxPoints ?? cat.weight ?? 0);
        rules[key] = Array.isArray(cat.rules) ? cat.rules : [];
      });
    } else {
      const order: CategoryKey[] = (effectiveCfg?.display?.categoryOrder as CategoryKey[]) || (Object.keys(effectiveCfg?.categories || {}) as CategoryKey[]);
      order.forEach((k) => {
        const cat = (effectiveCfg.categories as any)?.[k];
        if (!cat) return;
        weights[k] = Number(cat.weight ?? cat.maxPoints ?? 0);
        rules[k] = Array.isArray(cat.rules) ? cat.rules : [];
      });
    }
    
    const levelThresholds = effectiveCfg.thresholds?.map((t: any) => ({ level: t.level, min: t.min })) || CFG_DEFAULT.thresholds.map((t: any) => ({ level: t.level, min: t.min }));
    const disqualifiers = effectiveCfg.disqualifiers?.map((d: any) => ({ id: d.id, level: (d.effect as any)?.level, action: (d.effect as any)?.action })) || [];
    
    return { weights, rules, levelThresholds, disqualifiers } as any;
  };

  const recomputeLevels = (arrays: Record<SectionKey, JsonArray>, currentExtras?: typeof extras) => {
    try {
      if (!configReady) {
        console.log('ProfileResumeBuilder: Config not ready, skipping recompute');
        return;
      }
      
      // Store previous levels for comparison
      const previousLevels = { ...categoryLevels };
      
      console.log('ProfileResumeBuilder: Computing levels with data:', {
        education: arrays.education_details?.length || 0,
        work: arrays.work_history?.length || 0,
        volunteer: arrays.volunteer_history?.length || 0,
        certs: arrays.certs_details?.length || 0,
        skills: arrays.skills_details?.length || 0,
        languages: arrays.skills_languages?.length || 0,
        refs: arrays.refs_list?.length || 0
      });
      
      // SIMPLIFIED GRADING SYSTEM - Direct evaluation based on actual data
      const levels: Partial<Record<CategoryKey, CompetitivenessLevel>> = {};
      
      // Education Grading
      const educationEntries = arrays.education_details || [];
      if (educationEntries.length > 0) {
        // Check for different education levels
        const hasHighSchool = educationEntries.some((e: any) => 
          /high school|secondary|grade 12|grade 12/i.test(e?.credential_level || '') ||
          /high school|secondary|grade 12|grade 12/i.test(e?.program || '')
        );
        const hasCollegeDiploma = educationEntries.some((e: any) => 
          /diploma|college/i.test(e?.credential_level || '') &&
          !/university|bachelor|master|phd/i.test(e?.credential_level || '')
        );
        const hasBachelor = educationEntries.some((e: any) => 
          /bachelor|university/i.test(e?.credential_level || '') &&
          !/master|phd/i.test(e?.credential_level || '')
        );
        const hasMasters = educationEntries.some((e: any) => 
          /master/i.test(e?.credential_level || '')
        );
        const hasPhD = educationEntries.some((e: any) => 
          /phd|doctorate/i.test(e?.credential_level || '')
        );
        
        // Count total education entries
        const totalEntries = educationEntries.length;
        
        // New grading logic based on requirements
        if (hasPhD || hasMasters || (hasBachelor && totalEntries >= 2)) {
          // PhD, Masters, or Bachelor + additional education = COMPETITIVE
          levels.education = 'COMPETITIVE';
        } else if (hasBachelor || (hasHighSchool && hasCollegeDiploma)) {
          // Bachelor degree OR High School + College Diploma = EFFECTIVE
          levels.education = 'EFFECTIVE';
        } else if (hasHighSchool || hasCollegeDiploma) {
          // High School Diploma OR College Diploma alone = DEVELOPING
          levels.education = 'DEVELOPING';
        } else {
          // Any other education entries = NEEDS_WORK
          levels.education = 'NEEDS_WORK';
        }
      } else {
        levels.education = 'NEEDS_WORK';
      }
      
      // Enhanced Work Experience Grading for Police Recruitment
      const workEntries = arrays.work_history || [];
      if (workEntries.length > 0) {
        let totalScore = 0;
        let hasLawEnforcement = false;
        let hasMilitary = false;
        let hasSecurity = false;
        let hasEmergencyServices = false;
        let hasLeadership = false;
        let hasPublicInteraction = false;
        let hasEmergencyExposure = false;
        let totalMonths = 0;
        let longestRole = 0;
        
        // Analyze each work entry
        workEntries.forEach((entry: any) => {
          const title = (entry.title || entry.role || '').toLowerCase();
          const description = (entry.description || '').toLowerCase();
          const months = parseInt(entry.months) || 0;
          const hoursPerWeek = parseInt(entry.hours_per_week) || 0;
          
          totalMonths += months;
          longestRole = Math.max(longestRole, months);
          
          let entryScore = 0;
          
          // Role Type Scoring (0-25 points) - Most important factor
          if (/police|officer|law enforcement|constable|sheriff/i.test(title) || 
              /police|officer|law enforcement|constable|sheriff/i.test(description)) {
            entryScore += 25;
            hasLawEnforcement = true;
          } else if (/military|army|navy|air force|marine|veteran/i.test(title) || 
                     /military|army|navy|air force|marine|veteran/i.test(description)) {
            entryScore += 23;
            hasMilitary = true;
          } else if (/security|guard|protection|patrol/i.test(title) || 
                     /security|guard|protection|patrol/i.test(description)) {
            entryScore += 20;
            hasSecurity = true;
          } else if (/emergency|paramedic|firefighter|ems|first responder/i.test(title) || 
                     /emergency|paramedic|firefighter|ems|first responder/i.test(description)) {
            entryScore += 18;
            hasEmergencyServices = true;
          } else if (/corrections|jail|prison|detention|probation/i.test(title) || 
                     /corrections|jail|prison|detention|probation/i.test(description)) {
            entryScore += 17;
          } else if (/social worker|case worker|counselor|therapist|mental health/i.test(title) || 
                     /social worker|case worker|counselor|therapist|mental health/i.test(description)) {
            entryScore += 15;
          } else if (/nurse|doctor|healthcare|medical|paramedic/i.test(title) || 
                     /nurse|doctor|healthcare|medical|paramedic/i.test(description)) {
            entryScore += 14;
          } else if (/teacher|instructor|professor|educator/i.test(title) || 
                     /teacher|instructor|professor|educator/i.test(description)) {
            entryScore += 12;
          } else if (/customer service|retail|sales|front desk|reception/i.test(title) || 
                     /customer service|retail|sales|front desk|reception/i.test(description)) {
            entryScore += 10;
          } else if (/manager|supervisor|lead|coordinator|director/i.test(title) || 
                     /manager|supervisor|lead|coordinator|director/i.test(description)) {
            entryScore += 8;
          } else {
            entryScore += 5; // Basic work experience
          }
          
          // Duration Scoring (0-20 points)
          if (months >= 60) { // 5+ years
            entryScore += 20;
          } else if (months >= 36) { // 3+ years
            entryScore += 16;
          } else if (months >= 24) { // 2+ years
            entryScore += 12;
          } else if (months >= 12) { // 1+ year
            entryScore += 8;
          } else if (months >= 6) { // 6+ months
            entryScore += 4;
          } else {
            entryScore += 2;
          }
          
          // Leadership Scoring (0-15 points)
          if (/manager|supervisor|lead|coordinator|director|chief|captain|sergeant/i.test(title) || 
              /manage|supervise|lead|coordinate|direct|oversee/i.test(description)) {
            entryScore += 15;
            hasLeadership = true;
          }
          
          // Public Interaction Scoring (0-15 points)
          if (/customer service|public|community|interact|serve|assist/i.test(title) || 
              /customer service|public|community|interact|serve|assist/i.test(description) ||
              hoursPerWeek >= 30) { // Full-time work suggests public interaction
            entryScore += 15;
            hasPublicInteraction = true;
          } else if (/office|admin|clerical/i.test(title) || 
                     /office|admin|clerical/i.test(description)) {
            entryScore += 8;
          } else {
            entryScore += 5;
          }
          
          // Emergency Exposure Scoring (0-10 points)
          if (/emergency|crisis|urgent|critical|incident|accident/i.test(title) || 
              /emergency|crisis|urgent|critical|incident|accident/i.test(description) ||
              hasEmergencyServices) {
            entryScore += 10;
            hasEmergencyExposure = true;
          }
          
          // Security Exposure Scoring (0-10 points)
          if (/security|safety|protection|monitor|surveillance/i.test(title) || 
              /security|safety|protection|monitor|surveillance/i.test(description) ||
              hasSecurity) {
            entryScore += 10;
          }
          
          // Customer Service Scoring (0-5 points)
          if (/customer service|client|patient|student|resident/i.test(title) || 
              /customer service|client|patient|student|resident/i.test(description)) {
            entryScore += 5;
          }
          
          // Cap entry score at 100 and add to total
          totalScore += Math.min(entryScore, 100);
        });
        
        // Bonus points for multiple relevant experiences
        if (hasLawEnforcement && (hasMilitary || hasSecurity)) {
          totalScore += 15; // Bonus for multiple law enforcement related experiences
        }
        
        if (hasLeadership && hasPublicInteraction) {
          totalScore += 10; // Bonus for leadership with public interaction
        }
        
        if (hasEmergencyExposure && hasPublicInteraction) {
          totalScore += 10; // Bonus for emergency exposure with public interaction
        }
        
        // Cap total score at 100
        totalScore = Math.min(totalScore, 100);
        
        // Determine level based on score and specific criteria
        if (totalScore >= 85 || hasLawEnforcement) {
          levels.work = 'COMPETITIVE';
        } else if (totalScore >= 65 || hasMilitary || (hasSecurity && hasLeadership)) {
          levels.work = 'EFFECTIVE';
        } else if (totalScore >= 40 || hasSecurity || hasEmergencyServices || (hasLeadership && totalMonths >= 24)) {
          levels.work = 'DEVELOPING';
        } else {
          levels.work = 'NEEDS_WORK';
        }
        
        console.log('ProfileResumeBuilder: Work experience scoring:', {
          totalScore,
          workEntries: workEntries.length,
          hasLawEnforcement,
          hasMilitary,
          hasSecurity,
          hasLeadership,
          totalMonths,
          level: levels.work
        });
      } else {
        levels.work = 'NEEDS_WORK';
      }
      
      // Volunteer Experience Grading
      const volunteerEntries = arrays.volunteer_history || [];
      if (volunteerEntries.length > 0) {
        const hasYouth = volunteerEntries.some((v: any) => 
          /youth|coach|mentor/i.test(v?.role || '')
        );
        const hasCommunity = volunteerEntries.some((v: any) => 
          /community|outreach|event/i.test(v?.role || '')
        );
        const hasEmergency = volunteerEntries.some((v: any) => 
          /emergency|response|first aid/i.test(v?.role || '')
        );
        
        if (volunteerEntries.length >= 2 || hasEmergency) {
          levels.volunteer = 'COMPETITIVE';
        } else if (hasYouth || hasCommunity) {
          levels.volunteer = 'EFFECTIVE';
        } else {
          levels.volunteer = 'DEVELOPING';
        }
      } else {
        levels.volunteer = 'NEEDS_WORK';
      }
      
      // Certifications Grading
      const certEntries = arrays.certs_details || [];
      if (certEntries.length > 0) {
        const hasCPR = certEntries.some((c: any) => 
          /cpr|first aid/i.test(c?.name || '')
        );
        const hasMentalHealth = certEntries.some((c: any) => 
          /mental health|mhfa/i.test(c?.name || '')
        );
        const hasDeescalation = certEntries.some((c: any) => 
          /de.?escalation|cpi|nvci/i.test(c?.name || '')
        );
        
        if (hasCPR && (hasMentalHealth || hasDeescalation)) {
          levels.certs = 'COMPETITIVE';
        } else if (hasCPR || hasMentalHealth || hasDeescalation) {
          levels.certs = 'EFFECTIVE';
        } else if (certEntries.length >= 2) {
          levels.certs = 'DEVELOPING';
        } else {
          levels.certs = 'NEEDS_WORK';
        }
      } else {
        levels.certs = 'NEEDS_WORK';
      }
      
      // Soft Skills Grading
      const skillsEntries = arrays.skills_details || [];
      const languageEntries = arrays.skills_languages || [];
      if (skillsEntries.length > 0 || languageEntries.length > 0) {
        const hasAdvancedSkills = skillsEntries.some((s: any) => 
          /advanced|expert/i.test(s?.proficiency || '')
        );
        const hasProfessionalLanguage = languageEntries.some((l: any) => 
          /professional|native/i.test(l?.proficiency || '')
        );
        
        if ((hasAdvancedSkills && skillsEntries.length >= 2) || hasProfessionalLanguage) {
          levels.softskills = 'COMPETITIVE';
        } else if (hasAdvancedSkills || hasProfessionalLanguage || skillsEntries.length >= 2) {
          levels.softskills = 'EFFECTIVE';
        } else {
          levels.softskills = 'DEVELOPING';
        }
      } else {
        levels.softskills = 'NEEDS_WORK';
      }
      
      // References Grading
      const refEntries = arrays.refs_list || [];
      if (refEntries.length > 0) {
        const hasLongTerm = refEntries.some((r: any) => r?.known_2y === true);
        
        if (refEntries.length >= 3 && hasLongTerm) {
          levels.references = 'COMPETITIVE';
        } else if (refEntries.length >= 2) {
          levels.references = 'EFFECTIVE';
        } else {
          levels.references = 'DEVELOPING';
        }
      } else {
        levels.references = 'NEEDS_WORK';
      }
      
      // SEPARATE GRADING FOR DRIVING RECORD AND BACKGROUND & FITNESS
      const drivingExtras = currentExtras || extras;
      console.log('ProfileResumeBuilder: Driving and background grading - extras data:', drivingExtras);
      
      // === DRIVING RECORD GRADING ===
      let drivingRecordScore = 0;
      
      // License Class Weighting (50% of driving record)
      const licenseClass = (drivingExtras.driver_licence_class || '').toUpperCase();
      if (licenseClass === 'G') {
        drivingRecordScore += 50; // Full G license - required for police
      } else if (licenseClass === 'G2') {
        drivingRecordScore += 25; // G2 license - needs upgrade
      } else {
        drivingRecordScore += 0; // G1 or other - insufficient
      }
      
      // Clean Abstract Weighting (30% of driving record)
      if (drivingExtras.driver_clean_abstract === true) {
        drivingRecordScore += 30; // Clean abstract - required
      } else if (drivingExtras.driver_clean_abstract === false) {
        drivingRecordScore += 0; // Issues on abstract - disqualifying
      } else {
        drivingRecordScore += 15; // Unknown status - partial
      }
      
      // Infractions Weighting (20% of driving record)
      const infractions = drivingExtras.driver_infractions || 'None';
      if (infractions === 'None') {
        drivingRecordScore += 20; // No infractions - maximum
      } else if (infractions === '1 Minor') {
        drivingRecordScore += 10; // Minor infraction - partial
      } else {
        drivingRecordScore += 0; // Major infractions - disqualifying
      }
      
      // Determine driving record level
      if (licenseClass === 'G' && drivingExtras.driver_clean_abstract === true && infractions === 'None') {
        levels.driving = 'COMPETITIVE'; // Perfect driving record
      } else if (licenseClass === 'G' && drivingRecordScore >= 80) {
        levels.driving = 'EFFECTIVE'; // Good driving record
      } else if (licenseClass === 'G' && drivingRecordScore >= 60) {
        levels.driving = 'DEVELOPING'; // Acceptable driving record
      } else if (licenseClass === 'G2' && drivingRecordScore >= 40) {
        levels.driving = 'DEVELOPING'; // G2 license - needs upgrade
      } else {
        levels.driving = 'NEEDS_WORK'; // Insufficient or problematic
      }
      
      console.log('ProfileResumeBuilder: Driving record scoring:', {
        licenseClass,
        cleanAbstract: drivingExtras.driver_clean_abstract,
        infractions,
        drivingRecordScore,
        level: levels.driving
      });
      
      // === BACKGROUND & FITNESS GRADING ===
      let backgroundFitnessScore = 0;
      
      // Background Checks (40% of background & fitness)
      if (drivingExtras.background_check_complete === true) {
        backgroundFitnessScore += 20;
      }
      if (drivingExtras.credit_check_complete === true) {
        backgroundFitnessScore += 10;
      }
      if (drivingExtras.social_media_clean === true) {
        backgroundFitnessScore += 10;
      }
      
      // Verifications (30% of background & fitness)
      if (drivingExtras.education_verified === true) {
        backgroundFitnessScore += 15;
      }
      if (drivingExtras.employment_verified === true) {
        backgroundFitnessScore += 15;
      }
      
             // PREP Test Status (30% of background & fitness) - CRITICAL
       const hasVerifiedPrep = drivingExtras.fitness_prep_observed_verified === true;
       const hasAttemptedPrep = drivingExtras.fitness_prep_digital_attempted === true;
       const circuitTime = drivingExtras.fitness_circuit_time || '';
       const shuttleRun = drivingExtras.fitness_shuttle_run || '';
       
       // Calculate PREP performance score based on both circuit time and shuttle run
       let prepPerformanceScore = 0;
       if (hasVerifiedPrep) {
         prepPerformanceScore = 30; // Full points for verified completion
       } else if (hasAttemptedPrep && circuitTime && shuttleRun) {
         const timeParts = circuitTime.split(':');
         if (timeParts.length === 2) {
           const minutes = parseInt(timeParts[0]) || 0;
           const seconds = parseInt(timeParts[1]) || 0;
           const totalSeconds = minutes * 60 + seconds;
           const shuttleLevel = parseFloat(shuttleRun) || 0;
           
           // Circuit time scoring (15 points max)
           if (totalSeconds <= 157) { // 2:37 or under - passing
             prepPerformanceScore += 15;
           } else if (totalSeconds <= 180) { // 3:00 or under - close
             prepPerformanceScore += 10;
           } else if (totalSeconds <= 240) { // 4:00 or under - needs work
             prepPerformanceScore += 5;
           } else {
             prepPerformanceScore += 0; // Too slow
           }
           
           // Shuttle run scoring (15 points max)
           if (shuttleLevel >= 7.0) { // Level 7.0+ - passing
             prepPerformanceScore += 15;
           } else if (shuttleLevel >= 5.0) { // Level 5.0+ - close
             prepPerformanceScore += 10;
           } else if (shuttleLevel >= 3.0) { // Level 3.0+ - needs work
             prepPerformanceScore += 5;
           } else {
             prepPerformanceScore += 0; // Too low
           }
         }
       }
      
             // Check if user can pass PREP test
       let canPassPrep = false;
       let prepReason = '';
       
       if (hasVerifiedPrep) {
         canPassPrep = true;
         prepReason = 'PREP test verified';
       } else if (hasAttemptedPrep && circuitTime && shuttleRun) {
         // Check circuit time (must be 2:37 or under to pass)
         const timeParts = circuitTime.split(':');
         if (timeParts.length === 2) {
           const minutes = parseInt(timeParts[0]) || 0;
           const seconds = parseInt(timeParts[1]) || 0;
           const totalSeconds = minutes * 60 + seconds;
           
           // Check shuttle run level (must be 7.0 or higher to pass)
           const shuttleLevel = parseFloat(shuttleRun) || 0;
           
           if (totalSeconds <= 157 && shuttleLevel >= 7.0) { // 2:37 or faster AND level 7.0+
             canPassPrep = true;
             prepReason = `Circuit time ${circuitTime} and shuttle level ${shuttleRun} - both passing`;
           } else if (totalSeconds > 157) {
             canPassPrep = false;
             prepReason = `Circuit time too slow (${circuitTime} - must be 2:37 or under)`;
           } else if (shuttleLevel < 7.0) {
             canPassPrep = false;
             prepReason = `Shuttle run level too low (${shuttleRun} - must be 7.0 or higher)`;
           } else {
             canPassPrep = false;
             prepReason = 'Both circuit time and shuttle run need improvement';
           }
         } else {
           canPassPrep = false;
           prepReason = 'Invalid circuit time format';
         }
       } else {
         canPassPrep = false;
         prepReason = 'No PREP test data available';
       }
      
             backgroundFitnessScore += prepPerformanceScore;
      
      // Determine background & fitness level
      if (backgroundFitnessScore >= 85 && canPassPrep) {
        levels.background = 'COMPETITIVE'; // All checks complete + can pass PREP
      } else if (backgroundFitnessScore >= 70 && canPassPrep) {
        levels.background = 'EFFECTIVE'; // Most checks complete + can pass PREP
      } else if (backgroundFitnessScore >= 50) {
        levels.background = 'DEVELOPING'; // Some checks complete
      } else if (!canPassPrep) {
        levels.background = 'NEEDS_WORK'; // Cannot pass PREP test
      } else {
        levels.background = 'NEEDS_WORK'; // Insufficient background data
      }
      
             console.log('ProfileResumeBuilder: Background & fitness scoring:', {
         backgroundFitnessScore,
         prepPerformanceScore,
         canPassPrep,
         prepReason,
         backgroundCheck: drivingExtras.background_check_complete,
         creditCheck: drivingExtras.credit_check_complete,
         socialMedia: drivingExtras.social_media_clean,
         educationVerified: drivingExtras.education_verified,
         employmentVerified: drivingExtras.employment_verified,
         hasVerifiedPrep,
         hasAttemptedPrep,
         circuitTime,
         shuttleRun,
         level: levels.background
       });
      
      console.log('ProfileResumeBuilder: Computed levels:', levels);
      console.log('ProfileResumeBuilder: Setting category levels:', levels);
      
      // Log any changes in levels for debugging
      Object.keys(levels).forEach(key => {
        const categoryKey = key as CategoryKey;
        const newLevel = levels[categoryKey];
        const oldLevel = previousLevels[categoryKey];
        if (newLevel !== oldLevel) {
          console.log(`ProfileResumeBuilder: Level changed for ${categoryKey}: ${oldLevel} -> ${newLevel}`);
        }
      });
      
      setCategoryLevels(levels);

      // SIMPLIFIED OVERALL STAGE CALCULATION
      console.log('ProfileResumeBuilder: Calculating overall stage with levels:', levels);
      const coreCategories = ['education','work','volunteer'] as CategoryKey[];
      const competitiveCount = Object.values(levels).filter(l => l === 'COMPETITIVE').length;
      const effectiveCount = Object.values(levels).filter(l => l === 'EFFECTIVE').length;
      const developingCount = Object.values(levels).filter(l => l === 'DEVELOPING').length;
      const needsWorkCount = Object.values(levels).filter(l => l === 'NEEDS_WORK').length;
      
      console.log('ProfileResumeBuilder: Level counts:', {
        competitive: competitiveCount,
        effective: effectiveCount,
        developing: developingCount,
        needsWork: needsWorkCount
      });
      
              // CRITICAL RULE: Overall grade cannot be higher than "Developing" if work, education, or background is "Developing" or "Needs Work"
        const educationLevel = levels.education;
        const workLevel = levels.work;
        const backgroundLevel = levels.background;
        const hasWeakCore = (educationLevel === 'DEVELOPING' || educationLevel === 'NEEDS_WORK') ||
                           (workLevel === 'DEVELOPING' || workLevel === 'NEEDS_WORK') ||
                           (backgroundLevel === 'DEVELOPING' || backgroundLevel === 'NEEDS_WORK');

        // Calculate overall stage based on category distribution
        let overallStage: CompetitivenessLevel;
        if (competitiveCount >= 3 || (competitiveCount >= 2 && effectiveCount >= 2)) {
          overallStage = 'COMPETITIVE';
        } else if (effectiveCount >= 3 || (effectiveCount >= 2 && developingCount >= 1)) {
          overallStage = 'EFFECTIVE';
        } else if (developingCount >= 2 || (developingCount >= 1 && needsWorkCount <= 2)) {
          overallStage = 'DEVELOPING';
        } else {
          overallStage = 'NEEDS_WORK';
        }

        // Apply the constraint: if core areas (education/work/background) are weak, cap at "Developing"
        if (hasWeakCore && (overallStage === 'COMPETITIVE' || overallStage === 'EFFECTIVE')) {
          overallStage = 'DEVELOPING';
          console.log('ProfileResumeBuilder: Overall grade capped at DEVELOPING due to weak education/work/background:', {
            educationLevel,
            workLevel,
            backgroundLevel,
            originalStage: overallStage === 'DEVELOPING' ? 'COMPETITIVE/EFFECTIVE' : overallStage
          });
        }
      
      setOverallStage(overallStage);
      
      // Top Applicant badge: multiple competitive categories and strong core
      const coreAreStrong = coreCategories.every((k) => levels[k] === 'COMPETITIVE' || levels[k] === 'EFFECTIVE');
      const hasMultipleCompetitive = competitiveCount >= 2;
      setIsTopApplicant(hasMultipleCompetitive && coreAreStrong);
      
      console.log('ProfileResumeBuilder: Overall stage:', overallStage, 'Top applicant:', hasMultipleCompetitive && coreAreStrong);
      return;
    } catch (err) {
      console.error('ProfileResumeBuilder: Error in simplified grading system:', err);
    }
  };

  const toggleCollapsed = (key: SectionKey) => {
    setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getSectionCount = (key: SectionKey) => {
    console.log('ProfileResumeBuilder: getSectionCount called for key:', key);
    
    if (key === 'certs_details') {
      const count = (arraysLen(details.certs_details) + arraysLen(details.skills_languages) + arraysLen(details.skills_details) + arraysLen(details.awards_details));
      console.log('ProfileResumeBuilder: Certs count:', count);
      return count;
    }
    if (key === 'driving_record') {
      // Driving record section uses extras data, not array data
      // Count how many driving-related fields are filled
      const drivingFields = [
        extras.driver_licence_class,
        extras.driver_clean_abstract,
        extras.driver_infractions,
        extras.driver_infraction_date
      ];
      const filledFields = drivingFields.filter(field => field !== null && field !== undefined && field !== '');
      console.log('ProfileResumeBuilder: Driving record fields:', drivingFields);
      console.log('ProfileResumeBuilder: Filled driving record fields:', filledFields.length);
      return filledFields.length;
    }
    if (key === 'background_fitness') {
      // Background & fitness section uses extras data, not array data
      // Count how many background and fitness fields are filled
      const backgroundFitnessFields = [
        extras.conduct_no_major_issues,
        extras.background_check_complete,
        extras.credit_check_complete,
        extras.social_media_clean,
        extras.education_verified,
        extras.employment_verified,
        extras.fitness_prep_observed_verified,
        extras.fitness_prep_digital_attempted,
        extras.fitness_shuttle_run,
        extras.fitness_circuit_time
      ];
      const filledFields = backgroundFitnessFields.filter(field => field !== null && field !== undefined && field !== '');
      console.log('ProfileResumeBuilder: Background & fitness fields:', backgroundFitnessFields);
      console.log('ProfileResumeBuilder: Filled background & fitness fields:', filledFields.length);
      return filledFields.length;
    }
    const count = arraysLen(details[key]);
    console.log('ProfileResumeBuilder: Standard section count for', key, ':', count);
    return count;
  };

  const arraysLen = (arr: any) => {
    const length = Array.isArray(arr) ? arr.length : 0;
    console.log('ProfileResumeBuilder: arraysLen called with:', arr, 'returning:', length);
    return length;
  };

  React.useEffect(() => {
    let mounted = true;
    const loadSafe = async () => {
      console.log('ProfileResumeBuilder: loadSafe started for user:', user?.id);
      if (!user?.id) {
        console.log('ProfileResumeBuilder: No user ID, returning');
        return;
      }
      setLoading(true);
      try {
        // Load dynamic competitiveness config
        console.log('ProfileResumeBuilder: Loading competitiveness config');
        try {
          const txt = await contentService.getContent('application.competitiveness.config');
          if (txt && txt.trim().length > 0) {
            const parsed = JSON.parse(txt);
            if (parsed && typeof parsed === 'object') {
              console.log('ProfileResumeBuilder: Using custom competitiveness config');
              setCfg(parsed);
          } else {
            console.log('ProfileResumeBuilder: Using default competitiveness config');
            setCfg(CFG_DEFAULT);
          }
          } else {
          console.log('ProfileResumeBuilder: Using default competitiveness config (no content)');
          setCfg(CFG_DEFAULT);
        }
        } catch (e) {
          console.log('ProfileResumeBuilder: Error loading config, using default:', e);
          setCfg(CFG_DEFAULT);
        }
        
        // Ensure a row exists for this user to prevent empty selects
        console.log('ProfileResumeBuilder: Ensuring user row exists in database');
        await supabase.from('application_profile').upsert({ user_id: user.id }, { onConflict: 'user_id' });

        const fullCols = 'education_details, work_history, volunteer_history, certs_details, skills_languages, skills_details, refs_list, awards_details, driver_licence_class, driver_clean_abstract, driver_abstract_date, driver_infractions, driver_infraction_date, fitness_prep_observed_verified, fitness_prep_digital_attempted, fitness_prep_date, fitness_shuttle_run, fitness_circuit_time, fitness_push_ups, fitness_sit_ups, conduct_no_major_issues, background_check_complete, credit_check_complete, social_media_clean, education_verified, employment_verified';
        console.log('ProfileResumeBuilder: Loading data with columns:', fullCols);
        let { data, error } = await supabase
          .from('application_profile')
          .select(fullCols)
          .eq('user_id', user.id)
          .maybeSingle();

        console.log('ProfileResumeBuilder: Database query result - data:', data, 'error:', error);
        
        if (error && (error.code === '42703' || /column .* does not exist/i.test(error.message || ''))) {
          // Fallback for environments missing optional columns
          console.log('ProfileResumeBuilder: Using fallback columns due to missing columns error');
          const fallbackCols = 'education_details, work_history, volunteer_history, certs_details, skills_languages, refs_list';
          const fb = await supabase
            .from('application_profile')
            .select(fallbackCols)
            .eq('user_id', user.id)
            .maybeSingle();
          data = fb.data as any;
          console.log('ProfileResumeBuilder: Fallback query result:', data);
        } else if (error) {
          console.error('ProfileResumeBuilder: Database error:', error);
          throw error;
        }

        if (!mounted) {
          console.log('ProfileResumeBuilder: Component unmounted, returning');
          return;
        }
        console.log('ProfileResumeBuilder: Processing loaded data');
        const next = {
          education_details: (data?.education_details as JsonArray) || [],
          work_history: (data?.work_history as JsonArray) || [],
          volunteer_history: (data?.volunteer_history as JsonArray) || [],
          certs_details: (data?.certs_details as JsonArray) || [],
          skills_languages: (data?.skills_languages as JsonArray) || [],
          skills_details: (data as any)?.skills_details || [],
          awards_details: (data as any)?.awards_details || [],
          refs_list: (data?.refs_list as JsonArray) || [],
          driving_record: [],
          background_fitness: [],
        } as any;
        console.log('ProfileResumeBuilder: Processed details data:', next);
        const newExtras = {
          // Driving & Record
          driver_licence_class: (data as any)?.driver_licence_class ?? null,
          driver_clean_abstract: (data as any)?.driver_clean_abstract ?? null,
          driver_abstract_date: (data as any)?.driver_abstract_date ?? null,
          driver_infractions: (data as any)?.driver_infractions ?? null,
          driver_infraction_date: (data as any)?.driver_infraction_date ?? null,
          
          // Physical Readiness
          fitness_prep_observed_verified: (data as any)?.fitness_prep_observed_verified ?? null,
          fitness_prep_digital_attempted: (data as any)?.fitness_prep_digital_attempted ?? null,
          fitness_prep_date: (data as any)?.fitness_prep_date ?? null,
          fitness_shuttle_run: (data as any)?.fitness_shuttle_run ?? null,
          fitness_circuit_time: (data as any)?.fitness_circuit_time ?? null,
          fitness_push_ups: (data as any)?.fitness_push_ups ?? null,
          fitness_sit_ups: (data as any)?.fitness_sit_ups ?? null,
          
          // Background & Integrity
          conduct_no_major_issues: (data as any)?.conduct_no_major_issues ?? null,
          background_check_complete: (data as any)?.background_check_complete ?? null,
          credit_check_complete: (data as any)?.credit_check_complete ?? null,
          social_media_clean: (data as any)?.social_media_clean ?? null,
          education_verified: (data as any)?.education_verified ?? null,
          employment_verified: (data as any)?.employment_verified ?? null,
        };
        console.log('ProfileResumeBuilder: Processed extras data:', newExtras);
        
        // Set the data first, then set config ready and recompute
        console.log('ProfileResumeBuilder: Setting state with loaded data');
        setDetails(next);
        setExtras(newExtras);
        setHasSkillsColumn('skills_details' in (data || {}));
        setHasAwardsColumn('awards_details' in (data || {}));
        
        // Set config ready after data is loaded
        console.log('ProfileResumeBuilder: Setting config ready');
        setConfigReady(true);
        
        // Recompute levels with the loaded data
        console.log('ProfileResumeBuilder: Data loaded, recomputing levels');
        recomputeLevels(next as any, newExtras);
      } catch (e: any) {
          console.error('ProfileResumeBuilder: Failed to load resume details', e?.message);
          console.error('ProfileResumeBuilder: Error details:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadSafe();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  // Recompute levels when config becomes ready or data changes
  React.useEffect(() => {
    if (configReady && Object.keys(details).length > 0) {
      console.log('ProfileResumeBuilder: Triggering recompute due to config/data change');
      recomputeLevels(details, extras);
    }
  }, [configReady, details, extras]);

  // Ensure grading is calculated when component mounts with existing data
  React.useEffect(() => {
    if (configReady && Object.keys(details).length > 0 && !loading) {
      console.log('ProfileResumeBuilder: Component mounted with existing data, ensuring grading is calculated');
      recomputeLevels(details, extras);
    }
  }, [configReady, loading]);

  // Force recompute when component first renders with data (for cases where data is already loaded)
  React.useEffect(() => {
    const hasData = Object.keys(details).length > 0;
    const hasExtras = Object.keys(extras).length > 0;
    
    if (configReady && (hasData || hasExtras) && !loading) {
      console.log('ProfileResumeBuilder: Initial render with data, forcing grading calculation');
      // Use setTimeout to ensure this runs after the initial render
      setTimeout(() => {
        recomputeLevels(details, extras);
      }, 100);
    }
  }, []); // Empty dependency array - only run once on mount

  // Additional safety check: recompute when component becomes visible with data
  React.useEffect(() => {
    if (configReady && !loading) {
      const hasData = Object.keys(details).length > 0;
      const hasExtras = Object.keys(extras).length > 0;
      
      if (hasData || hasExtras) {
        console.log('ProfileResumeBuilder: Safety check - ensuring grading is calculated with available data');
        // Small delay to ensure all state is properly set
        const timer = setTimeout(() => {
          recomputeLevels(details, extras);
        }, 200);
        
        return () => clearTimeout(timer);
      }
    }
  }, [configReady, loading, details, extras]);

  const upsert = async (payload: Partial<Record<SectionKey, JsonArray>>) => {
    if (!user?.id) return;
    const body: any = { user_id: user.id, updated_at: new Date().toISOString(), ...payload };
    // Guard: if environment lacks skills_details or awards_details, merge into certs_details as fallback to avoid loss
    if (!hasSkillsColumn && 'skills_details' in payload) {
      const merged = [ ...((details.certs_details || []) as any[]), ...((payload as any).skills_details || []) ];
      body.certs_details = merged;
      delete (body as any).skills_details;
    }
    if (!hasAwardsColumn && 'awards_details' in payload) {
      const merged = [ ...((details.certs_details || []) as any[]), ...((payload as any).awards_details || []) ];
      body.certs_details = merged;
      delete (body as any).awards_details;
    }
    const { error } = await supabase.from('application_profile').upsert(body, { onConflict: 'user_id' });
    if (error) {
      console.warn('Resume upsert error:', error);
      throw error;
    }
  };




  const toggleNA = async (section: SectionKey, value: boolean) => {
    setNotApplicable(prev => ({ ...prev, [section]: value }));
  };





  const upsertAny = async (payload: any) => {
    if (!user?.id) return;
    
    console.log('ProfileResumeBuilder: upsertAny called with payload:', payload);
    
    // Include all comprehensive fields for the enhanced grading system
    const comprehensiveFields = {
      // Driving & Record
      driver_licence_class: payload.driver_licence_class,
      driver_clean_abstract: payload.driver_clean_abstract,
      driver_abstract_date: payload.driver_abstract_date,
      driver_infractions: payload.driver_infractions,
      driver_infraction_date: payload.driver_infraction_date,
      
      // Physical Readiness
      fitness_prep_observed_verified: payload.fitness_prep_observed_verified,
      fitness_prep_digital_attempted: payload.fitness_prep_digital_attempted,
      fitness_prep_date: payload.fitness_prep_date,
      fitness_shuttle_run: payload.fitness_shuttle_run,
      fitness_circuit_time: payload.fitness_circuit_time,
      fitness_push_ups: payload.fitness_push_ups,
      fitness_sit_ups: payload.fitness_sit_ups,
      
      // Background & Integrity
      conduct_no_major_issues: payload.conduct_no_major_issues,
      background_check_complete: payload.background_check_complete,
      credit_check_complete: payload.credit_check_complete,
      social_media_clean: payload.social_media_clean,
      education_verified: payload.education_verified,
      employment_verified: payload.employment_verified,
    };
    
    // Only include fields that have values (not undefined, null, or empty string)
    const filteredPayload = Object.fromEntries(
      Object.entries(comprehensiveFields).filter(([_, value]) => 
        value !== undefined && 
        value !== null && 
        value !== '' && 
        value !== false // Include false values as they are valid boolean data
      )
    );
    
    console.log('ProfileResumeBuilder: Filtered payload for upsert:', filteredPayload);
    
    const body: any = { user_id: user.id, updated_at: new Date().toISOString(), ...filteredPayload };
    try {
      console.log('ProfileResumeBuilder: Attempting to upsert with comprehensive payload:', filteredPayload);
      const { error } = await supabase.from('application_profile').upsert(body, { onConflict: 'user_id' });
      if (error) {
        console.error('ProfileResumeBuilder: Upsert error details:', error);
        throw error;
      }
      console.log('ProfileResumeBuilder: Upsert successful with comprehensive fields');
    } catch (e: any) {
      console.error('ProfileResumeBuilder: Upsert error:', e);
      console.error('ProfileResumeBuilder: Error message:', e?.message);
      console.error('ProfileResumeBuilder: Error details:', e?.details);
      
      // If columns don't exist yet, fall back to basic fields
      if (/column .* does not exist/i.test(e?.message || '')) {
        console.log('ProfileResumeBuilder: Falling back to basic fields due to missing columns');
        const basicFields = {
          driver_licence_class: payload.driver_licence_class,
          driver_clean_abstract: payload.driver_clean_abstract,
          fitness_prep_observed_verified: payload.fitness_prep_observed_verified,
          fitness_prep_digital_attempted: payload.fitness_prep_digital_attempted,
          conduct_no_major_issues: payload.conduct_no_major_issues,
        };
        const basicPayload = Object.fromEntries(
          Object.entries(basicFields).filter(([_, value]) => 
            value !== undefined && 
            value !== null && 
            value !== '' && 
            value !== false
          )
        );
        const basicBody = { user_id: user.id, updated_at: new Date().toISOString(), ...basicPayload };
        console.log('ProfileResumeBuilder: Fallback basic payload:', basicPayload);
        const { error: basicError } = await supabase.from('application_profile').upsert(basicBody, { onConflict: 'user_id' });
        if (basicError) {
          console.error('ProfileResumeBuilder: Fallback upsert error:', basicError);
          throw basicError;
        }
        console.log('ProfileResumeBuilder: Fallback upsert successful');
      } else {
        throw e;
      }
    }
  };

  const saveExtrasField = async (patch: Partial<typeof extras>) => {
    console.log('ProfileResumeBuilder: saveExtrasField called with patch:', patch);
    const next = { ...extras, ...patch };
    console.log('ProfileResumeBuilder: Current extras:', extras);
    console.log('ProfileResumeBuilder: New extras after patch:', next);
    setExtras(next);
    try {
      console.log('ProfileResumeBuilder: Upserting to database:', patch);
      await upsertAny(patch);
      console.log('ProfileResumeBuilder: Database upsert successful');
      
      // Only recompute levels with the updated extras, no need to refetch all data
      console.log('ProfileResumeBuilder: Calling recomputeLevels with updated extras');
      recomputeLevels(details, next);
    } catch (error) {
      console.error('ProfileResumeBuilder: Database upsert failed:', error);
    }
  };

  const renderExtrasEditor = () => {
    const licenceOptions = ['G','G2','G1','OTHER'];
    return (
      <View style={{ marginTop: 10, gap: 12 }}>
        <View>
          <Text style={{ color: Colors.text, fontWeight: '600', marginBottom: 6 }}>Licence Class</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {licenceOptions.map(opt => {
              const active = (extras.driver_licence_class || '').toUpperCase() === opt;
              return (
                <TouchableOpacity key={opt} onPress={() => saveExtrasField({ driver_licence_class: opt })} style={[styles.optionChip, active && styles.optionChipActive]}>
                  <Text style={[styles.optionChipText, active && styles.optionChipTextActive]}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Clean abstract (last 24 months)</Text>
          <Switch value={!!extras.driver_clean_abstract} onValueChange={(v) => saveExtrasField({ driver_clean_abstract: v })} />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>PREP/PIN observed & verified</Text>
          <Switch value={!!extras.fitness_prep_observed_verified} onValueChange={(v) => saveExtrasField({ fitness_prep_observed_verified: v })} />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Digital/Practice fitness attempts</Text>
          <Switch value={!!extras.fitness_prep_digital_attempted} onValueChange={(v) => saveExtrasField({ fitness_prep_digital_attempted: v })} />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>No major background issues</Text>
          <Switch value={extras.conduct_no_major_issues !== false} onValueChange={(v) => saveExtrasField({ conduct_no_major_issues: v })} />
        </View>
      </View>
    );
  };

  const renderExtrasSummary = () => {
    const chips: string[] = [];
    // Driving & Record
    if (extras.driver_licence_class) chips.push(`Class ${String(extras.driver_licence_class).toUpperCase()}`);
    if (extras.driver_clean_abstract != null) chips.push(extras.driver_clean_abstract ? 'Clean abstract' : 'Abstract: issues/pending');
    if (extras.driver_infractions && extras.driver_infractions !== 'None') {
      const infractionText = extras.driver_infraction_date 
        ? `${extras.driver_infractions} (${extras.driver_infraction_date})`
        : extras.driver_infractions;
      chips.push(`Infractions: ${infractionText}`);
    }
    
    // Physical Readiness
    if (extras.fitness_prep_observed_verified) chips.push('PREP verified');
    if (extras.fitness_prep_digital_attempted) chips.push('Fitness practiced');
    if (extras.fitness_shuttle_run && extras.fitness_shuttle_run !== 'Not Tested') chips.push(`Shuttle: ${extras.fitness_shuttle_run}`);
    if (extras.fitness_circuit_time) chips.push(`Circuit: ${extras.fitness_circuit_time}`);
    
    // Background & Integrity
    if (extras.conduct_no_major_issues != null) chips.push(extras.conduct_no_major_issues ? 'Background OK' : 'Background flag');
    if (extras.background_check_complete) chips.push('Background check ✓');
    if (extras.credit_check_complete) chips.push('Credit check ✓');
    if (extras.social_media_clean) chips.push('Social media ✓');
    if (extras.education_verified) chips.push('Education verified ✓');
    if (extras.employment_verified) chips.push('Employment verified ✓');
    if (chips.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No driving/indicator info yet. Tap "Edit Driving & Indicators".</Text>
        </View>
      );
    }
    return (
      <View style={styles.listWrap}>
        <View style={styles.itemCard}>
          <View style={styles.chipsRow}>
            {chips.map((c, i) => (
              <View key={i} style={styles.chip}><Text style={styles.chipText}>{c}</Text></View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const getMetaChips = (key: SectionKey, item: any): string[] => {
    try {
      switch (key) {
        case 'work_history': {
          const role = item.title || item.role;
          const ft = item.hours_per_week ? `${item.hours_per_week}h/wk` : null;
          const months = item.months ? `${item.months} mo` : null;
          return [role, ft, months].filter(Boolean);
        }
        case 'volunteer_history': {
          const hours = item.total_hours ? `${item.total_hours}h` : (item.hours_per_week ? `${item.hours_per_week}h/wk` : null);
          return [hours].filter((h): h is string => Boolean(h));
        }
        case 'education_details': {
          const level = item.credential_level || item.level;
          const progr = item.program;
          return [level, progr].filter(Boolean);
        }
        case 'certs_details': {
          const t = item.type ? item.type : null;
          const exp = item.expiry_date ? `exp ${item.expiry_date}` : null;
          return [t || 'Certification', exp].filter(Boolean);
        }
        case 'skills_languages': {
          const prof = item.proficiency;
          return [prof].filter(Boolean);
        }
        case 'awards_details': {
          const d = item.date;
          return [d].filter(Boolean);
        }
        case 'refs_list': {
          return [item.known_2y ? 'Known 2+ yrs' : null].filter((k): k is string => Boolean(k));
        }
      }
    } catch {}
    return [];
  };

  // Add error boundary
  if (!user) {
    console.log('ProfileResumeBuilder: No user, showing loading');
  return (
    <View style={{ marginTop: 16 }}>
      <LinearGradient colors={[ '#EEF2FF', '#ECFEFF', '#ECFDF5' ]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardOuter}>
        <View style={styles.card}> 
            <Text style={styles.title}>Application Analysis</Text>
            <Text style={styles.subtitle}>Loading...</Text>
            </View>
              </LinearGradient>
            </View>
    );
  }

  console.log('ProfileResumeBuilder: Rendering main component');
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Simple Header for Pre-Application Step */}
      <View style={styles.simpleHeader}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.simpleHeaderTitle}>Application Sections</Text>
            <Text style={styles.simpleHeaderSubtitle}>Complete your profile to build a competitive application</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.userRepresentation}>
              <View style={styles.policeCar}>
                {/* Main Car Body */}
                <View style={styles.carBody} />
                
                {/* Hood */}
                <View style={styles.hood} />
                
                {/* Front Bumper */}
                <View style={styles.frontBumper} />
                
                {/* Windshield */}
                <View style={styles.windshield} />
                
                {/* Driver Side Window */}
                <View style={styles.driverWindow} />
                
                {/* Passenger Side Window */}
                <View style={styles.passengerWindow} />
                
                {/* Rear Window */}
                <View style={styles.rearWindow} />
                
                {/* Driver Door */}
                <View style={styles.driverDoor} />
                
                {/* Passenger Door */}
                <View style={styles.passengerDoor} />
                
                {/* Trunk */}
                <View style={styles.trunk} />
                
                {/* Police Light Bar */}
                <View style={styles.lightBar}>
                  <View style={styles.lightBarBase} />
                  <View style={[styles.siren, styles.redSiren]} />
                  <View style={[styles.siren, styles.blueSiren]} />
                  <View style={[styles.siren, styles.redSiren2]} />
                  <View style={[styles.siren, styles.blueSiren2]} />
                  <View style={[styles.siren, styles.redSiren3]} />
                  <View style={[styles.siren, styles.blueSiren3]} />
                </View>
                
                {/* Front Grill */}
                <View style={styles.frontGrill} />
                
                {/* Headlights */}
                <View style={styles.headlight} />
                <View style={styles.headlight2} />
                
                {/* Tail Lights */}
                <View style={styles.tailLight} />
                <View style={styles.tailLight2} />
                
                {/* Wheels with Hubcaps */}
                <View style={styles.wheel} />
                <View style={styles.wheel2} />
                <View style={styles.wheel3} />
                <View style={styles.wheel4} />
                
                {/* Police Badge on Driver Door */}
                <View style={styles.carBadge} />
                
                {/* POLICE Text on Side */}
                <View style={styles.policeText} />
                
                {/* Side Stripes - Blue and Gold */}
                <View style={styles.sideStripe} />
                <View style={styles.sideStripe2} />
                
                {/* Front License Plate */}
                <View style={styles.licensePlate} />
                
                {/* Side Mirrors */}
                <View style={styles.sideMirror} />
                <View style={styles.sideMirror2} />
                
                {/* Door Handles */}
                <View style={styles.doorHandle} />
                <View style={styles.doorHandle2} />
                
                {/* Evolution Elements based on grade level */}
                {overallStage === 'COMPETITIVE' && (
                  <>
                    <View style={styles.competitiveElements}>
                      <View style={styles.antenna} />
                      <View style={styles.spotlight} />
                      <View style={styles.radar} />
                      <View style={styles.pushBar} />
                      <View style={styles.spotlight2} />
                    </View>
                  </>
                )}
                {overallStage === 'EFFECTIVE' && (
                  <>
                    <View style={styles.effectiveElements}>
                      <View style={styles.antenna} />
                      <View style={styles.spotlight} />
                      <View style={styles.pushBar} />
                    </View>
                  </>
                )}
                {overallStage === 'DEVELOPING' && (
                  <View style={styles.developingElements}>
                    <View style={styles.antenna} />
                  </View>
                )}
                
                {/* Grade Badge */}
                <View style={[
                  styles.gradeBadge,
                  { backgroundColor: overallStage === 'COMPETITIVE' ? Colors.success : overallStage === 'EFFECTIVE' ? Colors.secondary : overallStage === 'DEVELOPING' ? Colors.warning : Colors.error }
                ]}>
                  <Text style={styles.gradeBadgeText}>
                    {overallStage === 'COMPETITIVE' ? '3' : overallStage === 'EFFECTIVE' ? '2' : overallStage === 'DEVELOPING' ? '1' : '0'}
                  </Text>
                </View>
              </View>
            </View>
            <View style={[
              styles.overallGradeBadge,
              { backgroundColor: overallStage === 'COMPETITIVE' ? Colors.success + '20' : overallStage === 'EFFECTIVE' ? Colors.secondary + '20' : overallStage === 'DEVELOPING' ? Colors.warning + '20' : Colors.error + '20' }
            ]}>
              <Text style={[
                styles.overallGradeText,
                { color: overallStage === 'COMPETITIVE' ? Colors.success : overallStage === 'EFFECTIVE' ? Colors.secondary : overallStage === 'DEVELOPING' ? Colors.warning : Colors.error }
              ]}>
                {overallStage === 'COMPETITIVE' ? 'Competitive' : overallStage === 'EFFECTIVE' ? 'Effective' : overallStage === 'DEVELOPING' ? 'Developing' : 'Needs Work'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Sections Grid */}
      <View style={styles.sectionsContainer}>
        
        <View style={styles.sectionsGrid}>
          {SECTIONS.map((section) => {
            const sectionData = arrays[section.key] || [];
            const categoryKey = sectionToCategory[section.key];
            const level = categoryKey ? levels[categoryKey] || 'NEEDS_WORK' : 'NEEDS_WORK';
            const isCompleted = sectionData.length > 0;
            
            console.log('ProfileResumeBuilder: Rendering section:', section.key, {
              sectionData: sectionData.length,
              categoryKey,
              level,
              isCompleted,
              sectionCount: getSectionCount(section.key)
            });
            
            return (
              <TouchableOpacity
                key={section.key}
                style={[
                  styles.sectionCard,
                  level === 'COMPETITIVE' && styles.sectionCardCompetitive,
                  level === 'EFFECTIVE' && styles.sectionCardEffective,
                  level === 'DEVELOPING' && styles.sectionCardDeveloping,
                  level === 'NEEDS_WORK' && styles.sectionCardNeedsWork
                ]}
                onPress={() => handleSectionPress(section)}
                activeOpacity={0.7}
              >
                {/* Section Header */}
                <View style={styles.sectionHeader}>
                  <View style={[
                    styles.sectionIconContainer,
                    level === 'COMPETITIVE' && styles.sectionIconCompetitive,
                    level === 'EFFECTIVE' && styles.sectionIconEffective,
                    level === 'DEVELOPING' && styles.sectionIconDeveloping,
                    level === 'NEEDS_WORK' && styles.sectionIconNeedsWork
                  ]}>
                    {getSectionIcon(section.key)}
                  </View>
                  
                  <View style={styles.sectionInfo}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    <View style={styles.sectionMeta}>
                      <Text style={styles.sectionCount}>
                        {section.key === 'driving_record' || section.key === 'background_fitness'
                          ? `${getSectionCount(section.key)} fields completed`
                          : `${sectionData.length} ${sectionData.length === 1 ? 'entry' : 'entries'}`
                        }
                      </Text>
                      <View style={[
                        styles.levelIndicator,
                        level === 'COMPETITIVE' && styles.levelCompetitive,
                        level === 'EFFECTIVE' && styles.levelEffective,
                        level === 'DEVELOPING' && styles.levelDeveloping,
                        level === 'NEEDS_WORK' && styles.levelNeedsWork,
                      ]}>
                        <Text style={[
                          styles.levelText,
                          level === 'COMPETITIVE' && styles.levelTextCompetitive,
                          level === 'EFFECTIVE' && styles.levelTextEffective,
                          level === 'DEVELOPING' && styles.levelTextDeveloping,
                          level === 'NEEDS_WORK' && styles.levelTextNeedsWork,
                        ]}>
                          {level === 'COMPETITIVE' ? 'Competitive' : level === 'EFFECTIVE' ? 'Effective' : level === 'DEVELOPING' ? 'Developing' : 'Needs Work'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <ChevronRight size={16} color={Colors.textSecondary} />
                </View>

                {/* Section Preview */}
                {isCompleted && (
                  <View style={styles.sectionPreview}>
                    {section.key === 'driving_record' ? (
                      <Text style={styles.previewText} numberOfLines={1}>
                        {extras.driver_licence_class ? `License: ${extras.driver_licence_class}` : 'Driving record incomplete'}
                      </Text>
                    ) : section.key === 'background_fitness' ? (
                      <Text style={styles.previewText} numberOfLines={1}>
                        {extras.fitness_prep_observed_verified ? 'PREP Verified' : extras.fitness_prep_digital_attempted ? 'PREP Attempted' : 'Background & fitness incomplete'}
                      </Text>
                    ) : (
                      sectionData.slice(0, 1).map((entry: any, index: number) => (
                        <Text key={index} style={styles.previewText} numberOfLines={1}>
                          {entry.title || entry.role || entry.name || entry.institution || entry.organization || entry.company || 'Entry'}
                        </Text>
                      ))
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Tips Section */}
      <View style={styles.tipsSection}>
        <View style={styles.tipsHeader}>
          <Zap size={24} color={Colors.primary} />
          <Text style={styles.tipsTitle}>Pro Tips</Text>
        </View>
        <View style={styles.tipsList}>
          <View style={styles.tipItem}>
            <View style={styles.tipNumber}>
              <Text style={styles.tipNumberText}>1</Text>
            </View>
            <Text style={styles.tipText}>Focus on quality over quantity - detailed, relevant entries score higher</Text>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipNumber}>
              <Text style={styles.tipNumberText}>2</Text>
            </View>
            <Text style={styles.tipText}>Include specific achievements and measurable impacts in your work experience</Text>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipNumber}>
              <Text style={styles.tipNumberText}>3</Text>
            </View>
            <Text style={styles.tipText}>Volunteer experience with vulnerable populations is highly valued</Text>
          </View>
        </View>
      </View>

      {/* Unified Section Modal */}
      <UnifiedSectionModal
        visible={unifiedModalVisible}
        section={selectedSection}
        entries={selectedSection ? (arrays[selectedSection.key] || []) : []}
        levels={levels}
        onClose={() => setUnifiedModalVisible(false)}
        onAddEntry={handleSaveEntry}
        onEditEntry={(index, entry) => {
          const sectionKey = selectedSection?.key;
          if (!sectionKey) return;
          
          const currentArray = arrays[sectionKey] || [];
          const updatedArray = currentArray.map((item: any, i: number) => 
            i === index ? { ...item, ...entry } : item
          );
          
          setDetails(prev => ({
            ...prev,
            [sectionKey]: updatedArray
          }));
          
          // Save to database
          if (user) {
            supabase
              .from('application_profile')
              .upsert({
                user_id: user.id,
                [sectionKey]: updatedArray,
              });
          }
          
          // Recompute levels
          const newDetails = {
            ...arrays,
            [sectionKey]: updatedArray
          };
          recomputeLevels(newDetails, extras);
        }}
        onDeleteEntry={handleDeleteEntry}
        getImprovementTips={getImprovementTips}
        sectionToCategory={sectionToCategory}
      />

      <DrivingBackgroundModal
        visible={drivingModalVisible}
        section={currentSection}
        initialData={extras}
        onClose={() => setDrivingModalVisible(false)}
        onSave={handleSaveDrivingData}
      />
    </ScrollView>
  );
}

function labelFor(key: SectionKey): string {
  switch (key) {
    case 'education_details': return 'Education';
    case 'work_history': return 'Job';
    case 'volunteer_history': return 'Volunteer';
    case 'certs_details': return 'Item';
    case 'skills_languages': return 'Language';
    case 'skills_details': return 'Skills';
    case 'awards_details': return 'Award';
    case 'refs_list': return 'Reference';
    default: return 'Item';
  }
}

function summary(key: SectionKey, item: any): string {
  try {
    switch (key) {
      case 'education_details':
        return [item.institution, item.level || item.credential_level, item.program || (Array.isArray(item.program_tags) ? item.program_tags.join(', ') : null), item.year].filter(Boolean).join(' • ');
      case 'work_history':
        return [item.employer || item.title, item.role, item.months ? `${item.months} mo` : null, item.start && item.end ? `${item.start}→${item.end}` : item.start].filter(Boolean).join(' • ');
      case 'volunteer_history':
        return [item.organization, item.role, item.hours ? `${item.hours}h` : null, Array.isArray(item.role_types) ? item.role_types.join(', ') : null].filter(Boolean).join(' • ');
      case 'certs_details':
        return [item.name, item.issuer, item.expires ? `exp ${item.expires}` : null].filter(Boolean).join(' • ');
      case 'skills_languages':
        return [item.name || item.language, item.proficiency].filter(Boolean).join(' • ');
      case 'awards_details':
        return [item.name, item.issuer, item.date].filter(Boolean).join(' • ');
      case 'refs_list':
        return [item.name, item.relationship, item.contact].filter(Boolean).join(' • ');
              case 'driving_record':
          return [item.licence_class, item.clean_abstract ? 'Clean Abstract' : null].filter(Boolean).join(' • ');
        case 'background_fitness':
          const backgroundItems = [];
          if (item.background_check_complete) backgroundItems.push('Background Check');
          if (item.credit_check_complete) backgroundItems.push('Credit Check');
          if (item.social_media_clean) backgroundItems.push('Social Media Clean');
          if (item.education_verified) backgroundItems.push('Education Verified');
          if (item.employment_verified) backgroundItems.push('Employment Verified');
          if (item.fitness_prep_observed_verified) backgroundItems.push('PREP Verified');
          else if (item.fitness_prep_digital_attempted) backgroundItems.push('PREP Attempted');
          return backgroundItems.join(' • ');
      default:
        return 'Entry';
    }
  } catch {
  return 'Entry';
  }
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  simpleHeader: { 
    paddingVertical: 24, 
    paddingHorizontal: 20, 
    backgroundColor: Colors.white + '95', // Semi-transparent white
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border + '30',
    shadowColor: Colors.shadows.colored,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  userRepresentation: {
    alignItems: 'center',
  },
  policeCar: {
    width: 48,
    height: 32,
    position: 'relative',
  },
  carBody: {
    width: 44,
    height: 20,
    backgroundColor: '#E5E5E5',
    borderRadius: 10,
    position: 'absolute',
    bottom: 0,
    left: 2,
    borderWidth: 2,
    borderColor: '#000000',
  },
  hood: {
    width: 16,
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    position: 'absolute',
    bottom: 12,
    left: 4,
    borderWidth: 2,
    borderColor: '#000000',
  },
  frontBumper: {
    width: 20,
    height: 3,
    backgroundColor: '#000000',
    position: 'absolute',
    bottom: 0,
    left: 12,
    borderRadius: 1,
  },
  windshield: {
    width: 12,
    height: 6,
    backgroundColor: '#87CEEB',
    borderRadius: 3,
    position: 'absolute',
    bottom: 14,
    left: 18,
    borderWidth: 1,
    borderColor: '#000000',
  },
  driverWindow: {
    width: 8,
    height: 5,
    backgroundColor: '#87CEEB',
    borderRadius: 2,
    position: 'absolute',
    bottom: 15,
    left: 20,
    borderWidth: 1,
    borderColor: '#000000',
  },
  passengerWindow: {
    width: 8,
    height: 5,
    backgroundColor: '#87CEEB',
    borderRadius: 2,
    position: 'absolute',
    bottom: 15,
    right: 20,
    borderWidth: 1,
    borderColor: '#000000',
  },
  rearWindow: {
    width: 10,
    height: 6,
    backgroundColor: '#87CEEB',
    borderRadius: 3,
    position: 'absolute',
    bottom: 14,
    right: 8,
    borderWidth: 1,
    borderColor: '#000000',
  },
  driverDoor: {
    width: 2,
    height: 12,
    backgroundColor: '#000000',
    position: 'absolute',
    bottom: 8,
    left: 22,
  },
  passengerDoor: {
    width: 2,
    height: 12,
    backgroundColor: '#000000',
    position: 'absolute',
    bottom: 8,
    right: 22,
  },
  trunk: {
    width: 12,
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    position: 'absolute',
    bottom: 12,
    right: 4,
    borderWidth: 2,
    borderColor: '#000000',
  },
  lightBar: {
    width: 24,
    height: 4,
    backgroundColor: '#000000',
    position: 'absolute',
    top: 0,
    left: 12,
    borderRadius: 2,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  lightBarBase: {
    width: 24,
    height: 4,
    backgroundColor: '#000000',
    borderRadius: 2,
  },
  siren: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  redSiren: {
    backgroundColor: '#FF0000',
  },
  blueSiren: {
    backgroundColor: '#0066FF',
  },
  redSiren2: {
    backgroundColor: '#FF0000',
  },
  blueSiren2: {
    backgroundColor: '#0066FF',
  },
  redSiren3: {
    backgroundColor: '#FF0000',
  },
  blueSiren3: {
    backgroundColor: '#0066FF',
  },
  frontGrill: {
    width: 10,
    height: 2,
    backgroundColor: '#000000',
    position: 'absolute',
    bottom: 2,
    left: 6,
    borderRadius: 1,
  },
  headlight: {
    width: 4,
    height: 4,
    backgroundColor: '#FFFF00',
    position: 'absolute',
    bottom: 4,
    left: 8,
    borderRadius: 2,
  },
  headlight2: {
    width: 4,
    height: 4,
    backgroundColor: '#FFFF00',
    position: 'absolute',
    bottom: 4,
    right: 8,
    borderRadius: 2,
  },
  tailLight: {
    width: 3,
    height: 3,
    backgroundColor: '#FF0000',
    position: 'absolute',
    bottom: 4,
    left: 6,
    borderRadius: 1.5,
  },
  tailLight2: {
    width: 3,
    height: 3,
    backgroundColor: '#FF0000',
    position: 'absolute',
    bottom: 4,
    right: 6,
    borderRadius: 1.5,
  },
  wheel: {
    width: 6,
    height: 6,
    backgroundColor: '#000000',
    borderRadius: 3,
    position: 'absolute',
    bottom: -1,
    left: 10,
  },
  wheel2: {
    width: 6,
    height: 6,
    backgroundColor: '#000000',
    borderRadius: 3,
    position: 'absolute',
    bottom: -1,
    right: 10,
  },
  wheel3: {
    width: 6,
    height: 6,
    backgroundColor: '#000000',
    borderRadius: 3,
    position: 'absolute',
    bottom: -1,
    left: 32,
  },
  wheel4: {
    width: 6,
    height: 6,
    backgroundColor: '#000000',
    borderRadius: 3,
    position: 'absolute',
    bottom: -1,
    right: 32,
  },
  carBadge: {
    width: 6,
    height: 6,
    backgroundColor: '#FFD700',
    borderRadius: 3,
    position: 'absolute',
    top: 12,
    left: 20,
    borderWidth: 1,
    borderColor: '#000000',
  },
  policeText: {
    width: 12,
    height: 2,
    backgroundColor: '#000000',
    position: 'absolute',
    top: 14,
    left: 18,
    borderRadius: 1,
  },
  sideStripe: {
    width: 20,
    height: 2,
    backgroundColor: '#0066FF',
    position: 'absolute',
    top: 16,
    left: 14,
    borderRadius: 1,
  },
  sideStripe2: {
    width: 20,
    height: 2,
    backgroundColor: '#FFD700',
    position: 'absolute',
    top: 19,
    left: 14,
    borderRadius: 1,
  },
  licensePlate: {
    width: 8,
    height: 2,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    bottom: 1,
    left: 20,
    borderRadius: 1,
    borderWidth: 2,
    borderColor: '#000000',
  },
  sideMirror: {
    width: 2,
    height: 3,
    backgroundColor: '#000000',
    position: 'absolute',
    bottom: 18,
    left: 20,
    borderRadius: 1,
  },
  sideMirror2: {
    width: 2,
    height: 3,
    backgroundColor: '#000000',
    position: 'absolute',
    bottom: 18,
    right: 20,
    borderRadius: 1,
  },
  doorHandle: {
    width: 1,
    height: 2,
    backgroundColor: '#000000',
    position: 'absolute',
    bottom: 14,
    left: 23,
  },
  doorHandle2: {
    width: 1,
    height: 2,
    backgroundColor: '#000000',
    position: 'absolute',
    bottom: 14,
    right: 23,
  },
  competitiveElements: {
    position: 'absolute',
  },
  effectiveElements: {
    position: 'absolute',
  },
  developingElements: {
    position: 'absolute',
  },
  antenna: {
    width: 1,
    height: 10,
    backgroundColor: '#000000',
    position: 'absolute',
    top: -4,
    left: 24,
  },
  spotlight: {
    width: 4,
    height: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    position: 'absolute',
    top: 8,
    right: 6,
  },
  spotlight2: {
    width: 4,
    height: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    position: 'absolute',
    top: 8,
    left: 6,
  },
  radar: {
    width: 6,
    height: 3,
    backgroundColor: '#FFD700',
    borderRadius: 1.5,
    position: 'absolute',
    top: 10,
    right: 2,
  },
  pushBar: {
    width: 16,
    height: 2,
    backgroundColor: '#000000',
    position: 'absolute',
    bottom: 0,
    left: 16,
    borderRadius: 1,
  },
  gradeBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
    top: -2,
    right: -2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  simpleHeaderTitle: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: Colors.text,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  simpleHeaderSubtitle: { 
    fontSize: 16, 
    color: Colors.textSecondary,
    lineHeight: 24,
    fontWeight: '500',
  },
  overallGradeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 80,
  },
  overallGradeText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 24 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.text },
  headerSubtitle: { color: Colors.textSecondary, marginTop: 4 },
  headerIcon: { padding: 12, backgroundColor: Colors.gray[100], borderRadius: 999 },
  progressSection: { marginTop: 16 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressTitle: { color: Colors.textSecondary, marginBottom: 8 },
  progressScore: { fontSize: 18, fontWeight: '700', color: Colors.text },
     // Legacy progress styles removed
     sectionsContainer: { gap: 12 },
   sectionCard: { 
     backgroundColor: Colors.white + '85', // More transparent white
     borderRadius: 20, 
     padding: 20, 
     borderWidth: 1.5, 
     borderColor: Colors.border + '30', // More subtle border
     shadowColor: Colors.shadows.colored,
     shadowOffset: { width: 0, height: 4 },
     shadowOpacity: 0.08,
     shadowRadius: 12,
     elevation: 4,
     backdropFilter: 'blur(10px)', // Modern glass effect
   },
  sectionCardCompleted: { borderColor: Colors.success + '40' },
  sectionCardCompetitive: { 
    borderColor: Colors.success + '50', 
    backgroundColor: Colors.white + '90', // Keep white base with subtle tint
    shadowColor: Colors.success,
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  sectionCardEffective: { 
    borderColor: Colors.secondary + '50', 
    backgroundColor: Colors.white + '90', // Keep white base with subtle tint
    shadowColor: Colors.secondary,
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  sectionCardDeveloping: { 
    borderColor: Colors.warning + '50', 
    backgroundColor: Colors.white + '90', // Keep white base with subtle tint
    shadowColor: Colors.warning,
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  sectionCardNeedsWork: { 
    borderColor: Colors.error + '50', 
    backgroundColor: Colors.white + '90', // Keep white base with subtle tint
    shadowColor: Colors.error,
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  
  sectionHeader: { flexDirection: 'row', alignItems: 'center' },
  sectionMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  levelIndicator: { 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 16, 
    backgroundColor: Colors.white + '95',
    borderWidth: 1,
    borderColor: Colors.border + '40',
    shadowColor: Colors.shadows.colored,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  levelCompetitive: { 
    backgroundColor: Colors.success + '15', 
    borderColor: Colors.success + '40',
    shadowColor: Colors.success,
    shadowOpacity: 0.1,
  },
  levelEffective: { 
    backgroundColor: Colors.secondary + '15', 
    borderColor: Colors.secondary + '40',
    shadowColor: Colors.secondary,
    shadowOpacity: 0.1,
  },
  levelDeveloping: { 
    backgroundColor: Colors.warning + '15', 
    borderColor: Colors.warning + '40',
    shadowColor: Colors.warning,
    shadowOpacity: 0.1,
  },
  levelNeedsWork: { 
    backgroundColor: Colors.error + '15', 
    borderColor: Colors.error + '40',
    shadowColor: Colors.error,
    shadowOpacity: 0.1,
  },
  levelText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.2 },
  levelTextCompetitive: { color: Colors.success },
  levelTextEffective: { color: Colors.secondary },
  levelTextDeveloping: { color: Colors.warning },
  levelTextNeedsWork: { color: Colors.error },
  sectionPreview: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.border + '40' },
  previewText: { fontSize: 13, color: Colors.textSecondary, fontStyle: 'italic' },
  sectionIcon: { padding: 12, backgroundColor: Colors.gray[100], borderRadius: 999 },
  sectionInfo: { flex: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, maxWidth: '62%' },
  sectionSubtitle: { color: Colors.textSecondary, marginTop: 4 },
  sectionStatus: { flexDirection: 'row', gap: 8 },
  effectiveBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: Colors.success },
  effectiveBadgeText: { fontSize: 12, fontWeight: '600', color: Colors.success },
  developingBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: Colors.warning },
  developingBadgeText: { fontSize: 12, fontWeight: '600', color: Colors.warning },
  needsWorkBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: Colors.error },
  needsWorkBadgeText: { fontSize: 12, fontWeight: '600', color: Colors.error },
     sectionContent: { marginTop: 8 },
   sectionGuidance: { color: Colors.textSecondary, marginBottom: 8 },
   entriesPreview: { gap: 4 },
  entryPreview: { padding: 8, backgroundColor: Colors.white, borderRadius: 8, borderWidth: 1, borderColor: Colors.border },
  entryTitle: { color: Colors.text, marginBottom: 4 },
  entrySubtitle: { color: Colors.textSecondary },
  moreEntriesText: { color: Colors.textSecondary, marginTop: 4 },
  emptyState: { marginTop: 10, padding: 12, backgroundColor: Colors.gray[100], borderRadius: 8 },
  emptyStateText: { color: Colors.textSecondary },
  emptyStateSubtext: { color: Colors.textSecondary, marginTop: 4 },
  tipsCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginTop: 16 },
  
     tipsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
   tipsTitle: { fontSize: 20, fontWeight: '700', color: Colors.text },
   tipsSubtitle: { color: Colors.textSecondary, marginTop: 4 },
   tipsList: { marginTop: 16, gap: 12 },
  tipItem: { flexDirection: 'row', alignItems: 'center' },
  tipNumber: { fontSize: 16, fontWeight: '600', color: Colors.primary, marginRight: 8 },
  tipText: { color: Colors.textSecondary },
     // Legacy action button styles (removed duplicates)
   // Additional styles for compatibility
  emptyText: { color: Colors.textSecondary },
  listWrap: { marginTop: 10, gap: 8 },
  itemCard: { padding: 12, backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
  itemHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  itemTitle: { color: Colors.text, flex: 1, marginRight: 12, fontWeight: '600' },
  itemActionsRow: { flexDirection: 'row', gap: 8 },
  iconBtn: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: Colors.gray[100], borderRadius: 8 },
  iconBtnText: { color: Colors.text },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: Colors.gray[100] },
  chipText: { color: Colors.textSecondary, fontSize: 12 },
   deleteButton: { backgroundColor: Colors.error + '20' },
   deleteButtonText: { color: Colors.error },
   entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
   entryActions: { flexDirection: 'row', gap: 8 },
  deleteText: { color: '#b00020' },
  optionChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white },
  optionChipActive: { backgroundColor: '#EEF2FF', borderColor: '#93C5FD' },
  optionChipText: { color: Colors.text },
  optionChipTextActive: { color: '#1D4ED8', fontWeight: '700' },
   switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
   switchLabel: { color: Colors.text },
   // Additional styles for the new layout
   sectionAction: { marginTop: 12 },
   cardOuter: { borderRadius: 16, padding: 1, shadowColor: '#000000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
   card: { backgroundColor: Colors.white, padding: 16, borderRadius: 16 },
   title: { fontSize: 20, fontWeight: '800', color: Colors.text },
   subtitle: { marginTop: 6, color: Colors.textSecondary },
   actionText: { fontSize: 14, color: Colors.textSecondary, marginRight: 8 },
   // Modal styles
   modalContainer: { flex: 1, backgroundColor: Colors.white + '95' }, // Semi-transparent white
   modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.white },
   modalCloseButton: { fontSize: 16, color: Colors.primary, fontWeight: '600' },
   modalTitle: { fontSize: 18, fontWeight: '600', color: Colors.text },
   modalAddButton: { fontSize: 16, color: Colors.primary, fontWeight: '600' },
   modalContent: { flex: 1, padding: 16 },
   modalGuidance: { fontSize: 16, color: Colors.textSecondary, marginBottom: 20, lineHeight: 22 },
   modalEntries: { gap: 12 },
   modalEntry: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: Colors.border },
   modalEntryContent: { flex: 1 },
   modalEntryTitle: { fontSize: 16, fontWeight: '600', color: Colors.text, marginBottom: 4 },
   modalEntrySubtitle: { fontSize: 14, color: Colors.textSecondary },
   modalEntryActions: { flexDirection: 'row', gap: 8 },
   modalEditButton: { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
   modalEditButtonText: { color: Colors.white, fontSize: 14, fontWeight: '600' },
   modalEmptyState: { alignItems: 'center', padding: 40 },
   modalEmptyText: { fontSize: 18, color: Colors.textSecondary, marginBottom: 8 },
   modalEmptySubtext: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
   cardGradient: { borderRadius: 16, padding: 20, shadowColor: '#000000', shadowOpacity: 0.1, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
   sectionIconCompleted: { backgroundColor: Colors.primary + '20', borderColor: Colors.primary + '30' },
   progressIndicator: { marginTop: 16, marginBottom: 12 },
   progressBar: { height: 6, backgroundColor: Colors.gray[200], borderRadius: 3, marginBottom: 8 },
   progressFill: { height: '100%', borderRadius: 3 },
   progressText: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center' },
   actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.gray[100], borderRadius: 12, padding: 12, gap: 8, borderWidth: 1, borderColor: Colors.gray[200] },
   actionButtonCompleted: { backgroundColor: Colors.primary, borderColor: Colors.primary },
   actionButtonCompetitive: { backgroundColor: Colors.success, borderColor: Colors.success },
   actionButtonText: { fontSize: 14, fontWeight: '600', color: Colors.text },
   actionButtonTextCompleted: { color: Colors.white },
   actionButtonTextCompetitive: { color: Colors.white },
   heroSection: { padding: 16, borderRadius: 16, marginBottom: 16 },
   heroGradient: { borderRadius: 16, padding: 16, shadowColor: '#000000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
   heroContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
   heroLeft: { flexDirection: 'column', gap: 8 },
   heroTitle: { fontSize: 24, fontWeight: '800', color: Colors.white },
   heroSubtitle: { color: Colors.white, marginTop: 4 },
   heroIcon: { padding: 12, backgroundColor: Colors.white, borderRadius: 999 },
   progressCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginTop: 16 },
   progressLabel: { color: Colors.textSecondary, marginBottom: 8 },
   progressPercentage: { fontSize: 18, fontWeight: '700', color: Colors.text },
   progressBarContainer: { marginTop: 12, marginBottom: 8 },
   sectionsTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 16 },
   sectionsGrid: { gap: 12 },
   sectionIconContainer: { padding: 12, backgroundColor: Colors.gray[100], borderRadius: 999 },
   sectionIconCompetitive: { backgroundColor: Colors.success + '20', borderColor: Colors.success + '30' },
   sectionIconEffective: { backgroundColor: Colors.secondary + '20', borderColor: Colors.secondary + '30' },
   sectionIconDeveloping: { backgroundColor: Colors.warning + '20', borderColor: Colors.warning + '30' },
   sectionIconNeedsWork: { backgroundColor: Colors.error + '20', borderColor: Colors.error + '30' },
   statusBadgeCompetitive: { backgroundColor: Colors.success, borderColor: Colors.success + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
   statusBadgeEffective: { backgroundColor: Colors.primary, borderColor: Colors.primary + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
   statusBadgeDeveloping: { backgroundColor: Colors.warning, borderColor: Colors.warning + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
   statusBadgeNeedsWork: { backgroundColor: Colors.error, borderColor: Colors.error + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
   sectionArrow: { padding: 12, backgroundColor: Colors.gray[100], borderRadius: 999 },
   // Legacy tip styles removed
   tipsSection: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginTop: 16 },
   statCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, gap: 12 },
   statIcon: { padding: 12, backgroundColor: Colors.gray[100], borderRadius: 999 },
   statNumber: { fontSize: 18, fontWeight: '700', color: Colors.text },
   statLabel: { color: Colors.textSecondary },
   statsContainer: { flexDirection: 'row', gap: 12, marginBottom: 24 },
   sectionCount: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
   tipNumberText: { fontSize: 14, fontWeight: '600', color: Colors.white },
   progressStatus: { fontSize: 18, fontWeight: '700', color: Colors.text },
   statDescription: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
   // New status overview styles
   statusOverview: { backgroundColor: Colors.white, borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
   statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
   statusTitle: { fontSize: 18, fontWeight: '600', color: Colors.text },
   statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
   statusBadgeText: { fontSize: 14, fontWeight: '600' },
   statusProgress: { gap: 8 },
   // Improvement section styles
   improvementSection: { backgroundColor: Colors.white, borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: Colors.border },
   improvementHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
   improvementTitle: { fontSize: 16, fontWeight: '600', color: Colors.text },
   improvementBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
   improvementBadgeText: { fontSize: 12, fontWeight: '600' },
   improvementTips: { gap: 8 },
   improvementTip: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
   improvementTipBullet: { fontSize: 16, color: Colors.primary, fontWeight: '600', marginTop: 2 },
   improvementTipText: { fontSize: 14, color: Colors.textSecondary, flex: 1, lineHeight: 20 },
 });