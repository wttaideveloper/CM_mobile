import { StyleSheet } from 'react-native';

import {
  TRAINING_ENROLL_BG,
  TRAINING_ENROLL_BORDER,
  TRAINING_ENROLL_GREEN,
  TRAINING_ENROLL_MUTED,
  TRAINING_ENROLL_TEAL,
  TRAINING_ENROLL_TRACK,
} from '@/components/trainingsAndCourses/trainingEnrollData';
import { c, NU } from '@/utils/newUiCompact';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: TRAINING_ENROLL_BG,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 12,
  },
  body: {
    paddingHorizontal: NU.hPad,
    paddingTop: NU.bodyPadTop,
    paddingBottom: NU.bodyPadBottom,
    gap: c(12, 10),
  },
  sectionLabel: {
    marginTop: c(8, 6),
    fontSize: NU.body,
    fontWeight: '700',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: TRAINING_ENROLL_MUTED,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: TRAINING_ENROLL_BORDER,
    borderRadius: NU.cardRadius,
    paddingVertical: NU.cardPadSm,
    paddingHorizontal: c(15, 12),
    flexDirection: 'row',
    gap: NU.cardGap,
    alignItems: 'center',
  },
  cardSelected: {
    borderColor: TRAINING_ENROLL_GREEN,
    borderWidth: 1.5,
  },
  swatch: {
    width: c(52, 46),
    height: c(52, 46),
    borderRadius: c(12, 10),
    backgroundColor: '#e6f4e8',
  },
  thumb: {
    width: c(52, 46),
    height: c(52, 46),
    borderRadius: c(12, 10),
    backgroundColor: '#d7e8db',
    overflow: 'hidden',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbInitials: {
    fontSize: c(18, 16),
  },
  cardCopy: {
    flex: 1,
    gap: c(2, 1),
  },
  cardTitle: {
    fontSize: NU.link,
    fontWeight: '700',
    color: TRAINING_ENROLL_TEAL,
  },
  cardMeta: {
    fontSize: c(12.5, 11.5),
    color: TRAINING_ENROLL_MUTED,
  },
  price: {
    fontSize: NU.link,
    fontWeight: '800',
    color: TRAINING_ENROLL_TEAL,
  },
  link: {
    fontSize: c(12.5, 11.5),
    fontWeight: '700',
    color: TRAINING_ENROLL_GREEN,
  },
  visaBadge: {
    width: NU.iconBtn,
    height: c(28, 24),
    borderRadius: c(6, 5),
    backgroundColor: TRAINING_ENROLL_TEAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visaText: {
    fontSize: c(9.5, 9),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  check: {
    width: c(22, 20),
    height: c(22, 20),
    borderRadius: c(11, 10),
    backgroundColor: TRAINING_ENROLL_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: TRAINING_ENROLL_BORDER,
    borderRadius: NU.cardRadius,
    padding: c(15, 12),
    gap: NU.cardGap,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  feeLabel: {
    fontSize: NU.body,
    color: '#5d7a67',
  },
  feeValue: {
    fontSize: NU.body,
    fontWeight: '600',
    color: TRAINING_ENROLL_TEAL,
  },
  divider: {
    height: 1,
    backgroundColor: TRAINING_ENROLL_TRACK,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  totalLabel: {
    fontSize: NU.cardTitle,
    fontWeight: '800',
    color: TRAINING_ENROLL_TEAL,
  },
  totalValue: {
    fontSize: NU.heading,
    fontWeight: '800',
    color: TRAINING_ENROLL_TEAL,
  },
  note: {
    backgroundColor: '#e6f4e8',
    borderRadius: NU.cardRadius,
    padding: NU.cardPadSm,
    flexDirection: 'row',
    gap: NU.cardGap,
    alignItems: 'flex-start',
  },
  noteText: {
    flex: 1,
    fontSize: c(12.5, 11.5),
    lineHeight: c(19, 17),
    color: '#3c6b47',
  },
  footer: {
    paddingTop: NU.cardPadSm,
    paddingHorizontal: NU.hPad,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: TRAINING_ENROLL_BORDER,
  },
  confirmBtn: {
    height: c(46, 42),
    borderRadius: 99,
    backgroundColor: TRAINING_ENROLL_TEAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnDisabled: {
    opacity: 0.7,
  },
  confirmText: {
    fontSize: NU.cardTitle,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
