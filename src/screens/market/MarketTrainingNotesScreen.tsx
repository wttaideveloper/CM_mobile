import { Alert, Pressable, StyleSheet, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import {
  TRAINING_MUTED,
  TRAINING_TEAL,
} from '@/components/market/marketTrainingData';
import {
  TrainingCard,
  TrainingSection,
} from '@/components/market/MarketTrainingUi';
import { useTraining } from '@/hooks/useTrainings';
import { MarketTrainingScreenShell } from '@/screens/market/MarketTrainingScreenShell';
import { buildStaticTrainingDetail } from '@/utils/buildStaticTrainingDetail';
import { c, NU } from '@/utils/newUiCompact';

export function MarketTrainingNotesScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { training, isApiId } = useTraining(id);
  const detail = isApiId ? training : buildStaticTrainingDetail(id);

  return (
    <MarketTrainingScreenShell eyebrow="Notes" title="Course notes">
      <TrainingSection label="Auto-generated PDF">
        <TrainingCard>
          <Text style={styles.title}>
            {detail?.title ?? 'Training'} · notes pack
          </Text>
          <Text style={styles.meta}>
            Includes title, description, learning objectives, and requirements —
            one tap for offline reading.
          </Text>
          <Pressable
            style={styles.btn}
            onPress={() =>
              Alert.alert(
                'Notes PDF',
                'Static preview · GET /trainings/{id}/notes.pdf coming soon.',
              )
            }
          >
            <Text style={styles.btnText}>Download notes PDF</Text>
          </Pressable>
        </TrainingCard>
      </TrainingSection>

      <TrainingSection label="What’s inside">
        <TrainingCard>
          <Text style={styles.bullet}>•  {detail?.title}</Text>
          <Text style={styles.bullet}>•  {detail?.description}</Text>
          {(detail?.objectives ?? []).map((item) => (
            <Text key={item} style={styles.bullet}>
              •  {item}
            </Text>
          ))}
          <Text style={styles.meta}>
            Requirements: {detail?.prerequisites ?? '—'}
          </Text>
        </TrainingCard>
      </TrainingSection>

      <TrainingSection
        label={`Instructor uploads · ${detail?.instructorNotes.length ?? 0}`}
      >
        {(detail?.instructorNotes ?? []).map((note) => (
          <TrainingCard key={note.id}>
            <Text style={styles.title}>{note.title}</Text>
            <Text style={styles.meta}>{note.url || 'File link pending'}</Text>
            <Pressable
              style={styles.btn}
              onPress={() =>
                Alert.alert(
                  'Instructor note',
                  'Static preview · opens attached file for enrolled learners.',
                )
              }
            >
              <Text style={styles.btnText}>Open note</Text>
            </Pressable>
          </TrainingCard>
        ))}
        {(detail?.instructorNotes.length ?? 0) === 0 ? (
          <Text style={styles.meta}>No instructor notes uploaded yet.</Text>
        ) : null}
      </TrainingSection>
    </MarketTrainingScreenShell>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: NU.link,
    fontWeight: '700',
    color: TRAINING_TEAL,
  },
  meta: {
    marginTop: c(4, 2),
    fontSize: c(12.5, 11.5),
    color: TRAINING_MUTED,
    lineHeight: c(18, 16),
  },
  bullet: {
    fontSize: NU.link,
    lineHeight: c(20, 18),
    color: TRAINING_TEAL,
  },
  btn: {
    marginTop: c(10, 8),
    alignSelf: 'flex-start',
    paddingHorizontal: c(14, 12),
    paddingVertical: c(8, 7),
    borderRadius: 99,
    backgroundColor: TRAINING_TEAL,
  },
  btnText: {
    fontSize: NU.body,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
