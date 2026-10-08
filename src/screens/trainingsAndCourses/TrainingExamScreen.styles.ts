import { StyleSheet } from 'react-native';

import {
  TRAINING_BORDER,
  TRAINING_GREEN,
  TRAINING_MUTED,
  TRAINING_TEAL,
} from '@/components/trainingsAndCourses/trainingData';

import { c, NU } from '@/utils/newUiCompact';

export const styles = StyleSheet.create({
  loadingWrap: {
    paddingVertical: c(40, 32),
    alignItems: 'center',
    gap: c(10, 8),
  },
  meta: {
    fontSize: c(12.5, 11.5),
    color: TRAINING_MUTED,
    lineHeight: c(18, 16),
  },
  typeHint: {
    fontSize: c(11, 10),
    fontWeight: '700',
    color: TRAINING_GREEN,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: c(6, 4),
  },
  prompt: {
    fontSize: NU.cardTitle,
    fontWeight: '700',
    color: TRAINING_TEAL,
    lineHeight: c(22, 20),
  },
  options: {
    marginTop: c(10, 8),
    gap: c(8, 6),
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(10, 8),
    paddingVertical: c(11, 9),
    paddingHorizontal: c(12, 10),
    borderRadius: NU.cardRadiusSm,
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    backgroundColor: '#FFFFFF',
  },
  optionSelected: {
    borderColor: TRAINING_GREEN,
    backgroundColor: '#f5faf3',
  },
  radioOuter: {
    width: c(20, 18),
    height: c(20, 18),
    borderRadius: 99,
    borderWidth: 2,
    borderColor: TRAINING_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  radioOuterSelected: {
    borderColor: TRAINING_GREEN,
  },
  radioInner: {
    width: c(10, 9),
    height: c(10, 9),
    borderRadius: 99,
    backgroundColor: TRAINING_GREEN,
  },
  checkbox: {
    width: c(18, 16),
    height: c(18, 16),
    borderRadius: 4,
    borderWidth: 2,
    borderColor: TRAINING_BORDER,
  },
  checkboxSelected: {
    borderColor: TRAINING_GREEN,
    backgroundColor: TRAINING_GREEN,
  },
  optionText: {
    flex: 1,
    fontSize: NU.body,
    color: TRAINING_TEAL,
    fontWeight: '600',
  },
  optionTextSelected: {
    color: TRAINING_GREEN,
  },
  textAnswer: {
    marginTop: c(10, 8),
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    borderRadius: NU.cardRadiusSm,
    paddingHorizontal: c(12, 10),
    paddingVertical: c(10, 8),
    fontSize: NU.body,
    color: TRAINING_TEAL,
    backgroundColor: '#FFFFFF',
    minHeight: c(44, 40),
  },
  textAnswerEssay: {
    minHeight: c(120, 100),
  },
});
