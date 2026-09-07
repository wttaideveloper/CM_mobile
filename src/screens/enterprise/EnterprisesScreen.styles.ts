import { StyleSheet } from 'react-native';

import { isSmallDevice } from '@/utils/responsive';
import { shadowSm } from '@/utils/shadows';

export const PRIMARY = '#1F5D4E';
export const MINT = '#EAF4EC';
export const BODY_BG = '#F5F7F5';
export const TEXT_MUTED = '#5a7a70';
export const TEXT_BLACK = '#111111';
export const BORDER = '#E8EDEA';
export const H_PAD = isSmallDevice ? 16 : 20;
export const SEARCH_DEBOUNCE_MS = 400;

export const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  NA: { bg: '#F3F4F6', text: '#6B7280' },
  Active: { bg: '#EAF4EC', text: PRIMARY },
  Pending: { bg: '#FEF3C7', text: '#B45309' },
  Inactive: { bg: '#F3F4F6', text: '#6B7280' },
};

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  headerSection: {
    backgroundColor: BODY_BG,
    paddingBottom: 4,
  },
  header: {
    paddingHorizontal: H_PAD,
    paddingTop: 10,
    paddingBottom: 12,
  },
  headerWithBack: {
    flexDirection: 'row',
    alignItems: 'center',
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
    lineHeight: 34,
    fontWeight: '800',
    color: TEXT_BLACK,
    marginBottom: isSmallDevice ? 4 : 6,
    marginHorizontal: H_PAD,
    marginTop: 10,
  },
  titleInHeader: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: 0,
  },
  subtitle: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: 20,
    color: TEXT_MUTED,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: H_PAD,
    marginBottom: isSmallDevice ? 12 : 14,
    paddingHorizontal: isSmallDevice ? 12 : 14,
    height: isSmallDevice ? 44 : 48,
    borderRadius: isSmallDevice ? 12 : 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    gap: isSmallDevice ? 8 : 10,
  },
  searchInput: {
    flex: 1,
    fontSize: isSmallDevice ? 14 : 15,
    color: TEXT_BLACK,
    paddingVertical: 0,
  },
  filtersScroll: {
    paddingHorizontal: H_PAD,
    gap: isSmallDevice ? 6 : 8,
    marginBottom: isSmallDevice ? 12 : 14,
  },
  filterChip: {
    paddingHorizontal: isSmallDevice ? 12 : 14,
    paddingVertical: isSmallDevice ? 6 : 8,
    borderRadius: isSmallDevice ? 16 : 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },
  filterChipActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  filterChipText: {
    fontSize: isSmallDevice ? 12 : 13,
    fontWeight: '600',
    color: TEXT_MUTED,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  resultCount: {
    paddingHorizontal: H_PAD,
    fontSize: isSmallDevice ? 12 : 13,
    fontWeight: '600',
    color: TEXT_MUTED,
    marginBottom: isSmallDevice ? 6 :  8,
  },
  listScroll: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: H_PAD,
    paddingTop: isSmallDevice ? 2 :  4,
  },
  listSeparator: {
    height: isSmallDevice ? 10 :  12,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  emptyState: {
    paddingVertical: isSmallDevice ? 36 : 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    ...shadowSm,
  },
  rowPressed: {
    opacity: 0.92,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
  },
  avatar: {
    width: isSmallDevice ? 40 :  44,
    height: isSmallDevice ? 40 :  44,
    borderRadius: 22,
    backgroundColor: MINT,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '700',
    color: PRIMARY,
  },
  rowMain: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  enterpriseName: {
    flex: 1,
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: '700',
    color: TEXT_BLACK,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: MINT,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: isSmallDevice ? 4 :  6,
  },
  categoryText: {
    fontSize: isSmallDevice ? 10 : 11,
    fontWeight: '600',
    color: PRIMARY,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    flex: 1,
    fontSize: isSmallDevice ? 11 : 12,
    color: TEXT_MUTED,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: isSmallDevice ? 3 :  4,
    borderRadius: 8,
    flexShrink: 0,
  },
  statusText: {
    fontSize: isSmallDevice ? 10 : 11,
    fontWeight: '700',
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: isSmallDevice ? 4 : 6,
    paddingLeft: isSmallDevice ? 52 : 56,
  },
  metaItem: {
    fontSize: isSmallDevice ? 11 : 12,
    color: TEXT_MUTED,
    fontWeight: '500',
  },
  metaDot: {
    fontSize: isSmallDevice ? 11 : 12,
    color: '#D1D5DB',
  },
});
