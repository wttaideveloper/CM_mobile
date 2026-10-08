import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { NotificationsBody } from '@/components/notifications/NotificationsBody';
import { NotificationsHeader } from '@/components/notifications/NotificationsHeader';
import {
  NOTIF_BG,
  NOTIF_BODY,
  NOTIF_BORDER,
  NOTIF_GREEN,
  NOTIF_MUTED,
  NOTIF_TEAL,
  type NotifFilter,
  type NotifGroupLabel,
  type StaticNotification,
} from '@/components/notifications/notificationsData';
import { useScrollToTopOnFocus } from '@/hooks/useScrollToTopOnFocus';
import {
  fetchMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/services/notification.service';
import { chatHref } from '@/utils/chatNavigation';
import { mapUserNotificationsToDashItems } from '@/utils/notification.mapper';
import { resolveNotificationHref } from '@/utils/notificationNavigation';
import { c, NU } from '@/utils/newUiCompact';

const GROUP_ORDER: NotifGroupLabel[] = ['TODAY', 'YESTERDAY', 'EARLIER'];
const LOADING_MIN_HEIGHT = Math.max(
  Dimensions.get('window').height * 0.52,
  320,
);

export function NotificationsDashScreen() {
  const router = useRouter();
  const scrollRef = useScrollToTopOnFocus();
  const [filter, setFilter] = useState<NotifFilter>('All');
  const [items, setItems] = useState<StaticNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadNotifications = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'initial') setIsLoading(true);
    if (mode === 'refresh') setIsRefreshing(true);
    setErrorMessage(null);

    try {
      const response = await fetchMyNotifications({ page: 1, page_size: 50 });
      setItems(mapUserNotificationsToDashItems(response.items ?? []));
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
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadNotifications('initial');
    }, [loadNotifications]),
  );

  const unreadCount = useMemo(
    () => items.filter((item) => item.unread).length,
    [items],
  );
  const unreadLabel =
    unreadCount === 0 ? 'All caught up' : `${unreadCount} unread`;

  const markAllRead = useCallback(async () => {
    if (unreadCount === 0) return;
    const previous = items;
    setItems((current) => current.map((item) => ({ ...item, unread: false })));

    try {
      await markAllNotificationsRead();
    } catch (error) {
      setItems(previous);
      if (__DEV__) {
        console.error('[NOTIFICATIONS] Mark all read API ← failed', error);
      }
    }
  }, [items, unreadCount]);

  const handleItemPress = useCallback(
    (item: StaticNotification) => {
      const wasUnread = item.unread;
      const markReadId = item.id;

      if (wasUnread) {
        setItems((current) =>
          current.map((row) =>
            row.id === item.id ? { ...row, unread: false } : row,
          ),
        );
      }

      void markNotificationRead(markReadId).catch((error) => {
        if (wasUnread) {
          setItems((current) =>
            current.map((row) =>
              row.id === item.id ? { ...row, unread: true } : row,
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

      const href = resolveNotificationHref({
        category: item.category || item.notificationType,
        trainingId: item.trainingId,
        enrolmentId: item.enrolmentId,
        status: item.status,
        announcementId: item.announcementId,
        discussionId: item.discussionId,
        certificateUrl: item.certificateUrl,
        conversationId: item.conversationId,
      });

      if (href) {
        router.push(href);
        return;
      }

      // Legacy chat-only fallback.
      if (item.conversationId) {
        router.push(chatHref(item.conversationId));
      }
    },
    [router],
  );

  const groups = useMemo(() => {
    const filtered = items.filter((item) => {
      if (filter === 'All') return true;
      if (filter === 'Unread') return item.unread;
      return item.filter === filter;
    });

    return GROUP_ORDER.map((label) => ({
      label,
      items: filtered.filter((item) => item.group === label),
    })).filter((group) => group.items.length > 0);
  }, [filter, items]);

  return (
    <View style={styles.screen}>
      <AppStatusBar variant="light" backgroundColor={NOTIF_GREEN} />
      <StatusBarFill lightColor={NOTIF_GREEN} darkColor={NOTIF_GREEN} />
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              void loadNotifications('refresh');
            }}
            tintColor={NOTIF_GREEN}
          />
        }
      >
        <NotificationsHeader
          unreadLabel={unreadLabel}
          onMarkAllRead={() => {
            void markAllRead();
          }}
          markAllDisabled={unreadCount === 0 || isLoading}
        />

        {isLoading ? (
          <View style={styles.loadingCenter} accessibilityLabel="Loading notifications">
            <View style={styles.spinnerRing}>
              <ActivityIndicator size="large" color={NOTIF_GREEN} />
            </View>
            <Text style={styles.loadingTitle}>Loading notifications</Text>
            <Text style={styles.loadingHint}>Just a moment…</Text>
          </View>
        ) : errorMessage ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateTitle}>Unable to load notifications</Text>
            <Text style={styles.stateText}>{errorMessage}</Text>
            <Pressable
              onPress={() => {
                void loadNotifications('initial');
              }}
              accessibilityRole="button"
            >
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : (
          <NotificationsBody
            filter={filter}
            onFilterChange={setFilter}
            groups={groups}
            onItemPress={handleItemPress}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: NOTIF_BG,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 12,
    flexGrow: 1,
  },
  loadingCenter: {
    minHeight: LOADING_MIN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: NU.hPad,
    gap: c(10, 8),
  },
  spinnerRing: {
    width: c(72, 64),
    height: c(72, 64),
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: NOTIF_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: c(4, 2),
    shadowColor: '#164744',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  loadingTitle: {
    fontSize: NU.cardTitle,
    fontWeight: '800',
    color: NOTIF_TEAL,
    textAlign: 'center',
  },
  loadingHint: {
    fontSize: NU.bodySm,
    color: NOTIF_MUTED,
    textAlign: 'center',
  },
  stateBox: {
    marginHorizontal: NU.hPad,
    marginTop: NU.bodyPadTop,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: NOTIF_BORDER,
    borderRadius: NU.cardRadius,
    paddingVertical: c(32, 26),
    paddingHorizontal: c(22, 18),
    gap: c(10, 8),
    alignItems: 'center',
  },
  stateTitle: {
    fontSize: NU.cardTitleLg,
    fontWeight: '800',
    color: NOTIF_TEAL,
    textAlign: 'center',
  },
  stateText: {
    fontSize: NU.body,
    lineHeight: c(20, 18),
    color: NOTIF_BODY,
    textAlign: 'center',
  },
  retryText: {
    marginTop: c(4, 2),
    paddingVertical: c(10, 8),
    paddingHorizontal: c(16, 14),
    borderRadius: 99,
    overflow: 'hidden',
    backgroundColor: '#e6f4e8',
    fontSize: NU.link,
    fontWeight: '800',
    color: NOTIF_GREEN,
  },
});
