import {
  TRAINING_NOTIFICATIONS,
} from '@/components/trainingsAndCourses/trainingData';
import {
  TrainingCard,
  TrainingPrimaryButton,
  TrainingRow,
  TrainingSection,
} from '@/components/trainingsAndCourses/TrainingUi';
import { TrainingScreenShell } from '@/screens/trainingsAndCourses/TrainingScreenShell';

export function TrainingNotificationsScreen() {
  return (
    <TrainingScreenShell eyebrow="Training notifications" title="Notifications">
      <TrainingSection label="Enrollment · reminder · schedule · cancellation">
        <TrainingCard>
          {TRAINING_NOTIFICATIONS.map((item) => (
            <TrainingRow
              key={item.id}
              title={item.title}
              meta={item.channels}
              value={item.enabled ? 'On' : 'Off'}
            />
          ))}
        </TrainingCard>
      </TrainingSection>

      <TrainingSection label="Email / SMS / Push · session · certificate">
        <TrainingCard>
          <TrainingRow title="Channel defaults" meta="Email + Push enabled" />
          <TrainingRow title="Session reminder" meta="2 hours before" />
          <TrainingRow title="Completion / certificate" meta="On issue" />
        </TrainingCard>
      </TrainingSection>

      <TrainingPrimaryButton label="Save notification prefs (static)" />
    </TrainingScreenShell>
  );
}
