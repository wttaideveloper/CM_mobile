import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
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
  getTrainingExam,
  type McqQuestion,
} from '@/components/market/marketTrainingProgressData';
import {
  TrainingCard,
  TrainingPrimaryButton,
  TrainingSection,
} from '@/components/market/MarketTrainingUi';
import {
  isApiTrainingId,
  useSubmitTrainingAssessment,
  useTrainingAssessment,
} from '@/hooks/useTrainings';
import { MarketTrainingScreenShell } from '@/screens/market/MarketTrainingScreenShell';
import { useTrainingProgressStore } from '@/stores/trainingProgress.store';
import { getApiErrorMessage } from '@/utils/apiError';
import { c, NU } from '@/utils/newUiCompact';

type AnswerValue = string | string[];

function isAnswered(value: AnswerValue | undefined): boolean {
  if (value == null) return false;
  if (Array.isArray(value)) return value.length > 0;
  return value.trim().length > 0;
}

function questionHint(question: McqQuestion): string {
  switch (question.questionType) {
    case 'multiple_select':
      return 'Select all that apply';
    case 'true_false':
      return 'True or false';
    case 'short_answer':
      return 'Short answer';
    case 'essay':
      return 'Written answer';
    default:
      return 'Choose one';
  }
}

export function MarketTrainingExamScreen() {
  const router = useRouter();
  const { trainingId, examId, lessonId } = useLocalSearchParams<{
    trainingId?: string;
    examId?: string;
    lessonId?: string;
  }>();

  const isApiId = isApiTrainingId(trainingId);
  const assessmentQuery = useTrainingAssessment(
    isApiId ? trainingId : undefined,
    isApiId ? examId : undefined,
  );
  const submitAssessment = useSubmitTrainingAssessment(
    isApiId ? trainingId : undefined,
  );

  const staticExam = !isApiId
    ? getTrainingExam(trainingId, examId)
    : null;
  const exam = isApiId ? assessmentQuery.exam : staticExam;

  const submitExamLocal = useTrainingProgressStore((s) => s.submitExam);
  const existing = useTrainingProgressStore((s) =>
    trainingId && examId
      ? s.getBucket(trainingId).examAttempts[examId]
      : undefined,
  );

  const startedAtRef = useRef(new Date().toISOString());
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>(() => {
    if (!existing?.answers) return {};
    const mapped: Record<string, AnswerValue> = {};
    for (const [key, value] of Object.entries(existing.answers)) {
      mapped[key] = value;
    }
    return mapped;
  });
  useEffect(() => {
    startedAtRef.current = new Date().toISOString();
  }, [examId]);

  const answeredCount = useMemo(
    () =>
      exam?.questions.filter((question) => isAnswered(answers[question.id]))
        .length ?? 0,
    [answers, exam?.questions],
  );

  if (isApiId && assessmentQuery.isLoading && !exam) {
    return (
      <MarketTrainingScreenShell eyebrow="Quiz" title="Loading…">
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={TRAINING_GREEN} />
          <Text style={styles.meta}>Loading quiz…</Text>
        </View>
      </MarketTrainingScreenShell>
    );
  }

  if (isApiId && assessmentQuery.isError && !exam) {
    return (
      <MarketTrainingScreenShell eyebrow="Quiz" title="Quiz">
        <TrainingCard>
          <Text style={styles.meta}>
            Could not load this assessment. Check your connection and try again.
          </Text>
          <TrainingPrimaryButton
            label="Try again"
            onPress={() => {
              void assessmentQuery.refetch();
            }}
          />
          <TrainingPrimaryButton label="Go back" onPress={() => router.back()} />
        </TrainingCard>
      </MarketTrainingScreenShell>
    );
  }

  if (!exam || !trainingId || !examId) {
    return (
      <MarketTrainingScreenShell eyebrow="Quiz" title="Quiz not found">
        <TrainingCard>
          <Text style={styles.meta}>
            This quiz could not be loaded.
          </Text>
          <TrainingPrimaryButton label="Go back" onPress={() => router.back()} />
        </TrainingCard>
      </MarketTrainingScreenShell>
    );
  }

  const onSelectSingle = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const onToggleMulti = (questionId: string, optionId: string) => {
    setAnswers((prev) => {
      const current = prev[questionId];
      const list = Array.isArray(current)
        ? [...current]
        : typeof current === 'string' && current
          ? [current]
          : [];
      const next = list.includes(optionId)
        ? list.filter((id) => id !== optionId)
        : [...list, optionId];
      return { ...prev, [questionId]: next };
    });
  };

  const onTextChange = (questionId: string, text: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: text }));
  };

  const onSubmit = () => {
    if (answeredCount < exam.questions.length) {
      Alert.alert(
        'Answer all questions',
        `You answered ${answeredCount} of ${exam.questions.length}.`,
      );
      return;
    }

    if (isApiId) {
      const payload = exam.questions.map((question) => {
        const raw = answers[question.id];
        const answer = Array.isArray(raw)
          ? raw.join(',')
          : typeof raw === 'string'
            ? raw.trim()
            : '';
        return {
          question_id: question.id,
          answer,
        };
      });

      submitAssessment.mutate(
        {
          assessmentId: exam.id,
          answers: payload,
          started_at: startedAtRef.current,
        },
        {
          onSuccess: (result) => {
            const totalPoints = Number(result.total_points);
            const scorePoints = Number(result.score);
            const scorePercent =
              result.score_percent != null
                ? Math.round(Number(result.score_percent))
                : Number.isFinite(totalPoints) &&
                    totalPoints > 0 &&
                    Number.isFinite(scorePoints)
                  ? Math.round((scorePoints / totalPoints) * 100)
                  : 0;
            const passed = Boolean(result.passed);
            const attemptsMade =
              typeof result.attempts_made === 'number'
                ? result.attempts_made
                : null;
            const localAnswers: Record<string, string> = {};
            for (const [key, value] of Object.entries(answers)) {
              localAnswers[key] = Array.isArray(value)
                ? value.join(',')
                : value;
            }
            submitExamLocal({
              trainingId,
              examId: exam.id,
              lessonId,
              answers: localAnswers,
              scorePercent,
              passed,
            });

            const summaryParts = [
              Number.isFinite(scorePoints) &&
              Number.isFinite(totalPoints) &&
              totalPoints > 0
                ? `Score ${scorePoints}/${totalPoints}`
                : result.score_percent != null
                  ? `Score ${scorePercent}%`
                  : null,
              attemptsMade != null && attemptsMade > 0
                ? `${attemptsMade} time${attemptsMade === 1 ? '' : 's'} submitted`
                : null,
              typeof result.feedback === 'string' && result.feedback.trim()
                ? result.feedback.trim()
                : null,
            ].filter(Boolean);

            Alert.alert(
              passed ? 'Quiz submitted · passed' : 'Quiz submitted',
              summaryParts.length > 0
                ? summaryParts.join('\n')
                : 'Your answers were submitted for scoring.',
              [{ text: 'OK', onPress: () => router.back() }],
            );
          },
          onError: (error) => {
            const axiosData =
              error &&
              typeof error === 'object' &&
              'response' in error
                ? (
                    error as {
                      response?: {
                        data?: Parameters<typeof getApiErrorMessage>[0];
                      };
                    }
                  ).response?.data
                : undefined;
            const message =
              (error &&
              typeof error === 'object' &&
              'message' in error &&
              typeof (error as { message: unknown }).message === 'string'
                ? (error as { message: string }).message
                : '') ||
              getApiErrorMessage(axiosData, 'Could not submit this quiz.');
            Alert.alert('Submit failed', message);
          },
        },
      );
      return;
    }

    let correct = 0;
    for (const question of exam.questions) {
      if (
        question.correctOptionId &&
        answers[question.id] === question.correctOptionId
      ) {
        correct += 1;
      }
    }
    const scorePercent = Math.round((correct / exam.questions.length) * 100);
    const passed = scorePercent >= exam.passPercent;
    const localAnswers: Record<string, string> = {};
    for (const [key, value] of Object.entries(answers)) {
      localAnswers[key] = Array.isArray(value) ? value.join(',') : value;
    }

    submitExamLocal({
      trainingId,
      examId: exam.id,
      lessonId,
      answers: localAnswers,
      scorePercent,
      passed,
    });

    Alert.alert(
      passed ? 'Exam submitted · passed' : 'Exam submitted',
      `Score ${scorePercent}% · pass mark ${exam.passPercent}%. Progress tracker updated.`,
      [{ text: 'OK', onPress: () => router.back() }],
    );
  };

  return (
    <MarketTrainingScreenShell
      eyebrow="Quiz"
      title={exam.title}
      keyboardAware
    >
      {exam.questions.map((question, index) => {
        const type = question.questionType ?? 'single_choice';
        const value = answers[question.id];

        return (
          <TrainingSection key={question.id} label={`Question ${index + 1}`}>
            <TrainingCard>
              <Text style={styles.typeHint}>{questionHint(question)}</Text>
              <Text style={styles.prompt}>{question.prompt}</Text>

              {type === 'short_answer' || type === 'essay' ? (
                <TextInput
                  style={[
                    styles.textAnswer,
                    type === 'essay' && styles.textAnswerEssay,
                  ]}
                  value={typeof value === 'string' ? value : ''}
                  onChangeText={(text) => onTextChange(question.id, text)}
                  placeholder={
                    type === 'essay'
                      ? 'Write your answer…'
                      : 'Type a short answer…'
                  }
                  placeholderTextColor={TRAINING_MUTED}
                  multiline={type === 'essay'}
                  textAlignVertical={type === 'essay' ? 'top' : 'center'}
                />
              ) : (
                <View style={styles.options}>
                  {question.options.map((option) => {
                    const selected = Array.isArray(value)
                      ? value.includes(option.id)
                      : value === option.id;
                    return (
                      <Pressable
                        key={option.id}
                        style={[
                          styles.option,
                          selected && styles.optionSelected,
                        ]}
                        onPress={() =>
                          type === 'multiple_select'
                            ? onToggleMulti(question.id, option.id)
                            : onSelectSingle(question.id, option.id)
                        }
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                      >
                        {type === 'multiple_select' ? (
                          <View
                            style={[
                              styles.checkbox,
                              selected && styles.checkboxSelected,
                            ]}
                          />
                        ) : (
                          <View
                            style={[
                              styles.radioOuter,
                              selected && styles.radioOuterSelected,
                            ]}
                          >
                            {selected ? (
                              <View style={styles.radioInner} />
                            ) : null}
                          </View>
                        )}
                        <Text
                          style={[
                            styles.optionText,
                            selected && styles.optionTextSelected,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </TrainingCard>
          </TrainingSection>
        );
      })}

      <TrainingPrimaryButton
        label={
          submitAssessment.isPending ? 'Submitting…' : 'Submit quiz'
        }
        onPress={onSubmit}
      />
    </MarketTrainingScreenShell>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    paddingVertical: c(40, 32),
    alignItems: 'center',
    gap: c(10, 8),
  },
  meta: {
    fontSize: c(12.5, 11.5),
    color: TRAINING_MUTED,
    lineHeight: c(18, 16),
  },
  typeHint: {
    fontSize: c(11, 10),
    fontWeight: '700',
    color: TRAINING_GREEN,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: c(6, 4),
  },
  prompt: {
    fontSize: NU.cardTitle,
    fontWeight: '700',
    color: TRAINING_TEAL,
    lineHeight: c(22, 20),
  },
  options: {
    marginTop: c(10, 8),
    gap: c(8, 6),
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(10, 8),
    paddingVertical: c(11, 9),
    paddingHorizontal: c(12, 10),
    borderRadius: NU.cardRadiusSm,
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    backgroundColor: '#FFFFFF',
  },
  optionSelected: {
    borderColor: TRAINING_GREEN,
    backgroundColor: '#f5faf3',
  },
  radioOuter: {
    width: c(20, 18),
    height: c(20, 18),
    borderRadius: 99,
    borderWidth: 2,
    borderColor: TRAINING_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  radioOuterSelected: {
    borderColor: TRAINING_GREEN,
  },
  radioInner: {
    width: c(10, 9),
    height: c(10, 9),
    borderRadius: 99,
    backgroundColor: TRAINING_GREEN,
  },
  checkbox: {
    width: c(18, 16),
    height: c(18, 16),
    borderRadius: 4,
    borderWidth: 2,
    borderColor: TRAINING_BORDER,
  },
  checkboxSelected: {
    borderColor: TRAINING_GREEN,
    backgroundColor: TRAINING_GREEN,
  },
  optionText: {
    flex: 1,
    fontSize: NU.body,
    color: TRAINING_TEAL,
    fontWeight: '600',
  },
  optionTextSelected: {
    color: TRAINING_GREEN,
  },
  textAnswer: {
    marginTop: c(10, 8),
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    borderRadius: NU.cardRadiusSm,
    paddingHorizontal: c(12, 10),
    paddingVertical: c(10, 8),
    fontSize: NU.body,
    color: TRAINING_TEAL,
    backgroundColor: '#FFFFFF',
    minHeight: c(44, 40),
  },
  textAnswerEssay: {
    minHeight: c(120, 100),
  },
});
