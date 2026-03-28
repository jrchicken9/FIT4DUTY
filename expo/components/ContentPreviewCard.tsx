import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Eye, Smartphone, Monitor } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface ContentPreviewCardProps {
  content: string;
  contentKey: string;
  isEditing?: boolean;
}

export default function ContentPreviewCard({ content, contentKey, isEditing = false }: ContentPreviewCardProps) {
  const getPreviewStyle = () => {
    // Determine preview style based on content key
    if (contentKey.includes('button')) {
      return 'button';
    } else if (contentKey.includes('title')) {
      return 'title';
    } else if (contentKey.includes('subtitle')) {
      return 'subtitle';
    } else if (contentKey.includes('description')) {
      return 'description';
    } else if (contentKey.includes('greeting')) {
      return 'greeting';
    } else {
      return 'text';
    }
  };

  const previewStyle = getPreviewStyle();

  const renderPreview = () => {
    switch (previewStyle) {
      case 'button':
        return (
          <View style={styles.buttonPreview}>
            <Text style={styles.buttonText}>{content}</Text>
          </View>
        );
      case 'title':
        return (
          <Text style={styles.titlePreview}>{content}</Text>
        );
      case 'subtitle':
        return (
          <Text style={styles.subtitlePreview}>{content}</Text>
        );
      case 'greeting':
        return (
          <View style={styles.greetingPreview}>
            <Text style={styles.greetingText}>{content}</Text>
          </View>
        );
      case 'description':
        return (
          <Text style={styles.descriptionPreview}>{content}</Text>
        );
      default:
        return (
          <Text style={styles.textPreview}>{content}</Text>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Eye size={16} color={Colors.primary} />
          <Text style={styles.headerTitle}>Live Preview</Text>
        </View>
        <View style={styles.deviceIcons}>
          <Smartphone size={14} color={Colors.textSecondary} />
          <Monitor size={14} color={Colors.textSecondary} />
        </View>
      </View>
      
      <View style={[
        styles.previewContainer,
        isEditing && styles.previewContainerEditing
      ]}>
        {renderPreview()}
      </View>
      
      <Text style={styles.previewLabel}>
        {previewStyle.charAt(0).toUpperCase() + previewStyle.slice(1)} Preview
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  deviceIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  previewContainer: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 16,
    minHeight: 60,
    justifyContent: 'center',
  },
  previewContainerEditing: {
    borderWidth: 2,
    borderColor: Colors.primary + '30',
    backgroundColor: Colors.primary + '05',
  },
  buttonPreview: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  titlePreview: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 28,
  },
  subtitlePreview: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  greetingPreview: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 24,
  },
  descriptionPreview: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 22,
  },
  textPreview: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  previewLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});
