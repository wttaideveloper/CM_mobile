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

export function MarketTrainingOfflineScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { training, isApiId } = useTraining(id);
  const detail = isApiId ? training : buildStaticTrainingDetail(id);
  const lessons = detail?.downloadableLessons ?? [];
  const notes = detail?.instructorNotes ?? [];
  const docs =
    detail?.materials.filter((item) => item.downloadable) ?? [];

  return (
    <MarketTrainingScreenShell eyebrow="Offline" title="Downloads">
      <TrainingSection label="Access rules">
        <TrainingCard>
          <Text style={styles.meta}>
            {detail?.offlineEnabled
              ? 'This course is offline-enabled. Only enrolled learners (or staff) can download.'
              : 'Offline access is not enabled for this course yet.'}
          </Text>
        </TrainingCard>
      </TrainingSection>

      <TrainingSection label={`${lessons.length} downloadable lessons`}>
        {lessons.map((lesson) => (
          <TrainingCard key={lesson.id}>
            <Text style={styles.title}>{lesson.title}</Text>
            <Text style={styles.meta}>{lesson.size}</Text>
            <Pressable
              style={styles.btn}
              onPress={() =>
                Alert.alert(
                  'Download lesson',
                  'Static preview · lesson file download API coming soon.',
                )
              }
            >
              <Text style={styles.btnText}>Download</Text>
            </Pressable>
          </TrainingCard>
        ))}
        {lessons.length === 0 ? (
          <Text style={styles.meta}>No downloadable lessons listed.</Text>
        ) : null}
      </TrainingSection>

      <TrainingSection label="Instructor notes & documents">
        {[...notes.map((n) => ({ id: n.id, title: n.title, meta: 'Instructor note' })),
          ...docs.map((d) => ({
            id: d.id,
            title: d.title,
            meta: `${d.type} · ${d.size}`,
          }))].map((item) => (
          <TrainingCard key={item.id}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.meta}>{item.meta}</Text>
            <Pressable
              style={styles.btn}
              onPress={() =>
                Alert.alert(
                  'Download file',
                  'Static preview · enrolled learners will get the file URL.',
                )
              }
            >
              <Text style={styles.btnText}>Download</Text>
            </Pressable>
          </TrainingCard>
        ))}
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
