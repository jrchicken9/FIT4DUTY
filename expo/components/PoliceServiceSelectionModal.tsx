import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Alert,
  Animated,
  Pressable,
  StatusBar,
} from 'react-native';
import { 
  MapPin, 
  Building,
  X,
  CheckCircle,
  ArrowRight,
  Search,
  Star,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows, strokeWidth, sizes } from '@/constants/designSystem';
import { useTapAnimation } from '@/hooks/useTapAnimation';
import * as Location from 'expo-location';

interface PoliceService {
  id: string;
  name: string;
  shortName: string;
  city: string;
  region: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  isNearby?: boolean;
  distance?: number;
  isPopular?: boolean;
}

interface PoliceServiceSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onServiceSelect: (serviceId: string) => void;
  onNavigateToApplication?: () => void;
}

const ServiceCard = ({ 
  service, 
  onPress, 
  isPopular = false 
}: { 
  service: PoliceService; 
  onPress: () => void; 
  isPopular?: boolean;
}) => {
  const { handlePressIn, handlePressOut, animatedStyle } = useTapAnimation();

  return (
    <Pressable
      style={styles.serviceCard}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.serviceCardContent, animatedStyle]}>
        <View style={styles.serviceInfo}>
          <View style={styles.serviceHeader}>
            <Text style={styles.serviceName}>{service.name}</Text>
            {isPopular && (
              <View style={styles.popularBadge}>
                <Star size={sizes.xs} color={Colors.accent} fill={Colors.accent} />
                <Text style={styles.popularText}>Popular</Text>
              </View>
            )}
          </View>
          <Text style={styles.serviceLocation}>
            {service.city}, {service.region}
          </Text>
          {service.distance && (
            <Text style={styles.serviceDistance}>
              {Math.round(service.distance)}km away
            </Text>
          )}
        </View>
        <ArrowRight size={sizes.md} color={Colors.primary} />
      </Animated.View>
    </Pressable>
  );
};

const CloseButton = ({ onPress }: { onPress: () => void }) => {
  const { handlePressIn, handlePressOut, animatedStyle } = useTapAnimation();

  return (
    <Pressable 
      style={styles.closeButton} 
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.closeButtonContent, animatedStyle]}>
        <X size={sizes.lg} color={Colors.white} />
      </Animated.View>
    </Pressable>
  );
};

