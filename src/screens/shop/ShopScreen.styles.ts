import { StyleSheet } from 'react-native';

import { shadowSm } from '@/utils/shadows';
import { isSmallDevice } from '@/utils/responsive';

export const PRIMARY = '#1F5D4E';
const MINT = '#EAF4EC';
const BODY_BG = '#F5F7F5';
const HEADER_BG = '#FFFFFF';
export const TEXT_MUTED = '#5a7a70';
const TEXT_BLACK = '#111111';
const SEARCH_BORDER = '#E0E7E1';
const H_PAD = isSmallDevice ? 16 : 20;

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
    justifyContent: 'space-between',
    marginBottom: isSmallDevice ? 12 : 14,
  },
  title: {
    fontSize: isSmallDevice ? 18 : 22,
    lineHeight: 34,
    fontWeight: '700',
    color: TEXT_BLACK,
  },
  nearMeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: MINT,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  nearMeText: {
    fontSize: 13,
    fontWeight: '600',
    color: PRIMARY,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    width: isSmallDevice ? 34 : 38,
    height: isSmallDevice ? 34 : 38,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIconBtn: {
    backgroundColor: '#F1F5F3',
  },
  filterBtn: {
    backgroundColor: MINT,
  },
  chatIconBtn: {
    backgroundColor: MINT,
  },
  cartIconBtn: {
    backgroundColor: MINT,
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    fontSize: 9,
    lineHeight: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: MINT,
    borderRadius: 14,
    padding: 4,
    marginBottom: isSmallDevice ? 12 : 14,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isSmallDevice ? 9 : 10,
    borderRadius: 11,
  },
  tabItemActive: {
    backgroundColor: '#FFFFFF',
    ...shadowSm,
  },
  tabLabel: {
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: '600',
    color: TEXT_MUTED,
  },
  tabLabelActive: {
    fontWeight: '700',
    color: PRIMARY,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgb(245, 247, 246)',
    borderRadius: isSmallDevice ? 16 : 18,
    borderWidth: 1,
    borderColor: SEARCH_BORDER,
    paddingHorizontal: isSmallDevice ? 12 : 16,
    height: isSmallDevice ? 40 : 48,
    marginBottom: isSmallDevice ? 12 : 14,
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
    paddingVertical: isSmallDevice ? 4 : 5,
    borderRadius: 20,
    backgroundColor: '#EEF2EF',
  },
  categoryChipActive: {
    backgroundColor: PRIMARY,
  },
  categoryChipText: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: 20,
    fontWeight: '600',
    color: TEXT_MUTED,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.85,
  },
  listArea: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
});
