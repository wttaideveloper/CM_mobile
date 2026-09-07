import { Pressable, StyleSheet, Text, View } from 'react-native';

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
  HOME_DASH_LINK,
  HOME_DASH_MUTED,
  HOME_DASH_TEAL,
  HOME_DASH_TRACK,
  HWI_BREAKDOWN,
  type HwiBreakdownPillar,
} from '@/components/hwi/hwiDashboardData';
import { c, NU } from '@/utils/newUiCompact';

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
  return (
    <Pressable
      style={[styles.row, !isLast && styles.rowBorder]}
      accessibilityRole="button"
    >
      <View style={[styles.iconWrap, { backgroundColor: pillar.iconBg }]}>
        <PillarIcon pillar={pillar} />
      </View>
      <View style={styles.copy}>
        <View style={styles.topLine}>
          <Text style={styles.name}>{pillar.title}</Text>
          <Text style={[styles.score, { color: pillar.scoreColor }]}>
            {pillar.score}
          </Text>
        </View>
        <Text style={styles.detail}>{pillar.detail}</Text>
        <View style={styles.track}>
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
        <Pressable accessibilityRole="button">
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
  score: {
    fontSize: NU.cardTitle,
    fontWeight: '800',
  },
  detail: {
    fontSize: NU.bodySm,
    color: HOME_DASH_MUTED,
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
