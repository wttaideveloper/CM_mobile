import { Dimensions, StyleSheet } from 'react-native';

import { shadowLg } from '@/utils/shadows';
import { isSmallDevice } from '@/utils/responsive';

export const PRIMARY = '#1F5D4E';
const MINT = '#EAF4EC';
export const PAGE_BG = '#FFFFFF';

const TEXT_DESC = '#6B7280';
const SPEC_CARD_BG = '#F5F7F5';
const PROVIDER_CARD_BG = '#F7FAF8';
export const AVATAR_SIZE = isSmallDevice ? 44 : 48;
const TEXT_BLACK = '#111111';
const BORDER = '#E8EDEA';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
export { SCREEN_WIDTH };
export const H_PAD = isSmallDevice ? 16 : 20;
export const HERO_HEIGHT = Math.round(SCREEN_HEIGHT * (isSmallDevice ? 0.28 : 0.30));
export const TIME_SLOT_COLS = 3;
export const TIME_SLOT_GAP = isSmallDevice ? 8 : 10;
const CONTENT_INNER_WIDTH = SCREEN_WIDTH - H_PAD * 2;
export const TIME_SLOT_WIDTH = Math.floor(
  (CONTENT_INNER_WIDTH - TIME_SLOT_GAP * (TIME_SLOT_COLS - 1)) / TIME_SLOT_COLS,
);

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  statusBarFill: {
    backgroundColor: PAGE_BG,
  },
  body: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  contentScroll: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  hero: {
    backgroundColor: '#F0F2F1',
    position: 'relative',
  },
  heroImage: {
    backgroundColor: '#F0F2F1',
  },
  heroPlaceholder: {
    backgroundColor: MINT,
  },
  heroFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroActions: {
    position: 'absolute',
    top: isSmallDevice ? 12 : 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: isSmallDevice ? 12 : 16,
  },
  heroBtn: {
    width: isSmallDevice ? 38 : 40,
    height: isSmallDevice ? 38 : 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadowLg,
  },
  heroOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: H_PAD,
    paddingBottom: isSmallDevice ? 28 : 20,
  },
  heroCategoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(234, 244, 236, 0.82)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  heroCategoryText: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    color: PRIMARY,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: isSmallDevice ? 22 : 24,
    lineHeight: 34,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  contentSheet: {
    backgroundColor: PAGE_BG,
    paddingHorizontal: H_PAD,
    paddingTop: isSmallDevice ? 16 : 18,
    paddingBottom: 8,
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: PROVIDER_CARD_BG,
    borderRadius: 16,
    padding: isSmallDevice ? 12 : 14,
    marginBottom: isSmallDevice ? 14 : 16,
  },
  providerAvatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  },
  providerAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  providerInfo: {
    flex: 1,
    minWidth: 0,
  },
  providerName: {
    fontSize: isSmallDevice ? 15 : 16,
    lineHeight: 22,
    fontWeight: '700',
    color: TEXT_BLACK,
    marginBottom: 2,
  },
  providerRole: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: 18,
    fontWeight: '500',
    color: TEXT_DESC,
  },
  providerEnterprise: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: 18,
    fontWeight: '500',
    color: TEXT_DESC,
  },
  providerPriceBlock: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  providerPrice: {
    fontSize: isSmallDevice ? 16 : 18,
    lineHeight: 28,
    fontWeight: '900',
    color: PRIMARY,
  },
  providerUnit: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: 16,
    fontWeight: '500',
    color: TEXT_DESC,
    marginTop: 2,
  },
  specsRow: {
    flexDirection: 'row',
    gap: isSmallDevice ? 6 : 8,
    marginBottom: isSmallDevice ? 14 : 16,
  },
  specCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: SPEC_CARD_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: isSmallDevice ? 8 : 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  specIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  specValue: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: 16,
    fontWeight: '700',
    color: TEXT_BLACK,
    textAlign: 'center',
  },
  specLabel: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '500',
    color: TEXT_DESC,
    textAlign: 'center',
  },
  description: {
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 24,
    fontWeight: '400',
    color: TEXT_DESC,
    marginBottom: isSmallDevice ? 20 : 24,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 16 : 16,
    lineHeight: 24,
    fontWeight: '600',
    color: TEXT_BLACK,
    marginBottom: isSmallDevice ? 12 : 14,
  },
  slotsScroll: {
    gap: isSmallDevice ? 8 : 10,
    marginBottom: isSmallDevice ? 14 : 16,
  },
  slotCard: {
    width: isSmallDevice ? 64 : 70,
    paddingVertical: isSmallDevice ? 8 : 10,
    paddingHorizontal: isSmallDevice ? 8 : 10,
    borderRadius: isSmallDevice ? 14 : 18,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: PAGE_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotCardSelected: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  slotCardDisabled: {
    opacity: 0.5,
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  slotTextDisabled: {
    color: '#9CA3AF',
  },
  slotDay: {
    fontSize: isSmallDevice ? 11 : 13,
    lineHeight: isSmallDevice ? 14 : 16,
    fontWeight: '600',
    marginBottom: isSmallDevice ? 2 : 4,
  },
  slotDayUnselected: {
    color: TEXT_DESC,
  },
  slotDaySelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  slotDate: {
    fontSize: isSmallDevice ? 15 : 20,
    lineHeight: isSmallDevice ? 18 : 26,
    fontWeight: '800',
    marginBottom: isSmallDevice ? 2 : 4,
  },
  slotDateUnselected: {
    color: TEXT_BLACK,
  },
  slotDateSelected: {
    color: '#FFFFFF',
  },
  slotCount: {
    fontSize: isSmallDevice ? 10 : 12,
    lineHeight: isSmallDevice ? 13 : 16,
    fontWeight: '500',
    color: TEXT_DESC,
  },
  slotCountSelected: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '600',
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 0,
  },
  timeSlotPill: {
    width: TIME_SLOT_WIDTH,
    paddingVertical: isSmallDevice ? 10 : 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: PAGE_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: TIME_SLOT_GAP,
  },
  timeSlotPillSpaced: {
    marginRight: TIME_SLOT_GAP,
  },
  timeSlotPillActive: {
    backgroundColor: MINT,
    borderColor: PRIMARY,
    borderWidth: 1.5,
  },
  timeSlotText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: TEXT_BLACK,
  },
  timeSlotTextActive: {
    color: PRIMARY,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: H_PAD,
    backgroundColor: PAGE_BG,
  },
  footerBtn: {
    height: isSmallDevice ? 46 : 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBtnText: {
    fontSize: isSmallDevice ? 15 : 16,
    lineHeight: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  footerBtnDisabled: {
    height: isSmallDevice ? 46 : 52,
    borderRadius: 14,
    backgroundColor: '#ECEEEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBtnDisabledText: {
    fontSize: isSmallDevice ? 15 : 16,
    lineHeight: 20,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  pressed: {
    opacity: 0.9,
  },
  loadingContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PAGE_BG,
  },
});
