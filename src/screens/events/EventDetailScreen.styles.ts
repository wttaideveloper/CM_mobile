import { Dimensions, StyleSheet } from 'react-native';

import { shadowSm } from '@/utils/shadows';
import { isSmallDevice } from '@/utils/responsive';

export const PRIMARY = '#1F5D4E';
const MINT = '#EAF4EC';
export const TEXT_MUTED = '#6B7280';
const TEXT_BLACK = '#111111';
const CARD_BG = '#F5F5F5';
const PROVIDER_CARD_BG = '#F7FAF8';
const BORDER = '#E8EDEA';
const STATUS_ORANGE = '#FF9F0A';
export const PROGRESS_GRADIENT_START = '#1A5336';
export const PROGRESS_GRADIENT_END = '#4CAF50';
export const SPEAKER_COLORS = ['#1F5D4E', '#2D6A4E', '#40916C', '#52B788'];
export const ORGANIZER_AVATAR_SIZE = isSmallDevice ? 34 : 38;
export const SPEAKER_AVATAR_SIZE = isSmallDevice ? 34 : 38;
export const PROGRESS_HEIGHT = isSmallDevice ? 6 : 8;
export const HERO_BTN_SIZE = isSmallDevice ? 34 : 38;
export const HERO_BTN_BG = 'rgba(255, 255, 255, 0.28)';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export { SCREEN_WIDTH };
export const H_PAD = isSmallDevice ? 16 : 20;
export const HERO_HEIGHT = Math.round(SCREEN_WIDTH * (isSmallDevice ? 220 / 375 : 250 / 375));
export const SHEET_OVERLAP = isSmallDevice ? 16 : 20;
export const SPEAKER_OVERLAP = 10;

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  statusBarFill: {
    backgroundColor: '#1A1A1A',
  },
  body: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentScroll: {
    flex: 1,
  },
  hero: {
    backgroundColor: '#1A1A1A',
    position: 'relative',
  },
  heroImage: {
    backgroundColor: '#E8EDEA',
  },
  heroFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroActions: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: isSmallDevice ? 12 : 14,
    paddingTop: isSmallDevice ? 4 : 6,
  },
  heroBtn: {
    width: HERO_BTN_SIZE,
    height: HERO_BTN_SIZE,
    borderRadius: HERO_BTN_SIZE / 2,
    backgroundColor: HERO_BTN_BG,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBottom: {
    position: 'absolute',
    left: H_PAD,
    right: H_PAD,
    bottom: SHEET_OVERLAP + (isSmallDevice ? 8 : 12),
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: STATUS_ORANGE,
    paddingHorizontal: isSmallDevice ? 6 : 8,
    paddingVertical: isSmallDevice ? 3 : 4,
    borderRadius: isSmallDevice ? 16 : 20,
    gap: isSmallDevice ? 3 : 4,
    marginBottom: isSmallDevice ? 6 : 8,
  },
  statusText: {
    fontSize: isSmallDevice ? 9 : 10,
    lineHeight: isSmallDevice ? 11 : 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  heroTitle: {
    fontSize: isSmallDevice ? 17 : 21,
    lineHeight: isSmallDevice ? 24 : 28,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  contentSheet: {
    marginTop: -SHEET_OVERLAP,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: H_PAD,
    paddingTop: isSmallDevice ? 14 : 18,
    paddingBottom: 8,
  },
  infoGrid: {
    gap: isSmallDevice ? 8 : 10,
    marginBottom: isSmallDevice ? 12 : 14,
  },
  infoRow: {
    flexDirection: 'row',
    gap: isSmallDevice ? 8 : 10,
  },
  infoCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: CARD_BG,
    borderRadius: isSmallDevice ? 14 : 16,
    paddingHorizontal: isSmallDevice ? 10 : 12,
    paddingVertical: isSmallDevice ? 10 : 12,
  },
  infoEmoji: {
    fontSize: isSmallDevice ? 14 : 16,
    marginBottom: isSmallDevice ? 2 : 4,
  },
  infoLabel: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: isSmallDevice ? 12 : 14,
    fontWeight: '500',
    color: TEXT_MUTED,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: isSmallDevice ? 17 : 19,
    fontWeight: '800',
    color: TEXT_BLACK,
  },
  organizerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 8 : 10,
    backgroundColor: PROVIDER_CARD_BG,
    borderRadius: isSmallDevice ? 14 : 16,
    paddingHorizontal: isSmallDevice ? 12 : 14,
    paddingVertical: isSmallDevice ? 10 : 12,
    marginBottom: isSmallDevice ? 12 : 16,
  },
  organizerAvatar: {
    width: ORGANIZER_AVATAR_SIZE,
    height: ORGANIZER_AVATAR_SIZE,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  },
  organizerAvatarText: {
    fontSize: isSmallDevice ? 13 : 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  organizerInfo: {
    flex: 1,
    minWidth: 0,
  },
  organizerLabel: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: isSmallDevice ? 12 : 14,
    fontWeight: '500',
    color: TEXT_MUTED,
    marginBottom: 1,
  },
  organizerName: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: isSmallDevice ? 17 : 19,
    fontWeight: '800',
    color: TEXT_BLACK,
  },
  followBtn: {
    backgroundColor: MINT,
    paddingHorizontal: isSmallDevice ? 10 : 12,
    paddingVertical: isSmallDevice ? 5 : 6,
    borderRadius: isSmallDevice ? 10 : 12,
    flexShrink: 0,
  },
  followBtnText: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: isSmallDevice ? 14 : 16,
    fontWeight: '700',
    color: PRIMARY,
  },
  description: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: isSmallDevice ? 20 : 23,
    fontWeight: '400',
    color: TEXT_MUTED,
    marginBottom: isSmallDevice ? 14 : 18,
  },
  registrationSection: {
    backgroundColor: CARD_BG,
    borderRadius: isSmallDevice ? 14 : 16,
    paddingHorizontal: isSmallDevice ? 12 : 14,
    paddingVertical: isSmallDevice ? 12 : 14,
    marginBottom: isSmallDevice ? 14 : 18,
  },
  registrationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: isSmallDevice ? 8 : 10,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 14 : 16,
    lineHeight: isSmallDevice ? 20 : 22,
    fontWeight: '800',
    color: TEXT_BLACK,
  },
  registrationPercent: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: isSmallDevice ? 17 : 19,
    fontWeight: '800',
    color: PRIMARY,
  },
  progressTrack: {
    height: PROGRESS_HEIGHT,
    borderRadius: PROGRESS_HEIGHT / 2,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
    marginBottom: 10,
  },
  registrationMeta: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: isSmallDevice ? 15 : 17,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  speakersSection: {
    marginBottom: 8,
  },
  speakerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: isSmallDevice ? 8 : 10,
  },
  speakerAvatar: {
    width: SPEAKER_AVATAR_SIZE,
    height: SPEAKER_AVATAR_SIZE,
    borderRadius: SPEAKER_AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  speakerAvatarText: {
    fontSize: isSmallDevice ? 11 : 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  speakerMore: {
    backgroundColor: '#E5E7EB',
  },
  speakerMoreText: {
    fontSize: isSmallDevice ? 10 : 11,
    fontWeight: '800',
    color: TEXT_MUTED,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 8 : 10,
    paddingHorizontal: H_PAD,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
    ...shadowSm,
  },
  chatBtn: {
    width: isSmallDevice ? 40 : 44,
    height: isSmallDevice ? 40 : 44,
    borderRadius: isSmallDevice ? 10 : 12,
    backgroundColor: CARD_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerBtn: {
    flex: 1,
    height: isSmallDevice ? 42 : 46,
  },
  registerBtnText: {
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: isSmallDevice ? 17 : 19,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.9,
  },
});
