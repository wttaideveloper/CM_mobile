import { isSmallDevice } from '@/utils/responsive';

/**
 * Compact helper for new UI screens.
 * First value = design / large phone (unchanged).
 * Second value = small phone (width < 375).
 */
export function c(large: number, small: number): number {
  return isSmallDevice ? small : large;
}

/** Shared tokens for new green-dash headers/bodies. */
export const NU = {
  hPad: c(20, 16),
  hPadHome: c(18, 14),
  headerPadTop: c(16, 12),
  headerPadTopHome: c(20, 14),
  headerPadBottom: c(26, 20),
  headerPadBottomTall: c(30, 22),
  headerPadBottomHome: c(34, 24),
  title: c(24, 20),
  name: c(22, 18),
  heading: c(20, 17),
  eyebrow: c(13, 12),
  subtitle: c(13, 12),
  body: c(13, 12),
  bodySm: c(12, 11),
  label: c(11, 10),
  cardTitle: c(15, 14),
  cardTitleLg: c(16, 15),
  cardTitleXl: c(18, 16),
  iconBtn: c(40, 36),
  iconBtnRadius: c(20, 18),
  searchH: c(46, 42),
  bodyPadTop: c(18, 14),
  bodyPadBottom: c(28, 22),
  sectionGap: c(18, 14),
  groupGap: c(14, 10),
  cardGap: c(12, 10),
  cardPad: c(16, 12),
  cardPadSm: c(14, 11),
  cardPadXs: c(12, 10),
  cardRadius: c(16, 14),
  cardRadiusMd: c(14, 12),
  cardRadiusSm: c(12, 10),
  rowGap: c(14, 10),
  chipPadV: c(9, 7),
  chipPadH: c(16, 12),
  chipFont: c(13, 12),
  link: c(14, 13),
} as const;
