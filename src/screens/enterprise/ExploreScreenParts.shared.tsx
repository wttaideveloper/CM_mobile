import { Pressable, Text, View } from 'react-native';

import { LeafyGradientButton } from '@/components/LeafyGradientButton';
import { StarIcon } from '@/components/dashboard/DashboardIcons';
import { PRIMARY, STAR_SIZE, styles } from '@/screens/enterprise/ExploreScreen.styles';

export type DetailTab = 'about' | 'services' | 'products';

export function DetailStarRating({ rating }: { rating: string }) {
  const value = Math.max(0, Math.min(5, Number.parseFloat(rating) || 0));
  const fullStars = Math.floor(value);
  const hasHalf = value - fullStars >= 0.5;

  return (
    <View style={styles.starsRow}>
      {Array.from({ length: 5 }, (_, index) => {
        const filled = index < fullStars || (index === fullStars && hasHalf);
        return (
          <StarIcon key={index} size={STAR_SIZE} color={filled ? '#FBBF24' : '#E5E7EB'} />
        );
      })}
    </View>
  );
}

export function EnterpriseActionButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  if (active) {
    return (
      <LeafyGradientButton onPress={onPress} style={styles.actionBtn} borderRadius={14}>
        <Text style={styles.actionBtnTextActive}>{label}</Text>
      </LeafyGradientButton>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [styles.actionBtnOutline, pressed && styles.btnPressed]}
    >
      <Text style={styles.actionBtnTextOutline}>{label}</Text>
    </Pressable>
  );
}

export function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function TabBar({
  activeTab,
  onChange,
}: {
  activeTab: DetailTab;
  onChange: (tab: DetailTab) => void;
}) {
  const tabs: { key: DetailTab; label: string }[] = [
    { key: 'about', label: 'About' },
    { key: 'services', label: 'Services' },
    { key: 'products', label: 'Products' },
  ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => {
        const active = activeTab === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: active }}
            style={[styles.tabItem, active && styles.tabItemActive]}
          >
            <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
