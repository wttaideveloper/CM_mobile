import {
  TRAINING_INSTRUCTOR_NOTES,
  TRAINING_MATERIALS,
} from '@/components/market/marketTrainingData';
import {
  TrainingCard,
  TrainingPrimaryButton,
  TrainingRow,
  TrainingSection,
} from '@/components/market/MarketTrainingUi';
import { MarketTrainingScreenShell } from '@/screens/market/MarketTrainingScreenShell';

export function MarketTrainingMaterialsScreen() {
  return (
    <MarketTrainingScreenShell eyebrow="Training materials" title="Materials">
      <TrainingSection label="Documents · videos · resources">
        <TrainingCard>
          {TRAINING_MATERIALS.map((item) => (
            <TrainingRow
              key={item.id}
              title={item.title}
              meta={`${item.type} · ${item.size} · ${item.visible}${
                item.downloadable ? ' · Offline' : ''
              }`}
            />
          ))}
        </TrainingCard>
      </TrainingSection>

      <TrainingSection label="Instructor notes (title + file link)">
        <TrainingCard>
          {TRAINING_INSTRUCTOR_NOTES.map((note) => (
            <TrainingRow
              key={note.id}
              title={note.title}
              meta="Shows in learner offline downloads"
            />
          ))}
        </TrainingCard>
      </TrainingSection>

      <TrainingSection label="Offline · visibility · notes PDF">
        <TrainingCard>
          <TrainingRow
            title="Offline-enabled course"
            meta="Mark course + per-lesson downloadable flags"
          />
          <TrainingRow
            title="Downloadable lessons API"
            meta="List + download lesson files for enrolled learners"
          />
          <TrainingRow
            title="Auto notes PDF"
            meta="Title · description · objectives · requirements"
          />
          <TrainingRow title="Resource visibility" meta="Public preview / Enrolled only" />
        </TrainingCard>
      </TrainingSection>

      <TrainingPrimaryButton label="Upload material / note (static)" />
    </MarketTrainingScreenShell>
  );
}
