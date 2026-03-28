import AsyncStorage from '@react-native-async-storage/async-storage';

export type UpsellTrigger = {
  id: string;
  type: 'digital-test' | 'training-plan' | 'interview-prep' | 'community' | 'general';
  timestamp: Date;
  userAction: string;
  conversion: boolean;
};

export type MonetizationMetrics = {
  freeToPaidConversion: number;
  upsellTriggerCounts: Record<string, number>;
  conversionRates: Record<string, number>;
  revenueMetrics: {
    totalRevenue: number;
    monthlyRecurringRevenue: number;
    averageRevenuePerUser: number;
  };
  userBehavior: {
    digitalTestsTaken: number;
    trainingPlansViewed: number;
    lockedContentAttempts: number;
  };
};

const ANALYTICS_STORAGE_KEY = 'monetization_analytics';
const UPSELL_TRIGGERS_KEY = 'upsell_triggers';

class MonetizationAnalytics {
  private metrics: MonetizationMetrics;
  private upsellTriggers: UpsellTrigger[];

  constructor() {
    this.metrics = {
      freeToPaidConversion: 0,
      upsellTriggerCounts: {},
      conversionRates: {},
      revenueMetrics: {
        totalRevenue: 0,
        monthlyRecurringRevenue: 0,
        averageRevenuePerUser: 0,
      },
      userBehavior: {
        digitalTestsTaken: 0,
        trainingPlansViewed: 0,
        lockedContentAttempts: 0,
      },
    };
    this.upsellTriggers = [];
  }

  async initialize() {
    await this.loadData();
  }

  private async loadData() {
    try {
      const storedMetrics = await AsyncStorage.getItem(ANALYTICS_STORAGE_KEY);
      const storedTriggers = await AsyncStorage.getItem(UPSELL_TRIGGERS_KEY);

      if (storedMetrics) {
        this.metrics = JSON.parse(storedMetrics);
      }
      if (storedTriggers) {
        this.upsellTriggers = JSON.parse(storedTriggers).map((trigger: any) => ({
          ...trigger,
          timestamp: new Date(trigger.timestamp),
        }));
      }
    } catch (error) {
      console.error('Error loading monetization analytics:', error);
    }
  }

