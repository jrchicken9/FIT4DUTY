import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import {
  ArrowLeft,
  Save,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Crown,
  Star,
  Clock,
  Users,
  FileText,
  Target,
  CheckCircle,
  X,
} from 'lucide-react-native';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface MonetizationSettings {
  subscriptionPrice: number;
  subscriptionFeatures: string[];
  oneTimeServices: {
    id: string;
    title: string;
    description: string;
    price: number;
    features: string[];
    popular: boolean;
    active: boolean;
  }[];
  contentSettings: {
    stepId: string;
    freePreview: {
      intro: string;
      tips: string[];
      basicGuidance: string;
    };
    premiumUpgrade: {
      title: string;
      description: string;
      features: string[];
    };
  }[];
}

export default function ApplicationMonetizationScreen() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<MonetizationSettings>({
    subscriptionPrice: 19.99,
    subscriptionFeatures: [
      'Complete application guides',
      'Mock interview sessions',
      'Document review services',
      'Progress tracking',
      'Expert support',
    ],
    oneTimeServices: [
      {
        id: 'document-review',
        title: 'Document/Application Review',
        description: 'Get your police service application package reviewed by certified instructors',
        price: 99.99,
        features: [
          'Comprehensive document review',
          'Detailed feedback and recommendations',
          'Improvement suggestions',
          '48-hour turnaround',
          'Follow-up consultation'
        ],
        popular: true,
        active: true,
      },
      {
        id: 'prep-practice-test',
        title: 'In-Person PREP Practice Test',
        description: 'Book a realistic PREP test simulation with official equipment',
        price: 89.99,
        features: [
          'Realistic test simulation',
          'Official equipment usage',
          'Professional scoring and feedback',
          'Multiple locations available',
          '45-minute session'
        ],
        popular: true,
        active: true,
      },
      {
        id: 'recorded-mock-interview',
        title: 'Recorded Mock Interview Review',
        description: 'Record your answers to preset questions and get detailed feedback',
        price: 79.99,
        features: [
          'Preset question bank',
          'Video recording guidance',
          'Detailed feedback within 48h',
          'Improvement recommendations',
          'Follow-up support'
        ],
        popular: false,
        active: true,
      },
    ],
    contentSettings: [],
  });

  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Save to Supabase
      const { error } = await supabase
        .from('admin_monetization_settings')
        .upsert({
          user_id: user?.id,
          settings: settings,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      Alert.alert('Success', 'Monetization settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddService = () => {
    setEditingService(null);
    setShowServiceModal(true);
  };

  const handleEditService = (service: any) => {
    setEditingService(service);
    setShowServiceModal(true);
  };

  const handleDeleteService = (serviceId: string) => {
    Alert.alert(
      'Delete Service',
      'Are you sure you want to delete this service?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setSettings(prev => ({
              ...prev,
              oneTimeServices: prev.oneTimeServices.filter(s => s.id !== serviceId)
            }));
          }
        }
      ]
    );
  };

  const handleSaveService = (service: any) => {
    if (editingService) {
      // Edit existing service
      setSettings(prev => ({
        ...prev,
        oneTimeServices: prev.oneTimeServices.map(s => 
          s.id === editingService.id ? service : s
        )
      }));
    } else {
      // Add new service
      setSettings(prev => ({
        ...prev,
        oneTimeServices: [...prev.oneTimeServices, service]
      }));
    }
    setShowServiceModal(false);
  };

  const toggleServiceActive = (serviceId: string) => {
    setSettings(prev => ({
      ...prev,
      oneTimeServices: prev.oneTimeServices.map(s =>
        s.id === serviceId ? { ...s, active: !s.active } : s
      )
    }));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Application Monetization</Text>
        <TouchableOpacity onPress={handleSaveSettings} disabled={isSaving}>
          <Save size={24} color={isSaving ? Colors.textSecondary : Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Subscription Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Crown size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Subscription Settings</Text>
          </View>
          
          <View style={styles.settingCard}>
            <Text style={styles.settingLabel}>Monthly Price ($)</Text>
            <TextInput
              style={styles.priceInput}
              value={settings.subscriptionPrice.toString()}
              onChangeText={(text) => setSettings(prev => ({
                ...prev,
                subscriptionPrice: parseFloat(text) || 0
              }))}
              keyboardType="numeric"
              placeholder="19.99"
            />
          </View>

          <View style={styles.settingCard}>
            <Text style={styles.settingLabel}>Subscription Features</Text>
            {settings.subscriptionFeatures.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <CheckCircle size={16} color={Colors.success} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* One-Time Services */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <DollarSign size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>One-Time Services</Text>
            <TouchableOpacity onPress={handleAddService} style={styles.addButton}>
              <Plus size={16} color={Colors.white} />
              <Text style={styles.addButtonText}>Add Service</Text>
            </TouchableOpacity>
          </View>

          {settings.oneTimeServices.map((service) => (
            <View key={service.id} style={styles.serviceCard}>
              <View style={styles.serviceHeader}>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceTitle}>{service.title}</Text>
                  <Text style={styles.servicePrice}>${service.price}</Text>
                </View>
                <View style={styles.serviceActions}>
                  <Switch
                    value={service.active}
                    onValueChange={() => toggleServiceActive(service.id)}
                    trackColor={{ false: Colors.gray[300], true: Colors.primary }}
                  />
                  <TouchableOpacity onPress={() => handleEditService(service)}>
                    <Edit size={16} color={Colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteService(service.id)}>
                    <Trash2 size={16} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <Text style={styles.serviceDescription}>{service.description}</Text>
              
              <View style={styles.serviceFeatures}>
                {service.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <CheckCircle size={14} color={Colors.success} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
              
              {service.popular && (
                <View style={styles.popularBadge}>
                  <Star size={12} color={Colors.white} />
                  <Text style={styles.popularText}>Most Popular</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Content Management */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Content Management</Text>
          </View>
          
          <View style={styles.settingCard}>
            <Text style={styles.settingLabel}>Content Updates</Text>
            <Text style={styles.settingDescription}>
              Content updates are applied instantly without requiring app updates.
              Use the admin dashboard to modify step content, pricing, and features.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Service Modal */}
      <ServiceModal
        visible={showServiceModal}
        service={editingService}
        onSave={handleSaveService}
        onClose={() => setShowServiceModal(false)}
      />
    </View>
  );
}

// Service Modal Component
interface ServiceModalProps {
  visible: boolean;
  service?: any;
  onSave: (service: any) => void;
  onClose: () => void;
}

function ServiceModal({ visible, service, onSave, onClose }: ServiceModalProps) {
  const [formData, setFormData] = useState({
    id: service?.id || '',
    title: service?.title || '',
    description: service?.description || '',
    price: service?.price?.toString() || '',
    features: service?.features || [''],
    popular: service?.popular || false,
    active: service?.active ?? true,
  });

  const handleSave = () => {
    if (!formData.id || !formData.title || !formData.description || !formData.price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const serviceData = {
      ...formData,
      price: parseFloat(formData.price),
      features: formData.features.filter((f: string) => f.trim() !== ''),
    };

    onSave(serviceData);
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((f: string, i: number) => i === index ? value : f)
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_: string, i: number) => i !== index)
    }));
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {service ? 'Edit Service' : 'Add Service'}
          </Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Service ID *</Text>
            <TextInput
              style={styles.formInput}
              value={formData.id}
              onChangeText={(text) => setFormData(prev => ({ ...prev, id: text }))}
              placeholder="e.g., document-review"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Title *</Text>
            <TextInput
              style={styles.formInput}
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              placeholder="Service title"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Description *</Text>
            <TextInput
              style={[styles.formInput, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              placeholder="Service description"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Price ($) *</Text>
            <TextInput
              style={styles.formInput}
              value={formData.price}
              onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
              placeholder="99.99"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Features</Text>
            {formData.features.map((feature: string, index: number) => (
              <View key={index} style={styles.featureInputRow}>
                <TextInput
                  style={[styles.formInput, styles.featureInput]}
                  value={feature}
                  onChangeText={(text) => updateFeature(index, text)}
                  placeholder="Feature description"
                />
                <TouchableOpacity onPress={() => removeFeature(index)}>
                  <X size={16} color={Colors.error} />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity onPress={addFeature} style={styles.addFeatureButton}>
              <Plus size={16} color={Colors.primary} />
              <Text style={styles.addFeatureText}>Add Feature</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <View style={styles.switchRow}>
              <Text style={styles.formLabel}>Popular Service</Text>
              <Switch
                value={formData.popular}
                onValueChange={(value) => setFormData(prev => ({ ...prev, popular: value }))}
                trackColor={{ false: Colors.gray[300], true: Colors.primary }}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <View style={styles.switchRow}>
              <Text style={styles.formLabel}>Active</Text>
              <Switch
                value={formData.active}
                onValueChange={(value) => setFormData(prev => ({ ...prev, active: value }))}
                trackColor={{ false: Colors.gray[300], true: Colors.primary }}
              />
            </View>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  settingCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  serviceCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  serviceActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  serviceDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  serviceFeatures: {
    marginBottom: 8,
  },
  popularBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Colors.warning,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.white,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  featureInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  featureInput: {
    flex: 1,
  },
  addFeatureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  addFeatureText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});



