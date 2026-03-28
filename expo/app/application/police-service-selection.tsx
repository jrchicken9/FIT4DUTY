import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Search, 
  Check, 
  MapPin, 
  Users, 
  Shield, 
  Star,
  ArrowLeft,
  Save,
  Info
} from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

interface PoliceService {
  id: string;
  name: string;
  location: string;
  description: string;
  requirements: string[];
  applicationDeadline?: string;
  isPopular: boolean;
  category: 'municipal' | 'provincial' | 'federal';
}

const POLICE_SERVICES: PoliceService[] = [
  // Municipal Services
  {
    id: 'toronto_police',
    name: 'Toronto Police Service',
    location: 'Toronto, ON',
    description: 'Canada\'s largest municipal police service, serving over 2.9 million residents.',
    requirements: ['OACP Certificate', 'Valid Driver\'s License', 'Canadian Citizenship'],
    isPopular: true,
    category: 'municipal',
  },
  {
    id: 'vancouver_police',
    name: 'Vancouver Police Department',
    location: 'Vancouver, BC',
    description: 'Serving the diverse communities of Vancouver with community-focused policing.',
    requirements: ['OACP Certificate', 'Valid Driver\'s License', 'Canadian Citizenship'],
    isPopular: true,
    category: 'municipal',
  },
  {
    id: 'calgary_police',
    name: 'Calgary Police Service',
    location: 'Calgary, AB',
    description: 'Progressive police service committed to community safety and engagement.',
    requirements: ['OACP Certificate', 'Valid Driver\'s License', 'Canadian Citizenship'],
    isPopular: true,
    category: 'municipal',
  },
  {
    id: 'edmonton_police',
    name: 'Edmonton Police Service',
    location: 'Edmonton, AB',
    description: 'Innovative policing with a focus on technology and community partnerships.',
    requirements: ['OACP Certificate', 'Valid Driver\'s License', 'Canadian Citizenship'],
    isPopular: false,
    category: 'municipal',
  },
  {
    id: 'ottawa_police',
    name: 'Ottawa Police Service',
    location: 'Ottawa, ON',
    description: 'Serving Canada\'s capital with bilingual policing services.',
    requirements: ['OACP Certificate', 'Valid Driver\'s License', 'Canadian Citizenship', 'Bilingual (English/French)'],
    isPopular: false,
    category: 'municipal',
  },

  // Provincial Services
  {
    id: 'ontario_provincial',
    name: 'Ontario Provincial Police',
    location: 'Ontario',
    description: 'Provincial police service providing law enforcement across Ontario.',
    requirements: ['OACP Certificate', 'Valid Driver\'s License', 'Canadian Citizenship'],
    isPopular: true,
    category: 'provincial',
  },
  {
    id: 'rcmp',
    name: 'Royal Canadian Mounted Police',
    location: 'Canada-wide',
    description: 'Federal police service providing policing across Canada.',
    requirements: ['OACP Certificate', 'Valid Driver\'s License', 'Canadian Citizenship'],
    isPopular: true,
    category: 'federal',
  },
  {
    id: 'quebec_provincial',
    name: 'Sûreté du Québec',
    location: 'Quebec',
    description: 'Provincial police service serving Quebec communities.',
    requirements: ['OACP Certificate', 'Valid Driver\'s License', 'Canadian Citizenship', 'French Proficiency'],
    isPopular: false,
    category: 'provincial',
  },
  {
    id: 'alberta_rcmp',
    name: 'Alberta RCMP',
    location: 'Alberta',
    description: 'RCMP providing policing services across Alberta.',
    requirements: ['OACP Certificate', 'Valid Driver\'s License', 'Canadian Citizenship'],
    isPopular: false,
    category: 'federal',
  },
  {
    id: 'bc_rcmp',
    name: 'British Columbia RCMP',
    location: 'British Columbia',
    description: 'RCMP providing policing services across British Columbia.',
    requirements: ['OACP Certificate', 'Valid Driver\'s License', 'Canadian Citizenship'],
    isPopular: false,
    category: 'federal',
  },
];

