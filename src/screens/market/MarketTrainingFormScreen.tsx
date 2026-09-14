import { Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  TRAINING_BORDER,
  TRAINING_FORM_SECTIONS,
  TRAINING_MUTED,
  TRAINING_TEAL,
} from '@/components/market/marketTrainingData';
import {
  TrainingCard,
  TrainingPrimaryButton,
  TrainingSection,
} from '@/components/market/MarketTrainingUi';
import { MarketTrainingScreenShell } from '@/screens/market/MarketTrainingScreenShell';
import { c, NU } from '@/utils/newUiCompact';

export function MarketTrainingFormScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string; id?: string }>();
  const title =
    mode === 'edit'
      ? 'Edit training'
      : mode === 'duplicate'
        ? 'Duplicate training'
        : 'Create training';

  return (
    <MarketTrainingScreenShell eyebrow="Training management" title={title}>
      {TRAINING_FORM_SECTIONS.map((section) => (
        <TrainingSection key={section.id} label={section.title}>
          <TrainingCard>
            {section.fields.map((field) => (
              <View key={field} style={{ gap: 6 }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: TRAINING_MUTED,
                    textTransform: 'uppercase',
                    letterSpacing: 0.4,
                  }}
                >
                  {field}
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: TRAINING_BORDER,
                    borderRadius: NU.cardRadiusSm,
                    paddingHorizontal: c(12, 10),
                    paddingVertical: c(11, 9),
                    fontSize: NU.link,
                    color: TRAINING_TEAL,
                    backgroundColor: '#f8fcf9',
                  }}
                  placeholder={`Enter ${field.toLowerCase()}`}
                  placeholderTextColor={TRAINING_MUTED}
                  defaultValue={
                    mode === 'duplicate' && field === 'Name'
                      ? 'Metabolic health foundations (copy)'
                      : mode === 'edit' && field === 'Name'
                        ? 'Metabolic health foundations'
                        : ''
                  }
                />
              </View>
            ))}
          </TrainingCard>
        </TrainingSection>
      ))}

      <TrainingPrimaryButton
        label="Save training (static)"
        onPress={() => router.back()}
      />
    </MarketTrainingScreenShell>
  );
}
