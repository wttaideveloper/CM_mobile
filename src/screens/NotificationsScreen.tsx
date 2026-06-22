import { AppStatusBar, useStatusBarBackground } from '@/components/AppStatusBar';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BellIcon,
  BookOpenIcon,
  CircleCheckIcon,
  LucideStarIcon,
  PackageIcon,
} from '@/components/dashboard/DashboardIcons';
import {
  NOTIFICATIONS,
  type Notification,
  type NotificationType,
} from '@/constants/notifications';
import { isSmallDevice } from '@/utils/responsive';
const PRIMARY = '#1F5D4E';
const MINT = '#EAF4EC';
const BODY_BG = '#F5F7F5';
const TEXT_MUTED = '#5a7a70';
const TEXT_BLACK = '#111111';
const H_PAD = 20;

const EMERALD_50 = '#ecfdf5';

const ICON_CONFIG: Record<
  NotificationType,
  { iconBg: string; iconColor: string }
> = {
  booking: { iconBg: EMERALD_50, iconColor: PRIMARY },
  product: { iconBg: '#F3EEFB', iconColor: '#7C5CBF' },
  event: { iconBg: '#FFF7ED', iconColor: '#D97706' },
  review: { iconBg: '#FEF3C7', iconColor: '#F59E0B' },
  course: { iconBg: '#EFF6FF', iconColor: '#1D4ED8' },
};

function NotificationIcon({ type }: { type: NotificationType }) {
  const { iconBg, iconColor } = ICON_CONFIG[type];

  return (
    <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
      {type === 'booking' && <CircleCheckIcon size={18} color={iconColor} />}
      {type === 'product' && <PackageIcon size={18} color={iconColor} />}
      {type === 'event' && <BellIcon size={18} color={iconColor} />}
      {type === 'review' && <LucideStarIcon size={15} color={iconColor} />}
      {type === 'course' && <BookOpenIcon size={18} color={iconColor} />}
    </View>
  );
}

function NotificationRow({ item }: { item: Notification }) {
  return (
    <View
      style={[
        styles.notificationRow,
        !item.read && styles.notificationRowUnread,
      ]}
    >
      <NotificationIcon type={item.type} />
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationDescription}>{item.description}</Text>
        <Text style={styles.notificationTime}>{item.timestamp}</Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </View>
  );
}

export function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const statusBarFill = useStatusBarBackground();
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications((items) =>
      items.map((item) => ({ ...item, read: true })),
    );
  };

  return (
    <View style={styles.screen}>
      <AppStatusBar />

      <View style={[styles.statusBarFill, { height: insets.top, backgroundColor: statusBarFill }]} />

      <View style={[styles.header, { paddingTop: 12 }]}>
        <Text style={styles.title}>Notifications</Text>
        <Pressable onPress={markAllRead} hitSlop={8}>
          <Text style={styles.markAllRead}>Mark all read</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.listScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
      >
        {notifications.map((item) => (
          <NotificationRow key={item.id} item={item} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  statusBarFill: {
    backgroundColor: BODY_BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: H_PAD,
    marginBottom: isSmallDevice ? 6 :  8,
  },
  title: {
    fontSize: isSmallDevice ? 20 : 22,
    lineHeight: 32,
    fontWeight: '800',
    color: TEXT_BLACK,
  },
  markAllRead: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: 20,
    fontWeight: '600',
    color: PRIMARY,
  },
  listScroll: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  listContent: {
    paddingTop: isSmallDevice ? 6 :  8,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: isSmallDevice ? 10 :  12,
    paddingHorizontal: H_PAD,
    paddingVertical: isSmallDevice ? 12 :  16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.8,
    borderBottomColor: '#E8EDEA',
  },
  notificationRowUnread: {
    backgroundColor: MINT,
  },
  iconWrap: {
    width: isSmallDevice ? 40 :     44,
    height: isSmallDevice ? 40 : 44,
    borderRadius: isSmallDevice ? 16 :  18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  notificationContent: {
    flex: 1,
    minWidth: 0,
  },
  notificationTitle: {
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 20,
    fontWeight: '700',
    color: TEXT_BLACK,
    marginBottom: isSmallDevice ? 3 :  4,
  },
  notificationDescription: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: 18,
    fontWeight: '400',
    color: TEXT_MUTED,
    marginBottom: isSmallDevice ? 4 :  6,
  },
  notificationTime: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: 16,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  unreadDot: {
    width: isSmallDevice ? 6 : 8,
    height: isSmallDevice ? 6 : 8,
    borderRadius: isSmallDevice ? 3 : 4,
    backgroundColor: PRIMARY,
    marginTop: isSmallDevice ? 4 :  6,
    flexShrink: 0,
  },
});
