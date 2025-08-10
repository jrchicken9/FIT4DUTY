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
  CheckCircle,
  Circle,
  Edit3,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import Button from "@/components/Button";
import applicationSteps from "@/constants/applicationSteps";
import { useApplication } from "@/context/ApplicationContext";

export default function ApplicationStepDetailScreen() {
  const { step } = useLocalSearchParams<{ step: string }>();
  const {
    getStepProgress,
    markStepCompleted,
    markStepIncomplete,
    updateStepNotes,
    isSaving,
  } = useApplication();
  
  const [notes, setNotes] = useState("");
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const stepData = applicationSteps.find((s) => s.id === step);
  const stepProgress = stepData ? getStepProgress(stepData.id) : undefined;

  React.useEffect(() => {
    if (stepProgress?.notes) {
      setNotes(stepProgress.notes);
    }
  }, [stepProgress?.notes]);

  if (!stepData) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Application step not found</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  const handleMarkCompleted = () => {
    markStepCompleted(stepData.id, notes || undefined);
  };

  const handleMarkIncomplete = () => {
    markStepIncomplete(stepData.id);
  };

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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{stepData.title}</Text>
            {stepProgress?.completed ? (
              <CheckCircle size={24} color={Colors.success} />
            ) : (
              <Circle size={24} color={Colors.gray[400]} />
            )}
          </View>
          <View style={styles.timeContainer}>
            <Clock size={16} color={Colors.textSecondary} />
            <Text style={styles.timeText}>{stepData.estimatedTime}</Text>
          </View>
        </View>
        
        <View style={styles.actionButtons}>
          {!stepProgress?.completed ? (
            <Button
              title={isSaving ? "Saving..." : "Mark as Completed"}
              onPress={handleMarkCompleted}
              size="small"
              disabled={isSaving}
            />
          ) : (
            <Button
              title={isSaving ? "Saving..." : "Mark as Incomplete"}
              onPress={handleMarkIncomplete}
              variant="outline"
              size="small"
              disabled={isSaving}
            />
          )}
        </View>
      </View>

      <View style={styles.descriptionContainer}>
        <Text style={styles.description}>{stepData.description}</Text>
      </View>

      <View style={styles.requirementsContainer}>
        <Text style={styles.sectionTitle}>Requirements</Text>
        {stepData.requirements.map((requirement, index) => (
          <View key={index} style={styles.requirementItem}>
            <CheckCircle size={20} color={Colors.primary} />
            <Text style={styles.requirementText}>{requirement}</Text>
          </View>
        ))}
      </View>

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

      {stepData.resources.length > 0 && (
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

      {stepData.nextSteps.length > 0 && (
        <View style={styles.nextStepsContainer}>
          <Text style={styles.sectionTitle}>Next Steps</Text>
          {stepData.nextSteps.map((nextStepId) => {
            const nextStep = applicationSteps.find((s) => s.id === nextStepId);
            if (!nextStep) return null;
            
            return (
              <TouchableOpacity
                key={nextStepId}
                style={styles.nextStepItem}
                onPress={() => handleNextStep(nextStepId)}
              >
                <View style={styles.nextStepContent}>
                  <Text style={styles.nextStepTitle}>{nextStep.title}</Text>
                  <Text style={styles.nextStepDescription} numberOfLines={2}>
                    {nextStep.description}
                  </Text>
                </View>
                <ChevronRight size={20} color={Colors.primary} />
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Notes Section */}
      <View style={styles.notesContainer}>
        <View style={styles.notesHeader}>
          <Text style={styles.sectionTitle}>Notes</Text>
          {!isEditingNotes && (
            <TouchableOpacity
              onPress={() => setIsEditingNotes(true)}
              style={styles.editButton}
            >
              <Edit3 size={16} color={Colors.primary} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {isEditingNotes ? (
          <View style={styles.notesEditContainer}>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add your notes about this step..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View style={styles.notesActions}>
              <Button
                title="Cancel"
                onPress={handleCancelNotes}
                variant="outline"
                size="small"
                style={styles.notesActionButton}
              />
              <Button
                title={isSaving ? "Saving..." : "Save"}
                onPress={handleSaveNotes}
                size="small"
                style={styles.notesActionButton}
                disabled={isSaving}
              />
            </View>
          </View>
        ) : (
          <View style={styles.notesDisplay}>
            {notes ? (
              <Text style={styles.notesText}>{notes}</Text>
            ) : (
              <Text style={styles.notesPlaceholder}>
                No notes added yet. Tap Edit to add notes about your progress.
              </Text>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.textSecondary,
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
  actionButtons: {
    marginTop: 12,
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
});