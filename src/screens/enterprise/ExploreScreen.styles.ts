import { StyleSheet } from 'react-native';

import { shadowMd, shadowSm } from '@/utils/shadows';
import { isSmallDevice } from '@/utils/responsive';

export const PRIMARY = '#1F5D4E';
const MINT = '#EAF4EC';
export const TEXT_MUTED = '#6B7280';
const TEXT_BLACK = '#111111';
const BORDER = '#E8EDEA';
export const BODY_BG = '#F5F7F5';
export const HERO_BG = '#1A1A1A';
export const HERO_HEIGHT = isSmallDevice ? 200 : 220;
export const H_PAD = isSmallDevice ? 16 : 20;
export const HERO_ACTIONS_TOP = isSmallDevice ? 8 : 10;
export const STAR_SIZE = isSmallDevice ? 15 : 17;

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: HERO_BG,
  },
  scroll: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  heroWrap: {
    height: HERO_HEIGHT,
    backgroundColor: HERO_BG,
  },
  heroImage: {
    width: '100%',
    height: HERO_HEIGHT,
  },
  heroActions: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: H_PAD,
    paddingBottom: 8,
  },
  heroActionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    backgroundColor: BODY_BG,
    paddingHorizontal: H_PAD,
    paddingTop: 0,
    paddingBottom: 8,
  },
  profileSection: {
    marginTop: -24,
    marginBottom: isSmallDevice ? 16 : 20,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 10,
  },
  logoBox: {
    width: isSmallDevice ? 68 : 76,
    height: isSmallDevice ? 68 : 76,
    flexShrink: 0,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...shadowMd,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoLetter: {
    fontSize: isSmallDevice ? 28 : 32,
    fontWeight: '700',
    color: PRIMARY,
  },
  profileText: {
    flex: 1,
    minWidth: 0,
    paddingTop: 38,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  businessName: {
    flexShrink: 1,
    fontSize: isSmallDevice ? 17 : 19,
    lineHeight: 24,
    fontWeight: '800',
    color: TEXT_BLACK,
    letterSpacing: -0.3,
  },
  categoryLocation: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: 18,
    fontWeight: '500',
    color: TEXT_MUTED,
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    paddingLeft: 2,
  },
  ratingText: {
    flex: 1,
    flexShrink: 1,
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: 18,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    flexShrink: 0,
  },
  ratingValue: {
    fontWeight: '700',
    color: TEXT_BLACK,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: isSmallDevice ? 16 : 20,
  },
  statCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: isSmallDevice ? 12 : 14,
    paddingHorizontal: 4,
    alignItems: 'center',
    ...shadowSm,
  },
  statValue: {
    fontSize: isSmallDevice ? 15 : 17,
    lineHeight: 22,
    fontWeight: '800',
    color: TEXT_BLACK,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: 14,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: isSmallDevice ? 20 : 24,
  },
  actionBtn: {
    flex: 1,
    minWidth: 0,
    borderRadius: 14,
    height: isSmallDevice ? 44 : 48,
  },
  actionBtnOutline: {
    flex: 1,
    minWidth: 0,
    height: isSmallDevice ? 44 : 48,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnTextActive: {
    fontSize: isSmallDevice ? 14 : 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionBtnTextOutline: {
    fontSize: isSmallDevice ? 14 : 15,
    fontWeight: '700',
    color: PRIMARY,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: MINT,
    borderRadius: 14,
    padding: 4,
    marginBottom: isSmallDevice ? 16 : 20,
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
  tabContent: {
    minHeight: 80,
  },
  tabLoading: {
    paddingVertical: 28,
    alignItems: 'center',
  },
  aboutText: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: 22,
    fontWeight: '400',
    color: TEXT_MUTED,
  },
  serviceList: {
    gap: 10,
  },
  serviceListItem: {
    paddingHorizontal: H_PAD,
    backgroundColor: BODY_BG,
  },
  serviceListSeparator: {
    height: 10,
    backgroundColor: BODY_BG,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    paddingRight: 10,
    gap: 8,
    ...shadowSm,
  },
  serviceRowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    minWidth: 0,
  },
  serviceChatBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: MINT,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  serviceChatBtnDisabled: {
    opacity: 0.7,
  },
  serviceIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: MINT,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  serviceMain: {
    flex: 1,
    minWidth: 0,
  },
  serviceName: {
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 20,
    fontWeight: '700',
    color: TEXT_BLACK,
    marginBottom: 3,
  },
  serviceMeta: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: 16,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  servicePrice: {
    fontSize: isSmallDevice ? 15 : 16,
    lineHeight: 22,
    fontWeight: '800',
    color: PRIMARY,
    flexShrink: 0,
  },
  productsScroll: {
    gap: 14,
    paddingRight: 4,
  },
  productCard: {
    width: isSmallDevice ? 108 : 116,
  },
  productImage: {
    width: isSmallDevice ? 108 : 116,
    height: isSmallDevice ? 108 : 116,
    borderRadius: 16,
    backgroundColor: '#F0F2F1',
    marginBottom: 10,
  },
  productName: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: 18,
    fontWeight: '700',
    color: TEXT_BLACK,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 20,
    fontWeight: '800',
    color: PRIMARY,
  },
  btnPressed: {
    opacity: 0.9,
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
});
