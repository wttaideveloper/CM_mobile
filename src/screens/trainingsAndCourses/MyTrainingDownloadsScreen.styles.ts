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
  page: {
    gap: c(14, 12),
  },
  stateBox: {
    paddingVertical: c(28, 24),
    alignItems: 'center',
    gap: c(10, 8),
  },
  stateText: {
    fontSize: c(13.5, 12.5),
    color: TRAINING_MUTED,
    textAlign: 'center',
  },
  emptyCard: {
    backgroundColor: '#f4f8f5',
    borderRadius: NU.cardRadius,
    borderWidth: 1,
    borderColor: '#e8f0ea',
    paddingVertical: c(22, 18),
    paddingHorizontal: c(16, 14),
    gap: c(8, 6),
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: NU.cardTitle,
    fontWeight: '800',
    color: TRAINING_TEAL,
  },
  emptyText: {
    fontSize: NU.body,
    color: TRAINING_MUTED,
    textAlign: 'center',
    lineHeight: c(20, 18),
  },
  emptyBtn: {
    marginTop: c(6, 4),
    backgroundColor: TRAINING_TEAL,
    paddingHorizontal: c(16, 14),
    paddingVertical: c(10, 8),
    borderRadius: 99,
  },
  emptyBtnText: {
    fontSize: NU.body,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  group: {
    gap: c(8, 6),
  },
  groupTitle: {
    fontSize: c(15, 14),
    fontWeight: '700',
    color: TRAINING_TEAL,
  },
  groupMeta: {
    marginTop: 2,
    fontSize: c(12, 11),
    color: TRAINING_MUTED,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    borderRadius: NU.cardRadius,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(8, 6),
    paddingHorizontal: c(12, 10),
    paddingVertical: c(12, 10),
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: TRAINING_TRACK,
  },
  rowActive: {
    backgroundColor: '#f0f7f2',
  },
  kindBadge: {
    paddingHorizontal: c(8, 7),
    paddingVertical: c(4, 3),
    borderRadius: 99,
  },
  kindBadgeVideo: {
    backgroundColor: '#f2e9fb',
  },
  kindBadgeDoc: {
    backgroundColor: '#fde8e6',
  },
  kindBadgeText: {
    fontSize: c(10.5, 9.5),
    fontWeight: '800',
  },
  kindBadgeTextVideo: {
    color: '#8352c0',
  },
  kindBadgeTextDoc: {
    color: '#b42318',
  },
  rowCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  rowTitle: {
    fontSize: c(13.5, 12.5),
    fontWeight: '600',
    color: TRAINING_TEAL,
  },
  rowMeta: {
    fontSize: c(11, 10),
    color: TRAINING_MUTED,
    fontWeight: '500',
  },
  openBtn: {
    minWidth: c(58, 52),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: TRAINING_GREEN,
    paddingHorizontal: c(12, 10),
    paddingVertical: c(8, 7),
    borderRadius: 99,
  },
  openBtnActive: {
    backgroundColor: TRAINING_TEAL,
  },
  openBtnText: {
    fontSize: c(12, 11),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  removeBtn: {
    width: c(32, 28),
    height: c(32, 28),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 99,
    backgroundColor: '#f3f5f4',
  },
});
