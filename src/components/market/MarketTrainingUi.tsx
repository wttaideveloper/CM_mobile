import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  TRAINING_BORDER,
  TRAINING_GREEN,
  TRAINING_MUTED,
  TRAINING_TEAL,
  TRAINING_TRACK,
} from '@/components/market/marketTrainingData';
import { c, NU } from '@/utils/newUiCompact';

export function TrainingSection({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {children}
    </View>
  );
}

export function TrainingCard({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export function TrainingRow({
  title,
  meta,
  onPress,
  value,
}: {
  title: string;
  meta?: string;
  value?: string;
  onPress?: () => void;
}) {
  const content = (
    <>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        {meta ? <Text style={styles.rowMeta}>{meta}</Text> : null}
      </View>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {onPress ? <Text style={styles.chevron}>›</Text> : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable style={styles.row} onPress={onPress} accessibilityRole="button">
        {content}
      </Pressable>
    );
  }

  return <View style={styles.row}>{content}</View>;
}

export function TrainingChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function TrainingPrimaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.primary} onPress={onPress} accessibilityRole="button">
      <Text style={styles.primaryText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: c(10, 8),
  },
  sectionLabel: {
    fontSize: NU.body,
    fontWeight: '700',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: TRAINING_MUTED,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    borderRadius: NU.cardRadius,
    padding: c(15, 12),
    gap: c(10, 8),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(10, 8),
    paddingVertical: c(4, 2),
  },
  rowCopy: {
    flex: 1,
    gap: c(2, 1),
  },
  rowTitle: {
    fontSize: NU.link,
    fontWeight: '700',
    color: TRAINING_TEAL,
  },
  rowMeta: {
    fontSize: c(12.5, 11.5),
    color: TRAINING_MUTED,
  },
  rowValue: {
    fontSize: NU.body,
    fontWeight: '700',
    color: TRAINING_TEAL,
  },
  chevron: {
    fontSize: c(22, 20),
    color: TRAINING_MUTED,
    lineHeight: c(24, 22),
  },
  chip: {
    paddingHorizontal: c(12, 10),
    paddingVertical: c(8, 7),
    borderRadius: 99,
    backgroundColor: TRAINING_TRACK,
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
  },
  chipActive: {
    backgroundColor: TRAINING_GREEN,
    borderColor: TRAINING_GREEN,
  },
  chipText: {
    fontSize: c(12.5, 11.5),
    fontWeight: '700',
    color: TRAINING_TEAL,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  primary: {
    height: c(46, 42),
    borderRadius: 99,
    backgroundColor: TRAINING_TEAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    fontSize: NU.cardTitle,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
