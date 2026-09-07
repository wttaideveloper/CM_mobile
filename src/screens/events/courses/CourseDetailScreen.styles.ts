import { Dimensions, StyleSheet } from 'react-native';

import { shadowSm } from '@/utils/shadows';
import { isSmallDevice } from '@/utils/responsive';

export const PRIMARY = '#1F5D4E';
const MINT = '#EAF4EC';
const TEXT_MUTED = '#6B7280';
const TEXT_BLACK = '#111111';
const CARD_BG = '#F5F7F5';
const BORDER = '#E8EDEA';
export const LEVEL_BEGINNER_BG = '#2563EB';
export const LEVEL_ADVANCED_BG = '#FEE2E2';
export const LEVEL_ADVANCED_TEXT = '#DC2626';
export const LEVEL_ALL_BG = '#EFF6FF';
export const LEVEL_ALL_TEXT = '#1D4ED8';
export const INSTRUCTOR_AVATAR_SIZE = isSmallDevice ? 40 : 44;
export const AVATAR_RADIUS = isSmallDevice ? 10 : 12;
export const MODULE_ICON_SIZE = isSmallDevice ? 32 : 36;
export const MODULE_ICON_RADIUS = isSmallDevice ? 10 : 12;
export const PROGRESS_HEIGHT = isSmallDevice ? 6 : 8;
export const HERO_BTN_SIZE = isSmallDevice ? 34 : 38;
export const HERO_BTN_BG = 'rgba(0, 0, 0, 0.45)';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export { SCREEN_WIDTH };
export const H_PAD = isSmallDevice ? 16 : 20;
export const HERO_HEIGHT = Math.round(SCREEN_WIDTH * (isSmallDevice ? 220 / 375 : 250 / 375));

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
  heroScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
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
    paddingHorizontal: isSmallDevice ? 12 : 14,
    paddingTop: isSmallDevice ? 12 : 16,
  },
  heroBtn: {
    width: HERO_BTN_SIZE,
    height: HERO_BTN_SIZE,
    borderRadius: HERO_BTN_SIZE / 2,
    backgroundColor: HERO_BTN_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBottom: {
    position: 'absolute',
    left: H_PAD,
    right: H_PAD,
    bottom: isSmallDevice ? 16 : 20,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: isSmallDevice ? 8 : 10,
    paddingVertical: isSmallDevice ? 3 : 4,
    borderRadius: isSmallDevice ? 6 : 8,
    marginBottom: isSmallDevice ? 6 : 8,
  },
  levelBadgeText: {
    fontSize: isSmallDevice ? 9 : 10,
    lineHeight: isSmallDevice ? 11 : 12,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  heroTitle: {
    fontSize: isSmallDevice ? 18 : 22,
    lineHeight: isSmallDevice ? 24 : 28,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  contentSheet: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: H_PAD,
    paddingTop: isSmallDevice ? 14 : 18,
    paddingBottom: 8,
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 10 : 12,
    marginBottom: isSmallDevice ? 12 : 16,
  },
  instructorAvatar: {
    width: INSTRUCTOR_AVATAR_SIZE,
    height: INSTRUCTOR_AVATAR_SIZE,
    borderRadius: AVATAR_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  instructorAvatarText: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  instructorInfo: {
    flex: 1,
    minWidth: 0,
  },
  instructorName: {
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: isSmallDevice ? 18 : 20,
    fontWeight: '800',
    color: TEXT_BLACK,
    marginBottom: 2,
  },
  instructorRole: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: isSmallDevice ? 14 : 16,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flexShrink: 0,
  },
  statsRow: {
    flexDirection: 'row',
    gap: isSmallDevice ? 6 : 8,
    marginBottom: isSmallDevice ? 12 : 16,
  },
  statCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: CARD_BG,
    borderRadius: isSmallDevice ? 12 : 14,
    paddingVertical: isSmallDevice ? 10 : 12,
    paddingHorizontal: isSmallDevice ? 4 : 6,
    alignItems: 'center',
    gap: isSmallDevice ? 2 : 4,
  },
  statEmoji: {
    fontSize: isSmallDevice ? 14 : 16,
    marginBottom: isSmallDevice ? 2 : 4,
  },
  statValue: {
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 18,
    fontWeight: '800',
    color: TEXT_BLACK,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: isSmallDevice ? 12 : 14,
    fontWeight: '500',
    color: TEXT_MUTED,
    textAlign: 'center',
  },
  progressCard: {
    backgroundColor: MINT,
    borderRadius: isSmallDevice ? 14 : 16,
    paddingHorizontal: isSmallDevice ? 12 : 14,
    paddingVertical: isSmallDevice ? 12 : 14,
    marginBottom: isSmallDevice ? 14 : 18,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: isSmallDevice ? 8 : 10,
  },
  progressTitle: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: isSmallDevice ? 16 : 18,
    fontWeight: '800',
    color: PRIMARY,
  },
  progressPercent: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: isSmallDevice ? 16 : 18,
    fontWeight: '800',
    color: PRIMARY,
  },
  progressTrack: {
    height: PROGRESS_HEIGHT,
    borderRadius: PROGRESS_HEIGHT / 2,
    backgroundColor: 'rgba(31, 93, 78, 0.15)',
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: PROGRESS_HEIGHT / 2,
    backgroundColor: PRIMARY,
  },
  progressMeta: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: isSmallDevice ? 14 : 16,
    fontWeight: '600',
    color: 'rgb(90, 122, 112)',
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 14 : 16,
    lineHeight: isSmallDevice ? 20 : 22,
    fontWeight: '800',
    color: TEXT_BLACK,
    marginBottom: isSmallDevice ? 10 : 12,
  },
  modulesList: {
    gap: isSmallDevice ? 8 : 10,
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: isSmallDevice ? 12 : 14,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: isSmallDevice ? 10 : 12,
    paddingVertical: isSmallDevice ? 10 : 12,
    gap: isSmallDevice ? 10 : 12,
    ...shadowSm,
  },
  moduleCardActive: {
    borderColor: PRIMARY,
    backgroundColor: '#F7FBF8',
  },
  moduleCardLocked: {
    backgroundColor: '#FAFAFA',
  },
  moduleIcon: {
    width: MODULE_ICON_SIZE,
    height: MODULE_ICON_SIZE,
    borderRadius: MODULE_ICON_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  moduleIconDone: {
    backgroundColor: PRIMARY,
  },
  moduleIconActive: {
    backgroundColor: '#FFFFFF',
  },
  moduleIconLocked: {
    backgroundColor: '#F5F7F6',
  },
  moduleIconDefault: {
    backgroundColor: MINT,
  },
  moduleIconDefaultText: {
    fontSize: isSmallDevice ? 12 : 14,
  },
  moduleText: {
    flex: 1,
    minWidth: 0,
  },
  moduleWeek: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: isSmallDevice ? 12 : 14,
    fontWeight: '500',
    color: TEXT_MUTED,
    marginBottom: isSmallDevice ? 2 : 3,
  },
  moduleTitle: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: isSmallDevice ? 16 : 18,
    fontWeight: '800',
    color: TEXT_BLACK,
  },
  moduleTextLocked: {
    color: '#9CA3AF',
  },
  moduleMeta: {
    alignItems: 'flex-end',
    flexShrink: 0,
    gap: 4,
  },
  moduleLessons: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: isSmallDevice ? 12 : 14,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  moduleStatusDone: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: isSmallDevice ? 12 : 14,
    fontWeight: '700',
    color: 'rgb(34, 197, 94)',
  },
  moduleStatusActive: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: isSmallDevice ? 12 : 14,
    fontWeight: '700',
    color: PRIMARY,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: H_PAD,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
    ...shadowSm,
  },
  footerBtn: {
    height: isSmallDevice ? 44 : 48,
  },
  footerBtnText: {
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: isSmallDevice ? 16 : 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.9,
  },
});
