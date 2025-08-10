import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Crown, Star, Zap, ArrowRight } from 'lucide-react-native';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { useSubscription } from '@/context/SubscriptionContext';

type SubscriptionWidgetProps = {
  variant?: 'compact' | 'full';
  style?: any;
};

export default function SubscriptionWidget({ 
  variant = 'compact', 
  style 
}: SubscriptionWidgetProps) {
  const { subscription, getDaysUntilExpiry } = useSubscription();
  
  const isPremium = subscription.plan !== 'free';
  const daysLeft = getDaysUntilExpiry();

  if (isPremium && variant === 'compact') {
    // Show premium status for compact variant
    return (
      <TouchableOpacity 
        style={[styles.premiumWidget, style]}
        onPress={() => router.push('/subscription')}
        activeOpacity={0.8}
      >
        <View style={styles.premiumContent}>
          <Crown size={20} color={Colors.accent} />
          <View style={styles.premiumText}>
            <Text style={styles.premiumTitle}>
              {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan
            </Text>
            {daysLeft && (
              <Text style={styles.premiumSubtitle}>
                {daysLeft} days remaining
              </Text>
            )}
          </View>
        </View>
        <ArrowRight size={16} color={Colors.accent} />
      </TouchableOpacity>
    );
  }

  if (variant === 'compact') {
    // Compact upgrade widget for free users
    return (
      <TouchableOpacity 
        style={[styles.compactWidget, style]}
        onPress={() => router.push('/subscription')}
        activeOpacity={0.8}
      >
        <View style={styles.compactContent}>
          <View style={styles.iconContainer}>
            <Crown size={18} color={Colors.primary} />
          </View>
          <View style={styles.compactText}>
            <Text style={styles.compactTitle}>Upgrade to Premium</Text>
            <Text style={styles.compactSubtitle}>Unlock advanced features</Text>
          </View>
        </View>
        <ArrowRight size={16} color={Colors.primary} />
      </TouchableOpacity>
    );
  }

  // Full variant - promotional widget
  return (
    <TouchableOpacity 
      style={[styles.fullWidget, style]}
      onPress={() => router.push('/subscription')}
      activeOpacity={0.9}
    >
      <View style={styles.gradientContainer}>
        <View style={styles.fullContent}>
          <View style={styles.headerRow}>
            <Crown size={24} color={Colors.white} />
            <Text style={styles.fullTitle}>Go Premium</Text>
          </View>
          
          <Text style={styles.fullSubtitle}>
            Unlock personalized training plans, advanced analytics, and priority support
          </Text>
          
          <View style={styles.featuresRow}>
            <View style={styles.feature}>
              <Zap size={16} color={Colors.white} />
              <Text style={styles.featureText}>Personalized Plans</Text>
            </View>
            <View style={styles.feature}>
              <Star size={16} color={Colors.white} />
              <Text style={styles.featureText}>Advanced Analytics</Text>
            </View>
          </View>
          
          <View style={styles.ctaRow}>
            <Text style={styles.ctaText}>Starting at $9.99/month</Text>
            <View style={styles.ctaButton}>
              <Text style={styles.ctaButtonText}>Upgrade Now</Text>
              <ArrowRight size={16} color={Colors.primary} />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Compact variant styles
  compactWidget: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  compactText: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  compactSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },

  // Premium status styles
  premiumWidget: {
    backgroundColor: Colors.accent + '10',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.accent + '30',
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  premiumText: {
    marginLeft: 12,
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.accent,
    marginBottom: 2,
  },
  premiumSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },

  // Full variant styles
  fullWidget: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  gradientContainer: {
    backgroundColor: Colors.primary,
    padding: 20,
  },
  fullContent: {
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fullTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.white,
  },
  fullSubtitle: {
    fontSize: 16,
    color: Colors.white + 'E0',
    lineHeight: 22,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 20,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: '500',
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  ctaText: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: '600',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  ctaButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
});