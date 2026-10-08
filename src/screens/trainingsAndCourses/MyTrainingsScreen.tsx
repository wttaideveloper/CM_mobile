import { useCallback, useMemo, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

// import { MY_ENROLLED_TRAININGS } from '@/components/trainingsAndCourses/trainingMyEnrollData'; // static samples hidden
import {
  TRAINING_BORDER,
  TRAINING_GREEN,
  TRAINING_MUTED,
  TRAINING_TEAL,
  TRAINING_TRACK,
} from '@/components/trainingsAndCourses/trainingData';
import { TrainingCoverImage } from '@/components/trainingsAndCourses/TrainingCoverImage';
// import { getTrainingProgressPath } from '@/components/trainingsAndCourses/trainingProgressData';
import { useMyTrainingEnrolments } from '@/hooks/useTrainings';
import { TrainingScreenShell } from '@/screens/trainingsAndCourses/TrainingScreenShell';
import type { MyEnrolmentCardView } from '@/utils/trainingEnrolments.mapper';
import { mapEnrolmentsApiToCards } from '@/utils/trainingEnrolments.mapper';
import { c, NU } from '@/utils/newUiCompact';
import { styles } from '@/screens/trainingsAndCourses/MyTrainingsScreen.styles';

/* Static enrolment progress bar — kept for when MY_ENROLLED_TRAININGS UI returns.
function StaticProgressBar({
  trainingId,
  accent,
}: {
  trainingId: string;
  accent: string;
}) {
  const userId = useAuthStore((s) => s.user?.id?.trim() || '');
  const completedLessons = useTrainingProgressStore(
    (s) => (userId ? s.byUser[userId]?.[trainingId]?.completedLessons : undefined),
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
*/

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
  title,
  meta,
  accent,
  nextSession,
  onPress,
  progress,
  disabled = false,
  statusLabel,
}: {
  bannerUrl: string;
  mode: string;
  badgeBg: string;
  badgeColor: string;
  title: string;
  meta: string;
  accent: string;
  nextSession: string;
  onPress: () => void;
  progress: ReactNode;
  disabled?: boolean;
  statusLabel?: string;
}) {
  return (
    <Pressable
      style={[styles.courseCard, disabled && styles.courseCardDisabled]}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <View style={styles.bannerWrap}>
        <TrainingCoverImage
          uri={bannerUrl}
          title={title}
          style={[styles.banner, disabled && styles.bannerDimmed]}
          placeholderTextStyle={styles.bannerInitials}
          transition={0}
          cachePolicy="memory-disk"
          recyclingKey={bannerUrl || undefined}
        />
        <View style={styles.bannerScrim} pointerEvents="none" />
        <View style={styles.bannerTop}>
          <View style={[styles.modePill, { backgroundColor: badgeBg }]}>
            <Text style={[styles.modePillText, { color: badgeColor }]}>
              {mode.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, disabled && styles.titleDisabled]}>
            {title}
          </Text>
          {statusLabel ? (
            <View
              style={[
                styles.statusPill,
                disabled ? styles.statusPillPending : styles.statusPillActive,
              ]}
            >
              <Text
                style={[
                  styles.statusPillText,
                  disabled
                    ? styles.statusPillTextPending
                    : styles.statusPillTextActive,
                ]}
              >
                {statusLabel}
              </Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.meta}>{meta}</Text>
        {progress}
        <View style={[styles.nextBox, disabled && styles.nextBoxDisabled]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.nextLabel}>
              {disabled ? 'Status' : 'Continue learning'}
            </Text>
            <Text style={[styles.nextValue, disabled && styles.nextValueMuted]}>
              {nextSession}
            </Text>
          </View>
          {!disabled ? (
            <Text style={[styles.cta, { color: accent }]}>Continue ›</Text>
          ) : (
            <Text style={styles.ctaDisabled}>Locked</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export function MyTrainingsScreen() {
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
    <TrainingScreenShell
      eyebrow="Enrolled"
      title="My Trainings and Courses"
      flatBottom
      rightLabel="Downloads"
      onRightPress={() =>
        router.push('/(main)/market/my-training-downloads')
      }
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
          title={item.title}
          meta={`${item.vendor} · ${item.progressLabel} · ${item.priceLabel}`}
          accent={item.accent}
          nextSession={item.nextSession}
          progress={<ApiProgressBar item={item} />}
          disabled={item.disabled}
          statusLabel={item.statusLabel}
          onPress={() =>
            router.push({
              pathname: '/(main)/market/my-training-progress',
              params: { id: item.id },
            })
          }
        />
      ))}

      {/* Static enrolment samples — hide for now (keep MY_ENROLLED_TRAININGS data).
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
      */}
    </TrainingScreenShell>
  );
}

