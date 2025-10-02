import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Filter, SortAsc, SortDesc, Clock, History, FileText, Search, AlertCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface AdvancedFiltersModalProps {
  visible: boolean;
  onClose: () => void;
  filters: {
    textOnly: boolean;
    keyOnly: boolean;
    descriptionOnly: boolean;
    recentlyUpdated: boolean;
    hasHistory: boolean;
    emptyContent: boolean;
  };
  onFiltersChange: (filters: any) => void;
  sortBy: 'key' | 'section' | 'updated' | 'created';
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: 'key' | 'section' | 'updated' | 'created', sortOrder: 'asc' | 'desc') => void;
}

export default function AdvancedFiltersModal({
  visible,
  onClose,
  filters,
  onFiltersChange,
  sortBy,
  sortOrder,
  onSortChange,
}: AdvancedFiltersModalProps) {
  const updateFilter = (key: string, value: boolean) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const SortOption = ({ value, label, icon }: { value: 'key' | 'section' | 'updated' | 'created'; label: string; icon: any }) => (
    <TouchableOpacity
      style={[styles.sortOption, sortBy === value && styles.sortOptionSelected]}
      onPress={() => onSortChange(value, sortOrder)}
    >
      {icon}
      <Text style={[styles.sortOptionText, sortBy === value && styles.sortOptionTextSelected]}>
        {label}
      </Text>
      {sortBy === value && (
        sortOrder === 'asc' ? <SortAsc size={16} color={Colors.primary} /> : <SortDesc size={16} color={Colors.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Filter size={24} color={Colors.primary} />
          <Text style={styles.title}>Advanced Filters</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Search Scope */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Search Scope</Text>
            <View style={styles.filterRow}>
              <View style={styles.filterInfo}>
                <Search size={20} color={Colors.textSecondary} />
                <Text style={styles.filterLabel}>Text Content Only</Text>
              </View>
              <Switch
                value={filters.textOnly}
                onValueChange={(value) => updateFilter('textOnly', value)}
                trackColor={{ false: Colors.border, true: Colors.primary + '40' }}
                thumbColor={filters.textOnly ? Colors.primary : Colors.textSecondary}
              />
            </View>
            <View style={styles.filterRow}>
              <View style={styles.filterInfo}>
                <FileText size={20} color={Colors.textSecondary} />
                <Text style={styles.filterLabel}>Content Key Only</Text>
              </View>
              <Switch
                value={filters.keyOnly}
                onValueChange={(value) => updateFilter('keyOnly', value)}
                trackColor={{ false: Colors.border, true: Colors.primary + '40' }}
                thumbColor={filters.keyOnly ? Colors.primary : Colors.textSecondary}
              />
            </View>
            <View style={styles.filterRow}>
              <View style={styles.filterInfo}>
                <Search size={20} color={Colors.textSecondary} />
                <Text style={styles.filterLabel}>Description Only</Text>
              </View>
              <Switch
                value={filters.descriptionOnly}
                onValueChange={(value) => updateFilter('descriptionOnly', value)}
                trackColor={{ false: Colors.border, true: Colors.primary + '40' }}
                thumbColor={filters.descriptionOnly ? Colors.primary : Colors.textSecondary}
              />
            </View>
          </View>

          {/* Content Filters */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Content Filters</Text>
            <View style={styles.filterRow}>
              <View style={styles.filterInfo}>
                <Clock size={20} color={Colors.textSecondary} />
                <Text style={styles.filterLabel}>Recently Updated (7 days)</Text>
              </View>
              <Switch
                value={filters.recentlyUpdated}
                onValueChange={(value) => updateFilter('recentlyUpdated', value)}
                trackColor={{ false: Colors.border, true: Colors.primary + '40' }}
                thumbColor={filters.recentlyUpdated ? Colors.primary : Colors.textSecondary}
              />
            </View>
            <View style={styles.filterRow}>
              <View style={styles.filterInfo}>
                <History size={20} color={Colors.textSecondary} />
                <Text style={styles.filterLabel}>Has History</Text>
              </View>
              <Switch
                value={filters.hasHistory}
                onValueChange={(value) => updateFilter('hasHistory', value)}
                trackColor={{ false: Colors.border, true: Colors.primary + '40' }}
                thumbColor={filters.hasHistory ? Colors.primary : Colors.textSecondary}
              />
            </View>
            <View style={styles.filterRow}>
              <View style={styles.filterInfo}>
                <AlertCircle size={20} color={Colors.textSecondary} />
                <Text style={styles.filterLabel}>Empty/Short Content</Text>
              </View>
              <Switch
                value={filters.emptyContent}
                onValueChange={(value) => updateFilter('emptyContent', value)}
                trackColor={{ false: Colors.border, true: Colors.primary + '40' }}
                thumbColor={filters.emptyContent ? Colors.primary : Colors.textSecondary}
              />
            </View>
          </View>

          {/* Sort Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sort By</Text>
            <SortOption value="updated" label="Last Updated" icon={<Clock size={20} color={Colors.textSecondary} />} />
            <SortOption value="created" label="Date Created" icon={<Clock size={20} color={Colors.textSecondary} />} />
            <SortOption value="key" label="Content Key" icon={<FileText size={20} color={Colors.textSecondary} />} />
            <SortOption value="section" label="Section" icon={<Filter size={20} color={Colors.textSecondary} />} />
          </View>

          {/* Sort Order Toggle */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sort Order</Text>
            <TouchableOpacity
              style={styles.sortOrderButton}
              onPress={() => onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? <SortAsc size={20} color={Colors.primary} /> : <SortDesc size={20} color={Colors.primary} />}
              <Text style={styles.sortOrderText}>
                {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </Text>
            </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    marginLeft: 12,
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
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border + '20',
  },
  filterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  filterLabel: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 12,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sortOptionSelected: {
    backgroundColor: Colors.primary + '10',
    borderColor: Colors.primary,
  },
  sortOptionText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 12,
    flex: 1,
  },
  sortOptionTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  sortOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: Colors.primary + '10',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  sortOrderText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 12,
  },
});
