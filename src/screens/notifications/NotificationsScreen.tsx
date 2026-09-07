import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  SectionList,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NotificationSkeletonList } from '@/components/ui/Skeleton.screens';
import { useScreenPrivacy } from '@/hooks/useScreenPrivacy';
import { styles } from '@/screens/notifications/NotificationsScreen.styles';
import {
  fetchMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/services/notification.service';
import type { NotificationListItem } from '@/utils/notification.mapper';
import {
  getNotificationTypeIcon,
  mapUserNotificationItems,
} from '@/utils/notification.mapper';
import { chatHref } from '@/utils/chatNavigation';
import { isSmallDevice } from '@/utils/responsive';

const ITEM_GAP = isSmallDevice ? 8 : 10;
const SECTION_GAP = isSmallDevice ? 14 : 18;

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
      accessibilityRole="button"
      accessibilityLabel={`${item.title}${!item.read ? ', unread' : ''}`}
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
  useScreenPrivacy('notifications');
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetchMyNotifications({ page: 1, page_size: 20 });
      setNotifications(mapUserNotificationItems(response.items));
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message: string }).message)
          : 'Could not load notifications.';

      setErrorMessage(message);

      if (__DEV__) {
        console.error('[NOTIFICATIONS] List API ← failed', error);
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

  const sections = useMemo(() => {
    const next: { title: string; data: NotificationListItem[] }[] = [];
    if (newNotifications.length > 0) {
      next.push({ title: 'NEW', data: newNotifications });
    }
    if (earlierNotifications.length > 0) {
      next.push({ title: 'EARLIER', data: earlierNotifications });
    }
    return next;
  }, [earlierNotifications, newNotifications]);

  const markAllRead = useCallback(async () => {
    const previous = notifications;
    setNotifications((items) => items.map((item) => ({ ...item, read: true })));

    try {
      await markAllNotificationsRead();
    } catch (error) {
      setNotifications(previous);
      if (__DEV__) {
        console.error('[NOTIFICATIONS] Mark all read API ← failed', error);
      }
    }
  }, [notifications]);

  const handleNotificationPress = useCallback(
    (item: NotificationListItem) => {
      const wasUnread = !item.read;
      // Path is /users/me/notifications/{notification_id}/read — use inbox row `id`
      // (list resource). `notificationId` is kept on the model if backend needs that field instead.
      const markReadId = item.id;

      if (wasUnread) {
        setNotifications((items) =>
          items.map((entry) => (entry.id === item.id ? { ...entry, read: true } : entry)),
        );
      }

      // Always mark read on tap so PUT .../notifications/{notification_id}/read is sent
      // (previously skipped when is_read was already true — so it never appeared in Network).
      void markNotificationRead(markReadId).catch((error) => {
        if (wasUnread) {
          setNotifications((items) =>
            items.map((entry) =>
              entry.id === item.id ? { ...entry, read: false } : entry,
            ),
          );
        }
        if (__DEV__) {
          console.error('[NOTIFICATIONS] Mark read API ← failed', {
            markReadId,
            error,
          });
        }
      });

      if (item.conversationId) {
        router.push(chatHref(item.conversationId));
        return;
      }

      if (__DEV__) {
        console.log('[NOTIFICATIONS] Tapped notification without chat route', item);
      }
    },
    [router],
  );

  return (
    <View style={styles.screen}>
      <AppStatusBar />
      <StatusBarFill />

      <View style={[styles.header, { paddingTop: 12 }]}>
        <Text style={styles.title}>Notifications</Text>
        <Pressable
          onPress={() => void markAllRead()}
          accessibilityRole="button"
          accessibilityLabel="Mark all read"
          style={({ pressed }) => [styles.markAllReadBtn, pressed && styles.pressed]}
          hitSlop={8}
        >
          <Text style={styles.markAllReadText}>Mark all read</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <NotificationSkeletonList />
      ) : errorMessage ? (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <Pressable
            onPress={() => void loadNotifications()}
            accessibilityRole="button"
            accessibilityLabel="Retry"
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
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          style={styles.listScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + (isSmallDevice ? 20 : 24) },
          ]}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => <SectionHeader label={section.title} />}
          renderItem={({ item }) => (
            <NotificationCard
              item={item}
              onPress={() => handleNotificationPress(item)}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: ITEM_GAP }} />}
          SectionSeparatorComponent={() => <View style={{ height: SECTION_GAP }} />}
        />
      )}
    </View>
  );
}
