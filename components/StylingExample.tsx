import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useTapAnimation } from '@/hooks/useTapAnimation';
import TappableCard from './TappableCard';
import Button from './Button';
import { Animated, Pressable } from 'react-native';
import { 
  Star, 
  Heart, 
  Settings, 
  User, 
  Bell, 
  Home,
  ChevronRight,
  Plus,
  Minus
} from 'lucide-react-native';

const StylingExample = () => {
  const { tint, strokeWidth, sizes, shadows, colors } = useTheme();

  const ExampleCard = ({ title, description, elevation }: {
    title: string;
    description: string;
    elevation: 'level2' | 'level4' | 'level8';
  }) => {
    const { handlePressIn, handlePressOut, animatedStyle } = useTapAnimation();

    return (
      <Pressable
        onPress={() => {}}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          styles.exampleCard,
          shadows[elevation],
          pressed && { opacity: 0.8 }
        ]}
      >
        <Animated.View style={[styles.cardContent, animatedStyle]}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDescription}>{description}</Text>
          <ChevronRight size={sizes.sm} color={tint} />
        </Animated.View>
      </Pressable>
    );
  };

  const IconButton = ({ icon: Icon, size }: { icon: any; size: number }) => {
    const { handlePressIn, handlePressOut, animatedStyle } = useTapAnimation();

    return (
      <Pressable
        onPress={() => {}}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          styles.iconButton,
          shadows.level2,
          pressed && { opacity: 0.8 }
        ]}
      >
        <Animated.View style={[styles.iconButtonContent, animatedStyle]}>
          <Icon size={size} color={tint} />
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Consistent Styling System</Text>
      
      {/* Elevation Examples */}
      <Text style={styles.subsectionTitle}>Elevation Scale (2/4/8)</Text>
      
      <ExampleCard 
        title="Level 2 Elevation" 
        description="Basic cards, secondary buttons, input fields"
        elevation="level2"
      />
      
      <ExampleCard 
        title="Level 4 Elevation" 
        description="Primary buttons, elevated cards, important content"
        elevation="level4"
      />
      
      <ExampleCard 
        title="Level 8 Elevation" 
        description="Premium cards, modals, hero sections"
        elevation="level8"
      />

      {/* Size System Examples */}
      <Text style={styles.subsectionTitle}>Size System (16/20/24)</Text>
      
      <View style={styles.sizeExample}>
        <IconButton icon={Home} size={sizes.sm} />
        <Text style={styles.sizeLabel}>Small (16px)</Text>
      </View>
      
      <View style={styles.sizeExample}>
        <IconButton icon={Settings} size={sizes.md} />
        <Text style={styles.sizeLabel}>Medium (20px)</Text>
      </View>
      
      <View style={styles.sizeExample}>
        <IconButton icon={User} size={sizes.lg} />
        <Text style={styles.sizeLabel}>Large (24px)</Text>
      </View>

      {/* Stroke Width Examples */}
      <Text style={styles.subsectionTitle}>Stroke Width System (1/2/3)</Text>
      
      <View style={styles.strokeExample}>
        <View style={[styles.strokeDemo, { borderWidth: strokeWidth.thin }]}>
          <Text style={styles.strokeLabel}>Thin (1px)</Text>
        </View>
      </View>
      
      <View style={styles.strokeExample}>
        <View style={[styles.strokeDemo, { borderWidth: strokeWidth.normal }]}>
          <Text style={styles.strokeLabel}>Normal (2px)</Text>
        </View>
      </View>
      
      <View style={styles.strokeExample}>
        <View style={[styles.strokeDemo, { borderWidth: strokeWidth.thick }]}>
          <Text style={styles.strokeLabel}>Thick (3px)</Text>
        </View>
      </View>

      {/* Button Examples */}
      <Text style={styles.subsectionTitle}>Button Variants</Text>
      
      <Button 
        title="Primary Button" 
        variant="primary" 
        onPress={() => {}}
        style={styles.buttonSpacing}
      />
      
      <Button 
        title="Secondary Button" 
        variant="secondary" 
        onPress={() => {}}
        style={styles.buttonSpacing}
      />
      
      <Button 
        title="Outline Button" 
        variant="outline" 
        onPress={() => {}}
        style={styles.buttonSpacing}
      />
      
      <Button 
        title="Premium Button" 
        variant="premium" 
        onPress={() => {}}
        style={styles.buttonSpacing}
      />

      {/* TappableCard Examples */}
      <Text style={styles.subsectionTitle}>TappableCard Component</Text>
      
      <TappableCard 
        elevation="level2" 
        onPress={() => {}}
        style={styles.cardSpacing}
      >
        <Text style={styles.cardText}>Basic TappableCard with Level 2</Text>
      </TappableCard>
      
      <TappableCard 
        elevation="level4" 
        onPress={() => {}}
        style={styles.cardSpacing}
      >
        <Text style={styles.cardText}>Elevated TappableCard with Level 4</Text>
      </TappableCard>
      
      <TappableCard 
        elevation="level8" 
        onPress={() => {}}
        style={styles.cardSpacing}
      >
        <Text style={styles.cardText}>Premium TappableCard with Level 8</Text>
      </TappableCard>

      {/* Theme Colors */}
      <Text style={styles.subsectionTitle}>Theme Colors</Text>
      
      <View style={styles.colorPalette}>
        <View style={[styles.colorSwatch, { backgroundColor: colors.primary }]}>
          <Text style={styles.colorLabel}>Primary</Text>
        </View>
        <View style={[styles.colorSwatch, { backgroundColor: colors.secondary }]}>
          <Text style={styles.colorLabel}>Secondary</Text>
        </View>
        <View style={[styles.colorSwatch, { backgroundColor: colors.accent }]}>
          <Text style={styles.colorLabel}>Accent</Text>
        </View>
        <View style={[styles.colorSwatch, { backgroundColor: colors.success }]}>
          <Text style={styles.colorLabel}>Success</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E1B4B',
    marginBottom: 24,
    textAlign: 'center',
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 24,
    marginBottom: 16,
  },
  exampleCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E1B4B',
    flex: 1,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    flex: 2,
    marginRight: 12,
  },
  sizeExample: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sizeLabel: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
  },
  iconButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  iconButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  strokeExample: {
    marginBottom: 12,
  },
  strokeDemo: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    borderColor: '#1E40AF',
  },
  strokeLabel: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
  },
  buttonSpacing: {
    marginBottom: 12,
  },
  cardSpacing: {
    marginBottom: 12,
  },
  cardText: {
    fontSize: 14,
    color: '#374151',
  },
  colorPalette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorSwatch: {
    width: 80,
    height: 60,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
});

export default StylingExample;