export default function PoliceServiceSelectionScreen() {
  const { user, updateProfile } = useAuth();
  
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState<'all' | 'municipal' | 'provincial' | 'federal'>('all');

  useEffect(() => {
    // Load user's previously selected services
    if (user?.department_interest) {
      try {
        const savedServices = JSON.parse(user.department_interest);
        if (Array.isArray(savedServices)) {
          setSelectedServices(savedServices);
        }
      } catch (error) {
        console.error('Error parsing saved services:', error);
      }
    }
  }, [user]);

  const filteredServices = POLICE_SERVICES.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || service.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  const handleSave = async () => {
    if (selectedServices.length === 0) {
      Alert.alert(
        'No Services Selected',
        'Please select at least one police service you are interested in applying to.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsLoading(true);
    try {
      // Update user profile
      const { error } = await supabase
        .from('profiles')
        .update({ 
          department_interest: JSON.stringify(selectedServices),
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (error) throw error;

      // Update local auth context
      await updateProfile({ department_interest: JSON.stringify(selectedServices) });

      // CPP completion removed

      Alert.alert(
        'Success',
        `You have selected ${selectedServices.length} police service(s). This information will help personalize your preparation journey.`,
        [
          {
            text: 'Continue',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error saving police service selection:', error);
      Alert.alert('Error', 'Failed to save your selection. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'municipal':
        return <MapPin size={16} color={Colors.primary} />;
      case 'provincial':
        return <Shield size={16} color={Colors.success} />;
      case 'federal':
        return <Star size={16} color={Colors.warning} />;
      default:
        return <Users size={16} color={Colors.textSecondary} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'municipal':
        return Colors.primary;
      case 'provincial':
        return Colors.success;
      case 'federal':
        return Colors.warning;
      default:
        return Colors.textSecondary;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Select Police Services</Text>
          <Text style={styles.subtitle}>
            Choose the police services you're interested in applying to
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Info size={20} color={Colors.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Why Select Police Services?</Text>
            <Text style={styles.infoText}>
              Selecting your target police services helps us personalize your preparation journey with specific requirements, deadlines, and strategies for each service.
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Search size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search police services..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.textSecondary}
            />
          </View>
        </View>

        {/* Category Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Filter by Type:</Text>
          <View style={styles.filterOptions}>
            {(['all', 'municipal', 'provincial', 'federal'] as const).map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.filterOption,
                  filterCategory === category && styles.filterOptionActive
                ]}
                onPress={() => setFilterCategory(category)}
              >
                {category !== 'all' && getCategoryIcon(category)}
                <Text style={[
                  styles.filterOptionText,
                  filterCategory === category && styles.filterOptionTextActive
                ]}>
                  {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Selected Services Summary */}
        {selectedServices.length > 0 && (
          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>
              Selected Services ({selectedServices.length})
            </Text>
            <View style={styles.selectedServices}>
              {selectedServices.map(serviceId => {
                const service = POLICE_SERVICES.find(s => s.id === serviceId);
                if (!service) return null;
                
                return (
                  <View key={serviceId} style={styles.selectedService}>
                    <View style={styles.selectedServiceInfo}>
                      <Text style={styles.selectedServiceName}>{service.name}</Text>
                      <Text style={styles.selectedServiceLocation}>{service.location}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => toggleService(serviceId)}
                    >
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Services List */}
        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>
            Available Police Services ({filteredServices.length})
          </Text>
          
          {filteredServices.map(service => {
            const isSelected = selectedServices.includes(service.id);
            
            return (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.serviceCard,
                  isSelected && styles.serviceCardSelected
                ]}
                onPress={() => toggleService(service.id)}
                activeOpacity={0.8}
              >
                <View style={styles.serviceHeader}>
                  <View style={styles.serviceInfo}>
                    <View style={styles.serviceTitleRow}>
                      <Text style={[
                        styles.serviceName,
                        isSelected && styles.serviceNameSelected
                      ]}>
                        {service.name}
                      </Text>
                      {service.isPopular && (
                        <View style={styles.popularBadge}>
                          <Star size={12} color={Colors.white} />
                          <Text style={styles.popularText}>Popular</Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.serviceMeta}>
                      {getCategoryIcon(service.category)}
                      <Text style={[
                        styles.serviceLocation,
                        isSelected && styles.serviceLocationSelected
                      ]}>
                        {service.location}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={[
                    styles.selectionIndicator,
                    isSelected && styles.selectionIndicatorSelected
                  ]}>
                    {isSelected && <Check size={16} color={Colors.white} />}
                  </View>
                </View>
                
                <Text style={[
                  styles.serviceDescription,
                  isSelected && styles.serviceDescriptionSelected
                ]}>
                  {service.description}
                </Text>
                
                <View style={styles.requirementsSection}>
                  <Text style={[
                    styles.requirementsTitle,
                    isSelected && styles.requirementsTitleSelected
                  ]}>
                    Requirements:
                  </Text>
                  <View style={styles.requirementsList}>
                    {service.requirements.slice(0, 3).map((req, index) => (
                      <View key={index} style={styles.requirementItem}>
                        <Text style={styles.requirementBullet}>•</Text>
                        <Text style={[
                          styles.requirementText,
                          isSelected && styles.requirementTextSelected
                        ]}>
                          {req}
                        </Text>
                      </View>
                    ))}
                    {service.requirements.length > 3 && (
                      <Text style={[
                        styles.requirementText,
                        isSelected && styles.requirementTextSelected
                      ]}>
                        +{service.requirements.length - 3} more
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Save Button */}
      <View style={styles.saveSection}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            selectedServices.length === 0 && styles.saveButtonDisabled
          ]}
          onPress={handleSave}
          disabled={selectedServices.length === 0 || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <>
              <Save size={20} color={Colors.white} />
              <Text style={styles.saveButtonText}>
                Save Selection ({selectedServices.length})
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: Colors.white,
    ...shadows.light,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: typography.displaySmall.fontSize,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.bodyLarge.fontSize,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  
  scrollView: {
    flex: 1,
  },
  
  // Info Card
  infoCard: {
    flexDirection: 'row',
    backgroundColor: Colors.primary + '10',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  infoContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  infoTitle: {
    fontSize: typography.bodyLarge.fontSize,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: spacing.xs,
  },
  infoText: {
    fontSize: typography.bodyMedium.fontSize,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  
  // Search Section
  searchSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.light,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: typography.bodyLarge.fontSize,
    color: Colors.text,
  },
  
  // Filter Section
  filterSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  filterTitle: {
    fontSize: typography.bodyLarge.fontSize,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: spacing.sm,
  },
  filterOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    ...shadows.light,
  },
  filterOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterOptionText: {
    fontSize: typography.bodyMedium.fontSize,
    color: Colors.textSecondary,
  },
  filterOptionTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  
  // Summary Section
  summarySection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  summaryTitle: {
    fontSize: typography.headingMedium.fontSize,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: spacing.sm,
  },
  selectedServices: {
    gap: spacing.sm,
  },
  selectedService: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.success + '20',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.success + '40',
  },
  selectedServiceInfo: {
    flex: 1,
  },
  selectedServiceName: {
    fontSize: typography.bodyLarge.fontSize,
    fontWeight: '600',
    color: Colors.success,
    marginBottom: spacing.xs,
  },
  selectedServiceLocation: {
    fontSize: typography.bodyMedium.fontSize,
    color: Colors.textSecondary,
  },
  removeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: Colors.error + '20',
    borderRadius: borderRadius.md,
  },
  removeButtonText: {
    fontSize: typography.bodyMedium.fontSize,
    color: Colors.error,
    fontWeight: '600',
  },
  
  // Services Section
  servicesSection: {
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.headingMedium.fontSize,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: spacing.md,
  },
  serviceCard: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: Colors.border,
    ...shadows.light,
  },
  serviceCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '05',
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  serviceName: {
    fontSize: typography.bodyLarge.fontSize,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  serviceNameSelected: {
    color: Colors.primary,
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: Colors.warning,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  popularText: {
    fontSize: typography.bodySmall.fontSize,
    color: Colors.white,
    fontWeight: '600',
  },
  serviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  serviceLocation: {
    fontSize: typography.bodyMedium.fontSize,
    color: Colors.textSecondary,
  },
  serviceLocationSelected: {
    color: Colors.primary + 'CC',
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionIndicatorSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  serviceDescription: {
    fontSize: typography.bodyMedium.fontSize,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  serviceDescriptionSelected: {
    color: Colors.text,
  },
  requirementsSection: {
    marginTop: spacing.sm,
  },
  requirementsTitle: {
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  requirementsTitleSelected: {
    color: Colors.primary,
  },
  requirementsList: {
    gap: spacing.xs,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  requirementBullet: {
    fontSize: typography.bodyMedium.fontSize,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  requirementText: {
    fontSize: typography.bodyMedium.fontSize,
    color: Colors.textSecondary,
    flex: 1,
  },
  requirementTextSelected: {
    color: Colors.text,
  },
  
  // Save Section
  saveSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.medium,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.gray[400],
  },
  saveButtonText: {
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: '600',
    color: Colors.white,
  },
  
  // Bottom Spacer
  bottomSpacer: {
    height: 100,
  },
});

