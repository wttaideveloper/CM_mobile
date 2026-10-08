import {
  TRAINING_COMPLETION,
} from '@/components/trainingsAndCourses/trainingData';
import {
  TrainingCard,
  TrainingPrimaryButton,
  TrainingRow,
  TrainingSection,
} from '@/components/trainingsAndCourses/TrainingUi';
import { TrainingScreenShell } from '@/screens/trainingsAndCourses/TrainingScreenShell';

export function TrainingCompletionScreen() {
  const c = TRAINING_COMPLETION;
  return (
    <TrainingScreenShell eyebrow="Training completion" title="Completion">
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
    </TrainingScreenShell>
  );
}
