import { StyleSheet } from 'react-native';

import { isSmallDevice } from '@/utils/responsive';
import { shadowMd, shadowSm } from '@/utils/shadows';

export const PRIMARY = '#1F5D4E';
export const PAGE_BG = '#FFFFFF';
export const BODY_BG = '#F7F8F9';
export const MINT = '#EAF4EC';
export const TEXT_MUTED = '#5a7a70';
export const TEXT_BLACK = '#111111';
export const BORDER = '#E8EDEA';
export const H_PAD = isSmallDevice ? 16 : 20;

export const checkoutStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: H_PAD,
    paddingBottom: isSmallDevice ? 12 : 14,
    backgroundColor: PAGE_BG,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: MINT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: isSmallDevice ? 18 : 20,
    lineHeight: 26,
    fontWeight: '800',
    color: TEXT_BLACK,
  },
  headerSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: TEXT_MUTED,
    marginTop: 1,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '600',
    color: PRIMARY,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: H_PAD,
    paddingTop: isSmallDevice ? 14 : 16,
  },
  card: {
    backgroundColor: PAGE_BG,
    borderRadius: 16,
    padding: isSmallDevice ? 12 : 14,
    marginBottom: 12,
    ...shadowSm,
  },
  itemRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  itemImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#F0F2F1',
  },
  itemBody: {
    flex: 1,
    minWidth: 0,
  },
  itemName: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: TEXT_BLACK,
    marginBottom: 4,
  },
  itemMeta: {
    fontSize: 13,
    lineHeight: 18,
    color: TEXT_MUTED,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: PRIMARY,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: TEXT_MUTED,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: TEXT_BLACK,
    fontWeight: '700',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: TEXT_BLACK,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: PRIMARY,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: TEXT_BLACK,
    marginBottom: 6,
  },
  input: {
    backgroundColor: PAGE_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: isSmallDevice ? 12 : 13,
    fontSize: 15,
    color: TEXT_BLACK,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  flex: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: H_PAD,
    paddingTop: 12,
    backgroundColor: PAGE_BG,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
    ...shadowSm,
  },
  cta: {
    height: isSmallDevice ? 46 : 48,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  successWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  successBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: MINT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...shadowMd,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: TEXT_BLACK,
    marginBottom: 8,
    textAlign: 'center',
  },
  successText: {
    fontSize: 14,
    lineHeight: 22,
    color: TEXT_MUTED,
    textAlign: 'center',
    marginBottom: 24,
  },
  pressed: {
    opacity: 0.88,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: MINT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnPlus: {
    backgroundColor: PRIMARY,
  },
  qtyValue: {
    minWidth: 22,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: PRIMARY,
  },
  removeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
    marginTop: 6,
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 22,
    color: TEXT_MUTED,
    textAlign: 'center',
    paddingVertical: 40,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: TEXT_MUTED,
    marginBottom: 10,
    letterSpacing: 0.4,
  },
  workflowSectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: TEXT_BLACK,
    marginBottom: 4,
  },
  workflowSectionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: TEXT_MUTED,
    marginBottom: 14,
  },
  stepperWrap: {
    paddingHorizontal: H_PAD,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: PAGE_BG,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  stepperTrackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  stepperItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepperLine: {
    flex: 1,
    height: 2,
    backgroundColor: BORDER,
    borderRadius: 1,
    marginHorizontal: 4,
  },
  stepperLineActive: {
    backgroundColor: PRIMARY,
  },
  stepperDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PAGE_BG,
    borderWidth: 2,
    borderColor: BORDER,
  },
  stepperDotActive: {
    borderColor: PRIMARY,
    backgroundColor: MINT,
  },
  stepperDotComplete: {
    borderColor: PRIMARY,
    backgroundColor: PRIMARY,
  },
  stepperDotText: {
    fontSize: 13,
    fontWeight: '800',
    color: TEXT_MUTED,
  },
  stepperDotTextActive: {
    color: PRIMARY,
  },
  stepperDotCheck: {
    fontSize: 14,
    fontWeight: '800',
    color: PAGE_BG,
  },
  stepperLabelsRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 4,
  },
  stepperLabelPress: {
    flex: 1,
    alignItems: 'center',
  },
  stepperLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: TEXT_MUTED,
    textAlign: 'center',
  },
  stepperLabelActive: {
    color: PRIMARY,
    fontWeight: '800',
  },
  stepperProgressTrack: {
    height: 3,
    borderRadius: 999,
    backgroundColor: BORDER,
    marginTop: 12,
    overflow: 'hidden',
  },
  stepperProgressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: PRIMARY,
  },
  compactSummaryCard: {
    backgroundColor: PAGE_BG,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    ...shadowSm,
  },
  compactSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  compactSummaryLeft: {
    flex: 1,
    minWidth: 0,
  },
  compactSummaryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: TEXT_BLACK,
  },
  compactSummaryMeta: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  compactSummaryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactSummaryTotal: {
    fontSize: 15,
    fontWeight: '800',
    color: PRIMARY,
  },
  compactSummaryChevron: {
    fontSize: 10,
    color: TEXT_MUTED,
  },
  compactSummaryBody: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
    paddingHorizontal: 14,
    paddingBottom: 12,
    paddingTop: 8,
  },
  fieldBlock: {
    marginBottom: 4,
  },
  fieldRequired: {
    color: '#DC2626',
  },
  textAreaInput: {
    minHeight: 96,
    paddingTop: 12,
  },
  signatureBox: {
    borderWidth: 1,
    borderColor: BORDER,
    borderStyle: 'dashed',
    borderRadius: 14,
    backgroundColor: PAGE_BG,
    overflow: 'hidden',
  },
  signatureInput: {
    minHeight: 110,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: TEXT_BLACK,
  },
  signatureHint: {
    fontSize: 11,
    color: TEXT_MUTED,
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  optionList: {
    gap: 8,
    marginBottom: 8,
  },
  optionRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: PAGE_BG,
  },
  optionRowItemSelected: {
    borderColor: PRIMARY,
    backgroundColor: MINT,
  },
  optionRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionRadioSelected: {
    borderColor: PRIMARY,
  },
  optionCheckbox: {
    borderRadius: 4,
  },
  optionRadioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PRIMARY,
  },
  optionRowText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_BLACK,
  },
  optionRowTextSelected: {
    color: PRIMARY,
  },
  fieldHint: {
    fontSize: 12,
    lineHeight: 18,
    color: TEXT_MUTED,
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: BODY_BG,
  },
  optionChipSelected: {
    borderColor: PRIMARY,
    backgroundColor: MINT,
  },
  optionChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_BLACK,
  },
  optionChipTextSelected: {
    color: PRIMARY,
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
    marginBottom: 12,
    fontWeight: '600',
  },
});
