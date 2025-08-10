import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { usePinTest } from '@/context/PinTestContext';
import Colors from '@/constants/colors';
import { Target, Clock, Activity, TrendingUp, AlertCircle } from 'lucide-react-native';
import PinTestTooltip from './PinTestTooltip';

export default function PinTestWidget() {
  const { testResults, getLatestResult, formatTime, checkProfileCompletion, hasSuccessfulScore, getHighestScore } = usePinTest();
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const latestResult = getLatestResult();
  const { isComplete } = checkProfileCompletion();
  const hasSuccess = hasSuccessfulScore();
  const { result: highestResult, score: highestScore } = getHighestScore();

  const handlePress = () => {
    if (!isComplete) {
      router.push('/profile-completion');
    } else {
      router.push('/pin-test');
    }
  };

  const handleViewResults = () => {
    router.push('/pin-test/results');
  };

  if (!isComplete) {
    return (
      <TouchableOpacity style={styles.container} onPress={handlePress} testID="pin-test-widget">
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Target size={24} color={Colors.primary} />
            <Text style={styles.title}>Ontario PIN Test</Text>
          </View>
          <AlertCircle size={20} color={Colors.warning} />
        </View>
        
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            Complete your profile (age & gender) to access PIN Test
          </Text>
        </View>
        
        <Text style={styles.actionText}>Tap to complete profile</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, hasSuccess && styles.successContainer]} testID="pin-test-widget">
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Target size={24} color={Colors.primary} />
          <Text style={styles.title}>Ontario PIN Test</Text>
          {hasSuccess && (
            <View style={styles.successIndicator}>
              <Text style={styles.successText}>✓</Text>
            </View>
          )}
          <TouchableOpacity 
            style={styles.policeOfficerButton}
            onPress={() => setTooltipVisible(true)}
            testID="police-officer-tooltip"
          >
            <View style={styles.policeOfficerSilhouette}>
              <View style={styles.officerHead} />
              <View style={styles.officerBody} />
              <View style={styles.officerBadge} />
            </View>
          </TouchableOpacity>
        </View>
        <View style={[styles.badge, hasSuccess && styles.successBadge]}>
          <Text style={styles.badgeText}>{testResults.length}</Text>
        </View>
      </View>

      {latestResult ? (
        <View style={styles.content}>
          <View style={styles.resultsHeader}>
            <Text style={styles.subtitle}>Latest Results</Text>
            {highestResult && highestScore > 0 && (
              <View style={styles.highestScoreContainer}>
                <Text style={styles.highestScoreLabel}>Best:</Text>
                <Text style={[styles.highestScoreValue, highestScore >= 80 && styles.passingScore]}>
                  {highestScore}/100
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.resultsGrid}>
            <View style={styles.resultItem}>
              <Clock size={16} color={Colors.primary} />
              <Text style={styles.resultLabel}>1.5 Mile</Text>
              <Text style={styles.resultValue}>
                {formatTime(latestResult.mile_run_minutes, latestResult.mile_run_seconds)}
              </Text>
            </View>
            
            <View style={styles.resultItem}>
              <Activity size={16} color={Colors.primary} />
              <Text style={styles.resultLabel}>Push-ups</Text>
              <Text style={styles.resultValue}>
                {latestResult.pushups_count !== null ? `${latestResult.pushups_count}` : '--'}
              </Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={handlePress}
              testID="take-test-button"
            >
              <Text style={styles.primaryButtonText}>Take New Test</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={handleViewResults}
              testID="view-results-button"
            >
              <TrendingUp size={16} color={Colors.primary} />
              <Text style={styles.secondaryButtonText}>View All</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={styles.subtitle}>Track your PIN test performance</Text>
          <Text style={styles.description}>
            Record results for 1.5 mile run, push-ups, core endurance, and sit & reach
          </Text>
          
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={handlePress}
            testID="first-test-button"
          >
            <Text style={styles.primaryButtonText}>Take Your First Test</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <PinTestTooltip 
        visible={tooltipVisible} 
        onClose={() => setTooltipVisible(false)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
  },
  badge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.white,
  },
  warningContainer: {
    backgroundColor: Colors.warning + '20',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  warningText: {
    fontSize: 14,
    color: Colors.warning,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  resultsGrid: {
    flexDirection: 'row',
    marginBottom: 16,
    marginHorizontal: -8,
  },
  resultItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  resultLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: 2,
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
    textAlign: 'center',
  },
  successContainer: {
    borderWidth: 2,
    borderColor: '#10B981',
    backgroundColor: '#10B981' + '05',
  },
  successIndicator: {
    backgroundColor: '#10B981',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  successText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.white,
  },
  successBadge: {
    backgroundColor: '#10B981',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  highestScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  highestScoreLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginRight: 4,
  },
  highestScoreValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  passingScore: {
    color: '#10B981',
  },
  policeOfficerButton: {
    marginLeft: 8,
    padding: 4,
  },
  policeOfficerSilhouette: {
    width: 20,
    height: 24,
    alignItems: 'center',
    position: 'relative',
  },
  officerHead: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginBottom: 1,
  },
  officerBody: {
    width: 12,
    height: 14,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    position: 'relative',
  },
  officerBadge: {
    position: 'absolute',
    top: 10,
    left: 6,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.white,
  },
});