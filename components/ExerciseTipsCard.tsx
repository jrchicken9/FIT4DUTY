import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Lightbulb, 
  ChevronRight, 
  ChevronLeft, 
  Target,
  Zap,
  Heart,
  TrendingUp,
  Info
} from 'lucide-react-native';

import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows } from '@/constants/designSystem';

interface ExerciseTip {
  id: string;
  type: 'tip' | 'fact' | 'technique' | 'benefit';
  title: string;
  content: string;
  icon: 'lightbulb' | 'target' | 'zap' | 'heart' | 'trending' | 'info';
  category: 'form' | 'performance' | 'safety' | 'science' | 'motivation';
}

interface ExerciseTipsCardProps {
  exerciseName: string;
  exerciseTips?: string[];
  muscleGroups?: string[];
  difficultyLevel?: string;
  isVisible: boolean;
  onToggle: () => void;
  isNextExercise?: boolean;
}

const { width } = Dimensions.get('window');

// Exercise tips and facts database
const exerciseTipsDatabase: Record<string, ExerciseTip[]> = {
  'Bench Dips': [
    {
      id: 'bench-dips-1',
      type: 'technique',
      title: 'Proper Form',
      content: 'Keep your elbows close to your body and lower yourself until your upper arms are parallel to the ground. This targets your triceps more effectively.',
      icon: 'target',
      category: 'form'
    },
    {
      id: 'bench-dips-2',
      type: 'fact',
      title: 'Muscle Activation',
      content: 'Bench dips primarily target your triceps brachii, but also engage your chest, shoulders, and core for stability.',
      icon: 'info',
      category: 'science'
    },
    {
      id: 'bench-dips-3',
      type: 'tip',
      title: 'Progression Tip',
      content: 'To increase difficulty, try elevating your feet on another bench or adding weight on your lap.',
      icon: 'trending',
      category: 'performance'
    }
  ],
  '20m Shuttle Run (Beep Test)': [
    {
      id: 'shuttle-1',
      type: 'technique',
      title: 'Pacing Strategy',
      content: 'Start conservatively and gradually increase your pace. It\'s better to finish strong than burn out early.',
      icon: 'target',
      category: 'performance'
    },
    {
      id: 'shuttle-2',
      type: 'fact',
      title: 'Aerobic Capacity',
      content: 'The beep test measures your VO2 max and is used by police forces worldwide to assess cardiovascular fitness.',
      icon: 'info',
      category: 'science'
    },
    {
      id: 'shuttle-3',
      type: 'tip',
      title: 'Turn Technique',
      content: 'Use quick, efficient turns. Plant your foot firmly and push off in the opposite direction without losing momentum.',
      icon: 'lightbulb',
      category: 'form'
    }
  ],
  'Push/Pull Machine': [
    {
      id: 'pushpull-1',
      type: 'technique',
      title: 'Explosive Power',
      content: 'Focus on generating maximum force quickly. This simulates real-world police scenarios requiring sudden strength.',
      icon: 'zap',
      category: 'performance'
    },
    {
      id: 'pushpull-2',
      type: 'fact',
      title: 'Functional Strength',
      content: 'This exercise mimics pushing suspects away and pulling them toward you - essential police skills.',
      icon: 'info',
      category: 'science'
    },
    {
      id: 'pushpull-3',
      type: 'tip',
      title: 'Full Range of Motion',
      content: 'Complete each push and pull through the full range of motion to maximize muscle engagement.',
      icon: 'target',
      category: 'form'
    }
  ],
  'Obstacle Course': [
    {
      id: 'obstacle-1',
      type: 'technique',
      title: 'Efficiency First',
      content: 'Focus on smooth transitions between obstacles. Speed comes from efficiency, not just raw power.',
      icon: 'target',
      category: 'performance'
    },
    {
      id: 'obstacle-2',
      type: 'fact',
      title: 'Real-World Simulation',
      content: 'Obstacle courses simulate the unpredictable nature of police work, testing agility and decision-making.',
      icon: 'info',
      category: 'science'
    },
    {
      id: 'obstacle-3',
      type: 'tip',
      title: 'Mental Preparation',
      content: 'Visualize each obstacle before approaching it. Mental preparation is as important as physical ability.',
      icon: 'lightbulb',
      category: 'motivation'
    }
  ],
  'Push-ups': [
    {
      id: 'pushups-1',
      type: 'technique',
      title: 'Core Engagement',
      content: 'Maintain a straight line from head to heels by engaging your core throughout the entire movement.',
      icon: 'target',
      category: 'form'
    },
    {
      id: 'pushups-2',
      type: 'fact',
      title: 'Full Body Exercise',
      content: 'Push-ups work over 200 muscles in your body, making them one of the most efficient bodyweight exercises.',
      icon: 'zap',
      category: 'science'
    },
    {
      id: 'pushups-3',
      type: 'tip',
      title: 'Breathing Pattern',
      content: 'Inhale as you lower your body, exhale as you push back up. This helps maintain rhythm and power.',
      icon: 'lightbulb',
      category: 'performance'
    }
  ],
  'Squats': [
    {
      id: 'squats-1',
      type: 'technique',
      title: 'Knee Alignment',
      content: 'Keep your knees in line with your toes and don\'t let them cave inward. This protects your joints.',
      icon: 'target',
      category: 'safety'
    },
    {
      id: 'squats-2',
      type: 'fact',
      title: 'Functional Movement',
      content: 'Squats mimic everyday movements like sitting and standing, making them essential for daily life.',
      icon: 'info',
      category: 'science'
    },
    {
      id: 'squats-3',
      type: 'tip',
      title: 'Depth Matters',
      content: 'Aim to get your thighs parallel to the ground for optimal muscle activation and joint health.',
      icon: 'trending',
      category: 'performance'
    }
  ],
  'Plank': [
    {
      id: 'plank-1',
      type: 'technique',
      title: 'Neutral Spine',
      content: 'Maintain a neutral spine position - imagine a straight line from your head to your heels.',
      icon: 'target',
      category: 'form'
    },
    {
      id: 'plank-2',
      type: 'fact',
      title: 'Core Foundation',
      content: 'Planks activate your entire core, including deep stabilizing muscles that other exercises often miss.',
      icon: 'heart',
      category: 'science'
    },
    {
      id: 'plank-3',
      type: 'tip',
      title: 'Breathing Focus',
      content: 'Focus on steady, deep breathing while holding the plank. This helps you maintain the position longer.',
      icon: 'lightbulb',
      category: 'performance'
    }
  ],
  'Burpees': [
    {
      id: 'burpees-1',
      type: 'technique',
      title: 'Explosive Movement',
      content: 'Use explosive power from your legs to jump up from the squat position, engaging your entire body.',
      icon: 'zap',
      category: 'performance'
    },
    {
      id: 'burpees-2',
      type: 'fact',
      title: 'Calorie Burner',
      content: 'Burpees can burn up to 10 calories per minute, making them one of the most efficient fat-burning exercises.',
      icon: 'trending',
      category: 'science'
    },
    {
      id: 'burpees-3',
      type: 'tip',
      title: 'Pace Yourself',
      content: 'Start with a manageable pace and gradually increase speed. Quality over quantity prevents injury.',
      icon: 'lightbulb',
      category: 'safety'
    }
  ],
  'Sit and Reach Flexibility': [
    {
      id: 'sitreach-1',
      type: 'technique',
      title: 'Gradual Stretch',
      content: 'Warm up properly and stretch gradually. Don\'t bounce or force the stretch beyond your comfort level.',
      icon: 'target',
      category: 'safety'
    },
    {
      id: 'sitreach-2',
      type: 'fact',
      title: 'Flexibility Benefits',
      content: 'Good flexibility reduces injury risk and improves overall movement quality, essential for police work.',
      icon: 'heart',
      category: 'science'
    },
    {
      id: 'sitreach-3',
      type: 'tip',
      title: 'Breathing Helps',
      content: 'Exhale as you reach forward. This helps relax your muscles and allows for a deeper stretch.',
      icon: 'lightbulb',
      category: 'form'
    }
  ],
  '1.5 Mile Run': [
    {
      id: 'mile-1',
      type: 'technique',
      title: 'Pacing Strategy',
      content: 'Start at a pace you can maintain for the entire distance. It\'s better to finish strong than start fast.',
      icon: 'target',
      category: 'performance'
    },
    {
      id: 'mile-2',
      type: 'fact',
      title: 'Endurance Test',
      content: 'This distance tests your aerobic capacity and mental toughness - both crucial for police work.',
      icon: 'info',
      category: 'science'
    },
    {
      id: 'mile-3',
      type: 'tip',
      title: 'Mental Focus',
      content: 'Break the run into segments. Focus on reaching the next landmark rather than the finish line.',
      icon: 'lightbulb',
      category: 'motivation'
    }
  ],
  'Core Endurance Test': [
    {
      id: 'core-1',
      type: 'technique',
      title: 'Proper Alignment',
      content: 'Maintain a straight line from head to heels. Engage your core and glutes to support your position.',
      icon: 'target',
      category: 'form'
    },
    {
      id: 'core-2',
      type: 'fact',
      title: 'Core Stability',
      content: 'A strong core is essential for all police activities, from lifting to running to maintaining balance.',
      icon: 'info',
      category: 'science'
    },
    {
      id: 'core-3',
      type: 'tip',
      title: 'Mental Endurance',
      content: 'Focus on your breathing and visualize your core muscles working. Mental focus extends physical endurance.',
      icon: 'trending',
      category: 'performance'
    }
  ],
  'Back Extension Test': [
    {
      id: 'back-1',
      type: 'technique',
      title: 'Controlled Movement',
      content: 'Lift your upper body in a controlled manner, focusing on using your lower back muscles.',
      icon: 'target',
      category: 'form'
    },
    {
      id: 'back-2',
      type: 'fact',
      title: 'Lower Back Health',
      content: 'Strong lower back muscles protect your spine and are essential for lifting and carrying equipment.',
      icon: 'heart',
      category: 'science'
    },
    {
      id: 'back-3',
      type: 'tip',
      title: 'Avoid Overextension',
      content: 'Don\'t arch your back beyond neutral position. Focus on controlled movement rather than range.',
      icon: 'lightbulb',
      category: 'safety'
    }
  ],
  'Progressive Shuttle Run': [
    {
      id: 'progressive-1',
      type: 'technique',
      title: 'Pacing Strategy',
      content: 'Start conservatively and gradually increase your pace. It\'s better to finish strong than burn out early.',
      icon: 'target',
      category: 'performance'
    },
    {
      id: 'progressive-2',
      type: 'fact',
      title: 'VO2 Max Test',
      content: 'This test measures your maximum oxygen consumption, a key indicator of cardiovascular fitness.',
      icon: 'info',
      category: 'science'
    },
    {
      id: 'progressive-3',
      type: 'tip',
      title: 'Turn Efficiency',
      content: 'Use quick, efficient turns. Plant your foot firmly and push off in the opposite direction without losing momentum.',
      icon: 'lightbulb',
      category: 'form'
    }
  ],
  'Bicycle Crunches': [
    {
      id: 'bicycle-1',
      type: 'technique',
      title: 'Proper Form',
      content: 'Keep your lower back pressed to the ground and bring your elbow to the opposite knee in a controlled motion.',
      icon: 'target',
      category: 'form'
    },
    {
      id: 'bicycle-2',
      type: 'fact',
      title: 'Core Activation',
      content: 'Bicycle crunches target your rectus abdominis, obliques, and hip flexors for a complete core workout.',
      icon: 'info',
      category: 'science'
    },
    {
      id: 'bicycle-3',
      type: 'tip',
      title: 'Breathing Pattern',
      content: 'Exhale as you bring your elbow to your knee, inhale as you extend. This helps maintain rhythm and core engagement.',
      icon: 'lightbulb',
      category: 'performance'
    }
  ]
};

