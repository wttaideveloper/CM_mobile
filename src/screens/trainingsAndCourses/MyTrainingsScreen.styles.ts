import { StyleSheet } from 'react-native';

import {
  TRAINING_BORDER,
  TRAINING_GREEN,
  TRAINING_MUTED,
  TRAINING_TEAL,
  TRAINING_TRACK,
} from '@/components/trainingsAndCourses/trainingData';

import { c, NU } from '@/utils/newUiCompact';

export const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: NU.body,
    fontWeight: '700',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: TRAINING_MUTED,
  },
  refLabel: {
    marginTop: c(10, 8),
  },
  helper: {
    marginTop: -c(8, 6),
    fontSize: c(12.5, 11.5),
    color: TRAINING_MUTED,
    lineHeight: c(18, 16),
  },
  stateBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    borderRadius: NU.cardRadius,
    padding: c(16, 14),
    gap: c(8, 6),
    alignItems: 'center',
  },
  stateText: {
    fontSize: c(13, 12),
    color: TRAINING_MUTED,
    textAlign: 'center',
    lineHeight: c(18, 16),
  },
  retryText: {
    fontSize: NU.link,
    fontWeight: '700',
    color: TRAINING_GREEN,
  },
  courseCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    borderRadius: NU.cardRadius,
    overflow: 'hidden',
  },
  courseCardDisabled: {
    opacity: 0.72,
  },
  bannerWrap: {
    height: c(148, 128),
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#d7e8db',
  },
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  bannerInitials: {
    fontSize: c(26, 22),
    lineHeight: c(30, 26),
  },
  bannerDimmed: {
    opacity: 0.85,
  },
  bannerScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 30, 20, 0.22)',
  },
  bannerTop: {
    position: 'absolute',
    left: c(12, 10),
    right: c(12, 10),
    top: c(12, 10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modePill: {
    paddingVertical: c(4, 3),
    paddingHorizontal: c(8, 6),
    borderRadius: c(5, 4),
  },
  modePillText: {
    fontSize: NU.label,
    fontWeight: '700',
  },
  cardBody: {
    padding: c(15, 12),
    gap: c(4, 3),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: c(8, 6),
  },
  title: {
    flex: 1,
    fontSize: NU.cardTitle,
    fontWeight: '700',
    color: TRAINING_TEAL,
  },
  titleDisabled: {
    color: '#5a6b60',
  },
  statusPill: {
    paddingVertical: c(4, 3),
    paddingHorizontal: c(8, 6),
    borderRadius: c(5, 4),
    marginTop: c(2, 1),
  },
  statusPillPending: {
    backgroundColor: '#fff4e5',
  },
  statusPillActive: {
    backgroundColor: '#e6f4e8',
  },
  statusPillText: {
    fontSize: c(11, 10),
    fontWeight: '700',
  },
  statusPillTextPending: {
    color: '#b86a00',
  },
  statusPillTextActive: {
    color: TRAINING_GREEN,
  },
  meta: {
    fontSize: c(12.5, 11.5),
    color: TRAINING_MUTED,
  },
  progressWrap: {
    marginTop: c(8, 6),
    gap: c(6, 5),
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: c(8, 6),
  },
  progressLabel: {
    flex: 1,
    fontSize: c(11.5, 10.5),
    color: TRAINING_MUTED,
  },
  progressPercent: {
    fontSize: NU.body,
    fontWeight: '800',
  },
  track: {
    height: c(7, 6),
    borderRadius: 99,
    backgroundColor: TRAINING_TRACK,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 99,
  },
  nextBox: {
    marginTop: c(8, 6),
    backgroundColor: '#f5faf3',
    borderRadius: NU.cardRadiusSm,
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    paddingVertical: c(11, 9),
    paddingHorizontal: c(13, 11),
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(10, 8),
  },
  nextBoxDisabled: {
    backgroundColor: '#f7f7f5',
  },
  nextLabel: {
    fontSize: c(11.5, 10.5),
    color: TRAINING_MUTED,
  },
  nextValue: {
    marginTop: c(2, 1),
    fontSize: c(13.5, 12.5),
    fontWeight: '700',
    color: TRAINING_TEAL,
  },
  nextValueMuted: {
    color: '#6b736e',
  },
  cta: {
    fontSize: NU.link,
    fontWeight: '800',
  },
  ctaDisabled: {
    fontSize: NU.link,
    fontWeight: '700',
    color: TRAINING_MUTED,
  },
});