const PoliceServiceSelectionModal: React.FC<PoliceServiceSelectionModalProps> = ({
  visible,
  onClose,
  onServiceSelect,
  onNavigateToApplication,
}) => {
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  const policeServices: PoliceService[] = [
    {
      id: 'toronto',
      name: 'Toronto Police Service',
      shortName: 'TPS',
      city: 'Toronto',
      region: 'Greater Toronto Area',
      coordinates: { latitude: 43.6532, longitude: -79.3832 },
      isPopular: true,
    },
    {
      id: 'opp',
      name: 'Ontario Provincial Police',
      shortName: 'OPP',
      city: 'Orillia',
      region: 'Province-wide',
      coordinates: { latitude: 44.6084, longitude: -79.4201 },
      isPopular: true,
    },
    {
      id: 'peel',
      name: 'Peel Regional Police',
      shortName: 'PRP',
      city: 'Mississauga',
      region: 'Peel Region',
      coordinates: { latitude: 43.5890, longitude: -79.6441 },
    },
    {
      id: 'york',
      name: 'York Regional Police',
      shortName: 'YRP',
      city: 'Aurora',
      region: 'York Region',
      coordinates: { latitude: 44.0001, longitude: -79.4663 },
    },
    {
      id: 'durham',
      name: 'Durham Regional Police',
      shortName: 'DRPS',
      city: 'Whitby',
      region: 'Durham Region',
      coordinates: { latitude: 43.8975, longitude: -78.9428 },
    },
    {
      id: 'hamilton',
      name: 'Hamilton Police Service',
      shortName: 'HPS',
      city: 'Hamilton',
      region: 'Hamilton',
      coordinates: { latitude: 43.2557, longitude: -79.8711 },
    },
    {
      id: 'niagara',
      name: 'Niagara Regional Police',
      shortName: 'NRPS',
      city: 'Niagara Falls',
      region: 'Niagara Region',
      coordinates: { latitude: 43.0962, longitude: -79.0377 },
    },
    {
      id: 'waterloo',
      name: 'Waterloo Regional Police',
      shortName: 'WRPS',
      city: 'Kitchener',
      region: 'Waterloo Region',
      coordinates: { latitude: 43.4516, longitude: -80.4925 },
    },
    {
      id: 'london',
      name: 'London Police Service',
      shortName: 'LPS',
      city: 'London',
      region: 'London',
      coordinates: { latitude: 42.9849, longitude: -81.2453 },
    },
    {
      id: 'windsor',
      name: 'Windsor Police Service',
      shortName: 'WPS',
      city: 'Windsor',
      region: 'Windsor',
      coordinates: { latitude: 42.3149, longitude: -83.0364 },
    },
    {
      id: 'ottawa',
      name: 'Ottawa Police Service',
      shortName: 'OPS',
      city: 'Ottawa',
      region: 'Ottawa',
      coordinates: { latitude: 45.4215, longitude: -75.6972 },
    },
    {
      id: 'kingston',
      name: 'Kingston Police',
      shortName: 'KP',
      city: 'Kingston',
      region: 'Kingston',
      coordinates: { latitude: 44.2312, longitude: -76.4860 },
    },
    {
      id: 'sudbury',
      name: 'Greater Sudbury Police Service',
      shortName: 'GSPS',
      city: 'Sudbury',
      region: 'Greater Sudbury',
      coordinates: { latitude: 46.4917, longitude: -80.9930 },
    },
    {
      id: 'thunder-bay',
      name: 'Thunder Bay Police Service',
      shortName: 'TBPS',
      city: 'Thunder Bay',
      region: 'Thunder Bay',
      coordinates: { latitude: 48.3809, longitude: -89.2477 },
    }
  ];

  useEffect(() => {
    if (visible) {
      getUserLocation();
    }
  }, [visible]);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setIsLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
      
      // Calculate distances and mark nearby services
      const servicesWithDistance = policeServices.map(service => {
        const distance = calculateDistance(
          location.coords.latitude,
          location.coords.longitude,
          service.coordinates.latitude,
          service.coordinates.longitude
        );
        return {
          ...service,
          distance,
          isNearby: distance <= 100 // Within 100km
        };
      });

      // Sort by distance
      servicesWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      
    } catch (error) {
      console.error('Error getting location:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleServiceSelect = (service: PoliceService) => {
    onServiceSelect(service.id);
    onClose();
  };

  const handleClose = () => {
    if (onNavigateToApplication) {
      onNavigateToApplication();
    } else {
      onClose();
    }
  };

  const nearbyServices = policeServices.filter(service => service.isNearby);
  const popularServices = policeServices.filter(service => service.isPopular);
  const otherServices = policeServices.filter(service => !service.isNearby && !service.isPopular);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <View style={styles.container}>
        {/* Blue Header */}
        <View style={styles.blueHeader}>
          <View style={styles.headerContent}>
            <View style={styles.titleContainer}>
              <Building size={sizes.lg} color={Colors.white} />
              <Text style={styles.title}>Choose Your Police Service</Text>
            </View>
            <Text style={styles.subtitle}>
              Select the police service you want to apply to. This will customize your application experience.
            </Text>
          </View>
          <CloseButton onPress={handleClose} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={true}>
          {/* All Services */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Building size={sizes.md} color={Colors.primary} />
              <Text style={styles.sectionTitle}>All Ontario Police Services ({policeServices.length})</Text>
            </View>
            {policeServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onPress={() => handleServiceSelect(service)}
                isPopular={service.isPopular}
              />
            ))}
          </View>

          {/* Info Section */}
          <View style={styles.infoSection}>
            <CheckCircle size={sizes.md} color={Colors.success} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>You can change this later</Text>
              <Text style={styles.infoText}>
                Don't worry if you're not sure which service to choose. You can change your selection anytime from the application page.
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  blueHeader: {
    backgroundColor: Colors.primary,
    padding: spacing.lg,
    paddingTop: 50,
    paddingBottom: spacing.md,
    ...shadows.level4,
    position: 'relative',
    overflow: 'visible',
  },
  headerContent: {
    flex: 1,
    marginRight: spacing.xl,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.headingLarge,
    color: Colors.white,
    fontWeight: '700',
    marginLeft: spacing.sm,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: Colors.white + 'CC',
    lineHeight: 22,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: Colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.level2,
    zIndex: 10,
  },
  closeButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.headingSmall,
    color: Colors.text,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  serviceCard: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.level2,
    borderWidth: strokeWidth.thin,
    borderColor: Colors.border,
  },
  serviceCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  serviceName: {
    ...typography.labelLarge,
    color: Colors.text,
    fontWeight: '600',
    flex: 1,
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent + '10',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: 2,
  },
  popularText: {
    ...typography.labelSmall,
    color: Colors.accent,
    fontWeight: '600',
  },
  serviceLocation: {
    ...typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  serviceDistance: {
    ...typography.labelSmall,
    color: Colors.primary,
    fontWeight: '500',
  },
  infoSection: {
    flexDirection: 'row',
    backgroundColor: Colors.success + '10',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: strokeWidth.thin,
    borderColor: Colors.success + '20',
  },
  infoContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  infoTitle: {
    ...typography.labelLarge,
    color: Colors.success,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  infoText: {
    ...typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});

export default PoliceServiceSelectionModal;
