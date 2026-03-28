import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Calendar, List, Filter, Plus, Clock, MapPin, Users, Star } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { usePracticeTests } from '@/context/PracticeTestsContext';
import Button from '@/components/Button';
import PracticeTestCard from '@/components/PracticeTestCard';
import PracticeTestCalendar from '@/components/PracticeTestCalendar';
import PoliceThemeBackground from '@/components/PoliceThemeBackground';

type ViewMode = 'cards' | 'calendar';
type CalendarViewType = 'month' | 'week' | 'list';

export default function PracticeTestsScreen() {
  const { isAdmin } = useAuth();
  const { 
    practiceTests, 
    isLoading, 
    error, 
    loadPracticeTests 
  } = usePracticeTests();
  
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [calendarViewType, setCalendarViewType] = useState<CalendarViewType>('month');
  const [filterType, setFilterType] = useState<'all' | 'PREP' | 'PIN' | 'Combined'>('all');

  // Memoize filtered tests to prevent unnecessary re-computations
  const filteredTests = useMemo(() => {
    return practiceTests.filter((test: any) => {
      if (filterType === 'all') return true;
      return test.test_type === filterType;
    });
  }, [practiceTests, filterType]);

  const handleTestPress = useCallback((test: any) => {
    Alert.alert(
      test.title,
      `${test.description || 'Practice test session'}\n\nLocation: ${test.location}\nDate: ${new Date(test.start_time).toLocaleDateString()}\nTime: ${new Date(test.start_time).toLocaleTimeString()} - ${new Date(test.end_time).toLocaleTimeString()}\n\nCapacity: ${test.current_registrations}/${test.total_capacity}${test.price > 0 ? `\nPrice: $${test.price.toFixed(2)}` : ''}`,
      [
        { text: 'Close', style: 'cancel' },
        { text: 'View Details', onPress: () => {
          // TODO: Navigate to test details screen
        }}
      ]
    );
  }, []);

  const renderHeader = useCallback(() => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Practice Tests</Text>
          <Text style={styles.subtitle}>
            {filteredTests.length} test{filteredTests.length !== 1 ? 's' : ''} available
          </Text>
        </View>
        
        {isAdmin() && (
          <Button
            title="Create Test"
            onPress={() => {
              // TODO: Navigate to create test screen
              Alert.alert('Coming Soon', 'Admin test creation interface will be available soon.');
            }}
            icon={<Plus size={16} color={Colors.white} />}
            style={styles.createButton}
          />
        )}
      </View>

      {/* View Mode Toggle */}
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.viewButton, viewMode === 'cards' && styles.viewButtonActive]}
          onPress={() => setViewMode('cards')}
        >
          <List size={16} color={viewMode === 'cards' ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.viewButtonText, viewMode === 'cards' && styles.viewButtonTextActive]}>
            Cards
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.viewButton, viewMode === 'calendar' && styles.viewButtonActive]}
          onPress={() => setViewMode('calendar')}
        >
          <Calendar size={16} color={viewMode === 'calendar' ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.viewButtonText, viewMode === 'calendar' && styles.viewButtonTextActive]}>
            Calendar
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter Toggle */}
      <View style={styles.filterToggle}>
        {(['all', 'PREP', 'PIN', 'Combined'] as const).map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.filterButton, filterType === type && styles.filterButtonActive]}
            onPress={() => setFilterType(type)}
          >
            <Text style={[styles.filterButtonText, filterType === type && styles.filterButtonTextActive]}>
              {type === 'all' ? 'All' : type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  ), [filteredTests.length, isAdmin, viewMode, filterType]);

  const renderContent = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading practice tests...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <Button
            title="Retry"
            onPress={loadPracticeTests}
            style={styles.retryButton}
          />
        </View>
      );
    }

    if (filteredTests.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>
            {filterType === 'all' 
              ? 'No practice tests scheduled at the moment.' 
              : `No ${filterType} tests scheduled.`
            }
          </Text>
          <Text style={styles.emptySubtext}>
            Check back later for new sessions or contact us to schedule one.
          </Text>
        </View>
      );
    }

    if (viewMode === 'calendar') {
      return (
        <PracticeTestCalendar
          tests={filteredTests}
          onTestPress={handleTestPress}
          viewType={calendarViewType}
          onViewTypeChange={setCalendarViewType}
        />
      );
    }

    return (
      <ScrollView 
        style={styles.cardsList}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadPracticeTests}
            colors={[Colors.primary]}
          />
        }
      >
        {filteredTests.map((test: any) => (
          <PracticeTestCard
            key={test.id}
            test={test}
            onPress={() => handleTestPress(test)}
          />
        ))}
      </ScrollView>
    );
  }, [isLoading, error, filteredTests, filterType, viewMode, calendarViewType, handleTestPress, loadPracticeTests]);

  return (
    <SafeAreaView style={styles.container}>
      <PoliceThemeBackground>
        <View />
      </PoliceThemeBackground>
      
      {/* <Stack.Screen 
        options={{ 
          title: 'Practice Tests',
          headerShown: false
        }} 
      /> */}
      
      {renderHeader()}
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  createButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  viewToggle: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  viewButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  viewButtonText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  viewButtonTextActive: {
    color: Colors.white,
  },
  filterToggle: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  filterButtonTextActive: {
    color: Colors.white,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  cardsList: {
    flex: 1,
    padding: 16,
  },
});