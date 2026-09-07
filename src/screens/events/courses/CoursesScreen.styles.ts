import { Dimensions, StyleSheet } from 'react-native';

import { isSmallDevice } from '@/utils/responsive';
import { shadowSm } from '@/utils/shadows';

export const PRIMARY = '#1F5D4E';
export const MINT = '#EAF4EC';
export const PAGE_BG = '#FFFFFF';
export const BODY_BG = '#F7F8F9';
export const TEXT_MUTED = '#9CA3AF';
export const TEXT_BLACK = '#111111';
export const CHIP_INACTIVE_BG = '#F3F4F6';
export const SEARCH_BG = '#F3F4F6';
export const LEVEL_BEGINNER_BG = '#EAF4EC';
export const LEVEL_ADVANCED_BG = '#FEE2E2';
export const LEVEL_ADVANCED_TEXT = '#DC2626';
export const LEVEL_ALL_BG = '#EFF6FF';
export const LEVEL_ALL_TEXT = '#1D4ED8';
export const PRICE_PAID_TEXT = '#B45309';
export const H_PAD = isSmallDevice ? 16 : 20;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const CONTINUE_CARD_HEIGHT = Math.round(((SCREEN_WIDTH - H_PAD * 2) * 136) / 375);
export const LIST_IMAGE_WIDTH = isSmallDevice ? 100 : 108;
export const SCREEN_WIDTH_EXPORT = SCREEN_WIDTH;

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  scroll: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  topSection: {
    backgroundColor: PAGE_BG,
    paddingHorizontal: H_PAD,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: isSmallDevice ? 10 : 12,
    gap: 8,
  },
  backBtn: {
    width: isSmallDevice ? 32 : 36,
    height: isSmallDevice ? 32 : 36,
    borderRadius: isSmallDevice ? 10 : 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: isSmallDevice ? 20 : 22,
    lineHeight: 28,
    fontWeight: '800',
    color: TEXT_BLACK,
    flex: 1,
    minWidth: 0,
  },
  myCoursesBtn: {
    backgroundColor: MINT,
    paddingHorizontal: isSmallDevice ? 12 : 14,
    paddingVertical: isSmallDevice ? 6 : 8,
    borderRadius: isSmallDevice ? 8 : 10,
  },
  myCoursesBtnText: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: isSmallDevice ? 14 : 16,
    fontWeight: '700',
    color: PRIMARY,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SEARCH_BG,
    borderRadius: isSmallDevice ? 12 : 14,
    paddingHorizontal: isSmallDevice ? 12 : 14,
    height: isSmallDevice ? 42 : 46,
    marginBottom: isSmallDevice ? 12 : 14,
    gap: isSmallDevice ? 8 : 10,
  },
  searchInput: {
    flex: 1,
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: isSmallDevice ? 18 : 20,
    color: TEXT_BLACK,
    paddingVertical: 0,
  },
  filtersScroll: {
    gap: isSmallDevice ? 6 : 8,
    paddingBottom: isSmallDevice ? 14 : 18,
  },
  filterChip: {
    paddingHorizontal: isSmallDevice ? 14 : 16,
    paddingVertical: isSmallDevice ? 6 : 8,
    borderRadius: isSmallDevice ? 16 : 20,
    backgroundColor: CHIP_INACTIVE_BG,
  },
  filterChipActive: {
    backgroundColor: PRIMARY,
  },
  filterChipText: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: isSmallDevice ? 16 : 18,
    fontWeight: '600',
    color: TEXT_MUTED,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  content: {
    paddingHorizontal: H_PAD,
    paddingTop: 4,
    paddingBottom: 8,
    backgroundColor: BODY_BG,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 15 : 16,
    lineHeight: isSmallDevice ? 20 : 22,
    fontWeight: '800',
    color: TEXT_BLACK,
    marginBottom: isSmallDevice ? 6 : 8,
  },
  sectionTitleSpaced: {
    marginTop: isSmallDevice ? 16 : 20,
  },
  continueCard: {
    height: CONTINUE_CARD_HEIGHT,
    borderRadius: isSmallDevice ? 16 : 20,
    overflow: 'hidden',
    marginBottom: 4,
  },
  continueGlow: {
    position: 'absolute',
    top: isSmallDevice ? -16 : -20,
    right: isSmallDevice ? -8 : -10,
    width: isSmallDevice ? 100 : 120,
    height: isSmallDevice ? 100 : 120,
    borderRadius: isSmallDevice ? 50 : 60,
    backgroundColor: 'rgba(76, 175, 80, 0.22)',
  },
  continueContent: {
    flex: 1,
    paddingHorizontal: isSmallDevice ? 14 : 16,
    justifyContent: 'center',
    gap: isSmallDevice ? 8 : 10,
  },
  continueBadge: {
    fontSize: isSmallDevice ? 9 : 10,
    lineHeight: isSmallDevice ? 11 : 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 0.6,
  },
  continueTitle: {
    fontSize: isSmallDevice ? 17 : 18,
    lineHeight: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  continueProgressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    overflow: 'hidden',
  },
  continueProgressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  continueFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  continueMeta: {
    flex: 1,
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: isSmallDevice ? 14 : 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  continuePercent: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: isSmallDevice ? 14 : 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  list: {
    gap: isSmallDevice ? 10 : 12,
  },
  courseCard: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: '#FFFFFF',
    borderRadius: isSmallDevice ? 14 : 16,
    overflow: 'hidden',
    minHeight: LIST_IMAGE_WIDTH,
    ...shadowSm,
  },
  courseImageWrap: {
    alignSelf: 'stretch',
    overflow: 'hidden',
    flexShrink: 0,
    position: 'relative',
  },
  courseImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: '#E8EDEA',
  },
  courseImageMask: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    height: '100%',
  },
  courseContent: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    paddingVertical: isSmallDevice ? 10 : 12,
    paddingRight: isSmallDevice ? 10 : 12,
    paddingLeft: 4,
    minHeight: LIST_IMAGE_WIDTH,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 8 : 10,
    marginBottom: isSmallDevice ? 4 : 6,
  },
  levelChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  levelChipText: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: isSmallDevice ? 12 : 14,
    fontWeight: '700',
  },
  priceText: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: isSmallDevice ? 12 : 14,
    fontWeight: '800',
  },
  priceTextFree: {
    color: PRIMARY,
  },
  priceTextPaid: {
    color: PRICE_PAID_TEXT,
  },
  courseName: {
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 20,
    fontWeight: '800',
    color: TEXT_BLACK,
    marginBottom: 3,
  },
  instructorName: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: isSmallDevice ? 14 : 16,
    fontWeight: '500',
    color: TEXT_MUTED,
    marginBottom: isSmallDevice ? 6 : 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: isSmallDevice ? 14 : 16,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  statDot: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: isSmallDevice ? 14 : 16,
    color: TEXT_MUTED,
  },
  cardPressed: {
    opacity: 0.92,
  },
});
