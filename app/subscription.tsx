import { useState } from 'react';
import {
  StyleSheet,
  Alert,
  Dimensions,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Zap,
  BarChart3,
  Star,
  Users,
  Check,
  Calendar,
  Crown,
  Shield,
  Clock,
  ArrowRight,
  X,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PoliceThemeBackground from '@/components/PoliceThemeBackground';
import UpsellModal from '@/components/UpsellModal';


import { useSubscription } from '../context/SubscriptionContext';
import { SUBSCRIPTION_PLANS, PROMOTIONAL_OFFERS } from '../constants/monetization';

const { width } = Dimensions.get('window');

export default function SubscriptionScreen() {
  const { 
    subscription, 
    subscribeToPlan, 
    cancelSubscription, 
    getDaysUntilExpiry,
    hasUsedPromotionalOffer 
  } = useSubscription();
  
  // Ensure subscription tier is always valid
  const currentTier: keyof typeof SUBSCRIPTION_PLANS = subscription?.tier && SUBSCRIPTION_PLANS[subscription.tier as keyof typeof SUBSCRIPTION_PLANS] ? subscription.tier as keyof typeof SUBSCRIPTION_PLANS : 'free';
  
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const canUsePromotionalOffer = !hasUsedPromotionalOffer();

  const handleUpgrade = async (usePromotionalOffer = false) => {
    const result = await subscribeToPlan('premium', usePromotionalOffer);
    if (result.success) {
      setShowUpsellModal(false);
    }
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your Premium subscription? You\'ll lose access to premium features at the end of your billing period.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: cancelSubscription,
        },
      ]
    );
  };

  const features = [
    {
      icon: <Zap size={20} color="#10B981" />,
      title: 'Unlimited Digital Tests',
      description: 'Take as many PREP & PIN tests as you need',
      free: false,
    },
    {
      icon: <BarChart3 size={20} color="#10B981" />,
      title: 'Detailed Analytics',
      description: 'Track your progress with charts and timing breakdowns',
      free: false,
    },
    {
      icon: <Star size={20} color="#10B981" />,
      title: 'Complete Training Plans',
      description: 'Access all weeks of personalized training programs',
      free: false,
    },
    {
      icon: <Users size={20} color="#10B981" />,
      title: 'Premium Community',
      description: 'Post, comment, and get answers from instructors',
      free: false,
    },
    {
      icon: <Check size={20} color="#10B981" />,
      title: 'Interview Prep Vault',
      description: 'Sample questions, mock interviews, and guides',
      free: false,
    },
    {
      icon: <Calendar size={20} color="#10B981" />,
      title: 'Priority Booking',
      description: 'Get first access to in-person practice tests',
      free: false,
    },
  ];

  const freeFeatures = [
    {
      icon: <Zap size={20} color="#6B7280" />,
      title: '2 Digital Tests per Month',
      description: 'Basic PREP & PIN tests with simple scoring',
      free: true,
    },
    {
      icon: <Star size={20} color="#6B7280" />,
      title: 'First 2 Weeks of Training',
      description: 'Basic training plan access',
      free: true,
    },
    {
      icon: <Users size={20} color="#6B7280" />,
      title: 'View-Only Community',
      description: 'Browse community content',
      free: true,
    },
  ];

  return (
    <View style={styles.container}>
      <PoliceThemeBackground>
        <View />
      </PoliceThemeBackground>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <LinearGradient
        colors={['#1F2937', '#111827']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Subscription</Text>
          <Text style={styles.headerSubtitle}>
            {currentTier === 'premium' ? 'Premium Plan' : 'Free Plan'}
          </Text>
        </View>

        {/* Current Plan Status */}
        <View style={styles.currentPlanSection}>
          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              {currentTier === 'premium' ? (
                <Crown size={32} color="#F59E0B" />
              ) : (
                <Shield size={32} color="#6B7280" />
              )}
              <View style={styles.planInfo}>
                <Text style={styles.planName}>
                  {SUBSCRIPTION_PLANS[currentTier]?.name || 'Free'} Plan
                </Text>
                <Text style={styles.planPrice}>
                  {currentTier === 'premium' 
                    ? `$${SUBSCRIPTION_PLANS.premium.price}/month`
                    : 'Free'
                  }
                </Text>
              </View>
            </View>

            {currentTier === 'premium' && (
              <View style={styles.premiumStatus}>
                <Text style={styles.statusText}>
                  {subscription.isActive ? 'Active' : 'Inactive'}
                </Text>
                {subscription.expiresAt && (
                  <View style={styles.expiryInfo}>
                    <Clock size={16} color="#9CA3AF" />
                    <Text style={styles.expiryText}>
                      {getDaysUntilExpiry()} days remaining
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Features Comparison */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Plan Features</Text>
          
          {/* Free Features */}
          <View style={styles.featureGroup}>
            <Text style={styles.featureGroupTitle}>Free Features</Text>
            {freeFeatures.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureIcon}>{feature.icon}</View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
                <Check size={20} color="#6B7280" />
              </View>
            ))}
          </View>

          {/* Premium Features */}
          <View style={styles.featureGroup}>
            <Text style={styles.featureGroupTitle}>Premium Features</Text>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureIcon}>{feature.icon}</View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
                {currentTier === 'premium' ? (
                  <Check size={20} color="#10B981" />
                ) : (
                  <X size={20} color="#EF4444" />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          {currentTier === 'free' ? (
            <>
              {canUsePromotionalOffer && (
                <View style={styles.promotionalOffer}>
                  <Text style={styles.promotionalTitle}>
                    🎉 Limited Time Offer!
                  </Text>
                  <Text style={styles.promotionalText}>
                    First month only ${PROMOTIONAL_OFFERS.firstMonthDiscount.discountedPrice} 
                    (regular ${SUBSCRIPTION_PLANS.premium.price})
                  </Text>
                </View>
              )}
              
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={() => handleUpgrade(canUsePromotionalOffer)}
              >
                <Text style={styles.primaryButtonText}>
                  {canUsePromotionalOffer 
                    ? `Start Free Trial - $${PROMOTIONAL_OFFERS.firstMonthDiscount.discountedPrice}`
                    : `Upgrade to Premium - $${SUBSCRIPTION_PLANS.premium.price}/month`
                  }
                </Text>
                <ArrowRight size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancelSubscription}
            >
              <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Additional Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>What's Included</Text>
          <Text style={styles.infoText}>
            • Cancel anytime • No setup fees • Access to all premium features
          </Text>
          <Text style={styles.infoText}>
            • Priority customer support • Regular updates and new content
          </Text>
        </View>
      </LinearGradient>

      <UpsellModal
        visible={showUpsellModal}
        onClose={() => setShowUpsellModal(false)}
        trigger="general"
        onSubscribe={() => setShowUpsellModal(false)}
      />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  currentPlanSection: {
    marginBottom: 30,
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(156, 163, 175, 0.1)',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  planInfo: {
    marginLeft: 16,
    flex: 1,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
  },
  premiumStatus: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(156, 163, 175, 0.2)',
    paddingTop: 16,
  },
  statusText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
    marginBottom: 8,
  },
  expiryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiryText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 6,
  },
  featuresSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  featureGroup: {
    marginBottom: 24,
  },
  featureGroupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  actionsSection: {
    marginBottom: 30,
  },
  promotionalOffer: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  promotionalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginBottom: 4,
  },
  promotionalText: {
    fontSize: 14,
    color: '#F59E0B',
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  primaryButton: {
    backgroundColor: '#10B981',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  cancelButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  infoSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 18,
    marginBottom: 4,
  },
});