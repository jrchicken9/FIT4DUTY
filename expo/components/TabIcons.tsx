import React from 'react';
import { View, StyleSheet } from 'react-native';
import { 
  Home, 
  FileText, 
  Dumbbell, 
  Users, 
  User,
  Target,
  Award,
  Shield,
  Heart,
  Star
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { iconSizes } from '@/constants/designSystem';

interface TabIconProps {
  name: 'dashboard' | 'application' | 'fitness' | 'community' | 'profile';
  focused: boolean;
  size?: number;
}

export default function TabIcon({ name, focused, size = 24 }: TabIconProps) {
  const iconColor = focused ? Colors.white : Colors.white + '80';
  const bgColor = focused ? Colors.white + '20' : 'transparent';

  const renderIcon = () => {
    switch (name) {
      case 'dashboard':
        return (
          <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
            <Home size={size} color={iconColor} />
            {focused && <View style={[styles.activeIndicator, { backgroundColor: Colors.white }]} />}
          </View>
        );
      
      case 'application':
        return (
          <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
            <View style={styles.applicationIcon}>
              <FileText size={size * 0.8} color={iconColor} />
              <Target size={size * 0.4} color={Colors.accent} style={styles.overlayIcon} />
            </View>
            {focused && <View style={[styles.activeIndicator, { backgroundColor: Colors.white }]} />}
          </View>
        );
      
      case 'fitness':
        return (
          <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
            <View style={styles.fitnessIcon}>
              <Dumbbell size={size * 0.8} color={iconColor} />
              <Heart size={size * 0.4} color={Colors.success} style={styles.overlayIcon} />
            </View>
            {focused && <View style={[styles.activeIndicator, { backgroundColor: Colors.white }]} />}
          </View>
        );
      
      case 'community':
        return (
          <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
            <View style={styles.communityIcon}>
              <Users size={size * 0.8} color={iconColor} />
              <Star size={size * 0.4} color={Colors.warning} style={styles.overlayIcon} />
            </View>
            {focused && <View style={[styles.activeIndicator, { backgroundColor: Colors.white }]} />}
          </View>
        );
      
      case 'profile':
        return (
          <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
            <View style={styles.profileIcon}>
              <User size={size * 0.8} color={iconColor} />
              <Shield size={size * 0.4} color={Colors.secondary} style={styles.overlayIcon} />
            </View>
            {focused && <View style={[styles.activeIndicator, { backgroundColor: Colors.white }]} />}
          </View>
        );
      
      default:
        return <Home size={size} color={iconColor} />;
    }
  };

  return renderIcon();
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 4,
    position: 'relative',
  },
  applicationIcon: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fitnessIcon: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  communityIcon: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIcon: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
