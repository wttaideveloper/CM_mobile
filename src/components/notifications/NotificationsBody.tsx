import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  NotifAwardIcon,
  NotifBellEmptyIcon,
  NotifBookIcon,
  NotifDropIcon,
  NotifDumbbellIcon,
  NotifSunIcon,
  NotifTrendIcon,
} from '@/components/notifications/NotificationsIcons';
import {
  NOTIF_BODY,
  NOTIF_BORDER,
  NOTIF_CHIP_BORDER,
  NOTIF_FILTERS,
  NOTIF_GREEN,
  NOTIF_MUTED,
  NOTIF_TEAL,
  NOTIF_TIME,
  type NotifFilter,
  type NotifIconKind,
  type StaticNotification,
} from '@/components/notifications/notificationsData';
import { shadowSm } from '@/utils/shadows';
import { c, NU } from '@/utils/newUiCompact';

type NotificationsBodyProps = {
  filter: NotifFilter;
  onFilterChange: (filter: NotifFilter) => void;
  groups: { label: string; items: StaticNotification[] }[];
  /** @deprecated Local-only readIds; prefer mutating `item.unread` in parent. */
  readIds?: ReadonlySet<string>;
  onMarkRead?: (id: string) => void;
  onItemPress?: (item: StaticNotification) => void;
};

function NotifIcon({ kind, color }: { kind: NotifIconKind; color: string }) {
  switch (kind) {
    case 'sun':
      return <NotifSunIcon color={color} />;
    case 'dumbbell':
      return <NotifDumbbellIcon color={color} />;
    case 'award':
      return <NotifAwardIcon color={color} />;
    case 'book':
      return <NotifBookIcon color={color} />;
    case 'trend':
      return <NotifTrendIcon color={color} />;
    case 'drop':
      return <NotifDropIcon color={color} />;
  }
}