// Generic tips for exercises not in the database
const genericTips: ExerciseTip[] = [
  {
    id: 'generic-1',
    type: 'tip',
    title: 'Mind-Muscle Connection',
    content: 'Focus on feeling the target muscles working throughout the movement. This increases effectiveness.',
    icon: 'target',
    category: 'performance'
  },
  {
    id: 'generic-2',
    type: 'fact',
    title: 'Rest Periods',
    content: 'Adequate rest between sets allows your muscles to recover and perform better in subsequent sets.',
    icon: 'heart',
    category: 'science'
  },
  {
    id: 'generic-3',
    type: 'tip',
    title: 'Progressive Overload',
    content: 'Gradually increase weight, reps, or difficulty to continue making progress and building strength.',
    icon: 'trending',
    category: 'performance'
  },
  {
    id: 'generic-4',
    type: 'technique',
    title: 'Proper Breathing',
    content: 'Exhale during the concentric (lifting) phase and inhale during the eccentric (lowering) phase.',
    icon: 'lightbulb',
    category: 'form'
  },
  {
    id: 'generic-5',
    type: 'fact',
    title: 'Recovery Importance',
    content: 'Muscles grow and repair during rest periods, not during exercise. Don\'t skip recovery days.',
    icon: 'info',
    category: 'science'
  },
  {
    id: 'generic-6',
    type: 'tip',
    title: 'Police Fitness Focus',
    content: 'Remember: every rep brings you closer to your goal of serving and protecting your community.',
    icon: 'target',
    category: 'motivation'
  },
  {
    id: 'generic-7',
    type: 'fact',
    title: 'Functional Fitness',
    content: 'Police work requires strength, endurance, and agility. Your training directly translates to real-world performance.',
    icon: 'info',
    category: 'science'
  },
  {
    id: 'generic-8',
    type: 'tip',
    title: 'Mental Toughness',
    content: 'Physical training builds mental resilience. Push through discomfort to develop the mental strength needed for police work.',
    icon: 'trending',
    category: 'motivation'
  },
  {
    id: 'generic-9',
    type: 'technique',
    title: 'Form Over Speed',
    content: 'Quality repetitions are more valuable than quantity. Proper form prevents injury and maximizes results.',
    icon: 'lightbulb',
    category: 'safety'
  },
  {
    id: 'generic-10',
    type: 'fact',
    title: 'Consistency Wins',
    content: 'Regular training, even in small amounts, is more effective than occasional intense sessions.',
    icon: 'heart',
    category: 'science'
  }
];

