import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CheckinPracticeCard } from '@/components/checkin/CheckinPracticeCard';
import { CheckinCheckIcon, CheckinSparkIcon } from '@/components/checkin/CheckinIcons';
import {
  CHECKIN_PRACTICES,
  CHECKIN_TEAL,
  type CheckinPractice,
} from '@/components/checkin/checkinData';
import { c, NU } from '@/utils/newUiCompact';

const SAVE_CONFIRM_MS = 550;

type CheckinBodyProps = {
  values: Record<string, number>;
  onChange: (id: string, value: number) => void;
  onSave: () => void;
};

export function CheckinBody({ values, onChange, onSave }: CheckinBodyProps) {
  const [saved, setSaved] = useState(false);
  const savingRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleSave = () => {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaved(true);
    timeoutRef.current = setTimeout(() => {
      onSave();
    }, SAVE_CONFIRM_MS);
  };

  return (
    <View style={styles.body}>
      <View style={styles.sectionTitle}>
        <CheckinSparkIcon />
        <Text style={styles.sectionText} accessibilityRole="header">
          Nature-Based Practices
        </Text>
      </View>

      {CHECKIN_PRACTICES.map((practice: CheckinPractice) => (
        <CheckinPracticeCard
          key={practice.id}
          practice={practice}
          value={values[practice.id] ?? practice.value}
          onChange={(next) => onChange(practice.id, next)}
        />
      ))}

      <Pressable
        style={({ pressed }) => [
          styles.save,
          pressed && !saved && styles.savePressed,
          saved && styles.saveDone,
        ]}
        onPress={handleSave}
        disabled={saved}
        accessibilityRole="button"
        accessibilityLabel={saved ? 'Check-in saved' : "Save today's check-in"}
        accessibilityHint="Saves your check-in and opens your HWI score"
        accessibilityState={{ disabled: saved, busy: saved }}
      >
        {saved ? (
          <>
            <CheckinCheckIcon color="#FFFFFF" size={16} />
            <Text style={styles.saveText}>Saved</Text>
          </>
        ) : (
          <Text style={styles.saveText}>Save today's check-in</Text>
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: c(8, 6),
  },
  savePressed: {
    opacity: 0.9,
  },
  saveDone: {
    backgroundColor: '#2f7d32',
  },
  saveText: {
    fontSize: NU.cardTitleLg,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
