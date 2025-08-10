import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
} from 'react-native';
import { Info, X, Play } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface ComponentTooltipProps {
  visible: boolean;
  onClose: () => void;
  component: 'mileRun' | 'pushups' | 'coreEndurance' | 'sitReach';
}

const componentData = {
  mileRun: {
    title: '1.5 Mile Run',
    description: 'Cardiovascular endurance test measuring aerobic fitness',
    instructions: [
      'Run or walk 1.5 miles (2.4 km) as fast as possible',
      'The test can be performed on a track, treadmill, or measured course',
      'Maintain a steady pace throughout the test',
      'Record your completion time in minutes and seconds',
      'Cool down with light walking after completion'
    ],
    tips: [
      'Warm up with 5-10 minutes of light jogging or walking',
      'Start at a sustainable pace - don\'t sprint at the beginning',
      'Focus on steady breathing throughout the run',
      'Practice the distance beforehand to gauge your pace',
      'Stay hydrated but avoid drinking too much before the test'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=300&fit=crop',
    videoUrl: null
  },
  pushups: {
    title: 'Push-ups',
    description: 'Upper body strength and muscular endurance test',
    instructions: [
      'Start in a plank position with hands shoulder-width apart',
      'Lower your body until your chest nearly touches the ground',
      'Push back up to the starting position with arms fully extended',
      'Keep your body in a straight line throughout the movement',
      'Count only complete repetitions with proper form',
      'Continue until muscle failure or you can no longer maintain proper form'
    ],
    tips: [
      'Keep your core engaged throughout the movement',
      'Don\'t let your hips sag or pike up',
      'Breathe out as you push up, breathe in as you lower down',
      'If you can\'t do standard push-ups, start with knee push-ups',
      'Practice regularly to build strength and endurance'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    videoUrl: null
  },
  coreEndurance: {
    title: 'Core Endurance (Plank)',
    description: 'Core stability and muscular endurance test',
    instructions: [
      'Start in a forearm plank position',
      'Keep your body in a straight line from head to heels',
      'Rest on your forearms and toes',
      'Hold this position for as long as possible',
      'Stop when you can no longer maintain proper form',
      'Record your hold time in minutes and seconds'
    ],
    tips: [
      'Keep your core tight and engaged',
      'Don\'t let your hips sag or rise too high',
      'Focus on steady breathing - don\'t hold your breath',
      'Look down at the floor to maintain neutral neck position',
      'Practice holding shorter durations to build up endurance'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=400&h=300&fit=crop',
    videoUrl: null
  },
  sitReach: {
    title: 'Sit and Reach',
    description: 'Flexibility test measuring hamstring and lower back flexibility',
    instructions: [
      'Sit on the floor with legs straight and feet against a box or wall',
      'Place a ruler or measuring tape on top of the box',
      'Slowly reach forward as far as possible',
      'Keep your legs straight and reach with both hands',
      'Hold the furthest position for 2 seconds',
      'Measure the distance reached in centimeters'
    ],
    tips: [
      'Warm up with light stretching before the test',
      'Move slowly and smoothly - don\'t bounce',
      'Keep your legs straight throughout the movement',
      'Breathe normally and don\'t hold your breath',
      'Regular stretching will improve your flexibility over time'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1506629905607-d405872a4d86?w=400&h=300&fit=crop',
    videoUrl: null
  }
};

export default function ComponentTooltip({ visible, onClose, component }: ComponentTooltipProps) {
  const data = componentData[component];

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
            <Info size={24} color={Colors.primary} />
            <Text style={styles.headerTitle}>{data.title}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {data.imageUrl && (
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: data.imageUrl }} 
                style={styles.image}
                resizeMode="cover"
              />
              {data.videoUrl && (
                <TouchableOpacity style={styles.playButton}>
                  <Play size={32} color={Colors.white} fill={Colors.white} />
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.description}>{data.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            {data.instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <View style={styles.bullet} />
                <Text style={styles.instructionText}>{instruction}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tips for Success</Text>
            {data.tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Text style={styles.tipBullet}>💡</Text>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Scoring</Text>
            <Text style={styles.scoringText}>
              Your performance will be scored based on your age group and gender. 
              Higher performance levels earn more points toward your total PIN test score.
            </Text>
            <Text style={styles.scoringNote}>
              Tap the main scoring info button to view detailed scoring tables.
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  imageContainer: {
    position: 'relative',
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.background,
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + 'CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginVertical: 16,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 8,
    marginRight: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipBullet: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  scoringText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 8,
  },
  scoringNote: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
});