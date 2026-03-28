import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Calendar, Clock, MapPin, Users, Star } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface PracticeTestCardProps {
  test: {
    id: string;
    title: string;
    description?: string | null;
    test_type: string;
    start_time: string;
    end_time: string;
    location: string;
    current_registrations: number;
    total_capacity: number;
    price: number;
  };
  onPress: () => void;
}

const PracticeTestCard = memo(({ test, onPress }: PracticeTestCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getTestTypeColor = (type: string) => {
    switch (type) {
      case 'PREP':
        return '#10B981';
      case 'PIN':
        return '#3B82F6';
      case 'Combined':
        return '#F59E0B';
      default:
        return Colors.primary;
    }
  };

  const availabilityStatus = () => {
    const availableSeats = test.total_capacity - test.current_registrations;
    const percentFull = (test.current_registrations / test.total_capacity) * 100;
    
    if (availableSeats <= 0) {
      return { status: 'full', color: '#ef4444', text: 'Fully Booked' };
    } else if (percentFull >= 80) {
      return { status: 'limited', color: '#f59e0b', text: `${availableSeats} seats left` };
    } else {
      return { status: 'available', color: '#10b981', text: `${availableSeats} seats available` };
    }
  };

  const status = availabilityStatus();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {test.title}
          </Text>
          <View style={[styles.typeBadge, { backgroundColor: getTestTypeColor(test.test_type) }]}>
            <Text style={styles.typeText}>{test.test_type}</Text>
          </View>
        </View>
        
        <View style={[styles.availabilityBadge, { backgroundColor: status.color + '20' }]}>
          <Text style={[styles.availabilityText, { color: status.color }]}>
            {status.text}
          </Text>
        </View>
      </View>

      {test.description && (
        <Text style={styles.description} numberOfLines={2}>
          {test.description}
        </Text>
      )}

      <View style={styles.details}>
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
      </View>

      {test.price > 0 && (
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>
            ${test.price.toFixed(2)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

PracticeTestCard.displayName = 'PracticeTestCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  availabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  priceContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
});

export default PracticeTestCard;