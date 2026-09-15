import { StyleSheet } from 'react-native';

import { shadowSm } from '@/utils/shadows';
import { isSmallDevice } from '@/utils/responsive';

export const PRIMARY = '#1F5D4E';
const MINT = '#EAF4EC';
export const TEXT_MUTED = '#6B7280';
const TEXT_BLACK = '#111111';
const PAGE_BG = '#FFFFFF';
const BODY_BG = '#F5F7F5';
const CARD_BG = '#F5F5F5';
const BORDER = '#E8EDEA';
const CANCELLED = '#DC2626';
const CANCELLED_BG = '#FEF2F2';
const H_PAD = isSmallDevice ? 16 : 20;
const QR_SIZE = isSmallDevice ? 200 : 230;

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  statusBarFill: {
    backgroundColor: PAGE_BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: PAGE_BG,
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
    paddingTop: isSmallDevice ? 14 : 16,
    paddingBottom: isSmallDevice ? 28 : 36,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: H_PAD,
  },
  ticketCard: {
    backgroundColor: PAGE_BG,
    borderRadius: 20,
    padding: isSmallDevice ? 16 : 20,
    ...shadowSm,
    marginBottom: isSmallDevice ? 16 : 20,
  },
  eventTitle: {
    fontSize: isSmallDevice ? 17 : 19,
    lineHeight: isSmallDevice ? 22 : 25,
    fontWeight: '800',
    color: TEXT_BLACK,
    marginBottom: isSmallDevice ? 12 : 14,
  },
  infoRow: {
    flexDirection: 'row',
    gap: isSmallDevice ? 8 : 10,
    marginBottom: isSmallDevice ? 12 : 14,
  },
  qrWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isSmallDevice ? 16 : 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
    marginTop: 4,
  },
  qrImage: {
    width: QR_SIZE,
    height: QR_SIZE,
    borderRadius: 12,
  },
  qrCaption: {
    marginTop: isSmallDevice ? 10 : 12,
    fontSize: isSmallDevice ? 12 : 13,
    fontWeight: '600',
    color: TEXT_MUTED,
  },
  qrState: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: isSmallDevice ? 20 : 24,
  },
  qrStateText: {
    fontSize: isSmallDevice ? 12.5 : 13.5,
    color: TEXT_MUTED,
    textAlign: 'center',
    maxWidth: 260,
  },
  retryBtn: {
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: MINT,
  },
  retryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: PRIMARY,
  },
  refRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: isSmallDevice ? 12 : 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
    marginTop: isSmallDevice ? 12 : 14,
  },
  refLabel: {
    fontSize: isSmallDevice ? 11.5 : 12.5,
    fontWeight: '600',
    color: TEXT_MUTED,
  },
  refValue: {
    fontSize: isSmallDevice ? 12.5 : 13.5,
    fontWeight: '800',
    color: TEXT_BLACK,
    letterSpacing: 0.4,
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 18,
    backgroundColor: MINT,
    marginBottom: isSmallDevice ? 12 : 14,
  },
  statusPillCancelled: {
    backgroundColor: CANCELLED_BG,
  },
  statusPillText: {
    fontSize: isSmallDevice ? 11 : 12,
    fontWeight: '800',
    color: PRIMARY,
  },
  statusPillTextCancelled: {
    color: CANCELLED,
  },
  cancelSection: {
    marginTop: isSmallDevice ? 4 : 6,
  },
  cancelBtn: {
    height: isSmallDevice ? 46 : 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: CANCELLED,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  cancelBtnDisabled: {
    opacity: 0.5,
  },
  cancelBtnText: {
    fontSize: isSmallDevice ? 14 : 15,
    fontWeight: '800',
    color: CANCELLED,
  },
  cancelledNotice: {
    fontSize: isSmallDevice ? 12.5 : 13.5,
    color: TEXT_MUTED,
    textAlign: 'center',
  },
});
