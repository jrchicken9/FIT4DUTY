import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Clock, MapPin, Users, DollarSign, Calendar } from 'lucide-react-native';
import { useSubscription } from '../context/SubscriptionContext';
import { ONE_TIME_SERVICES, PROMOTIONAL_OFFERS } from '../constants/monetization';

interface OneTimeServicesModalProps {
  visible: boolean;
  onClose: () => void;
  category?: 'practice-test' | 'document-review' | 'mock-interview' | 'workshop';
}

const { width, height } = Dimensions.get('window');

export default function OneTimeServicesModal({ 
  visible, 
  onClose, 
  category 
}: OneTimeServicesModalProps) {
  const { purchaseOneTimeService, subscription } = useSubscription();
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const filteredServices = category 
    ? ONE_TIME_SERVICES.filter(service => service.category === category)
    : ONE_TIME_SERVICES;

  const handlePurchase = async (serviceId: string) => {
    Alert.alert(
      'Confirm Purchase',
      'Are you sure you want to purchase this service? We\'ll contact you with booking details.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Purchase',
          style: 'default',
          onPress: async () => {
            const result = await purchaseOneTimeService(serviceId);
            if (result.success) {
              setSelectedService(null);
            }
          },
        },
      ]
    );
  };

  const getServicePrice = (service: typeof ONE_TIME_SERVICES[0]) => {
    let price = service.price;
    
    // Apply subscriber discount if applicable
    if (subscription.tier === 'premium') {
      price = price * (1 - PROMOTIONAL_OFFERS.subscriberDiscount.discountPercentage / 100);
    }
    
    return price;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'practice-test':
        return '🏃‍♂️';
      case 'document-review':
        return '📄';
      case 'mock-interview':
        return '🎤';
      case 'workshop':
        return '🎓';
      default:
        return '📋';
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'practice-test':
        return 'Practice Tests';
      case 'document-review':
        return 'Document Review';
      case 'mock-interview':
        return 'Mock Interviews';
      case 'workshop':
        return 'Workshops';
      default:
        return 'All Services';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <BlurView intensity={20} style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient
            colors={['#1F2937', '#111827']}
            style={styles.modal}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
                {getCategoryTitle(category || 'all')}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
              {/* Subscriber Discount Notice */}
              {subscription.tier === 'premium' && (
                <View style={styles.discountNotice}>
                  <Text style={styles.discountText}>
                    🎉 Premium subscribers get {PROMOTIONAL_OFFERS.subscriberDiscount.discountPercentage}% off all services!
                  </Text>
                </View>
              )}

              {/* Services List */}
              {filteredServices.map((service) => {
                const finalPrice = getServicePrice(service);
                const hasDiscount = subscription.tier === 'premium' && finalPrice < service.price;
                
                return (
                  <View key={service.id} style={styles.serviceCard}>
                    <View style={styles.serviceHeader}>
                      <Text style={styles.serviceIcon}>
                        {getCategoryIcon(service.category)}
                      </Text>
                      <View style={styles.serviceInfo}>
                        <Text style={styles.serviceTitle}>{service.title}</Text>
                        <Text style={styles.serviceDescription}>
                          {service.description}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.serviceDetails}>
                      {service.duration && (
                        <View style={styles.detailItem}>
                          <Clock size={16} color="#9CA3AF" />
                          <Text style={styles.detailText}>{service.duration} min</Text>
                        </View>
                      )}
                      
                      {service.location && (
                        <View style={styles.detailItem}>
                          <MapPin size={16} color="#9CA3AF" />
                          <Text style={styles.detailText}>{service.location}</Text>
                        </View>
                      )}
                      
                      {service.maxParticipants && (
                        <View style={styles.detailItem}>
                          <Users size={16} color="#9CA3AF" />
                          <Text style={styles.detailText}>Max {service.maxParticipants} people</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.pricingSection}>
                      <View style={styles.priceContainer}>
                        {hasDiscount && (
                          <Text style={styles.originalPrice}>
                            ${service.price.toFixed(2)}
                          </Text>
                        )}
                        <Text style={styles.finalPrice}>
                          ${finalPrice.toFixed(2)}
                        </Text>
                        {hasDiscount && (
                          <Text style={styles.discountBadge}>
                            {PROMOTIONAL_OFFERS.subscriberDiscount.discountPercentage}% OFF
                          </Text>
                        )}
                      </View>
                      
                      <TouchableOpacity
                        style={styles.bookButton}
                        onPress={() => handlePurchase(service.id)}
                      >
                        <Calendar size={16} color="#FFFFFF" />
                        <Text style={styles.bookButtonText}>Book Now</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}

              {/* Call to Action */}
              {subscription.tier === 'free' && (
                <View style={styles.ctaSection}>
                  <Text style={styles.ctaTitle}>
                    Get Premium for Better Deals!
                  </Text>
                  <Text style={styles.ctaDescription}>
                    Premium subscribers get {PROMOTIONAL_OFFERS.subscriberDiscount.discountPercentage}% off all services
                  </Text>
                  <TouchableOpacity style={styles.ctaButton}>
                    <Text style={styles.ctaButtonText}>Upgrade to Premium</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </LinearGradient>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    width: width,
    height: height * 0.8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  modal: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(156, 163, 175, 0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  discountNotice: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  discountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    textAlign: 'center',
  },
  serviceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(156, 163, 175, 0.1)',
  },
  serviceHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  serviceIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  serviceDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  pricingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  originalPrice: {
    fontSize: 14,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  finalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },
  discountBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  ctaSection: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 20,
    borderRadius: 16,
    marginTop: 20,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginBottom: 8,
  },
  ctaDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 16,
  },
  ctaButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  ctaButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
