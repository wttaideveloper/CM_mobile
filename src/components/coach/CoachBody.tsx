import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { CoachChatIcon, CoachPeopleIcon } from '@/components/coach/CoachIcons';
import {
  CARE_TEAM_MEMBERS,
  COACH_BODY,
  COACH_BORDER,
  COACH_CHAT_BG,
  COACH_DOT,
  COACH_MUTED,
  COACH_SOFT,
  COACH_TEAL,
  COMMUNITY_CIRCLE,
  type CareTeamMember,
} from '@/components/coach/coachData';
import { c, NU } from '@/utils/newUiCompact';

function MemberCard({
  member,
  onPress,
  onActionPress,
}: {
  member: CareTeamMember;
  onPress?: () => void;
  onActionPress?: () => void;
}) {
  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View style={[styles.avatar, { backgroundColor: member.avatarBg }]}>
        <Text style={[styles.initials, { color: member.avatarColor }]}>
          {member.initials}
        </Text>
      </View>
      <View style={styles.copy}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {member.name}
          </Text>
          <Text style={styles.time}>{member.time}</Text>
        </View>
        <Text style={styles.role}>{member.role}</Text>
        <Text style={styles.message}>{member.message}</Text>
      </View>
      <View style={styles.side}>
        <View
          style={[
            styles.dot,
            { backgroundColor: member.online ? COACH_DOT : 'transparent' },
          ]}
        />
        {member.action === 'chat' ? (
          <Pressable
            style={styles.actionBtn}
            onPress={onActionPress}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={`Chat with ${member.name}`}
          >
            <CoachChatIcon />
          </Pressable>
        ) : member.action === 'people' ? (
          <Pressable
            style={styles.actionBtn}
            onPress={onActionPress}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={`Open ${member.name}`}
          >
            <CoachPeopleIcon />
          </Pressable>
        ) : (
          <View style={styles.actionSpacer} />
        )}
      </View>
    </Pressable>
  );
}

export function CoachBody() {
  const router = useRouter();

  return (
    <View style={styles.body}>
      {CARE_TEAM_MEMBERS.map((member) => (
        <MemberCard
          key={member.id}
          member={member}
          onPress={
            member.id === 'anita'
              ? () => router.push('/(main)/coach/consults')
              : member.id === 'community'
                ? () => router.push('/(main)/coach/circle')
                : undefined
          }
          onActionPress={
            member.id === 'anita'
              ? () => router.push('/(main)/coach/chat')
              : member.id === 'community'
                ? () => router.push('/(main)/coach/circle')
                : undefined
          }
        />
      ))}

      <View style={styles.circleCard}>
        <Text style={styles.circleTitle}>{COMMUNITY_CIRCLE.title}</Text>
        <Text style={styles.circleBody}>{COMMUNITY_CIRCLE.body}</Text>
        <View style={styles.circleMeta}>
          <View style={styles.avatarStack}>
            {COMMUNITY_CIRCLE.avatars.map((color, index) => (
              <View
                key={color}
                style={[
                  styles.stackAvatar,
                  {
                    backgroundColor: color,
                    marginLeft: index === 0 ? 0 : -10,
                    zIndex: COMMUNITY_CIRCLE.avatars.length - index,
                  },
                ]}
              />
            ))}
          </View>
          <Text style={styles.practising}>{COMMUNITY_CIRCLE.practising}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: NU.hPad,
    paddingTop: c(16, 12),
    paddingBottom: c(26, 20),
    gap: c(11, 9),
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COACH_BORDER,
    borderRadius: c(15, 13),
    padding: NU.cardPadSm,
    flexDirection: 'row',
    gap: c(13, 11),
    alignItems: 'flex-start',
  },
  avatar: {
    width: c(42, 38),
    height: c(42, 38),
    borderRadius: c(21, 19),
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: NU.link,
    fontWeight: '800',
  },
  copy: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: c(8, 6),
  },
  name: {
    flex: 1,
    fontSize: c(14.5, 13.5),
    fontWeight: '700',
    color: COACH_TEAL,
  },
  time: {
    fontSize: NU.label,
    color: COACH_SOFT,
  },
  role: {
    fontSize: NU.bodySm,
    color: COACH_MUTED,
    marginTop: c(2, 1),
  },
  message: {
    fontSize: NU.body,
    lineHeight: c(18, 16),
    color: COACH_BODY,
    marginTop: c(6, 4),
  },
  side: {
    alignItems: 'center',
    gap: c(9, 7),
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actionBtn: {
    width: NU.iconBtn,
    height: NU.iconBtn,
    borderRadius: NU.iconBtnRadius,
    backgroundColor: COACH_CHAT_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionSpacer: {
    width: NU.iconBtn,
    height: NU.iconBtn,
  },
  circleCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COACH_BORDER,
    borderRadius: c(15, 13),
    padding: NU.cardPadSm,
    gap: c(10, 8),
  },
  circleTitle: {
    fontSize: c(14.5, 13.5),
    fontWeight: '700',
    color: COACH_TEAL,
  },
  circleBody: {
    fontSize: NU.body,
    lineHeight: c(19, 17),
    color: COACH_BODY,
  },
  circleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(9, 7),
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stackAvatar: {
    width: c(28, 24),
    height: c(28, 24),
    borderRadius: c(14, 12),
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  practising: {
    fontSize: NU.bodySm,
    color: COACH_MUTED,
  },
});
