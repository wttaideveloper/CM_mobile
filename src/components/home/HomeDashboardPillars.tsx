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
  HOME_PILLARS,
  type HomePillar,
} from '@/components/home/homeDashboardData';
import { c, NU } from '@/utils/newUiCompact';

function PillarIcon({ pillar }: { pillar: HomePillar }) {
  const props = { color: pillar.color, size: 16 };
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

function PillarCard({ pillar }: { pillar: HomePillar }) {
  return (
    <Pressable style={styles.card} accessibilityRole="button">
      <View style={[styles.iconWrap, { backgroundColor: pillar.iconBg }]}>
        <PillarIcon pillar={pillar} />
      </View>
      <Text style={styles.title}>{pillar.title}</Text>
      <Text style={[styles.score, { color: pillar.color }]}>{pillar.score}</Text>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${pillar.score}%`, backgroundColor: pillar.color },
          ]}
        />
      </View>
      <Text style={styles.detail}>{pillar.detail}</Text>
      <Text
        style={[
          styles.delta,
          { color: pillar.deltaPositive ? HOME_DASH_GREEN : '#d94848' },
        ]}
      >
        {pillar.delta}
      </Text>
    </Pressable>
  );
}

export function HomeDashboardPillars() {
  const router = useRouter();

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.heading}>Today&apos;s Pillars</Text>
        <Pressable
          onPress={() => router.push('/(main)/(tabs)/check-in')}
          accessibilityRole="button"
          accessibilityLabel="Open check-in"
        >
          <Text style={styles.link}>Details ›</Text>
        </Pressable>
      </View>
      <View style={styles.grid}>
        {HOME_PILLARS.map((pillar) => (
          <View key={pillar.id} style={styles.cell}>
            <PillarCard pillar={pillar} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: NU.groupGap,
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
    fontSize: NU.link,
    fontWeight: '600',
    color: HOME_DASH_LINK,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: NU.cardGap,
  },
  cell: {
    width: '31.5%',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: HOME_DASH_BORDER,
    borderRadius: NU.cardRadiusMd,
    padding: NU.cardPadXs,
    gap: c(8, 6),
  },
  iconWrap: {
    width: c(30, 26),
    height: c(30, 26),
    borderRadius: c(15, 13),
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: NU.eyebrow,
    fontWeight: '700',
    color: HOME_DASH_TEAL,
  },
  score: {
    fontSize: NU.name,
    fontWeight: '800',
    lineHeight: c(24, 20),
  },
  track: {
    height: 5,
    borderRadius: 99,
    backgroundColor: HOME_DASH_TRACK,
    overflow: 'hidden',
  },
  fill: {
    height: 5,
    borderRadius: 99,
  },
  detail: {
    fontSize: c(10, 9),
    color: HOME_DASH_MUTED,
  },
  delta: {
    fontSize: c(10, 9),
    fontWeight: '700',
  },
});
