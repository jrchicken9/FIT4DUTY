import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { usePinTest, PinTestResult } from '@/context/PinTestContext';
import Button from '@/components/Button';
import Colors from '@/constants/colors';
import { Calendar, Clock, Activity, Target, Ruler, Trash2, Home, Award } from 'lucide-react-native';

function ResultCard({ result, onDelete }: { result: PinTestResult; onDelete: (id: string) => void }) {
  const { formatTime, calculateScoreForResult } = usePinTest();
  
  const scoreResult = calculateScoreForResult(result);
  
  const handleDelete = () => {
    Alert.alert(
      'Delete Result',
      'Are you sure you want to delete this test result?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => onDelete(result.id)
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.resultCard}>
      <View style={styles.resultHeader}>
        <View style={styles.dateContainer}>
          <Calendar size={16} color={Colors.textSecondary} />
          <Text style={styles.dateText}>{formatDate(result.test_date)}</Text>
        </View>
        <Button
          title=""
          onPress={handleDelete}
          variant="outline"
          style={styles.deleteButton}
          icon={<Trash2 size={16} color={Colors.error} />}
          testId={`delete-result-${result.id}`}
        />
      </View>

      <View style={styles.resultGrid}>
        <View style={styles.resultItem}>
          <View style={styles.resultItemHeader}>
            <Clock size={18} color={Colors.primary} />
            <Text style={styles.resultItemTitle}>1.5 Mile Run</Text>
          </View>
          <Text style={styles.resultValue}>
            {formatTime(result.mile_run_minutes, result.mile_run_seconds)}
          </Text>
        </View>

        <View style={styles.resultItem}>
          <View style={styles.resultItemHeader}>
            <Activity size={18} color={Colors.primary} />
            <Text style={styles.resultItemTitle}>Push-ups</Text>
          </View>
          <Text style={styles.resultValue}>
            {result.pushups_count !== null ? `${result.pushups_count} reps` : 'Not recorded'}
          </Text>
        </View>

        <View style={styles.resultItem}>
          <View style={styles.resultItemHeader}>
            <Target size={18} color={Colors.primary} />
            <Text style={styles.resultItemTitle}>Core Endurance</Text>
          </View>
          <Text style={styles.resultValue}>
            {formatTime(result.core_endurance_minutes, result.core_endurance_seconds)}
          </Text>
        </View>

        <View style={styles.resultItem}>
          <View style={styles.resultItemHeader}>
            <Ruler size={18} color={Colors.primary} />
            <Text style={styles.resultItemTitle}>Sit & Reach</Text>
          </View>
          <Text style={styles.resultValue}>
            {result.sit_reach_distance !== null ? `${result.sit_reach_distance} cm` : 'Not recorded'}
          </Text>
        </View>
      </View>

      {result.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Notes:</Text>
          <Text style={styles.notesText}>{result.notes}</Text>
        </View>
      )}

      {(result.overall_score !== null || scoreResult) && (
        <View style={styles.scoreSection}>
          <View style={styles.scoreSectionHeader}>
            <Award size={18} color={Colors.primary} />
            <Text style={styles.scoreSectionTitle}>Test Scores</Text>
          </View>
          
          {scoreResult && (
            <View style={styles.componentScores}>
              {scoreResult.componentScores.map((component, index) => (
                <View key={index} style={styles.componentScore}>
                  <Text style={styles.componentName}>{component.component}</Text>
                  <Text style={styles.componentScoreText}>
                    {component.score}/{component.maxScore}
                  </Text>
                </View>
              ))}
            </View>
          )}
          
          <View style={styles.totalScoreContainer}>
            <Text style={styles.scoreLabel}>Total Score:</Text>
            <Text style={styles.scoreValue}>
              {result.overall_score || scoreResult?.totalScore || 0}/100
            </Text>
            {(result.pass_status !== null || scoreResult?.passStatus !== undefined) && (
              <View style={[
                styles.statusBadge,
                { backgroundColor: (result.pass_status ?? scoreResult?.passStatus) ? Colors.success : Colors.error }
              ]}>
                <Text style={styles.statusText}>
                  {(result.pass_status ?? scoreResult?.passStatus) ? 'PASS' : 'FAIL'}
                </Text>
              </View>
            )}
          </View>
          
          {scoreResult && (
            <Text style={styles.passingScoreNote}>
              Passing score: {scoreResult.passingScore}/100
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

export default function PinTestResultsScreen() {
  const { testResults, isLoading, deleteTestResult, loadTestResults } = usePinTest();

  const handleDelete = async (resultId: string) => {
    await deleteTestResult(resultId);
  };

  const handleRefresh = async () => {
    await loadTestResults();
  };

  const handleReturnToFitness = () => {
    router.replace('/(tabs)/fitness');
  };



  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: "PIN Test Results",
          gestureEnabled: false,
          headerLeft: () => null,
        }} 
      />
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>PIN Test Results</Text>
          <Text style={styles.subtitle}>
            Track your Ontario Police PIN Test progress over time
          </Text>
        </View>

        <View style={styles.actionContainer}>
          <Button
            title="Return to Fitness"
            onPress={handleReturnToFitness}
            icon={<Home size={20} color={Colors.white} />}
            testId="return-to-fitness-button"
          />
        </View>

        {testResults.length === 0 ? (
          <View style={styles.emptyState}>
            <Target size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>No Test Results Yet</Text>
            <Text style={styles.emptyDescription}>
              Your PIN test results will appear here once you complete a test
            </Text>
          </View>
        ) : (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsHeader}>
              {testResults.length} Test Result{testResults.length !== 1 ? 's' : ''}
            </Text>
            
            {testResults.map((result) => (
              <ResultCard
                key={result.id}
                result={result}
                onDelete={handleDelete}
              />
            ))}
          </View>
        )}

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>About PIN Test Scoring</Text>
          <Text style={styles.infoText}>
            The Ontario Police PIN Test uses age and gender-specific scoring tables. Your scores are calculated based on:
            {"\n"}• 1.5 Mile Run: Up to 50 points
            {"\n"}• Push-ups: Up to 20 points
            {"\n"}• Core Endurance: Up to 20 points
            {"\n"}• Sit and Reach: Up to 10 points
            {"\n\n"}A total score of 75/100 or higher is typically required to pass.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  actionContainer: {
    marginBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    minWidth: 200,
  },
  resultsContainer: {
    marginBottom: 24,
  },
  resultsHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  deleteButton: {
    minWidth: 40,
    height: 40,
    borderRadius: 20,
    borderColor: Colors.error,
  },
  resultGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  resultItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  resultItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  resultItemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginLeft: 6,
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  notesContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  scoreSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  scoreSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 6,
  },
  componentScores: {
    marginBottom: 12,
  },
  componentScore: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  componentName: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  componentScoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  totalScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  passingScoreNote: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.white,
  },
  infoContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 40,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});