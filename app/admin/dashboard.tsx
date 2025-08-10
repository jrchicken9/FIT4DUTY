import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { useAuth, type User, type UserRole, type AdminPermission } from '@/context/AuthContext';
import { Users, Settings, BarChart3, MessageSquare, Shield, Crown } from 'lucide-react-native';

type AdminStats = {
  totalUsers: number;
  newUsersThisWeek: number;
  totalPosts: number;
  totalTestResults: number;
};

export default function AdminDashboard() {
  const { user, isAdmin, isSuperAdmin, hasPermission, getAllUsers } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    newUsersThisWeek: 0,
    totalPosts: 0,
    totalTestResults: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isAdmin()) {
      Alert.alert('Access Denied', 'You do not have admin privileges.');
      router.back();
      return;
    }
    
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const result = await getAllUsers();
      if (result.success && result.data) {
        setUsers(result.data);
        
        // Calculate stats
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const newUsersThisWeek = result.data.filter(
          (u: User) => new Date(u.created_at) > weekAgo
        ).length;
        
        setStats({
          totalUsers: result.data.length,
          newUsersThisWeek,
          totalPosts: 0, // TODO: Implement when community is ready
          totalTestResults: 0, // TODO: Implement when test results are ready
        });
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
      Alert.alert('Error', 'Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return '#FF6B6B';
      case 'admin':
        return '#4ECDC4';
      default:
        return '#95A5A6';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return Crown;
      case 'admin':
        return Shield;
      default:
        return Users;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Admin Dashboard' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading admin dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Admin Dashboard',
          headerStyle: { backgroundColor: '#1a1a1a' },
          headerTintColor: '#fff',
        }} 
      />
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Admin Info */}
        <View style={styles.adminInfo}>
          <View style={styles.adminBadge}>
            {isSuperAdmin() ? (
              <Crown size={20} color="#FFD700" />
            ) : (
              <Shield size={20} color="#4ECDC4" />
            )}
            <Text style={styles.adminRole}>
              {isSuperAdmin() ? 'Super Admin' : 'Admin'}
            </Text>
          </View>
          <Text style={styles.welcomeText}>Welcome, {user?.full_name}</Text>
          
          <TouchableOpacity 
            style={styles.backToAppButton}
            onPress={() => router.push('/(tabs)/dashboard')}
          >
            <Text style={styles.backToAppText}>Back to Main App</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Users size={24} color="#007AFF" />
            <Text style={styles.statNumber}>{stats.totalUsers}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          
          <View style={styles.statCard}>
            <BarChart3 size={24} color="#34C759" />
            <Text style={styles.statNumber}>{stats.newUsersThisWeek}</Text>
            <Text style={styles.statLabel}>New This Week</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/admin/users')}
          >
            <Users size={24} color="#007AFF" />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Manage Users</Text>
              <Text style={styles.actionDescription}>
                View, edit, and manage user accounts
              </Text>
            </View>
          </TouchableOpacity>

          {hasPermission('manage_community') && (
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/admin/community')}
            >
              <MessageSquare size={24} color="#FF9500" />
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Community Management</Text>
                <Text style={styles.actionDescription}>
                  Moderate posts and manage community content
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {hasPermission('view_analytics') && (
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/admin/analytics')}
            >
              <BarChart3 size={24} color="#34C759" />
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Analytics</Text>
                <Text style={styles.actionDescription}>
                  View app usage and performance metrics
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {isSuperAdmin() && (
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/admin/settings')}
            >
              <Settings size={24} color="#FF3B30" />
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>System Settings</Text>
                <Text style={styles.actionDescription}>
                  Configure app settings and permissions
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Recent Users */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Users</Text>
          {users.slice(0, 5).map((u) => {
            const RoleIcon = getRoleIcon(u.role);
            return (
              <View key={u.id} style={styles.userCard}>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{u.full_name || u.email}</Text>
                  <Text style={styles.userEmail}>{u.email}</Text>
                  <Text style={styles.userDate}>
                    Joined {new Date(u.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <View style={[styles.roleIndicator, { backgroundColor: getRoleColor(u.role) }]}>
                  <RoleIcon size={16} color="white" />
                </View>
              </View>
            );
          })}
          
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => router.push('/admin/users')}
          >
            <Text style={styles.viewAllText}>View All Users</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  adminInfo: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    alignItems: 'center',
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  adminRole: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  actionCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionContent: {
    flex: 1,
    marginLeft: 16,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  actionDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  userCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  userDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  roleIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewAllButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  viewAllText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backToAppButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  backToAppText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});