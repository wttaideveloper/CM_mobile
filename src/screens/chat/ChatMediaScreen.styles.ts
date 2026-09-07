import { Dimensions, StyleSheet } from 'react-native';

import { isSmallDevice } from '@/utils/responsive';

export const PRIMARY = '#1F5D4E';
export const BODY_BG = '#F7F8F9';
export const PAGE_BG = '#FFFFFF';
export const TEXT_MUTED = '#9CA3AF';
export const TEXT_DESC = '#6B7280';
export const TEXT_BLACK = '#111111';
export const BORDER = '#E8EDEA';
export const H_PAD = isSmallDevice ? 16 : 20;
export const GRID_COLUMNS = 3;
export const GRID_GAP = 2;
const GRID_WIDTH = Dimensions.get('window').width;
export const TILE_SIZE = Math.floor((GRID_WIDTH - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS);

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BODY_BG },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: H_PAD,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: PAGE_BG,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: isSmallDevice ? 16 : 17,
    fontWeight: '800',
    color: TEXT_BLACK,
  },
  headerSpacer: { width: 36 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: PAGE_BG,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: PRIMARY,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT_MUTED,
  },
  tabTextActive: {
    color: PRIMARY,
  },
  listContent: {
    paddingBottom: 24,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: H_PAD,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_MUTED,
    textAlign: 'center',
  },
  sectionBlock: {
    marginTop: 12,
  },
  sectionTitle: {
    paddingHorizontal: H_PAD,
    paddingVertical: 10,
    fontSize: 12,
    fontWeight: '800',
    color: TEXT_DESC,
    letterSpacing: 0.6,
    backgroundColor: BODY_BG,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  mediaTile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    backgroundColor: '#E8EDEA',
    overflow: 'hidden',
  },
  mediaTileImage: {
    width: '100%',
    height: '100%',
  },
  mediaTileFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoBadge: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: H_PAD,
    paddingVertical: 12,
    backgroundColor: PAGE_BG,
  },
  docIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docInfo: {
    flex: 1,
    minWidth: 0,
  },
  docName: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT_BLACK,
  },
  docMeta: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '500',
    color: TEXT_DESC,
  },
  docSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER,
    marginLeft: H_PAD + 56,
  },
  pressed: { opacity: 0.85 },
});
