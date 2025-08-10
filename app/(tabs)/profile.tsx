import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
} from "react-native";
import { 
  User, 
  Calendar, 
  Award, 
  LogOut, 
  Settings, 
  Crown, 
  Edit3, 
  MapPin, 
  Phone, 
  Mail,
  Target,
  TrendingUp,
  Clock,
  Activity,
  Shield,
  BookOpen,
  Camera,
  Lock,
  Key,
  UserCheck
} from "lucide-react-native";
import Colors from "@/constants/colors";
import Button from "@/components/Button";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import ProfileCompletionWidget from "@/components/ProfileCompletionWidget";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import Logo from "@/components/Logo";



export default function ProfileScreen() {
  const { user, signOut, updateProfile: updateAuthProfile, isLoading, isAdmin } = useAuth();
  const { subscription, getDaysUntilExpiry } = useSubscription();
  
  // Mock data for now
  const profile = user;
  const updateProfile = updateAuthProfile;
  const fitnessProgress = { totalWorkouts: 12, currentStreak: 5 };
  const workoutLogs: any[] = [];
  const isPremium = subscription.plan !== 'free';
  const getCurrentPlan = () => subscription.plan;
  
  const [activeTab, setActiveTab] = useState<'overview' | 'account' | 'settings'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.full_name || "");
  const [email, setEmail] = useState(profile?.email || user?.email || "");
  const [goal, setGoal] = useState(profile?.goal || "");
  const [targetDate, setTargetDate] = useState(user?.target_test_date || "");
  const [experienceLevel, setExperienceLevel] = useState<"beginner" | "intermediate" | "advanced">(
    user?.experience_level || "beginner"
  );
  const [phone, setPhone] = useState(user?.phone || "");
  const [location, setLocation] = useState(user?.location || "Ontario, Canada");
  const [bio, setBio] = useState("Aspiring police officer preparing for the PREP test");
  const [isSaving, setIsSaving] = useState(false);
  
  // Personal information state
  const [dateOfBirth, setDateOfBirth] = useState(user?.date_of_birth || "");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">(user?.gender || "");
  const [height, setHeight] = useState(user?.height?.toString() || "");
  const [weight, setWeight] = useState(user?.weight?.toString() || "");
  const [emergencyContact, setEmergencyContact] = useState(user?.emergency_contact || "");
  const [emergencyPhone, setEmergencyPhone] = useState(user?.emergency_phone || "");
  
  // Goals state
  const [departmentInterest, setDepartmentInterest] = useState(user?.department_interest || "");
  const [motivation, setMotivation] = useState(user?.motivation || "");
  const [hasExperience, setHasExperience] = useState(user?.has_experience || false);
  const [previousTraining, setPreviousTraining] = useState(user?.previous_training || "");
  
  // Fitness profile state
  const [currentFitnessLevel, setCurrentFitnessLevel] = useState<"beginner" | "intermediate" | "advanced">(user?.current_fitness_level || "beginner");
  const [workoutFrequency, setWorkoutFrequency] = useState<"1-2 times/week" | "3-4 times/week" | "5+ times/week" | "">(user?.workout_frequency || "");
  const [availableTime, setAvailableTime] = useState<"15-30 minutes" | "30-60 minutes" | "60+ minutes" | "">(user?.available_time || "");
  const [injuries, setInjuries] = useState(user?.injuries || "");
  const [medicalConditions, setMedicalConditions] = useState(user?.medical_conditions || "");
  
  // Account details state
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [accountName, setAccountName] = useState(user?.full_name || "");
  const [accountEmail, setAccountEmail] = useState(user?.email || "");
  const [accountPhone, setAccountPhone] = useState(user?.phone || "");
  const [isUpdatingAccount, setIsUpdatingAccount] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Redirect to welcome screen if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      console.log('User not authenticated in profile, redirecting to welcome screen');
      router.replace('/');
    }
  }, [user, isLoading]);

  // Calculate stats
  const totalWorkouts = workoutLogs.length;
  const completedWorkouts = workoutLogs.filter(log => log.completed).length;
  const totalHours = Math.floor(workoutLogs.reduce((sum, log) => sum + log.duration, 0) / 3600);
  const currentLevel = 1;
  const joinedDays = user?.created_at ? Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0;

  useEffect(() => {
    if (profile) {
      setName(user?.full_name || "");
      setEmail(profile.email || user?.email || "");
      setGoal(profile.goal || "");
      setTargetDate(user?.target_test_date || "");
      setExperienceLevel(user?.experience_level || "beginner");
    }
    
    // Update account details when user changes
    if (user) {
      setAccountName(user.full_name || "");
      setAccountEmail(user.email || "");
      setAccountPhone(user.phone || "");
      setPhone(user.phone || "");
      
      // Update personal information
      setDateOfBirth(user.date_of_birth || "");
      setGender(user.gender || "");
      setHeight(user.height?.toString() || "");
      setWeight(user.weight?.toString() || "");
      setLocation(user.location || "Ontario, Canada");
      setEmergencyContact(user.emergency_contact || "");
      setEmergencyPhone(user.emergency_phone || "");
      
      // Update goals
      setDepartmentInterest(user.department_interest || "");
      setMotivation(user.motivation || "");
      setHasExperience(user.has_experience || false);
      setPreviousTraining(user.previous_training || "");
      
      // Update fitness profile
      setCurrentFitnessLevel(user.current_fitness_level || "beginner");
      setWorkoutFrequency(user.workout_frequency || "");
      setAvailableTime(user.available_time || "");
      setInjuries(user.injuries || "");
      setMedicalConditions(user.medical_conditions || "");
    }
  }, [profile, user]);

  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    setIsSaving(true);
    
    try {
      // Update UserContext with camelCase properties
      const userContextProfile = {
        name,
        email,
        goal,
        targetDate,
        experienceLevel,
      };
      updateProfile(userContextProfile);

      // Update AuthContext with database column names - include all profile data
      const authContextProfile = {
        full_name: name,
        phone,
        location,
        goal,
        target_test_date: targetDate,
        experience_level: experienceLevel,
        
        // Personal information
        date_of_birth: dateOfBirth || null,
        gender: gender !== "" ? gender : null,
        height: height ? parseFloat(height) : null,
        weight: weight ? parseFloat(weight) : null,
        emergency_contact: emergencyContact || null,
        emergency_phone: emergencyPhone || null,
        
        // Goals and aspirations
        department_interest: departmentInterest || null,
        motivation: motivation || null,
        has_experience: hasExperience,
        previous_training: previousTraining || null,
        
        // Fitness profile
        current_fitness_level: currentFitnessLevel,
        workout_frequency: workoutFrequency || null,
        available_time: availableTime || null,
        injuries: injuries || null,
        medical_conditions: medicalConditions || null,
        
        // Legacy compatibility
        fitness_level: currentFitnessLevel,
      };
      await updateAuthProfile(authContextProfile);
      
      setIsEditing(false);
      // Don't show alert here as updateAuthProfile already shows success/error alerts
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    setName(user?.full_name || "");
    setEmail(profile?.email || user?.email || "");
    setGoal(profile?.goal || "");
    setTargetDate(user?.target_test_date || "");
    setExperienceLevel(user?.experience_level || "beginner");
    setIsEditing(false);
  };
  
  const handleAccountSave = async () => {
    if (!accountName.trim()) {
      Alert.alert("Error", "Please enter your full name");
      return;
    }
    
    if (!accountEmail.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }
    
    setIsUpdatingAccount(true);
    
    try {
      const accountUpdates = {
        full_name: accountName,
        phone: accountPhone || null,
      };
      
      await updateAuthProfile(accountUpdates);
      
      // Also update the local state
      setName(accountName);
      setPhone(accountPhone);
      
      setIsEditingAccount(false);
    } catch (error) {
      console.error('Error updating account:', error);
    } finally {
      setIsUpdatingAccount(false);
    }
  };
  
  const handleAccountCancel = () => {
    setAccountName(user?.full_name || "");
    setAccountEmail(user?.email || "");
    setAccountPhone(user?.phone || "");
    setIsEditingAccount(false);
  };
  
  const handlePasswordReset = () => {
    if (!user?.email) {
      Alert.alert("Error", "No email address found for your account");
      return;
    }
    
    Alert.alert(
      "Reset Password",
      `A password reset link will be sent to ${user.email}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send Reset Link",
          onPress: async () => {
            setIsResettingPassword(true);
            try {
              const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
                redirectTo: 'https://your-app.com/reset-password',
              });
              
              if (error) {
                console.error('Password reset error:', error);
                Alert.alert("Error", error.message || "Failed to send password reset link");
              } else {
                Alert.alert(
                  "Success", 
                  "Password reset link sent to your email! Please check your inbox and follow the instructions."
                );
              }
            } catch (error: any) {
              console.error('Password reset error:', error);
              Alert.alert("Error", "Failed to send password reset link. Please try again.");
            } finally {
              setIsResettingPassword(false);
            }
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: () => signOut(),
        },
      ]
    );
  };

  const experienceLevels = [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'account':
        return renderAccountTab();
      case 'settings':
        return renderSettingsTab();
      default:
        return renderOverviewTab();
    }
  };
  
  const renderOverviewTab = () => (
    <>
      {/* Profile Completion Widget */}
      <ProfileCompletionWidget />

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Activity size={24} color={Colors.primary} />
          <Text style={styles.statNumber}>{completedWorkouts}</Text>
          <Text style={styles.statLabel}>Workouts</Text>
        </View>
        <View style={styles.statCard}>
          <Clock size={24} color={Colors.secondary} />
          <Text style={styles.statNumber}>{totalHours}h</Text>
          <Text style={styles.statLabel}>Training</Text>
        </View>
        <View style={styles.statCard}>
          <TrendingUp size={24} color={Colors.success} />
          <Text style={styles.statNumber}>{currentLevel}</Text>
          <Text style={styles.statLabel}>Level</Text>
        </View>
        <View style={styles.statCard}>
          <Target size={24} color={Colors.warning} />
          <Text style={styles.statNumber}>{Math.round((completedWorkouts / Math.max(totalWorkouts, 1)) * 100)}%</Text>
          <Text style={styles.statLabel}>Success</Text>
        </View>
      </View>

      {/* Edit Form */}
      {isEditing && (
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Edit Profile</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputContainer}>
              <User size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                placeholderTextColor={Colors.gray[400]}
                testID="name-input"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <Mail size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={Colors.gray[400]}
                keyboardType="email-address"
                autoCapitalize="none"
                testID="email-input"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <Phone size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="(555) 123-4567"
                placeholderTextColor={Colors.gray[400]}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <View style={styles.inputContainer}>
              <MapPin size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="City, Province"
                placeholderTextColor={Colors.gray[400]}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date of Birth</Text>
            <View style={styles.inputContainer}>
              <Calendar size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.gray[400]}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.levelContainer}>
              {[{value: "male", label: "Male"}, {value: "female", label: "Female"}, {value: "other", label: "Other"}].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.levelOption,
                    gender === option.value && styles.selectedLevelOption,
                  ]}
                  onPress={() => setGender(option.value as "male" | "female" | "other")}
                >
                  <Text
                    style={[
                      styles.levelOptionText,
                      gender === option.value && styles.selectedLevelOptionText,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Height (cm)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={height}
                onChangeText={setHeight}
                placeholder="170"
                placeholderTextColor={Colors.gray[400]}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Weight (kg)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                placeholder="70"
                placeholderTextColor={Colors.gray[400]}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Emergency Contact</Text>
            <View style={styles.inputContainer}>
              <User size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={emergencyContact}
                onChangeText={setEmergencyContact}
                placeholder="Emergency contact name"
                placeholderTextColor={Colors.gray[400]}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Emergency Phone</Text>
            <View style={styles.inputContainer}>
              <Phone size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={emergencyPhone}
                onChangeText={setEmergencyPhone}
                placeholder="(555) 123-4567"
                placeholderTextColor={Colors.gray[400]}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Department Interest</Text>
            <View style={styles.inputContainer}>
              <Shield size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={departmentInterest}
                onChangeText={setDepartmentInterest}
                placeholder="e.g., Toronto Police Service"
                placeholderTextColor={Colors.gray[400]}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Motivation</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.bioInput]}
                value={motivation}
                onChangeText={setMotivation}
                placeholder="What motivates you to become a police officer?"
                placeholderTextColor={Colors.gray[400]}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Previous Training</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.bioInput]}
                value={previousTraining}
                onChangeText={setPreviousTraining}
                placeholder="Describe any relevant training or experience"
                placeholderTextColor={Colors.gray[400]}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Current Fitness Level</Text>
            <View style={styles.levelContainer}>
              {experienceLevels.map((level) => (
                <TouchableOpacity
                  key={level.value}
                  style={[
                    styles.levelOption,
                    currentFitnessLevel === level.value && styles.selectedLevelOption,
                  ]}
                  onPress={() => setCurrentFitnessLevel(level.value as "beginner" | "intermediate" | "advanced")}
                >
                  <Text
                    style={[
                      styles.levelOptionText,
                      currentFitnessLevel === level.value && styles.selectedLevelOptionText,
                    ]}
                  >
                    {level.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Workout Frequency</Text>
            <View style={styles.levelContainer}>
              {[{value: "1-2 times/week", label: "1-2x"}, {value: "3-4 times/week", label: "3-4x"}, {value: "5+ times/week", label: "5+x"}].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.levelOption,
                    workoutFrequency === option.value && styles.selectedLevelOption,
                  ]}
                  onPress={() => setWorkoutFrequency(option.value as "1-2 times/week" | "3-4 times/week" | "5+ times/week")}
                >
                  <Text
                    style={[
                      styles.levelOptionText,
                      workoutFrequency === option.value && styles.selectedLevelOptionText,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Available Time per Session</Text>
            <View style={styles.levelContainer}>
              {[{value: "15-30 minutes", label: "15-30m"}, {value: "30-60 minutes", label: "30-60m"}, {value: "60+ minutes", label: "60+m"}].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.levelOption,
                    availableTime === option.value && styles.selectedLevelOption,
                  ]}
                  onPress={() => setAvailableTime(option.value as "15-30 minutes" | "30-60 minutes" | "60+ minutes")}
                >
                  <Text
                    style={[
                      styles.levelOptionText,
                      availableTime === option.value && styles.selectedLevelOptionText,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Injuries or Limitations</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.bioInput]}
                value={injuries}
                onChangeText={setInjuries}
                placeholder="Describe any injuries or physical limitations"
                placeholderTextColor={Colors.gray[400]}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Medical Conditions</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.bioInput]}
                value={medicalConditions}
                onChangeText={setMedicalConditions}
                placeholder="List any relevant medical conditions"
                placeholderTextColor={Colors.gray[400]}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Previous Experience</Text>
            <TouchableOpacity
              style={[
                styles.checkboxContainer,
                hasExperience && styles.checkboxSelected,
              ]}
              onPress={() => setHasExperience(!hasExperience)}
            >
              <Text style={[
                styles.checkboxText,
                hasExperience && styles.checkboxTextSelected,
              ]}>
                I have previous law enforcement or security experience
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your Goal</Text>
            <View style={styles.inputContainer}>
              <Target size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={goal}
                onChangeText={setGoal}
                placeholder="e.g., Pass PREP test by December"
                placeholderTextColor={Colors.gray[400]}
                testID="goal-input"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Target Date</Text>
            <View style={styles.inputContainer}>
              <Calendar size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={targetDate}
                onChangeText={setTargetDate}
                placeholder="MM/YYYY"
                placeholderTextColor={Colors.gray[400]}
                testID="target-date-input"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Experience Level</Text>
            <View style={styles.levelContainer}>
              {experienceLevels.map((level) => (
                <TouchableOpacity
                  key={level.value}
                  style={[
                    styles.levelOption,
                    experienceLevel === level.value && styles.selectedLevelOption,
                  ]}
                  onPress={() => setExperienceLevel(level.value as "beginner" | "intermediate" | "advanced")}
                  testID={`level-${level.value}`}
                >
                  <Text
                    style={[
                      styles.levelOptionText,
                      experienceLevel === level.value && styles.selectedLevelOptionText,
                    ]}
                  >
                    {level.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.editActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Button
              title="Save Changes"
              onPress={handleSave}
              loading={isSaving}
              style={styles.saveButton}
              testId="save-profile-button"
            />
          </View>
        </View>
      )}





    </>
  );
  
  const renderAccountTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.accountSection}>
        <Text style={styles.sectionTitle}>Account Details</Text>
        
        {!isEditingAccount ? (
          <>
            <View style={styles.accountItem}>
              <UserCheck size={20} color={Colors.primary} />
              <View style={styles.accountContent}>
                <Text style={styles.accountLabel}>Full Name</Text>
                <Text style={styles.accountValue}>{user?.full_name || 'Not provided'}</Text>
              </View>
            </View>
            
            <View style={styles.accountItem}>
              <Mail size={20} color={Colors.primary} />
              <View style={styles.accountContent}>
                <Text style={styles.accountLabel}>Email Address</Text>
                <Text style={styles.accountValue}>{user?.email || 'Not provided'}</Text>
              </View>
            </View>
            
            <View style={styles.accountItem}>
              <Phone size={20} color={Colors.primary} />
              <View style={styles.accountContent}>
                <Text style={styles.accountLabel}>Phone Number</Text>
                <Text style={styles.accountValue}>{user?.phone || 'Not provided'}</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.editAccountButton} 
              onPress={() => setIsEditingAccount(true)}
            >
              <Edit3 size={16} color={Colors.white} />
              <Text style={styles.editAccountButtonText}>Edit Account Details</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputContainer}>
                <UserCheck size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={accountName}
                  onChangeText={setAccountName}
                  placeholder="Enter your full name"
                  placeholderTextColor={Colors.gray[400]}
                  testID="account-name-input"
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={[styles.inputContainer, styles.disabledInput]}>
                <Mail size={20} color={Colors.gray[400]} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.disabledInputText]}
                  value={accountEmail}
                  placeholder="Email cannot be changed"
                  placeholderTextColor={Colors.gray[400]}
                  editable={false}
                  testID="account-email-input"
                />
              </View>
              <Text style={styles.inputHint}>Email address cannot be changed for security reasons</Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputContainer}>
                <Phone size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={accountPhone}
                  onChangeText={setAccountPhone}
                  placeholder="(555) 123-4567"
                  placeholderTextColor={Colors.gray[400]}
                  keyboardType="phone-pad"
                  testID="account-phone-input"
                />
              </View>
            </View>
            
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleAccountCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <Button
                title="Save Changes"
                onPress={handleAccountSave}
                loading={isUpdatingAccount}
                style={styles.saveButton}
                testId="save-account-button"
              />
            </View>
          </>
        )}
      </View>
      
      <View style={styles.securitySection}>
        <Text style={styles.sectionTitle}>Security</Text>
        
        <TouchableOpacity 
          style={[styles.securityItem, isResettingPassword && styles.disabledSecurityItem]} 
          onPress={handlePasswordReset}
          disabled={isResettingPassword}
        >
          <Key size={20} color={isResettingPassword ? Colors.gray[400] : Colors.primary} />
          <View style={styles.securityContent}>
            <Text style={[styles.securityLabel, isResettingPassword && styles.disabledSecurityLabel]}>Reset Password</Text>
            <Text style={styles.securityDescription}>
              {isResettingPassword ? "Sending reset link..." : "Send a password reset link to your email"}
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.securityItem} onPress={() => {}}>
          <Lock size={20} color={Colors.primary} />
          <View style={styles.securityContent}>
            <Text style={styles.securityLabel}>Two-Factor Authentication</Text>
            <Text style={styles.securityDescription}>Add an extra layer of security (Coming Soon)</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      <View style={styles.accountInfoSection}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>User ID</Text>
          <Text style={styles.infoValue}>{user?.id}</Text>
          
          <Text style={styles.infoLabel}>Member Since</Text>
          <Text style={styles.infoValue}>
            {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
          </Text>
          
          <Text style={styles.infoLabel}>Last Updated</Text>
          <Text style={styles.infoValue}>
            {user?.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A'}
          </Text>
        </View>
      </View>
    </View>
  );
  
  const renderSettingsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Account Actions</Text>
        
        <TouchableOpacity 
          style={[styles.actionButton, isPremium && styles.premiumButton]} 
          onPress={() => router.push('/subscription')}
        >
          <Crown size={20} color={isPremium ? Colors.primary : Colors.textSecondary} />
          <View style={styles.actionContent}>
            <Text style={[styles.actionButtonText, isPremium && styles.premiumText]}>Subscription</Text>
            <Text style={styles.actionSubtext}>
              {isPremium 
                ? `${subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan${getDaysUntilExpiry() ? ` - ${getDaysUntilExpiry()} days left` : ''}` 
                : "Upgrade to Premium"}
            </Text>
          </View>
        </TouchableOpacity>
        
        {isAdmin() && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.adminButton]} 
            onPress={() => router.push('/admin/dashboard')}
          >
            <Shield size={20} color={Colors.primary} />
            <View style={styles.actionContent}>
              <Text style={[styles.actionButtonText, styles.adminText]}>Admin Dashboard</Text>
              <Text style={styles.actionSubtext}>Manage users and content</Text>
            </View>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
          <Settings size={20} color={Colors.textSecondary} />
          <View style={styles.actionContent}>
            <Text style={styles.actionButtonText}>Settings & Privacy</Text>
            <Text style={styles.actionSubtext}>Manage your preferences</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
          <BookOpen size={20} color={Colors.textSecondary} />
          <View style={styles.actionContent}>
            <Text style={styles.actionButtonText}>Help & Support</Text>
            <Text style={styles.actionSubtext}>Get help and contact us</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, styles.signOutButton]} onPress={handleSignOut}>
          <LogOut size={20} color={Colors.error} />
          <View style={styles.actionContent}>
            <Text style={[styles.actionButtonText, styles.signOutText]}>Sign Out</Text>
            <Text style={styles.actionSubtext}>Sign out of your account</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>About This App</Text>
        <Text style={styles.infoText}>
          This app is designed to help aspiring police officers in Ontario prepare for the physical fitness requirements and navigate the application process. We provide workout plans, application guidance, and community support to help you achieve your goal of becoming a police officer.
        </Text>
        
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Cover Photo */}
        <View style={styles.coverContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=300&fit=crop' }}
            style={styles.coverPhoto}
          />
          <View style={styles.coverOverlay} />
          
          {/* Profile Picture */}
          <View style={styles.profilePictureContainer}>
            <View style={styles.profilePicture}>
              <User size={40} color={Colors.white} />
            </View>
            <TouchableOpacity style={styles.cameraButton}>
              <Camera size={16} color={Colors.white} />
            </TouchableOpacity>
          </View>
          
          {/* Logo in top right */}
          <View style={styles.logoContainer}>
            <Logo size="small" variant="light" showText={false} />
          </View>
          
          {/* Edit Button - only show on overview tab */}
          {activeTab === 'overview' && (
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={() => setIsEditing(!isEditing)}
            >
              <Edit3 size={20} color={Colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{name || 'Your Name'}</Text>
          <Text style={styles.profileBio}>{bio}</Text>
          
          <View style={styles.profileMeta}>
            <View style={styles.metaItem}>
              <MapPin size={14} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{location}</Text>
            </View>
            <View style={styles.metaItem}>
              <Calendar size={14} color={Colors.textSecondary} />
              <Text style={styles.metaText}>Joined {joinedDays} days ago</Text>
            </View>
          </View>
        </View>
        
        {/* Tab Navigation */}
        <View style={styles.tabNavigation}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'overview' && styles.activeTabButton]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'overview' && styles.activeTabButtonText]}>Overview</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'account' && styles.activeTabButton]}
            onPress={() => setActiveTab('account')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'account' && styles.activeTabButtonText]}>Account</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'settings' && styles.activeTabButton]}
            onPress={() => setActiveTab('settings')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'settings' && styles.activeTabButtonText]}>Settings</Text>
          </TouchableOpacity>
        </View>
        
        {/* Tab Content */}
        {renderTabContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  coverContainer: {
    position: 'relative',
    height: 200,
  },
  coverPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  profilePictureContainer: {
    position: 'absolute',
    bottom: -40,
    left: 20,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.white,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  logoContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  editButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInfo: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: Colors.white,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  profileBio: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  profileMeta: {
    flexDirection: 'row',
    gap: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  formContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    margin: 16,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  bioInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  actionsContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    margin: 16,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  levelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  levelOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  selectedLevelOption: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  levelOptionText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "500",
  },
  selectedLevelOptionText: {
    color: Colors.white,
  },
  saveButton: {
    flex: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: Colors.gray[100],
  },
  premiumButton: {
    backgroundColor: Colors.primary + '10',
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  actionContent: {
    marginLeft: 12,
    flex: 1,
  },
  actionSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  premiumText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: Colors.error + '10',
  },
  actionButtonText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  signOutText: {
    color: Colors.error,
  },
  infoSection: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  userInfo: {
    backgroundColor: Colors.gray[100],
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  userInfoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  userInfoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  versionText: {
    fontSize: 12,
    color: Colors.gray[400],
    textAlign: "center",
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: Colors.primary,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  activeTabButtonText: {
    color: Colors.white,
  },
  tabContent: {
    paddingBottom: 32,
  },
  accountSection: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    margin: 16,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  accountContent: {
    marginLeft: 16,
    flex: 1,
  },
  accountLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  accountValue: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  editAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  editAccountButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  disabledInput: {
    backgroundColor: Colors.gray[100],
    borderColor: Colors.gray[200],
  },
  disabledInputText: {
    color: Colors.gray[400],
  },
  inputHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  securitySection: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    margin: 16,
    marginTop: 0,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  securityContent: {
    marginLeft: 16,
    flex: 1,
  },
  securityLabel: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
    marginBottom: 4,
  },
  securityDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  accountInfoSection: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    margin: 16,
    marginTop: 0,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoCard: {
    backgroundColor: Colors.gray[100],
    borderRadius: 8,
    padding: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: 'monospace',
  },
  disabledSecurityItem: {
    opacity: 0.6,
  },
  disabledSecurityLabel: {
    color: Colors.gray[400],
  },
  adminButton: {
    backgroundColor: Colors.primary + '10',
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  adminText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.white,
  },
  checkboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  checkboxTextSelected: {
    color: Colors.white,
  },
});