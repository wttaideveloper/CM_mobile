import { Dimensions, StyleSheet } from 'react-native';

import { isSmallDevice } from '@/utils/responsive';
import { shadowMd, shadowSm } from '@/utils/shadows';

export const PRIMARY = '#1F5D4E';
export const MINT = '#EAF4EC';
export const BODY_BG = '#F5F7F5';
export const HEADER_BG = '#FFFFFF';
export const TEXT_MUTED = '#5a7a70';
export const TEXT_BLACK = '#111111';
export const BORDER = '#E8EDEA';
export const SEARCH_BORDER = '#E0E7E1';
export const SEARCH_DEBOUNCE_MS = 400;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const H_PAD = isSmallDevice ? 16 : 20;
export const CARD_GAP = isSmallDevice ? 10 : 12;
export const CARD_WIDTH = (SCREEN_WIDTH - H_PAD * 2 - CARD_GAP) / 2;
export const IMAGE_HEIGHT = Math.round(CARD_WIDTH * 0.82);

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  topSection: {
    backgroundColor: HEADER_BG,
    paddingBottom: isSmallDevice ? 4 : 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8EDEA',
  },
  productsScroll: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: H_PAD,
    marginBottom: isSmallDevice ? 12 : 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  backBtn: {
    width: isSmallDevice ? 32 : 36,
    height: isSmallDevice ? 32 : 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: isSmallDevice ? 18 : 24,
    lineHeight: 32,
    fontWeight: '700',
    color: 'black',
  },
  filterBtn: {
    width: isSmallDevice ? 40 : 44,
    height: isSmallDevice ? 40 : 44,
    borderRadius: 15,
    backgroundColor: MINT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F7F3',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: SEARCH_BORDER,
    paddingHorizontal: 16,
    height: isSmallDevice ? 40 : 48,
    marginHorizontal: H_PAD,
    marginBottom: isSmallDevice ? 12 : 16,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 20,
    color: TEXT_BLACK,
    paddingVertical: 0,
  },
  categoriesScroll: {
    paddingHorizontal: H_PAD,
    gap: isSmallDevice ? 6 : 8,
    paddingBottom: isSmallDevice ? 12 : 14,
  },
  categoryChip: {
    paddingHorizontal: isSmallDevice ? 14 : 16,
    paddingVertical: isSmallDevice ? 4 : 6,
    borderRadius: 20,
    backgroundColor: MINT,
  },
  categoryChipActive: {
    backgroundColor: PRIMARY,
  },
  categoryChipText: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: 20,
    fontWeight: '600',
    color: PRIMARY,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  resultCount: {
    paddingHorizontal: H_PAD,
    paddingTop: isSmallDevice ? 10 : 12,
    fontSize: isSmallDevice ? 12 : 13,
    fontWeight: '600',
    color: TEXT_MUTED,
    marginBottom: isSmallDevice ? 6 : 8,
  },
  grid: {
    paddingHorizontal: H_PAD,
    paddingTop: 4,
  },
  gridRow: {
    gap: CARD_GAP,
    marginBottom: CARD_GAP,
  },
  gridEmpty: {
    flexGrow: 1,
  },
  footerLoader: {
    width: '100%',
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    width: '100%',
    paddingVertical: isSmallDevice ? 24 : 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
    ...shadowSm,
  },
  imageWrap: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: IMAGE_HEIGHT,
    backgroundColor: '#F0F2F1',
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadowSm,
  },
  cardBody: {
    paddingHorizontal: isSmallDevice ? 10 : 12,
    paddingTop: isSmallDevice ? 8 : 10,
    paddingBottom: isSmallDevice ? 10 : 12,
  },
  categoryLabel: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: 16,
    fontWeight: '500',
    color: TEXT_MUTED,
    marginBottom: isSmallDevice ? 3 : 4,
  },
  productName: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: 18,
    fontWeight: '700',
    color: TEXT_BLACK,
    marginBottom: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: isSmallDevice ? 8 : 10,
    marginTop: 4,
  },
  ratingText: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: 14,
    fontWeight: '600',
    color: TEXT_MUTED,
  },
  ratingDot: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: 14,
    fontWeight: '600',
    color: TEXT_MUTED,
  },
  soldText: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: 14,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productPrice: {
    fontSize: isSmallDevice ? 15 : 16,
    lineHeight: 20,
    fontWeight: '900',
    color: PRIMARY,
  },
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadowMd,
  },
  pressed: {
    opacity: 0.85,
  },
});
