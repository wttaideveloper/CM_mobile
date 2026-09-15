import { StyleSheet } from 'react-native';

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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: H_PAD,
    paddingBottom: isSmallDevice ? 24 : 32,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: H_PAD,
  },
  summaryCard: {
    backgroundColor: CARD_BG,
    borderRadius: isSmallDevice ? 14 : 16,
    padding: isSmallDevice ? 14 : 16,
    marginBottom: isSmallDevice ? 16 : 20,
    gap: isSmallDevice ? 10 : 12,
  },
  summaryTitle: {
    fontSize: isSmallDevice ? 16 : 18,
    lineHeight: isSmallDevice ? 21 : 24,
    fontWeight: '800',
    color: TEXT_BLACK,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: isSmallDevice ? 8 : 10,
  },
  summaryItem: {
    flex: 1,
    minWidth: 0,
  },
  summaryLabel: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: isSmallDevice ? 12 : 14,
    fontWeight: '500',
    color: TEXT_MUTED,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: isSmallDevice ? 12.5 : 13.5,
    lineHeight: isSmallDevice ? 17 : 19,
    fontWeight: '700',
    color: TEXT_BLACK,
  },
  spotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: isSmallDevice ? 8 : 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
  },
  spotsText: {
    fontSize: isSmallDevice ? 12 : 13,
    fontWeight: '600',
    color: TEXT_MUTED,
  },
  priceText: {
    fontSize: isSmallDevice ? 13.5 : 14.5,
    fontWeight: '800',
    color: PRIMARY,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 14 : 16,
    lineHeight: isSmallDevice ? 20 : 22,
    fontWeight: '800',
    color: TEXT_BLACK,
    marginBottom: isSmallDevice ? 10 : 12,
  },
  fieldGroup: {
    marginBottom: isSmallDevice ? 14 : 16,
  },
  fieldLabel: {
    fontSize: isSmallDevice ? 12.5 : 13.5,
    fontWeight: '700',
    color: TEXT_BLACK,
    marginBottom: 6,
  },
  input: {
    height: isSmallDevice ? 44 : 48,
    borderRadius: isSmallDevice ? 12 : 14,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: isSmallDevice ? 12 : 14,
    fontSize: isSmallDevice ? 14 : 15,
    color: TEXT_BLACK,
  },
  inputError: {
    borderColor: ERROR,
  },
  fieldErrorText: {
    fontSize: isSmallDevice ? 11.5 : 12.5,
    color: ERROR,
    marginTop: 5,
    fontWeight: '600',
  },
  fieldHint: {
    fontSize: isSmallDevice ? 11.5 : 12.5,
    color: TEXT_MUTED,
    marginTop: 5,
  },
  submitBanner: {
    flexDirection: 'row',
    backgroundColor: ERROR_BG,
    borderRadius: isSmallDevice ? 12 : 14,
    padding: isSmallDevice ? 12 : 14,
    marginBottom: isSmallDevice ? 14 : 16,
  },
  submitBannerText: {
    flex: 1,
    fontSize: isSmallDevice ? 12.5 : 13.5,
    lineHeight: isSmallDevice ? 18 : 20,
    color: ERROR,
    fontWeight: '600',
  },
  submitBtn: {
    height: isSmallDevice ? 46 : 50,
    marginTop: isSmallDevice ? 4 : 6,
  },
  submitBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitBtnText: {
    fontSize: isSmallDevice ? 14.5 : 15.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  disclaimer: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: isSmallDevice ? 16 : 18,
    color: TEXT_MUTED,
    marginTop: isSmallDevice ? 12 : 14,
    textAlign: 'center',
  },
  successWrap: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: H_PAD,
    paddingVertical: isSmallDevice ? 20 : 28,
  },
  successIconWrap: {
    width: isSmallDevice ? 64 : 72,
    height: isSmallDevice ? 64 : 72,
    borderRadius: 36,
    backgroundColor: MINT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: isSmallDevice ? 16 : 18,
  },
  successTitle: {
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: '800',
    color: TEXT_BLACK,
    textAlign: 'center',
    marginBottom: 6,
  },
  successBody: {
    fontSize: isSmallDevice ? 13.5 : 14.5,
    lineHeight: isSmallDevice ? 20 : 22,
    color: TEXT_MUTED,
    textAlign: 'center',
    maxWidth: 300,
    marginBottom: isSmallDevice ? 6 : 8,
  },
  successSummaryCard: {
    width: '100%',
    backgroundColor: CARD_BG,
    borderRadius: isSmallDevice ? 14 : 16,
    padding: isSmallDevice ? 12 : 14,
    marginTop: isSmallDevice ? 8 : 10,
    gap: isSmallDevice ? 10 : 12,
  },
  successSummaryRow: {
    flexDirection: 'row',
    gap: isSmallDevice ? 8 : 10,
  },
  successSummaryItem: {
    flex: 1,
    minWidth: 0,
  },
  successStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: isSmallDevice ? 8 : 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
  },
  successStatusLabel: {
    fontSize: isSmallDevice ? 12 : 13,
    fontWeight: '600',
    color: TEXT_MUTED,
  },
  successStatusPill: {
    backgroundColor: MINT,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 18,
  },
  successStatusPillText: {
    fontSize: isSmallDevice ? 11 : 12,
    fontWeight: '800',
    color: PRIMARY,
  },
  successRefCard: {
    width: '100%',
    backgroundColor: CARD_BG,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: isSmallDevice ? 10 : 12,
    marginBottom: isSmallDevice ? 16 : 20,
  },
  successRefMissing: {
    fontSize: isSmallDevice ? 12 : 13,
    color: TEXT_MUTED,
    textAlign: 'center',
    marginTop: isSmallDevice ? 10 : 12,
    marginBottom: isSmallDevice ? 16 : 20,
    maxWidth: 280,
  },
  successActions: {
    width: '100%',
    gap: isSmallDevice ? 10 : 12,
    alignItems: 'center',
  },
  secondaryBtn: {
    width: '100%',
    height: isSmallDevice ? 46 : 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  secondaryBtnText: {
    fontSize: isSmallDevice ? 14 : 15,
    fontWeight: '800',
    color: PRIMARY,
  },
  textBtn: {
    paddingVertical: 8,
  },
  textBtnText: {
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: '700',
    color: TEXT_MUTED,
  },
  successRefLabel: {
    fontSize: 11,
    color: TEXT_MUTED,
    fontWeight: '600',
    marginBottom: 2,
    textAlign: 'center',
  },
  successRefValue: {
    fontSize: 14,
    color: TEXT_BLACK,
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  doneBtn: {
    height: isSmallDevice ? 46 : 50,
    width: '100%',
  },
  doneBtnText: {
    fontSize: isSmallDevice ? 14.5 : 15.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
