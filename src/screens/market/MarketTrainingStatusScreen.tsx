import {
  TRAINING_STATUS_ACTIONS,
} from '@/components/market/marketTrainingData';
import {
  TrainingCard,
  TrainingPrimaryButton,
  TrainingRow,
  TrainingSection,
} from '@/components/market/MarketTrainingUi';
import { MarketTrainingScreenShell } from '@/screens/market/MarketTrainingScreenShell';

export function MarketTrainingStatusScreen() {
  return (
    <MarketTrainingScreenShell eyebrow="Activate / deactivate" title="Status">
      <TrainingSection label="Activate · deactivate · publish · status">
        <TrainingCard>
          {TRAINING_STATUS_ACTIONS.map((item) => (
            <TrainingRow key={item.id} title={item.title} meta={item.meta} />
          ))}
        </TrainingCard>
      </TrainingSection>

      <TrainingSection label="Reason · reactivation · confirmation · history">
        <TrainingCard>
          <TrainingRow title="Deactivation reason" meta="Seasonal pause" />
          <TrainingRow title="Reactivation" meta="Available after review" />
          <TrainingRow title="Confirmation" meta="Requires admin confirm" />
          <TrainingRow title="Status history" meta="Published → Active" />
        </TrainingCard>
      </TrainingSection>

      <TrainingPrimaryButton label="Update status (static)" />
    </MarketTrainingScreenShell>
  );
}
