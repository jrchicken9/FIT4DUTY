import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { X, Plus, Edit, Trash2, ChevronLeft, Check } from 'lucide-react-native';
import Colors from '@/constants/colors';
import ResumeEntryModal, { EntryType } from './ResumeEntryModal';

type SectionKey = 'education_details' | 'work_history' | 'volunteer_history' | 'certs_details' | 'skills_languages' | 'skills_details' | 'awards_details' | 'refs_list' | 'driving_record' | 'background_fitness';

type SectionSpec = {
  key: SectionKey;
  title: string;
  guidance: string;
  type: EntryType | 'skill' | 'award';
  hasNotApplicable?: boolean;
};

type Props = {
  visible: boolean;
  section: SectionSpec | null;
  entries: any[];
  levels: Record<string, any>;
  onClose: () => void;
  onAddEntry: (entry: any) => void;
  onEditEntry: (index: number, entry: any) => void;
  onDeleteEntry: (index: number) => void;
  getImprovementTips: (sectionKey: SectionKey) => string[];
  sectionToCategory: Partial<Record<SectionKey, string>>;
};

export default function UnifiedSectionModal({
  visible,
  section,
  entries,
  levels,
  onClose,
  onAddEntry,
  onEditEntry,
  onDeleteEntry,
  getImprovementTips,
  sectionToCategory,
}: Props) {
  const [mode, setMode] = useState<'view' | 'add' | 'edit'>('view');
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [editingIndex, setEditingIndex] = useState<number>(-1);

  useEffect(() => {
    if (visible) {
      setMode('view');
      setEditingEntry(null);
      setEditingIndex(-1);
    }
  }, [visible]);

  const handleAdd = () => {
    setMode('add');
    setEditingEntry(null);
    setEditingIndex(-1);
  };

  const handleEdit = (index: number, entry: any) => {
    setMode('edit');
    setEditingEntry(entry);
    setEditingIndex(index);
  };

  const handleSaveEntry = (entry: any) => {
    if (mode === 'add') {
      onAddEntry(entry);
    } else if (mode === 'edit') {
      onEditEntry(editingIndex, entry);
    }
    setMode('view');
    setEditingEntry(null);
    setEditingIndex(-1);
  };

  const handleCancelEdit = () => {
    setMode('view');
    setEditingEntry(null);
    setEditingIndex(-1);
  };

  const handleDelete = (index: number) => {
    onDeleteEntry(index);
  };

  if (!section) return null;

  const categoryKey = sectionToCategory[section.key];
  const level = categoryKey ? levels[categoryKey] || 'NEEDS_WORK' : 'NEEDS_WORK';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView style={styles.keyboardContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          {/* Header */}
          <View style={styles.header}>
            {mode === 'view' ? (
              <>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.title}>{section.title}</Text>
                <TouchableOpacity onPress={handleAdd} style={styles.addButton}>
                  <Plus size={24} color={Colors.white} />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity onPress={handleCancelEdit} style={styles.backButton}>
                  <ChevronLeft size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.title}>
                  {mode === 'add' ? `Add ${section.title}` : `Edit ${section.title}`}
                </Text>
                <View style={styles.placeholder} />
              </>
            )}
          </View>

          {/* Content */}
          {mode === 'view' ? (
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <View style={styles.contentPadding}>
                {/* Guidance */}
                <Text style={styles.guidance}>{section.guidance}</Text>
                
                {/* Improvement Section */}
                <View style={styles.improvementSection}>
                  <View style={styles.improvementHeader}>
                    <Text style={styles.improvementTitle}>How You Can Improve</Text>
                    <View style={[
                      styles.improvementBadge,
                      { backgroundColor: level === 'COMPETITIVE' ? Colors.success + '20' : level === 'EFFECTIVE' ? Colors.secondary + '20' : level === 'DEVELOPING' ? Colors.warning + '20' : Colors.error + '20' }
                    ]}>
                      <Text style={[
                        styles.improvementBadgeText,
                        { color: level === 'COMPETITIVE' ? Colors.success : level === 'EFFECTIVE' ? Colors.secondary : level === 'DEVELOPING' ? Colors.warning : Colors.error }
                      ]}>
                        {level === 'COMPETITIVE' ? 'Competitive' : level === 'EFFECTIVE' ? 'Effective' : level === 'DEVELOPING' ? 'Developing' : 'Needs Work'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.improvementTips}>
                    {getImprovementTips(section.key).map((tip, index) => (
                      <View key={index} style={styles.improvementTip}>
                        <Text style={styles.improvementTipBullet}>•</Text>
                        <Text style={styles.improvementTipText}>{tip}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Entries */}
                {entries.length > 0 ? (
                  <View style={styles.entriesContainer}>
                    {entries.map((entry: any, index: number) => (
                      <View key={index} style={styles.entry}>
                        <View style={styles.entryContent}>
                          <Text style={styles.entryTitle}>
                            {entry.title || entry.role || entry.name || entry.institution || 'Entry'}
                          </Text>
                          <Text style={styles.entrySubtitle}>
                            {entry.organization || entry.company || entry.program || entry.type || ''}
                          </Text>
                        </View>
                        <View style={styles.entryActions}>
                          <TouchableOpacity 
                            style={styles.editButton}
                            onPress={() => handleEdit(index, entry)}
                          >
                            <Edit size={16} color={Colors.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.deleteButton}
                            onPress={() => handleDelete(index)}
                          >
                            <Trash2 size={16} color={Colors.error} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No entries yet</Text>
                    <Text style={styles.emptySubtext}>Tap the + button to create your first entry</Text>
                  </View>
                )}
              </View>
            </ScrollView>
          ) : (
            <ResumeEntryModal
              visible={true}
              type={section.type}
              initial={editingEntry}
              onClose={handleCancelEdit}
              onSave={handleSaveEntry}
            />
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0,
    backgroundColor: Colors.primary,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: Colors.white + '20',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: Colors.white + '20',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  addButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: Colors.white + '20',
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  contentPadding: {
    padding: 20,
  },
  guidance: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  improvementSection: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  improvementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  improvementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  improvementBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  improvementBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  improvementTips: {
    gap: 8,
  },
  improvementTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  improvementTipBullet: {
    fontSize: 16,
    color: Colors.primary,
    marginRight: 8,
    marginTop: 2,
  },
  improvementTipText: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  entriesContainer: {
    gap: 12,
  },
  entry: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryContent: {
    flex: 1,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  entrySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  entryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: Colors.primary + '15',
  },
  deleteButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: Colors.error + '15',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});
