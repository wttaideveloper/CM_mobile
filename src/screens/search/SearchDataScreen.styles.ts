import { Platform, StyleSheet } from 'react-native';

import { isSmallDevice } from '@/utils/responsive';
import { shadowSm } from '@/utils/shadows';

export const PRIMARY = '#1F5D4E';
export const BODY_BG = '#F5F7F5';
export const TEXT_MUTED = '#5a7a70';
export const TEXT_BLACK = '#111111';
export const BORDER = '#E8EDEA';
export const H_PAD = isSmallDevice ? 16 : 20;
export const CARD_GAP = isSmallDevice ? 10 : 12;
export const PREVIEW_LIMIT = 4;
export const SEARCH_DEBOUNCE_MS = 400;
export const SEARCH_PLACEHOLDER = isSmallDevice
  ? 'Search Enterprise, Service...'
  : 'Search by Enterprise, Service, Product...';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  statusBarFill: {
    backgroundColor: BODY_BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: H_PAD,
    paddingTop: isSmallDevice ? 16 : 20,
    paddingBottom: isSmallDevice ? 8 : 10,
    backgroundColor: BODY_BG,
  },
  backBtn: {
    width: isSmallDevice ? 20 : 20,
    height: isSmallDevice ? 32 : 36,
    borderRadius: isSmallDevice ? 10 : 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: isSmallDevice ? 12 : 14,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: isSmallDevice ? 12 : 14,
    height: isSmallDevice ? 44 : 52,
    gap: isSmallDevice ? 8 : 10,
    overflow: 'hidden',
    ...shadowSm,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    fontSize: isSmallDevice ? 14 : 16,
    lineHeight: isSmallDevice ? 18 : 20,
    height: isSmallDevice ? 18 : 20,
    color: TEXT_BLACK,
    paddingVertical: 0,
    margin: 0,
    ...(Platform.OS === 'android'
      ? { textAlignVertical: 'center' as const, includeFontPadding: false }
      : {}),
  },
  resultsScroll: {
    flex: 1,
  },
  resultsContent: {
    paddingHorizontal: H_PAD,
    paddingTop: 4,
  },
  resultsContentEmpty: {
    flexGrow: 1,
  },
  section: {
    marginBottom: isSmallDevice ? 22 : 26,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: isSmallDevice ? 10 : 12,
    marginBottom: isSmallDevice ? 8 : 10,
    minHeight: isSmallDevice ? 22 : 24,
  },
  sectionHeading: {
    flex: 1,
    minWidth: 0,
    fontSize: isSmallDevice ? 16 : 18,
    lineHeight: 24,
    fontWeight: '800',
    color: TEXT_BLACK,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
  sectionCount: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: 24,
    fontWeight: '600',
    color: TEXT_MUTED,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
  viewAllBtn: {
    justifyContent: 'center',
    minHeight: 24,
  },
  viewAllText: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: 24,
    fontWeight: '600',
    color: PRIMARY,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
  enterpriseList: {
    gap: isSmallDevice ? 10 : 12,
  },
  serviceList: {
    gap: isSmallDevice ? 10 : 12,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  eventList: {
    gap: isSmallDevice ? 10 : 12,
  },
  courseList: {
    gap: isSmallDevice ? 10 : 12,
  },
  loadingState: {
    paddingVertical: isSmallDevice ? 24 : 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.88,
  },
});
