import { useState } from "react";
import { 
  StyleSheet,
  Alert,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


import Colors from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import { 
  User, 
  Camera, 
  MapPin, 
  ChevronRight, 
  Lock, 
  HelpCircle, 
  Shield, 
  LogOut, 
  X, 
  Phone, 
  Calendar, 
  Mail 
} from "lucide-react-native";
import PoliceThemeBackground from "@/components/PoliceThemeBackground";
import ProfessionalBackground from "@/components/ProfessionalBackground";
import ResetPasswordModal from "@/components/ResetPasswordModal";
import HelpSupportModal from "@/components/HelpSupportModal";

export default function ProfileScreen() {
  const { user, signOut, updateProfile: updateAuthProfile, isAdmin } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showHelpSupportModal, setShowHelpSupportModal] = useState(false);
  
  // Profile form state
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [location, setLocation] = useState(user?.location || "");
  const [dateOfBirth, setDateOfBirth] = useState(user?.date_of_birth || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Error', 'First name and last name are required');
      return;
    }

    setIsSaving(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const updateData: any = {
        full_name: fullName,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim() || null,
        location: location.trim() || null,
      };
      
      // Only include date_of_birth if it has a value
      if (dateOfBirth.trim()) {
        updateData.date_of_birth = dateOfBirth.trim();
      }
      
      await updateAuthProfile(updateData);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFirstName(user?.first_name || "");
    setLastName(user?.last_name || "");
    setPhone(user?.phone || "");
    setLocation(user?.location || "");
    setDateOfBirth(user?.date_of_birth || "");
    setIsEditing(false);
  };

  const handlePasswordReset = () => {
    setShowResetPasswordModal(true);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const handleContactSupport = () => {
    setShowHelpSupportModal(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <ProfessionalBackground variant="fitness">
        <View />
      </ProfessionalBackground>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <View style={styles.profilePicture}>
              <User size={40} color={Colors.white} />
            </View>
            <TouchableOpacity style={styles.editPictureButton}>
              <Camera size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.profileName}>
            {firstName && lastName ? `${firstName} ${lastName}` : user?.full_name || 'Your Name'}
          </Text>
          <Text style={styles.profileSubtitle}>Police Officer Candidate</Text>
          
          {location && (
            <View style={styles.locationContainer}>
              <MapPin size={16} color={Colors.textSecondary} />
              <Text style={styles.locationText}>{location}</Text>
            </View>
          )}
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.settingsCard}>
            <TouchableOpacity style={styles.settingItem} onPress={() => setIsEditing(true)}>
              <User size={20} color={Colors.primary} />
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Profile Information</Text>
                <Text style={styles.settingDescription}>Edit your personal details</Text>
              </View>
              <ChevronRight size={16} color={Colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem} onPress={handlePasswordReset}>
              <Lock size={20} color={Colors.primary} />
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Reset Password</Text>
                <Text style={styles.settingDescription}>Change your password</Text>
              </View>
              <ChevronRight size={16} color={Colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem} onPress={handleContactSupport}>
              <HelpCircle size={20} color={Colors.primary} />
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Help & Support</Text>
                <Text style={styles.settingDescription}>Get help and contact support</Text>
              </View>
              <ChevronRight size={16} color={Colors.textSecondary} />
            </TouchableOpacity>

            {isAdmin() && (
              <TouchableOpacity 
                style={styles.settingItem} 
                onPress={() => router.push('/admin/dashboard')}
              >
                <Shield size={20} color={Colors.primary} />
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>Admin Panel</Text>
                  <Text style={styles.settingDescription}>Access administrative tools</Text>
                </View>
                <ChevronRight size={16} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={[styles.settingItem, styles.dangerItem]} 
              onPress={handleSignOut}
            >
              <LogOut size={20} color={Colors.error} />
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, styles.dangerText]}>Sign Out</Text>
                <Text style={styles.settingDescription}>Sign out of your account</Text>
              </View>
              <ChevronRight size={16} color={Colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Information Modal */}
        <Modal
          visible={isEditing}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleCancel}>
                <X size={24} color={Colors.white} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Profile Information</Text>
              <TouchableOpacity 
                onPress={handleSave}
                disabled={isSaving}
                style={styles.saveButton}
              >
                <Text style={[styles.saveButtonText, isSaving && styles.saveButtonTextDisabled]}>
                  {isSaving ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>First Name</Text>
                <View style={styles.inputContainer}>
                  <User size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Enter your first name"
                    placeholderTextColor={Colors.textSecondary}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Last Name</Text>
                <View style={styles.inputContainer}>
                  <User size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Enter your last name"
                    placeholderTextColor={Colors.textSecondary}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <View style={styles.inputContainer}>
                  <Phone size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="(555) 123-4567"
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Location</Text>
                <View style={styles.inputContainer}>
                  <MapPin size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={location}
                    onChangeText={setLocation}
                    placeholder="City, Province"
                    placeholderTextColor={Colors.textSecondary}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Date of Birth</Text>
                <View style={styles.inputContainer}>
                  <Calendar size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={dateOfBirth}
                    onChangeText={setDateOfBirth}
                    placeholder="MM/DD/YYYY"
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.infoPreview}>
                <Text style={styles.infoPreviewTitle}>Current Information</Text>
                <View style={styles.infoPreviewCard}>
                  <View style={styles.infoPreviewRow}>
                    <Mail size={16} color={Colors.textSecondary} />
                    <View style={styles.infoPreviewContent}>
                      <Text style={styles.infoPreviewLabel}>Email</Text>
                      <Text style={styles.infoPreviewValue}>{email}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* Reset Password Modal */}
        <ResetPasswordModal
          visible={showResetPasswordModal}
          onClose={() => setShowResetPasswordModal(false)}
        />

        {/* Help & Support Modal */}
        <HelpSupportModal
          visible={showHelpSupportModal}
          onClose={() => setShowHelpSupportModal(false)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  profileHeader: {
    position: 'relative',
    marginBottom: 16,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
    shadowColor: Colors.shadows.colored,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  editPictureButton: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: Colors.shadows.colored,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  profileSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  settingsCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.policeRedBorder,
    shadowColor: Colors.shadows.colored,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingContent: {
    flex: 1,
    marginLeft: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  dangerItem: {
    borderColor: Colors.error + '20',
  },
  dangerText: {
    color: Colors.error,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0,
    backgroundColor: Colors.primary,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    shadowColor: Colors.shadows.colored,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  saveButtonTextDisabled: {
    opacity: 0.6,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.policeRedBorder,
    shadowColor: Colors.shadows.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  infoPreview: {
    marginTop: 20,
  },
  infoPreviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  infoPreviewCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.policeRedBorder,
  },
  infoPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoPreviewContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoPreviewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  infoPreviewValue: {
    fontSize: 14,
    color: Colors.text,
  },
});