# Consistent Styling System Guide

This guide documents the implementation of consistent depth, motion, and styling throughout the app.

## 🎯 Design Principles

### 1. Consistent Depth & Motion
- **One elevation scale**: 2/4/8 for all shadows
- **iOS-native tap animations**: Scale 0.98 on press for all tappable elements
- **Unified stroke width**: 1/2/3 for borders and dividers
- **Consistent size system**: 16/20/24 for icons and interactive elements

### 2. Theme-Based Defaults
- **Default tint**: Set via theme, avoid per-screen overrides
- **Consistent spacing**: Using the spacing scale (4/8/16/24/32/48/64)
- **Unified typography**: Using the typography system

## 📐 Design Tokens

### Elevation Scale (2/4/8)
```typescript
// Level 2: Subtle elevation for basic cards and buttons
shadows.level2 = {
  shadowColor: Colors.shadows.light,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 1,
  shadowRadius: 4,
  elevation: 2,
}

// Level 4: Medium elevation for elevated cards and primary buttons
shadows.level4 = {
  shadowColor: Colors.shadows.medium,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 1,
  shadowRadius: 8,
  elevation: 4,
}

// Level 8: High elevation for premium cards and modals
shadows.level8 = {
  shadowColor: Colors.shadows.heavy,
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 1,
  shadowRadius: 16,
  elevation: 8,
}
```

### Stroke Width System
```typescript
strokeWidth = {
  thin: 1,    // For subtle borders
  normal: 2,  // For standard borders
  thick: 3,   // For emphasis
}
```

### Size System (16/20/24)
```typescript
sizes = {
  xs: 12,
  sm: 16,  // Base size
  md: 20,  // Medium size
  lg: 24,  // Large size
  xl: 32,
  xxl: 48,
  xxxl: 64,
}
```

### Tap Animation
```typescript
tapAnimation = {
  scale: 0.98,    // iOS-native scale
  duration: 150,  // Quick response
  easing: 'easeOut',
}
```

## 🎨 Component Usage

### 1. Using the TappableCard Component

```typescript
import TappableCard from '@/components/TappableCard';

// Basic card with level 2 elevation
<TappableCard elevation="level2" onPress={handlePress}>
  <Text>Card content</Text>
</TappableCard>

// Elevated card with level 4 elevation
<TappableCard elevation="level4" onPress={handlePress}>
  <Text>Elevated content</Text>
</TappableCard>

// Premium card with level 8 elevation
<TappableCard elevation="level8" onPress={handlePress}>
  <Text>Premium content</Text>
</TappableCard>
```

### 2. Using the Enhanced Button Component

```typescript
import Button from '@/components/Button';

// Primary button with consistent elevation
<Button 
  title="Primary Action" 
  variant="primary" 
  onPress={handlePress}
/>

// Outline button with consistent stroke width
<Button 
  title="Secondary Action" 
  variant="outline" 
  onPress={handlePress}
/>

// Premium button with higher elevation
<Button 
  title="Premium Action" 
  variant="premium" 
  onPress={handlePress}
/>
```

### 3. Using the Tap Animation Hook

```typescript
import { useTapAnimation } from '@/hooks/useTapAnimation';

const MyComponent = () => {
  const { handlePressIn, handlePressOut, animatedStyle } = useTapAnimation();

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={animatedStyle}>
        <Text>Tap me!</Text>
      </Animated.View>
    </Pressable>
  );
};
```

### 4. Using the Theme Context

```typescript
import { useTheme } from '@/context/ThemeContext';

const MyComponent = () => {
  const { tint, strokeWidth, sizes, shadows } = useTheme();

  return (
    <View style={{
      borderWidth: strokeWidth.normal,
      borderColor: tint,
      ...shadows.level2,
    }}>
      <Icon size={sizes.md} color={tint} />
    </View>
  );
};
```

## 🔧 Migration Guide

### Before (Inconsistent)
```typescript
// ❌ Inconsistent shadow values
const styles = StyleSheet.create({
  card: {
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 20,
    elevation: 12,
  },
  button: {
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 10,
    elevation: 5,
  },
});

// ❌ Hardcoded sizes
<Icon size={16} />
<Icon size={20} />
<Icon size={24} />

// ❌ Inconsistent stroke widths
borderWidth: 1,
borderWidth: 2,
borderWidth: 3,
```

### After (Consistent)
```typescript
// ✅ Using consistent elevation scale
const styles = StyleSheet.create({
  card: {
    ...shadows.level4,  // Consistent level 4 elevation
  },
  button: {
    ...shadows.level2,  // Consistent level 2 elevation
  },
});

// ✅ Using size system
<Icon size={sizes.sm} />  // 16
<Icon size={sizes.md} />  // 20
<Icon size={sizes.lg} />  // 24

// ✅ Using stroke width system
borderWidth: strokeWidth.thin,   // 1
borderWidth: strokeWidth.normal, // 2
borderWidth: strokeWidth.thick,  // 3
```

## 🎯 Best Practices

### 1. Elevation Usage
- **Level 2**: Basic cards, secondary buttons, input fields
- **Level 4**: Primary buttons, elevated cards, important content
- **Level 8**: Premium cards, modals, hero sections

### 2. Stroke Width Usage
- **Thin (1)**: Subtle borders, dividers, input fields
- **Normal (2)**: Standard borders, buttons, cards
- **Thick (3)**: Emphasis, focus states, premium elements

### 3. Size Usage
- **Small (16)**: Icons in buttons, secondary elements
- **Medium (20)**: Standard icons, primary elements
- **Large (24)**: Hero icons, important elements

### 4. Animation Usage
- **Always use tap animations** for tappable elements
- **Consistent duration** (150ms) for all tap animations
- **iOS-native scale** (0.98) for immediate feedback

## 🚀 Implementation Checklist

- [x] Updated design system with consistent tokens
- [x] Created TappableCard component with iOS-native animations
- [x] Updated Button component with consistent styling
- [x] Updated EnhancedCard component with consistent styling
- [x] Created useTapAnimation hook for reusable animations
- [x] Created ThemeContext for consistent theming
- [x] Updated WorkoutCard component as example
- [ ] Update all remaining card components
- [ ] Update all remaining button components
- [ ] Update all remaining tappable elements
- [ ] Test animations across different devices
- [ ] Verify consistent elevation throughout app

## 📱 iOS-Native Feel

The new system provides an immediate iOS-native feel through:

1. **Consistent tap feedback**: All tappable elements scale to 0.98
2. **Quick animations**: 150ms duration for immediate response
3. **Proper elevation**: 2/4/8 scale matches iOS design patterns
4. **Unified styling**: Consistent stroke widths and sizes
5. **Theme-based defaults**: No per-screen overrides needed

This creates a cohesive, professional experience that feels native to iOS users while maintaining consistency across the entire application.













