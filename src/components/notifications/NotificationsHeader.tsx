import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { NotifCheckIcon } from '@/components/notifications/NotificationsIcons';
import { NOTIF_GREEN } from '@/components/notifications/notificationsData';
import { MarketBackIcon } from '@/components/market/MarketIcons';
import { c, NU } from '@/utils/newUiCompact';

const headerDeco = require('../../assets/images/market-header-deco.png');
const { width: SCREEN_W } = Dimensions.get('window');
const DESIGN_W = 430;

type NotificationsHeaderProps = {
  unreadLabel: string;
  onMarkAllRead: () => void;
  markAllDisabled?: boolean;
};

export function NotificationsHeader({
  unreadLabel,
  onMarkAllRead,
  markAllDisabled,
}: NotificationsHeaderProps) {
  const router = useRouter();
  const scale = SCREEN_W / DESIGN_W;

  return (
    <View style={styles.header}>
      <Image
        source={headerDeco}
        style={{
          position: 'absolute',
          left: 0,
          top: -32.5 * scale,
          width: SCREEN_W,
          height: 360 * scale,
        }}
        contentFit="cover"
        pointerEvents="none"
        transition={0}
      />
      <View style={styles.topRow}>
        <Pressable
          style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
          onPress={() => router.back()}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          accessibilityRole="button"
          accessibilityLabel="Back"
          accessibilityHint="Returns to the previous screen"
        >
          <MarketBackIcon />
        </Pressable>
        <View style={styles.titleBlock}>
          <Text style={styles.title} accessibilityRole="header">
            Notifications
          </Text>
          <Text style={styles.subtitle} accessibilityLiveRegion="polite">
            {unreadLabel}
          </Text>
        </View>
        <Pressable
          disabled={markAllDisabled}
          style={({ pressed }) => [
            styles.markAll,
            markAllDisabled && styles.markAllDisabled,
            pressed && !markAllDisabled && styles.markAllPressed,
          ]}
          onPress={onMarkAllRead}
          accessibilityRole="button"
          accessibilityLabel="Mark all read"
          accessibilityState={{ disabled: !!markAllDisabled }}
          accessibilityHint={markAllDisabled ? undefined : 'Marks every notification as read'}
        >
          <NotifCheckIcon />
          <Text style={styles.markAllText}>Mark all read</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: NOTIF_GREEN,
    paddingHorizontal: NU.hPad,
    paddingTop: NU.headerPadTop,
    paddingBottom: NU.headerPadBottomTall,
    borderBottomLeftRadius: c(30, 26),
    borderBottomRightRadius: c(30, 26),
    overflow: 'hidden',
    position: 'relative',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: NU.rowGap,
    zIndex: 1,
  },
  iconBtn: {
    width: NU.iconBtn,
    height: NU.iconBtn,
    borderRadius: NU.iconBtnRadius,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnPressed: {
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    fontSize: NU.title,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: c(2, 2),
    fontSize: NU.subtitle,
    color: 'rgba(255,255,255,0.85)',
  },
  markAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(7, 5),
    paddingVertical: c(10, 8),
    paddingHorizontal: c(15, 12),
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  markAllText: {
    fontSize: NU.chipFont,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  markAllPressed: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  markAllDisabled: {
    opacity: 0.5,
  },
});
