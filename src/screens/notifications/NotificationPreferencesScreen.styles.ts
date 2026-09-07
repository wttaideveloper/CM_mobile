import { StyleSheet } from 'react-native';

import { shadowSm } from '@/utils/shadows';
import { isSmallDevice } from '@/utils/responsive';

export const PRIMARY = '#1F5D4E';
const PAGE_BG = '#FFFFFF';
const BODY_BG = '#F7F8F9';
const TEXT_MUTED = '#9CA3AF';
const TEXT_DESC = '#6B7280';
const TEXT_BLACK = '#111111';
const BORDER = '#E5E7EB';
export const H_PAD = isSmallDevice ? 16 : 20;

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: H_PAD,
    paddingBottom: isSmallDevice ? 12 : 14,
    backgroundColor: PAGE_BG,
    gap: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 36,
  },
  title: {
    flex: 1,
    fontSize: isSmallDevice ? 17 : 18,
    lineHeight: isSmallDevice ? 22 : 24,
    fontWeight: '700',
    color: TEXT_BLACK,
  },
  scroll: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: isSmallDevice ? 12 : 14,
    fontWeight: '600',
    color: TEXT_MUTED,
    letterSpacing: 0.7,
    marginTop: isSmallDevice ? 12 : 16,
    marginBottom: isSmallDevice ? 6 : 8,
  },
  card: {
    backgroundColor: PAGE_BG,
    borderRadius: isSmallDevice ? 14 : 16,
    overflow: 'hidden',
    paddingHorizontal: isSmallDevice ? 12 : 14,
    paddingVertical: isSmallDevice ? 4 : 6,
    ...shadowSm,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: isSmallDevice ? 10 : 12,
  },
  preferenceTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  preferenceLabel: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: isSmallDevice ? 16 : 18,
    fontWeight: '600',
    color: TEXT_BLACK,
    marginBottom: 2,
  },
  preferenceSubtitle: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: isSmallDevice ? 13 : 15,
    color: TEXT_DESC,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: H_PAD,
    gap: 12,
  },
  errorText: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: isSmallDevice ? 18 : 20,
    color: TEXT_DESC,
    textAlign: 'center',
  },
  inlineError: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: isSmallDevice ? 16 : 18,
    color: '#DC2626',
    marginTop: 12,
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: PAGE_BG,
    ...shadowSm,
  },
  retryText: {
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: '600',
    color: PRIMARY,
  },
  pressed: {
    opacity: 0.9,
  },
});
