import { StyleSheet } from 'react-native';

import { shadowSm } from '@/utils/shadows';
import { isSmallDevice } from '@/utils/responsive';

export const PRIMARY = '#1F5D4E';
export const PAGE_BG = '#FFFFFF';
export const BODY_BG = '#F7F8F9';
export const TEXT_MUTED = '#9CA3AF';
export const TEXT_BLACK = '#111111';
export const ICON_BG = '#F5F7F6';
export const SIGN_OUT_BG = '#FEF2F2';
export const SIGN_OUT_BORDER = '#FECACA';
export const SIGN_OUT_RED = '#DC2626';
export const H_PAD = isSmallDevice ? 16 : 20;
export const AVATAR_SIZE = isSmallDevice ? 44 : 50;
export const AVATAR_RADIUS = isSmallDevice ? 12 : 14;
export const ICON_SIZE = isSmallDevice ? 28 : 30;
export const ICON_RADIUS = isSmallDevice ? 10 : 12;
export const PROFILE_CARD_RADIUS = isSmallDevice ? 20 : 24;

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  scroll: {
    flex: 1,
  },
  header: {
    backgroundColor: PAGE_BG,
    paddingHorizontal: H_PAD,
    paddingTop: isSmallDevice ? 10 : 12,
    paddingBottom: isSmallDevice ? 12 : 14,
  },
  title: {
    fontSize: isSmallDevice ? 18 : 20,
    lineHeight: isSmallDevice ? 24 : 26,
    fontWeight: '700',
    color: TEXT_BLACK,
  },
  body: {
    paddingHorizontal: H_PAD,
    paddingTop: isSmallDevice ? 10 : 12,
  },
  profileCard: {
    borderRadius: PROFILE_CARD_RADIUS,
    overflow: 'hidden',
    marginBottom: isSmallDevice ? 10 : 12,
    minHeight: isSmallDevice ? 90 : 100,
    justifyContent: 'center',
  },
  profileGlow: {
    position: 'absolute',
    top: isSmallDevice ? -8 : -10,
    right: isSmallDevice ? 8 : 12,
    width: isSmallDevice ? 72 : 88,
    height: isSmallDevice ? 72 : 88,
    borderRadius: isSmallDevice ? 36 : 44,
    backgroundColor: 'rgba(76, 175, 80, 0.18)',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 10 : 12,
    paddingHorizontal: isSmallDevice ? 12 : 14,
    paddingTop: isSmallDevice ? 12 : 14,
    paddingBottom: isSmallDevice ? 12 : 14,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_RADIUS,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    minWidth: 0,
  },
  profileName: {
    fontSize: isSmallDevice ? 14 : 16,
    lineHeight: isSmallDevice ? 18 : 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: isSmallDevice ? 2 : 4,
  },
  profileEmail: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: isSmallDevice ? 14 : 16,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: isSmallDevice ? 6 : 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 6 : 8,
    flexWrap: 'wrap',
  },
  roleBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    paddingHorizontal: isSmallDevice ? 7 : 9,
    paddingVertical: isSmallDevice ? 2 : 3,
    borderRadius: isSmallDevice ? 6 : 8,
  },
  roleBadgeText: {
    fontSize: isSmallDevice ? 9 : 10,
    lineHeight: isSmallDevice ? 12 : 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  verifiedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: isSmallDevice ? 7 : 9,
    paddingVertical: isSmallDevice ? 2 : 3,
    borderRadius: isSmallDevice ? 6 : 8,
  },
  verifiedBadgeText: {
    fontSize: isSmallDevice ? 9 : 10,
    lineHeight: isSmallDevice ? 12 : 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  editBtn: {
    width: isSmallDevice ? 32 : 36,
    height: isSmallDevice ? 32 : 36,
    borderRadius: isSmallDevice ? 10 : 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statsRow: {
    flexDirection: 'row',
    gap: isSmallDevice ? 8 : 10,
    marginBottom: isSmallDevice ? 14 : 18,
  },
  statCard: {
    flex: 1,
    backgroundColor: PAGE_BG,
    borderRadius: isSmallDevice ? 12 : 14,
    paddingVertical: isSmallDevice ? 10 : 12,
    alignItems: 'center',
    ...shadowSm,
  },
  statValue: {
    fontSize: isSmallDevice ? 14 : 16,
    lineHeight: isSmallDevice ? 18 : 20,
    fontWeight: '700',
    color: TEXT_BLACK,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: isSmallDevice ? 12 : 14,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  section: {
    marginBottom: isSmallDevice ? 12 : 16,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: isSmallDevice ? 12 : 14,
    fontWeight: '600',
    color: TEXT_MUTED,
    letterSpacing: 0.7,
    marginBottom: isSmallDevice ? 6 : 8,
  },
  menuCard: {
    backgroundColor: PAGE_BG,
    borderRadius: isSmallDevice ? 14 : 16,
    overflow: 'hidden',
    ...shadowSm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 10 : 12,
    paddingHorizontal: isSmallDevice ? 12 : 14,
    paddingVertical: isSmallDevice ? 8 : 10,
  },
  menuIconWrap: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_RADIUS,
    backgroundColor: ICON_BG,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  menuEmoji: {
    fontSize: isSmallDevice ? 12 : 14,
  },
  menuTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  menuLabel: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: isSmallDevice ? 16 : 18,
    fontWeight: '600',
    color: TEXT_BLACK,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: isSmallDevice ? 13 : 15,
    fontWeight: '400',
    color: TEXT_MUTED,
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
    marginLeft: (isSmallDevice ? 12 : 14) + ICON_SIZE + (isSmallDevice ? 10 : 12),
    marginRight: isSmallDevice ? 12 : 14,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: isSmallDevice ? 6 : 8,
    backgroundColor: SIGN_OUT_BG,
    borderWidth: 1,
    borderColor: SIGN_OUT_BORDER,
    borderRadius: isSmallDevice ? 14 : 16,
    paddingVertical: isSmallDevice ? 11 : 13,
    marginTop: 4,
    marginBottom: isSmallDevice ? 12 : 16,
  },
  signOutText: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: isSmallDevice ? 16 : 18,
    fontWeight: '600',
    color: SIGN_OUT_RED,
  },
  versionText: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: isSmallDevice ? 13 : 15,
    fontWeight: '400',
    color: TEXT_MUTED,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.9,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  modalSheet: {
    backgroundColor: PAGE_BG,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '88%',
    paddingTop: 16,
    paddingHorizontal: H_PAD,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: isSmallDevice ? 17 : 18,
    lineHeight: isSmallDevice ? 22 : 24,
    fontWeight: '700',
    color: TEXT_BLACK,
  },
  modalCloseText: {
    fontSize: isSmallDevice ? 14 : 15,
    fontWeight: '600',
    color: PRIMARY,
  },
  modalForm: {
    paddingBottom: 12,
  },
  fieldLabel: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: isSmallDevice ? 16 : 18,
    fontWeight: '600',
    color: TEXT_BLACK,
    marginBottom: 6,
    marginTop: 10,
  },
  fieldInput: {
    backgroundColor: BODY_BG,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: isSmallDevice ? 14 : 15,
    color: TEXT_BLACK,
  },
  fieldInputDisabled: {
    color: TEXT_MUTED,
    backgroundColor: '#F3F4F6',
  },
  fieldHint: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: isSmallDevice ? 13 : 15,
    color: TEXT_MUTED,
    marginTop: 4,
  },
  fieldError: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: isSmallDevice ? 16 : 18,
    color: SIGN_OUT_RED,
    marginTop: 12,
  },
  saveBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    marginTop: 8,
  },
  saveBtnDisabled: {
    opacity: 0.75,
  },
  saveBtnText: {
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: isSmallDevice ? 18 : 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
