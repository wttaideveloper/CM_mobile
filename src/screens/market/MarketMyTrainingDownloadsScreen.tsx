import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

import { TrainingStickyVideoPlayer } from '@/components/market/TrainingStickyVideoPlayer';
import {
  TRAINING_BORDER,
  TRAINING_GREEN,
  TRAINING_MUTED,
  TRAINING_TEAL,
  TRAINING_TRACK,
} from '@/components/market/marketTrainingData';
import { MarketTrainingScreenShell } from '@/screens/market/MarketTrainingScreenShell';
import {
  useTrainingDownloadsStore,
  type TrainingDownloadItem,
} from '@/stores/trainingDownloads.store';
import { openLocalTrainingDownload } from '@/utils/downloadTrainingFile';
import { c, NU } from '@/utils/newUiCompact';

function TrashGlyph({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 7h16"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M10 11v6M14 11v6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function formatDownloadedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Saved';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function MarketMyTrainingDownloadsScreen() {
  const router = useRouter();
  const hydrate = useTrainingDownloadsStore((s) => s.hydrate);
  const items = useTrainingDownloadsStore((s) => s.items);
  const hydrated = useTrainingDownloadsStore((s) => s.hydrated);
  const remove = useTrainingDownloadsStore((s) => s.remove);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const videoPlaylist = useMemo(
    () => items.filter((item) => item.kind === 'video'),
    [items],
  );

  const activeVideo = useMemo(
    () => videoPlaylist.find((item) => item.id === activeVideoId) ?? null,
    [activeVideoId, videoPlaylist],
  );

  const activeVideoIndex = useMemo(() => {
    if (!activeVideoId) return -1;
    return videoPlaylist.findIndex((item) => item.id === activeVideoId);
  }, [activeVideoId, videoPlaylist]);

  const grouped = useMemo(() => {
    const map = new Map<
      string,
      { title: string; items: TrainingDownloadItem[] }
    >();
    for (const item of items) {
      const existing = map.get(item.trainingId);
      if (existing) {
        existing.items.push(item);
      } else {
        map.set(item.trainingId, {
          title: item.trainingTitle,
          items: [item],
        });
      }
    }
    return Array.from(map.entries());
  }, [items]);

  useEffect(() => {
    if (activeVideoId && !items.some((item) => item.id === activeVideoId)) {
      setActiveVideoId(null);
    }
  }, [activeVideoId, items]);

  const onOpen = (item: TrainingDownloadItem) => {
    if (item.kind === 'video') {
      setActiveVideoId(item.id);
      return;
    }

    setOpeningId(item.id);
    void openLocalTrainingDownload({
      localUri: item.localUri,
      fileName: item.fileName,
    }).finally(() => setOpeningId(null));
  };

  const goAdjacentVideo = (delta: number) => {
    const next = videoPlaylist[activeVideoIndex + delta];
    if (!next) return;
    setActiveVideoId(next.id);
  };

  const onRemove = (item: TrainingDownloadItem) => {
    Alert.alert(
      'Remove download',
      `Remove “${item.lessonTitle}” from Downloads?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            if (activeVideoId === item.id) setActiveVideoId(null);
            void remove(item.id);
          },
        },
      ],
    );
  };

  return (
    <MarketTrainingScreenShell
      eyebrow="My Trainings"
      title="Downloads"
      flatBottom
      stickyBelowHeader={
        activeVideo ? (
          <TrainingStickyVideoPlayer
            url={activeVideo.localUri}
            title={activeVideo.lessonTitle}
            subtitle={activeVideo.trainingTitle}
            requiresAuth={false}
            hasPrevious={activeVideoIndex > 0}
            hasNext={
              activeVideoIndex >= 0 &&
              activeVideoIndex < videoPlaylist.length - 1
            }
            onPrevious={() => goAdjacentVideo(-1)}
            onNext={() => goAdjacentVideo(1)}
            onClose={() => setActiveVideoId(null)}
          />
        ) : null
      }
    >
      <View style={styles.page}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Your offline files</Text>
          <Text style={styles.heroHelp}>
            Saved inside the app only. Tap a video to play it here like My
            Learning.
          </Text>
          {hydrated && items.length > 0 ? (
            <Text style={styles.heroCount}>
              {items.length} saved file{items.length === 1 ? '' : 's'}
            </Text>
          ) : null}
        </View>

        {!hydrated ? (
          <View style={styles.stateBox}>
            <ActivityIndicator color={TRAINING_GREEN} />
            <Text style={styles.stateText}>Loading downloads…</Text>
          </View>
        ) : null}

        {hydrated && items.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No downloads yet</Text>
            <Text style={styles.emptyText}>
              Open a course in My Learning and tap the download icon on a video
              or PDF lesson.
            </Text>
            <Pressable
              style={styles.emptyBtn}
              onPress={() => router.push('/(main)/market/my-trainings')}
              accessibilityRole="button"
            >
              <Text style={styles.emptyBtnText}>Go to My Trainings</Text>
            </Pressable>
          </View>
        ) : null}

        {grouped.map(([trainingId, group]) => (
          <View key={trainingId} style={styles.group}>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/(main)/market/my-training-progress',
                  params: { id: trainingId },
                })
              }
              accessibilityRole="button"
            >
              <Text style={styles.groupTitle} numberOfLines={2}>
                {group.title}
              </Text>
              <Text style={styles.groupMeta}>
                {group.items.length} file
                {group.items.length === 1 ? '' : 's'} · tap title to open course
              </Text>
            </Pressable>

            <View style={styles.card}>
              {group.items.map((item, index) => {
                const isActiveVideo =
                  item.kind === 'video' && item.id === activeVideoId;
                return (
                  <View
                    key={item.id}
                    style={[
                      styles.row,
                      index < group.items.length - 1 && styles.rowBorder,
                      isActiveVideo && styles.rowActive,
                    ]}
                  >
                    <View
                      style={[
                        styles.kindBadge,
                        item.kind === 'video'
                          ? styles.kindBadgeVideo
                          : styles.kindBadgeDoc,
                      ]}
                    >
                      <Text
                        style={[
                          styles.kindBadgeText,
                          item.kind === 'video'
                            ? styles.kindBadgeTextVideo
                            : styles.kindBadgeTextDoc,
                        ]}
                      >
                        {item.kind === 'video' ? 'Video' : 'PDF'}
                      </Text>
                    </View>
                    <View style={styles.rowCopy}>
                      <Text style={styles.rowTitle} numberOfLines={2}>
                        {item.lessonTitle}
                      </Text>
                      <Text style={styles.rowMeta}>
                        {isActiveVideo
                          ? 'Now playing'
                          : `Saved ${formatDownloadedAt(item.downloadedAt)}`}
                      </Text>
                    </View>
                    <Pressable
                      style={[
                        styles.openBtn,
                        isActiveVideo && styles.openBtnActive,
                      ]}
                      onPress={() => onOpen(item)}
                      disabled={openingId === item.id}
                      accessibilityRole="button"
                      accessibilityLabel={
                        item.kind === 'video'
                          ? `Play ${item.lessonTitle}`
                          : `Open ${item.lessonTitle}`
                      }
                    >
                      {openingId === item.id ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <Text style={styles.openBtnText}>
                          {item.kind === 'video'
                            ? isActiveVideo
                              ? 'Playing'
                              : 'Play'
                            : 'Open'}
                        </Text>
                      )}
                    </Pressable>
                    <Pressable
                      style={styles.removeBtn}
                      onPress={() => onRemove(item)}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${item.lessonTitle}`}
                      hitSlop={6}
                    >
                      <TrashGlyph color={TRAINING_MUTED} />
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </View>
    </MarketTrainingScreenShell>
  );
}

const styles = StyleSheet.create({
  page: {
    gap: c(14, 12),
  },
  hero: {
    backgroundColor: '#eef7f0',
    borderRadius: NU.cardRadius,
    borderWidth: 1,
    borderColor: '#d7eadc',
    padding: c(14, 12),
    gap: c(6, 5),
  },
  heroTitle: {
    fontSize: NU.cardTitle,
    fontWeight: '800',
    color: TRAINING_TEAL,
  },
  heroHelp: {
    fontSize: c(12.5, 11.5),
    lineHeight: c(18, 16),
    color: TRAINING_MUTED,
  },
  heroCount: {
    marginTop: c(2, 1),
    fontSize: c(12, 11),
    fontWeight: '700',
    color: TRAINING_GREEN,
  },
  stateBox: {
    paddingVertical: c(28, 24),
    alignItems: 'center',
    gap: c(10, 8),
  },
  stateText: {
    fontSize: c(13.5, 12.5),
    color: TRAINING_MUTED,
    textAlign: 'center',
  },
  emptyCard: {
    backgroundColor: '#f4f8f5',
    borderRadius: NU.cardRadius,
    borderWidth: 1,
    borderColor: '#e8f0ea',
    paddingVertical: c(22, 18),
    paddingHorizontal: c(16, 14),
    gap: c(8, 6),
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: NU.cardTitle,
    fontWeight: '800',
    color: TRAINING_TEAL,
  },
  emptyText: {
    fontSize: NU.body,
    color: TRAINING_MUTED,
    textAlign: 'center',
    lineHeight: c(20, 18),
  },
  emptyBtn: {
    marginTop: c(6, 4),
    backgroundColor: TRAINING_TEAL,
    paddingHorizontal: c(16, 14),
    paddingVertical: c(10, 8),
    borderRadius: 99,
  },
  emptyBtnText: {
    fontSize: NU.body,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  group: {
    gap: c(8, 6),
  },
  groupTitle: {
    fontSize: c(15, 14),
    fontWeight: '700',
    color: TRAINING_TEAL,
  },
  groupMeta: {
    marginTop: 2,
    fontSize: c(12, 11),
    color: TRAINING_MUTED,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    borderRadius: NU.cardRadius,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(8, 6),
    paddingHorizontal: c(12, 10),
    paddingVertical: c(12, 10),
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: TRAINING_TRACK,
  },
  rowActive: {
    backgroundColor: '#f0f7f2',
  },
  kindBadge: {
    paddingHorizontal: c(8, 7),
    paddingVertical: c(4, 3),
    borderRadius: 99,
  },
  kindBadgeVideo: {
    backgroundColor: '#f2e9fb',
  },
  kindBadgeDoc: {
    backgroundColor: '#fde8e6',
  },
  kindBadgeText: {
    fontSize: c(10.5, 9.5),
    fontWeight: '800',
  },
  kindBadgeTextVideo: {
    color: '#8352c0',
  },
  kindBadgeTextDoc: {
    color: '#b42318',
  },
  rowCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  rowTitle: {
    fontSize: c(13.5, 12.5),
    fontWeight: '600',
    color: TRAINING_TEAL,
  },
  rowMeta: {
    fontSize: c(11, 10),
    color: TRAINING_MUTED,
    fontWeight: '500',
  },
  openBtn: {
    minWidth: c(58, 52),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: TRAINING_GREEN,
    paddingHorizontal: c(12, 10),
    paddingVertical: c(8, 7),
    borderRadius: 99,
  },
  openBtnActive: {
    backgroundColor: TRAINING_TEAL,
  },
  openBtnText: {
    fontSize: c(12, 11),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  removeBtn: {
    width: c(32, 28),
    height: c(32, 28),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 99,
    backgroundColor: '#f3f5f4',
  },
});
