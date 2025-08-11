import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Colors from '@/constants/colors';

type User = {
  id: string;
  email: string;
  full_name: string | null;
  role: 'user' | 'admin' | 'super_admin';
  is_admin: boolean;
  created_at: string;
  updated_at: string;
};

export default function AdminUsers() {
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);

  // Check admin access
  useEffect(() => {
    if (!user) {
      Alert.alert('Access Denied', 'You must be logged in to access this page.');
      router.replace('/auth/sign-in');
      return;
    }

    if (!isSuperAdmin()) {
      Alert.alert('Access Denied', 'You must be a super admin to access this page.');
      router.replace('/');
      return;
    }
  }, [user, isSuperAdmin]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, is_admin, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading users:', error);
        Alert.alert('Error', 'Failed to load users');
        return;
      }

      setUsers(data || []);
    } catch (error: any) {
      console.error('Exception loading users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  useEffect(() => {
    if (isSuperAdmin()) {
      loadUsers();
    }
  }, [isSuperAdmin]);

  const updateUserRole = async (userId: string, newRole: 'user' | 'admin' | 'super_admin') => {
    try {
      setUpdatingUser(userId);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          role: newRole,
          is_admin: newRole !== 'user',
          admin_permissions: newRole === 'super_admin' 
            ? ['manage_users', 'manage_content', 'view_analytics', 'manage_community', 'manage_subscriptions', 'system_admin']
            : newRole === 'admin'
            ? ['manage_content', 'view_analytics', 'manage_community']
            : [],
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user:', error);
        Alert.alert('Error', 'Failed to update user role');
        return;
      }

      Alert.alert('Success', `User role updated to ${newRole}`);
      loadUsers(); // Refresh the list
    } catch (error: any) {
      console.error('Exception updating user:', error);
      Alert.alert('Error', 'Failed to update user role');
    } finally {
      setUpdatingUser(null);
    }
  };

  const deleteUser = async (userId: string, userEmail: string) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${userEmail}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setUpdatingUser(userId);
              
              const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', userId);

              if (error) {
                console.error('Error deleting user:', error);
                Alert.alert('Error', 'Failed to delete user');
                return;
              }

              Alert.alert('Success', 'User deleted successfully');
              loadUsers(); // Refresh the list
            } catch (error: any) {
              console.error('Exception deleting user:', error);
              Alert.alert('Error', 'Failed to delete user');
            } finally {
              setUpdatingUser(null);
            }
          },
        },
      ]
    );
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return '#dc3545';
      case 'admin':
        return '#fd7e14';
      default:
        return Colors.textSecondary;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!isSuperAdmin()) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'User Management' }} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Checking permissions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'User Management' }} />

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>User Management</Text>
          <Text style={styles.subtitle}>
            Manage user roles and permissions
          </Text>
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading users...</Text>
          </View>
        ) : (
          <View style={styles.userList}>
            {users.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No users found</Text>
              </View>
            ) : (
              users.map((user) => (
                <View key={user.id} style={styles.userCard}>
                  <View style={styles.userInfo}>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    <Text style={styles.userName}>
                      {user.full_name || 'No name provided'}
                    </Text>
                    <Text style={styles.userDate}>
                      Joined: {formatDate(user.created_at)}
                    </Text>
                  </View>

                  <View style={styles.userActions}>
                    <View style={styles.roleSection}>
                      <Text style={styles.roleLabel}>Current Role:</Text>
                      <Text style={[styles.roleText, { color: getRoleColor(user.role) }]}>
                        {user.role.replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={[
                          styles.roleButton,
                          user.role === 'user' && styles.activeRoleButton
                        ]}
                        onPress={() => updateUserRole(user.id, 'user')}
                        disabled={updatingUser === user.id}
                      >
                        <Text style={[
                          styles.roleButtonText,
                          user.role === 'user' && styles.activeRoleButtonText
                        ]}>
                          User
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.roleButton,
                          user.role === 'admin' && styles.activeRoleButton
                        ]}
                        onPress={() => updateUserRole(user.id, 'admin')}
                        disabled={updatingUser === user.id}
                      >
                        <Text style={[
                          styles.roleButtonText,
                          user.role === 'admin' && styles.activeRoleButtonText
                        ]}>
                          Admin
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.roleButton,
                          user.role === 'super_admin' && styles.activeRoleButton
                        ]}
                        onPress={() => updateUserRole(user.id, 'super_admin')}
                        disabled={updatingUser === user.id}
                      >
                        <Text style={[
                          styles.roleButtonText,
                          user.role === 'super_admin' && styles.activeRoleButtonText
                        ]}>
                          Super Admin
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {updatingUser === user.id && (
                      <ActivityIndicator size="small" color={Colors.primary} />
                    )}

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteUser(user.id, user.email)}
                      disabled={updatingUser === user.id}
                    >
                      <Text style={styles.deleteButtonText}>Delete User</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
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
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
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
  userList: {
    gap: 15,
  },
  emptyState: {
    paddingVertical: 50,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  userCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  userInfo: {
    marginBottom: 15,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  userDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  userActions: {
    gap: 15,
  },
  roleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  activeRoleButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  roleButtonText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '500',
  },
  activeRoleButtonText: {
    color: 'white',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});