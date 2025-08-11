import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Filter, Plus } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { usePracticeTests } from '@/context/PracticeTestsContext';
import { useAuth } from '@/context/AuthContext';
import PracticeTestCard from '@/components/PracticeTestCard';
import PracticeTestCalendar from '@/components/PracticeTestCalendar';
import Button from '@/components/Button';

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

  const filteredTests = practiceTests.filter(test => {
    if (filterType === 'all') return true;
    return test.test_type === filterType;
  });

  const handleTestPress = (test: any) => {
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
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.title}>Practice Tests</Text>
        {isAdmin() && (
          <Button
            title="Add Test"
            onPress={() => {
              // TODO: Navigate to add test screen
              Alert.alert('Coming Soon', 'Admin test creation interface will be available soon.');
            }}
            style={styles.addButton}
            icon={<Plus size={16} color={Colors.white} />}
          />
        )}
      </View>
      
      <Text style={styles.subtitle}>
        Book in-person practice sessions for PREP and PIN tests
      </Text>

      <View style={styles.controls}>
        <View style={styles.viewToggle}>
          <Button
            title="Cards"
            onPress={() => setViewMode('cards')}
            variant={viewMode === 'cards' ? 'primary' : 'outline'}
            style={styles.toggleButton}
          />
          <Button
            title="Calendar"
            onPress={() => setViewMode('calendar')}
            variant={viewMode === 'calendar' ? 'primary' : 'outline'}
            style={styles.toggleButton}
            icon={<Calendar size={16} color={viewMode === 'calendar' ? Colors.white : Colors.primary} />}
          />
        </View>

        <View style={styles.filterContainer}>
          <Filter size={16} color={Colors.textSecondary} />
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            {(['all', 'PREP', 'PIN', 'Combined'] as const).map(type => (
              <Button
                key={type}
                title={type === 'all' ? 'All Tests' : type}
                onPress={() => setFilterType(type)}
                variant={filterType === type ? 'primary' : 'outline'}
                style={styles.filterButton}
              />
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );

  const renderContent = () => {
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
          <Text style={styles.errorText}>{error}</Text>
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
        {filteredTests.map(test => (
          <PracticeTestCard
            key={test.id}
            test={test}
            onPress={() => handleTestPress(test)}
          />
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Practice Tests',
          headerShown: false
        }} 
      />
      
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  controls: {
    gap: 12,
  },
  viewToggle: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterScroll: {
    flex: 1,
  },
  filterButton: {
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
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