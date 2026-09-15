import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { NotificationsBody } from '@/components/notifications/NotificationsBody';
import { NotificationsHeader } from '@/components/notifications/NotificationsHeader';
import {
  NOTIF_BG,
  NOTIF_GREEN,
  STATIC_NOTIFICATIONS,
  type NotifFilter,
} from '@/components/notifications/notificationsData';
import { useScrollToTopOnFocus } from '@/hooks/useScrollToTopOnFocus';

export function NotificationsDashScreen() {
  const scrollRef = useScrollToTopOnFocus();
  const [filter, setFilter] = useState<NotifFilter>('All');
  const [readIds, setReadIds] = useState<ReadonlySet<string>>(() => new Set());

  const unreadCount = STATIC_NOTIFICATIONS.filter(
    (n) => n.unread && !readIds.has(n.id),
  ).length;
  const unreadLabel = unreadCount === 0 ? 'All caught up' : `${unreadCount} unread`;

  const markAllRead = () => {
    setReadIds(new Set(STATIC_NOTIFICATIONS.map((n) => n.id)));
  };

  const markRead = (id: string) => {
    setReadIds((current) => {
      if (current.has(id)) return current;
      const next = new Set(current);
      next.add(id);
      return next;
    });
  };

  const groups = useMemo(() => {
    const filtered = STATIC_NOTIFICATIONS.filter(
      (n) => filter === 'All' || n.filter === filter,
    );
    return (['TODAY', 'YESTERDAY'] as const)
      .map((label) => ({
        label,
        items: filtered.filter((n) => n.group === label),
      }))
      .filter((g) => g.items.length > 0);
  }, [filter]);

  return (
    <View style={styles.screen}>
      <AppStatusBar variant="light" backgroundColor={NOTIF_GREEN} />
      <StatusBarFill lightColor={NOTIF_GREEN} darkColor={NOTIF_GREEN} />
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <NotificationsHeader
          unreadLabel={unreadLabel}
          onMarkAllRead={markAllRead}
          markAllDisabled={unreadCount === 0}
        />
        <NotificationsBody
          filter={filter}
          onFilterChange={setFilter}
          groups={groups}
          readIds={readIds}
          onMarkRead={markRead}
        />
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
  },
});
