import { StyleSheet } from 'react-native';

import { shadowSm } from '@/utils/shadows';
import { isSmallDevice } from '@/utils/responsive';

export const PRIMARY = '#1F5D4E';
const MINT = '#EAF4EC';
export const TEXT_MUTED = '#6B7280';
const TEXT_BLACK = '#111111';
const PAGE_BG = '#FFFFFF';
const BODY_BG = '#F5F7F5';
const BORDER = '#E8EDEA';
const PROMOTED_BG = '#E2F2E7';
const PROMOTED = '#1F7A45';
const LEFT_BG = '#F3F4F6';
const LEFT = '#6B7280';
const H_PAD = isSmallDevice ? 16 : 20;

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  statusBarFill: {
    backgroundColor: PAGE_BG,
  },
  header: {
    backgroundColor: PAGE_BG,
    paddingHorizontal: H_PAD,
    paddingBottom: isSmallDevice ? 12 : 14,
  },
  titleRow: {
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
    flex: 1,
    minWidth: 0,
    fontSize: isSmallDevice ? 20 : 22,
    lineHeight: 28,
    fontWeight: '800',
    color: TEXT_BLACK,
  },
  pressed: {
    opacity: 0.9,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: H_PAD,
  },
  listContent: {
    paddingHorizontal: H_PAD,
    paddingTop: isSmallDevice ? 14 : 16,
    paddingBottom: isSmallDevice ? 24 : 32,
    gap: isSmallDevice ? 10 : 12,
  },
  card: {
    backgroundColor: PAGE_BG,
    borderRadius: isSmallDevice ? 14 : 16,
    padding: isSmallDevice ? 12 : 14,
    ...shadowSm,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 6,
  },
  cardTitle: {
    flex: 1,
    fontSize: isSmallDevice ? 14.5 : 15.5,
    lineHeight: isSmallDevice ? 19 : 21,
    fontWeight: '800',
    color: TEXT_BLACK,
  },
  statusPill: {
    flexShrink: 0,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 18,
    backgroundColor: MINT,
  },
  statusPillPromoted: {
    backgroundColor: PROMOTED_BG,
  },
  statusPillLeft: {
    backgroundColor: LEFT_BG,
  },
  statusPillText: {
    fontSize: isSmallDevice ? 11 : 12,
    fontWeight: '800',
    color: PRIMARY,
  },
  statusPillTextPromoted: {
    color: PROMOTED,
  },
  statusPillTextLeft: {
    color: LEFT,
  },
  cardMeta: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: isSmallDevice ? 17 : 19,
    fontWeight: '500',
    color: TEXT_MUTED,
    marginBottom: isSmallDevice ? 10 : 12,
  },
  cardActions: {
    flexDirection: 'row',
    gap: isSmallDevice ? 8 : 10,
    paddingTop: isSmallDevice ? 10 : 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
  },
  actionBtn: {
    flex: 1,
    height: isSmallDevice ? 36 : 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnOutline: {
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: PAGE_BG,
  },
  actionBtnFilled: {
    backgroundColor: PRIMARY,
  },
  actionBtnOutlineText: {
    fontSize: isSmallDevice ? 12.5 : 13.5,
    fontWeight: '700',
    color: PRIMARY,
  },
  actionBtnFilledText: {
    fontSize: isSmallDevice ? 12.5 : 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
