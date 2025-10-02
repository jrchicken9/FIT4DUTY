import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  Text,
  Animated,
  Pressable,
} from 'react-native';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows, strokeWidth as strokeWidthConfig, sizes } from '@/constants/designSystem';
import { useTapAnimation } from '@/hooks/useTapAnimation';

interface SignatureCanvasProps {
  onSignatureChange: (signature: string) => void;
  width?: number;
  height?: number;
  strokeWidth?: number;
  strokeColor?: string;
  backgroundColor?: string;
}

interface Point {
  x: number;
  y: number;
}

const ClearButton = ({ onPress }: { onPress: () => void }) => {
  const { handlePressIn, handlePressOut, animatedStyle } = useTapAnimation();

  return (
    <Pressable 
      style={styles.clearButton} 
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.clearButtonContent, animatedStyle]}>
        <Text style={styles.clearButtonText}>Clear Signature</Text>
      </Animated.View>
    </Pressable>
  );
};

export default function SignatureCanvas({
  onSignatureChange,
  width = 300,
  height = 200,
  strokeWidth = 2,
  strokeColor = '#000000',
  backgroundColor = '#ffffff',
}: SignatureCanvasProps) {
  const [paths, setPaths] = useState<Point[][]>([]);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const canvasRef = useRef<View>(null);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      const newPath = [{ x: locationX, y: locationY }];
      setCurrentPath(newPath);
    },
    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      setCurrentPath(prev => [...prev, { x: locationX, y: locationY }]);
    },
    onPanResponderRelease: () => {
      if (currentPath.length > 0) {
        setPaths(prev => [...prev, currentPath]);
        setCurrentPath([]);
        // Convert to base64-like string for storage
        const signatureData = JSON.stringify([...paths, currentPath]);
        onSignatureChange(signatureData);
      }
    },
  });

  const clearSignature = () => {
    setPaths([]);
    setCurrentPath([]);
    onSignatureChange('');
  };

  const renderPath = (path: Point[], index: number) => {
    if (path.length < 2) return null;

    const pathString = path
      .map((point, i) => {
        if (i === 0) return `M ${point.x} ${point.y}`;
        return `L ${point.x} ${point.y}`;
      })
      .join(' ');

    return (
      <View
        key={index}
        style={[
          styles.path,
          {
            width: strokeWidth,
            height: strokeWidth,
            backgroundColor: strokeColor,
            borderRadius: strokeWidth / 2,
            position: 'absolute',
            left: path[0].x - strokeWidth / 2,
            top: path[0].y - strokeWidth / 2,
          },
        ]}
      />
    );
  };

  const renderCurrentPath = () => {
    if (currentPath.length < 2) return null;

    return currentPath.map((point, index) => (
      <View
        key={`current-${index}`}
        style={[
          styles.path,
          {
            width: strokeWidth,
            height: strokeWidth,
            backgroundColor: strokeColor,
            borderRadius: strokeWidth / 2,
            position: 'absolute',
            left: point.x - strokeWidth / 2,
            top: point.y - strokeWidth / 2,
          },
        ]}
      />
    ));
  };

  return (
    <View style={styles.container}>
      <View
        ref={canvasRef}
        style={[
          styles.canvas,
          {
            width,
            height,
            backgroundColor,
          },
        ]}
        {...panResponder.panHandlers}
      >
        {paths.map((path, index) => renderPath(path, index))}
        {renderCurrentPath()}
      </View>
      
      <ClearButton onPress={clearSignature} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  canvas: {
    borderWidth: strokeWidthConfig.thin,
    borderColor: Colors.border,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  path: {
    position: 'absolute',
  },
  clearButton: {
    backgroundColor: Colors.error,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    ...shadows.level2,
  },
  clearButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    ...typography.labelMedium,
    color: Colors.white,
    fontWeight: '600',
  },
});
