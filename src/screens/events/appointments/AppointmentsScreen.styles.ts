import { StyleSheet } from 'react-native';

import { shadowSm } from '@/utils/shadows';
import { isSmallDevice } from '@/utils/responsive';

export const PRIMARY = '#1F5D4E';
const MINT = '#EAF4EC';
const PAGE_BG = '#FFFFFF';
const BODY_BG = '#F7F8F9';
const TEXT_MUTED = '#9CA3AF';
const TEXT_DESC = '#6B7280';
const TEXT_BLACK = '#111111';
const SWITCH_BG = '#F3F4F6';
export const H_PAD = isSmallDevice ? 16 : 20;
const ADD_BTN_SIZE = isSmallDevice ? 36 : 40;
const DAY_CARD_WIDTH = isSmallDevice ? 40 : 44;
const APPT_IMAGE_SIZE = isSmallDevice ? 64 : 72;
const ACTION_BTN_HEIGHT = isSmallDevice ? 36 : 40;

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  header: {
    backgroundColor: PAGE_BG,
    paddingHorizontal: H_PAD,
    paddingBottom: isSmallDevice ? 12 : 14,
    marginBottom: isSmallDevice ? 6 : 8,
  },
  titleRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: isSmallDevice ? 10 : 14,
  },
  title: {
    fontSize: isSmallDevice ? 20 : 22,
    lineHeight: isSmallDevice ? 26 : 28,
    fontWeight: '800',
    color: TEXT_BLACK,
  },
  addBtn: {
    width: ADD_BTN_SIZE,
    height: ADD_BTN_SIZE,
    borderRadius: isSmallDevice ? 10 : 12,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: isSmallDevice ? 10 : 14,
    gap: isSmallDevice ? 8 : 12,
  },
  monthLabel: {
    fontSize: isSmallDevice ? 14 : 16,
    lineHeight: isSmallDevice ? 20 : 22,
    fontWeight: '800',
    color: TEXT_BLACK,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: SWITCH_BG,
    borderRadius: isSmallDevice ? 16 : 20,
    padding: isSmallDevice ? 3 : 4,
    minWidth: isSmallDevice ? 160 : 180,
  },
  tabOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isSmallDevice ? 5 : 7,
    borderRadius: isSmallDevice ? 14 : 16,
  },
  tabOptionActive: {
    backgroundColor: PAGE_BG,
    ...shadowSm,
  },
  tabOptionText: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: isSmallDevice ? 14 : 16,
    fontWeight: '600',
    color: TEXT_MUTED,
  },
  tabOptionTextActive: {
    color: PRIMARY,
    fontWeight: '700',
  },
  calendarScroll: {
    gap: isSmallDevice ? 6 : 8,
    paddingBottom: 2,
  },
  dayCard: {
    width: DAY_CARD_WIDTH,
    minHeight: isSmallDevice ? 60 : 68,
    borderRadius: isSmallDevice ? 12 : 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isSmallDevice ? 6 : 8,
  },
  dayCardSelected: {
    backgroundColor: PRIMARY,
    borderRadius: isSmallDevice ? 14 : 16,
  },
  dayLabel: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: isSmallDevice ? 12 : 14,
    fontWeight: '600',
    color: TEXT_MUTED,
    marginBottom: isSmallDevice ? 2 : 4,
  },
  dayLabelSelected: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  dayNumber: {
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: isSmallDevice ? 16 : 18,
    fontWeight: '800',
    color: TEXT_BLACK,
  },
  dayNumberSelected: {
    color: '#FFFFFF',
  },
  dayDotSelected: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  dayDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: PRIMARY,
    marginTop: 4,
  },
  listScroll: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  sectionLabel: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: isSmallDevice ? 12 : 14,
    fontWeight: '700',
    color: TEXT_MUTED,
    letterSpacing: 0.6,
    marginBottom: isSmallDevice ? 8 : 10,
  },
  list: {
    gap: isSmallDevice ? 10 : 12,
  },
  appointmentCard: {
    backgroundColor: PAGE_BG,
    borderRadius: isSmallDevice ? 14 : 16,
    borderTopWidth: 4,
    padding: isSmallDevice ? 10 : 14,
    ...shadowSm,
  },
  cardTop: {
    flexDirection: 'row',
    gap: isSmallDevice ? 10 : 12,
    marginBottom: isSmallDevice ? 10 : 12,
  },
  appointmentImage: {
    width: APPT_IMAGE_SIZE,
    height: APPT_IMAGE_SIZE,
    borderRadius: isSmallDevice ? 10 : 12,
    backgroundColor: '#E8EDEA',
    flexShrink: 0,
  },
  appointmentContent: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: isSmallDevice ? 6 : 8,
    marginBottom: isSmallDevice ? 2 : 4,
  },
  appointmentTitle: {
    flex: 1,
    fontSize: isSmallDevice ? 14 : 16,
    lineHeight: isSmallDevice ? 18 : 20,
    fontWeight: '800',
    color: TEXT_BLACK,
  },
  instructorText: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: isSmallDevice ? 16 : 18,
    fontWeight: '500',
    color: TEXT_DESC,
    marginBottom: isSmallDevice ? 6 : 8,
  },
  metaText: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: isSmallDevice ? 16 : 18,
    fontWeight: '500',
    color: TEXT_DESC,
    marginBottom: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 4 : 5,
    paddingHorizontal: isSmallDevice ? 8 : 10,
    paddingVertical: isSmallDevice ? 3 : 4,
    borderRadius: isSmallDevice ? 16 : 20,
    flexShrink: 0,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: isSmallDevice ? 12 : 14,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: isSmallDevice ? 6 : 8,
  },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: isSmallDevice ? 10 : 12,
    height: ACTION_BTN_HEIGHT,
    borderRadius: isSmallDevice ? 10 : 12,
    backgroundColor: MINT,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D1E7D6',
  },
  chatBtnText: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: isSmallDevice ? 14 : 16,
    fontWeight: '700',
    color: PRIMARY,
  },
  rescheduleBtn: {
    flex: 1,
    height: ACTION_BTN_HEIGHT,
    borderRadius: isSmallDevice ? 10 : 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rescheduleBtnText: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: isSmallDevice ? 14 : 16,
    fontWeight: '700',
    color: TEXT_DESC,
  },
  directionsBtn: {
    flex: 1,
    height: ACTION_BTN_HEIGHT,
    borderRadius: isSmallDevice ? 10 : 12,
    backgroundColor: MINT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  directionsBtnText: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: isSmallDevice ? 14 : 16,
    fontWeight: '700',
    color: PRIMARY,
  },
  pressed: {
    opacity: 0.9,
  },
});
