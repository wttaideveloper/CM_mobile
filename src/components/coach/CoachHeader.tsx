import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { CoachCalendarIcon } from '@/components/coach/CoachIcons';
import { COACH_GREEN } from '@/components/coach/coachData';
import { useAppointmentsStore } from '@/stores/appointments.store';
import { c, NU } from '@/utils/newUiCompact';

const headerDeco = require('../../assets/images/market-header-deco.png');
const { width: SCREEN_W } = Dimensions.get('window');
const DESIGN_W = 430;

export function CoachHeader() {
  const router = useRouter();
  const scale = SCREEN_W / DESIGN_W;
  const count = useAppointmentsStore((s) => s.appointments.length);

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
      <View style={styles.topRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.eyebrow}>Coach & community</Text>
          <Text style={styles.title}>Your Care Team</Text>
        </View>
        <Pressable
          style={styles.iconBtn}
          onPress={() => router.push('/(main)/coach/appointments')}
          accessibilityRole="button"
          accessibilityLabel="Appointments"
        >
          <CoachCalendarIcon />
          {count > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{count > 9 ? '9+' : count}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COACH_GREEN,
    paddingHorizontal: NU.hPad,
    paddingTop: c(15, 12),
    paddingBottom: NU.headerPadBottom,
    borderBottomLeftRadius: c(30, 26),
    borderBottomRightRadius: c(30, 26),
    overflow: 'hidden',
    position: 'relative',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(12, 10),
    zIndex: 1,
  },
  titleBlock: {
    flex: 1,
  },
  eyebrow: {
    fontSize: NU.eyebrow,
    color: 'rgba(255,255,255,0.85)',
  },
  title: {
    fontSize: c(23, 20),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  iconBtn: {
    width: NU.iconBtn,
    height: NU.iconBtn,
    borderRadius: NU.iconBtnRadius,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: c(18, 16),
    height: c(18, 16),
    borderRadius: c(9, 8),
    paddingHorizontal: c(4, 3),
    backgroundColor: '#164744',
    borderWidth: 1.5,
    borderColor: COACH_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: c(10, 9),
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
