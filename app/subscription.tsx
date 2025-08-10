import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Check, Crown, Star, Zap, Shield, Download } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useSubscription, SubscriptionPlan } from '@/context/SubscriptionContext';
import Logo from '@/components/Logo';

type PlanFeature = {
  text: string;
  included: boolean;
};

type PlanDetails = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: PlanFeature[];
  popular?: boolean;
  icon: React.ReactNode;
  color: string;
};

const plans: Record<SubscriptionPlan, PlanDetails> = {
  free: {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started',
    icon: <Star size={24} color={Colors.gray[600]} />,
    color: Colors.gray[600],
    features: [
      { text: 'Basic workout plans', included: true },
      { text: 'Progress tracking', included: true },
      { text: 'Community access', included: true },
      { text: 'Limited analytics', included: true },
      { text: 'Email support', included: true },
      { text: 'Personalized plans', included: false },
      { text: 'Advanced analytics', included: false },
      { text: 'Priority support', included: false },
      { text: 'Offline mode', included: false },
    ],
  },
  monthly: {
    name: 'Pro Monthly',
    price: '$9.99',
    period: 'per month',
    description: 'Full access with monthly flexibility',
    icon: <Zap size={24} color={Colors.primary} />,
    color: Colors.primary,
    features: [
      { text: 'Everything in Free', included: true },
      { text: 'Unlimited workout plans', included: true },
      { text: 'Personalized training', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Priority support', included: true },
      { text: 'Offline mode', included: true },
      { text: 'Custom meal plans', included: true },
      { text: 'Video coaching', included: true },
      { text: 'Progress photos', included: true },
    ],
  },
  yearly: {
    name: 'Pro Yearly',
    price: '$79.99',
    period: 'per year',
    description: 'Best value - Save 33%!',
    popular: true,
    icon: <Crown size={24} color={Colors.accent} />,
    color: Colors.accent,
    features: [
      { text: 'Everything in Pro Monthly', included: true },
      { text: 'Save $40 per year', included: true },
      { text: 'Exclusive yearly content', included: true },
      { text: 'Early access to features', included: true },
      { text: 'Personal trainer consultation', included: true },
      { text: 'Nutrition guidance', included: true },
      { text: 'Achievement badges', included: true },
      { text: 'Export workout data', included: true },
      { text: 'Family sharing (up to 4)', included: true },
    ],
  },
};

export default function SubscriptionScreen() {
  const { subscription, subscribeToPlan, cancelSubscription, isLoading } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(subscription.plan);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (plan === subscription.plan) {
      Alert.alert('Already Subscribed', `You're already on the ${plan} plan.`);
      return;
    }

    setIsProcessing(true);
    try {
      const result = await subscribeToPlan(plan);
      if (result.success) {
        router.back();
      }
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You\'ll lose access to premium features.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: async () => {
            setIsProcessing(true);
            try {
              await cancelSubscription();
              router.back();
            } catch (error) {
              console.error('Cancellation error:', error);
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  const renderPlanCard = (planKey: SubscriptionPlan, plan: PlanDetails) => {
    const isCurrentPlan = subscription.plan === planKey;
    const isSelected = selectedPlan === planKey;

    return (
      <TouchableOpacity
        key={planKey}
        style={[
          styles.planCard,
          isSelected && styles.selectedPlan,
          plan.popular && styles.popularPlan,
        ]}
        onPress={() => setSelectedPlan(planKey)}
        activeOpacity={0.8}
      >
        {plan.popular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>MOST POPULAR</Text>
          </View>
        )}

        <View style={styles.planHeader}>
          <View style={styles.planIcon}>
            {plan.icon}
          </View>
          <View style={styles.planInfo}>
            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planDescription}>{plan.description}</Text>
          </View>
          {isCurrentPlan && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentText}>CURRENT</Text>
            </View>
          )}
        </View>

        <View style={styles.priceContainer}>
          <Text style={[styles.price, { color: plan.color }]}>{plan.price}</Text>
          <Text style={styles.period}>{plan.period}</Text>
        </View>

        <View style={styles.featuresContainer}>
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <View style={[
                styles.featureIcon,
                { backgroundColor: feature.included ? Colors.success + '20' : Colors.gray[200] }
              ]}>
                <Check 
                  size={16} 
                  color={feature.included ? Colors.success : Colors.gray[400]} 
                />
              </View>
              <Text style={[
                styles.featureText,
                !feature.included && styles.disabledFeature
              ]}>
                {feature.text}
              </Text>
            </View>
          ))}
        </View>

        {!isCurrentPlan && (
          <TouchableOpacity
            style={[
              styles.selectButton,
              isSelected && { backgroundColor: plan.color },
              planKey === 'free' && styles.freeButton,
            ]}
            onPress={() => handleSubscribe(planKey)}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Text style={[
                styles.selectButtonText,
                isSelected && styles.selectedButtonText,
                planKey === 'free' && styles.freeButtonText,
              ]}>
                {planKey === 'free' ? 'Downgrade to Free' : `Subscribe to ${plan.name}`}
              </Text>
            )}
          </TouchableOpacity>
        )}

        {isCurrentPlan && planKey !== 'free' && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelSubscription}
            disabled={isProcessing}
          >
            <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading subscription details...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Subscription Plans',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
          headerTitleStyle: { fontWeight: 'bold' },
          headerTitle: () => <Logo size="small" variant="light" showText={false} />,
        }} 
      />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Logo size="medium" variant="dark" />
          <Text style={styles.title}>Choose Your Plan</Text>
          <Text style={styles.subtitle}>
            Unlock your full potential with our premium features
          </Text>
        </View>

        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>Why Go Premium?</Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Shield size={20} color={Colors.primary} />
              <Text style={styles.benefitText}>Personalized training plans</Text>
            </View>
            <View style={styles.benefitItem}>
              <Zap size={20} color={Colors.primary} />
              <Text style={styles.benefitText}>Advanced progress analytics</Text>
            </View>
            <View style={styles.benefitItem}>
              <Download size={20} color={Colors.primary} />
              <Text style={styles.benefitText}>Offline workout access</Text>
            </View>
            <View style={styles.benefitItem}>
              <Crown size={20} color={Colors.primary} />
              <Text style={styles.benefitText}>Priority customer support</Text>
            </View>
          </View>
        </View>

        <View style={styles.plansContainer}>
          {Object.entries(plans).map(([planKey, plan]) => 
            renderPlanCard(planKey as SubscriptionPlan, plan)
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            All subscriptions auto-renew. Cancel anytime in your account settings.
          </Text>
          <Text style={styles.footerText}>
            Prices may vary by region. Free plan includes all features for now.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.gray[600],
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray[600],
    textAlign: 'center',
    lineHeight: 22,
  },
  benefitsContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 20,
    backgroundColor: Colors.white,
    borderRadius: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  plansContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  planCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.gray[200],
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  selectedPlan: {
    borderColor: Colors.primary,
  },
  popularPlan: {
    borderColor: Colors.accent,
    transform: [{ scale: 1.02 }],
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: 20,
    right: 20,
    backgroundColor: Colors.accent,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  popularText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    color: Colors.gray[600],
  },
  currentBadge: {
    backgroundColor: Colors.success,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  currentText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    marginRight: 8,
  },
  period: {
    fontSize: 16,
    color: Colors.gray[600],
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  disabledFeature: {
    color: Colors.gray[400],
    textDecorationLine: 'line-through',
  },
  selectButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  freeButton: {
    backgroundColor: Colors.gray[200],
  },
  selectButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedButtonText: {
    color: Colors.white,
  },
  freeButtonText: {
    color: Colors.gray[600],
  },
  cancelButton: {
    backgroundColor: Colors.error,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 12,
    color: Colors.gray[500],
    textAlign: 'center',
    lineHeight: 16,
  },
});