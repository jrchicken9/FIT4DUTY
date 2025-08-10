import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { PracticeTest } from '@/context/PracticeTestsContext';

type CalendarViewType = 'month' | 'week' | 'list';

type PracticeTestCalendarProps = {
  tests: PracticeTest[];
  onTestPress: (test: PracticeTest) => void;
  viewType?: CalendarViewType;
  onViewTypeChange?: (viewType: CalendarViewType) => void;
};

const { width } = Dimensions.get('window');
const CELL_WIDTH = (width - 32) / 7; // Account for padding

export default function PracticeTestCalendar({ 
  tests, 
  onTestPress, 
  viewType = 'month',
  onViewTypeChange 
}: PracticeTestCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { monthDays, testsByDate } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of month and how many days in month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Create array of days for the calendar grid
    const days: (Date | null)[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    // Group tests by date
    const testsByDate: { [key: string]: PracticeTest[] } = {};
    tests.forEach(test => {
      const testDate = new Date(test.start_time);
      const dateKey = testDate.toDateString();
      if (!testsByDate[dateKey]) {
        testsByDate[dateKey] = [];
      }
      testsByDate[dateKey].push(test);
    });
    
    return { monthDays: days, testsByDate };
  }, [currentDate, tests]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getTestsForDate = (date: Date | null) => {
    if (!date) return [];
    return testsByDate[date.toDateString()] || [];
  };

  const renderCalendarHeader = () => (
    <View style={styles.calendarHeader}>
      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => navigateMonth('prev')}
      >
        <ChevronLeft size={24} color={Colors.primary} />
      </TouchableOpacity>
      
      <Text style={styles.monthTitle}>
        {currentDate.toLocaleDateString('en-US', { 
          month: 'long', 
          year: 'numeric' 
        })}
      </Text>
      
      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => navigateMonth('next')}
      >
        <ChevronRight size={24} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderDayHeaders = () => (
    <View style={styles.dayHeadersContainer}>
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <View key={day} style={styles.dayHeader}>
          <Text style={styles.dayHeaderText}>{day}</Text>
        </View>
      ))}
    </View>
  );

  const renderCalendarDay = (date: Date | null, index: number) => {
    const testsForDay = getTestsForDate(date);
    const isToday = date && date.toDateString() === new Date().toDateString();
    const hasTests = testsForDay.length > 0;
    
    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.dayCell,
          isToday && styles.todayCell,
          hasTests && styles.dayWithTests
        ]}
        onPress={() => {
          if (date && hasTests) {
            // Show tests for this day
            testsForDay.forEach(test => onTestPress(test));
          }
        }}
        disabled={!date || !hasTests}
      >
        {date && (
          <>
            <Text style={[
              styles.dayNumber,
              isToday && styles.todayText,
              hasTests && styles.dayWithTestsText
            ]}>
              {date.getDate()}
            </Text>
            {hasTests && (
              <View style={styles.testIndicators}>
                {testsForDay.slice(0, 3).map((test, idx) => (
                  <View 
                    key={idx}
                    style={[
                      styles.testIndicator,
                      { backgroundColor: getTestTypeColor(test.test_type) }
                    ]} 
                  />
                ))}
                {testsForDay.length > 3 && (
                  <Text style={styles.moreIndicator}>+{testsForDay.length - 3}</Text>
                )}
              </View>
            )}
          </>
        )}
      </TouchableOpacity>
    );
  };

  const renderMonthView = () => (
    <View style={styles.calendarContainer}>
      {renderCalendarHeader()}
      {renderDayHeaders()}
      <View style={styles.calendarGrid}>
        {monthDays.map((date, index) => renderCalendarDay(date, index))}
      </View>
    </View>
  );

  const renderListView = () => {
    const sortedTests = [...tests].sort((a, b) => 
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );

    return (
      <ScrollView style={styles.listContainer}>
        {sortedTests.map(test => (
          <TouchableOpacity
            key={test.id}
            style={styles.listItem}
            onPress={() => onTestPress(test)}
          >
            <View style={styles.listItemHeader}>
              <Text style={styles.listItemTitle}>{test.title}</Text>
              <View style={[
                styles.listItemBadge,
                { backgroundColor: getTestTypeColor(test.test_type) }
              ]}>
                <Text style={styles.listItemBadgeText}>{test.test_type}</Text>
              </View>
            </View>
            <Text style={styles.listItemDate}>
              {new Date(test.start_time).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </Text>
            <Text style={styles.listItemTime}>
              {new Date(test.start_time).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })} - {new Date(test.end_time).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}
            </Text>
            <Text style={styles.listItemLocation}>{test.location}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderViewToggle = () => (
    <View style={styles.viewToggle}>
      {(['month', 'list'] as CalendarViewType[]).map(type => (
        <TouchableOpacity
          key={type}
          style={[
            styles.viewToggleButton,
            viewType === type && styles.viewToggleButtonActive
          ]}
          onPress={() => onViewTypeChange?.(type)}
        >
          <Text style={[
            styles.viewToggleText,
            viewType === type && styles.viewToggleTextActive
          ]}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {renderViewToggle()}
      {viewType === 'month' ? renderMonthView() : renderListView()}
    </View>
  );
}

const getTestTypeColor = (testType: string) => {
  switch (testType) {
    case 'PREP':
      return '#3b82f6';
    case 'PIN':
      return '#10b981';
    case 'Combined':
      return '#8b5cf6';
    default:
      return Colors.primary;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 4,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  viewToggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  viewToggleButtonActive: {
    backgroundColor: Colors.primary,
  },
  viewToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  viewToggleTextActive: {
    color: Colors.white,
  },
  calendarContainer: {
    backgroundColor: Colors.white,
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  dayHeadersContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeader: {
    width: CELL_WIDTH,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: CELL_WIDTH,
    height: 60,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  todayCell: {
    backgroundColor: Colors.primary + '10',
  },
  dayWithTests: {
    backgroundColor: Colors.success + '05',
  },
  dayNumber: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 2,
  },
  todayText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  dayWithTestsText: {
    fontWeight: '600',
  },
  testIndicators: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  testIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 1,
    marginVertical: 1,
  },
  moreIndicator: {
    fontSize: 8,
    color: Colors.textSecondary,
    marginLeft: 2,
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  listItem: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    marginRight: 12,
  },
  listItemBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  listItemBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  listItemDate: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  listItemTime: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  listItemLocation: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});