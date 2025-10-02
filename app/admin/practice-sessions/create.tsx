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
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  DollarSign,
  Save,
  Plus,
  Check,
  Target,
  Users,
  FileText,
  Settings,
  X,
  ChevronDown,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { usePracticeSessions } from '@/context/PracticeSessionsContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { TestType, CreateSessionData, Location, Instructor } from '@/types/practice-sessions';

export default function CreateSessionScreen() {
  const { user, isAdmin } = useAuth();
  const { createSession } = usePracticeSessions();
  const params = useLocalSearchParams();
  const sessionId = params.id as string;
  const isEditMode = !!sessionId;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [locations, setLocations] = useState<Location[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);

  // Modal states
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showInstructorModal, setShowInstructorModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showStartTimeModal, setShowStartTimeModal] = useState(false);
  const [showEndTimeModal, setShowEndTimeModal] = useState(false);

  // Modal Components
  const LocationPickerModal = () => {
    const [showAddLocation, setShowAddLocation] = useState(false);
    const [newLocation, setNewLocation] = useState({
      name: '',
      address: '',
      city: '',
      province: '',
      postal_code: '',
      latitude: 0,
      longitude: 0,
    });

    const handleAddLocation = async () => {
      if (!newLocation.name.trim() || !newLocation.address.trim()) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('locations')
          .insert({
            name: newLocation.name.trim(),
            address: newLocation.address.trim(),
            city: newLocation.city.trim(),
            province: newLocation.province.trim(),
            postal_code: newLocation.postal_code.trim(),
            latitude: newLocation.latitude,
            longitude: newLocation.longitude,
            is_active: true,
          })
          .select()
          .single();

        if (error) throw error;

        setLocations(prev => [...prev, data]);
        setFormData(prev => ({ ...prev, location_id: data.id }));
        setShowLocationModal(false);
        setShowAddLocation(false);
        setNewLocation({
          name: '',
          address: '',
          city: '',
          province: '',
          postal_code: '',
          latitude: 0,
          longitude: 0,
        });
        Alert.alert('Success', 'Location created successfully!');
      } catch (error: any) {
        Alert.alert('Error', 'Failed to create location: ' + error.message);
      }
    };

    return (
      <Modal
        visible={showLocationModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, showAddLocation && styles.largeModalContent]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {showAddLocation ? 'Add New Location' : 'Select Location'}
              </Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => {
                  if (showAddLocation) {
                    setShowAddLocation(false);
                  } else {
                    setShowLocationModal(false);
                  }
                }}
              >
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            
            {!showAddLocation ? (
              <>
                <TouchableOpacity
                  style={styles.addLocationButton}
                  onPress={() => setShowAddLocation(true)}
                >
                  <Plus size={20} color={Colors.primary} />
                  <Text style={styles.addLocationButtonText}>Add New Location</Text>
                </TouchableOpacity>
                
                <FlatList
                  data={locations}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.modalOption}
                      onPress={() => {
                        setFormData(prev => ({ ...prev, location_id: item.id }));
                        setShowLocationModal(false);
                      }}
                    >
                      <View style={styles.modalOptionContent}>
                        <MapPin size={20} color={Colors.primary} />
                        <View style={styles.modalOptionText}>
                          <Text style={styles.modalOptionTitle}>{item.name}</Text>
                          <Text style={styles.modalOptionSubtitle}>{item.address}</Text>
                        </View>
                      </View>
                      {formData.location_id === item.id && (
                        <Check size={20} color={Colors.primary} />
                      )}
                    </TouchableOpacity>
                  )}
                  showsVerticalScrollIndicator={false}
                />
              </>
            ) : (
              <ScrollView style={styles.addLocationForm}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Location Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={newLocation.name}
                    onChangeText={(text) => setNewLocation(prev => ({ ...prev, name: text }))}
                    placeholder="e.g., Downtown Fitness Center"
                    placeholderTextColor={Colors.textSecondary}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Address *</Text>
                  <TextInput
                    style={styles.input}
                    value={newLocation.address}
                    onChangeText={(text) => setNewLocation(prev => ({ ...prev, address: text }))}
                    placeholder="e.g., 123 Main Street"
                    placeholderTextColor={Colors.textSecondary}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>City</Text>
                  <TextInput
                    style={styles.input}
                    value={newLocation.city}
                    onChangeText={(text) => setNewLocation(prev => ({ ...prev, city: text }))}
                    placeholder="e.g., Toronto"
                    placeholderTextColor={Colors.textSecondary}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Province</Text>
                  <TextInput
                    style={styles.input}
                    value={newLocation.province}
                    onChangeText={(text) => setNewLocation(prev => ({ ...prev, province: text }))}
                    placeholder="e.g., ON"
                    placeholderTextColor={Colors.textSecondary}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Postal Code</Text>
                  <TextInput
                    style={styles.input}
                    value={newLocation.postal_code}
                    onChangeText={(text) => setNewLocation(prev => ({ ...prev, postal_code: text }))}
                    placeholder="e.g., M5V 3A8"
                    placeholderTextColor={Colors.textSecondary}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Map Integration</Text>
                  <TouchableOpacity
                    style={styles.mapButton}
                    onPress={() => {
                      // Google Maps integration would go here
                      Alert.alert(
                        'Google Maps Integration',
                        'This would open Google Maps for location selection and coordinate picking.'
                      );
                    }}
                  >
                    <MapPin size={20} color={Colors.primary} />
                    <Text style={styles.mapButtonText}>Select on Map</Text>
                  </TouchableOpacity>
                  <Text style={styles.helperText}>
                    Tap to open Google Maps and select the exact location
                  </Text>
                </View>

                <View style={styles.addLocationActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowAddLocation(false)}
                  >
                    <Text style={styles.addLocationCancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleAddLocation}
                  >
                    <Save size={20} color={Colors.white} />
                    <Text style={styles.saveButtonText}>Create Location</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  const InstructorPickerModal = () => (
    <Modal
      visible={showInstructorModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowInstructorModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Instructor</Text>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowInstructorModal(false)}
            >
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={instructors}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  setFormData(prev => ({ ...prev, instructor_id: item.id }));
                  setShowInstructorModal(false);
                }}
              >
                <View style={styles.modalOptionContent}>
                  <User size={20} color={Colors.primary} />
                  <View style={styles.modalOptionText}>
                    <Text style={styles.modalOptionTitle}>{item.full_name}</Text>
                    <Text style={styles.modalOptionSubtitle}>
                      {item.specialties?.join(', ') || 'General Instructor'}
                    </Text>
                  </View>
                </View>
                {formData.instructor_id === item.id && (
                  <Check size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </Modal>
  );

  const DatePickerModal = () => {
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    
    const generateCalendarDays = (date: Date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - firstDay.getDay());
      
      const days = [];
      const today = new Date();
      
      for (let i = 0; i < 42; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        
        const isCurrentMonth = currentDate.getMonth() === month;
        const isToday = currentDate.toDateString() === today.toDateString();
        const isPast = currentDate < today;
        const isSelected = formData.session_date === currentDate.toISOString().split('T')[0];
        
        days.push({
          date: currentDate,
          day: currentDate.getDate(),
          isCurrentMonth,
          isToday,
          isPast,
          isSelected,
          isSelectable: !isPast && currentDate.getTime() <= today.getTime() + (90 * 24 * 60 * 60 * 1000)
        });
      }
      
      return days;
    };

    const calendarDays = generateCalendarDays(selectedMonth);
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
      <Modal
        visible={showDateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.calendarModalContent]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowDateModal(false)}
              >
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.calendarHeader}>
              <TouchableOpacity
                style={styles.calendarNavButton}
                onPress={() => {
                  const prevMonth = new Date(selectedMonth);
                  prevMonth.setMonth(prevMonth.getMonth() - 1);
                  setSelectedMonth(prevMonth);
                }}
              >
                <Text style={styles.calendarNavText}>‹</Text>
              </TouchableOpacity>
              
              <Text style={styles.calendarMonthText}>
                {monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
              </Text>
              
              <TouchableOpacity
                style={styles.calendarNavButton}
                onPress={() => {
                  const nextMonth = new Date(selectedMonth);
                  nextMonth.setMonth(nextMonth.getMonth() + 1);
                  setSelectedMonth(nextMonth);
                }}
              >
                <Text style={styles.calendarNavText}>›</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.calendarWeekdays}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <Text key={day} style={styles.calendarWeekdayText}>{day}</Text>
              ))}
            </View>
            
            <View style={styles.calendarGrid}>
              {calendarDays.map((day, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.calendarDay,
                    !day.isCurrentMonth && styles.calendarDayOtherMonth,
                    day.isToday && styles.calendarDayToday,
                    day.isSelected && styles.calendarDaySelected,
                    !day.isSelectable && styles.calendarDayDisabled
                  ]}
                  onPress={() => {
                    if (day.isSelectable) {
                      setFormData(prev => ({ 
                        ...prev, 
                        session_date: day.date.toISOString().split('T')[0] 
                      }));
                      setShowDateModal(false);
                    }
                  }}
                  disabled={!day.isSelectable}
                >
                  <Text style={[
                    styles.calendarDayText,
                    !day.isCurrentMonth && styles.calendarDayTextOtherMonth,
                    day.isToday && styles.calendarDayTextToday,
                    day.isSelected && styles.calendarDayTextSelected,
                    !day.isSelectable && styles.calendarDayTextDisabled
                  ]}>
                    {day.day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const TimePickerModal = ({ 
    visible, 
    onClose, 
    onSelect, 
    selectedTime, 
    title 
  }: {
    visible: boolean;
    onClose: () => void;
    onSelect: (time: string) => void;
    selectedTime: string;
    title: string;
  }) => (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={onClose}
            >
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={timeOptions}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <View style={styles.modalOptionContent}>
                  <Clock size={20} color={Colors.primary} />
                  <Text style={styles.modalOptionTitle}>{item}</Text>
                </View>
                {selectedTime === item && (
                  <Check size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </Modal>
  );

  const [formData, setFormData] = useState<CreateSessionData>({
    test_type: 'prep',
    title: '',
    description: '',
    location_id: '',
    instructor_id: '',
    session_date: '',
    start_time: '',
    end_time: '',
    capacity: 20,
    price_cents: 15000,
    requirements: [],
    equipment_provided: [],
  });

  const [newRequirement, setNewRequirement] = useState('');
  const [newEquipment, setNewEquipment] = useState('');

  const totalSteps = 4;

  // Date and time options
  const timeOptions = [
    '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
    '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
  ];

  const generateDateOptions = () => {
    const options = [];
    const today = new Date();
    for (let i = 1; i <= 90; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      options.push(date.toISOString().split('T')[0]);
    }
    return options;
  };

  const dateOptions = generateDateOptions();

  useEffect(() => {
    if (user && isAdmin()) {
      loadFormData();
    }
  }, [user]);

  const loadFormData = async () => {
    setLoading(true);
    try {
      // Load locations
      const { data: locationsData, error: locationsError } = await supabase
        .from('locations')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (locationsError) throw locationsError;
      setLocations(locationsData || []);

      // Load instructors
      const { data: instructorsData, error: instructorsError } = await supabase
        .from('instructors')
        .select('*')
        .eq('is_active', true)
        .order('full_name');

      if (instructorsError) throw instructorsError;
      setInstructors(instructorsData || []);

      // If in edit mode, load existing session data
      if (isEditMode && sessionId) {
        const { data: sessionData, error: sessionError } = await supabase
          .from('practice_sessions')
          .select(`
            *,
            location:locations(*),
            instructor:instructors(*)
          `)
          .eq('id', sessionId)
          .single();

        if (sessionError) throw sessionError;

        if (sessionData) {
          setFormData({
            test_type: sessionData.test_type,
            title: sessionData.title,
            description: sessionData.description || '',
            location_id: sessionData.location_id,
            instructor_id: sessionData.instructor_id,
            session_date: sessionData.session_date,
            start_time: sessionData.start_time,
            end_time: sessionData.end_time,
            capacity: sessionData.capacity,
            price_cents: sessionData.price_cents,
            requirements: sessionData.requirements || [],
            equipment_provided: sessionData.equipment_provided || [],
          });
        }
      } else {
        // Set default values for new sessions
        if (locationsData && locationsData.length > 0) {
          setFormData(prev => ({ ...prev, location_id: locationsData[0].id }));
        }
        if (instructorsData && instructorsData.length > 0) {
          setFormData(prev => ({ ...prev, instructor_id: instructorsData[0].id }));
        }
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load form data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a session title');
      return;
    }
    if (!formData.location_id) {
      Alert.alert('Error', 'Please select a location');
      return;
    }
    if (!formData.session_date) {
      Alert.alert('Error', 'Please select a session date');
      return;
    }
    if (!formData.start_time || !formData.end_time) {
      Alert.alert('Error', 'Please enter start and end times');
      return;
    }
    if (formData.capacity < 1) {
      Alert.alert('Error', 'Capacity must be at least 1');
      return;
    }
    if (formData.price_cents < 0) {
      Alert.alert('Error', 'Price cannot be negative');
      return;
    }

    setSaving(true);
    try {
      let result;
      
      if (isEditMode) {
        // Update existing session
        const { data, error } = await supabase
          .from('practice_sessions')
          .update({
            test_type: formData.test_type,
            title: formData.title,
            description: formData.description,
            location_id: formData.location_id,
            instructor_id: formData.instructor_id,
            session_date: formData.session_date,
            start_time: formData.start_time,
            end_time: formData.end_time,
            capacity: formData.capacity,
            price_cents: formData.price_cents,
            requirements: formData.requirements,
            equipment_provided: formData.equipment_provided,
            updated_at: new Date().toISOString(),
          })
          .eq('id', sessionId)
          .select()
          .single();

        if (error) throw error;
        result = { success: true, data };
      } else {
        // Create new session
        result = await createSession(formData);
      }
      
      if (result.success) {
        Alert.alert(
          'Success',
          isEditMode ? 'Practice session updated successfully!' : 'Practice session created successfully!',
          [
            {
              text: 'View Sessions',
              onPress: () => router.push('/admin/practice-sessions'),
            },
            { 
              text: isEditMode ? 'Edit Another' : 'Create Another', 
              onPress: () => isEditMode ? router.back() : resetForm() 
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error || `Failed to ${isEditMode ? 'update' : 'create'} session`);
      }
    } catch (error: any) {
      Alert.alert('Error', `An unexpected error occurred: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      test_type: 'prep',
      title: '',
      description: '',
      location_id: locations.length > 0 ? locations[0].id : '',
      instructor_id: instructors.length > 0 ? instructors[0].id : '',
      session_date: '',
      start_time: '',
      end_time: '',
      capacity: 20,
      price_cents: 15000,
      requirements: [],
      equipment_provided: [],
    });
    setNewRequirement('');
    setNewEquipment('');
    setCurrentStep(1);
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...(prev.requirements || []), newRequirement.trim()],
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements?.filter((_, i) => i !== index) || [],
    }));
  };

  const addEquipment = () => {
    if (newEquipment.trim()) {
      setFormData(prev => ({
        ...prev,
        equipment_provided: [...(prev.equipment_provided || []), newEquipment.trim()],
      }));
      setNewEquipment('');
    }
  };

  const removeEquipment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      equipment_provided: prev.equipment_provided?.filter((_, i) => i !== index) || [],
    }));
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getSelectedLocation = () => {
    return locations.find(loc => loc.id === formData.location_id);
  };

  const getSelectedInstructor = () => {
    return instructors.find(inst => inst.id === formData.instructor_id);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.title.trim() && formData.test_type;
      case 2:
        return formData.location_id && formData.session_date;
      case 3:
        return formData.start_time && formData.end_time && formData.capacity > 0;
      case 4:
        return formData.price_cents > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    } else {
      Alert.alert('Error', 'Please fill in all required fields before continuing.');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={styles.progressBarContainer}>
        <View style={[
          styles.progressBar,
          { width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }
        ]} />
      </View>
      <View style={styles.stepDots}>
        {Array.from({ length: totalSteps }, (_, index) => (
          <View key={index} style={[
            styles.stepDot,
            currentStep > index + 1 && styles.stepDotCompleted,
            currentStep === index + 1 && styles.stepDotActive,
          ]}>
            {currentStep > index + 1 && (
              <Check size={12} color={Colors.white} />
            )}
          </View>
        ))}
      </View>
      <View style={styles.stepLabels}>
        <Text style={[styles.stepLabel, currentStep === 1 && styles.stepLabelActive]}>Basic</Text>
        <Text style={[styles.stepLabel, currentStep === 2 && styles.stepLabelActive]}>Location</Text>
        <Text style={[styles.stepLabel, currentStep === 3 && styles.stepLabelActive]}>Schedule</Text>
        <Text style={[styles.stepLabel, currentStep === 4 && styles.stepLabelActive]}>Details</Text>
      </View>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <Target size={24} color={Colors.primary} />
        <Text style={styles.stepTitle}>Basic Information</Text>
        <Text style={styles.stepSubtitle}>Set up the foundation of your practice session</Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Test Type *</Text>
        <View style={styles.testTypeContainer}>
          {(['prep', 'pin'] as TestType[]).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.testTypeButton,
                formData.test_type === type && styles.testTypeButtonActive,
              ]}
              onPress={() => setFormData(prev => ({ ...prev, test_type: type }))}
            >
              <Text style={[
                styles.testTypeButtonText,
                formData.test_type === type && styles.testTypeButtonTextActive,
              ]}>
                {type.toUpperCase()} Test
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Session Title *</Text>
        <TextInput
          style={styles.input}
          value={formData.title}
          onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
          placeholder="e.g., Weekend PREP Test Practice"
          placeholderTextColor={Colors.textSecondary}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
          placeholder="Describe what participants can expect from this session..."
          placeholderTextColor={Colors.textSecondary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <MapPin size={24} color={Colors.primary} />
        <Text style={styles.stepTitle}>Location & Date</Text>
        <Text style={styles.stepSubtitle}>Choose where and when the session will take place</Text>
      </View>

             <View style={styles.formGroup}>
         <Text style={styles.label}>Location *</Text>
         <TouchableOpacity
           style={styles.selectorButton}
           onPress={() => setShowLocationModal(true)}
         >
          <View style={styles.selectorContent}>
            <MapPin size={20} color={Colors.primary} />
            <View style={styles.selectorText}>
              {getSelectedLocation() ? (
                <>
                  <Text style={styles.selectorTitle}>{getSelectedLocation()?.name}</Text>
                  <Text style={styles.selectorSubtitle}>{getSelectedLocation()?.address}</Text>
                </>
              ) : (
                <Text style={styles.selectorPlaceholder}>Select a location</Text>
              )}
            </View>
          </View>
          <Text style={styles.selectorArrow}>›</Text>
        </TouchableOpacity>
      </View>

             <View style={styles.formGroup}>
         <Text style={styles.label}>Instructor</Text>
         <TouchableOpacity
           style={styles.selectorButton}
           onPress={() => setShowInstructorModal(true)}
         >
          <View style={styles.selectorContent}>
            <User size={20} color={Colors.primary} />
            <View style={styles.selectorText}>
              {getSelectedInstructor() ? (
                <>
                  <Text style={styles.selectorTitle}>{getSelectedInstructor()?.full_name}</Text>
                  <Text style={styles.selectorSubtitle}>{getSelectedInstructor()?.specialties?.join(', ') || 'General Instructor'}</Text>
                </>
              ) : (
                <Text style={styles.selectorPlaceholder}>Select an instructor (optional)</Text>
              )}
            </View>
          </View>
          <Text style={styles.selectorArrow}>›</Text>
        </TouchableOpacity>
      </View>

             <View style={styles.formGroup}>
         <Text style={styles.label}>Session Date *</Text>
         <TouchableOpacity
           style={styles.selectorButton}
           onPress={() => setShowDateModal(true)}
         >
          <View style={styles.selectorContent}>
            <Calendar size={20} color={Colors.primary} />
            <View style={styles.selectorText}>
              {formData.session_date ? (
                <Text style={styles.selectorTitle}>{formatDate(formData.session_date)}</Text>
              ) : (
                <Text style={styles.selectorPlaceholder}>Select a date</Text>
              )}
            </View>
          </View>
          <Text style={styles.selectorArrow}>›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <Clock size={24} color={Colors.primary} />
        <Text style={styles.stepTitle}>Schedule & Capacity</Text>
        <Text style={styles.stepSubtitle}>Set the time and number of participants</Text>
      </View>

      <View style={styles.timeContainer}>
                 <View style={styles.formGroup}>
           <Text style={styles.label}>Start Time *</Text>
           <TouchableOpacity
             style={styles.selectorButton}
             onPress={() => setShowStartTimeModal(true)}
           >
            <View style={styles.selectorContent}>
              <Clock size={20} color={Colors.primary} />
              <View style={styles.selectorText}>
                {formData.start_time ? (
                  <Text style={styles.selectorTitle}>{formData.start_time}</Text>
                ) : (
                  <Text style={styles.selectorPlaceholder}>Select start time</Text>
                )}
              </View>
            </View>
            <Text style={styles.selectorArrow}>›</Text>
          </TouchableOpacity>
        </View>

                 <View style={styles.formGroup}>
           <Text style={styles.label}>End Time *</Text>
           <TouchableOpacity
             style={styles.selectorButton}
             onPress={() => setShowEndTimeModal(true)}
           >
            <View style={styles.selectorContent}>
              <Clock size={20} color={Colors.primary} />
              <View style={styles.selectorText}>
                {formData.end_time ? (
                  <Text style={styles.selectorTitle}>{formData.end_time}</Text>
                ) : (
                  <Text style={styles.selectorPlaceholder}>Select end time</Text>
                )}
              </View>
            </View>
            <Text style={styles.selectorArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Maximum Capacity *</Text>
        <View style={styles.capacityContainer}>
          <TouchableOpacity
            style={styles.capacityButton}
            onPress={() => {
              if (formData.capacity > 1) {
                setFormData(prev => ({ ...prev, capacity: prev.capacity - 1 }));
              }
            }}
          >
            <Text style={styles.capacityButtonText}>-</Text>
          </TouchableOpacity>
          <View style={styles.capacityDisplay}>
            <Text style={styles.capacityNumber}>{formData.capacity}</Text>
            <Text style={styles.capacityLabel}>participants</Text>
          </View>
          <TouchableOpacity
            style={styles.capacityButton}
            onPress={() => setFormData(prev => ({ ...prev, capacity: prev.capacity + 1 }))}
          >
            <Text style={styles.capacityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <Settings size={24} color={Colors.primary} />
        <Text style={styles.stepTitle}>Pricing & Details</Text>
        <Text style={styles.stepSubtitle}>Set the price and additional information</Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Session Price *</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.priceSymbol}>$</Text>
          <TextInput
            style={styles.priceInput}
            value={(formData.price_cents / 100).toString()}
            onChangeText={(text) => {
              const value = parseFloat(text) || 0;
              setFormData(prev => ({ ...prev, price_cents: Math.round(value * 100) }));
            }}
            placeholder="150.00"
            placeholderTextColor={Colors.textSecondary}
            keyboardType="decimal-pad"
          />
        </View>
        <Text style={styles.helperText}>Enter the price in dollars (e.g., 150.00 for $150)</Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>What to Bring</Text>
        <View style={styles.addItemContainer}>
          <TextInput
            style={styles.addItemInput}
            value={newRequirement}
            onChangeText={setNewRequirement}
            placeholder="e.g., Comfortable workout clothes"
            placeholderTextColor={Colors.textSecondary}
            onSubmitEditing={addRequirement}
          />
          <TouchableOpacity style={styles.addButton} onPress={addRequirement}>
            <Plus size={16} color={Colors.white} />
          </TouchableOpacity>
        </View>
        
        {formData.requirements && formData.requirements.length > 0 && (
          <View style={styles.itemList}>
            {formData.requirements.map((requirement, index) => (
              <View key={index} style={styles.itemRow}>
                <Text style={styles.itemText}>• {requirement}</Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeRequirement(index)}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Equipment Provided</Text>
        <View style={styles.addItemContainer}>
          <TextInput
            style={styles.addItemInput}
            value={newEquipment}
            onChangeText={setNewEquipment}
            placeholder="e.g., Stopwatch, cones"
            placeholderTextColor={Colors.textSecondary}
            onSubmitEditing={addEquipment}
          />
          <TouchableOpacity style={styles.addButton} onPress={addEquipment}>
            <Plus size={16} color={Colors.white} />
          </TouchableOpacity>
        </View>
        
        {formData.equipment_provided && formData.equipment_provided.length > 0 && (
          <View style={styles.itemList}>
            {formData.equipment_provided.map((equipment, index) => (
              <View key={index} style={styles.itemRow}>
                <Text style={styles.itemText}>• {equipment}</Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeEquipment(index)}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  if (!isAdmin()) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Create Session' }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Access Denied</Text>
          <Text style={styles.errorText}>
            You don't have permission to access this page.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Create Session' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading form data...</Text>
        </View>
      </SafeAreaView>
    );
  }

    return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Create Session',
          headerShown: false,
        }} 
      />

      <View style={styles.modalContainer}>
        {/* Drag Indicator */}
        <View style={styles.dragIndicator} />
        
        {/* Blue Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Target size={24} color={Colors.white} />
            <Text style={styles.headerTitle}>
              {isEditMode ? 'Edit Practice Session' : 'Create Practice Session'}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.headerCloseButton}
            onPress={() => router.replace('/admin/practice-sessions')}
          >
            <X size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView 
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {renderStepIndicator()}

            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}

            <View style={styles.navigationButtons}>
              <View style={styles.navigationRow}>
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={() => router.replace('/admin/practice-sessions')}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                {currentStep > 1 && (
                  <TouchableOpacity style={styles.backButton} onPress={handlePrevious}>
                    <Text style={styles.backButtonText}>Back</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {currentStep < totalSteps ? (
                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                  <Text style={styles.nextButtonText}>Next</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color={Colors.white} />
                  ) : (
                    <Save size={20} color={Colors.white} />
                  )}
                  <Text style={styles.saveButtonText}>
                    {saving ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Session' : 'Create Session')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

       {/* Modal Pickers */}
       <LocationPickerModal />
       <InstructorPickerModal />
       <DatePickerModal />
       <TimePickerModal
         visible={showStartTimeModal}
         onClose={() => setShowStartTimeModal(false)}
         onSelect={(time) => setFormData(prev => ({ ...prev, start_time: time }))}
         selectedTime={formData.start_time}
         title="Select Start Time"
       />
       <TimePickerModal
         visible={showEndTimeModal}
         onClose={() => setShowEndTimeModal(false)}
         onSelect={(time) => setFormData(prev => ({ ...prev, end_time: time }))}
         selectedTime={formData.end_time}
         title="Select End Time"
       />
       </View>
     );
   }

 const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  dragIndicator: {
    width: 50,
    height: 5,
    backgroundColor: '#9CA3AF',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 0,
    backgroundColor: Colors.primary,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
  },
  headerCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // Step Indicator
  stepIndicator: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: Colors.gray[200],
    borderRadius: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  stepDots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: {
    backgroundColor: Colors.primary,
  },
  stepDotCompleted: {
    backgroundColor: Colors.success,
  },
  stepLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  stepLabelActive: {
    color: Colors.primary,
    fontWeight: '600',
  },

  // Step Content
  stepContent: {
    padding: 20,
    backgroundColor: Colors.white,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Form Groups
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.policeRedBorder,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
  },

  // Test Type Buttons
  testTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  testTypeButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.policeRedBorder,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  testTypeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  testTypeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  testTypeButtonTextActive: {
    color: Colors.white,
  },

  // Selector Buttons
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectorText: {
    marginLeft: 12,
    flex: 1,
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  selectorSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  selectorPlaceholder: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  selectorArrow: {
    fontSize: 20,
    color: Colors.textSecondary,
    fontWeight: '300',
  },

  // Time Container
  timeContainer: {
    gap: 16,
  },

  // Capacity Container
  capacityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  capacityButton: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gray[100],
  },
  capacityButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  capacityDisplay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  capacityNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  capacityLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Price Container
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  priceSymbol: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    fontSize: 20,
    color: Colors.text,
    paddingVertical: 16,
  },

  // Add Items
  addItemContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  addItemInput: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
  },
  addButton: {
    backgroundColor: Colors.primary,
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Item Lists
  itemList: {
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.error + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.error,
  },

  // Navigation Buttons
  navigationButtons: {
    padding: 20,
    gap: 12,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  navigationRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  headerBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerBackText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  nextButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
     saveButtonText: {
     fontSize: 16,
     fontWeight: '700',
     color: Colors.white,
   },

   // Modal Styles
   modalOverlay: {
     flex: 1,
     justifyContent: 'center',
     alignItems: 'center',
     backgroundColor: 'rgba(0,0,0,0.5)',
   },
   modalContent: {
     backgroundColor: Colors.white,
     borderRadius: 16,
     width: '90%',
     maxHeight: '70%',
     borderWidth: 1,
     borderColor: Colors.border,
     shadowColor: '#000',
     shadowOffset: {
       width: 0,
       height: 2,
     },
     shadowOpacity: 0.25,
     shadowRadius: 3.84,
     elevation: 5,
   },
   modalHeader: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
     padding: 20,
     borderBottomWidth: 1,
     borderBottomColor: Colors.border,
   },
   modalTitle: {
     fontSize: 20,
     fontWeight: '700',
     color: Colors.text,
   },
   modalCloseButton: {
     width: 32,
     height: 32,
     borderRadius: 16,
     backgroundColor: Colors.gray[100],
     alignItems: 'center',
     justifyContent: 'center',
   },
   modalOption: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'space-between',
     paddingVertical: 16,
     paddingHorizontal: 20,
     borderBottomWidth: 1,
     borderBottomColor: Colors.border,
   },
   modalOptionContent: {
     flexDirection: 'row',
     alignItems: 'center',
     flex: 1,
   },
   modalOptionText: {
     marginLeft: 12,
     flex: 1,
   },
   modalOptionTitle: {
     fontSize: 16,
     fontWeight: '500',
     color: Colors.text,
   },
   modalOptionSubtitle: {
     fontSize: 14,
     color: Colors.textSecondary,
     marginTop: 2,
   },

   // Calendar Styles
   calendarModalContent: {
     width: '95%',
     maxHeight: '80%',
   },
   calendarHeader: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
     paddingHorizontal: 20,
     paddingVertical: 16,
     borderBottomWidth: 1,
     borderBottomColor: Colors.border,
   },
   calendarNavButton: {
     width: 40,
     height: 40,
     borderRadius: 20,
     backgroundColor: Colors.gray[100],
     alignItems: 'center',
     justifyContent: 'center',
   },
   calendarNavText: {
     fontSize: 20,
     fontWeight: '600',
     color: Colors.primary,
   },
   calendarMonthText: {
     fontSize: 18,
     fontWeight: '700',
     color: Colors.text,
   },
   calendarWeekdays: {
     flexDirection: 'row',
     paddingHorizontal: 20,
     paddingVertical: 12,
     borderBottomWidth: 1,
     borderBottomColor: Colors.border,
   },
   calendarWeekdayText: {
     flex: 1,
     fontSize: 14,
     fontWeight: '600',
     color: Colors.textSecondary,
     textAlign: 'center',
   },
   calendarGrid: {
     flexDirection: 'row',
     flexWrap: 'wrap',
     paddingHorizontal: 20,
     paddingVertical: 16,
   },
   calendarDay: {
     width: '14.28%',
     height: 40,
     alignItems: 'center',
     justifyContent: 'center',
     marginVertical: 2,
   },
   calendarDayOtherMonth: {
     opacity: 0.3,
   },
   calendarDayToday: {
     backgroundColor: Colors.primary + '20',
     borderRadius: 20,
   },
   calendarDaySelected: {
     backgroundColor: Colors.primary,
     borderRadius: 20,
   },
   calendarDayDisabled: {
     opacity: 0.3,
   },
   calendarDayText: {
     fontSize: 16,
     fontWeight: '500',
     color: Colors.text,
   },
   calendarDayTextOtherMonth: {
     color: Colors.textSecondary,
   },
   calendarDayTextToday: {
     color: Colors.primary,
     fontWeight: '700',
   },
   calendarDayTextSelected: {
     color: Colors.white,
     fontWeight: '700',
   },
   calendarDayTextDisabled: {
     color: Colors.textSecondary,
   },

   // Location Styles
   largeModalContent: {
     width: '95%',
     maxHeight: '85%',
   },
   addLocationButton: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'center',
     paddingVertical: 16,
     paddingHorizontal: 20,
     marginHorizontal: 20,
     marginTop: 16,
     marginBottom: 8,
     borderRadius: 12,
     borderWidth: 2,
     borderColor: Colors.primary,
     borderStyle: 'dashed',
     backgroundColor: Colors.primary + '10',
   },
   addLocationButtonText: {
     marginLeft: 8,
     fontSize: 16,
     fontWeight: '600',
     color: Colors.primary,
   },
   addLocationForm: {
     paddingHorizontal: 20,
     paddingBottom: 20,
   },
   mapButton: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'center',
     paddingVertical: 16,
     paddingHorizontal: 20,
     borderRadius: 12,
     borderWidth: 2,
     borderColor: Colors.primary,
     backgroundColor: Colors.primary + '10',
     gap: 8,
   },
   mapButtonText: {
     fontSize: 16,
     fontWeight: '600',
     color: Colors.primary,
   },
   addLocationActions: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     marginTop: 24,
     gap: 12,
   },
  addLocationCancelButtonText: {
     fontSize: 16,
     fontWeight: '600',
     color: Colors.text,
   },
 });
