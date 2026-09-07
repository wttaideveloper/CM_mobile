import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { homePartsStyles as styles } from '@/components/home/homePartsStyles';

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function HomeSectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={styles.sectionAction}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

type QuickStatCardProps = {
  icon: ReactNode;
  value: string;
  label: string;
  iconBg: string;
};

export function HomeQuickStatCard({ icon, value, label, iconBg }: QuickStatCardProps) {
  return (
    <View style={styles.quickStatCard}>
      <View style={[styles.quickStatIcon, { backgroundColor: iconBg }]}>{icon}</View>
      <Text style={styles.quickStatValue}>{value}</Text>
      <Text style={styles.quickStatLabel}>{label}</Text>
    </View>
  );
}

type CategoryItemProps = {
  emoji: string;
  label: string;
  active: boolean;
  onPress: () => void;
};

export function HomeCategoryItem({ emoji, label, active, onPress }: CategoryItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.categoryItem}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
    >
      <View style={[styles.categoryIcon, active && styles.categoryIconActive]}>
        <Text style={[styles.categoryEmoji, active && styles.categoryEmojiActive]}>{emoji}</Text>
      </View>
      <Text style={[styles.categoryLabel, active && styles.categoryLabelActive]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}
