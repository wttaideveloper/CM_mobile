import { StyleSheet } from 'react-native';

import { isSmallDevice } from '@/utils/responsive';

export const PRIMARY = '#1F5D4E';
export const TEXT_MUTED = '#6B7280';
const TEXT_BLACK = '#111111';
const CARD_BG = '#F5F5F5';
const BORDER = '#E8EDEA';

export const styles = StyleSheet.create({
  quoteCard: {
    backgroundColor: CARD_BG,
    borderRadius: isSmallDevice ? 14 : 16,
    padding: isSmallDevice ? 14 : 16,
    marginBottom: isSmallDevice ? 16 : 20,
    gap: isSmallDevice ? 6 : 8,
  },
  quoteLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  quoteLoadingText: {
    fontSize: isSmallDevice ? 12.5 : 13.5,
    color: TEXT_MUTED,
  },
  quoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quoteLabel: {
    fontSize: isSmallDevice ? 12 : 13,
    color: TEXT_MUTED,
  },
  quoteValue: {
    fontSize: isSmallDevice ? 12.5 : 13.5,
    fontWeight: '700',
    color: TEXT_BLACK,
  },
  quoteDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
    marginVertical: isSmallDevice ? 4 : 6,
  },
  quoteTotalLabel: {
    fontSize: isSmallDevice ? 14 : 15,
    fontWeight: '800',
    color: TEXT_BLACK,
  },
  quoteTotalValue: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '900',
    color: PRIMARY,
  },
});
