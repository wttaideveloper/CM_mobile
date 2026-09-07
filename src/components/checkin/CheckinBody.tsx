import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CheckinPracticeCard } from '@/components/checkin/CheckinPracticeCard';
import { CheckinSparkIcon } from '@/components/checkin/CheckinIcons';
import {
  CHECKIN_PRACTICES,
  CHECKIN_TEAL,
  type CheckinPractice,
} from '@/components/checkin/checkinData';
import { c, NU } from '@/utils/newUiCompact';

type CheckinBodyProps = {
  values: Record<string, number>;
  onChange: (id: string, value: number) => void;
  onSave: () => void;
};

export function CheckinBody({ values, onChange, onSave }: CheckinBodyProps) {
  return (
    <View style={styles.body}>
      <View style={styles.sectionTitle}>
        <CheckinSparkIcon />
        <Text style={styles.sectionText}>Nature-Based Practices</Text>
      </View>

      {CHECKIN_PRACTICES.map((practice: CheckinPractice) => (
        <CheckinPracticeCard
          key={practice.id}
          practice={practice}
          value={values[practice.id] ?? practice.value}
          onChange={(next) => onChange(practice.id, next)}
        />
      ))}

      <Pressable style={styles.save} onPress={onSave} accessibilityRole="button">
        <Text style={styles.saveText}>Save today's check-in</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: NU.hPad,
    paddingTop: NU.headerPadTopHome,
    paddingBottom: NU.bodyPadBottom,
    gap: c(11, 9),
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(9, 7),
  },
  sectionText: {
    fontSize: NU.cardTitleXl,
    fontWeight: '800',
    color: CHECKIN_TEAL,
  },
  save: {
    marginTop: c(6, 4),
    height: NU.searchH,
    borderRadius: 99,
    backgroundColor: CHECKIN_TEAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    fontSize: NU.cardTitleLg,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
