import {
  TRAINING_APPROVAL,
} from '@/components/trainingsAndCourses/trainingData';
import {
  TrainingCard,
  TrainingPrimaryButton,
  TrainingRow,
  TrainingSection,
} from '@/components/trainingsAndCourses/TrainingUi';
import { TrainingScreenShell } from '@/screens/trainingsAndCourses/TrainingScreenShell';

export function TrainingApprovalScreen() {
  const a = TRAINING_APPROVAL;
  return (
    <TrainingScreenShell eyebrow="Training approval" title="Approval">
      <TrainingSection label="Submit · review · approve · reject · changes">
        <TrainingCard>
          <TrainingRow title="Current state" value={a.state} />
          <TrainingRow title="Submitted" meta={a.submitted} />
          <TrainingRow title="Reviewer" meta={a.reviewer} />
          <TrainingRow title="Review comments" meta={a.comments} />
          <TrainingRow title="Rejection reason" meta="—" />
        </TrainingCard>
      </TrainingSection>

      <TrainingSection label="Resubmission · notifications · history">
        <TrainingCard>
          {a.history.map((item) => (
            <TrainingRow key={item.id} title={item.label} meta={item.when} />
          ))}
          <TrainingRow title="Approval notifications" meta="Email to submitter" />
        </TrainingCard>
      </TrainingSection>

      <TrainingPrimaryButton label="Submit for approval (static)" />
    </TrainingScreenShell>
  );
}
