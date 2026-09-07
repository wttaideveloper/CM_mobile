import { Dimensions, StyleSheet } from 'react-native';

import { isSmallDevice } from '@/utils/responsive';
import { shadowMd, shadowSm } from '@/utils/shadows';

export const PRIMARY = '#1F5D4E';
export const ACCENT_GREEN = '#4CAF50';
export const PAGE_BG = '#FFFFFF';
export const BODY_BG = '#F5F7F5';
export const TEXT_MUTED = '#9CA3AF';
export const TEXT_BLACK = '#111111';
export const CHIP_INACTIVE_BG = '#F3F4F6';
export const MINT = '#EAF4EC';
export const PRICE_CHIP_PAID_BG = '#FEF3E2';
export const PRICE_CHIP_PAID_TEXT = '#B45309';
export const H_PAD = isSmallDevice ? 16 : 20;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const FEATURED_HEIGHT = Math.round(((SCREEN_WIDTH - H_PAD * 2) * (isSmallDevice ? 180 / 375 : 200 / 375)));
export const LIST_IMAGE_SIZE = isSmallDevice ? 80 : 88;
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
    paddingBottom: isSmallDevice ? 12 : 14,
    marginBottom: isSmallDevice ? 10 : 12,
  },
  title: {
    fontSize: isSmallDevice ? 20 : 22,
    lineHeight: 28,
    fontWeight: '800',
    color: TEXT_BLACK,
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: isSmallDevice ? 12 : 14,
  },
  backBtn: {
    width: isSmallDevice ? 32 : 36,
    height: isSmallDevice ? 32 : 36,
    borderRadius: isSmallDevice ? 10 : 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersScroll: {
    gap: isSmallDevice ? 8 : 10,
  },
  filterChip: {
    paddingHorizontal: isSmallDevice ? 14 : 16,
    paddingVertical: isSmallDevice ? 8 : 9,
    borderRadius: 20,
    backgroundColor: CHIP_INACTIVE_BG,
  },
  filterChipActive: {
    backgroundColor: PRIMARY,
    ...shadowSm,
  },
  filterChipText: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: 18,
    fontWeight: '600',
    color: PRIMARY,
  },
  filterChipTextActive: {
    color: PAGE_BG,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: H_PAD,
  },
  featuredCard: {
    height: FEATURED_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
    marginBottom: isSmallDevice ? 18 : 22,
    ...shadowMd,
  },
  featuredImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#2A2A2A',
  },
  featuredFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  featuredBadge: {
    position: 'absolute',
    top: isSmallDevice ? 12 : 14,
    left: isSmallDevice ? 12 : 14,
    backgroundColor: ACCENT_GREEN,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  featuredBadgeText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '800',
    color: PAGE_BG,
    letterSpacing: 0.6,
  },
  featuredPriceBadge: {
    position: 'absolute',
    top: isSmallDevice ? 12 : 14,
    right: isSmallDevice ? 12 : 14,
    backgroundColor: PAGE_BG,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  featuredPriceText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '800',
    color: PRIMARY,
  },
  featuredBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: isSmallDevice ? 14 : 16,
    paddingBottom: isSmallDevice ? 14 : 16,
    gap: 12,
  },
  featuredInfo: {
    flex: 1,
    minWidth: 0,
  },
  featuredTitle: {
    fontSize: isSmallDevice ? 16 : 17,
    lineHeight: 22,
    fontWeight: '800',
    color: PAGE_BG,
    marginBottom: 6,
  },
  featuredMeta: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.75)',
    marginBottom: 3,
  },
  registerBtn: {
    backgroundColor: PAGE_BG,
    paddingHorizontal: isSmallDevice ? 12 : 14,
    paddingVertical: isSmallDevice ? 8 : 10,
    borderRadius: 12,
    flexShrink: 0,
  },
  registerBtnText: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: 16,
    fontWeight: '700',
    color: PRIMARY,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 15 : 16,
    lineHeight: 22,
    fontWeight: '800',
    color: TEXT_BLACK,
    marginBottom: isSmallDevice ? 10 : 12,
  },
  list: {
    gap: isSmallDevice ? 10 : 12,
  },
  listCard: {
    flexDirection: 'row',
    backgroundColor: PAGE_BG,
    borderRadius: 16,
    overflow: 'hidden',
    ...shadowSm,
  },
  listImageWrap: {
    width: LIST_IMAGE_SIZE,
    alignSelf: 'stretch',
    overflow: 'hidden',
    flexShrink: 0,
  },
  listImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: LIST_IMAGE_SIZE,
    backgroundColor: '#E8EDEA',
  },
  listBody: {
    flex: 1,
    minWidth: 0,
    minHeight: LIST_IMAGE_SIZE,
    justifyContent: 'space-between',
    paddingVertical: isSmallDevice ? 11 : 13,
    paddingHorizontal: isSmallDevice ? 11 : 13,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 5,
  },
  listTitle: {
    flex: 1,
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 20,
    fontWeight: '800',
    color: TEXT_BLACK,
  },
  listPriceChip: {
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexShrink: 0,
  },
  listPriceChipFree: {
    backgroundColor: MINT,
  },
  listPriceChipPaid: {
    backgroundColor: PRICE_CHIP_PAID_BG,
  },
  listPrice: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: 14,
    fontWeight: '800',
  },
  listPriceFree: {
    color: PRIMARY,
  },
  listPricePaid: {
    color: PRICE_CHIP_PAID_TEXT,
  },
  listMeta: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '500',
    color: TEXT_MUTED,
    marginBottom: 4,
  },
  listMetaLast: {
    marginBottom: 0,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
    marginTop: 7,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: PRIMARY,
  },
  cardPressed: {
    opacity: 0.92,
  },
});
