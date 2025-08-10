import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Calendar, Clock, MapPin, Users, DollarSign } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { PracticeTest, usePracticeTests } from '@/context/PracticeTestsContext';
import { useAuth } from '@/context/AuthContext';

type PracticeTestCardProps = {
  test: PracticeTest;
  onPress?: () => void;
  showActions?: boolean;
};

export default function PracticeTestCard({ test, onPress, showActions = true }: PracticeTestCardProps) {
  const { user } = useAuth();
  const { 
    registerForTest, 
    getAvailabilityStatus, 
    isUserRegistered, 
    isUserWaitlisted 
  } = usePracticeTests();

  const availability = getAvailabilityStatus(test);
  const userRegistered = isUserRegistered(test.id);
  const userWaitlisted = isUserWaitlisted(test.id);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleRegister = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to register for practice tests.');
      return;
    }

    if (userRegistered) {
      Alert.alert('Already Registered', 'You are already registered for this test.');
      return;
    }

    if (userWaitlisted) {
      Alert.alert('On Waitlist', 'You are already on the waitlist for this test.');
      return;
    }

    Alert.alert(
      'Register for Test',
      `Would you like to register for ${test.title}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Register',
          onPress: async () => {
            const result = await registerForTest(test.id);
            if (!result.success) {
              Alert.alert('Registration Failed', result.error || 'Failed to register');
            }
          }
        }
      ]
    );
  };

  const getActionButton = () => {
    if (!showActions || !user) return null;

    if (userRegistered) {
      return (
        <View style={[styles.actionButton, styles.registeredButton]}>
          <Text style={styles.registeredButtonText}>Registered</Text>
        </View>
      );
    }

    if (userWaitlisted) {
      return (
        <View style={[styles.actionButton, styles.waitlistButton]}>
          <Text style={styles.waitlistButtonText}>On Waitlist</Text>
        </View>
      );
    }

    if (availability.status === 'full') {
      return (
        <TouchableOpacity 
          style={[styles.actionButton, styles.waitlistActionButton]}
          onPress={handleRegister}
        >
          <Text style={styles.waitlistActionButtonText}>Join Waitlist</Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity 
        style={[styles.actionButton, styles.registerButton]}
        onPress={handleRegister}
      >
        <Text style={styles.registerButtonText}>Register</Text>
      </TouchableOpacity>
    );
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{test.title}</Text>
          <View style={[styles.testTypeBadge, { backgroundColor: getTestTypeColor(test.test_type) }]}>
            <Text style={styles.testTypeText}>{test.test_type}</Text>
          </View>
        </View>
        <View style={[styles.availabilityBadge, { backgroundColor: availability.color }]}>
          <Text style={styles.availabilityText}>{availability.text}</Text>
        </View>
      </View>

      {test.description && (
        <Text style={styles.description} numberOfLines={2}>
          {test.description}
        </Text>
      )}

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Calendar size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>
            {formatDate(test.start_time)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Clock size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>
            {formatTime(test.start_time)} - {formatTime(test.end_time)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <MapPin size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText} numberOfLines={1}>
            {test.location}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Users size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>
            {test.current_registrations}/{test.total_capacity} registered
          </Text>
        </View>

        {test.price > 0 && (
          <View style={styles.detailRow}>
            <DollarSign size={16} color={Colors.textSecondary} />
            <Text style={styles.detailText}>
              ${test.price.toFixed(2)}
            </Text>
          </View>
        )}
      </View>

      {test.instructor_name && (
        <View style={styles.instructorContainer}>
          <Text style={styles.instructorLabel}>Instructor:</Text>
          <Text style={styles.instructorName}>{test.instructor_name}</Text>
        </View>
      )}

      {getActionButton()}
    </TouchableOpacity>
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
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  testTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  testTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  availabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  detailsContainer: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  instructorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  instructorLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  instructorName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  registerButton: {
    backgroundColor: Colors.primary,
  },
  registerButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  registeredButton: {
    backgroundColor: Colors.success,
  },
  registeredButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  waitlistButton: {
    backgroundColor: Colors.warning,
  },
  waitlistButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  waitlistActionButton: {
    backgroundColor: Colors.border,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  waitlistActionButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});