import {
  TRAINING_COMPLETION,
} from '@/components/market/marketTrainingData';
import {
  TrainingCard,
  TrainingPrimaryButton,
  TrainingRow,
  TrainingSection,
} from '@/components/market/MarketTrainingUi';
import { MarketTrainingScreenShell } from '@/screens/market/MarketTrainingScreenShell';

export function MarketTrainingCompletionScreen() {
  const c = TRAINING_COMPLETION;
  return (
    <MarketTrainingScreenShell eyebrow="Training completion" title="Completion">
      <TrainingSection label="Mark complete · participant status">
        <TrainingCard>
          <TrainingRow title="Completed" value={String(c.completed)} />
          <TrainingRow title="In progress" value={String(c.inProgress)} />
          <TrainingRow title="Not started" value={String(c.notStarted)} />
          <TrainingRow title="Average %" value={c.averagePercent} />
        </TrainingCard>
      </TrainingSection>

      <TrainingSection label="Criteria · percentage · history">
        <TrainingCard>
          <TrainingRow title="Completion criteria" meta={c.criteria} />
          <TrainingRow title="Completion history" meta="6 certificates ready" />
        </TrainingCard>
      </TrainingSection>

      <TrainingPrimaryButton label="Mark training complete (static)" />
    </MarketTrainingScreenShell>
  );
}
