import Colors from './colors';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

// Unified elevation scale: 2/4/8 for consistent depth
export const shadows = {
  // Level 2: Subtle elevation for basic cards and buttons
  level2: {
    shadowColor: Colors.shadows.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  // Level 4: Medium elevation for elevated cards and primary buttons
  level4: {
    shadowColor: Colors.shadows.medium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  // Level 8: High elevation for premium cards and modals
  level8: {
    shadowColor: Colors.shadows.heavy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  // Legacy shadow names for backward compatibility
  light: {
    shadowColor: Colors.shadows.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: Colors.shadows.medium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  heavy: {
    shadowColor: Colors.shadows.heavy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  colored: {
    shadowColor: Colors.shadows.colored,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  premium: {
    shadowColor: Colors.shadows.colored,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  small: {
    shadowColor: Colors.shadows.light,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 1,
  },
  police: {
    shadowColor: Colors.shadows.police,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  alert: {
    shadowColor: Colors.shadows.alert,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
};

// Unified stroke width system
export const strokeWidth = {
  thin: 1,
  normal: 2,
  thick: 3,
};

// Unified size system: 16/20/24
export const sizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// iOS-native tap animation configuration
export const tapAnimation = {
  scale: 0.98,
  duration: 150,
  easing: 'easeOut',
};

export const typography = {
  // Display styles - Bold, authoritative headers
  displayLarge: {
    fontSize: 36,
    fontWeight: '900' as const,
    lineHeight: 44,
    letterSpacing: -0.8,
  },
  displayMedium: {
    fontSize: 32,
    fontWeight: '800' as const,
    lineHeight: 40,
    letterSpacing: -0.6,
  },
  displaySmall: {
    fontSize: 28,
    fontWeight: '800' as const,
    lineHeight: 36,
    letterSpacing: -0.4,
  },

  // Heading styles - Clear hierarchy
  headingLarge: {
    fontSize: 24,
    fontWeight: '800' as const,
    lineHeight: 32,
    letterSpacing: -0.2,
  },
  headingMedium: {
    fontSize: 20,
    fontWeight: '700' as const,
    lineHeight: 28,
    letterSpacing: -0.1,
  },
  headingSmall: {
    fontSize: 18,
    fontWeight: '700' as const,
    lineHeight: 26,
    letterSpacing: -0.1,
  },

  // Body styles - Clean, readable text
  bodyLarge: {
    fontSize: 17,
    fontWeight: '400' as const,
    lineHeight: 26,
  },
  bodyMedium: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  },

  // Label styles - Clear, actionable text
  labelLarge: {
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontSize: 13,
    fontWeight: '600' as const,
    lineHeight: 18,
    letterSpacing: 0.1,
  },
  labelSmall: {
    fontSize: 11,
    fontWeight: '600' as const,
    lineHeight: 16,
    letterSpacing: 0.1,
  },

  // Premium styles - For special content
  premium: {
    fontSize: 16,
    fontWeight: '700' as const,
    lineHeight: 24,
    letterSpacing: 0.2,
  },

  // Legacy typography properties for backward compatibility
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  h1: {
    fontSize: 32,
    fontWeight: '800' as const,
    lineHeight: 40,
    letterSpacing: -0.6,
  },
  h2: {
    fontSize: 24,
    fontWeight: '800' as const,
    lineHeight: 32,
    letterSpacing: -0.2,
  },
  h3: {
    fontSize: 20,
    fontWeight: '700' as const,
    lineHeight: 28,
    letterSpacing: -0.1,
  },
  h4: {
    fontSize: 18,
    fontWeight: '700' as const,
    lineHeight: 26,
    letterSpacing: -0.1,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    letterSpacing: 0.1,
  },
  small: {
    fontSize: 11,
    fontWeight: '400' as const,
    lineHeight: 14,
    letterSpacing: 0.1,
  },
};

export const componentStyles = {
  // Card styles - Modern, elevated cards with consistent depth
  card: {
    backgroundColor: Colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.level2,
  },
  cardElevated: {
    backgroundColor: Colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.level4,
  },
  cardHeavy: {
    backgroundColor: Colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.level8,
  },
  cardPremium: {
    backgroundColor: Colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.level8,
  },

  // Button styles - Modern, iOS-native buttons with consistent depth
  button: {
    primary: {
      backgroundColor: Colors.primary,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      ...shadows.level2,
    },
    secondary: {
      backgroundColor: Colors.secondary,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      ...shadows.level2,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: strokeWidth.normal,
      borderColor: Colors.primary,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderRadius: borderRadius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    premium: {
      backgroundColor: Colors.primary,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      ...shadows.level4,
    },
  },

  // Input styles - Clean, modern inputs with consistent depth
  input: {
    backgroundColor: Colors.white,
    borderWidth: strokeWidth.thin,
    borderColor: Colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    ...shadows.level2,
  },

  // Badge styles - Modern badges with consistent sizing
  badge: {
    primary: {
      backgroundColor: Colors.primary + '15',
      borderRadius: borderRadius.full,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    success: {
      backgroundColor: Colors.success + '15',
      borderRadius: borderRadius.full,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    warning: {
      backgroundColor: Colors.warning + '15',
      borderRadius: borderRadius.full,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    error: {
      backgroundColor: Colors.error + '15',
      borderRadius: borderRadius.full,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    premium: {
      backgroundColor: Colors.accent + '15',
      borderRadius: borderRadius.full,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    police: {
      backgroundColor: Colors.policeRedLight,
      borderRadius: borderRadius.full,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderWidth: strokeWidth.thin,
      borderColor: Colors.policeRedBorder,
    },
  alert: {
    backgroundColor: Colors.policeRedMedium,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderWidth: strokeWidth.thin,
    borderColor: Colors.policeRed,
  },
  siren: {
    backgroundColor: Colors.policeRedLight,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderWidth: strokeWidth.thin,
    borderColor: Colors.policeRed,
  },
  sirenBlue: {
    backgroundColor: Colors.policeBlueLight,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderWidth: strokeWidth.thin,
    borderColor: Colors.policeBlue,
  },
  },
};

export const helpStyles = {
  helpCard: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    margin: spacing.sm,
    padding: spacing.md,
    ...shadows.level2,
  },
  helpIcon: {
    width: sizes.md,
    height: sizes.md,
    borderRadius: borderRadius.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: spacing.sm,
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  helpDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
};

export const layout = {
  // Container styles
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  center: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  spaceBetween: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
};

export const animations = {
  // Animation configurations - Smooth, iOS-native feel
  spring: {
    tension: 120,
    friction: 10,
  },
  timing: {
    duration: 400,
  },
  easing: {
    ease: 'easeOut',
  },
  premium: {
    tension: 150,
    friction: 12,
  },
  // iOS-native tap animation
  tap: {
    scale: tapAnimation.scale,
    duration: tapAnimation.duration,
    easing: tapAnimation.easing,
  },
};

// Unified icon sizes using the size system
export const iconSizes = {
  xs: sizes.xs,
  sm: sizes.sm,
  md: sizes.md,
  lg: sizes.lg,
  xl: sizes.xl,
  xxl: sizes.xxl,
  xxxl: sizes.xxxl,
};

// New premium-specific styles with consistent depth
export const premiumStyles = {
  // Hero section styles
  hero: {
    container: {
      backgroundColor: Colors.white,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      ...shadows.level8,
    },
    greeting: {
      ...typography.displaySmall,
      color: Colors.text,
      marginBottom: spacing.xs,
    },
    subtitle: {
      ...typography.bodyLarge,
      color: Colors.textSecondary,
      marginBottom: spacing.lg,
    },
  },

  // Progress ring styles (Apple Fitness+ inspired)
  progressRing: {
    container: {
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    ring: {
      position: 'absolute' as const,
    },
    label: {
      ...typography.headingMedium,
      color: Colors.text,
      textAlign: 'center' as const,
    },
    subtitle: {
      ...typography.bodyMedium,
      color: Colors.textSecondary,
      textAlign: 'center' as const,
    },
  },

  // Feature card styles with consistent depth
  featureCard: {
    container: {
      backgroundColor: Colors.white,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      marginBottom: spacing.md,
      ...shadows.level4,
    },
    header: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      marginBottom: spacing.md,
    },
    title: {
      ...typography.headingMedium,
      color: Colors.text,
      marginLeft: spacing.sm,
    },
    description: {
      ...typography.bodyMedium,
      color: Colors.textSecondary,
      marginBottom: spacing.md,
    },
  },

  // Upgrade prompt styles with consistent depth
  upgradePrompt: {
    container: {
      backgroundColor: Colors.white,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      borderWidth: strokeWidth.normal,
      borderColor: Colors.accent + '20',
      ...shadows.level8,
    },
    header: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      marginBottom: spacing.md,
    },
    title: {
      ...typography.headingMedium,
      color: Colors.accent,
      marginLeft: spacing.sm,
    },
    description: {
      ...typography.bodyMedium,
      color: Colors.textSecondary,
      marginBottom: spacing.lg,
    },
    features: {
      marginBottom: spacing.lg,
    },
    feature: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      marginBottom: spacing.sm,
    },
    featureText: {
      ...typography.bodyMedium,
      color: Colors.text,
      marginLeft: spacing.sm,
    },
  },
};

// Theme configuration with default tint
export const theme = {
  // Default tint color for all interactive elements
  tint: Colors.primary,
  // Default stroke width for borders and dividers
  strokeWidth: strokeWidth.normal,
  // Default sizes for icons and interactive elements
  iconSize: sizes.md,
  // Default elevation for cards
  cardElevation: shadows.level2,
  // Default button elevation
  buttonElevation: shadows.level2,
  // Default animation configuration
  animation: animations.tap,
};

export default {
  spacing,
  borderRadius,
  shadows,
  strokeWidth,
  sizes,
  tapAnimation,
  typography,
  componentStyles,
  helpStyles,
  layout,
  animations,
  iconSizes,
  premiumStyles,
  theme,
};
