import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock, Check, X, Star, Zap, Users, BarChart3 } from 'lucide-react-native';
import { useSubscription } from '../context/SubscriptionContext';
import { SUBSCRIPTION_PLANS, PROMOTIONAL_OFFERS } from '../constants/monetization';

interface UpsellModalProps {
  visible: boolean;
  onClose: () => void;
  trigger: 'digital-test' | 'training-plan' | 'interview-prep' | 'community' | 'general';
  onSubscribe?: () => void;
}

const { width, height } = Dimensions.get('window');

export default function UpsellModal({ 
  visible, 
  onClose, 
  trigger, 
  onSubscribe 
}: UpsellModalProps) {
  const { subscribeToPlan, hasUsedPromotionalOffer } = useSubscription();
  const canUsePromotionalOffer = !hasUsedPromotionalOffer();

  const getTriggerMessage = () => {
    switch (trigger) {
      case 'digital-test':
        return 'Unlock Unlimited Digital Tests';
      case 'training-plan':
        return 'Access Your Full Training Plan';
      case 'interview-prep':
        return 'Get Interview Prep Vault Access';
      case 'community':
        return 'Join the Premium Community';
      default:
        return 'Upgrade to Premium';
    }
  };

  const getTriggerDescription = () => {
    switch (trigger) {
      case 'digital-test':
        return 'Take unlimited PREP & PIN tests with detailed analytics and performance tracking.';
      case 'training-plan':
        return 'Unlock your complete personalized training plan with expert guidance.';
      case 'interview-prep':
        return 'Access sample questions, mock interviews, and best practice guides.';
      case 'community':
        return 'Connect with instructors and other candidates in our premium community.';
      default:
        return 'Get access to all premium features and accelerate your police career preparation.';
    }
  };

  const handleSubscribe = async (usePromotionalOffer = false) => {
    const result = await subscribeToPlan('premium', usePromotionalOffer);
    if (result.success) {
      onSubscribe?.();
      onClose();
    }
  };

  const features = [
    {
      icon: <Zap size={20} color="#10B981" />,
      title: 'Unlimited Digital Tests',
      description: 'Take as many PREP & PIN tests as you need',
    },
    {
      icon: <BarChart3 size={20} color="#10B981" />,
      title: 'Detailed Analytics',
      description: 'Track your progress with charts and timing breakdowns',
    },
    {
      icon: <Star size={20} color="#10B981" />,
      title: 'Complete Training Plans',
      description: 'Access all weeks of personalized training programs',
    },
    {
      icon: <Users size={20} color="#10B981" />,
      title: 'Premium Community',
      description: 'Post, comment, and get answers from instructors',
    },
    {
      icon: <Check size={20} color="#10B981" />,
      title: 'Interview Prep Vault',
      description: 'Sample questions, mock interviews, and guides',
    },
    {
      icon: <Lock size={20} color="#10B981" />,
      title: 'Priority Booking',
      description: 'Get first access to in-person practice tests',
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
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
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
              {/* Title */}
              <View style={styles.titleSection}>
                <View style={styles.lockIcon}>
                  <Lock size={32} color="#F59E0B" />
                </View>
                <Text style={styles.title}>{getTriggerMessage()}</Text>
                <Text style={styles.subtitle}>{getTriggerDescription()}</Text>
              </View>

              {/* Features */}
              <View style={styles.featuresSection}>
                <Text style={styles.featuresTitle}>Premium Features Include:</Text>
                {features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <View style={styles.featureIcon}>{feature.icon}</View>
                    <View style={styles.featureText}>
                      <Text style={styles.featureTitle}>{feature.title}</Text>
                      <Text style={styles.featureDescription}>{feature.description}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Pricing */}
              <View style={styles.pricingSection}>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>
                    ${SUBSCRIPTION_PLANS.premium.price}
                  </Text>
                  <Text style={styles.pricePeriod}>/month</Text>
                </View>
                
                {canUsePromotionalOffer && (
                  <View style={styles.promotionalOffer}>
                    <Text style={styles.promotionalText}>
                      First month only ${PROMOTIONAL_OFFERS.firstMonthDiscount.discountedPrice}!
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.actions}>
              {canUsePromotionalOffer ? (
                <>
                  <TouchableOpacity
                    style={[styles.button, styles.primaryButton]}
                    onPress={() => handleSubscribe(true)}
                  >
                    <Text style={styles.primaryButtonText}>
                      Start Free Trial - ${PROMOTIONAL_OFFERS.firstMonthDiscount.discountedPrice}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.secondaryButton]}
                    onPress={() => handleSubscribe(false)}
                  >
                    <Text style={styles.secondaryButtonText}>
                      Subscribe - ${SUBSCRIPTION_PLANS.premium.price}/month
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton]}
                  onPress={() => handleSubscribe(false)}
                >
                  <Text style={styles.primaryButtonText}>
                    Subscribe - ${SUBSCRIPTION_PLANS.premium.price}/month
                  </Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity onPress={onClose} style={styles.skipButton}>
                <Text style={styles.skipButtonText}>Maybe Later</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modal: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  lockIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresSection: {
    marginBottom: 30,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  pricingSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10B981',
  },
  pricePeriod: {
    fontSize: 16,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  promotionalOffer: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  promotionalText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
  },
  actions: {
    padding: 20,
    paddingTop: 0,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#10B981',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
    textAlign: 'center',
  },
  skipButton: {
    paddingVertical: 12,
  },
  skipButtonText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
