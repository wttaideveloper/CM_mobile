import {
  TRAINING_PARTICIPANTS,
} from '@/components/market/marketTrainingData';
import {
  TrainingCard,
  TrainingPrimaryButton,
  TrainingRow,
  TrainingSection,
} from '@/components/market/MarketTrainingUi';
import { MarketTrainingScreenShell } from '@/screens/market/MarketTrainingScreenShell';

export function MarketTrainingParticipantsScreen() {
  return (
    <MarketTrainingScreenShell eyebrow="Enrollment" title="Participants">
      <TrainingSection label="Participant list · enrollment · status">
        <TrainingCard>
          {TRAINING_PARTICIPANTS.map((person) => (
            <TrainingRow
              key={person.id}
              title={person.name}
              meta={`Enrolled ${person.enrolled} · ${person.note}`}
              value={person.status}
            />
          ))}
        </TrainingCard>
      </TrainingSection>

      <TrainingSection label="Search · filter · export · notes · communication">
        <TrainingCard>
          <TrainingRow title="Search / filter" meta="Active · Waitlist · Withdrawn" />
          <TrainingRow title="Export participants" meta="CSV export (static)" />
          <TrainingRow title="Participant notes" meta="Shown under each enrollee" />
          <TrainingRow title="Communication" meta="Message cohort (static)" />
        </TrainingCard>
      </TrainingSection>

      <TrainingPrimaryButton label="Confirm enrollment (static)" />
    </MarketTrainingScreenShell>
  );
}
