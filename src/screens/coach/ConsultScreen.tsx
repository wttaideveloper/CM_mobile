import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { ConsultBody } from '@/components/coach/ConsultBody';
import { ConsultHeader } from '@/components/coach/ConsultHeader';
import {
  CONSULT_BG,
  CONSULT_GREEN,
  CONSULT_PROVIDERS,
} from '@/components/coach/consultData';
import { useAppointmentsStore } from '@/stores/appointments.store';

export function ConsultScreen() {
  const router = useRouter();
  const addAppointment = useAppointmentsStore((s) => s.addAppointment);
  const [selectedSlot, setSelectedSlot] = useState('Mon · 09:00');

  const handleConfirm = () => {
    const provider =
      CONSULT_PROVIDERS.find((item) => item.slots.includes(selectedSlot)) ??
      CONSULT_PROVIDERS[0];

    addAppointment({
      providerId: provider.id,
      providerName: provider.name,
      initials: provider.initials,
      avatarBg: provider.avatarBg,
      avatarColor: provider.avatarColor,
      mode: provider.id === 'lena' ? 'Coaching' : 'Video',
      when: selectedSlot,
      duration: '30 min',
    });

    router.replace('/(main)/coach/appointments');
  };

  return (
    <View style={styles.screen}>
      <AppStatusBar variant="light" backgroundColor={CONSULT_GREEN} />
      <StatusBarFill lightColor={CONSULT_GREEN} darkColor={CONSULT_GREEN} />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <ConsultHeader />
        <ConsultBody
          selectedSlot={selectedSlot}
          onSelectSlot={setSelectedSlot}
          onConfirm={handleConfirm}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: CONSULT_BG,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 12,
  },
});
