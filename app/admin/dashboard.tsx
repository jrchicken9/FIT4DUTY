import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Colors from '@/constants/colors';

type DashboardStats = {
  totalUsers: number;
  totalWorkouts: number;
  totalTests: number;
  totalPosts: number;
};

export default function AdminDashboard() {
  const { user, isAdmin, isSuperAdmin, signOut } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalWorkouts: 0,
    totalTests: 0,
    totalPosts: 0,
  });
  const [loading, setLoading] = useState(true);

  // Check admin access
  useEffect(() => {
    if (!user) {
      Alert.alert('Access Denied', 'You must be logged in to access this page.');
      router.replace('/auth/sign-in');
      return;
    }

    if (!isAdmin()) {
      Alert.alert('Access Denied', 'You must be an admin to access this page.');
      router.replace('/');
      return;
    }
  }, [user, isAdmin]);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Load all stats in parallel
      const [usersResult, workoutsResult, testsResult, postsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('workouts').select('id', { count: 'exact' }),
        supabase.from('fitness_tests').select('id', { count: 'exact' }),
        supabase.from('community_posts').select('id', { count: 'exact' }),
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        totalWorkouts: workoutsResult.count || 0,
        totalTests: testsResult.count || 0,
        totalPosts: postsResult.count || 0,
      });
    } catch (error: any) {
      console.error('Error loading stats:', error);
      Alert.alert('Error', 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin()) {
      loadStats();
    }
  }, [isAdmin]);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/');
          },
        },
      ]
    );
  };

  const StatCard = ({ title, value, color, onPress }: {
    title: string;
    value: number;
    color: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.statCard, { borderLeftColor: color }, onPress && styles.clickableCard]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={styles.statValue}>{value.toLocaleString()}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </TouchableOpacity>
  );

  const AdminAction = ({ title, description, icon, onPress, color }: {
    title: string;
    description: string;
    icon: string;
    onPress: () => void;
    color: string;
  }) => (
    <TouchableOpacity style={[styles.actionCard, { borderLeftColor: color }]} onPress={onPress}>
      <View style={styles.actionContent}>
        <Text style={styles.actionIcon}>{icon}</Text>
        <View style={styles.actionText}>
          <Text style={styles.actionTitle}>{title}</Text>
          <Text style={styles.actionDescription}>{description}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (!isAdmin()) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Admin Dashboard' }} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Checking permissions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Admin Dashboard' }} />

      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.full_name || user?.email}</Text>
            <Text style={styles.userRole}>
              {isSuperAdmin() ? 'Super Administrator' : 'Administrator'}
            </Text>
          </View>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Platform Statistics</Text>
          {loading ? (
            <View style={styles.statsLoading}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading stats...</Text>
            </View>
          ) : (
            <View style={styles.statsGrid}>
              <StatCard
                title="Total Users"
                value={stats.totalUsers}
                color="#007AFF"
                onPress={isSuperAdmin() ? () => router.push('/admin/users') : undefined}
              />
              <StatCard
                title="Workouts"
                value={stats.totalWorkouts}
                color="#34C759"
              />
              <StatCard
                title="Fitness Tests"
                value={stats.totalTests}
                color="#FF9500"
              />
              <StatCard
                title="Community Posts"
                value={stats.totalPosts}
                color="#AF52DE"
              />
            </View>
          )}
        </View>

        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Admin Actions</Text>
          
          {isSuperAdmin() && (
            <AdminAction
              title="User Management"
              description="Manage user accounts, roles, and permissions"
              icon="👥"
              color="#007AFF"
              onPress={() => router.push('/admin/users')}
            />
          )}

          <AdminAction
            title="Content Management"
            description="Manage workouts, exercises, and fitness content"
            icon="💪"
            color="#34C759"
            onPress={() => Alert.alert('Coming Soon', 'Content management will be available soon!')}
          />

          <AdminAction
            title="Analytics"
            description="View platform analytics and user insights"
            icon="📊"
            color="#FF9500"
            onPress={() => Alert.alert('Coming Soon', 'Analytics will be available soon!')}
          />

          <AdminAction
            title="Community Management"
            description="Moderate community posts and discussions"
            icon="💬"
            color="#AF52DE"
            onPress={() => Alert.alert('Coming Soon', 'Community management will be available soon!')}
          />

          {isSuperAdmin() && (
            <AdminAction
              title="System Settings"
              description="Configure system-wide settings and preferences"
              icon="⚙️"
              color="#FF3B30"
              onPress={() => Alert.alert('Coming Soon', 'System settings will be available soon!')}
            />
          )}
        </View>

        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.push('/')}
            >
              <Text style={styles.quickActionIcon}>🏠</Text>
              <Text style={styles.quickActionText}>Go to Main App</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.push('/(tabs)/dashboard')}
            >
              <Text style={styles.quickActionIcon}>📱</Text>
              <Text style={styles.quickActionText}>User Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  signOutText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  statsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 15,
  },
  statsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  clickableCard: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  actionsSection: {
    marginBottom: 30,
  },
  actionCard: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  quickActionsSection: {
    marginBottom: 30,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
    textAlign: 'center',
  },
});