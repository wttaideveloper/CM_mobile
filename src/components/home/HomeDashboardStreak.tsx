import { StyleSheet, Text, View } from 'react-native';

import { HomeFlameIcon } from '@/components/home/HomeDashboardIcons';
import {
  HOME_DASH_GREEN,
  HOME_DASH_TEAL,
  HOME_STREAK_DAYS,
} from '@/components/home/homeDashboardData';
import { c, NU } from '@/utils/newUiCompact';

export function HomeDashboardStreak() {
  return (
    <View
      style={styles.card}
      accessibilityRole="text"
      accessibilityLabel="Active streak: 80 days. Weekly progress: Monday through Sunday logged."
    >
      <View style={styles.blob} />
      <View style={styles.iconWrap}>
        <HomeFlameIcon color={HOME_DASH_GREEN} size={20} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>80 Days Streak</Text>
        <Text style={styles.subtitle}>Keep it up — you’re on a roll!</Text>
        <View style={styles.days}>
          {HOME_STREAK_DAYS.map((day, index) => {
            const isToday = index === HOME_STREAK_DAYS.length - 1;
            return (
              <View
                key={`${day}-${index}`}
                style={[styles.day, isToday && styles.dayToday]}
                accessibilityElementsHidden
                importantForAccessibility="no"
              >
                <Text style={[styles.dayText, isToday && styles.dayTextToday]}>
                  {day}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: HOME_DASH_GREEN,
    borderRadius: NU.cardRadius,
    paddingVertical: NU.cardPad,
    paddingHorizontal: NU.cardPad,
    flexDirection: 'row',
    gap: NU.cardGap,
    overflow: 'hidden',
    position: 'relative',
  },
  blob: {
    position: 'absolute',
    right: -50,
    top: 0,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: HOME_DASH_TEAL,
    opacity: 0.5,
  },
  iconWrap: {
    width: NU.iconBtn,
    height: NU.iconBtn,
    borderRadius: NU.cardRadiusSm,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  content: {
    flex: 1,
    gap: c(10, 8),
    zIndex: 1,
  },
  title: {
    fontSize: NU.cardTitleXl,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subtitle: {
    marginTop: 2,
    fontSize: NU.bodySm,
    color: 'rgba(255,255,255,0.85)',
  },
  days: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: c(4, 2),
  },
  day: {
    width: c(30, 26),
    height: c(30, 26),
    borderRadius: c(15, 13),
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayToday: {
    backgroundColor: '#FFFFFF',
  },
  dayText: {
    fontSize: NU.eyebrow,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  dayTextToday: {
    color: '#07473e',
    fontWeight: '700',
  },
});
