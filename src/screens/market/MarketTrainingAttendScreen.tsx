import { useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { MarketTrainingHeader } from '@/components/market/MarketTrainingHeader';
import {
  TRAINING_BG,
  TRAINING_BORDER,
  TRAINING_GREEN,
  TRAINING_MUTED,
  TRAINING_TEAL,
  TRAINING_TRACK,
} from '@/components/market/marketTrainingData';
import {
  getMyEnrolledTraining,
  type EnrolledTrainingDay,
} from '@/components/market/marketTrainingMyEnrollData';
import { useScrollToTopOnFocus } from '@/hooks/useScrollToTopOnFocus';
import { c, NU } from '@/utils/newUiCompact';

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

export function MarketTrainingAttendScreen() {
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
        <MarketTrainingHeader
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: TRAINING_BG,
  },
  scroll: {
    flex: 1,
  },
  body: {
    paddingHorizontal: NU.hPad,
    paddingTop: NU.bodyPadTop,
    gap: NU.cardGap,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    borderRadius: NU.cardRadius,
    padding: c(15, 12),
    gap: c(8, 6),
  },
  modePill: {
    alignSelf: 'flex-start',
    paddingVertical: c(4, 3),
    paddingHorizontal: c(8, 6),
    borderRadius: c(5, 4),
  },
  modePillText: {
    fontSize: NU.label,
    fontWeight: '700',
  },
  summaryMeta: {
    fontSize: c(13.5, 12.5),
    fontWeight: '700',
    color: TRAINING_TEAL,
  },
  summaryHint: {
    fontSize: c(12.5, 11.5),
    color: TRAINING_MUTED,
    lineHeight: c(18, 16),
  },
  sectionLabel: {
    marginTop: c(6, 4),
    fontSize: NU.body,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: TRAINING_MUTED,
  },
  daysCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    borderRadius: NU.cardRadius,
    overflow: 'hidden',
  },
  dayRow: {
    paddingVertical: c(13, 11),
    paddingHorizontal: c(14, 12),
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(10, 8),
  },
  dayRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: TRAINING_TRACK,
  },
  dayRowActive: {
    backgroundColor: '#f5faf3',
  },
  dayCopy: {
    flex: 1,
    gap: c(2, 1),
  },
  dayTitle: {
    fontSize: NU.link,
    fontWeight: '700',
    color: TRAINING_TEAL,
  },
  dayMeta: {
    fontSize: c(12, 11),
    color: TRAINING_MUTED,
  },
  statusPill: {
    paddingVertical: c(4, 3),
    paddingHorizontal: c(8, 6),
    borderRadius: 99,
    backgroundColor: TRAINING_TRACK,
  },
  statusToday: {
    backgroundColor: '#e6f4e8',
  },
  statusDone: {
    backgroundColor: '#eef1f4',
  },
  statusText: {
    fontSize: c(11, 10),
    fontWeight: '700',
    color: TRAINING_MUTED,
  },
  statusTextToday: {
    color: TRAINING_GREEN,
  },
  statusTextDone: {
    color: '#6b7c86',
  },
  attendCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    borderRadius: NU.cardRadius,
    padding: c(16, 13),
    gap: c(10, 8),
    alignItems: 'center',
  },
  attendTitle: {
    alignSelf: 'stretch',
    fontSize: NU.cardTitle,
    fontWeight: '700',
    color: TRAINING_TEAL,
  },
  attendMeta: {
    alignSelf: 'stretch',
    fontSize: c(12.5, 11.5),
    color: TRAINING_MUTED,
  },
  linkBox: {
    alignSelf: 'stretch',
    backgroundColor: '#f5faf3',
    borderRadius: NU.cardRadiusSm,
    padding: c(13, 11),
    gap: c(4, 3),
  },
  linkLabel: {
    fontSize: c(11.5, 10.5),
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: TRAINING_MUTED,
  },
  linkValue: {
    fontSize: NU.link,
    fontWeight: '700',
    color: TRAINING_TEAL,
  },
  linkMeta: {
    fontSize: c(12, 11),
    color: TRAINING_MUTED,
  },
  primaryBtn: {
    alignSelf: 'stretch',
    height: c(46, 42),
    borderRadius: 99,
    backgroundColor: TRAINING_TEAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontSize: NU.cardTitle,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  qrOuter: {
    marginTop: c(4, 2),
    padding: c(14, 12),
    borderRadius: NU.cardRadiusSm,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
  },
  qrInner: {
    width: c(196, 176),
    height: c(196, 176),
    backgroundColor: '#FFFFFF',
  },
  qrRow: {
    flex: 1,
    flexDirection: 'row',
  },
  qrCell: {
    flex: 1,
  },
  qrCellOn: {
    backgroundColor: '#111827',
  },
  qrCellOff: {
    backgroundColor: '#FFFFFF',
  },
  passCode: {
    fontSize: NU.link,
    fontWeight: '800',
    letterSpacing: 1,
    color: TRAINING_TEAL,
  },
  venueBox: {
    alignSelf: 'stretch',
    backgroundColor: '#f5faf3',
    borderRadius: NU.cardRadiusSm,
    padding: c(13, 11),
    gap: c(3, 2),
  },
  venueTitle: {
    fontSize: NU.link,
    fontWeight: '700',
    color: TRAINING_TEAL,
  },
  footnote: {
    alignSelf: 'stretch',
    fontSize: c(11.5, 10.5),
    color: TRAINING_MUTED,
    textAlign: 'center',
  },
});
