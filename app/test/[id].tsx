import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import {
  Shield,
  Clock,
  Target,
  Play,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Trophy,
  Activity,
  Timer,
  Ruler,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import policeTests from '@/constants/policeTests';
// import { useUser } from '@/context/UserContext'; // Removed - not available

export default function TestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // Mock functions for now
  const logWorkout = () => {};
  const updateFitnessProgress = () => {};
  const fitnessProgress = { 
    beepTestLevel: 5.2,
    prepCircuitScore: 85,
    pinTestScore: 92,
    pushUpsMax: 25
  };
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  
  const test = policeTests.find(t => t.id === id);
  
  if (!test) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Test Not Found' }} />
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color={Colors.error} />
          <Text style={styles.errorTitle}>Test Not Found</Text>
          <Text style={styles.errorText}>The requested test could not be found.</Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            style={styles.errorButton}
          />
        </View>
      </View>
    );
  }

  const handleStartTest = () => {
    if (test.type === 'SHUTTLE_RUN') {
      router.push('/workout/shuttle-run');
    } else {
      Alert.alert(
        'Start Test',
        `Ready to begin the ${test.title}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Start',
            onPress: () => {
              // For now, just show a placeholder
              Alert.alert('Test Started', 'This test interface is coming soon!');
            },
          },
        ]
      );
    }
  };

  const getUserScore = () => {
    switch (test.type) {
      case 'SHUTTLE_RUN':
        return fitnessProgress.beepTestLevel;
      case 'PREP_CIRCUIT':
        return fitnessProgress.prepCircuitScore;
      case 'PIN':
        return fitnessProgress.pinTestScore;
      case 'PUSH_UPS':
        return fitnessProgress.pushUpsMax;
      default:
        return undefined;
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score || !test.passingScore) return Colors.textSecondary;
    if (score >= test.passingScore) return Colors.success;
    return Colors.error;
  };

  const getScoreStatus = (score?: number) => {
    if (!score || !test.passingScore) return 'Not attempted';
    if (score >= test.passingScore) return 'Passed';
    return 'Needs improvement';
  };

  const formatScore = (score?: number) => {
    if (!score) return 'N/A';
    return `${score}${test.unit ? ` ${test.unit}` : ''}`;
  };

  const userScore = getUserScore();

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: test.title,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.primary} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.imageContainer}>
            {test.imageUrl ? (
              <Image source={{ uri: test.imageUrl }} style={styles.headerImage} />
            ) : (
              <View style={[styles.headerImage, styles.placeholderImage]}>
                <Shield size={48} color={Colors.primary} />
              </View>
            )}
            <View style={styles.typeIndicator}>
              <Text style={styles.typeText}>{test.type.replace('_', ' ')}</Text>
            </View>
          </View>
          
          <View style={styles.headerContent}>
            <Text style={styles.title}>{test.title}</Text>
            <Text style={styles.description}>{test.description}</Text>
            
            <View style={styles.testInfo}>
              <View style={styles.infoItem}>
                <Clock size={16} color={Colors.textSecondary} />
                <Text style={styles.infoText}>{test.duration} minutes</Text>
              </View>
              <View style={styles.infoItem}>
                <Target size={16} color={Colors.textSecondary} />
                <Text style={styles.infoText}>
                  {test.components.length} component{test.components.length !== 1 ? 's' : ''}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Trophy size={16} color={Colors.textSecondary} />
                <Text style={styles.infoText}>Passing: {formatScore(test.passingScore)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Current Score */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreCardTitle}>Your Current Performance</Text>
          <View style={styles.scoreRow}>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Best Score</Text>
              <Text style={[styles.scoreValue, { color: getScoreColor(userScore) }]}>
                {formatScore(userScore)}
              </Text>
              <Text style={[styles.scoreStatus, { color: getScoreColor(userScore) }]}>
                {getScoreStatus(userScore)}
              </Text>
            </View>
            
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Target Score</Text>
              <Text style={styles.scoreValue}>
                {formatScore(test.passingScore)}
              </Text>
              <Text style={styles.scoreStatus}>Required</Text>
            </View>
            
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Max Score</Text>
              <Text style={styles.scoreValue}>
                {formatScore(test.maxScore)}
              </Text>
              <Text style={styles.scoreStatus}>Excellent</Text>
            </View>
          </View>
        </View>

        {/* Test Components */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Components</Text>
          {test.components.map((component, index) => (
            <TouchableOpacity
              key={component.id}
              style={[
                styles.componentCard,
                selectedComponent === component.id && styles.selectedComponent,
              ]}
              onPress={() => setSelectedComponent(
                selectedComponent === component.id ? null : component.id
              )}
            >
              <View style={styles.componentHeader}>
                <View style={styles.componentIcon}>
                  {component.name.toLowerCase().includes('shuttle') && <Activity size={20} color={Colors.primary} />}
                  {component.name.toLowerCase().includes('push') && <Target size={20} color={Colors.primary} />}
                  {component.name.toLowerCase().includes('sit') && <Ruler size={20} color={Colors.primary} />}
                  {component.name.toLowerCase().includes('run') && <Timer size={20} color={Colors.primary} />}
                  {component.name.toLowerCase().includes('core') && <Shield size={20} color={Colors.primary} />}
                  {component.name.toLowerCase().includes('back') && <Activity size={20} color={Colors.primary} />}
                  {!component.name.toLowerCase().match(/(shuttle|push|sit|run|core|back)/) && <Target size={20} color={Colors.primary} />}
                </View>
                <View style={styles.componentContent}>
                  <Text style={styles.componentName}>{component.name}</Text>
                  <Text style={styles.componentDescription}>{component.description}</Text>
                  {component.duration && (
                    <Text style={styles.componentDuration}>{component.duration} min</Text>
                  )}
                </View>
                <View style={styles.componentNumber}>
                  <Text style={styles.componentNumberText}>{index + 1}</Text>
                </View>
              </View>
              
              {selectedComponent === component.id && (
                <View style={styles.componentDetails}>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailTitle}>Instructions</Text>
                    {component.instructions.map((instruction, idx) => (
                      <View key={idx} style={styles.instructionItem}>
                        <View style={styles.bullet} />
                        <Text style={styles.instructionText}>{instruction}</Text>
                      </View>
                    ))}
                  </View>
                  
                  <View style={styles.detailSection}>
                    <Text style={styles.detailTitle}>Scoring Criteria</Text>
                    {component.scoringCriteria.map((criteria, idx) => (
                      <View key={idx} style={styles.instructionItem}>
                        <CheckCircle size={12} color={Colors.success} />
                        <Text style={styles.criteriaText}>{criteria}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Tips Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preparation Tips</Text>
          <View style={styles.tipsCard}>
            <View style={styles.tipItem}>
              <CheckCircle size={16} color={Colors.success} />
              <Text style={styles.tipText}>Practice regularly to build endurance and familiarity</Text>
            </View>
            <View style={styles.tipItem}>
              <CheckCircle size={16} color={Colors.success} />
              <Text style={styles.tipText}>Focus on proper form over speed initially</Text>
            </View>
            <View style={styles.tipItem}>
              <CheckCircle size={16} color={Colors.success} />
              <Text style={styles.tipText}>Get adequate rest before test day</Text>
            </View>
            <View style={styles.tipItem}>
              <CheckCircle size={16} color={Colors.success} />
              <Text style={styles.tipText}>Stay hydrated and eat a light meal 2-3 hours before</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Start Test Button */}
      <View style={styles.bottomContainer}>
        <Button
          title={userScore && userScore >= (test.passingScore || 0) ? 'Retake Test' : 'Start Test'}
          onPress={handleStartTest}
          style={styles.startButton}
          icon={<Play size={20} color={Colors.white} />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButton: {
    minWidth: 120,
  },
  header: {
    backgroundColor: Colors.white,
    padding: 20,
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerImage: {
    width: 120,
    height: 120,
    borderRadius: 16,
  },
  placeholderImage: {
    backgroundColor: Colors.gray['100'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeIndicator: {
    position: 'absolute',
    bottom: -8,
    left: 0,
    right: 0,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  testInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  scoreCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scoreCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scoreItem: {
    alignItems: 'center',
    flex: 1,
  },
  scoreLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 2,
  },
  scoreStatus: {
    fontSize: 10,
    fontWeight: '500',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  componentCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  selectedComponent: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  componentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  componentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  componentContent: {
    flex: 1,
  },
  componentName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  componentDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  componentDuration: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
    marginTop: 4,
  },
  componentNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.gray['200'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  componentNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textSecondary,
  },
  componentDetails: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: 16,
    paddingTop: 16,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    marginTop: 6,
    marginRight: 8,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  criteriaText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginLeft: 8,
  },
  tipsCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginLeft: 8,
  },
  bottomContainer: {
    padding: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  startButton: {
    minHeight: 56,
  },
});