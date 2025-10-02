import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Animated, 
  Pressable 
} from 'react-native';
import { Info, X, Play } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows, strokeWidth, sizes } from '@/constants/designSystem';
import { useTapAnimation } from '@/hooks/useTapAnimation';

interface TooltipData {
  title: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  instructions: string[];
  tips: string[];
}

interface ComponentTooltipProps {
  visible: boolean;
  data?: TooltipData;
  onClose: () => void;
}

const CloseButton = ({ onPress }: { onPress: () => void }) => {
  const { handlePressIn, handlePressOut, animatedStyle } = useTapAnimation();

  return (
    <Pressable 
      onPress={onPress} 
      style={styles.closeButton}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.closeButtonContent, animatedStyle]}>
        <X size={sizes.lg} color={Colors.white} />
      </Animated.View>
    </Pressable>
  );
};

const PlayButton = ({ onPress }: { onPress: () => void }) => {
  const { handlePressIn, handlePressOut, animatedStyle } = useTapAnimation();

  return (
    <Pressable 
      style={styles.playButton}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.playButtonContent, animatedStyle]}>
        <Play size={sizes.xl} color={Colors.white} fill={Colors.white} />
      </Animated.View>
    </Pressable>
  );
};

export default function ComponentTooltip({ visible, data, onClose }: ComponentTooltipProps) {
  // Don't render if no data is provided
  if (!data) {
    return null;
  }

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
            <Info size={sizes.lg} color={Colors.white} />
            <Text style={styles.headerTitle}>{data.title}</Text>
          </View>
          <CloseButton onPress={onClose} />
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
                <PlayButton onPress={() => {}} />
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
    borderTopWidth: 2,
    borderTopColor: Colors.policeRedBorder,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 0,
    backgroundColor: Colors.primary,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.headingMedium,
    color: Colors.white,
    marginLeft: spacing.sm,
    fontWeight: '600',
  },
  closeButton: {
    padding: spacing.xs,
  },
  closeButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    ...shadows.level2,
  },
  image: {
    width: '100%',
    height: 200,
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -sizes.xl }, { translateY: -sizes.xl }],
    backgroundColor: Colors.primary + 'CC',
    borderRadius: borderRadius.full,
    width: sizes.xxl,
    height: sizes.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.level4,
  },
  playButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: spacing.lg,
  },
  description: {
    ...typography.bodyLarge,
    color: Colors.text,
    lineHeight: 24,
  },
  sectionTitle: {
    ...typography.headingSmall,
    color: Colors.text,
    marginBottom: spacing.md,
    fontWeight: '700',
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 8,
    marginRight: spacing.sm,
  },
  instructionText: {
    ...typography.bodyMedium,
    color: Colors.text,
    flex: 1,
    lineHeight: 22,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  tipBullet: {
    fontSize: 16,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  tipText: {
    ...typography.bodyMedium,
    color: Colors.text,
    flex: 1,
    lineHeight: 22,
  },
  scoringText: {
    ...typography.bodyMedium,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  scoringNote: {
    ...typography.bodySmall,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
});