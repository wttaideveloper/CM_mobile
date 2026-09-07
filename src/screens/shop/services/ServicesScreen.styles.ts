import { StyleSheet } from 'react-native';

import { isSmallDevice } from '@/utils/responsive';
import { shadowSm } from '@/utils/shadows';

export const PRIMARY = '#1F5D4E';
export const MINT = '#EAF4EC';
export const BODY_BG = '#F5F7F5';
export const HEADER_BG = '#FFFFFF';
export const TEXT_MUTED = '#5a7a70';
export const TEXT_BLACK = '#111111';
export const BORDER = '#E8EDEA';
export const SEARCH_BORDER = '#E0E7E1';
export const H_PAD = isSmallDevice ? 16 : 20;
export const SEARCH_DEBOUNCE_MS = 400;

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  topSection: {
    backgroundColor: HEADER_BG,
    paddingHorizontal: isSmallDevice ? 16 : H_PAD,
    paddingBottom: isSmallDevice ? 4 : 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8EDEA',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  backBtn: {
    width: isSmallDevice ? 32 : 36,
    height: isSmallDevice ? 32 : 36,
    borderRadius: isSmallDevice ? 10 : 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: isSmallDevice ? 18 : 24,
    lineHeight: 32,
    fontWeight: '700',
    color: TEXT_BLACK,
    minWidth: 0,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F7F3',
    borderRadius: isSmallDevice ? 16 : 18,
    borderWidth: 1,
    borderColor: SEARCH_BORDER,
    paddingHorizontal: isSmallDevice ? 12 : 16,
    height: isSmallDevice ? 40 : 48,
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
    gap: isSmallDevice ? 6 : 8,
    paddingBottom: isSmallDevice ? 12 : 14,
  },
  categoryChip: {
    paddingHorizontal: isSmallDevice ? 16 : 20,
    paddingVertical: isSmallDevice ? 3 : 4,
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
    paddingHorizontal: isSmallDevice ? 16 : H_PAD,
    paddingTop: isSmallDevice ? 10 : 12,
    fontSize: isSmallDevice ? 12 : 13,
    fontWeight: '600',
    color: TEXT_MUTED,
    marginBottom: isSmallDevice ? 6 : 8,
  },
  listScroll: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  listContent: {
    paddingHorizontal: H_PAD,
  },
  listSeparator: {
    height: 12,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    paddingVertical: isSmallDevice ? 36 : 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: isSmallDevice ? 12 : 14,
    gap: 12,
    ...shadowSm,
  },
  thumbPressable: {
    flexShrink: 0,
  },
  thumb: {
    width: isSmallDevice ? 72 : 80,
    height: isSmallDevice ? 72 : 80,
    borderRadius: 14,
    backgroundColor: '#F0F2F1',
    flexShrink: 0,
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 6,
  },
  titleRowCompact: {
    marginBottom: 8,
  },
  serviceName: {
    flex: 1,
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 20,
    fontWeight: '800',
    color: TEXT_BLACK,
  },
  priceBlock: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  servicePrice: {
    fontSize: isSmallDevice ? 15 : 16,
    lineHeight: 20,
    fontWeight: '800',
    color: PRIMARY,
  },
  serviceUnit: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: 14,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  providerName: {
    flex: 1,
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: 18,
    fontWeight: '500',
    color: '#6B7C76',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 2,
  },
  metaItems: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    minWidth: 0,
  },
  categoryBadge: {
    backgroundColor: MINT,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  categoryBadgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    color: PRIMARY,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: isSmallDevice ? 8 : 10,
    paddingVertical: isSmallDevice ? 4 : 5,
    borderRadius: 8,
    backgroundColor: MINT,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D1E7D6',
    flexShrink: 0,
  },
  chatBtnDisabled: {
    opacity: 0.7,
  },
  chatBtnText: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: 14,
    fontWeight: '700',
    color: PRIMARY,
  },
  cardPressed: {
    opacity: 0.92,
  },
});
