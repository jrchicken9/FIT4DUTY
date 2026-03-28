import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Info, X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { PIN_TEST_SCORING, Gender } from '@/constants/pinTestScoring';

interface PinTestTooltipProps {
  visible: boolean;
  onClose: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export default function PinTestTooltip({ visible, onClose }: PinTestTooltipProps) {
  const [selectedCategory, setSelectedCategory] = useState<'run' | 'pushups' | 'core' | 'sitreach'>('run');
  const [selectedGender, setSelectedGender] = useState<Gender>('male');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('20-29');

  const renderRunTable = () => {
    const scores = PIN_TEST_SCORING.run[selectedGender];
    const ageGroupKey = selectedAgeGroup === '50-59' || selectedAgeGroup === '60+' ? '50+' : selectedAgeGroup;
    const data = scores[ageGroupKey as keyof typeof scores] || [];

    return (
      <View style={styles.tableContainer}>
        <Text style={styles.tableTitle}>1.5 Mile Run - {selectedGender.charAt(0).toUpperCase() + selectedGender.slice(1)} ({selectedAgeGroup})</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.headerCell}>Score</Text>
          <Text style={styles.headerCell}>Max Time</Text>
        </View>
        {data.map((item, index) => (
          <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.evenRow]}>
            <Text style={styles.cell}>{item.score}</Text>
            <Text style={styles.cell}>{item.max_time}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderPushupsTable = () => {
    const scores = PIN_TEST_SCORING.pushups[selectedGender];
    let ageGroupKey = selectedAgeGroup;
    if (selectedAgeGroup === '30-34' || selectedAgeGroup === '35-39') {
      ageGroupKey = '30-39';
    }
    const data = scores[ageGroupKey as keyof typeof scores] || [];

    return (
      <View style={styles.tableContainer}>
        <Text style={styles.tableTitle}>Push-ups - {selectedGender.charAt(0).toUpperCase() + selectedGender.slice(1)} ({selectedAgeGroup})</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.headerCell}>Score</Text>
          <Text style={styles.headerCell}>Reps Required</Text>
        </View>
        {data.map((item, index) => (
          <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.evenRow]}>
            <Text style={styles.cell}>{item.score}</Text>
            <Text style={styles.cell}>{item.exact_reps}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderCoreTable = () => {
    const scores = PIN_TEST_SCORING.core_endurance[selectedGender];
    let ageGroupKey = selectedAgeGroup;
    if (selectedAgeGroup === '30-34' || selectedAgeGroup === '35-39') {
      ageGroupKey = '30-39';
    }
    const data = scores[ageGroupKey as keyof typeof scores] || [];

    return (
      <View style={styles.tableContainer}>
        <Text style={styles.tableTitle}>Core Endurance - {selectedGender.charAt(0).toUpperCase() + selectedGender.slice(1)} ({selectedAgeGroup})</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.headerCell}>Score</Text>
          <Text style={styles.headerCell}>Time Range (seconds)</Text>
        </View>
        {data.map((item, index) => {
          let timeRange = '';
          if (item.min_time_sec) {
            timeRange = `${item.min_time_sec}+`;
          } else if (item.min_time_sec_range) {
            timeRange = `${item.min_time_sec_range[0]}-${item.min_time_sec_range[1]}`;
          } else if (item.max_time_sec) {
            timeRange = `≤${item.max_time_sec}`;
          }
          
          return (
            <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.evenRow]}>
              <Text style={styles.cell}>{item.score}</Text>
              <Text style={styles.cell}>{timeRange}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderSitReachTable = () => {
    const scores = PIN_TEST_SCORING.sit_and_reach[selectedGender];
    let ageGroupKey = selectedAgeGroup;
    if (selectedAgeGroup === '30-34' || selectedAgeGroup === '35-39') {
      ageGroupKey = '30-39';
    }
    const data = scores[ageGroupKey as keyof typeof scores] || [];

    return (
      <View style={styles.tableContainer}>
        <Text style={styles.tableTitle}>Sit & Reach - {selectedGender.charAt(0).toUpperCase() + selectedGender.slice(1)} ({selectedAgeGroup})</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.headerCell}>Score</Text>
          <Text style={styles.headerCell}>Min Distance (cm)</Text>
        </View>
        {data.map((item, index) => (
          <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.evenRow]}>
            <Text style={styles.cell}>{item.score}</Text>
            <Text style={styles.cell}>{item.min_distance_cm}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderTable = () => {
    switch (selectedCategory) {
      case 'run':
        return renderRunTable();
      case 'pushups':
        return renderPushupsTable();
      case 'core':
        return renderCoreTable();
      case 'sitreach':
        return renderSitReachTable();
      default:
        return renderRunTable();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Info size={24} color={Colors.white} />
            <Text style={styles.headerTitle}>PIN Test Scoring Tables</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.controls}>
          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>Test Component:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {[
                { key: 'run', label: '1.5 Mile Run' },
                { key: 'pushups', label: 'Push-ups' },
                { key: 'core', label: 'Core Endurance' },
                { key: 'sitreach', label: 'Sit & Reach' },
              ].map((category) => (
                <TouchableOpacity
                  key={category.key}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.key && styles.selectedCategoryButton,
                  ]}
                  onPress={() => setSelectedCategory(category.key as any)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      selectedCategory === category.key && styles.selectedCategoryButtonText,
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.controlRow}>
            <View style={styles.controlGroup}>
              <Text style={styles.controlLabel}>Gender:</Text>
              <View style={styles.buttonGroup}>
                {['male', 'female'].map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    style={[
                      styles.controlButton,
                      selectedGender === gender && styles.selectedControlButton,
                    ]}
                    onPress={() => setSelectedGender(gender as Gender)}
                  >
                    <Text
                      style={[
                        styles.controlButtonText,
                        selectedGender === gender && styles.selectedControlButtonText,
                      ]}
                    >
                      {gender.charAt(0).toUpperCase() + gender.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.controlGroup}>
              <Text style={styles.controlLabel}>Age Group:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.ageScroll}>
                {['20-29', '30-34', '35-39', '40-49', '50-59', '60+'].map((age) => (
                  <TouchableOpacity
                    key={age}
                    style={[
                      styles.controlButton,
                      selectedAgeGroup === age && styles.selectedControlButton,
                    ]}
                    onPress={() => setSelectedAgeGroup(age)}
                  >
                    <Text
                      style={[
                        styles.controlButtonText,
                        selectedAgeGroup === age && styles.selectedControlButtonText,
                      ]}
                    >
                      {age}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderTable()}
          
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Scoring Information</Text>
            <Text style={styles.infoText}>
              • Total possible score: 100 points (50 + 20 + 20 + 10)
            </Text>
            <Text style={styles.infoText}>
              • Passing score: 80 points or higher
            </Text>
            <Text style={styles.infoText}>
              • All scores are rounded down to the nearest whole number
            </Text>
            <Text style={styles.infoText}>
              • Age groups may be combined for certain test components
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0,
    backgroundColor: Colors.primary,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
    marginLeft: 8,
  },
  closeButton: {
    padding: 4,
  },
  controls: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  controlGroup: {
    marginBottom: 12,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  categoryScroll: {
    flexGrow: 0,
  },
  ageScroll: {
    flexGrow: 0,
    maxWidth: screenWidth * 0.4,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    marginRight: 8,
  },
  selectedCategoryButton: {
    backgroundColor: Colors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  selectedCategoryButtonText: {
    color: Colors.white,
  },
  controlButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.background,
    marginRight: 6,
  },
  selectedControlButton: {
    backgroundColor: Colors.primary,
  },
  controlButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  selectedControlButtonText: {
    color: Colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tableContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginVertical: 16,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    padding: 16,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.primary + '10',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerCell: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border + '50',
  },
  evenRow: {
    backgroundColor: Colors.background + '50',
  },
  cell: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
});