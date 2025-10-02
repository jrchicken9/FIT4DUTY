import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Linking,
  Dimensions,
  Animated,
  Pressable,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  MapPin, 
  ExternalLink, 
  Users, 
  Calendar, 
  Award,
  Star,
  CheckCircle,
  ArrowRight,
  Building,
  Phone,
  Globe,
  Mail,
  Clock,
  TrendingUp,
  Shield,
  Car,
  GraduationCap,
  Search,
  Filter,
  Heart,
  Share2,
  Bookmark,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { router } from 'expo-router';
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
  applicationUrl: string;
  phone: string;
  website: string;
  email: string;
  description: string;
  requirements: string[];
  benefits: string[];
  salary: {
    starting: string;
    max: string;
  };
  hiringStatus: 'Active' | 'Limited' | 'Closed';
  nextHiringDate?: string;
  specializations: string[];
  isNearby?: boolean;
  distance?: number;
  isPopular?: boolean;
  isRecommended?: boolean;
}

const PoliceServiceSelector: React.FC = () => {
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [selectedService, setSelectedService] = useState<PoliceService | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'nearby' | 'popular'>('all');

  const policeServices: PoliceService[] = [
    {
      id: 'toronto',
      name: 'Toronto Police Service',
      shortName: 'TPS',
      city: 'Toronto',
      region: 'Greater Toronto Area',
      coordinates: { latitude: 43.6532, longitude: -79.3832 },
      applicationUrl: 'https://www.torontopolice.on.ca/careers/',
      phone: '416-808-2222',
      website: 'https://www.torontopolice.on.ca/',
      email: 'recruiting@torontopolice.on.ca',
      description: 'The largest municipal police service in Canada, serving over 2.9 million residents in Toronto.',
      requirements: [
        'OACP Certificate required',
        'Minimum 18 years of age',
        'Canadian citizen or permanent resident',
        'Valid driver\'s license',
        'High school diploma or equivalent',
        'Clean criminal record',
        'Physical fitness standards met'
      ],
      benefits: [
        'Competitive salary with annual increases',
        'Comprehensive health and dental benefits',
        'Pension plan',
        'Professional development opportunities',
        'Diverse career paths and specializations',
        'Work-life balance programs'
      ],
      salary: {
        starting: '$65,000',
        max: '$100,000+'
      },
      hiringStatus: 'Active',
      nextHiringDate: 'Ongoing',
      specializations: ['Traffic', 'Homicide', 'Cyber Crime', 'Community Response', 'Emergency Task Force'],
      isPopular: true,
      isRecommended: true,
    },
    {
      id: 'opp',
      name: 'Ontario Provincial Police',
      shortName: 'OPP',
      city: 'Orillia',
      region: 'Province-wide',
      coordinates: { latitude: 44.6084, longitude: -79.4201 },
      applicationUrl: 'https://www.opp.ca/index.php?id=115',
      phone: '1-888-310-1122',
      website: 'https://www.opp.ca/',
      email: 'recruiting@opp.ca',
      description: 'The provincial police service providing law enforcement across Ontario, including highways and rural areas.',
      requirements: [
        'OACP Certificate required',
        'Minimum 18 years of age',
        'Canadian citizen or permanent resident',
        'Valid driver\'s license',
        'High school diploma or equivalent',
        'Clean criminal record',
        'Physical fitness standards met'
      ],
      benefits: [
        'Province-wide deployment opportunities',
        'Competitive salary and benefits',
        'Pension plan',
        'Professional development and training',
        'Diverse policing environments',
        'Career advancement opportunities'
      ],
      salary: {
        starting: '$62,000',
        max: '$95,000+'
      },
      hiringStatus: 'Active',
      nextHiringDate: 'Ongoing',
      specializations: ['Highway Safety', 'Rural Policing', 'Marine', 'Aviation', 'Emergency Response'],
      isPopular: true,
    },
    {
      id: 'peel',
      name: 'Peel Regional Police',
      shortName: 'PRP',
      city: 'Mississauga',
      region: 'Peel Region',
      coordinates: { latitude: 43.5890, longitude: -79.6441 },
      applicationUrl: 'https://www.peelpolice.ca/en/contact-us/careers.aspx',
      phone: '905-453-3311',
      website: 'https://www.peelpolice.ca/',
      email: 'recruiting@peelpolice.ca',
      description: 'Serving the diverse communities of Mississauga and Brampton with modern policing approaches.',
      requirements: [
        'OACP Certificate required',
        'Minimum 18 years of age',
        'Canadian citizen or permanent resident',
        'Valid driver\'s license',
        'High school diploma or equivalent',
        'Clean criminal record',
        'Physical fitness standards met'
      ],
      benefits: [
        'Competitive salary and benefits',
        'Pension plan',
        'Professional development',
        'Community-focused policing',
        'Diverse work environment',
        'Career growth opportunities'
      ],
      salary: {
        starting: '$63,000',
        max: '$98,000+'
      },
      hiringStatus: 'Active',
      nextHiringDate: 'Ongoing',
      specializations: ['Community Policing', 'Traffic', 'Investigations', 'Youth Services', 'Cyber Crime'],
      isRecommended: true,
      isPopular: true,
    },
    {
      id: 'york',
      name: 'York Regional Police',
      shortName: 'YRP',
      city: 'Aurora',
      region: 'York Region',
      coordinates: { latitude: 44.0001, longitude: -79.4663 },
      applicationUrl: 'https://www.yrp.ca/en/contact-us/careers.aspx',
      phone: '1-866-876-5423',
      website: 'https://www.yrp.ca/',
      email: 'recruiting@yrp.ca',
      description: 'Serving the growing communities of York Region with innovative policing strategies.',
      requirements: [
        'OACP Certificate required',
        'Minimum 18 years of age',
        'Canadian citizen or permanent resident',
        'Valid driver\'s license',
        'High school diploma or equivalent',
        'Clean criminal record',
        'Physical fitness standards met'
      ],
      benefits: [
        'Competitive salary and benefits',
        'Pension plan',
        'Professional development',
        'Community-focused policing',
        'Diverse work environment',
        'Career growth opportunities'
      ],
      salary: {
        starting: '$64,000',
        max: '$99,000+'
      },
      hiringStatus: 'Active',
      nextHiringDate: 'Ongoing',
      specializations: ['Community Policing', 'Traffic', 'Investigations', 'Youth Services', 'Cyber Crime'],
    },
    {
      id: 'durham',
      name: 'Durham Regional Police',
      shortName: 'DRPS',
      city: 'Whitby',
      region: 'Durham Region',
      coordinates: { latitude: 43.8975, longitude: -78.9428 },
      applicationUrl: 'https://www.drps.ca/careers/',
      phone: '1-888-579-1520',
      website: 'https://www.drps.ca/',
      email: 'recruiting@drps.ca',
      description: 'Serving the communities of Durham Region including Oshawa, Whitby, Ajax, and Pickering.',
      requirements: [
        'OACP Certificate required',
        'Minimum 18 years of age',
        'Canadian citizen or permanent resident',
        'Valid driver\'s license',
        'High school diploma or equivalent',
        'Clean criminal record',
        'Physical fitness standards met'
      ],
      benefits: [
        'Competitive salary and benefits',
        'Pension plan',
        'Professional development',
        'Community-focused policing',
        'Diverse work environment',
        'Career growth opportunities'
      ],
      salary: {
        starting: '$61,000',
        max: '$96,000+'
      },
      hiringStatus: 'Active',
      nextHiringDate: 'Ongoing',
      specializations: ['Community Policing', 'Traffic', 'Investigations', 'Youth Services', 'Cyber Crime'],
    },
    {
      id: 'hamilton',
      name: 'Hamilton Police Service',
      shortName: 'HPS',
      city: 'Hamilton',
      region: 'Hamilton',
      coordinates: { latitude: 43.2557, longitude: -79.8711 },
      applicationUrl: 'https://www.hamiltonpolice.on.ca/careers/',
      phone: '905-546-4925',
      website: 'https://www.hamiltonpolice.on.ca/',
      email: 'recruiting@hamiltonpolice.on.ca',
      description: 'Serving the City of Hamilton, a major port city and industrial center in Southern Ontario.',
      requirements: [
        'OACP Certificate required',
        'Minimum 18 years of age',
        'Canadian citizen or permanent resident',
        'Valid driver\'s license',
        'High school diploma or equivalent',
        'Clean criminal record',
        'Physical fitness standards met'
      ],
      benefits: [
        'Competitive salary and benefits',
        'Pension plan',
        'Professional development',
        'Community-focused policing',
        'Diverse work environment',
        'Career growth opportunities'
      ],
      salary: {
        starting: '$60,000',
        max: '$94,000+'
      },
      hiringStatus: 'Active',
      nextHiringDate: 'Ongoing',
      specializations: ['Community Policing', 'Traffic', 'Investigations', 'Youth Services', 'Cyber Crime'],
    },
    {
      id: 'niagara',
      name: 'Niagara Regional Police',
      shortName: 'NRPS',
      city: 'Niagara Falls',
      region: 'Niagara Region',
      coordinates: { latitude: 43.0962, longitude: -79.0377 },
      applicationUrl: 'https://www.niagarapolice.ca/careers/',
      phone: '905-688-4111',
      website: 'https://www.niagarapolice.ca/',
      email: 'recruiting@niagarapolice.ca',
      description: 'Serving the Niagara Region including Niagara Falls, St. Catharines, and Welland.',
      requirements: [
        'OACP Certificate required',
        'Minimum 18 years of age',
        'Canadian citizen or permanent resident',
        'Valid driver\'s license',
        'High school diploma or equivalent',
        'Clean criminal record',
        'Physical fitness standards met'
      ],
      benefits: [
        'Competitive salary and benefits',
        'Pension plan',
        'Professional development',
        'Tourism-focused policing opportunities',
        'Diverse work environment',
        'Career growth opportunities'
      ],
      salary: {
        starting: '$59,000',
        max: '$93,000+'
      },
      hiringStatus: 'Active',
      nextHiringDate: 'Ongoing',
      specializations: ['Community Policing', 'Traffic', 'Tourism Policing', 'Marine Unit', 'Emergency Response'],
    },
    {
      id: 'waterloo',
      name: 'Waterloo Regional Police',
      shortName: 'WRPS',
      city: 'Kitchener',
      region: 'Waterloo Region',
      coordinates: { latitude: 43.4516, longitude: -80.4925 },
      applicationUrl: 'https://www.wrps.on.ca/careers/',
      phone: '519-570-9777',
      website: 'https://www.wrps.on.ca/',
      email: 'recruiting@wrps.on.ca',
      description: 'Serving the Waterloo Region including Kitchener, Waterloo, and Cambridge.',
      requirements: [
        'OACP Certificate required',
        'Minimum 18 years of age',
        'Canadian citizen or permanent resident',
        'Valid driver\'s license',
        'High school diploma or equivalent',
        'Clean criminal record',
        'Physical fitness standards met'
      ],
      benefits: [
        'Competitive salary and benefits',
        'Pension plan',
        'Professional development',
        'Technology-focused policing opportunities',
        'Diverse work environment',
        'Career growth opportunities'
      ],
      salary: {
        starting: '$62,000',
        max: '$97,000+'
      },
      hiringStatus: 'Active',
      nextHiringDate: 'Ongoing',
      specializations: ['Community Policing', 'Traffic', 'Cyber Crime Unit', 'Emergency Response', 'Youth Services'],
    },
    {
      id: 'london',
      name: 'London Police Service',
      shortName: 'LPS',
      city: 'London',
      region: 'London',
      coordinates: { latitude: 42.9849, longitude: -81.2453 },
      applicationUrl: 'https://www.londonpolice.ca/careers/',
      phone: '519-661-5670',
      website: 'https://www.londonpolice.ca/',
      email: 'recruiting@londonpolice.ca',
      description: 'Serving the City of London, a major educational and healthcare center in Southwestern Ontario.',
      requirements: [
        'OACP Certificate required',
        'Minimum 18 years of age',
        'Canadian citizen or permanent resident',
        'Valid driver\'s license',
        'High school diploma or equivalent',
        'Clean criminal record',
        'Physical fitness standards met'
      ],
      benefits: [
        'Competitive salary and benefits',
        'Pension plan',
        'Professional development',
        'Community-focused policing',
        'Diverse work environment',
        'Career growth opportunities'
      ],
      salary: {
        starting: '$61,000',
        max: '$95,000+'
      },
      hiringStatus: 'Active',
      nextHiringDate: 'Ongoing',
      specializations: ['Community Policing', 'Traffic', 'Cyber Crime Unit', 'Emergency Response', 'Youth Services'],
    },
    {
      id: 'windsor',
      name: 'Windsor Police Service',
      shortName: 'WPS',
      city: 'Windsor',
      region: 'Windsor',
      coordinates: { latitude: 42.3149, longitude: -83.0364 },
      applicationUrl: 'https://www.windsorpolice.ca/careers/',
      phone: '519-255-6700',
      website: 'https://www.windsorpolice.ca/',
      email: 'recruiting@windsorpolice.ca',
      description: 'Serving the City of Windsor, a major border city and automotive center in Southwestern Ontario.',
      requirements: [
        'OACP Certificate required',
        'Minimum 18 years of age',
        'Canadian citizen or permanent resident',
        'Valid driver\'s license',
        'High school diploma or equivalent',
        'Clean criminal record',
        'Physical fitness standards met'
      ],
      benefits: [
        'Competitive salary and benefits',
        'Pension plan',
        'Professional development',
        'Border policing opportunities',
        'Diverse work environment',
        'Career growth opportunities'
      ],
      salary: {
        starting: '$60,000',
        max: '$94,000+'
      },
      hiringStatus: 'Active',
      nextHiringDate: 'Ongoing',
      specializations: ['Community Policing', 'Traffic', 'Border Policing', 'Emergency Response', 'Marine Unit'],
    },
    {
      id: 'ottawa',
      name: 'Ottawa Police Service',
      shortName: 'OPS',
      city: 'Ottawa',
      region: 'Ottawa',
      coordinates: { latitude: 45.4215, longitude: -75.6972 },
      applicationUrl: 'https://www.ottawapolice.ca/careers/',
      phone: '613-236-1222',
      website: 'https://www.ottawapolice.ca/',
      email: 'recruiting@ottawapolice.ca',
      description: 'Serving the City of Ottawa, Canada\'s capital city.',
      requirements: [
        'OACP Certificate required',
        'Minimum 18 years of age',
        'Canadian citizen or permanent resident',
        'Valid driver\'s license',
        'High school diploma or equivalent',
        'Clean criminal record',
        'Physical fitness standards met'
      ],
      benefits: [
        'Competitive salary and benefits',
        'Pension plan',
        'Professional development',
        'Capital policing opportunities',
        'Diverse work environment',
        'Career growth opportunities'
      ],
      salary: {
        starting: '$63,000',
        max: '$98,000+'
      },
      hiringStatus: 'Active',
      nextHiringDate: 'Ongoing',
      specializations: ['Community Policing', 'Traffic', 'Parliamentary Protection', 'Emergency Response', 'Cyber Crime Unit'],
    },
    {
      id: 'kingston',
      name: 'Kingston Police',
      shortName: 'KP',
      city: 'Kingston',
      region: 'Kingston',
      coordinates: { latitude: 44.2312, longitude: -76.4860 },
      applicationUrl: 'https://www.kingstonpolice.ca/careers/',
      phone: '613-549-4660',
      website: 'https://www.kingstonpolice.ca/',
      email: 'recruiting@kingstonpolice.ca',
      description: 'Serving the City of Kingston, a historic university city and military center in Eastern Ontario.',
      requirements: [
        'OACP Certificate required',
        'Minimum 18 years of age',
        'Canadian citizen or permanent resident',
        'Valid driver\'s license',
        'High school diploma or equivalent',
        'Clean criminal record',
        'Physical fitness standards met'
      ],
      benefits: [
        'Competitive salary and benefits',
        'Pension plan',
        'Professional development',
        'University town policing opportunities',
        'Diverse work environment',
        'Career growth opportunities'
      ],
      salary: {
        starting: '$58,000',
        max: '$92,000+'
      },
      hiringStatus: 'Active',
      nextHiringDate: 'Ongoing',
      specializations: ['Community Policing', 'Traffic', 'University Policing', 'Emergency Response', 'Marine Unit'],
    },
    {
      id: 'sudbury',
      name: 'Greater Sudbury Police Service',
      shortName: 'GSPS',
      city: 'Sudbury',
      region: 'Greater Sudbury',
      coordinates: { latitude: 46.4917, longitude: -80.9930 },
      applicationUrl: 'https://www.gsps.ca/careers/',
      phone: '705-675-9171',
      website: 'https://www.gsps.ca/',
      email: 'recruiting@gsps.ca',
      description: 'Serving the City of Greater Sudbury, a major mining and educational center in Northern Ontario.',
      requirements: [
        'OACP Certificate required',
        'Minimum 18 years of age',
        'Canadian citizen or permanent resident',
        'Valid driver\'s license',
        'High school diploma or equivalent',
        'Clean criminal record',
        'Physical fitness standards met'
      ],
      benefits: [
        'Competitive salary and benefits',
        'Pension plan',
        'Professional development',
        'Northern Ontario policing opportunities',
        'Diverse work environment',
        'Career growth opportunities'
      ],
      salary: {
        starting: '$59,000',
        max: '$93,000+'
      },
      hiringStatus: 'Active',
      nextHiringDate: 'Ongoing',
      specializations: ['Community Policing', 'Traffic', 'Mining Security', 'Emergency Response', 'Rural Policing'],
    },
    {
      id: 'thunder-bay',
      name: 'Thunder Bay Police Service',
      shortName: 'TBPS',
      city: 'Thunder Bay',
      region: 'Thunder Bay',
      coordinates: { latitude: 48.3809, longitude: -89.2477 },
      applicationUrl: 'https://www.thunderbaypolice.ca/careers/',
      phone: '807-684-1200',
      website: 'https://www.thunderbaypolice.ca/',
      email: 'recruiting@thunderbaypolice.ca',
      description: 'Serving the City of Thunder Bay, a major port city and transportation hub in Northwestern Ontario.',
      requirements: [
        'OACP Certificate required',
        'Minimum 18 years of age',
        'Canadian citizen or permanent resident',
        'Valid driver\'s license',
        'High school diploma or equivalent',
        'Clean criminal record',
        'Physical fitness standards met'
      ],
      benefits: [
        'Competitive salary and benefits',
        'Pension plan',
        'Professional development',
        'Northwestern Ontario policing opportunities',
        'Diverse work environment',
        'Career growth opportunities'
      ],
      salary: {
        starting: '$57,000',
        max: '$91,000+'
      },
      hiringStatus: 'Active',
      nextHiringDate: 'Ongoing',
      specializations: ['Community Policing', 'Traffic', 'Port Security', 'Emergency Response', 'Rural Policing'],
    }
  ];

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setIsLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
      
      // Calculate distances
      policeServices.forEach(service => {
        const distance = calculateDistance(
          location.coords.latitude,
          location.coords.longitude,
          service.coordinates.latitude,
          service.coordinates.longitude
        );
        service.distance = distance;
        service.isNearby = distance <= 50; // Within 50km
      });
      
      setIsLoadingLocation(false);
    } catch (error) {
      console.error('Error getting location:', error);
      setIsLoadingLocation(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleServiceSelect = (service: PoliceService) => {
    setSelectedService(service);
  };

  const handleApplyNow = async (service: PoliceService) => {
    try {
      await Linking.openURL(service.applicationUrl);
    } catch (error) {
      Alert.alert('Error', 'Could not open application link');
    }
  };

  const handleContact = (service: PoliceService, type: 'phone' | 'email' | 'website') => {
    let url = '';
    switch (type) {
      case 'phone':
        url = `tel:${service.phone}`;
        break;
      case 'email':
        url = `mailto:${service.email}`;
        break;
      case 'website':
        url = service.website;
        break;
    }
    
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open link');
    });
  };

  const getHiringStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return Colors.success;
      case 'Limited':
        return Colors.warning;
      case 'Closed':
        return Colors.error;
      default:
        return Colors.gray[400];
    }
  };

  const filteredServices = policeServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.city.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === 'nearby') return service.isNearby && matchesSearch;
    if (filterType === 'popular') return service.isPopular && matchesSearch;
    return matchesSearch;
  });

  const nearbyServices = filteredServices.filter(service => service.isNearby);
  const popularServices = filteredServices.filter(service => service.isPopular);
  const otherServices = filteredServices.filter(service => !service.isPopular); // Show all non-popular services

  if (selectedService) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setSelectedService(null)}
          >
            <ArrowRight size={20} color={Colors.primary} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Service Details</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerActionButton}>
              <Share2 size={18} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerActionButton}>
              <Bookmark size={18} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Selected Service Card */}
        <View style={styles.selectedServiceCard}>
          <LinearGradient
            colors={[Colors.primary, Colors.primary + 'DD']}
            style={styles.selectedServiceGradient}
          >
            <View style={styles.selectedServiceHeader}>
              <View style={styles.selectedServiceInfo}>
                <Text style={styles.selectedServiceName}>{selectedService.name}</Text>
                <View style={styles.selectedServiceMeta}>
                  <View style={styles.locationContainer}>
                    <MapPin size={16} color={Colors.white + 'CC'} />
                    <Text style={styles.selectedServiceLocation}>
                      {selectedService.city}, {selectedService.region}
                    </Text>
                  </View>
                  {selectedService.distance && (
                    <Text style={styles.selectedServiceDistance}>
                      {Math.round(selectedService.distance)}km away
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.selectedServiceBadges}>
                <View style={[styles.hiringStatusBadge, { backgroundColor: getHiringStatusColor(selectedService.hiringStatus) }]}>
                  <Text style={styles.hiringStatusText}>{selectedService.hiringStatus}</Text>
                </View>
                {selectedService.isPopular && (
                  <View style={styles.popularBadge}>
                    <Star size={12} color={Colors.accent} fill={Colors.accent} />
                    <Text style={styles.popularText}>Popular</Text>
                  </View>
                )}
              </View>
            </View>
            <Text style={styles.selectedServiceDescription}>{selectedService.description}</Text>
          </LinearGradient>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={() => handleApplyNow(selectedService)}
            >
              <ExternalLink size={18} color={Colors.white} />
              <Text style={styles.applyButtonText}>Apply Now</Text>
            </TouchableOpacity>
            <View style={styles.contactButtons}>
              <TouchableOpacity 
                style={styles.contactButton}
                onPress={() => handleContact(selectedService, 'phone')}
              >
                <Phone size={16} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.contactButton}
                onPress={() => handleContact(selectedService, 'email')}
              >
                <Mail size={16} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.contactButton}
                onPress={() => handleContact(selectedService, 'website')}
              >
                <Globe size={16} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Service Details */}
          <View style={styles.serviceDetails}>
            {/* Salary Information */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Salary Range</Text>
              <View style={styles.salaryCard}>
                <View style={styles.salaryItem}>
                  <Text style={styles.salaryLabel}>Starting</Text>
                  <Text style={styles.salaryAmount}>{selectedService.salary.starting}</Text>
                </View>
                <View style={styles.salaryDivider} />
                <View style={styles.salaryItem}>
                  <Text style={styles.salaryLabel}>Maximum</Text>
                  <Text style={styles.salaryAmount}>{selectedService.salary.max}</Text>
                </View>
              </View>
            </View>

            {/* Requirements */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Requirements</Text>
              {selectedService.requirements.map((requirement, index) => (
                <View key={index} style={styles.requirementItem}>
                  <CheckCircle size={16} color={Colors.success} />
                  <Text style={styles.requirementText}>{requirement}</Text>
                </View>
              ))}
            </View>

            {/* Benefits */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Benefits</Text>
              {selectedService.benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <Award size={16} color={Colors.primary} />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>

            {/* Specializations */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Specializations</Text>
              <View style={styles.specializationsContainer}>
                {selectedService.specializations.map((specialization, index) => (
                  <View key={index} style={styles.specializationChip}>
                    <Shield size={12} color={Colors.primary} />
                    <Text style={styles.specializationText}>{specialization}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={true}
      contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
      nestedScrollEnabled={true}
    >
      {/* Modern Header */}
      <View style={styles.modernHeader}>
        <LinearGradient
          colors={[Colors.primary, Colors.primary + 'DD']}
          style={styles.headerGradient}
        >
          <Text style={styles.modernTitle}>Choose Your Service</Text>
          <Text style={styles.modernSubtitle}>
            Select a police service to begin your application
          </Text>
        </LinearGradient>
      </View>

      {/* Search and Filter Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search services..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.filterButtons}>
          <TouchableOpacity 
            style={[styles.filterButton, filterType === 'all' && styles.filterButtonActive]}
            onPress={() => setFilterType('all')}
          >
            <Text style={[styles.filterButtonText, filterType === 'all' && styles.filterButtonTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, filterType === 'nearby' && styles.filterButtonActive]}
            onPress={() => setFilterType('nearby')}
          >
            <MapPin size={16} color={filterType === 'nearby' ? Colors.white : Colors.primary} />
            <Text style={[styles.filterButtonText, filterType === 'nearby' && styles.filterButtonTextActive]}>
              Nearby
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, filterType === 'popular' && styles.filterButtonActive]}
            onPress={() => setFilterType('popular')}
          >
            <Star size={16} color={filterType === 'popular' ? Colors.white : Colors.primary} />
            <Text style={[styles.filterButtonText, filterType === 'popular' && styles.filterButtonTextActive]}>
              Popular
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Services List */}
      <View style={styles.servicesContainer}>
        {/* All Services */}
        <View style={styles.servicesSection}>
          <View style={styles.sectionHeader}>
            <Building size={20} color={Colors.textSecondary} />
            <Text style={styles.sectionTitle}>All Ontario Police Services ({filteredServices.length} of {policeServices.length})</Text>
          </View>
          {filteredServices.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={styles.modernServiceCard}
              onPress={() => handleServiceSelect(service)}
            >
              <View style={styles.serviceCardContent}>
                <View style={styles.serviceCardHeader}>
                  <View style={styles.serviceCardInfo}>
                    <Text style={styles.serviceCardName}>{service.name}</Text>
                    <View style={styles.serviceCardMeta}>
                      <View style={styles.locationContainer}>
                        <MapPin size={14} color={Colors.textSecondary} />
                        <Text style={styles.serviceCardLocation}>
                          {service.city}, {service.region}
                        </Text>
                      </View>
                      {service.distance && (
                        <Text style={styles.serviceCardDistance}>
                          {Math.round(service.distance)}km away
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.serviceCardBadges}>
                    {service.isPopular && (
                      <View style={styles.popularChip}>
                        <Star size={12} color={Colors.accent} fill={Colors.accent} />
                        <Text style={styles.popularChipText}>Popular</Text>
                      </View>
                    )}
                    <View style={[styles.hiringStatusChip, { backgroundColor: getHiringStatusColor(service.hiringStatus) }]}>
                      <Text style={styles.hiringStatusChipText}>{service.hiringStatus}</Text>
                    </View>
                    <ArrowRight size={20} color={Colors.primary} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    minHeight: Dimensions.get('window').height,
  },
  header: {
    backgroundColor: Colors.white,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerActionButton: {
    marginLeft: 15,
  },
  modernHeader: {
    height: Dimensions.get('window').height * 0.2,
    paddingTop: 50,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    padding: 20,
  },
  modernTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  modernSubtitle: {
    fontSize: 16,
    color: Colors.white + 'CC',
    textAlign: 'center',
    lineHeight: 22,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    paddingVertical: 0,
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
    padding: 5,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  filterButtonTextActive: {
    color: Colors.white,
  },
  servicesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  servicesSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
  },
  modernServiceCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  serviceCardGradient: {
    borderRadius: 16,
    padding: 16,
  },
  serviceCardContent: {
    flexDirection: 'column',
  },
  serviceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceCardInfo: {
    flex: 1,
  },
  serviceCardName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  serviceCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  serviceCardLocation: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  serviceCardDistance: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  serviceCardBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hiringStatusChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  hiringStatusChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  popularChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent + '10',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  popularChipText: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: '500',
    marginLeft: 4,
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent + '10',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  popularText: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: '500',
    marginLeft: 4,
  },
  selectedServiceCard: {
    backgroundColor: Colors.white,
    margin: 16,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  selectedServiceGradient: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  selectedServiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  selectedServiceInfo: {
    flex: 1,
  },
  selectedServiceName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  selectedServiceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedServiceLocation: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  selectedServiceDistance: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    marginLeft: 10,
  },
  selectedServiceBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hiringStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
  },
  hiringStatusText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.white,
  },
  selectedServiceDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
    marginRight: 12,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    marginLeft: 8,
  },
  contactButtons: {
    flexDirection: 'row',
  },
  contactButton: {
    padding: 10,
    borderRadius: 12,
    marginLeft: 8,
  },
  serviceDetails: {
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    paddingTop: 16,
  },
  detailSection: {
    marginBottom: 20,
  },
  salaryCard: {
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    padding: 16,
  },
  salaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  salaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  salaryAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  salaryDivider: {
    height: 1,
    backgroundColor: Colors.gray[200],
    marginVertical: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  requirementText: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginLeft: 10,
    flex: 1,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  benefitText: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginLeft: 10,
    flex: 1,
  },
  specializationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specializationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  specializationText: {
    fontSize: 13,
    color: Colors.primary,
    marginLeft: 6,
    fontWeight: '500',
  },
});

export default PoliceServiceSelector;
