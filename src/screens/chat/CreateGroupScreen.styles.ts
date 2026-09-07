import { StyleSheet } from 'react-native';

import { isSmallDevice } from '@/utils/responsive';

export const PRIMARY = '#1F5D4E';
const MINT = '#EAF4EC';
const PAGE_BG = '#FFFFFF';
const BODY_BG = '#F5F7F5';
export const TEXT_MUTED = '#9CA3AF';
const TEXT_DESC = '#6B7280';
const TEXT_BLACK = '#111111';
const BORDER = '#E8EDEA';
const SEARCH_BORDER = '#E0E7E1';
const H_PAD = isSmallDevice ? 16 : 20;

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  topSection: {
    backgroundColor: PAGE_BG,
    paddingHorizontal: H_PAD,
    paddingBottom: isSmallDevice ? 10 : 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: isSmallDevice ? 14 : 16,
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
    fontSize: isSmallDevice ? 20 : 22,
    lineHeight: 28,
    fontWeight: '800',
    color: TEXT_BLACK,
  },
  createBtn: {
    fontSize: 16,
    fontWeight: '800',
    color: PRIMARY,
    minWidth: 56,
    textAlign: 'right',
  },
  createBtnDisabled: {
    opacity: 0.4,
  },
  nameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: isSmallDevice ? 12 : 14,
  },
  groupIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: BODY_BG,
    borderWidth: 1,
    borderColor: SEARCH_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: TEXT_BLACK,
    paddingVertical: 8,
  },
  hintText: {
    fontSize: 13,
    fontWeight: '500',
    color: TEXT_MUTED,
    marginBottom: isSmallDevice ? 12 : 14,
  },
  selectedChips: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: isSmallDevice ? 12 : 14,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: MINT,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: PRIMARY,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: BODY_BG,
    borderRadius: isSmallDevice ? 16 : 18,
    borderWidth: 1,
    borderColor: SEARCH_BORDER,
    paddingHorizontal: isSmallDevice ? 12 : 16,
    height: isSmallDevice ? 40 : 48,
  },
  searchInput: {
    flex: 1,
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 20,
    color: TEXT_BLACK,
    paddingVertical: 0,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: TEXT_DESC,
    paddingHorizontal: H_PAD,
    paddingTop: 14,
    paddingBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: H_PAD,
    paddingVertical: 12,
  },
  contactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: MINT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactAvatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: PRIMARY,
  },
  contactInfo: {
    flex: 1,
    minWidth: 0,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_BLACK,
  },
  contactMeta: {
    fontSize: 12,
    color: TEXT_DESC,
    marginTop: 2,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleOn: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER,
    marginLeft: H_PAD + 56,
  },
  pressed: {
    opacity: 0.85,
  },
});
