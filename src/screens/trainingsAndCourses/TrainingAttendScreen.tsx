import { useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { TrainingHeader } from '@/components/trainingsAndCourses/TrainingHeader';
import {
  TRAINING_BG,
  TRAINING_BORDER,
  TRAINING_GREEN,
  TRAINING_MUTED,
  TRAINING_TEAL,
  TRAINING_TRACK,
} from '@/components/trainingsAndCourses/trainingData';
import {
  getMyEnrolledTraining,
  type EnrolledTrainingDay,
} from '@/components/trainingsAndCourses/trainingMyEnrollData';
import { useScrollToTopOnFocus } from '@/hooks/useScrollToTopOnFocus';
import { c, NU } from '@/utils/newUiCompact';
import { styles } from '@/screens/trainingsAndCourses/TrainingAttendScreen.styles';

/** Decorative static QR pattern (not a real encoded QR). */
function StaticQrPass({ seed }: { seed: string }) {
  const size = 21;
  const cells = useMemo(() => {
    const grid: boolean[][] = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => false),
    );

    const paintFinder = (ox: number, oy: number) => {
      for (let y = 0; y < 7; y += 1) {
        for (let x = 0; x < 7; x += 1) {
          const edge = x === 0 || y === 0 || x === 6 || y === 6;
          const center = x >= 2 && x <= 4 && y >= 2 && y <= 4;
          grid[oy + y][ox + x] = edge || center;
        }
      }
    };

    paintFinder(0, 0);
    paintFinder(size - 7, 0);
    paintFinder(0, size - 7);

    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
      hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    }

    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const inFinder =
          (x < 8 && y < 8) ||
          (x >= size - 8 && y < 8) ||
          (x < 8 && y >= size - 8);
        if (inFinder) continue;
        hash = (hash * 1664525 + 1013904223) >>> 0;
        grid[y][x] = hash % 3 !== 0;
      }
    }

    return grid;
  }, [seed]);

  return (
    <View style={styles.qrOuter}>
      <View style={styles.qrInner}>
        {cells.map((row, y) => (
          <View key={`r-${y}`} style={styles.qrRow}>
            {row.map((on, x) => (
              <View
                key={`c-${y}-${x}`}
                style={[styles.qrCell, on ? styles.qrCellOn : styles.qrCellOff]}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

function statusLabel(status: EnrolledTrainingDay['status']) {
  if (status === 'today') return 'Today';
  if (status === 'completed') return 'Done';
  return 'Upcoming';
}

export function TrainingAttendScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useScrollToTopOnFocus();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const training = getMyEnrolledTraining(id);

  const defaultDay =
    training.days.find((d) => d.status === 'today') ?? training.days[0];
  const [selectedId, setSelectedId] = useState(defaultDay?.id);
  const selected =
    training.days.find((d) => d.id === selectedId) ?? defaultDay;

  const openJoin = async (url?: string) => {
    if (!url) return;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Static join link', url);
    }
  };

  return (
    <View style={styles.screen}>
      <AppStatusBar variant="light" backgroundColor={TRAINING_GREEN} />
      <StatusBarFill lightColor={TRAINING_GREEN} darkColor={TRAINING_GREEN} />
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
      >
        <TrainingHeader
          eyebrow="How to attend"
          title={training.title}
        />

        <View style={styles.body}>
          <View style={styles.summaryCard}>
            <View style={[styles.modePill, { backgroundColor: training.badgeBg }]}>
              <Text style={[styles.modePillText, { color: training.badgeColor }]}>
                {training.mode.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.summaryMeta}>
              {training.vendor} · {training.progressLabel}
            </Text>
            <Text style={styles.summaryHint}>
              {training.mode === 'Hybrid'
                ? 'Hybrid · each day has its own attend method (link or QR pass).'
                : training.mode === 'Virtual'
                  ? 'Online · open the day-wise join link to attend.'
                  : training.mode === 'Self-paced'
                    ? 'Self-paced · watch recorded lessons anytime — no live join required.'
                    : 'In person · show your QR pass at the venue.'}
            </Text>
          </View>

          <Text style={styles.sectionLabel}>Session days</Text>
          <View style={styles.daysCard}>
            {training.days.map((day, index) => {
              const active = day.id === selected?.id;
              return (
                <Pressable
                  key={day.id}
                  style={[
                    styles.dayRow,
                    index < training.days.length - 1 && styles.dayRowBorder,
                    active && styles.dayRowActive,
                  ]}
                  onPress={() => setSelectedId(day.id)}
                  accessibilityRole="button"
                >
                  <View style={styles.dayCopy}>
                    <Text style={styles.dayTitle}>{day.dayLabel}</Text>
                    <Text style={styles.dayMeta}>
                      {day.when} · {day.mode === 'online' ? 'Online link' : 'QR pass'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      day.status === 'today' && styles.statusToday,
                      day.status === 'completed' && styles.statusDone,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        day.status === 'today' && styles.statusTextToday,
                        day.status === 'completed' && styles.statusTextDone,
                      ]}
                    >
                      {statusLabel(day.status)}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {selected ? (
            <>
              <Text style={styles.sectionLabel}>
                {selected.mode === 'online' ? 'Join online' : 'Venue QR pass'}
              </Text>
              <View style={styles.attendCard}>
                {selected.mode === 'online' ? (
                  <>
                    <Text style={styles.attendTitle}>{selected.dayLabel}</Text>
                    <Text style={styles.attendMeta}>{selected.when}</Text>
                    <View style={styles.linkBox}>
                      <Text style={styles.linkLabel}>Day join link</Text>
                      <Text style={styles.linkValue}>{selected.joinUrl}</Text>
                      {selected.joinMeta ? (
                        <Text style={styles.linkMeta}>{selected.joinMeta}</Text>
                      ) : null}
                    </View>
                    <Pressable
                      style={styles.primaryBtn}
                      onPress={() => openJoin(selected.joinUrl)}
                      accessibilityRole="button"
                    >
                      <Text style={styles.primaryBtnText}>Open join link</Text>
                    </Pressable>
                    <Text style={styles.footnote}>
                      Static preview · link opens externally when available
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.attendTitle}>{selected.dayLabel}</Text>
                    <Text style={styles.attendMeta}>{selected.when}</Text>
                    <StaticQrPass seed={selected.passCode || selected.id} />
                    <Text style={styles.passCode}>{selected.passCode}</Text>
                    <View style={styles.venueBox}>
                      <Text style={styles.linkLabel}>Check-in venue</Text>
                      <Text style={styles.venueTitle}>{selected.venue}</Text>
                      <Text style={styles.attendMeta}>{selected.address}</Text>
                      {selected.checkInWindow ? (
                        <Text style={styles.linkMeta}>{selected.checkInWindow}</Text>
                      ) : null}
                    </View>
                    <Text style={styles.footnote}>
                      Show this QR at the door · static pass for UI preview
                    </Text>
                  </>
                )}
              </View>
            </>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