function NotificationRow({
  item,
  unread,
  onPress,
}: {
  item: StaticNotification;
  unread: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        unread && styles.rowUnread,
        pressed && styles.rowPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}${unread ? ', unread' : ''}. ${item.body}. ${item.time}.`}
      accessibilityHint={unread ? 'Double tap to mark as read' : undefined}
    >
      {unread ? <View style={styles.unreadAccent} /> : null}
      <View
        style={[styles.iconWrap, { backgroundColor: item.bg }]}
        importantForAccessibility="no-hide-descendants"
      >
        <NotifIcon kind={item.icon} color={item.color} />
      </View>
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          {unread ? (
            <View style={styles.newPill}>
              <Text style={styles.newPillText}>New</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.bodyText} numberOfLines={3}>
          {item.body}
        </Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
    </Pressable>
  );
}

export function NotificationsBody({
  filter,
  onFilterChange,
  groups,
  readIds,
  onMarkRead,
  onItemPress,
}: NotificationsBodyProps) {
  return (
    <View style={styles.body}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        style={styles.chipsScroll}
      >
        {NOTIF_FILTERS.map((item) => {
          const active = item === filter;
          return (
            <Pressable
              key={item}
              style={({ pressed }) => [
                styles.chip,
                active ? styles.chipActive : styles.chipIdle,
                pressed && styles.chipPressed,
              ]}
              onPress={() => onFilterChange(item)}
              accessibilityRole="button"
              accessibilityLabel={`Filter: ${item}`}
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {item}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {groups.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIconWrap}>
            <NotifBellEmptyIcon color={NOTIF_GREEN} size={32} />
          </View>
          <Text style={styles.emptyTitle}>
            {filter === 'Unread' ? 'You’re all caught up' : 'No notifications'}
          </Text>
          <Text style={styles.emptyBody}>
            {filter === 'Unread'
              ? 'New updates will show here when they arrive.'
              : filter === 'All'
                ? 'You’ll see your updates here when new activity arrives.'
                : 'Nothing in this filter right now. Try another category.'}
          </Text>
        </View>
      ) : (
        groups.map((group) => (
          <View key={group.label} style={styles.group}>
            <View style={styles.groupHeader}>
              <Text style={styles.groupLabel}>{group.label}</Text>
              <View style={styles.groupCount}>
                <Text style={styles.groupCountText}>{group.items.length}</Text>
              </View>
            </View>
            <View style={styles.stack}>
              {group.items.map((item) => {
                const unread =
                  item.unread && !(readIds?.has(item.id) ?? false);
                return (
                  <NotificationRow
                    key={item.id}
                    item={item}
                    unread={unread}
                    onPress={() => {
                      onItemPress?.(item);
                      if (unread) onMarkRead?.(item.id);
                    }}
                  />
                );
              })}
            </View>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingTop: NU.bodyPadTop,
    paddingBottom: NU.bodyPadBottom,
    gap: NU.sectionGap,
  },
  chipsScroll: {
    marginHorizontal: 0,
  },
  chips: {
    paddingHorizontal: NU.hPad,
    flexDirection: 'row',
    gap: c(8, 6),
    paddingBottom: c(2, 1),
  },
  chip: {
    paddingVertical: c(9, 7),
    paddingHorizontal: c(14, 12),
    borderRadius: 99,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: NOTIF_GREEN,
    borderColor: NOTIF_GREEN,
  },
  chipIdle: {
    backgroundColor: '#FFFFFF',
    borderColor: NOTIF_CHIP_BORDER,
  },
  chipPressed: {
    opacity: 0.85,
  },
  chipText: {
    fontSize: NU.chipFont,
    fontWeight: '700',
    color: NOTIF_BODY,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  group: {
    paddingHorizontal: NU.hPad,
    gap: c(10, 8),
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(8, 6),
  },
  groupLabel: {
    fontSize: NU.label,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: NOTIF_MUTED,
  },
  groupCount: {
    minWidth: c(20, 18),
    height: c(20, 18),
    paddingHorizontal: c(6, 5),
    borderRadius: 99,
    backgroundColor: '#e4f3e7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupCountText: {
    fontSize: c(11, 10),
    fontWeight: '800',
    color: NOTIF_GREEN,
  },
  stack: {
    gap: c(10, 8),
  },
  row: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: NOTIF_BORDER,
    borderRadius: NU.cardRadius,
    paddingVertical: c(14, 12),
    paddingHorizontal: c(14, 12),
    paddingLeft: c(14, 12),
    flexDirection: 'row',
    gap: c(12, 10),
    alignItems: 'flex-start',
    ...shadowSm,
  },
  rowUnread: {
    backgroundColor: '#fbfffc',
    borderColor: '#cfe8d4',
  },
  rowPressed: {
    backgroundColor: '#eef7ef',
  },
  unreadAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: NOTIF_GREEN,
  },
  iconWrap: {
    width: c(44, 40),
    height: c(44, 40),
    borderRadius: c(14, 12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: c(4, 3),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: c(8, 6),
  },
  title: {
    flex: 1,
    fontSize: NU.cardTitle,
    fontWeight: '800',
    color: NOTIF_TEAL,
    letterSpacing: -0.2,
  },
  newPill: {
    marginTop: c(1, 0),
    paddingHorizontal: c(8, 6),
    paddingVertical: c(3, 2),
    borderRadius: 99,
    backgroundColor: '#e6f4e8',
  },
  newPillText: {
    fontSize: c(10.5, 10),
    fontWeight: '800',
    letterSpacing: 0.3,
    color: NOTIF_GREEN,
    textTransform: 'uppercase',
  },
  bodyText: {
    fontSize: NU.body,
    lineHeight: c(20, 18),
    color: NOTIF_BODY,
  },
  time: {
    marginTop: c(2, 1),
    fontSize: NU.label,
    fontWeight: '600',
    color: NOTIF_TIME,
  },
  empty: {
    marginHorizontal: NU.hPad,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: NOTIF_BORDER,
    borderRadius: NU.cardRadius,
    paddingVertical: c(36, 30),
    paddingHorizontal: c(22, 18),
    alignItems: 'center',
    gap: c(8, 6),
    ...shadowSm,
  },
  emptyIconWrap: {
    width: c(64, 56),
    height: c(64, 56),
    borderRadius: 99,
    backgroundColor: '#e8f6eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: c(6, 4),
  },
  emptyTitle: {
    fontSize: NU.cardTitleLg,
    fontWeight: '800',
    color: NOTIF_TEAL,
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: NU.body,
    lineHeight: c(20, 18),
    color: NOTIF_BODY,
    textAlign: 'center',
    maxWidth: 280,
  },
});
