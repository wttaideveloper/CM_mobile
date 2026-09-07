import { StyleSheet, Text, View } from 'react-native';

import {
  HomeBoltIcon,
  HomeFlameIcon,
  HomeHeartIcon,
  HomeTrendIcon,
} from '@/components/home/HomeDashboardIcons';
import {
  HOME_DASH_BORDER,
  HOME_DASH_MUTED,
  HOME_DASH_TEAL,
  HOME_QUICK_METRICS,
  type HomeQuickMetric,
} from '@/components/home/homeDashboardData';
import { c, NU } from '@/utils/newUiCompact';

function MetricIcon({ metric }: { metric: HomeQuickMetric }) {
  const props = { color: metric.iconColor, size: 15 };
  switch (metric.icon) {
    case 'flame':
      return <HomeFlameIcon {...props} />;
    case 'trend':
      return <HomeTrendIcon {...props} />;
    case 'bolt':
      return <HomeBoltIcon {...props} />;
    case 'heart':
      return <HomeHeartIcon {...props} />;
  }
}

export function HomeDashboardStats() {
  return (
    <View style={styles.row}>
      {HOME_QUICK_METRICS.map((metric) => (
        <View key={metric.id} style={styles.card}>
          <View style={[styles.iconWrap, { backgroundColor: metric.iconBg }]}>
            <MetricIcon metric={metric} />
          </View>
          <Text style={styles.value}>{metric.value}</Text>
          <Text style={styles.unit}>{metric.unit}</Text>
          <Text style={styles.label}>{metric.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: c(10, 8),
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: HOME_DASH_BORDER,
    borderRadius: NU.cardRadiusMd,
    paddingVertical: NU.cardPadXs,
    paddingHorizontal: c(6, 4),
    alignItems: 'center',
    gap: c(6, 4),
  },
  iconWrap: {
    width: c(30, 26),
    height: c(30, 26),
    borderRadius: c(15, 13),
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: c(17, 15),
    fontWeight: '800',
    color: HOME_DASH_TEAL,
    lineHeight: c(18, 16),
  },
  unit: {
    fontSize: c(10, 9),
    fontWeight: '600',
    color: HOME_DASH_TEAL,
  },
  label: {
    fontSize: c(10, 9),
    color: HOME_DASH_MUTED,
    textAlign: 'center',
  },
});
