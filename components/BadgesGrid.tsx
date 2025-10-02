import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Pressable } from 'react-native';
import Colors from '@/constants/colors';
import { typography, spacing, borderRadius, shadows, strokeWidth, sizes } from '@/constants/designSystem';
import { useTapAnimation } from '@/hooks/useTapAnimation';
import { supabase } from '@/lib/supabase';
import { Award } from 'lucide-react-native';

type Badge = {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon_key: string;
  rarity: 'common' | 'rare' | 'epic';
  points: number;
  is_hidden: boolean;
};

type UserBadge = {
  badge_id: string;
  earned_at: string;
  revoked_at: string | null;
};

const BadgeCard = ({ item, isEarned, isRevoked, onPress }: {
  item: Badge;
  isEarned: boolean;
  isRevoked: boolean;
  onPress: () => void;
}) => {
  const { handlePressIn, handlePressOut, animatedStyle } = useTapAnimation();
  const colorByRarity = item.rarity === 'epic' ? Colors.features.premium : item.rarity === 'rare' ? Colors.accent : Colors.textTertiary;

  return (
    <Pressable
      style={[styles.card, isEarned ? styles.cardEarned : styles.cardLocked]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.animatedContainer, animatedStyle]}>
        <View style={[styles.iconWrap, { borderColor: colorByRarity, backgroundColor: isEarned ? colorByRarity + '22' : Colors.gray[100] }]}>
          <Award size={sizes.lg} color={colorByRarity} />
        </View>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.subtitle} numberOfLines={2}>{isEarned ? 'Earned' : item.description}</Text>
        {isRevoked && <Text style={styles.revoked}>revoked</Text>}
      </Animated.View>
    </Pressable>
  );
};

export default function BadgesGrid({ maxVisible = 4 }: { maxVisible?: number }) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [earned, setEarned] = useState<Record<string, UserBadge>>({});
  const [selected, setSelected] = useState<Badge | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: badgesData } = await supabase.from('badges').select('*').eq('active', true);
      const { data: user } = await supabase.auth.getUser();
      let earnedMap: Record<string, UserBadge> = {};
      if (user?.user?.id) {
        const { data: ub } = await supabase
          .from('user_badges')
          .select('badge_id, earned_at, revoked_at')
          .eq('user_id', user.user.id);
        (ub || []).forEach((u) => { earnedMap[u.badge_id] = u as any; });
      }
      setBadges(badgesData || []);
      setEarned(earnedMap);
    };
    load();
  }, []);

  const dataToShow = useMemo(() => (showAll ? badges : badges.slice(0, maxVisible)), [showAll, badges, maxVisible]);

  const renderItem = ({ item }: { item: Badge }) => {
    const ub = earned[item.id];
    const isEarned = !!ub && !ub.revoked_at;
    const isRevoked = !!ub && !!ub.revoked_at;

    return (
      <BadgeCard
        item={item}
        isEarned={isEarned}
        isRevoked={isRevoked}
        onPress={() => setSelected(item)}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}> 
        {dataToShow.map((b) => (
          <View key={b.id} style={styles.gridItem}>
            {renderItem({ item: b })}
          </View>
        ))}
      </View>

      {badges.length > maxVisible && (
        <Pressable style={styles.viewAllBtn} onPress={() => setShowAll((v) => !v)}>
          <Text style={styles.viewAllText}>{showAll ? 'Show less' : `View all (${badges.length})`}</Text>
        </Pressable>
      )}

      <Modal visible={!!selected} animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>{selected?.title}</Text>
          <Text style={styles.modalDesc}>{selected?.description}</Text>
          <Pressable style={styles.closeBtn} onPress={() => setSelected(null)}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  gridItem: {
    width: '48%',
  },
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    borderWidth: strokeWidth.thin,
    borderColor: Colors.border,
    ...shadows.level2,
  },
  animatedContainer: {
    flex: 1,
  },
  cardEarned: {},
  cardLocked: { opacity: 0.85 },
  iconWrap: {
    width: sizes.xxl,
    height: sizes.xxl,
    borderRadius: sizes.xxl / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: strokeWidth.normal,
    marginBottom: spacing.sm,
  },
  title: { 
    ...typography.labelMedium, 
    fontWeight: '700', 
    color: Colors.text 
  },
  subtitle: { 
    ...typography.labelSmall, 
    color: Colors.textSecondary, 
    marginTop: spacing.xs 
  },
  revoked: { 
    marginTop: spacing.xs, 
    ...typography.labelSmall, 
    color: Colors.error 
  },
  modal: { 
    flex: 1, 
    padding: spacing.lg, 
    backgroundColor: Colors.background 
  },
  modalTitle: { 
    ...typography.headingMedium, 
    color: Colors.text, 
    marginBottom: spacing.sm 
  },
  modalDesc: { 
    ...typography.bodyMedium, 
    color: Colors.textSecondary 
  },
  closeBtn: { 
    marginTop: spacing.lg, 
    backgroundColor: Colors.primary, 
    borderRadius: borderRadius.md, 
    paddingVertical: spacing.sm, 
    alignItems: 'center' 
  },
  closeText: { 
    color: Colors.white, 
    fontWeight: '600' 
  },
  viewAllBtn: { 
    marginTop: spacing.sm, 
    alignItems: 'center' 
  },
  viewAllText: { 
    color: Colors.primary, 
    fontWeight: '600' 
  },
});



