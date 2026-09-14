import {
  TRAINING_ATTENDANCE,
} from '@/components/market/marketTrainingData';
import {
  TrainingCard,
  TrainingPrimaryButton,
  TrainingRow,
  TrainingSection,
} from '@/components/market/MarketTrainingUi';
import { MarketTrainingScreenShell } from '@/screens/market/MarketTrainingScreenShell';

export function MarketTrainingAttendanceScreen() {
  return (
    <MarketTrainingScreenShell eyebrow="Attendance management" title="Attendance">
      <TrainingSection label="Record attendance · present/absent · session">
        <TrainingCard>
          {TRAINING_ATTENDANCE.map((row) => (
            <TrainingRow
              key={row.id}
              title={row.session}
              meta={`Present ${row.present} · Absent ${row.absent}`}
              value={row.rate}
            />
          ))}
        </TrainingCard>
      </TrainingSection>

      <TrainingSection label="QR / manual check-in · percentage · history">
        <TrainingCard>
          <TrainingRow title="QR check-in" meta="Scan at session start (static)" />
          <TrainingRow title="Manual check-in" meta="Mark present / absent" />
          <TrainingRow title="Attendance percentage" meta="Cohort average 87%" />
          <TrainingRow title="Attendance history" meta="Session 1 recorded" />
        </TrainingCard>
      </TrainingSection>

      <TrainingPrimaryButton label="Save attendance (static)" />
    </MarketTrainingScreenShell>
  );
}
