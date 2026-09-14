import {
  TRAINING_ANALYTICS,
} from '@/components/market/marketTrainingData';
import {
  TrainingCard,
  TrainingPrimaryButton,
  TrainingRow,
  TrainingSection,
} from '@/components/market/MarketTrainingUi';
import { MarketTrainingScreenShell } from '@/screens/market/MarketTrainingScreenShell';

export function MarketTrainingAnalyticsScreen() {
  return (
    <MarketTrainingScreenShell eyebrow="Training analytics" title="Analytics">
      <TrainingSection label="Enrollments · attendance · completion · revenue">
        <TrainingCard>
          {TRAINING_ANALYTICS.map((item) => (
            <TrainingRow key={item.id} title={item.label} value={item.value} />
          ))}
        </TrainingCard>
      </TrainingSection>

      <TrainingSection label="Trends · popular · trainer performance">
        <TrainingCard>
          <TrainingRow title="Enrollment trends" meta="+18% vs last cohort" />
          <TrainingRow title="Popular trainings" meta="Metabolic foundations #1" />
          <TrainingRow title="Trainer performance" meta="Maya · 4.9 avg rating" />
          <TrainingRow title="Cancellation rate" meta="4%" />
        </TrainingCard>
      </TrainingSection>

      <TrainingPrimaryButton label="Export analytics (static)" />
    </MarketTrainingScreenShell>
  );
}
