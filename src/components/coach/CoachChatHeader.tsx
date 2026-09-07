import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { CoachCalendarIcon } from '@/components/coach/CoachIcons';
import {
  COACH_CHAT_GREEN,
  COACH_CHAT_ONLINE,
  COACH_CHAT_TEAL,
} from '@/components/coach/coachChatData';
import { MarketBackIcon } from '@/components/market/MarketIcons';
import { c, NU } from '@/utils/newUiCompact';

const headerDeco = require('../../assets/images/market-header-deco.png');
const { width: SCREEN_W } = Dimensions.get('window');
const DESIGN_W = 430;

type CoachChatHeaderProps = {
  initials: string;
  name: string;
  status: string;
  showCalendar?: boolean;
  onCalendarPress?: () => void;
};

export function CoachChatHeader({
  initials,
  name,
  status,
  showCalendar = false,
  onCalendarPress,
}: CoachChatHeaderProps) {
  const router = useRouter();
  const scale = SCREEN_W / DESIGN_W;

  return (
    <View style={styles.header}>
      <Image
        source={headerDeco}
        style={{
          position: 'absolute',
          left: 0,
          top: -32.5 * scale,
          width: SCREEN_W,
          height: 360 * scale,
        }}
        contentFit="cover"
        pointerEvents="none"
        transition={0}
      />
      <View style={styles.row}>
        <Pressable
          style={styles.iconBtn}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <MarketBackIcon />
        </Pressable>
        <View style={styles.avatar}>
          <Text style={styles.initials}>{initials}</Text>
        </View>
        <View style={styles.copy}>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.statusRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.status}>{status}</Text>
          </View>
        </View>
        {showCalendar ? (
          <Pressable
            style={styles.iconBtn}
            onPress={onCalendarPress}
            accessibilityRole="button"
            accessibilityLabel="Book a consult"
          >
            <CoachCalendarIcon />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COACH_CHAT_GREEN,
    paddingHorizontal: NU.hPad,
    paddingTop: NU.headerPadTop,
    paddingBottom: NU.headerPadBottom,
    borderBottomLeftRadius: c(24, 20),
    borderBottomRightRadius: c(24, 20),
    overflow: 'hidden',
    position: 'relative',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(12, 10),
    zIndex: 1,
  },
  iconBtn: {
    width: NU.iconBtn,
    height: NU.iconBtn,
    borderRadius: NU.iconBtnRadius,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: c(42, 38),
    height: c(42, 38),
    borderRadius: c(21, 19),
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: NU.cardTitle,
    fontWeight: '800',
    color: COACH_CHAT_TEAL,
  },
  copy: {
    flex: 1,
  },
  name: {
    fontSize: NU.cardTitleXl,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.36,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(6, 4),
    marginTop: c(2, 1),
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COACH_CHAT_ONLINE,
  },
  status: {
    fontSize: NU.bodySm,
    color: 'rgba(255,255,255,0.85)',
  },
});
