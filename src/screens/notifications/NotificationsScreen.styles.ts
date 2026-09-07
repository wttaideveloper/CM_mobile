import { StyleSheet } from 'react-native';

import { shadowSm } from '@/utils/shadows';
import { isSmallDevice } from '@/utils/responsive';

export const PRIMARY = '#1F5D4E';
const PAGE_BG = '#FFFFFF';
const BODY_BG = '#F7F8F9';
const TEXT_MUTED = '#9CA3AF';
const TEXT_DESC = '#6B7280';
const TEXT_BLACK = '#111111';
const MARK_READ_BG = '#F0FDF4';
const H_PAD = isSmallDevice ? 16 : 20;
const ICON_SIZE = isSmallDevice ? 40 : 44;
const ICON_RADIUS = isSmallDevice ? 12 : 14;

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  statusBarFill: {
    backgroundColor: PAGE_BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: H_PAD,
    paddingBottom: isSmallDevice ? 12 : 14,
    backgroundColor: PAGE_BG,
    marginBottom: isSmallDevice ? 6 : 8,
  },
  title: {
    fontSize: isSmallDevice ? 20 : 22,
    lineHeight: isSmallDevice ? 26 : 28,
    fontWeight: '800',
    color: TEXT_BLACK,
  },
  markAllReadBtn: {
    backgroundColor: MARK_READ_BG,
    paddingHorizontal: isSmallDevice ? 12 : 14,
    paddingVertical: isSmallDevice ? 6 : 8,
    borderRadius: isSmallDevice ? 16 : 20,
  },
  markAllReadText: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: isSmallDevice ? 14 : 16,
    fontWeight: '700',
    color: PRIMARY,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: H_PAD,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: TEXT_DESC,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 14,
    color: TEXT_DESC,
    fontWeight: '500',
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: MARK_READ_BG,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  retryText: {
    fontSize: 13,
    fontWeight: '700',
    color: PRIMARY,
  },
  listScroll: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  listContent: {
    paddingHorizontal: H_PAD,
  },
  sectionHeader: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: isSmallDevice ? 12 : 14,
    fontWeight: '700',
    color: TEXT_MUTED,
    letterSpacing: 0.8,
    marginBottom: isSmallDevice ? 8 : 10,
  },
  sectionList: {
    gap: isSmallDevice ? 8 : 10,
    marginBottom: isSmallDevice ? 14 : 18,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: isSmallDevice ? 10 : 12,
    padding: isSmallDevice ? 10 : 14,
    backgroundColor: PAGE_BG,
    borderRadius: isSmallDevice ? 14 : 16,
    position: 'relative',
    ...shadowSm,
  },
  iconWrap: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconEmoji: {
    fontSize: isSmallDevice ? 16 : 18,
  },
  notificationContent: {
    flex: 1,
    minWidth: 0,
    paddingRight: isSmallDevice ? 10 : 12,
  },
  notificationTitle: {
    fontSize: isSmallDevice ? 13 : 15,
    lineHeight: isSmallDevice ? 18 : 20,
    fontWeight: '800',
    color: TEXT_BLACK,
    marginBottom: isSmallDevice ? 2 : 4,
  },
  notificationDescription: {
    fontSize: isSmallDevice ? 12 : 14,
    lineHeight: isSmallDevice ? 18 : 20,
    fontWeight: '400',
    color: TEXT_DESC,
    marginBottom: isSmallDevice ? 4 : 6,
  },
  notificationTime: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: isSmallDevice ? 14 : 16,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  unreadDot: {
    position: 'absolute',
    top: isSmallDevice ? 10 : 14,
    right: isSmallDevice ? 10 : 14,
    width: isSmallDevice ? 7 : 8,
    height: isSmallDevice ? 7 : 8,
    borderRadius: isSmallDevice ? 3.5 : 4,
    backgroundColor: PRIMARY,
  },
  pressed: {
    opacity: 0.9,
  },
});
