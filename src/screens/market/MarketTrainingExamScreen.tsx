import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  TRAINING_BORDER,
  TRAINING_GREEN,
  TRAINING_MUTED,
  TRAINING_TEAL,
  TRAINING_TRACK,
} from '@/components/market/marketTrainingData';
import { getTrainingExam } from '@/components/market/marketTrainingProgressData';
import {
  TrainingCard,
  TrainingPrimaryButton,
  TrainingSection,
} from '@/components/market/MarketTrainingUi';
import { MarketTrainingScreenShell } from '@/screens/market/MarketTrainingScreenShell';
import { useTrainingProgressStore } from '@/stores/trainingProgress.store';
import { c, NU } from '@/utils/newUiCompact';

export function MarketTrainingExamScreen() {
  const router = useRouter();
  const { trainingId, examId, lessonId } = useLocalSearchParams<{
    trainingId?: string;
    examId?: string;
    lessonId?: string;
  }>();
  const exam = getTrainingExam(trainingId, examId);
  const submitExam = useTrainingProgressStore((s) => s.submitExam);
  const existing = useTrainingProgressStore((s) =>
    trainingId && examId
      ? s.getBucket(trainingId).examAttempts[examId]
      : undefined,
  );

  const [answers, setAnswers] = useState<Record<string, string>>(
    () => existing?.answers ?? {},
  );
  const [submittedPreview, setSubmittedPreview] = useState<{
    scorePercent: number;
    passed: boolean;
  } | null>(
    existing
      ? { scorePercent: existing.scorePercent, passed: existing.passed }
      : null,
  );

  const answeredCount = useMemo(
    () => Object.keys(answers).length,
    [answers],
  );

  if (!exam || !trainingId) {
    return (
      <MarketTrainingScreenShell eyebrow="Exam" title="Exam not found">
        <TrainingCard>
          <Text style={styles.meta}>This MCQ exam could not be loaded.</Text>
          <TrainingPrimaryButton label="Go back" onPress={() => router.back()} />
        </TrainingCard>
      </MarketTrainingScreenShell>
    );
  }

  const onSelect = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    setSubmittedPreview(null);
  };

  const onSubmit = () => {
    if (answeredCount < exam.questions.length) {
      Alert.alert(
        'Answer all questions',
        `You answered ${answeredCount} of ${exam.questions.length}.`,
      );
      return;
    }

    let correct = 0;
    for (const question of exam.questions) {
      if (answers[question.id] === question.correctOptionId) correct += 1;
    }
    const scorePercent = Math.round((correct / exam.questions.length) * 100);
    const passed = scorePercent >= exam.passPercent;

    submitExam({
      trainingId,
      examId: exam.id,
      lessonId,
      answers,
      scorePercent,
      passed,
    });
    setSubmittedPreview({ scorePercent, passed });

    Alert.alert(
      passed ? 'Exam submitted · passed' : 'Exam submitted',
      `Score ${scorePercent}% · pass mark ${exam.passPercent}%. Progress tracker updated.`,
      [{ text: 'OK', onPress: () => router.back() }],
    );
  };

  return (
    <MarketTrainingScreenShell
      eyebrow="MCQ exam"
      title={exam.title}
    >
      <TrainingSection label={exam.subtitle}>
        <TrainingCard>
          <Text style={styles.meta}>
            {exam.questionCount} questions · pass ≥ {exam.passPercent}% ·{' '}
            {answeredCount}/{exam.questions.length} answered
          </Text>
          {submittedPreview ? (
            <View style={styles.resultBox}>
              <Text style={styles.resultTitle}>
                Last submit · {submittedPreview.scorePercent}%
                {submittedPreview.passed ? ' · Passed' : ' · Below pass mark'}
              </Text>
              <Text style={styles.meta}>
                You can change answers and resubmit to update progress.
              </Text>
            </View>
          ) : null}
        </TrainingCard>
      </TrainingSection>

      {exam.questions.map((question, index) => (
        <TrainingSection
          key={question.id}
          label={`Question ${index + 1}`}
        >
          <TrainingCard>
            <Text style={styles.prompt}>{question.prompt}</Text>
            <View style={styles.options}>
              {question.options.map((option) => {
                const selected = answers[question.id] === option.id;
                return (
                  <Pressable
                    key={option.id}
                    style={[styles.option, selected && styles.optionSelected]}
                    onPress={() => onSelect(question.id, option.id)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                  >
                    <View
                      style={[
                        styles.radio,
                        selected && styles.radioSelected,
                      ]}
                    />
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
          </TrainingCard>
        </TrainingSection>
      ))}

      <TrainingPrimaryButton label="Submit exam" onPress={onSubmit} />
    </MarketTrainingScreenShell>
  );
}

const styles = StyleSheet.create({
  meta: {
    fontSize: c(12.5, 11.5),
    color: TRAINING_MUTED,
    lineHeight: c(18, 16),
  },
  resultBox: {
    marginTop: c(8, 6),
    backgroundColor: '#f5faf3',
    borderRadius: NU.cardRadiusSm,
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    padding: c(11, 9),
    gap: c(4, 3),
  },
  resultTitle: {
    fontSize: NU.link,
    fontWeight: '700',
    color: TRAINING_GREEN,
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
  radio: {
    width: c(18, 16),
    height: c(18, 16),
    borderRadius: 99,
    borderWidth: 2,
    borderColor: TRAINING_TRACK,
  },
  radioSelected: {
    borderColor: TRAINING_GREEN,
    backgroundColor: TRAINING_GREEN,
  },
  optionText: {
    flex: 1,
    fontSize: c(13.5, 12.5),
    color: TRAINING_TEAL,
    lineHeight: c(19, 17),
  },
  optionTextSelected: {
    fontWeight: '700',
  },
});
