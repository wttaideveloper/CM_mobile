import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  NotifAwardIcon,
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
import { c, NU } from '@/utils/newUiCompact';

type NotificationsBodyProps = {
  filter: NotifFilter;
  onFilterChange: (filter: NotifFilter) => void;
  groups: { label: string; items: StaticNotification[] }[];
  allRead: boolean;
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

export function NotificationsBody({
  filter,
  onFilterChange,
  groups,
  allRead,
}: NotificationsBodyProps) {
  return (
    <View style={styles.body}>
      <View style={styles.chips}>
        {NOTIF_FILTERS.map((item) => {
          const active = item === filter;
          return (
            <Pressable
              key={item}
              style={[styles.chip, active ? styles.chipActive : styles.chipIdle]}
              onPress={() => onFilterChange(item)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {groups.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No notifications</Text>
          <Text style={styles.emptyBody}>
            Nothing in this filter right now. Try another category.
          </Text>
        </View>
      ) : (
        groups.map((group) => (
          <View key={group.label} style={styles.group}>
            <Text style={styles.groupLabel}>{group.label}</Text>
            <View style={styles.card}>
              {group.items.map((item, index) => {
                const unread = item.unread && !allRead;
                return (
                  <View
                    key={item.id}
                    style={[
                      styles.row,
                      unread && styles.rowUnread,
                      index === group.items.length - 1 && styles.rowLast,
                    ]}
                  >
                    <View
                      style={[
                        styles.dot,
                        { backgroundColor: unread ? '#2f7d32' : 'transparent' },
                      ]}
                    />
                    <View style={[styles.iconWrap, { backgroundColor: item.bg }]}>
                      <NotifIcon kind={item.icon} color={item.color} />
                    </View>
                    <View style={styles.copy}>
                      <View style={styles.titleRow}>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.time}>{item.time}</Text>
                      </View>
                      <Text style={styles.bodyText}>{item.body}</Text>
                    </View>
                  </View>
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
    paddingHorizontal: NU.hPad,
    paddingTop: NU.bodyPadTop,
    paddingBottom: NU.bodyPadBottom,
    gap: NU.sectionGap,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: c(9, 7),
  },
  chip: {
    paddingVertical: NU.chipPadV,
    paddingHorizontal: NU.chipPadH,
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
  chipText: {
    fontSize: NU.chipFont,
    fontWeight: '600',
    color: NOTIF_BODY,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  group: {
    gap: c(10, 8),
  },
  groupLabel: {
    fontSize: NU.label,
    fontWeight: '800',
    letterSpacing: 1.3,
    color: NOTIF_MUTED,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: NOTIF_BORDER,
    borderRadius: NU.cardRadius,
    overflow: 'hidden',
  },
  row: {
    padding: NU.cardPad,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f6f0',
    flexDirection: 'row',
    gap: NU.cardGap,
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
  },
  rowUnread: {
    backgroundColor: '#fafffb',
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  dot: {
    width: 8,
    height: 8,
    marginTop: c(8, 6),
    borderRadius: c(4, 3),
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
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: c(10, 8),
  },
  title: {
    flex: 1,
    fontSize: NU.cardTitle,
    fontWeight: '700',
    color: NOTIF_TEAL,
  },
  time: {
    fontSize: NU.label,
    color: NOTIF_TIME,
  },
  bodyText: {
    marginTop: c(5, 4),
    fontSize: NU.body,
    lineHeight: c(19, 17),
    color: NOTIF_BODY,
  },
  empty: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: NOTIF_BORDER,
    borderRadius: NU.cardRadius,
    padding: c(22, 18),
    gap: c(6, 4),
  },
  emptyTitle: {
    fontSize: NU.cardTitleLg,
    fontWeight: '700',
    color: NOTIF_TEAL,
  },
  emptyBody: {
    fontSize: NU.body,
    lineHeight: c(19, 17),
    color: NOTIF_BODY,
  },
});