export default function ExerciseTipsCard({ 
  exerciseName, 
  exerciseTips, 
  muscleGroups, 
  difficultyLevel,
  isVisible,
  onToggle,
  isNextExercise = false
}: ExerciseTipsCardProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [slideAnim] = useState(new Animated.Value(0));

  // Get tips for the current exercise
  const getExerciseTips = (): ExerciseTip[] => {
    const specificTips = exerciseTipsDatabase[exerciseName] || [];
    const tips = [...specificTips, ...genericTips];
    
    // Shuffle tips for variety
    return tips.sort(() => Math.random() - 0.5).slice(0, 3);
  };

  const tips = getExerciseTips();
  const currentTip = tips[currentTipIndex];

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible]);

  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % tips.length);
  };

  const previousTip = () => {
    setCurrentTipIndex((prev) => (prev - 1 + tips.length) % tips.length);
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'lightbulb': return <Lightbulb size={20} color={Colors.white} />;
      case 'target': return <Target size={20} color={Colors.white} />;
      case 'zap': return <Zap size={20} color={Colors.white} />;
      case 'heart': return <Heart size={20} color={Colors.white} />;
      case 'trending': return <TrendingUp size={20} color={Colors.white} />;
      case 'info': return <Info size={20} color={Colors.white} />;
      default: return <Lightbulb size={20} color={Colors.white} />;
    }
  };

  const getTipTypeColor = (type: string) => {
    switch (type) {
      case 'technique': return Colors.primary;
      case 'fact': return Colors.success;
      case 'tip': return Colors.warning;
      case 'benefit': return Colors.info;
      default: return Colors.primary;
    }
  };

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0],
              }),
            },
          ],
          opacity: slideAnim,
        },
      ]}
    >
      <TouchableOpacity 
        style={styles.toggleButton}
        onPress={onToggle}
      >
        <LinearGradient
          colors={[Colors.gradients.secondary.start, Colors.gradients.secondary.end]}
          style={styles.toggleGradient}
        >
          <Lightbulb size={20} color={Colors.white} />
          <Text style={styles.toggleText}>
            {isNextExercise ? 'Next Exercise Tips' : 'Exercise Tips'}
          </Text>
          <ChevronRight size={20} color={Colors.white} />
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.tipsContainer}>
        <LinearGradient
          colors={[Colors.white, Colors.background]}
          style={styles.tipsCard}
        >
          {/* Tip Header */}
          <View style={styles.tipHeader}>
            <View style={[
              styles.tipIcon,
              { backgroundColor: getTipTypeColor(currentTip.type) }
            ]}>
              {getIconComponent(currentTip.icon)}
            </View>
            <View style={styles.tipInfo}>
              <Text style={styles.tipType}>
                {currentTip.type.charAt(0).toUpperCase() + currentTip.type.slice(1)}
              </Text>
              <Text style={styles.tipTitle}>{currentTip.title}</Text>
            </View>
          </View>

          {/* Tip Content */}
          <Text style={styles.tipContent}>{currentTip.content}</Text>

          {/* Navigation */}
          <View style={styles.navigation}>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={previousTip}
            >
              <ChevronLeft size={20} color={Colors.primary} />
            </TouchableOpacity>
            
            <View style={styles.dots}>
              {tips.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === currentTipIndex && styles.activeDot
                  ]}
                />
              ))}
            </View>
            
            <TouchableOpacity 
              style={styles.navButton}
              onPress={nextTip}
            >
              <ChevronRight size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
  },
  toggleButton: {
    borderRadius: borderRadius.lg,
    ...shadows.medium,
  },
  toggleGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  toggleText: {
    ...typography.body,
    color: Colors.white,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  tipsContainer: {
    marginTop: spacing.sm,
  },
  tipsCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.medium,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  tipInfo: {
    flex: 1,
  },
  tipType: {
    ...typography.caption,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  tipTitle: {
    ...typography.body,
    color: Colors.text,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  tipContent: {
    ...typography.body,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: Colors.border,
    marginHorizontal: spacing.xs,
  },
  activeDot: {
    backgroundColor: Colors.primary,
    width: 12,
    height: 12,
  },
});
