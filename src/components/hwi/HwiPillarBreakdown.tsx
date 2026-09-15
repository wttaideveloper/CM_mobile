import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  HomeDropIcon,
  HomeDumbbellIcon,
  HomeLeafIcon,
  HomeMoonIcon,
  HomeSunIcon,
  HomeWindIcon,
} from '@/components/home/HomeDashboardIcons';
import {
  HOME_DASH_BORDER,
  HOME_DASH_GREEN,
  HOME_DASH_LINK,
  HOME_DASH_MUTED,
  HOME_DASH_TEAL,
  HOME_DASH_TRACK,
  HWI_BREAKDOWN,
  type HwiBreakdownPillar,
} from '@/components/hwi/hwiDashboardData';
import { c, NU } from '@/utils/newUiCompact';

const ATTENTION_RED = '#d94848';

function PillarIcon({ pillar }: { pillar: HwiBreakdownPillar }) {
  const props = { color: pillar.color, size: 19 };
  switch (pillar.icon) {
    case 'leaf':
      return <HomeLeafIcon {...props} />;
    case 'drop':
      return <HomeDropIcon {...props} />;
    case 'sun':
      return <HomeSunIcon {...props} />;
    case 'wind':
      return <HomeWindIcon {...props} />;
    case 'moon':
      return <HomeMoonIcon {...props} />;
    case 'dumbbell':
      return <HomeDumbbellIcon {...props} />;
  }
}

function BreakdownRow({
  pillar,
  isLast,
}: {
  pillar: HwiBreakdownPillar;
  isLast: boolean;
}) {
  const router = useRouter();
  const needsAttention = pillar.scoreColor === ATTENTION_RED;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        !isLast && styles.rowBorder,
        pressed && styles.rowPressed,
      ]}
      onPress={() => router.push('/(main)/(tabs)/check-in')}
      accessibilityRole="button"
      accessibilityLabel={`${pillar.title}, ${pillar.score} percent, ${pillar.detail}, ${pillar.deltaPositive ? 'up' : 'down'} ${pillar.delta} this week${needsAttention ? ', needs attention' : ''}`}
      accessibilityHint="Opens the daily check-in screen"
    >
      <View style={[styles.iconWrap, { backgroundColor: pillar.iconBg }]}>
        <PillarIcon pillar={pillar} />
      </View>
      <View style={styles.copy}>
        <View style={styles.topLine}>
          <Text style={styles.name}>{pillar.title}</Text>
          <View style={styles.scoreGroup}>
            <Text
              style={[
                styles.delta,
                { color: pillar.deltaPositive ? HOME_DASH_GREEN : ATTENTION_RED },
              ]}
            >
              {pillar.delta}
            </Text>
            <Text style={[styles.score, { color: pillar.scoreColor }]}>
              {pillar.score}
            </Text>
          </View>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detail}>{pillar.detail}</Text>
          {needsAttention ? (
            <Text style={styles.attentionText}>Needs attention</Text>
          ) : null}
        </View>
        <View
          style={styles.track}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: 100, now: pillar.score }}
        >
          <View
            style={[
              styles.fill,
              {
                width: `${pillar.score}%`,
                backgroundColor: pillar.barColor,
              },
            ]}
          />
        </View>
      </View>
    </Pressable>
  );
}

export function HwiPillarBreakdown() {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.heading}>Pillar Breakdown</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="How scores work"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.link}>How scores work</Text>
        </Pressable>
      </View>
      <View style={styles.card}>
        {HWI_BREAKDOWN.map((pillar, index) => (
          <BreakdownRow
            key={pillar.id}
            pillar={pillar}
            isLast={index === HWI_BREAKDOWN.length - 1}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: NU.cardGap,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heading: {
    fontSize: NU.heading,
    fontWeight: '800',
    color: HOME_DASH_TEAL,
  },
  link: {
    fontSize: NU.chipFont,
    fontWeight: '600',
    color: HOME_DASH_LINK,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: HOME_DASH_BORDER,
    borderRadius: NU.cardRadius,
    overflow: 'hidden',
  },
  row: {
    padding: NU.cardPad,
    flexDirection: 'row',
    gap: NU.rowGap,
    alignItems: 'center',
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f6f0',
  },
  rowPressed: {
    backgroundColor: '#f7fbf7',
  },
  iconWrap: {
    width: NU.iconBtn,
    height: NU.iconBtn,
    borderRadius: NU.iconBtnRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: c(7, 5),
  },
  topLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: NU.cardTitle,
    fontWeight: '700',
    color: HOME_DASH_TEAL,
  },
  scoreGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(6, 5),
  },
  delta: {
    fontSize: NU.bodySm,
    fontWeight: '700',
  },
  score: {
    fontSize: NU.cardTitle,
    fontWeight: '800',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detail: {
    fontSize: NU.bodySm,
    color: HOME_DASH_MUTED,
  },
  attentionText: {
    fontSize: NU.bodySm,
    fontWeight: '700',
    color: ATTENTION_RED,
  },
  track: {
    height: 6,
    borderRadius: 99,
    backgroundColor: HOME_DASH_TRACK,
    overflow: 'hidden',
  },
  fill: {
    height: 6,
    borderRadius: 99,
  },
});
