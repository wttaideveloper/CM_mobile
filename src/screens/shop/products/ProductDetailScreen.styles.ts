import { Dimensions, StyleSheet } from 'react-native';

import { shadowMd, shadowSm } from '@/utils/shadows';
import { isSmallDevice } from '@/utils/responsive';

export const PRIMARY = '#1F5D4E';
const MINT = '#EAF4EC';
export const PAGE_BG = '#FFFFFF';
const SPEC_BG = '#F5F7F5';
const TEXT_MUTED = '#5a7a70';
const TEXT_BLACK = '#111111';
const BORDER = '#E8EDEA';
const STOCK_GREEN = '#059669';
const RATING_STAR_COLOR = '#F59E0B';
const RATING_PILL_BG = '#FFF6E8';
const RATING_TEXT = '#B45309';
export const EMPTY_STAR_COLOR = '#D1D5DB';
export { RATING_STAR_COLOR };

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
export { SCREEN_WIDTH };
export const H_PAD = isSmallDevice ? 16 : 20;
export const HERO_HEIGHT = Math.round(SCREEN_HEIGHT * (isSmallDevice ? 0.36 : 0.4));
export const THUMB_SIZE = isSmallDevice ? 44 : 52;
export const THUMB_OVERLAP = THUMB_SIZE / 2;

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  statusBarFill: {
    backgroundColor: PAGE_BG,
  },
  body: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  scroll: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  hero: {
    backgroundColor: '#F0F2F1',
    position: 'relative',
  },
  heroImage: {
    backgroundColor: '#F0F2F1',
  },
  heroActions: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: isSmallDevice ? 12 : 16,
  },
  heroBtn: {
    width: isSmallDevice ? 40 : 38,
    height: isSmallDevice ? 40 : 38,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadowMd,
  },
  thumbnailRow: {
    position: 'absolute',
    top: -THUMB_OVERLAP,
    left: H_PAD,
    flexDirection: 'row',
    gap: 10,
    zIndex: 20,
    elevation: 20,
  },
  thumbnailWrap: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    backgroundColor: PAGE_BG,
    ...shadowMd,
  },
  thumbnailWrapActive: {
    borderColor: PRIMARY,
    borderWidth: 1,
  },
  thumbnail: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    backgroundColor: '#F0F2F1',
  },
  pagination: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    zIndex: 2,
  },
  paginationDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  paginationDotActive: {
    backgroundColor: PRIMARY,
    width: 8,
    height: 8,
  },
  paginationDotInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  contentSection: {
    position: 'relative',
    backgroundColor: PAGE_BG,
  },
  contentBody: {
    paddingHorizontal: H_PAD,
    paddingTop: isSmallDevice ? 16 : 18,
    paddingBottom: 48,
  },
  contentBodyWithThumbs: {
    paddingTop: THUMB_OVERLAP + (isSmallDevice ? 12 : 14),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: isSmallDevice ? 12 : 14,
  },
  categoryChip: {
    backgroundColor: MINT,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryChipText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: PRIMARY,
  },
  brandText: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: 18,
    fontWeight: '500',
    color: 'rgb(107, 114, 128)',
  },
  headerBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: isSmallDevice ? 12 : 14,
  },
  productTitle: {
    flex: 1,
    fontSize: isSmallDevice ? 20 : 21,
    lineHeight: 28,
    fontWeight: '800',
    color: TEXT_BLACK,
  },
  priceBlock: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  productPrice: {
    fontSize: isSmallDevice ? 18 : 18,
    lineHeight: 24,
    fontWeight: '900',
    color: PRIMARY,
  },
  originalPrice: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: 16,
    fontWeight: '500',
    color: TEXT_MUTED,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: RATING_PILL_BG,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: isSmallDevice ? 14 : 16,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingValue: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: RATING_TEXT,
  },
  ratingDot: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: RATING_TEXT,
  },
  reviewsText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: 'rgb(180, 83, 9)',
  },
  description: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: 22,
    fontWeight: '400',
    color: TEXT_MUTED,
    marginBottom: isSmallDevice ? 18 : 22,
  },
  specsRow: {
    flexDirection: 'row',
    gap: isSmallDevice ? 8 : 10,
    marginBottom: isSmallDevice ? 16 : 18,
  },
  specCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: SPEC_BG,
    borderRadius: 14,
    paddingVertical: isSmallDevice ? 14 : 16,
    paddingHorizontal: isSmallDevice ? 6 : 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specValue: {
    fontSize: isSmallDevice ? 16 : 18,
    lineHeight: 24,
    fontWeight: '700',
    color: TEXT_BLACK,
    marginBottom: isSmallDevice ? 2 : 2,
    textAlign: 'center',
  },
  specLabel: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: 16,
    fontWeight: '500',
    color: TEXT_MUTED,
    textAlign: 'center',
  },
  stockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: MINT,
    borderWidth: 1,
    borderColor: '#CFE8D6',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: isSmallDevice ? 18 : 22,
  },
  stockPillOut: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  stockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: STOCK_GREEN,
  },
  stockDotOut: {
    backgroundColor: '#DC2626',
  },
  stockText: {
    flex: 1,
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: 18,
  },
  stockStatus: {
    fontWeight: '700',
    color: STOCK_GREEN,
  },
  stockRemaining: {
    fontWeight: '500',
    color: 'rgb(107, 114, 128)',
  },
  stockTextOut: {
    fontWeight: '600',
    color: '#DC2626',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityLabel: {
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 20,
    fontWeight: '700',
    color: TEXT_BLACK,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: SPEC_BG,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnMinus: {
    backgroundColor: PAGE_BG,
    ...shadowSm,
  },
  qtyMinusLine: {
    width: 12,
    height: 2,
    borderRadius: 1,
    backgroundColor: TEXT_MUTED,
  },
  qtyBtnPlus: {
    backgroundColor: PRIMARY,
    ...shadowMd,
  },
  qtyValue: {
    minWidth: 20,
    textAlign: 'center',
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 20,
    fontWeight: '700',
    color: PRIMARY,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 10 : 12,
    paddingHorizontal: H_PAD,
    backgroundColor: PAGE_BG,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
    ...shadowSm,
  },
  cartBtn: {
    width: isSmallDevice ? 46 : 48,
    height: isSmallDevice ? 46 : 48,
    borderRadius: 12,
    backgroundColor: MINT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBtnDisabled: {
    opacity: 0.45,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cartToast: {
    position: 'absolute',
    left: H_PAD,
    right: H_PAD,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: PRIMARY,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...shadowMd,
  },
  cartToastCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartToastCheckText: {
    fontSize: 14,
    fontWeight: '800',
    color: PRIMARY,
  },
  cartToastText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  flyingCartImage: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 16,
    overflow: 'hidden',
    ...shadowMd,
  },
  flyingCartImageInner: {
    width: 88,
    height: 88,
  },
  buyBtn: {
    flex: 1,
    height: isSmallDevice ? 46 : 48,
  },
  buyBtnText: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.9,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PAGE_BG,
    padding: 24,
  },
});
