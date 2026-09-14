import { useCallback, useMemo, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';

import { MY_ENROLLED_TRAININGS } from '@/components/market/marketTrainingMyEnrollData';
import {
  TRAINING_BORDER,
  TRAINING_GREEN,
  TRAINING_MUTED,
  TRAINING_TEAL,
  TRAINING_TRACK,
} from '@/components/market/marketTrainingData';
import { getTrainingProgressPath } from '@/components/market/marketTrainingProgressData';
import { useMyTrainingEnrolments } from '@/hooks/useTrainings';
import { MarketTrainingScreenShell } from '@/screens/market/MarketTrainingScreenShell';
import { useTrainingProgressStore } from '@/stores/trainingProgress.store';
import type { MyEnrolmentCardView } from '@/utils/marketTrainingEnrolments.mapper';
import { mapEnrolmentsApiToCards } from '@/utils/marketTrainingEnrolments.mapper';
import { c, NU } from '@/utils/newUiCompact';

function StaticProgressBar({
  trainingId,
  accent,
}: {
  trainingId: string;
  accent: string;
}) {
  const completedLessons = useTrainingProgressStore(
    (s) => s.byTraining[trainingId]?.completedLessons,
  );
  const path = getTrainingProgressPath(trainingId);

  const { percent, label } = useMemo(() => {
    const total = path.days.reduce((sum, day) => sum + day.lessons.length, 0);
    const doneMap = completedLessons ?? {};
    const done = path.days.reduce(
      (sum, day) =>
        sum +
        day.lessons.filter((lesson) => Boolean(doneMap[lesson.id])).length,
      0,
    );
    const daysDone = path.days.filter((day) =>
      day.lessons.every((lesson) => Boolean(doneMap[lesson.id])),
    ).length;
    return {
      percent: total === 0 ? 0 : Math.round((done / total) * 100),
      label: `${done}/${total} lessons · ${daysDone}/${path.days.length} days`,
    };
  }, [path.days, completedLessons]);

  return <ProgressBar percent={percent} label={label} accent={accent} />;
}

function ApiProgressBar({
  item,
}: {
  item: MyEnrolmentCardView;
}) {
  const label =
    item.totalLessons > 0
      ? `${item.completedLessons}/${item.totalLessons} lessons`
      : item.progressPercent > 0
        ? 'In progress'
        : 'Not started';

  return (
    <ProgressBar
      percent={item.progressPercent}
      label={label}
      accent={item.accent}
    />
  );
}

function ProgressBar({
  percent,
  label,
  accent,
}: {
  percent: number;
  label: string;
  accent: string;
}) {
  return (
    <View style={styles.progressWrap}>
      <View style={styles.progressRow}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={[styles.progressPercent, { color: accent }]}>
          {percent}%
        </Text>
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${Math.min(100, percent)}%`, backgroundColor: accent },
          ]}
        />
      </View>
    </View>
  );
}

function EnrolmentCardShell({
  bannerUrl,
  mode,
  badgeBg,
  badgeColor,
  enrollmentCode,
  title,
  meta,
  accent,
  nextSession,
  onPress,
  progress,
}: {
  bannerUrl: string;
  mode: string;
  badgeBg: string;
  badgeColor: string;
  enrollmentCode: string;
  title: string;
  meta: string;
  accent: string;
  nextSession: string;
  onPress: () => void;
  progress: ReactNode;
}) {
  return (
    <Pressable
      style={styles.courseCard}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View style={styles.bannerWrap}>
        {bannerUrl ? (
          <Image
            source={{ uri: bannerUrl }}
            style={styles.banner}
            contentFit="cover"
            transition={0}
            cachePolicy="memory-disk"
            recyclingKey={bannerUrl}
            accessibilityIgnoresInvertColors
          />
        ) : null}
        <View style={styles.bannerScrim} pointerEvents="none" />
        <View style={styles.bannerTop}>
          <View style={[styles.modePill, { backgroundColor: badgeBg }]}>
            <Text style={[styles.modePillText, { color: badgeColor }]}>
              {mode.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.codeOnBanner}>{enrollmentCode}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.meta}>{meta}</Text>
        {progress}
        <View style={styles.nextBox}>
          <View style={{ flex: 1 }}>
            <Text style={styles.nextLabel}>Continue learning</Text>
            <Text style={styles.nextValue}>{nextSession}</Text>
          </View>
          <Text style={[styles.cta, { color: accent }]}>Continue ›</Text>
        </View>
      </View>
    </Pressable>
  );
}

export function MarketMyTrainingsScreen() {
  const router = useRouter();
  const enrolments = useMyTrainingEnrolments();

  const apiCards = useMemo(
    () => mapEnrolmentsApiToCards(enrolments.items),
    [enrolments.items],
  );

  useFocusEffect(
    useCallback(() => {
      void enrolments.refetch();
    }, [enrolments.refetch]),
  );

  return (
    <MarketTrainingScreenShell
      eyebrow="Enrolled"
      title="My Trainings"
      refreshControl={
        <RefreshControl
          refreshing={enrolments.isFetching && !enrolments.isLoading}
          onRefresh={() => {
            void enrolments.refetch();
          }}
          tintColor={TRAINING_GREEN}
        />
      }
    >
      <Text style={styles.sectionLabel}>Your enrolments</Text>
      <Text style={styles.helper}>
        Live enrolments from your account. Open a course to continue learning.
      </Text>

      {enrolments.isLoading && apiCards.length === 0 ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color={TRAINING_GREEN} />
          <Text style={styles.stateText}>Loading enrolments…</Text>
        </View>
      ) : null}

      {enrolments.isError && apiCards.length === 0 ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>
            Could not load enrolments. Pull to refresh.
          </Text>
          <Pressable
            onPress={() => {
              void enrolments.refetch();
            }}
            accessibilityRole="button"
          >
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : null}

      {!enrolments.isLoading && !enrolments.isError && apiCards.length === 0 ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>
            No enrolments yet. Enroll from a training detail to see it here.
          </Text>
        </View>
      ) : null}

      {apiCards.map((item) => (
        <EnrolmentCardShell
          key={item.enrolmentId || item.id}
          bannerUrl={item.bannerUrl}
          mode={item.mode === 'In-Person' ? 'Physical' : item.mode}
          badgeBg={item.badgeBg}
          badgeColor={item.badgeColor}
          enrollmentCode={item.enrollmentCode}
          title={item.title}
          meta={`${item.vendor} · ${item.progressLabel} · ${item.priceLabel}`}
          accent={item.accent}
          nextSession={item.nextSession}
          progress={<ApiProgressBar item={item} />}
          onPress={() =>
            router.push({
              pathname: '/(main)/market/my-training-progress',
              params: { id: item.id },
            })
          }
        />
      ))}

      <Text style={[styles.sectionLabel, styles.refLabel]}>
        UI reference (static)
      </Text>
      <Text style={styles.helper}>
        Virtual / Physical / Hybrid samples kept for layout reference. Not from
        the API.
      </Text>

      {MY_ENROLLED_TRAININGS.map((item) => (
        <EnrolmentCardShell
          key={`static-${item.id}`}
          bannerUrl={item.bannerUrl}
          mode={item.mode === 'In-Person' ? 'Physical' : item.mode}
          badgeBg={item.badgeBg}
          badgeColor={item.badgeColor}
          enrollmentCode={item.enrollmentCode}
          title={item.title}
          meta={`${item.vendor} · ${item.progressLabel}`}
          accent={item.accent}
          nextSession={item.nextSession}
          progress={
            <StaticProgressBar trainingId={item.id} accent={item.accent} />
          }
          onPress={() =>
            router.push({
              pathname: '/(main)/market/my-training-progress',
              params: { id: item.id },
            })
          }
        />
      ))}
    </MarketTrainingScreenShell>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: NU.body,
    fontWeight: '700',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: TRAINING_MUTED,
  },
  refLabel: {
    marginTop: c(10, 8),
  },
  helper: {
    marginTop: -c(8, 6),
    fontSize: c(12.5, 11.5),
    color: TRAINING_MUTED,
    lineHeight: c(18, 16),
  },
  stateBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    borderRadius: NU.cardRadius,
    padding: c(16, 14),
    gap: c(8, 6),
    alignItems: 'center',
  },
  stateText: {
    fontSize: c(13, 12),
    color: TRAINING_MUTED,
    textAlign: 'center',
    lineHeight: c(18, 16),
  },
  retryText: {
    fontSize: NU.link,
    fontWeight: '700',
    color: TRAINING_GREEN,
  },
  courseCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    borderRadius: NU.cardRadius,
    overflow: 'hidden',
  },
  bannerWrap: {
    height: c(148, 128),
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#d7e8db',
  },
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  bannerScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 30, 20, 0.22)',
  },
  bannerTop: {
    position: 'absolute',
    left: c(12, 10),
    right: c(12, 10),
    top: c(12, 10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modePill: {
    paddingVertical: c(4, 3),
    paddingHorizontal: c(8, 6),
    borderRadius: c(5, 4),
  },
  modePillText: {
    fontSize: NU.label,
    fontWeight: '700',
  },
  codeOnBanner: {
    fontSize: c(11.5, 10.5),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardBody: {
    padding: c(15, 12),
    gap: c(4, 3),
  },
  title: {
    fontSize: NU.cardTitle,
    fontWeight: '700',
    color: TRAINING_TEAL,
  },
  meta: {
    fontSize: c(12.5, 11.5),
    color: TRAINING_MUTED,
  },
  progressWrap: {
    marginTop: c(8, 6),
    gap: c(6, 5),
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: c(8, 6),
  },
  progressLabel: {
    flex: 1,
    fontSize: c(11.5, 10.5),
    color: TRAINING_MUTED,
  },
  progressPercent: {
    fontSize: NU.body,
    fontWeight: '800',
  },
  track: {
    height: c(7, 6),
    borderRadius: 99,
    backgroundColor: TRAINING_TRACK,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 99,
  },
  nextBox: {
    marginTop: c(8, 6),
    backgroundColor: '#f5faf3',
    borderRadius: NU.cardRadiusSm,
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    paddingVertical: c(11, 9),
    paddingHorizontal: c(13, 11),
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(10, 8),
  },
  nextLabel: {
    fontSize: c(11.5, 10.5),
    color: TRAINING_MUTED,
  },
  nextValue: {
    marginTop: c(2, 1),
    fontSize: c(13.5, 12.5),
    fontWeight: '700',
    color: TRAINING_TEAL,
  },
  cta: {
    fontSize: NU.link,
    fontWeight: '800',
  },
});
