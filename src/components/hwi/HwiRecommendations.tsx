import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

import {
  HomeDumbbellIcon,
  HomeSunIcon,
} from '@/components/home/HomeDashboardIcons';
import {
  HOME_DASH_BORDER,
  HOME_DASH_LINK,
  HOME_DASH_TEAL,
  HWI_RECOMMENDATIONS,
  type HwiRecommendation,
} from '@/components/hwi/hwiDashboardData';
import { c, NU } from '@/utils/newUiCompact';

function RecIcon({ item }: { item: HwiRecommendation }) {
  const props = { color: item.iconColor, size: 19 };
  if (item.icon === 'sun') return <HomeSunIcon {...props} />;
  return <HomeDumbbellIcon {...props} />;
}

function Chevron() {
  return (
    <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
      <Path
        d="m9 6 6 6-6 6"
        stroke="#c2d4c6"
        strokeWidth={2.2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function RecommendationCard({ item }: { item: HwiRecommendation }) {
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => router.push('/(main)/(tabs)/check-in')}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}. ${item.body}`}
      accessibilityHint="Opens the daily check-in screen"
    >
      <View style={[styles.iconWrap, { backgroundColor: item.iconBg }]}>
        <RecIcon item={item} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.body}>{item.body}</Text>
      </View>
      <View style={styles.chevron}>
        <Chevron />
      </View>
    </Pressable>
  );
}

export function HwiRecommendations() {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.heading}>Recommendations</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View all recommendations"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.link}>View all</Text>
        </Pressable>
      </View>
      {HWI_RECOMMENDATIONS.map((item) => (
        <RecommendationCard key={item.id} item={item} />
      ))}
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
    padding: NU.cardPad,
    flexDirection: 'row',
    gap: NU.rowGap,
    alignItems: 'flex-start',
  },
  cardPressed: {
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
    gap: c(6, 4),
  },
  title: {
    fontSize: NU.cardTitle,
    fontWeight: '700',
    color: HOME_DASH_TEAL,
  },
  body: {
    fontSize: NU.body,
    lineHeight: c(20, 17),
    color: '#4c6b58',
  },
  chevron: {
    marginTop: c(11, 9),
  },
});