  private async saveData() {
    try {
      await AsyncStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(this.metrics));
      await AsyncStorage.setItem(UPSELL_TRIGGERS_KEY, JSON.stringify(this.upsellTriggers));
    } catch (error) {
      console.error('Error saving monetization analytics:', error);
    }
  }

  // Track upsell triggers
  async trackUpsellTrigger(type: UpsellTrigger['type'], userAction: string) {
    const trigger: UpsellTrigger = {
      id: `trigger_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: new Date(),
      userAction,
      conversion: false,
    };

    this.upsellTriggers.push(trigger);
    
    // Update trigger counts
    const triggerKey = `${type}_${userAction}`;
    this.metrics.upsellTriggerCounts[triggerKey] = 
      (this.metrics.upsellTriggerCounts[triggerKey] || 0) + 1;

    // Update user behavior
    switch (type) {
      case 'digital-test':
        this.metrics.userBehavior.digitalTestsTaken++;
        break;
      case 'training-plan':
        this.metrics.userBehavior.trainingPlansViewed++;
        break;
      default:
        this.metrics.userBehavior.lockedContentAttempts++;
        break;
    }

    await this.saveData();
    return trigger.id;
  }

  // Track conversions
  async trackConversion(triggerId: string, revenue: number = 0) {
    const trigger = this.upsellTriggers.find(t => t.id === triggerId);
    if (trigger) {
      trigger.conversion = true;
      this.metrics.freeToPaidConversion++;
      
      // Update revenue metrics
      this.metrics.revenueMetrics.totalRevenue += revenue;
      this.metrics.revenueMetrics.monthlyRecurringRevenue += revenue;
      
      // Update conversion rates
      const triggerKey = `${trigger.type}_${trigger.userAction}`;
      const totalTriggers = this.metrics.upsellTriggerCounts[triggerKey] || 0;
      const conversions = this.upsellTriggers.filter(t => 
        t.type === trigger.type && 
        t.userAction === trigger.userAction && 
        t.conversion
      ).length;
      
      this.metrics.conversionRates[triggerKey] = totalTriggers > 0 ? (conversions / totalTriggers) * 100 : 0;
    }

    await this.saveData();
  }

  // Track subscription events
  async trackSubscriptionEvent(event: 'subscribe' | 'cancel' | 'renew', amount: number = 0) {
    switch (event) {
      case 'subscribe':
        this.metrics.revenueMetrics.totalRevenue += amount;
        this.metrics.revenueMetrics.monthlyRecurringRevenue += amount;
        break;
      case 'cancel':
        this.metrics.revenueMetrics.monthlyRecurringRevenue -= amount;
        break;
      case 'renew':
        this.metrics.revenueMetrics.totalRevenue += amount;
        break;
    }

    await this.saveData();
  }

  // Get analytics data
  getMetrics(): MonetizationMetrics {
    return { ...this.metrics };
  }

  // Get upsell triggers
  getUpsellTriggers(): UpsellTrigger[] {
    return [...this.upsellTriggers];
  }

  // Get conversion rate for specific trigger
  getConversionRate(type: string, action: string): number {
    const triggerKey = `${type}_${action}`;
    return this.metrics.conversionRates[triggerKey] || 0;
  }

  // Get most effective upsell triggers
  getMostEffectiveTriggers(limit: number = 5): Array<{ type: string; action: string; rate: number }> {
    const effectiveTriggers = Object.entries(this.metrics.conversionRates)
      .map(([key, rate]) => {
        const [type, action] = key.split('_');
        return { type, action, rate };
      })
      .sort((a, b) => b.rate - a.rate)
      .slice(0, limit);

    return effectiveTriggers;
  }

  // Get user behavior insights
  getUserBehaviorInsights() {
    return {
      totalDigitalTests: this.metrics.userBehavior.digitalTestsTaken,
      totalTrainingPlansViewed: this.metrics.userBehavior.trainingPlansViewed,
      totalLockedContentAttempts: this.metrics.userBehavior.lockedContentAttempts,
      conversionRate: this.metrics.freeToPaidConversion / 
        (this.metrics.userBehavior.digitalTestsTaken + 
         this.metrics.userBehavior.trainingPlansViewed + 
         this.metrics.userBehavior.lockedContentAttempts) * 100,
    };
  }

  // Reset analytics (for testing)
  async resetAnalytics() {
    this.metrics = {
      freeToPaidConversion: 0,
      upsellTriggerCounts: {},
      conversionRates: {},
      revenueMetrics: {
        totalRevenue: 0,
        monthlyRecurringRevenue: 0,
        averageRevenuePerUser: 0,
      },
      userBehavior: {
        digitalTestsTaken: 0,
        trainingPlansViewed: 0,
        lockedContentAttempts: 0,
      },
    };
    this.upsellTriggers = [];
    await this.saveData();
  }
}

// Export singleton instance
export const monetizationAnalytics = new MonetizationAnalytics();

// Helper functions for common tracking scenarios
export const trackDigitalTestAttempt = (action: string) => {
  return monetizationAnalytics.trackUpsellTrigger('digital-test', action);
};

export const trackTrainingPlanView = (action: string) => {
  return monetizationAnalytics.trackUpsellTrigger('training-plan', action);
};

export const trackInterviewPrepAccess = (action: string) => {
  return monetizationAnalytics.trackUpsellTrigger('interview-prep', action);
};

export const trackCommunityAccess = (action: string) => {
  return monetizationAnalytics.trackUpsellTrigger('community', action);
};

export const trackLockedContentAttempt = (action: string) => {
  return monetizationAnalytics.trackUpsellTrigger('general', action);
};
