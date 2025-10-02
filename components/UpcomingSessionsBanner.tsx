import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { X, Calendar, Clock, MapPin, Users, Info, Bell, BellOff } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/constants/colors';

/**
 * UpcomingSessionsBanner Component
 * 
 * Usage:
 * <UpcomingSessionsBanner
 *   sessions={sessions}
 *   visible={true}
 *   onClose={handleClose}
 *   onViewSession={handleViewSession}
 *   position="top"    // or "bottom" - positions banner at top or bottom of screen
 * />
 */
export type UpcomingSession = {
  id: string;
  session_title: string;
  session_date: string;
  start_time: string;
  end_time: string;
  status: string;
  test_type: string;
  location_name: string;
};

interface UpcomingSessionsBannerProps {
  sessions: UpcomingSession[];
  visible: boolean;
  onClose: () => void;
  onViewSession: (sessionId: string) => void;
  position?: 'top' | 'bottom'; // New prop for positioning
}

export default function UpcomingSessionsBanner({
  sessions,
  visible,
  onClose,
  onViewSession,
  position = 'bottom', // Default to bottom for backward compatibility
}: UpcomingSessionsBannerProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedSession, setSelectedSession] = useState<UpcomingSession | null>(null);

  const handleViewDetails = (session: UpcomingSession) => {
    setSelectedSession(session);
    setShowDetails(true);
  };

  const handleCloseBanner = () => {
    onClose();
  };

  const handleDisableBanner = async () => {
    Alert.alert(
      'Hide Session Banner',
      'This will hide session banners for 24 hours. You can still view session details in the Sessions tab.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Hide',
          style: 'default',
          onPress: async () => {
            try {
              const hideUntil = new Date();
              hideUntil.setHours(hideUntil.getHours() + 24);
              await AsyncStorage.setItem('sessionBannerHiddenUntil', hideUntil.toISOString());
              onClose();
            } catch (error) {
              console.error('Error saving banner preference:', error);
            }
          },
        },
      ]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Calendar size={16} color={Colors.success} />;
      case 'approved':
        return <Calendar size={16} color={Colors.warning} />;
      case 'pending':
        return <Clock size={16} color={Colors.primary} />;
      default:
        return <Calendar size={16} color={Colors.textSecondary} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'approved':
        return 'Approved';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return Colors.success;
      case 'approved':
        return Colors.warning;
      case 'pending':
        return Colors.primary;
      default:
        return Colors.textSecondary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // Remove seconds if present
  };

  if (!visible || sessions.length === 0) {
    return null;
  }

  return (
    <>
      {/* Banner - Positioned dynamically based on position prop */}
      <View style={[
        styles.bannerContainer,
        position === 'top' ? { top: 50 } : { bottom: 0 } // Position at very bottom for bottom position
      ]}>
        <View style={styles.banner}>
          <View style={styles.bannerContent}>
            <View style={styles.bannerHeader}>
              <View style={styles.bannerIcon}>
                <Calendar size={20} color={Colors.white} />
              </View>
              <View style={styles.bannerText}>
                <Text style={styles.bannerTitle}>
                  {sessions.length === 1 ? 'Upcoming Session' : 'Upcoming Sessions'}
                </Text>
                <Text style={styles.bannerSubtitle}>
                  {sessions.length === 1 
                    ? `You have a session on ${formatDate(sessions[0].session_date)}`
                    : `You have ${sessions.length} sessions this week`
                  }
                </Text>
              </View>
            </View>
            
            <View style={styles.bannerActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleViewDetails(sessions[0])}
              >
                <Info size={16} color={Colors.white} />
                <Text style={styles.actionButtonText}>Details</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCloseBanner}
              >
                <X size={16} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.disableButton}
            onPress={handleDisableBanner}
          >
            <BellOff size={14} color={Colors.white} />
            <Text style={styles.disableButtonText}>Hide</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Details Modal */}
      <Modal
        visible={showDetails}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDetails(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Session Details</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowDetails(false)}
              >
                <X size={20} color={Colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {selectedSession && (
                <View style={styles.sessionDetails}>
                  <View style={styles.detailRow}>
                    <Calendar size={20} color={Colors.primary} />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Date</Text>
                      <Text style={styles.detailValue}>
                        {formatDate(selectedSession.session_date)}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Clock size={20} color={Colors.primary} />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Time</Text>
                      <Text style={styles.detailValue}>
                        {formatTime(selectedSession.start_time)} - {formatTime(selectedSession.end_time)}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <MapPin size={20} color={Colors.primary} />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Location</Text>
                      <Text style={styles.detailValue}>{selectedSession.location_name}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Users size={20} color={Colors.primary} />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Test Type</Text>
                      <Text style={styles.detailValue}>{selectedSession.test_type}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailRow}>
                    {getStatusIcon(selectedSession.status)}
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Status</Text>
                      <Text style={[styles.detailValue, { color: getStatusColor(selectedSession.status) }]}>
                        {getStatusText(selectedSession.status)}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setShowDetails(false);
                  if (selectedSession) {
                    onViewSession(selectedSession.id);
                  }
                }}
              >
                <Text style={styles.modalButtonText}>View Full Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1000, // Ensure it's above other content
  },
  banner: {
    backgroundColor: Colors.primary,
    marginHorizontal: 20,
    marginBottom: 16,
    marginTop: 8, // Add top margin for better spacing
    borderRadius: 16,
    shadowColor: Colors.shadows.colored,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: Colors.white + 'CC',
  },
  bannerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white + '20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.white + '30',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disableButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.white + '20',
    gap: 6,
  },
  disableButtonText: {
    fontSize: 12,
    color: Colors.white + 'CC',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.black + '50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: 20,
  },
  sessionDetails: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  modalButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
