import { StyleSheet } from 'react-native';

import { shadowSm } from '@/utils/shadows';
import { isSmallDevice } from '@/utils/responsive';

export const PRIMARY = '#1F5D4E';
const MINT = '#EAF4EC';
export const TEXT_MUTED = '#6B7280';
const TEXT_BLACK = '#111111';
const CARD_BG = '#F5F5F5';
const BORDER = '#E8EDEA';
const ERROR = '#DC2626';
const ERROR_BG = '#FEF2F2';
const H_PAD = isSmallDevice ? 16 : 20;

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  statusBarFill: {
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: H_PAD,
    paddingBottom: isSmallDevice ? 10 : 12,
  },
  backBtn: {
    width: isSmallDevice ? 34 : 38,
    height: isSmallDevice ? 34 : 38,
    borderRadius: isSmallDevice ? 10 : 12,
    backgroundColor: CARD_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: isSmallDevice ? 17 : 19,
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: H_PAD,
    paddingBottom: isSmallDevice ? 24 : 32,
  },
  summaryCard: {
    backgroundColor: CARD_BG,
    borderRadius: isSmallDevice ? 14 : 16,
    padding: isSmallDevice ? 14 : 16,
    marginBottom: isSmallDevice ? 16 : 20,
    gap: 4,
    ...shadowSm,
  },
  summaryLabel: {
    fontSize: isSmallDevice ? 10 : 11,
    fontWeight: '600',
    color: TEXT_MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  summaryTitle: {
    fontSize: isSmallDevice ? 16 : 18,
    lineHeight: isSmallDevice ? 21 : 24,
    fontWeight: '800',
    color: TEXT_BLACK,
  },
  fieldGroup: {
    marginBottom: isSmallDevice ? 16 : 18,
  },
  fieldLabel: {
    fontSize: isSmallDevice ? 12.5 : 13.5,
    fontWeight: '700',
    color: TEXT_BLACK,
    marginBottom: 8,
  },
  starRow: {
    flexDirection: 'row',
    gap: isSmallDevice ? 6 : 8,
  },
  starBtn: {
    padding: 4,
  },
  ratingHint: {
    fontSize: isSmallDevice ? 11.5 : 12.5,
    color: TEXT_MUTED,
    marginTop: 6,
  },
  textarea: {
    minHeight: isSmallDevice ? 120 : 140,
    borderRadius: isSmallDevice ? 12 : 14,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: isSmallDevice ? 12 : 14,
    paddingTop: isSmallDevice ? 10 : 12,
    fontSize: isSmallDevice ? 14 : 15,
    color: TEXT_BLACK,
    textAlignVertical: 'top',
  },
  fieldHint: {
    fontSize: isSmallDevice ? 11.5 : 12.5,
    color: TEXT_MUTED,
    marginTop: 5,
  },
  submitBanner: {
    backgroundColor: ERROR_BG,
    borderRadius: isSmallDevice ? 12 : 14,
    padding: isSmallDevice ? 12 : 14,
    marginBottom: isSmallDevice ? 14 : 16,
  },
  submitBannerText: {
    fontSize: isSmallDevice ? 12.5 : 13.5,
    lineHeight: isSmallDevice ? 18 : 20,
    color: ERROR,
    fontWeight: '600',
  },
  sendBtn: {
    height: isSmallDevice ? 48 : 52,
  },
  sendBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sendBtnText: {
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  resultWrap: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: H_PAD,
    paddingVertical: isSmallDevice ? 20 : 28,
  },
  resultIconWrap: {
    width: isSmallDevice ? 64 : 72,
    height: isSmallDevice ? 64 : 72,
    borderRadius: 36,
    backgroundColor: MINT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: isSmallDevice ? 16 : 18,
  },
  resultTitle: {
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: '800',
    color: TEXT_BLACK,
    textAlign: 'center',
    marginBottom: 6,
  },
  resultBody: {
    fontSize: isSmallDevice ? 13.5 : 14.5,
    lineHeight: isSmallDevice ? 20 : 22,
    color: TEXT_MUTED,
    textAlign: 'center',
    maxWidth: 300,
    marginBottom: isSmallDevice ? 6 : 8,
  },
  resultActions: {
    width: '100%',
    gap: isSmallDevice ? 10 : 12,
    alignItems: 'center',
    marginTop: isSmallDevice ? 10 : 12,
  },
  primaryBtn: {
    width: '100%',
    height: isSmallDevice ? 46 : 50,
  },
  primaryBtnText: {
    fontSize: isSmallDevice ? 14.5 : 15.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
