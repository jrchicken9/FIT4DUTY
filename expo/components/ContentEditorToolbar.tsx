import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { 
  Search, 
  Filter, 
  Plus, 
  RefreshCw, 
  Settings, 
  Download, 
  Upload,
  BookOpen,
  Target,
  Dumbbell,
  Users,
  Zap,
  MessageCircle,
  AlertCircle
} from 'lucide-react-native';
import Colors from '@/constants/colors';

interface ContentEditorToolbarProps {
  onSearch: () => void;
  onFilter: () => void;
  onCreate: () => void;
  onRefresh: () => void;
  onSettings: () => void;
  onExport: () => void;
  onImport: () => void;
  selectedSection: string;
  onSectionChange: (section: string) => void;
  sections: string[];
  loading?: boolean;
}

const SECTION_ICONS = {
  dashboard: BookOpen,
  application: Target,
  fitness: Dumbbell,
  community: Users,
  ui: Zap,
  modal: MessageCircle,
  tooltip: AlertCircle,
};

export default function ContentEditorToolbar({
  onSearch,
  onFilter,
  onCreate,
  onRefresh,
  onSettings,
  onExport,
  onImport,
  selectedSection,
  onSectionChange,
  sections,
  loading = false
}: ContentEditorToolbarProps) {
  return (
    <View style={styles.container}>
      {/* Quick Actions Row */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton} onPress={onSearch}>
          <Search size={18} color={Colors.primary} />
          <Text style={styles.actionText}>Search</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={onFilter}>
          <Filter size={18} color={Colors.primary} />
          <Text style={styles.actionText}>Filter</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={onCreate}>
          <Plus size={18} color={Colors.primary} />
          <Text style={styles.actionText}>Create</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={onRefresh}
          disabled={loading}
        >
          <RefreshCw size={18} color={loading ? Colors.textSecondary : Colors.primary} />
          <Text style={[styles.actionText, loading && styles.actionTextDisabled]}>
            Refresh
          </Text>
        </TouchableOpacity>
      </View>

      {/* Section Navigation */}
      <View style={styles.sectionNav}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.sectionButton,
              selectedSection === 'all' && styles.sectionButtonActive
            ]}
            onPress={() => onSectionChange('all')}
          >
            <Text style={[
              styles.sectionButtonText,
              selectedSection === 'all' && styles.sectionButtonTextActive
            ]}>
              All
            </Text>
          </TouchableOpacity>
          
          {sections.map(section => {
            const IconComponent = SECTION_ICONS[section as keyof typeof SECTION_ICONS] || BookOpen;
            return (
              <TouchableOpacity
                key={section}
                style={[
                  styles.sectionButton,
                  selectedSection === section && styles.sectionButtonActive
                ]}
                onPress={() => onSectionChange(section)}
              >
                <IconComponent size={14} color={selectedSection === section ? Colors.white : Colors.primary} />
                <Text style={[
                  styles.sectionButtonText,
                  selectedSection === section && styles.sectionButtonTextActive
                ]}>
                  {section}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Advanced Actions */}
      <View style={styles.advancedActions}>
        <TouchableOpacity style={styles.advancedButton} onPress={onSettings}>
          <Settings size={16} color={Colors.textSecondary} />
          <Text style={styles.advancedButtonText}>Settings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.advancedButton} onPress={onExport}>
          <Download size={16} color={Colors.textSecondary} />
          <Text style={styles.advancedButtonText}>Export</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.advancedButton} onPress={onImport}>
          <Upload size={16} color={Colors.textSecondary} />
          <Text style={styles.advancedButtonText}>Import</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 12,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  actionButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.background,
    minWidth: 60,
  },
  actionText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
    marginTop: 4,
  },
  actionTextDisabled: {
    color: Colors.textSecondary,
  },
  sectionNav: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
    gap: 4,
  },
  sectionButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sectionButtonText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  sectionButtonTextActive: {
    color: Colors.white,
  },
  advancedActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingHorizontal: 16,
  },
  advancedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  advancedButtonText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
