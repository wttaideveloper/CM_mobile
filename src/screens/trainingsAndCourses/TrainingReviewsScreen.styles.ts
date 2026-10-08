import { StyleSheet } from 'react-native';

import {
  TRAINING_BORDER,
  TRAINING_GREEN,
  TRAINING_MUTED,
  TRAINING_TEAL,
} from '@/components/trainingsAndCourses/trainingData';

import { c, NU } from '@/utils/newUiCompact';

export const styles = StyleSheet.create({
  page: {
    gap: c(14, 12),
  },
  section: {
    gap: c(8, 6),
  },
  sectionLabel: {
    fontSize: c(12, 11),
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: TRAINING_MUTED,
  },
  ratingHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(12, 10),
    backgroundColor: '#e6f4e8',
    borderRadius: NU.cardRadius,
    borderWidth: 1,
    borderColor: '#c8e0cc',
    paddingVertical: c(12, 10),
    paddingHorizontal: c(12, 10),
  },
  ratingScore: {
    fontSize: c(32, 28),
    fontWeight: '800',
    color: TRAINING_GREEN,
  },
  ratingCopy: {
    flex: 1,
    gap: c(2, 1),
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(2, 1),
  },
  starHit: {
    minWidth: c(28, 26),
    minHeight: c(28, 26),
    alignItems: 'center',
    justifyContent: 'center',
  },
  star: {
    fontWeight: '800',
  },
  starFilled: {
    color: TRAINING_GREEN,
  },
  starEmpty: {
    color: '#c8e0cc',
  },
  ratingHint: {
    marginTop: c(2, 1),
    fontSize: c(11.5, 10.5),
    fontWeight: '700',
    color: TRAINING_MUTED,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    borderRadius: NU.cardRadius,
    padding: c(12, 10),
  },
  helper: {
    fontSize: c(12, 11),
    color: TRAINING_MUTED,
    lineHeight: c(16, 15),
    marginBottom: c(2, 1),
  },
  formLabel: {
    marginTop: c(10, 8),
    marginBottom: c(4, 3),
    fontSize: c(12, 11),
    fontWeight: '700',
    color: TRAINING_TEAL,
  },
  inputSingle: {
    height: c(42, 38),
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    borderRadius: NU.cardRadiusSm,
    paddingHorizontal: c(12, 10),
    fontSize: NU.body,
    color: TRAINING_TEAL,
    backgroundColor: '#FFFFFF',
  },
  input: {
    minHeight: c(88, 80),
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    borderRadius: NU.cardRadiusSm,
    paddingHorizontal: c(12, 10),
    paddingVertical: c(8, 7),
    fontSize: NU.body,
    color: TRAINING_TEAL,
    backgroundColor: '#FFFFFF',
  },
  primary: {
    marginTop: c(12, 10),
    height: c(44, 40),
    borderRadius: 99,
    backgroundColor: TRAINING_TEAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryDisabled: {
    opacity: 0.55,
  },
  primaryText: {
    fontSize: NU.body,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loadingCard: {
    paddingVertical: c(12, 10),
    alignItems: 'center',
  },
  reviewList: {
    gap: c(8, 6),
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    borderRadius: NU.cardRadius,
    padding: c(11, 9),
    gap: c(8, 6),
  },
  reviewTop: {
    flexDirection: 'row',
    gap: c(8, 6),
  },
  avatar: {
    width: c(34, 30),
    height: c(34, 30),
    borderRadius: c(17, 15),
    backgroundColor: '#e6f4e8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: c(13, 12),
    fontWeight: '800',
    color: TRAINING_GREEN,
  },
  reviewCopy: {
    flex: 1,
    gap: c(2, 1),
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(6, 5),
    flexWrap: 'wrap',
  },
  title: {
    fontSize: NU.link,
    fontWeight: '700',
    color: TRAINING_TEAL,
  },
  verified: {
    fontSize: c(10, 9),
    fontWeight: '700',
    color: TRAINING_GREEN,
    backgroundColor: '#e6f4e8',
    paddingHorizontal: c(7, 5),
    paddingVertical: c(2, 1),
    borderRadius: 99,
    overflow: 'hidden',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(6, 5),
  },
  meta: {
    fontSize: c(12, 11),
    color: TRAINING_MUTED,
  },
  body: {
    fontSize: NU.link,
    lineHeight: c(19, 17),
    color: TRAINING_TEAL,
  },
  link: {
    alignSelf: 'flex-start',
    marginTop: c(2, 1),
  },
  linkText: {
    fontSize: NU.link,
    fontWeight: '700',
    color: TRAINING_GREEN,
  },
});
