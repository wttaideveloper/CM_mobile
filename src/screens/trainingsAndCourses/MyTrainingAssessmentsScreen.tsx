import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  TRAINING_BORDER,
  TRAINING_GREEN,
  TRAINING_MUTED,
  TRAINING_TEAL,
} from '@/components/trainingsAndCourses/trainingData';
import {
  isApiTrainingId,
  useTraining,
  useTrainingAssignments,
} from '@/hooks/useTrainings';
import { TrainingScreenShell } from '@/screens/trainingsAndCourses/TrainingScreenShell';
import { c, NU } from '@/utils/newUiCompact';
import { styles } from '@/screens/trainingsAndCourses/MyTrainingAssessmentsScreen.styles';

export function MyTrainingAssessmentsScreen() {
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
    <TrainingScreenShell
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
    </TrainingScreenShell>
  );
}

