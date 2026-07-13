import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fetchNotificationHistory } from '@/services/notification.service';
import type { NotificationListItem } from '@/utils/notification.mapper';
import {
  getNotificationTypeIcon,
  mapNotificationHistoryItems,
} from '@/utils/notification.mapper';
import { chatHref } from '@/utils/chatNavigation';
import { shadowSm } from '@/utils/shadows';
import { isSmallDevice } from '@/utils/responsive';

const PRIMARY = '#1F5D4E';
const PAGE_BG = '#FFFFFF';
const BODY_BG = '#F7F8F9';
const TEXT_MUTED = '#9CA3AF';
const TEXT_DESC = '#6B7280';
const TEXT_BLACK = '#111111';
const MARK_READ_BG = '#F0FDF4';
const H_PAD = isSmallDevice ? 16 : 20;
const ICON_SIZE = isSmallDevice ? 40 : 44;
const ICON_RADIUS = isSmallDevice ? 12 : 14;

function NotificationIcon({ notificationType }: { notificationType: string }) {
  const config = getNotificationTypeIcon(notificationType);

  return (
    <View style={[styles.iconWrap, { backgroundColor: config.backgroundColor }]}>
      <Text style={styles.iconEmoji}>{config.emoji}</Text>
    </View>
  );
}

function NotificationCard({
  item,
  onPress,
}: {
  item: NotificationListItem;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.notificationCard, pressed && styles.pressed]}
    >
      <NotificationIcon notificationType={item.notificationType} />
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.notificationTime}>{item.timestamp}</Text>
      </View>
      {!item.read ? <View style={styles.unreadDot} /> : null}
    </Pressable>
  );
}

function SectionHeader({ label }: { label: string }) {
  return <Text style={styles.sectionHeader}>{label}</Text>;
}

export function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetchNotificationHistory({ page: 1, page_size: 20 });
      setNotifications(mapNotificationHistoryItems(response.items));
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message: string }).message)
          : 'Could not load notifications.';

      setErrorMessage(message);

      if (__DEV__) {
        console.error('[NOTIFICATIONS] History API ← failed', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const newNotifications = useMemo(
    () => notifications.filter((item) => !item.read),
    [notifications],
  );
  const earlierNotifications = useMemo(
    () => notifications.filter((item) => item.read),
    [notifications],
  );

  const markAllRead = () => {
    setNotifications((items) => items.map((item) => ({ ...item, read: true })));
  };

  const handleNotificationPress = (item: NotificationListItem) => {
    setNotifications((items) =>
      items.map((entry) => (entry.id === item.id ? { ...entry, read: true } : entry)),
    );

    if (item.notificationType === 'chat_message' && item.conversationId) {
      router.push(
        chatHref(item.conversationId, {
          title: item.title,
        }),
      );
      return;
    }

    if (__DEV__) {
      console.log('[NOTIFICATIONS] Tapped notification without chat route', item);
    }
  };

  return (
    <View style={styles.screen}>
      <AppStatusBar />
      <StatusBarFill />

      <View style={[styles.header, { paddingTop: 12 }]}>
        <Text style={styles.title}>Notifications</Text>
        <Pressable
          onPress={markAllRead}
          style={({ pressed }) => [styles.markAllReadBtn, pressed && styles.pressed]}
          hitSlop={8}
        >
          <Text style={styles.markAllReadText}>Mark all read</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="small" color={PRIMARY} />
        </View>
      ) : errorMessage ? (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <Pressable
            onPress={() => void loadNotifications()}
            style={({ pressed }) => [styles.retryBtn, pressed && styles.pressed]}
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.centerState}>
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.listScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + (isSmallDevice ? 20 : 24) },
          ]}
        >
          {newNotifications.length > 0 ? (
            <>
              <SectionHeader label="NEW" />
              <View style={styles.sectionList}>
                {newNotifications.map((item) => (
                  <NotificationCard
                    key={item.id}
                    item={item}
                    onPress={() => handleNotificationPress(item)}
                  />
                ))}
              </View>
            </>
          ) : null}

          {earlierNotifications.length > 0 ? (
            <>
              <SectionHeader label="EARLIER" />
              <View style={styles.sectionList}>
                {earlierNotifications.map((item) => (
                  <NotificationCard
                    key={item.id}
                    item={item}
                    onPress={() => handleNotificationPress(item)}
                  />
                ))}
              </View>
            </>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  statusBarFill: {
    backgroundColor: PAGE_BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: H_PAD,
    paddingBottom: isSmallDevice ? 12 : 14,
    backgroundColor: PAGE_BG,
    marginBottom: isSmallDevice ? 6 : 8,
  },
  title: {
    fontSize: isSmallDevice ? 20 : 22,
    lineHeight: isSmallDevice ? 26 : 28,
    fontWeight: '800',
    color: TEXT_BLACK,
  },
  markAllReadBtn: {
    backgroundColor: MARK_READ_BG,
    paddingHorizontal: isSmallDevice ? 12 : 14,
    paddingVertical: isSmallDevice ? 6 : 8,
    borderRadius: isSmallDevice ? 16 : 20,
  },
  markAllReadText: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: isSmallDevice ? 14 : 16,
    fontWeight: '700',
    color: PRIMARY,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: H_PAD,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: TEXT_DESC,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 14,
    color: TEXT_DESC,
    fontWeight: '500',
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: MARK_READ_BG,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  retryText: {
    fontSize: 13,
    fontWeight: '700',
    color: PRIMARY,
  },
  listScroll: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  listContent: {
    paddingHorizontal: H_PAD,
  },
  sectionHeader: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: isSmallDevice ? 12 : 14,
    fontWeight: '700',
    color: TEXT_MUTED,
    letterSpacing: 0.8,
    marginBottom: isSmallDevice ? 8 : 10,
  },
  sectionList: {
    gap: isSmallDevice ? 8 : 10,
    marginBottom: isSmallDevice ? 14 : 18,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: isSmallDevice ? 10 : 12,
    padding: isSmallDevice ? 10 : 14,
    backgroundColor: PAGE_BG,
    borderRadius: isSmallDevice ? 14 : 16,
    position: 'relative',
    ...shadowSm,
  },
  iconWrap: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconEmoji: {
    fontSize: isSmallDevice ? 16 : 18,
  },
  notificationContent: {
    flex: 1,
    minWidth: 0,
    paddingRight: isSmallDevice ? 10 : 12,
  },
  notificationTitle: {
    fontSize: isSmallDevice ? 13 : 15,
    lineHeight: isSmallDevice ? 18 : 20,
    fontWeight: '800',
    color: TEXT_BLACK,
    marginBottom: isSmallDevice ? 2 : 4,
  },
  notificationDescription: {
    fontSize: isSmallDevice ? 12 : 14,
    lineHeight: isSmallDevice ? 18 : 20,
    fontWeight: '400',
    color: TEXT_DESC,
    marginBottom: isSmallDevice ? 4 : 6,
  },
  notificationTime: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: isSmallDevice ? 14 : 16,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  unreadDot: {
    position: 'absolute',
    top: isSmallDevice ? 10 : 14,
    right: isSmallDevice ? 10 : 14,
    width: isSmallDevice ? 7 : 8,
    height: isSmallDevice ? 7 : 8,
    borderRadius: isSmallDevice ? 3.5 : 4,
    backgroundColor: PRIMARY,
  },
  pressed: {
    opacity: 0.9,
  },
});
