import { useCallback, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';

import {
  HomeBellOutlineIcon,
  HomeSettingsSunIcon,
  HomeTrendIcon,
} from '@/components/home/HomeDashboardIcons';
import {
  getHomeGreeting,
  HOME_DASH_TEAL,
} from '@/components/home/homeDashboardData';
import { HwiScoreRing } from '@/components/hwi/HwiScoreRing';
import { fetchNotificationUnreadCount } from '@/services/notification.service';
import { c, NU } from '@/utils/newUiCompact';

const headerDeco = require('../../assets/images/home-header-heart.png');
const { width: SCREEN_W } = Dimensions.get('window');
const DESIGN_W = 430;

type HomeDashboardHeaderProps = {
  displayName: string;
};

export function HomeDashboardHeader({ displayName }: HomeDashboardHeaderProps) {
  const router = useRouter();
  const [unread, setUnread] = useState(0);
  const scale = SCREEN_W / DESIGN_W;

  useFocusEffect(
    useCallback(() => {
      void fetchNotificationUnreadCount()
        .then((data) => setUnread(data.unread_count))
        .catch(() => {});
    }, []),
  );

  return (
    <View style={styles.header}>
      <Image
        source={headerDeco}
        style={{
          position: 'absolute',
          left: 220 * scale,
          bottom: -30,
          width: 210 * scale,
          height: 280 * scale,
        }}
        contentFit="contain"
        contentPosition="bottom right"
        pointerEvents="none"
        transition={0}
      />

      <View style={styles.topRow}>
        <View style={styles.greetingBlock}>
          <Text style={styles.greeting}>{getHomeGreeting()}</Text>
          <Text style={styles.name} numberOfLines={1}>
            {displayName}
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={styles.iconBtn}
            onPress={() => router.push('/(main)/notifications')}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <HomeBellOutlineIcon />
            {unread > 0 ? <View style={styles.dot} /> : null}
          </Pressable>
          <Pressable
            style={styles.iconBtn}
            onPress={() => router.push('/(main)/settings')}
            accessibilityRole="button"
            accessibilityLabel="Settings"
          >
            <HomeSettingsSunIcon />
          </Pressable>
        </View>
      </View>

      <View style={styles.hwiCard}>
        <HwiScoreRing
          score={86}
          size={c(76, 64)}
          strokeWidth={5}
          scoreFontSize={c(22, 18)}
        />
        <View style={styles.hwiCopy}>
          <View style={styles.trendRow}>
            <HomeTrendIcon color="#a1ffa7" size={16} />
            <Text style={styles.trendText}>+4 pts this week</Text>
          </View>
          <Text style={styles.hwiBody}>
            1 of 6 pillars logged today. Log Nutrition & Water to push your score
            higher.
          </Text>
          <Pressable
            style={styles.breakdownBtn}
            accessibilityRole="button"
            onPress={() => router.push('/(main)/(tabs)/hwi')}
          >
            <Text style={styles.breakdownText}>Full breakdown ›</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'rgb(37, 125, 63)',
    paddingHorizontal: NU.hPadHome,
    paddingTop: NU.headerPadTopHome,
    paddingBottom: NU.headerPadBottomHome,
    borderBottomLeftRadius: c(30, 26),
    borderBottomRightRadius: c(30, 26),
    overflow: 'hidden',
    position: 'relative',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: c(10, 8),
    zIndex: 1,
  },
  greetingBlock: {
    flex: 1,
    paddingRight: c(8, 6),
  },
  greeting: {
    fontSize: c(14, 13),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
  },
  name: {
    marginTop: 1,
    fontSize: NU.name,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(8, 6),
  },
  iconBtn: {
    width: NU.iconBtn,
    height: NU.iconBtn,
    borderRadius: NU.iconBtnRadius,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff7a45',
    borderWidth: 2,
    borderColor: 'rgb(37, 125, 63)',
  },
  hwiCard: {
    marginTop: NU.sectionGap,
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: c(18, 16),
    padding: NU.cardPad,
    flexDirection: 'row',
    gap: NU.rowGap,
    alignItems: 'center',
    zIndex: 1,
  },
  hwiCopy: {
    flex: 1,
    gap: c(6, 4),
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(6, 4),
  },
  trendText: {
    fontSize: c(14, 13),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  hwiBody: {
    fontSize: NU.bodySm,
    lineHeight: c(17, 15),
    color: 'rgba(255,255,255,0.88)',
  },
  breakdownBtn: {
    alignSelf: 'flex-start',
    marginTop: 2,
    paddingVertical: c(7, 5),
    paddingHorizontal: c(12, 10),
    borderRadius: 99,
    backgroundColor: HOME_DASH_TEAL,
  },
  breakdownText: {
    fontSize: NU.bodySm,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
