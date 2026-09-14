import {
  TRAINING_CERTIFICATES,
} from '@/components/market/marketTrainingData';
import {
  TrainingCard,
  TrainingPrimaryButton,
  TrainingRow,
  TrainingSection,
} from '@/components/market/MarketTrainingUi';
import { MarketTrainingScreenShell } from '@/screens/market/MarketTrainingScreenShell';

export function MarketTrainingCertificatesScreen() {
  return (
    <MarketTrainingScreenShell eyebrow="Certificates" title="Certificates">
      <TrainingSection label="Generate · issue · details">
        <TrainingCard>
          {TRAINING_CERTIFICATES.map((item) => (
            <TrainingRow
              key={item.id}
              title={item.participant}
              meta={item.issued}
              value={item.status}
            />
          ))}
        </TrainingCard>
      </TrainingSection>

      <TrainingSection label="Template · download · verify · reissue">
        <TrainingCard>
          <TrainingRow title="Certificate template" meta="Pulse Labs standard" />
          <TrainingRow title="Download certificate" meta="PDF download (static)" />
          <TrainingRow title="Certificate verification" meta="Code VH-8842" />
          <TrainingRow title="Reissue certificate" meta="Replace lost certificate" />
        </TrainingCard>
      </TrainingSection>

      <TrainingPrimaryButton label="Generate certificate (static)" />
    </MarketTrainingScreenShell>
  );
}
