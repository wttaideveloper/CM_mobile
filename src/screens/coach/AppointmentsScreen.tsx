import { ScrollView, StyleSheet, View } from 'react-native';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { AppointmentsBody } from '@/components/coach/AppointmentsBody';
import { AppointmentsHeader } from '@/components/coach/AppointmentsHeader';
import { APPT_BG, APPT_GREEN } from '@/components/coach/appointmentsData';
import { useAppointmentsStore } from '@/stores/appointments.store';

export function AppointmentsScreen() {
  const appointments = useAppointmentsStore((s) => s.appointments);

  return (
    <View style={styles.screen}>
      <AppStatusBar variant="light" backgroundColor={APPT_GREEN} />
      <StatusBarFill lightColor={APPT_GREEN} darkColor={APPT_GREEN} />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <AppointmentsHeader count={appointments.length} />
        <AppointmentsBody appointments={appointments} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: APPT_BG,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 12,
  },
});
