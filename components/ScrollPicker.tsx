import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

const { width: screenWidth } = Dimensions.get('window');

interface ScrollPickerProps {
  data: (string | number)[];
  selectedValue: string | number;
  onValueChange: (value: string | number) => void;
  itemHeight?: number;
  visibleItems?: number;
  suffix?: string;
  label?: string;
  testID?: string;
}

export default function ScrollPicker({
  data,
  selectedValue,
  onValueChange,
  itemHeight = 60,
  visibleItems = 5,
  suffix = '',
  label = '',
  testID,
}: ScrollPickerProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [momentum, setMomentum] = useState(0);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrollY = useRef(0);
  const velocityTracker = useRef<number[]>([]);
  const isInitializedRef = useRef(false);
  const containerHeight = itemHeight * visibleItems;
  const paddingVertical = (containerHeight - itemHeight) / 2;

  // Initialize scroll position
  useEffect(() => {
    const selectedIndex = data.findIndex(item => item.toString() === selectedValue.toString());
    if (selectedIndex !== -1 && selectedIndex !== currentIndex) {
      setCurrentIndex(selectedIndex);
      
      if (scrollViewRef.current && !isScrolling) {
        const scrollToPosition = () => {
          scrollViewRef.current?.scrollTo({
            y: selectedIndex * itemHeight,
            animated: isInitializedRef.current,
          });
          isInitializedRef.current = true;
        };
        
        if (isInitializedRef.current) {
          setTimeout(scrollToPosition, 100);
        } else {
          scrollToPosition();
        }
      }
    }
  }, [selectedValue, data, itemHeight, currentIndex, isScrolling]);

  // Track touch state for gesture isolation
  const [isTouching, setIsTouching] = useState(false);

  const updateValue = useCallback((index: number) => {
    if (index >= 0 && index < data.length && index !== currentIndex) {
      const newValue = data[index];
      setCurrentIndex(index);
      onValueChange(newValue);
      
      if (Platform.OS !== 'web') {
        Haptics.selectionAsync();
      }
    }
  }, [data, currentIndex, onValueChange]);

  const handleScroll = useCallback((event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.max(0, Math.min(Math.round(y / itemHeight), data.length - 1));
    
    // Track velocity for momentum calculation
    const velocity = Math.abs(y - lastScrollY.current);
    velocityTracker.current.push(velocity);
    if (velocityTracker.current.length > 5) {
      velocityTracker.current.shift();
    }
    lastScrollY.current = y;
    
    // Calculate momentum for visual effects
    const avgVelocity = velocityTracker.current.reduce((a, b) => a + b, 0) / velocityTracker.current.length;
    setMomentum(Math.min(avgVelocity / 10, 1));
    
    if (!isScrolling) {
      setIsScrolling(true);
      
      // Enhanced scroll start animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
    
    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Update current index with smooth transition
    if (index !== currentIndex) {
      setCurrentIndex(index);
      
      // Light haptic feedback during scroll (iOS only to avoid performance issues)
      if (Platform.OS === 'ios') {
        Haptics.selectionAsync();
      }
    }
  }, [isScrolling, itemHeight, data.length, fadeAnim, glowAnim, currentIndex]);

  const handleScrollEnd = useCallback((event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.max(0, Math.min(Math.round(y / itemHeight), data.length - 1));
    
    // Clear any pending timeout and reset velocity tracking
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    velocityTracker.current = [];
    setMomentum(0);
    
    // Enhanced snap-to-position with easing
    const targetY = index * itemHeight;
    const snapThreshold = itemHeight * 0.1; // More precise snapping
    
    if (Math.abs(y - targetY) > snapThreshold) {
      scrollViewRef.current?.scrollTo({
        y: targetY,
        animated: true,
      });
    }
    
    // Smooth end animation with enhanced feedback
    setIsScrolling(false);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.08,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 300,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
    
    // Update value with enhanced haptic feedback
    if (index !== currentIndex) {
      updateValue(index);
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
  }, [itemHeight, data.length, fadeAnim, glowAnim, scaleAnim, currentIndex, updateValue]);

  const getItemOpacity = useCallback((index: number) => {
    const distance = Math.abs(index - currentIndex);
    const momentumFactor = 1 - (momentum * 0.3); // Reduce opacity more during fast scrolling
    
    if (distance === 0) return 1;
    if (distance === 1) return Math.max(0.7 * momentumFactor, 0.4);
    if (distance === 2) return Math.max(0.4 * momentumFactor, 0.2);
    return Math.max(0.2 * momentumFactor, 0.1);
  }, [currentIndex, momentum]);
  
  const getItemScale = useCallback((index: number) => {
    const distance = Math.abs(index - currentIndex);
    const momentumScale = 1 - (momentum * 0.1); // Slight scale reduction during momentum
    
    if (distance === 0) return 1 * momentumScale;
    if (distance === 1) return 0.88 * momentumScale;
    if (distance === 2) return 0.78 * momentumScale;
    return 0.7 * momentumScale;
  }, [currentIndex, momentum]);

  return (
    <View 
      style={styles.pickerWrapper} 
      testID={testID}
    >
      {label ? (
        <Text style={styles.pickerLabel} accessibilityRole="text">
          {label}
        </Text>
      ) : null}
      
      <View 
        style={[styles.container, { height: containerHeight }]}
        onStartShouldSetResponder={() => isTouching}
        onMoveShouldSetResponder={() => isTouching}
        onResponderGrant={() => {
          // Prevent parent scroll when picker is active
        }}
        onResponderMove={() => {
          // Allow ScrollView to handle the movement
          return false;
        }}
        onResponderRelease={() => {
          // Release control
        }}
      >
        {/* Enhanced gradient overlays with glow effect */}
        <Animated.View 
          style={[
            styles.gradientOverlay, 
            styles.topGradient,
            { opacity: Animated.add(0.9, Animated.multiply(glowAnim, 0.1)) }
          ]} 
        />
        <Animated.View 
          style={[
            styles.gradientOverlay, 
            styles.bottomGradient,
            { opacity: Animated.add(0.9, Animated.multiply(glowAnim, 0.1)) }
          ]} 
        />
        
        {/* Dynamic selection indicator with glow */}
        <Animated.View 
          style={[
            styles.selectionIndicator, 
            { 
              top: paddingVertical, 
              height: itemHeight,
              transform: [{ scale: scaleAnim }],
              shadowOpacity: Animated.multiply(glowAnim, 0.3),
            }
          ]} 
        />
        
        {/* Enhanced side indicators with momentum response */}
        <Animated.View 
          style={[
            styles.sideIndicators,
            { opacity: Animated.add(0.6, Animated.multiply(glowAnim, 0.4)) }
          ]}
        >
          <View style={[styles.sideIndicator, styles.leftIndicator]} />
          <View style={[styles.sideIndicator, styles.rightIndicator]} />
        </Animated.View>
      
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={{
            paddingVertical,
          }}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          onMomentumScrollEnd={handleScrollEnd}
          onScrollEndDrag={handleScrollEnd}
          onScrollBeginDrag={() => {
            setIsScrolling(true);
            setIsTouching(true);
            velocityTracker.current = [];
            if (scrollTimeoutRef.current) {
              clearTimeout(scrollTimeoutRef.current);
            }
          }}
          onTouchStart={() => {
            setIsTouching(true);
          }}
          onTouchEnd={() => {
            setIsTouching(false);
          }}
          onTouchCancel={() => {
            setIsTouching(false);
          }}
          scrollEventThrottle={8}
          snapToInterval={itemHeight}
          snapToAlignment="start"
          decelerationRate={Platform.select({
            ios: 0.996,
            android: 0.985,
            web: 0.998,
            default: 0.99,
          }) as any}
          bounces={Platform.OS === 'ios'}
          overScrollMode="never"
          nestedScrollEnabled={false}
          directionalLockEnabled={true}
          removeClippedSubviews={true}
          keyboardShouldPersistTaps="handled"
          disableIntervalMomentum={false}
          pagingEnabled={false}
        >
          {data.map((item, index) => {
            const isSelected = index === currentIndex;
            const opacity = getItemOpacity(index);
            const scale = getItemScale(index);
            const distance = Math.abs(index - currentIndex);
            
            return (
              <Animated.View 
                key={`${item}-${index}`} 
                style={[
                  styles.item, 
                  { 
                    height: itemHeight,
                    opacity: isScrolling ? fadeAnim : opacity,
                    transform: [{ scale }]
                  }
                ]}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`${item}${suffix}${isSelected ? ', selected' : ''}`}
                accessibilityHint={isSelected ? 'Currently selected value' : 'Scroll to select this value'}
              >
                <Animated.Text 
                  style={[
                    styles.itemText, 
                    isSelected && styles.selectedItemText,
                    {
                      opacity: isSelected ? 1 : Math.max(0.6, 1 - (distance * 0.2)),
                      transform: [
                        { 
                          translateY: isSelected ? 
                            Animated.multiply(scaleAnim.interpolate({
                              inputRange: [1, 1.08],
                              outputRange: [0, -1],
                              extrapolate: 'clamp'
                            }), 1) : 0
                        }
                      ]
                    }
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit={Platform.OS === 'ios'}
                  minimumFontScale={0.8}
                >
                  <Text>{item}{suffix}</Text>
                </Animated.Text>
              </Animated.View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pickerWrapper: {
    alignItems: 'center',
    marginVertical: 8,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
  },
  container: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    width: Math.min(screenWidth * 0.4, 160),
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: `0 4px 12px ${Colors.primary}15`,
      },
    }),
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 50,
    zIndex: 2,
    pointerEvents: 'none',
  },
  topGradient: {
    top: 0,
    backgroundColor: Colors.white + 'F0',
    ...Platform.select({
      web: {
        backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.95), transparent)',
      },
    }),
  },
  bottomGradient: {
    bottom: 0,
    backgroundColor: Colors.white + 'F0',
    ...Platform.select({
      web: {
        backgroundImage: 'linear-gradient(to top, rgba(255,255,255,0.95), transparent)',
      },
    }),
  },
  selectionIndicator: {
    position: 'absolute',
    left: 6,
    right: 6,
    backgroundColor: Colors.primary + '0A',
    borderWidth: 2,
    borderColor: Colors.primary + '30',
    borderRadius: 16,
    zIndex: 1,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: `0 2px 12px ${Colors.primary}25`,
      },
    }),
  },
  sideIndicators: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    pointerEvents: 'none',
  },
  sideIndicator: {
    position: 'absolute',
    width: 4,
    backgroundColor: Colors.primary + '50',
    borderRadius: 2,
  },
  leftIndicator: {
    left: 2,
    top: '35%',
    bottom: '35%',
  },
  rightIndicator: {
    right: 2,
    top: '35%',
    bottom: '35%',
  },
  scrollView: {
    flex: 1,
  },
  item: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  itemText: {
    fontSize: 19,
    color: Colors.textSecondary,
    fontWeight: '500',
    letterSpacing: 0.3,
    textAlign: 'center',
    includeFontPadding: false,
    ...Platform.select({
      ios: {
        lineHeight: 22,
      },
      android: {
        textAlignVertical: 'center',
      },
    }),
  },
  selectedItemText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 24,
    letterSpacing: 0.5,
    ...Platform.select({
      ios: {
        lineHeight: 28,
      },
    }),
  },
});