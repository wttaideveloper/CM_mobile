import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  TRAINING_GREEN,
  TRAINING_MUTED,
  TRAINING_TEAL,
} from '@/components/trainingsAndCourses/trainingData';
import { useTrainingAnnouncements } from '@/hooks/useTrainings';
import type { TrainingAnnouncementApiItem } from '@/types/training.types';
import { asPlainText } from '@/utils/trainingLessonMedia';
import { c, NU } from '@/utils/newUiCompact';

function formatAnnouncementDate(value?: string | null): string {
  const raw = asPlainText(value);
  if (!raw) return '';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function authorLabel(author?: string | null): string {
  const raw = asPlainText(author, 'Instructor');
  if (raw.includes('@')) {
    return raw.split('@')[0] || raw;
  }
  return raw;
}

function channelLabel(channel?: string | null): string {
  const raw = asPlainText(channel);
  if (!raw) return '';
  return raw
    .split(/[_-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function AnnouncementCard({ item }: { item: TrainingAnnouncementApiItem }) {
  const displayName = authorLabel(item.author);
  // Bug_61: show full title + body — no line clamp / short truncation.
  const title = asPlainText(item.title, 'Announcement');
  const message = asPlainText(item.message);
  const dateLabel = formatAnnouncementDate(item.sent_at);
  const channel = channelLabel(item.channel);
  const initial = (displayName.trim().charAt(0) || 'A').toUpperCase();

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.cardCopy}>
          <Text style={styles.author} numberOfLines={1}>
            {displayName}
          </Text>
          {dateLabel ? (
            <Text style={styles.dateMeta}>{dateLabel}</Text>
          ) : null}
        </View>
        {channel ? (
          <Text style={styles.channelPill} numberOfLines={1}>
            {channel}
          </Text>
        ) : null}
      </View>

      <Text style={styles.titleText} selectable>
        {title}
      </Text>
      {message ? (
        <Text style={styles.messageText} selectable>
          {message}
        </Text>
      ) : null}
    </View>
  );
}

export function TrainingAnnouncementsPanel({
  trainingId,
  enabled,
}: {
  trainingId: string;
  enabled: boolean;
}) {
  const announcementsQuery = useTrainingAnnouncements(
    enabled ? trainingId : undefined,
  );

  if (!enabled) return null;

  const announcements = announcementsQuery.announcements;
  const showEmpty =
    announcementsQuery.isSuccess && announcements.length === 0;
  const showError =
    announcementsQuery.isError &&
    !announcementsQuery.isFetching &&
    announcements.length === 0;

  return (
    <View style={styles.panel}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.label}>Announcements</Text>
          <Text style={styles.help}>
            Updates and notices from the training team
          </Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{announcements.length}</Text>
        </View>
      </View>

      {announcementsQuery.isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={TRAINING_GREEN} />
        </View>
      ) : null}

      {showError ? (
        <Pressable
          style={styles.retryWrap}
          onPress={() => {
            void announcementsQuery.refetch();
          }}
          accessibilityRole="button"
        >
          <Text style={styles.retryText}>
            Couldn’t load announcements · Tap to retry
          </Text>
        </Pressable>
      ) : null}

      {showEmpty ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No announcements yet</Text>
          <Text style={styles.emptyText}>
            Instructor notices for this training will show up here.
          </Text>
        </View>
      ) : null}

      {announcements.length > 0 ? (
        <View style={styles.list}>
          {announcements.map((item, index) => (
            <AnnouncementCard
              key={asPlainText(item.id) || `announcement-${index}`}
              item={item}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: c(12, 10),
    padding: c(14, 12),
    borderRadius: NU.cardRadius,
    backgroundColor: '#f4f7f8',
    borderWidth: 1,
    borderColor: '#d5e0e4',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: c(10, 8),
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    gap: c(3, 2),
  },
  label: {
    fontSize: c(16, 15),
    fontWeight: '800',
    color: TRAINING_TEAL,
    letterSpacing: -0.2,
  },
  help: {
    fontSize: c(12.5, 11.5),
    lineHeight: c(17, 15),
    color: TRAINING_MUTED,
    fontWeight: '500',
  },
  countBadge: {
    minWidth: c(28, 26),
    height: c(28, 26),
    paddingHorizontal: c(8, 6),
    borderRadius: 99,
    backgroundColor: '#e2eef2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeText: {
    fontSize: c(12, 11),
    fontWeight: '800',
    color: '#1f6f8b',
  },
  loadingWrap: {
    paddingVertical: c(16, 12),
    alignItems: 'center',
  },
  retryWrap: {
    paddingVertical: c(10, 8),
  },
  retryText: {
    fontSize: c(12.5, 11.5),
    fontWeight: '700',
    color: '#1f6f8b',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#d5e0e4',
    borderRadius: NU.cardRadius,
    paddingVertical: c(16, 14),
    paddingHorizontal: c(12, 10),
    gap: c(4, 3),
  },
  emptyTitle: {
    fontSize: c(13.5, 12.5),
    fontWeight: '800',
    color: TRAINING_TEAL,
  },
  emptyText: {
    fontSize: c(12.5, 11.5),
    color: TRAINING_MUTED,
    lineHeight: c(18, 16),
  },
  list: {
    gap: c(8, 6),
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#d5e0e4',
    borderRadius: NU.cardRadius,
    padding: c(12, 10),
    gap: c(8, 6),
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(8, 6),
  },
  avatar: {
    width: c(32, 30),
    height: c(32, 30),
    borderRadius: 99,
    backgroundColor: '#1f6f8b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: c(12, 11),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cardCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  author: {
    fontSize: c(13, 12),
    fontWeight: '700',
    color: TRAINING_TEAL,
  },
  dateMeta: {
    fontSize: c(11, 10),
    color: TRAINING_MUTED,
    fontWeight: '500',
  },
  channelPill: {
    fontSize: c(10.5, 9.5),
    fontWeight: '800',
    color: '#1f6f8b',
    backgroundColor: '#e2eef2',
    paddingHorizontal: c(7, 6),
    paddingVertical: c(3, 2),
    borderRadius: c(6, 5),
    overflow: 'hidden',
    maxWidth: c(96, 84),
  },
  titleText: {
    fontSize: c(14, 13),
    lineHeight: c(20, 18),
    fontWeight: '700',
    color: TRAINING_TEAL,
  },
  messageText: {
    fontSize: c(13, 12),
    lineHeight: c(19, 17),
    color: TRAINING_TEAL,
    fontWeight: '500',
  },
});
