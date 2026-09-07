import { StyleSheet } from 'react-native';

import { shadowSm } from '@/utils/shadows';
import { isSmallDevice } from '@/utils/responsive';

export const PRIMARY = '#1F5D4E';
export const MINT = '#EAF4EC';
export const PAGE_BG = '#FFFFFF';
export const TEXT_MUTED = '#9CA3AF';
export const TEXT_DESC = '#6B7280';
export const TEXT_BLACK = '#111111';
export const BORDER = '#E8EDEA';
export const CHIP_INACTIVE_BG = '#F3F4F6';
export const SEARCH_BG = '#F3F4F6';
export const SEARCH_BORDER = '#D1D5DB';
export const H_PAD = isSmallDevice ? 16 : 20;

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  topSection: {
    backgroundColor: PAGE_BG,
    paddingHorizontal: H_PAD,
    paddingBottom: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: isSmallDevice ? 12 : 14,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: isSmallDevice ? 20 : 22,
    lineHeight: 28,
    fontWeight: '800',
    color: TEXT_BLACK,
  },
  menuBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: SEARCH_BG,
    borderRadius: isSmallDevice ? 8 : 8,
    borderWidth: 1,
    borderColor: SEARCH_BORDER,
    paddingHorizontal: isSmallDevice ? 14 : 16,
    height: isSmallDevice ? 44 : 48,
    marginBottom: isSmallDevice ? 12 : 14,
  },
  searchInput: {
    flex: 1,
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 20,
    color: TEXT_BLACK,
    paddingVertical: 0,
  },
  filtersScroll: {
    gap: isSmallDevice ? 8 : 10,
    paddingBottom: isSmallDevice ? 16 : 18,
  },
  chipsDivider: {
    marginHorizontal: -H_PAD,
    borderBottomWidth: 2,
    borderBottomColor: BORDER,
    ...shadowSm,
  },
  filterChip: {
    paddingHorizontal: isSmallDevice ? 14 : 16,
    paddingVertical: isSmallDevice ? 8 : 9,
    borderRadius: 20,
    backgroundColor: CHIP_INACTIVE_BG,
  },
  filterChipActive: {
    backgroundColor: PRIMARY,
  },
  filterChipText: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: 18,
    fontWeight: '600',
    color: TEXT_DESC,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  list: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  listContent: {
    flexGrow: 1,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  loader: {
    marginTop: 40,
  },
  archivedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: H_PAD,
    paddingVertical: 10,
    backgroundColor: PAGE_BG,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  archivedIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CHIP_INACTIVE_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  archivedLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_BLACK,
  },
  archivedCount: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_MUTED,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: H_PAD,
    paddingVertical: 12,
  },
  chatRowSelected: {
    backgroundColor: MINT,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: MINT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGroup: {
    backgroundColor: '#F0FDF4',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: PRIMARY,
  },
  onlineDot: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: PAGE_BG,
  },
  chatBody: {
    flex: 1,
    minWidth: 0,
  },
  chatTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_BLACK,
    marginRight: 8,
  },
  chatTime: {
    fontSize: 12,
    color: TEXT_MUTED,
    fontWeight: '500',
  },
  chatTimeUnread: {
    color: PRIMARY,
    fontWeight: '700',
  },
  chatBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatPreviewRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
  },
  chatPreview: {
    flex: 1,
    fontSize: 14,
    color: TEXT_DESC,
    fontWeight: '500',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  closedBadge: {
    borderRadius: 10,
    backgroundColor: CHIP_INACTIVE_BG,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  closedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: TEXT_DESC,
    textTransform: 'uppercase',
  },
  unreadText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER,
    marginLeft: H_PAD + 64,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    color: TEXT_MUTED,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: H_PAD,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadowSm,
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  menuCard: {
    position: 'absolute',
    backgroundColor: PAGE_BG,
    borderRadius: 12,
    minWidth: 200,
    paddingVertical: 6,
    ...shadowSm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_BLACK,
  },
  pressed: {
    opacity: 0.85,
  },
  archivingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
});
