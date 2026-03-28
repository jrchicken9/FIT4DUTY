import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated, Pressable } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows, strokeWidth, sizes } from '@/constants/designSystem';
import { useTapAnimation } from '@/hooks/useTapAnimation';
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

const NavButton = ({ onPress, children }: { onPress: () => void; children: React.ReactNode }) => {
  const { handlePressIn, handlePressOut, animatedStyle } = useTapAnimation();

  return (
    <Pressable 
      style={styles.navButton}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.navButtonContent, animatedStyle]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

const CalendarDay = ({ 
  date, 
  index, 
  testsForDay, 
  isToday, 
  hasTests, 
  onTestPress 
}: {
  date: Date | null;
  index: number;
  testsForDay: PracticeTest[];
  isToday: boolean;
  hasTests: boolean;
  onTestPress: (test: PracticeTest) => void;
}) => {
  const { handlePressIn, handlePressOut, animatedStyle } = useTapAnimation();

  const getTestTypeColor = (testType: string) => {
    switch (testType) {
      case 'oacp': return Colors.accent;
      case 'prerequisites': return Colors.success;
      case 'fitness': return Colors.warning;
      default: return Colors.primary;
    }
  };

  return (
    <Pressable
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
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={!date || !hasTests}
    >
      <Animated.View style={[styles.dayCellContent, animatedStyle]}>
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
      </Animated.View>
    </Pressable>
  );
};

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
      <NavButton onPress={() => navigateMonth('prev')}>
        <ChevronLeft size={sizes.lg} color={Colors.primary} />
      </NavButton>
      
      <Text style={styles.monthTitle}>
        {currentDate.toLocaleDateString('en-US', { 
          month: 'long', 
          year: 'numeric' 
        })}
      </Text>
      
      <NavButton onPress={() => navigateMonth('next')}>
        <ChevronRight size={sizes.lg} color={Colors.primary} />
      </NavButton>
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
    const isToday = Boolean(date && date.toDateString() === new Date().toDateString());
    const hasTests = testsForDay.length > 0;
    
    return (
      <CalendarDay
        key={index}
        date={date}
        index={index}
        testsForDay={testsForDay}
        isToday={isToday}
        hasTests={hasTests}
        onTestPress={onTestPress}
      />
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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderMonthView()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  calendarContainer: {
    padding: spacing.md,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  navButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: Colors.white,
    ...shadows.level2,
  },
  navButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    ...typography.headingMedium,
    color: Colors.text,
    fontWeight: '600',
  },
  dayHeadersContainer: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  dayHeader: {
    width: CELL_WIDTH,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  dayHeaderText: {
    ...typography.labelSmall,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: CELL_WIDTH,
    height: CELL_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: strokeWidth.thin,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  dayCellContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: '100%',
  },
  todayCell: {
    backgroundColor: Colors.primary + '10',
    borderColor: Colors.primary,
  },
  dayWithTests: {
    backgroundColor: Colors.accent + '10',
  },
  dayNumber: {
    ...typography.labelMedium,
    color: Colors.text,
    fontWeight: '500',
  },
  todayText: {
    color: Colors.primary,
    fontWeight: '700',
  },
  dayWithTestsText: {
    color: Colors.accent,
    fontWeight: '600',
  },
  testIndicators: {
    flexDirection: 'row',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  testIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  moreIndicator: {
    ...typography.labelSmall,
    color: Colors.textSecondary,
    fontSize: 8,
  },
});