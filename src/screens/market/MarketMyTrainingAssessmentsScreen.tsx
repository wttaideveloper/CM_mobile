import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  TRAINING_BORDER,
  TRAINING_GREEN,
  TRAINING_MUTED,
  TRAINING_TEAL,
} from '@/components/market/marketTrainingData';
import {
  isApiTrainingId,
  useTraining,
  useTrainingAssignments,
} from '@/hooks/useTrainings';
import { MarketTrainingScreenShell } from '@/screens/market/MarketTrainingScreenShell';
import { c, NU } from '@/utils/newUiCompact';

export function MarketMyTrainingAssessmentsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isApiId = isApiTrainingId(id);
  const { training } = useTraining(isApiId ? id : undefined);
  const assignmentsQuery = useTrainingAssignments(isApiId ? id : undefined);

  const courseTitle = training?.title?.trim() || 'Course';
  const assessments = assignmentsQuery.assessments;
  const submittedCount = assessments.filter(
    (item) =>
      typeof item.attempts_made === 'number' && item.attempts_made > 0,
  ).length;

  const openExam = (examId: string, lessonId?: string | null) => {
    if (!id) return;
    router.push({
      pathname: '/(main)/market/training-exam',
      params: {
        trainingId: id,
        examId,
        ...(lessonId ? { lessonId } : {}),
      },
    });
  };

  return (
    <MarketTrainingScreenShell
      eyebrow="My learning"
      title="My assessments"
      flatBottom
    >
      <View style={styles.page}>
        <View style={styles.hero}>
          <Text style={styles.heroEyebrow}>Course quizzes</Text>
          <Text style={styles.heroTitle} numberOfLines={2}>
            {courseTitle}
          </Text>
          {isApiId && !assignmentsQuery.isLoading && assessments.length > 0 ? (
            <View style={styles.statRow}>
              <View style={styles.statChip}>
                <Text style={styles.statValue}>{assessments.length}</Text>
                <Text style={styles.statLabel}>
                  {assessments.length === 1 ? 'quiz' : 'quizzes'}
                </Text>
              </View>
              <View style={[styles.statChip, styles.statChipAlt]}>
                <Text style={[styles.statValue, styles.statValueAlt]}>
                  {submittedCount}
                </Text>
                <Text style={[styles.statLabel, styles.statLabelAlt]}>
                  submitted
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.heroHelp}>
              Open a quiz below to answer and submit.
            </Text>
          )}
        </View>

        {!isApiId ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No assessments here</Text>
            <Text style={styles.emptyText}>
              Assessments are available for enrolled courses.
            </Text>
          </View>
        ) : assignmentsQuery.isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={TRAINING_GREEN} size="large" />
            <Text style={styles.loadingText}>Loading assessments…</Text>
          </View>
        ) : assignmentsQuery.isError ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Couldn’t load</Text>
            <Text style={styles.emptyText}>
              Check your connection and try again.
            </Text>
            <Pressable
              style={styles.retryBtn}
              onPress={() => {
                void assignmentsQuery.refetch();
              }}
              accessibilityRole="button"
            >
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : assessments.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No assessments yet</Text>
            <Text style={styles.emptyText}>
              Quizzes for this course will show up here when available.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            <Text style={styles.listLabel}>Available quizzes</Text>
            {assessments.map((item, index) => {
              const questionCount = Array.isArray(item.questions)
                ? item.questions.length
                : null;
              const attemptsMade =
                typeof item.attempts_made === 'number'
                  ? item.attempts_made
                  : null;
              const submitted =
                attemptsMade != null && attemptsMade > 0;
              const statusLabel = submitted
                ? `${attemptsMade} time${attemptsMade === 1 ? '' : 's'} submitted`
                : 'Not submitted yet';
              const detailParts = [
                questionCount != null && questionCount > 0
                  ? `${questionCount} question${questionCount === 1 ? '' : 's'}`
                  : null,
                item.pass_percent != null &&
                String(item.pass_percent).trim()
                  ? `Pass ≥ ${item.pass_percent}%`
                  : null,
              ].filter(Boolean);

              return (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [
                    styles.card,
                    submitted && styles.cardSubmitted,
                    pressed && styles.cardPressed,
                  ]}
                  onPress={() => openExam(item.id, item.lesson_id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Open assessment ${item.title || 'Quiz'}`}
                >
                  <View style={styles.cardTop}>
                    <View
                      style={[
                        styles.indexBadge,
                        submitted && styles.indexBadgeDone,
                      ]}
                    >
                      <Text
                        style={[
                          styles.indexText,
                          submitted && styles.indexTextDone,
                        ]}
                      >
                        {index + 1}
                      </Text>
                    </View>
                    <View style={styles.cardCopy}>
                      <Text style={styles.cardTitle} numberOfLines={2}>
                        {item.title?.trim() || 'Assessment'}
                      </Text>
                      {detailParts.length > 0 ? (
                        <Text style={styles.cardMeta} numberOfLines={1}>
                          {detailParts.join(' · ')}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.cardFooter}>
                    <View
                      style={[
                        styles.statusPill,
                        submitted
                          ? styles.statusPillDone
                          : styles.statusPillPending,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          submitted
                            ? styles.statusTextDone
                            : styles.statusTextPending,
                        ]}
                      >
                        {statusLabel}
                      </Text>
                    </View>
                    <View style={styles.openBtn}>
                      <Text style={styles.openText}>
                        {submitted ? 'Retake' : 'Start'}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
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
    paddingVertical: c(14, 12),
    paddingHorizontal: c(14, 12),
    gap: c(6, 5),
  },
  heroEyebrow: {
    fontSize: c(11, 10),
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: TRAINING_GREEN,
  },
  heroTitle: {
    fontSize: NU.cardTitle,
    fontWeight: '800',
    color: TRAINING_TEAL,
    letterSpacing: -0.2,
    lineHeight: c(22, 20),
  },
  heroHelp: {
    marginTop: c(2, 1),
    fontSize: c(12.5, 11.5),
    lineHeight: c(17, 15),
    color: TRAINING_MUTED,
  },
  statRow: {
    flexDirection: 'row',
    gap: c(8, 6),
    marginTop: c(6, 4),
  },
  statChip: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: NU.cardRadiusSm,
    borderWidth: 1,
    borderColor: '#d7eadc',
    paddingVertical: c(10, 8),
    paddingHorizontal: c(10, 8),
    alignItems: 'center',
    gap: c(2, 1),
  },
  statChipAlt: {
    backgroundColor: '#f5f0fb',
    borderColor: '#e4d7f5',
  },
  statValue: {
    fontSize: c(20, 18),
    fontWeight: '800',
    color: TRAINING_GREEN,
  },
  statValueAlt: {
    color: '#8352c0',
  },
  statLabel: {
    fontSize: c(11, 10),
    fontWeight: '700',
    color: TRAINING_MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  statLabelAlt: {
    color: '#8352c0',
  },
  list: {
    gap: c(10, 8),
  },
  listLabel: {
    fontSize: c(12, 11),
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: TRAINING_MUTED,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    borderRadius: NU.cardRadius,
    paddingVertical: c(13, 11),
    paddingHorizontal: c(13, 11),
    gap: c(12, 10),
  },
  cardSubmitted: {
    borderColor: '#c8e0cc',
    backgroundColor: '#fbfefc',
  },
  cardPressed: {
    borderColor: TRAINING_GREEN,
    backgroundColor: '#f0f7f2',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: c(12, 10),
  },
  indexBadge: {
    width: c(36, 32),
    height: c(36, 32),
    borderRadius: c(12, 10),
    backgroundColor: '#f2e9fb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexBadgeDone: {
    backgroundColor: '#e6f4e8',
  },
  indexText: {
    fontSize: c(14, 13),
    fontWeight: '800',
    color: '#8352c0',
  },
  indexTextDone: {
    color: TRAINING_GREEN,
  },
  cardCopy: {
    flex: 1,
    minWidth: 0,
    gap: c(3, 2),
    paddingTop: c(2, 1),
  },
  cardTitle: {
    fontSize: NU.cardTitle,
    fontWeight: '800',
    color: TRAINING_TEAL,
    lineHeight: c(21, 19),
  },
  cardMeta: {
    fontSize: c(12.5, 11.5),
    color: TRAINING_MUTED,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: c(10, 8),
  },
  statusPill: {
    flexShrink: 1,
    paddingHorizontal: c(10, 8),
    paddingVertical: c(6, 5),
    borderRadius: 99,
  },
  statusPillDone: {
    backgroundColor: '#e6f4e8',
  },
  statusPillPending: {
    backgroundColor: '#f3f5f4',
  },
  statusText: {
    fontSize: c(11.5, 10.5),
    fontWeight: '700',
  },
  statusTextDone: {
    color: TRAINING_GREEN,
  },
  statusTextPending: {
    color: TRAINING_MUTED,
  },
  openBtn: {
    backgroundColor: TRAINING_TEAL,
    paddingHorizontal: c(14, 12),
    paddingVertical: c(8, 7),
    borderRadius: 99,
  },
  openText: {
    fontSize: c(12.5, 11.5),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  loadingWrap: {
    minHeight: c(180, 160),
    alignItems: 'center',
    justifyContent: 'center',
    gap: c(10, 8),
  },
  loadingText: {
    fontSize: c(13, 12),
    color: TRAINING_MUTED,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: '#f4f8f5',
    borderRadius: NU.cardRadius,
    borderWidth: 1,
    borderColor: '#e8f0ea',
    paddingVertical: c(22, 18),
    paddingHorizontal: c(16, 14),
    gap: c(6, 5),
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
  retryBtn: {
    marginTop: c(8, 6),
    paddingHorizontal: c(16, 14),
    paddingVertical: c(9, 8),
    borderRadius: 99,
    backgroundColor: TRAINING_TEAL,
  },
  retryText: {
    fontSize: NU.body,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
