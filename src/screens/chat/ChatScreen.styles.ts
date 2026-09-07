import { StyleSheet } from 'react-native';

import { shadowSm } from '@/utils/shadows';
import { isSmallDevice } from '@/utils/responsive';

export const CHAT_SCREEN_PRIMARY = '#1F5D4E';
export const CHAT_SCREEN_BODY_BG = '#E8F1EF';
export const CHAT_SCREEN_COMPOSER_BG = '#EEF5F4';
export const CHAT_SCREEN_TEXT_MUTED = '#9CA3AF';
export const CHAT_SCREEN_TEXT_DESC = '#6B7280';
export const CHAT_SCREEN_BORDER = '#E8EDEA';
export const CHAT_SCREEN_H_PAD = isSmallDevice ? 16 : 20;
export const CHAT_SCREEN_COMPOSER_PAD_TOP = 6;

export const chatScreenStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: CHAT_SCREEN_BODY_BG },
  flex: { flex: 1 },
  messageListWrap: {
    flex: 1,
    position: 'relative',
    backgroundColor: CHAT_SCREEN_BODY_BG,
  },
  messageList: { flex: 1, backgroundColor: CHAT_SCREEN_BODY_BG },
  messageListContent: {
    paddingHorizontal: CHAT_SCREEN_H_PAD,
    paddingVertical: isSmallDevice ? 8 : 12,
    gap: isSmallDevice ? 4 : 6,
  },
  loader: { marginVertical: 10 },
  initialLoader: { alignItems: 'center', paddingVertical: 10, marginBottom: '100%' },
  emptyMessagesText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 14,
    fontWeight: '600',
    color: CHAT_SCREEN_TEXT_MUTED,
  },
  composer: {
    paddingHorizontal: 6,
    paddingTop: 6,
    paddingBottom: 6,
    backgroundColor: CHAT_SCREEN_COMPOSER_BG,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: CHAT_SCREEN_BORDER,
    ...shadowSm,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  composerDisabled: {
    marginHorizontal: CHAT_SCREEN_H_PAD - 6,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    padding: 12,
    alignItems: 'center',
  },
  composerDisabledText: {
    fontSize: 12,
    fontWeight: '600',
    color: CHAT_SCREEN_TEXT_DESC,
    textAlign: 'center',
  },
});
