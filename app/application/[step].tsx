import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  TextInput,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import {
  Clock,
  FileText,
  ExternalLink,
  ChevronRight,
  Edit3,
  Target,
  CheckCircle,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import Button from "@/components/Button";
import ProfileResumeBuilder from "@/components/ProfileResumeBuilder";
import MandatoryRequirementsChecklist from "@/components/MandatoryRequirementsChecklist";
import OACPPracticeHub from "@/components/OACPPracticeHub";
import PoliceServiceSelector from "@/components/PoliceServiceSelector";
import PoliceServiceApplication from "@/components/PoliceServiceApplication";
import PoliceServiceSelectionModal from "@/components/PoliceServiceSelectionModal";
import PREPFitnessTestStep from "@/components/PREPFitnessTestStep";
import LFIStep from "@/components/LFIStep";
import ECIStep from "@/components/ECIStep";
import PoliceThemeBackground from "@/components/PoliceThemeBackground";
import ProfessionalBackground from "@/components/ProfessionalBackground";
import applicationSteps from "@/constants/applicationSteps";
import { useApplication } from "@/context/ApplicationContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export default function ApplicationStepDetailScreen() {
  const { step } = useLocalSearchParams<{ step: string }>();
  const {
    getStepProgress,
    updateStepNotes,
    isSaving,
  } = useApplication();
  
  const [notes, setNotes] = useState("");
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const { user } = useAuth();

  const stepParam = step as string | undefined;
  const isNumericStep = /^\d+$/.test(stepParam ?? '');
  const numericStep = isNumericStep ? parseInt(stepParam!, 10) : null;
  const numericToIdMap: Record<string, string> = {
    '1': 'prerequisites',
    '2': 'pre-application-prep',
    '3': 'oacp',
    '4': 'application',
    '5': 'prep-fitness-test',
    '6': 'lfi-interview',
    '7': 'eci-panel-interview',
    '8': 'background-check',
    '9': 'final-steps',
    'lfi': 'lfi-interview', // Handle special LFI route alias
  };
  const resolvedStepId = numericToIdMap[stepParam!] || stepParam || '';
  const stepData = applicationSteps.find((s) => s.id === resolvedStepId);
  const stepProgress = stepData ? getStepProgress(stepData.id) : undefined;

  React.useEffect(() => {
    if (stepProgress?.notes) {
      setNotes(stepProgress.notes);
    }
  }, [stepProgress?.notes]);

  // Load user's selected police service
  React.useEffect(() => {
    if (user && resolvedStepId === 'application') {
      loadSelectedService();
    }
  }, [user, resolvedStepId]);

  const loadSelectedService = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('application_profile')
        .select('selected_police_service')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading selected service:', error);
      }

      if (data?.selected_police_service) {
        setSelectedServiceId(data.selected_police_service);
      } else {
        // First time user - show modal
        setShowServiceModal(true);
      }
    } catch (error) {
      console.error('Error loading selected service:', error);
      setShowServiceModal(true);
    }
  };

  const handleServiceSelect = async (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setShowServiceModal(false);
    
    // Save to database
    if (user) {
      try {
        const { error } = await supabase
          .from('application_profile')
          .upsert({
            user_id: user.id,
            selected_police_service: serviceId,
          });

        if (error) {
          console.error('Error saving selected service:', error);
        }
      } catch (error) {
        console.error('Error saving selected service:', error);
      }
    }
  };

  if (!stepData) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Application step not found</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  // Early return for custom component steps that handle their own layout
  if (resolvedStepId === 'lfi-interview') {
    return <LFIStep />;
  }

  if (resolvedStepId === 'eci-panel-interview') {
    return <ECIStep />;
  }

  const handleSaveNotes = () => {
    updateStepNotes(stepData.id, notes);
    setIsEditingNotes(false);
  };

  const handleCancelNotes = () => {
    setNotes(stepProgress?.notes || "");
    setIsEditingNotes(false);
  };

  const handleOpenLink = (url: string) => {
    Linking.openURL(url);
  };

  const handleNextStep = (nextStepId: string) => {
    router.push(`/application/${nextStepId}`);
  };

  

  return (
    <View style={styles.container}>
      <ProfessionalBackground variant="fitness">
        <View />
      </ProfessionalBackground>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
      {/* Show header for all steps except application, pre-application-prep, oacp, prerequisites, prep-fitness-test, lfi-interview, and eci-panel-interview */}
      {resolvedStepId !== 'application' && resolvedStepId !== 'pre-application-prep' && resolvedStepId !== 'oacp' && resolvedStepId !== 'prerequisites' && resolvedStepId !== 'prep-fitness-test' && resolvedStepId !== 'lfi-interview' && resolvedStepId !== 'eci-panel-interview' && (
        <>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>{stepData.title}</Text>
              </View>
              <View style={styles.timeContainer}>
                <Clock size={16} color={Colors.textSecondary} />
                <Text style={styles.timeText}>{stepData.estimatedTime}</Text>
              </View>
            </View>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>{stepData.description}</Text>
          </View>
        </>
      )}

      {(resolvedStepId === 'pre-application-prep' || numericStep === 2) && (
        <ProfileResumeBuilder />
      )}

      {resolvedStepId === 'prerequisites' && (
        <MandatoryRequirementsChecklist />
      )}

      {resolvedStepId === 'oacp' && (
        <>
          <OACPPracticeHub />

          {/* OACP Requirements Section */}
          <View style={styles.oacpRequirementsContainer}>
            <Text style={styles.oacpSectionTitle}>Certificate Requirements</Text>
            <View style={styles.oacpRequirementsList}>
              <View style={styles.oacpRequirementItem}>
                <View style={styles.oacpRequirementIcon}>
                  <CheckCircle size={20} color={Colors.success} />
                </View>
                <View style={styles.oacpRequirementContent}>
                  <Text style={styles.oacpRequirementTitle}>Written Test</Text>
                  <Text style={styles.oacpRequirementDesc}>50 multiple-choice questions covering various topics</Text>
                </View>
              </View>
              <View style={styles.oacpRequirementItem}>
                <View style={styles.oacpRequirementIcon}>
                  <CheckCircle size={20} color={Colors.success} />
                </View>
                <View style={styles.oacpRequirementContent}>
                  <Text style={styles.oacpRequirementTitle}>Physical Test</Text>
                  <Text style={styles.oacpRequirementDesc}>Physical fitness assessment and evaluation</Text>
                </View>
              </View>
              <View style={styles.oacpRequirementItem}>
                <View style={styles.oacpRequirementIcon}>
                  <CheckCircle size={20} color={Colors.success} />
                </View>
                <View style={styles.oacpRequirementContent}>
                  <Text style={styles.oacpRequirementTitle}>Documentation</Text>
                  <Text style={styles.oacpRequirementDesc}>Submit required forms and identification</Text>
                </View>
              </View>
              <View style={styles.oacpRequirementItem}>
                <View style={styles.oacpRequirementIcon}>
                  <CheckCircle size={20} color={Colors.success} />
                </View>
                <View style={styles.oacpRequirementContent}>
                  <Text style={styles.oacpRequirementTitle}>Application Fee</Text>
                  <Text style={styles.oacpRequirementDesc}>Pay the required application processing fee</Text>
                </View>
              </View>
            </View>
          </View>

          {/* OACP Tips Section */}
          <View style={styles.oacpTipsContainer}>
            <Text style={styles.oacpSectionTitle}>Success Tips</Text>
            <View style={styles.oacpTipsList}>
              <View style={styles.oacpTipItem}>
                <View style={styles.oacpTipNumber}>
                  <Text style={styles.oacpTipNumberText}>1</Text>
                </View>
                <Text style={styles.oacpTipText}>Apply for the OACP Certificate well in advance - processing can take several months</Text>
              </View>
              <View style={styles.oacpTipItem}>
                <View style={styles.oacpTipNumber}>
                  <Text style={styles.oacpTipNumberText}>2</Text>
                </View>
                <Text style={styles.oacpTipText}>Practice regularly with our sample tests to familiarize yourself with the question format</Text>
              </View>
              <View style={styles.oacpTipItem}>
                <View style={styles.oacpTipNumber}>
                  <Text style={styles.oacpTipNumberText}>3</Text>
                </View>
                <Text style={styles.oacpTipText}>Focus on time management - you have 60 minutes for 50 questions</Text>
              </View>
              <View style={styles.oacpTipItem}>
                <View style={styles.oacpTipNumber}>
                  <Text style={styles.oacpTipNumberText}>4</Text>
                </View>
                <Text style={styles.oacpTipText}>Keep all documentation organized and ready for submission</Text>
              </View>
            </View>
          </View>

        </>
      )}

      {resolvedStepId === 'prep-fitness-test' && (
        <PREPFitnessTestStep />
      )}

      {resolvedStepId === 'application' && selectedServiceId && (
        <PoliceServiceApplication 
          serviceId={selectedServiceId} 
          onServiceChange={() => setShowServiceModal(true)}
        />
      )}

      {resolvedStepId === 'application' && !selectedServiceId && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading application information...</Text>
        </View>
      )}

      {!(resolvedStepId === 'pre-application-prep' || numericStep === 2) && stepData.id !== 'pre-application-prep' && stepData.id !== 'prerequisites' && stepData.id !== 'oacp' && stepData.id !== 'application' && stepData.id !== 'prep-fitness-test' && stepData.id !== 'lfi-interview' && stepData.id !== 'eci-panel-interview' && (
        <View style={styles.requirementsContainer}>
          <Text style={styles.sectionTitle}>Requirements</Text>
          {stepData.requirements.map((requirement, index) => (
            <View key={index} style={styles.requirementItem}>
              <Text style={styles.requirementText}>{requirement}</Text>
            </View>
          ))}
        </View>
      )}

      {!(resolvedStepId === 'pre-application-prep' || numericStep === 2) && stepData.id !== 'pre-application-prep' && stepData.id !== 'prerequisites' && stepData.id !== 'oacp' && stepData.id !== 'application' && stepData.id !== 'prep-fitness-test' && stepData.id !== 'lfi-interview' && stepData.id !== 'eci-panel-interview' && (
        <View style={styles.tipsContainer}>
          <Text style={styles.sectionTitle}>Tips</Text>
          {stepData.tips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <View style={styles.tipBullet}>
                <Text style={styles.tipBulletText}>{index + 1}</Text>
              </View>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      )}

      {!(resolvedStepId === 'pre-application-prep' || numericStep === 2) && stepData.id !== 'pre-application-prep' && stepData.id !== 'prerequisites' && stepData.id !== 'oacp' && stepData.id !== 'application' && stepData.id !== 'prep-fitness-test' && stepData.id !== 'lfi-interview' && stepData.id !== 'eci-panel-interview' && stepData.resources.length > 0 && (
        <View style={styles.resourcesContainer}>
          <Text style={styles.sectionTitle}>Resources</Text>
          {stepData.resources.map((resource, index) => (
            <TouchableOpacity
              key={index}
              style={styles.resourceItem}
              onPress={() => handleOpenLink(resource.url)}
            >
              <FileText size={20} color={Colors.primary} />
              <Text style={styles.resourceText}>{resource.title}</Text>
              <ExternalLink size={16} color={Colors.primary} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Monthly Step Test Entry (hidden for pre-application-prep, application, and lfi-interview) */}
      {!(resolvedStepId === 'pre-application-prep' || numericStep === 2) && stepData.id !== 'pre-application-prep' && stepData.id !== 'prerequisites' && stepData.id !== 'oacp' && stepData.id !== 'application' && stepData.id !== 'prep-fitness-test' && stepData.id !== 'lfi-interview' && stepData.id !== 'eci-panel-interview' && (
        <View style={styles.testCardContainer}>
          <View style={styles.testCardHeader}>
            <Text style={styles.sectionTitle}>Monthly Step Test</Text>
          </View>
          <View style={styles.testCardBody}>
            <Text style={styles.testDescription}>
              50 questions. Questions rotate monthly. Pass mark 80%.
            </Text>
            <Button
              title="Start Test"
              onPress={() => router.push(`/application/${stepData.id}/test`)}
              style={styles.testButton}
            />
            {(stepData.id === 'prerequisites' || stepData.id === 'oacp') && (
              <Button
                title="Daily 5-Question Quiz"
                onPress={() => router.push(`/application/${stepData.id}/quiz`)}
                variant="outline"
                style={{ marginTop: 8, alignSelf: 'flex-start' }}
              />
            )}
          </View>
        </View>
      )}



      {/* Police Service Selection Modal */}
      <PoliceServiceSelectionModal
        visible={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        onServiceSelect={handleServiceSelect}
        onNavigateToApplication={() => {
          setShowServiceModal(false);
          router.push('/(tabs)/application');
        }}
      />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  notFoundText: {
    fontSize: 18,
    marginBottom: 20,
    color: Colors.text,
  },
  header: {
    padding: 16,
    backgroundColor: Colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.white,
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.white,
  },
  descriptionContainer: {
    padding: 16,
    backgroundColor: Colors.white,
    marginTop: 16,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  requirementsContainer: {
    padding: 16,
    backgroundColor: Colors.white,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  requirementText: {
    flex: 1,
    fontSize: 16,
    color: Colors.textSecondary,
    marginLeft: 12,
    lineHeight: 22,
  },
  tipsContainer: {
    padding: 16,
    backgroundColor: Colors.white,
    marginTop: 16,
  },
  tipItem: {
    flexDirection: "row",
    marginBottom: 12,
  },
  tipBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  tipBulletText: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.primary,
  },
  tipText: {
    flex: 1,
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  resourcesContainer: {
    padding: 16,
    backgroundColor: Colors.white,
    marginTop: 16,
  },
  testCardContainer: {
    padding: 16,
    backgroundColor: Colors.white,
    marginTop: 16,
  },
  testCardHeader: {
    marginBottom: 8,
  },
  testCardBody: {
    gap: 12,
  },
  testDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  testButton: {
    alignSelf: 'flex-start',
  },
  resourceItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.gray[100],
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  resourceText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  nextStepsContainer: {
    padding: 16,
    backgroundColor: Colors.white,
    marginTop: 16,
  },
  nextStepItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  nextStepContent: {
    flex: 1,
    marginRight: 8,
  },
  nextStepTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  nextStepDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  titleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  notesContainer: {
    padding: 16,
    backgroundColor: Colors.white,
    marginTop: 16,
  },
  notesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  editButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  notesEditContainer: {
    gap: 12,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    minHeight: 100,
  },
  notesActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  notesActionButton: {
    minWidth: 80,
  },
  notesDisplay: {
    minHeight: 60,
    padding: 12,
    backgroundColor: Colors.gray[100],
    borderRadius: 8,
  },
  notesText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 22,
  },
  notesPlaceholder: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontStyle: "italic",
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },

  oacpRequirementsContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  oacpSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  oacpRequirementsList: {
    gap: 16,
  },
  oacpRequirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  oacpRequirementIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  oacpRequirementContent: {
    flex: 1,
  },
  oacpRequirementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  oacpRequirementDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  oacpTipsContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  oacpTipsList: {
    gap: 16,
  },
  oacpTipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  oacpTipNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  oacpTipNumberText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  oacpTipText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  oacpResourcesContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  oacpResourcesList: {
    gap: 12,
  },
  oacpResourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
  },
  oacpResourceContent: {
    flex: 1,
    marginLeft: 12,
  },
  oacpResourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  oacpResourceDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});