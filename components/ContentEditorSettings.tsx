import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  X, 
  Settings, 
  Eye, 
  Clock, 
  RefreshCw, 
  Palette, 
  Shield, 
  Database,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react-native';
import Colors from '@/constants/colors';

interface ContentEditorSettingsProps {
  visible: boolean;
  onClose: () => void;
  onExport: () => void;
  onImport: () => void;
  onClearCache: () => void;
  onResetContent: () => void;
}

export default function ContentEditorSettings({
  visible,
  onClose,
  onExport,
  onImport,
  onClearCache,
  onResetContent
}: ContentEditorSettingsProps) {
  const [settings, setSettings] = useState({
    autoRefresh: true,
    showPreview: true,
    confirmDeletes: true,
    cacheDuration: 5,
    theme: 'light',
    notifications: true,
  });

  const [cacheInfo, setCacheInfo] = useState({
    size: '2.4 MB',
    items: 156,
    lastUpdated: '2 minutes ago',
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleExport = () => {
    Alert.alert(
      'Export Content',
      'This will export all content to a JSON file. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: onExport }
      ]
    );
  };

  const handleImport = () => {
    Alert.alert(
      'Import Content',
      'This will import content from a JSON file. This may overwrite existing content. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Import', onPress: onImport }
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear the content cache. The cache will rebuild when you next load content. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear Cache', onPress: onClearCache }
      ]
    );
  };

  const handleResetContent = () => {
    Alert.alert(
      'Reset All Content',
      '⚠️ WARNING: This will reset ALL content to default values. This action cannot be undone. Are you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset All Content', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'This will permanently reset all content. Type "RESET" to confirm.',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Reset', 
                  style: 'destructive',
                  onPress: onResetContent
                }
              ]
            );
          }
        }
      ]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    children, 
    danger = false 
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    danger?: boolean;
  }) => (
    <View style={[styles.settingItem, danger && styles.settingItemDanger]}>
      <View style={styles.settingHeader}>
        <View style={styles.settingIcon}>
          {icon}
        </View>
        <View style={styles.settingInfo}>
          <Text style={[styles.settingTitle, danger && styles.settingTitleDanger]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.settingSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      <View style={styles.settingControl}>
        {children}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Settings size={24} color={Colors.primary} />
            <Text style={styles.headerTitle}>Content Editor Settings</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* General Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>General</Text>
            
            <SettingItem
              icon={<RefreshCw size={20} color={Colors.primary} />}
              title="Auto Refresh"
              subtitle="Automatically refresh content when changes are detected"
            >
              <Switch
                value={settings.autoRefresh}
                onValueChange={(value) => updateSetting('autoRefresh', value)}
                trackColor={{ false: Colors.border, true: Colors.primary + '40' }}
                thumbColor={settings.autoRefresh ? Colors.primary : Colors.textSecondary}
              />
            </SettingItem>

            <SettingItem
              icon={<Eye size={20} color={Colors.primary} />}
              title="Show Preview"
              subtitle="Display live preview when editing content"
            >
              <Switch
                value={settings.showPreview}
                onValueChange={(value) => updateSetting('showPreview', value)}
                trackColor={{ false: Colors.border, true: Colors.primary + '40' }}
                thumbColor={settings.showPreview ? Colors.primary : Colors.textSecondary}
              />
            </SettingItem>

            <SettingItem
              icon={<AlertTriangle size={20} color={Colors.warning} />}
              title="Confirm Deletes"
              subtitle="Show confirmation dialog before deleting content"
            >
              <Switch
                value={settings.confirmDeletes}
                onValueChange={(value) => updateSetting('confirmDeletes', value)}
                trackColor={{ false: Colors.border, true: Colors.warning + '40' }}
                thumbColor={settings.confirmDeletes ? Colors.warning : Colors.textSecondary}
              />
            </SettingItem>
          </View>

          {/* Cache Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cache & Performance</Text>
            
            <SettingItem
              icon={<Clock size={20} color={Colors.primary} />}
              title="Cache Duration"
              subtitle={`${settings.cacheDuration} minutes`}
            >
              <View style={styles.cacheDurationControl}>
                <TouchableOpacity
                  style={styles.cacheButton}
                  onPress={() => updateSetting('cacheDuration', Math.max(1, settings.cacheDuration - 1))}
                >
                  <Text style={styles.cacheButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.cacheDurationText}>{settings.cacheDuration}m</Text>
                <TouchableOpacity
                  style={styles.cacheButton}
                  onPress={() => updateSetting('cacheDuration', Math.min(60, settings.cacheDuration + 1))}
                >
                  <Text style={styles.cacheButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </SettingItem>

            <View style={styles.cacheInfo}>
              <View style={styles.cacheInfoItem}>
                <Text style={styles.cacheInfoLabel}>Cache Size</Text>
                <Text style={styles.cacheInfoValue}>{cacheInfo.size}</Text>
              </View>
              <View style={styles.cacheInfoItem}>
                <Text style={styles.cacheInfoLabel}>Cached Items</Text>
                <Text style={styles.cacheInfoValue}>{cacheInfo.items}</Text>
              </View>
              <View style={styles.cacheInfoItem}>
                <Text style={styles.cacheInfoLabel}>Last Updated</Text>
                <Text style={styles.cacheInfoValue}>{cacheInfo.lastUpdated}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.actionButton} onPress={handleClearCache}>
              <RefreshCw size={16} color={Colors.primary} />
              <Text style={styles.actionButtonText}>Clear Cache</Text>
            </TouchableOpacity>
          </View>

          {/* Data Management */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Management</Text>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleExport}>
              <Download size={16} color={Colors.primary} />
              <Text style={styles.actionButtonText}>Export All Content</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleImport}>
              <Upload size={16} color={Colors.primary} />
              <Text style={styles.actionButtonText}>Import Content</Text>
            </TouchableOpacity>
          </View>

          {/* Danger Zone */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Danger Zone</Text>
            
            <View style={styles.dangerZone}>
              <View style={styles.dangerHeader}>
                <AlertTriangle size={20} color={Colors.error} />
                <Text style={styles.dangerTitle}>Reset All Content</Text>
              </View>
              <Text style={styles.dangerDescription}>
                This will reset all content to default values. This action cannot be undone and will affect all users.
              </Text>
              <TouchableOpacity style={styles.dangerButton} onPress={handleResetContent}>
                <Trash2 size={16} color={Colors.white} />
                <Text style={styles.dangerButtonText}>Reset All Content</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* System Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>System Information</Text>
            
            <View style={styles.systemInfo}>
              <View style={styles.systemInfoItem}>
                <Text style={styles.systemInfoLabel}>Content Editor Version</Text>
                <Text style={styles.systemInfoValue}>1.0.0</Text>
              </View>
              <View style={styles.systemInfoItem}>
                <Text style={styles.systemInfoLabel}>Database Schema</Text>
                <Text style={styles.systemInfoValue}>v2.1</Text>
              </View>
              <View style={styles.systemInfoItem}>
                <Text style={styles.systemInfoLabel}>Last Backup</Text>
                <Text style={styles.systemInfoValue}>2 hours ago</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  settingItemDanger: {
    borderColor: Colors.error + '30',
    backgroundColor: Colors.error + '05',
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  settingTitleDanger: {
    color: Colors.error,
  },
  settingSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  settingControl: {
    marginLeft: 12,
  },
  cacheDurationControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cacheButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cacheButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  cacheDurationText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    minWidth: 30,
    textAlign: 'center',
  },
  cacheInfo: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cacheInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cacheInfoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  cacheInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  dangerZone: {
    backgroundColor: Colors.error + '05',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  dangerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.error,
  },
  dangerDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.error,
    borderRadius: 8,
    gap: 8,
  },
  dangerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  systemInfo: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  systemInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  systemInfoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  systemInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
});
