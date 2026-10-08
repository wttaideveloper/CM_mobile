import { StyleSheet } from 'react-native';

import {
  TRAINING_BG,
  TRAINING_BORDER,
  TRAINING_GREEN,
  TRAINING_MUTED,
  TRAINING_TEAL,
  TRAINING_TRACK,
} from '@/components/trainingsAndCourses/trainingData';

import { c, NU } from '@/utils/newUiCompact';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: TRAINING_BG,
  },
  scroll: {
    flex: 1,
  },
  body: {
    paddingHorizontal: NU.hPad,
    paddingTop: NU.bodyPadTop,
    gap: NU.cardGap,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    borderRadius: NU.cardRadius,
    padding: c(15, 12),
    gap: c(8, 6),
  },
  modePill: {
    alignSelf: 'flex-start',
    paddingVertical: c(4, 3),
    paddingHorizontal: c(8, 6),
    borderRadius: c(5, 4),
  },
  modePillText: {
    fontSize: NU.label,
    fontWeight: '700',
  },
  summaryMeta: {
    fontSize: c(13.5, 12.5),
    fontWeight: '700',
    color: TRAINING_TEAL,
  },
  summaryHint: {
    fontSize: c(12.5, 11.5),
    color: TRAINING_MUTED,
    lineHeight: c(18, 16),
  },
  sectionLabel: {
    marginTop: c(6, 4),
    fontSize: NU.body,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: TRAINING_MUTED,
  },
  daysCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    borderRadius: NU.cardRadius,
    overflow: 'hidden',
  },
  dayRow: {
    paddingVertical: c(13, 11),
    paddingHorizontal: c(14, 12),
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(10, 8),
  },
  dayRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: TRAINING_TRACK,
  },
  dayRowActive: {
    backgroundColor: '#f5faf3',
  },
  dayCopy: {
    flex: 1,
    gap: c(2, 1),
  },
  dayTitle: {
    fontSize: NU.link,
    fontWeight: '700',
    color: TRAINING_TEAL,
  },
  dayMeta: {
    fontSize: c(12, 11),
    color: TRAINING_MUTED,
  },
  statusPill: {
    paddingVertical: c(4, 3),
    paddingHorizontal: c(8, 6),
    borderRadius: 99,
    backgroundColor: TRAINING_TRACK,
  },
  statusToday: {
    backgroundColor: '#e6f4e8',
  },
  statusDone: {
    backgroundColor: '#eef1f4',
  },
  statusText: {
    fontSize: c(11, 10),
    fontWeight: '700',
    color: TRAINING_MUTED,
  },
  statusTextToday: {
    color: TRAINING_GREEN,
  },
  statusTextDone: {
    color: '#6b7c86',
  },
  attendCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    borderRadius: NU.cardRadius,
    padding: c(16, 13),
    gap: c(10, 8),
    alignItems: 'center',
  },
  attendTitle: {
    alignSelf: 'stretch',
    fontSize: NU.cardTitle,
    fontWeight: '700',
    color: TRAINING_TEAL,
  },
  attendMeta: {
    alignSelf: 'stretch',
    fontSize: c(12.5, 11.5),
    color: TRAINING_MUTED,
  },
  linkBox: {
    alignSelf: 'stretch',
    backgroundColor: '#f5faf3',
    borderRadius: NU.cardRadiusSm,
    padding: c(13, 11),
    gap: c(4, 3),
  },
  linkLabel: {
    fontSize: c(11.5, 10.5),
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: TRAINING_MUTED,
  },
  linkValue: {
    fontSize: NU.link,
    fontWeight: '700',
    color: TRAINING_TEAL,
  },
  linkMeta: {
    fontSize: c(12, 11),
    color: TRAINING_MUTED,
  },
  primaryBtn: {
    alignSelf: 'stretch',
    height: c(46, 42),
    borderRadius: 99,
    backgroundColor: TRAINING_TEAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontSize: NU.cardTitle,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  qrOuter: {
    marginTop: c(4, 2),
    padding: c(14, 12),
    borderRadius: NU.cardRadiusSm,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
  },
  qrInner: {
    width: c(196, 176),
    height: c(196, 176),
    backgroundColor: '#FFFFFF',
  },
  qrRow: {
    flex: 1,
    flexDirection: 'row',
  },
  qrCell: {
    flex: 1,
  },
  qrCellOn: {
    backgroundColor: '#111827',
  },
  qrCellOff: {
    backgroundColor: '#FFFFFF',
  },
  passCode: {
    fontSize: NU.link,
    fontWeight: '800',
    letterSpacing: 1,
    color: TRAINING_TEAL,
  },
  venueBox: {
    alignSelf: 'stretch',
    backgroundColor: '#f5faf3',
    borderRadius: NU.cardRadiusSm,
    padding: c(13, 11),
    gap: c(3, 2),
  },
  venueTitle: {
    fontSize: NU.link,
    fontWeight: '700',
    color: TRAINING_TEAL,
  },
  footnote: {
    alignSelf: 'stretch',
    fontSize: c(11.5, 10.5),
    color: TRAINING_MUTED,
    textAlign: 'center',
  },
});
