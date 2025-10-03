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
import SuperAdminContentEditor from '@/components/SuperAdminContentEditor';
import { router as expoRouter } from 'expo-router';
import PoliceThemeBackground from '@/components/PoliceThemeBackground';

type DashboardStats = {
  totalUsers: number;
  totalWorkoutPlans: number;
  totalFitnessTests: number;
  totalBookings: number;
};

export default function AdminDashboard() {
  const { user, isAdmin, isSuperAdmin, signOut } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalWorkoutPlans: 0,
    totalFitnessTests: 0,
    totalBookings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showContentEditor, setShowContentEditor] = useState(false);

  // Check admin access with better security
  useEffect(() => {
    const checkAccess = async () => {
      // Wait for user to be loaded before checking access
      if (user === null) {
        return; // Still loading
      }

      if (!user) {
        console.log('Redirecting to sign-in: User not logged in');
        router.replace('/auth/sign-in');
        return;
      }

      if (!isAdmin()) {
        console.log('Redirecting to home: User not admin');
        router.replace('/');
        return;
      }

      // Additional security check - verify user still has admin role
      try {
        const { data: currentUser } = await supabase
          .from('profiles')
          .select('role, is_admin')
          .eq('id', user.id)
          .single();

        if (!currentUser?.is_admin && currentUser?.role !== 'admin' && currentUser?.role !== 'super_admin') {
          console.log('Redirecting to home: Admin privileges revoked');
          router.replace('/');
          return;
        }
      } catch (error) {
        console.error('Error verifying admin access:', error);
        router.replace('/');
        return;
      }
    };

    checkAccess();
  }, [user, isAdmin]);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Load all stats in parallel using correct table names
      const [usersResult, workoutPlansResult, fitnessTestsResult, bookingsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('workout_plans').select('id', { count: 'exact' }),
        supabase.from('fitness_tests').select('id', { count: 'exact' }),
        supabase.from('bookings').select('id', { count: 'exact' }),
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        totalWorkoutPlans: workoutPlansResult.count || 0,
        totalFitnessTests: fitnessTestsResult.count || 0,
        totalBookings: bookingsResult.count || 0,
      });
    } catch (error: any) {
      console.error('Error loading stats:', error);
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
    await signOut();
    router.replace('/');
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

  // Add a small delay to ensure user profile is loaded
  const [profileLoaded, setProfileLoaded] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setProfileLoaded(true);
    }, 500); // Reduced delay
    
    return () => clearTimeout(timer);
  }, []);

  // Show loading screen while profile is loading or user is not admin
  if (!profileLoaded || !isAdmin()) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Admin Dashboard' }} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.policeRed} />
          <Text style={styles.loadingText}>
            {!profileLoaded ? 'Loading admin dashboard...' : 'Verifying permissions...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <PoliceThemeBackground>
        <View />
      </PoliceThemeBackground>
      
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
                title="Workout Plans"
                value={stats.totalWorkoutPlans}
                color="#34C759"
              />
              <StatCard
                title="Fitness Tests"
                value={stats.totalFitnessTests}
                color="#FF9500"
              />
              <StatCard
                title="Bookings"
                value={stats.totalBookings}
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

          {isSuperAdmin() && (
            <AdminAction
              title="Content Editor"
              description="Edit all app text content without code changes"
              icon="✏️"
              color="#FF6B6B"
              onPress={() => setShowContentEditor(true)}
            />
          )}

          {isSuperAdmin() && (
            <AdminAction
              title="Resume Logic & Grading"
              description="Manage resume sections, weights, rules, and thresholds"
              icon="🧩"
              color="#5856D6"
              onPress={() => router.push('/admin/resume-logic')}
            />
          )}

          <AdminAction
            title="Practice Sessions"
            description="Manage in-person practice sessions and bookings"
            icon="📅"
            color="#34C759"
            onPress={() => router.push('/admin/practice-sessions')}
          />

          <AdminAction
            title="Booking Approvals"
            description="Review and approve pending session bookings"
            icon="✅"
            color="#10B981"
            onPress={() => router.push('/admin/booking-approvals')}
          />

          <AdminAction
            title="Workout Builder"
            description="Create and manage workout plans, exercises, and fitness programs"
            icon="💪"
            color="#FF9500"
            onPress={() => router.push('/admin/workout-builder')}
          />

          <AdminAction
            title="Application Monetization"
            description="Manage subscription prices, one-time services, and content"
            icon="💰"
            color="#10B981"
            onPress={() => router.push('/admin/application-monetization')}
          />
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

      {/* Super Admin Content Editor */}
      <SuperAdminContentEditor
        visible={showContentEditor}
        onClose={() => setShowContentEditor(false)}
      />
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
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: Colors.policeRedBorder,
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
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: Colors.policeRedBorder,
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
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.policeRedBorder,
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
  debugText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
});