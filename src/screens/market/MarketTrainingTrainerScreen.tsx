import {
  TRAINING_TRAINERS,
} from '@/components/market/marketTrainingData';
import {
  TrainingCard,
  TrainingPrimaryButton,
  TrainingRow,
  TrainingSection,
} from '@/components/market/MarketTrainingUi';
import { MarketTrainingScreenShell } from '@/screens/market/MarketTrainingScreenShell';

export function MarketTrainingTrainerScreen() {
  return (
    <MarketTrainingScreenShell eyebrow="Trainer management" title="Trainers">
      <TrainingSection label="Assign trainer · info · availability">
        <TrainingCard>
          {TRAINING_TRAINERS.map((trainer) => (
            <TrainingRow
              key={trainer.id}
              title={trainer.name}
              meta={`${trainer.role} · ${trainer.bio}`}
              value={trainer.availability.includes('available') ? 'Available' : 'Backup'}
            />
          ))}
        </TrainingCard>
      </TrainingSection>

      <TrainingSection label="Multiple trainers · bio · schedule · replacement">
        <TrainingCard>
          <TrainingRow title="Multiple trainers" meta="Lead + co-trainer assigned" />
          <TrainingRow title="Trainer-specific schedule" meta="Maya · Tue evenings" />
          <TrainingRow title="Trainer replacement" meta="Jordan covers Oct 7 exception" />
        </TrainingCard>
      </TrainingSection>

      <TrainingPrimaryButton label="Assign trainer (static)" />
    </MarketTrainingScreenShell>
  );
}
