import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  APPT_BORDER,
  APPT_GREEN,
  APPT_MUTED,
  APPT_SOFT,
  APPT_TEAL,
} from '@/components/coach/appointmentsData';
import type { CoachAppointment } from '@/stores/appointments.store';
import { c, NU } from '@/utils/newUiCompact';

type AppointmentsBodyProps = {
  appointments: CoachAppointment[];
};

export function AppointmentsBody({ appointments }: AppointmentsBodyProps) {
  const router = useRouter();

  if (appointments.length === 0) {
    return (
      <View style={styles.body}>
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No appointments yet</Text>
          <Text style={styles.emptyBody}>
            Book a consult with your care team and it will show up here.
          </Text>
          <Pressable
            style={styles.emptyCta}
            onPress={() => router.push('/(main)/coach/consults')}
            accessibilityRole="button"
          >
            <Text style={styles.emptyCtaText}>Book a consult</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.body}>
      <Text style={styles.sectionLabel}>Upcoming</Text>
      <View style={styles.list}>
        {appointments.map((appt) => (
          <View key={appt.id} style={styles.card}>
            <View style={[styles.avatar, { backgroundColor: appt.avatarBg }]}>
              <Text style={[styles.initials, { color: appt.avatarColor }]}>
                {appt.initials}
              </Text>
            </View>
            <View style={styles.copy}>
              <View style={styles.topRow}>
                <Text style={styles.name}>{appt.providerName}</Text>
                <View
                  style={[
                    styles.statusPill,
                    appt.status === 'confirmed'
                      ? styles.statusConfirmed
                      : styles.statusUpcoming,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      appt.status === 'confirmed'
                        ? styles.statusTextConfirmed
                        : styles.statusTextUpcoming,
                    ]}
                  >
                    {appt.status === 'confirmed' ? 'Booked' : 'Next'}
                  </Text>
                </View>
              </View>
              <Text style={styles.meta}>
                {appt.mode} · {appt.duration}
              </Text>
              <Text style={styles.when}>{appt.when}</Text>
            </View>
          </View>
        ))}
      </View>

      <Pressable
        style={styles.bookBtn}
        onPress={() => router.push('/(main)/coach/consults')}
        accessibilityRole="button"
      >
        <Text style={styles.bookText}>Book another consult</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: NU.hPad,
    paddingTop: NU.bodyPadTop,
    paddingBottom: NU.bodyPadBottom,
    gap: NU.groupGap,
  },
  sectionLabel: {
    fontSize: NU.body,
    fontWeight: '700',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: APPT_MUTED,
  },
  list: {
    gap: NU.cardGap,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: APPT_BORDER,
    borderRadius: NU.cardRadius,
    padding: NU.cardPadSm,
    flexDirection: 'row',
    gap: c(13, 11),
    alignItems: 'center',
  },
  avatar: {
    width: c(52, 46),
    height: c(52, 46),
    borderRadius: NU.cardRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: NU.cardTitleLg,
    fontWeight: '800',
  },
  copy: {
    flex: 1,
    gap: c(3, 2),
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(8, 6),
  },
  name: {
    flex: 1,
    fontSize: c(15.5, 14),
    fontWeight: '700',
    color: APPT_TEAL,
  },
  statusPill: {
    paddingVertical: c(3, 2),
    paddingHorizontal: c(8, 6),
    borderRadius: 99,
  },
  statusUpcoming: {
    backgroundColor: '#e6f4e8',
  },
  statusConfirmed: {
    backgroundColor: '#eaf1ff',
  },
  statusText: {
    fontSize: NU.label,
    fontWeight: '700',
  },
  statusTextUpcoming: {
    color: APPT_GREEN,
  },
  statusTextConfirmed: {
    color: '#3c63c8',
  },
  meta: {
    fontSize: c(12.5, 11.5),
    color: APPT_MUTED,
  },
  when: {
    fontSize: c(13.5, 12.5),
    fontWeight: '600',
    color: APPT_TEAL,
    marginTop: c(2, 1),
  },
  bookBtn: {
    marginTop: c(8, 6),
    height: NU.searchH,
    borderRadius: 99,
    backgroundColor: APPT_TEAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookText: {
    fontSize: NU.cardTitle,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  empty: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: APPT_BORDER,
    borderRadius: NU.cardRadius,
    padding: c(22, 18),
    gap: c(10, 8),
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: c(17, 15),
    fontWeight: '800',
    color: APPT_TEAL,
  },
  emptyBody: {
    fontSize: c(13.5, 12.5),
    lineHeight: c(20, 18),
    color: APPT_SOFT,
    textAlign: 'center',
  },
  emptyCta: {
    marginTop: c(6, 4),
    paddingVertical: c(11, 9),
    paddingHorizontal: c(18, 14),
    borderRadius: 99,
    backgroundColor: APPT_TEAL,
  },
  emptyCtaText: {
    fontSize: NU.link,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
