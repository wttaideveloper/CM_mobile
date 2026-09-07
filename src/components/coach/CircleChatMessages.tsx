import type { RefObject } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  COACH_CHAT_BORDER,
  COACH_CHAT_CHIP_BG,
  COACH_CHAT_DATE,
  COACH_CHAT_INCOMING,
  COACH_CHAT_SOFT,
  COACH_CHAT_TEAL,
} from '@/components/coach/coachChatData';
import {
  CIRCLE_CHAT_INTRO,
  CIRCLE_CHAT_PEERS,
  type CircleChatMessage,
} from '@/components/coach/circleChatData';
import { c, NU } from '@/utils/newUiCompact';

type CircleChatMessagesProps = {
  messages: CircleChatMessage[];
  listRef?: RefObject<ScrollView | null>;
};

export function CircleChatMessages({
  messages,
  listRef,
}: CircleChatMessagesProps) {
  return (
    <ScrollView
      ref={listRef}
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.intro}>
        <View style={styles.peerStack}>
          {CIRCLE_CHAT_PEERS.map((peer, index) => (
            <View
              key={peer.initials}
              style={[
                styles.peerAvatar,
                {
                  backgroundColor: peer.bg,
                  marginLeft: index === 0 ? 0 : -8,
                  zIndex: CIRCLE_CHAT_PEERS.length - index,
                },
              ]}
            >
              <Text style={[styles.peerInitials, { color: peer.color }]}>
                {peer.initials}
              </Text>
            </View>
          ))}
        </View>
        <Text style={styles.introText}>{CIRCLE_CHAT_INTRO}</Text>
      </View>

      <View style={styles.datePill}>
        <Text style={styles.dateText}>Today</Text>
      </View>

      {messages.map((message) => {
        const mine = message.from === 'me';
        return (
          <View
            key={message.id}
            style={[styles.row, mine ? styles.rowMe : styles.rowThem]}
          >
            {!mine && message.sender ? (
              <Text style={[styles.sender, { color: message.senderColor }]}>
                {message.sender}
              </Text>
            ) : null}
            <View
              style={[styles.bubble, mine ? styles.bubbleMe : styles.bubbleThem]}
            >
              <Text style={[styles.text, mine ? styles.textMe : styles.textThem]}>
                {message.text}
              </Text>
            </View>
            <Text style={[styles.time, mine ? styles.timeMe : styles.timeThem]}>
              {message.time}
            </Text>
          </View>
        );
      })}

      <View style={styles.typing}>
        <View style={[styles.dot, { backgroundColor: COACH_CHAT_SOFT }]} />
        <View style={[styles.dot, { backgroundColor: '#c6d8ca' }]} />
        <View style={[styles.dot, { backgroundColor: '#dce9de' }]} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: NU.hPad,
    paddingTop: c(20, 16),
    paddingBottom: c(8, 6),
    gap: NU.groupGap,
  },
  intro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(10, 8),
    paddingVertical: NU.cardPadXs,
    paddingHorizontal: NU.cardPadSm,
    borderRadius: NU.cardRadiusMd,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COACH_CHAT_BORDER,
  },
  peerStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  peerAvatar: {
    width: c(30, 26),
    height: c(30, 26),
    borderRadius: c(15, 13),
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  peerInitials: {
    fontSize: c(10, 9),
    fontWeight: '800',
  },
  introText: {
    flex: 1,
    fontSize: NU.bodySm,
    lineHeight: c(17, 15),
    color: COACH_CHAT_DATE,
  },
  datePill: {
    alignSelf: 'center',
    paddingVertical: c(5, 4),
    paddingHorizontal: NU.cardPadXs,
    borderRadius: 99,
    backgroundColor: COACH_CHAT_CHIP_BG,
  },
  dateText: {
    fontSize: NU.label,
    fontWeight: '600',
    color: COACH_CHAT_DATE,
  },
  row: {
    maxWidth: '82%',
    gap: c(4, 3),
  },
  rowThem: {
    alignSelf: 'flex-start',
  },
  rowMe: {
    alignSelf: 'flex-end',
  },
  sender: {
    fontSize: NU.label,
    fontWeight: '700',
    paddingLeft: c(4, 3),
  },
  bubble: {
    paddingVertical: c(13, 11),
    paddingHorizontal: c(15, 13),
  },
  bubbleThem: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COACH_CHAT_BORDER,
    borderTopLeftRadius: c(18, 16),
    borderTopRightRadius: c(18, 16),
    borderBottomRightRadius: c(18, 16),
    borderBottomLeftRadius: c(6, 5),
  },
  bubbleMe: {
    backgroundColor: COACH_CHAT_TEAL,
    borderWidth: 1,
    borderColor: COACH_CHAT_TEAL,
    borderTopLeftRadius: c(18, 16),
    borderTopRightRadius: c(18, 16),
    borderBottomLeftRadius: c(18, 16),
    borderBottomRightRadius: c(6, 5),
  },
  text: {
    fontSize: NU.link,
    lineHeight: c(22, 20),
  },
  textThem: {
    color: COACH_CHAT_INCOMING,
  },
  textMe: {
    color: '#FFFFFF',
  },
  time: {
    fontSize: NU.label,
    color: COACH_CHAT_SOFT,
  },
  timeThem: {
    alignSelf: 'flex-start',
  },
  timeMe: {
    alignSelf: 'flex-end',
  },
  typing: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(5, 4),
    paddingVertical: NU.cardPadXs,
    paddingHorizontal: NU.cardPad,
    borderRadius: c(18, 16),
    borderBottomLeftRadius: c(6, 5),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COACH_CHAT_BORDER,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
