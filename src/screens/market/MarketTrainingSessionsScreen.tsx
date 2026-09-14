import { StyleSheet, Text, View } from 'react-native';

import {
  TRAINING_BORDER,
  TRAINING_MUTED,
  TRAINING_TEAL,
} from '@/components/market/marketTrainingData';
import { TRAINING_SESSIONS_PROGRESS_PATH } from '@/components/market/marketTrainingProgressData';
import {
  TrainingCard,
  TrainingPrimaryButton,
  TrainingRow,
  TrainingSection,
} from '@/components/market/MarketTrainingUi';
import { MarketTrainingScreenShell } from '@/screens/market/MarketTrainingScreenShell';
import { c, NU } from '@/utils/newUiCompact';

export function MarketTrainingSessionsScreen() {
  const path = TRAINING_SESSIONS_PROGRESS_PATH;

  return (
    <MarketTrainingScreenShell
      eyebrow="Training sessions"
      title="Sessions"
      rightLabel="Add"
    >
      <TrainingSection label="Professional curriculum · day-wise path">
        <Text style={styles.helper}>
          Udemy-style days with videos, Zoom live lessons, and MCQ exams that
          unlock after content is completed.
        </Text>
        {path.days.map((day) => (
          <TrainingCard key={day.id}>
            <Text style={[styles.kind, styles.kindSession]}>{day.dayLabel}</Text>
            <Text style={styles.title}>{day.title}</Text>
            <Text style={styles.meta}>{day.summary}</Text>
            <View style={styles.box}>
              {day.lessons.map((lesson) => (
                <Text key={lesson.id} style={styles.concept}>
                  {lesson.kind === 'video'
                    ? '▶'
                    : lesson.kind === 'live'
                      ? '●'
                      : '✎'}{' '}
                  {lesson.title}
                  {' · '}
                  {lesson.duration}
                </Text>
              ))}
            </View>
          </TrainingCard>
        ))}
      </TrainingSection>

      <TrainingSection label="Reordering · notes · status · materials">
        <TrainingCard>
          <TrainingRow title="Reorder days" meta="Drag order UI (static)" />
          <TrainingRow
            title="Videos & Zoom"
            meta="Learners watch / join to auto-complete"
          />
          <TrainingRow
            title="Exams unlock"
            meta="After day videos + live are finished"
          />
          <TrainingRow title="Session materials" meta="Attach workbook per day" />
        </TrainingCard>
      </TrainingSection>

      <TrainingPrimaryButton label="Create session (static)" />
    </MarketTrainingScreenShell>
  );
}

const styles = StyleSheet.create({
  helper: {
    marginBottom: c(2, 1),
    fontSize: c(12.5, 11.5),
    color: TRAINING_MUTED,
    lineHeight: c(18, 16),
  },
  kind: {
    alignSelf: 'flex-start',
    fontSize: NU.label,
    fontWeight: '700',
    paddingVertical: c(3, 2),
    paddingHorizontal: c(7, 6),
    borderRadius: c(5, 4),
    overflow: 'hidden',
  },
  kindSession: {
    color: '#3c63c8',
    backgroundColor: '#eaf1ff',
  },
  title: {
    marginTop: c(6, 4),
    fontSize: NU.cardTitle,
    fontWeight: '700',
    color: TRAINING_TEAL,
  },
  meta: {
    marginTop: c(2, 1),
    fontSize: c(12.5, 11.5),
    color: TRAINING_MUTED,
  },
  box: {
    marginTop: c(8, 6),
    backgroundColor: '#f5faf3',
    borderRadius: NU.cardRadiusSm,
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    padding: c(11, 9),
    gap: c(4, 3),
  },
  concept: {
    fontSize: c(12.5, 11.5),
    color: TRAINING_TEAL,
    lineHeight: c(18, 16),
  },
});
