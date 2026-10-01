import { StyleSheet } from 'react-native';

import { isSmallDevice } from '@/utils/responsive';

export const PRIMARY = '#1F5D4E';
const MINT = '#EAF4EC';
export const TEXT_MUTED = '#6B7280';
const TEXT_BLACK = '#111111';
const BORDER = '#E8EDEA';

export const styles = StyleSheet.create({
  optionList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: isSmallDevice ? 8 : 10,
  },
  optionChip: {
    paddingHorizontal: isSmallDevice ? 12 : 14,
    paddingVertical: isSmallDevice ? 8 : 9,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: BORDER,
    backgroundColor: '#FFFFFF',
  },
  optionChipSelected: {
    borderColor: PRIMARY,
    backgroundColor: MINT,
  },
  optionChipDisabled: {
    opacity: 0.5,
  },
  optionChipText: {
    fontSize: isSmallDevice ? 12.5 : 13.5,
    fontWeight: '600',
    color: TEXT_BLACK,
  },
  optionChipTextSelected: {
    color: PRIMARY,
    fontWeight: '700',
  },
  /** Price (or "Sold out"/"Currently unavailable") under the option name, inside the same chip. */
  optionChipSubText: {
    fontSize: isSmallDevice ? 11 : 12,
    fontWeight: '700',
    color: PRIMARY,
    marginTop: 2,
  },
  optionChipSubTextMuted: {
    color: TEXT_MUTED,
    fontWeight: '600',
  },
});
