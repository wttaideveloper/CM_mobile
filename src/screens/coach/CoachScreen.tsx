import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CoachBody } from '@/components/coach/CoachBody';
import { CoachHeader } from '@/components/coach/CoachHeader';
import { COACH_BG } from '@/components/coach/coachData';

export function CoachScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <CoachHeader />
        <CoachBody />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COACH_BG,
  },
  scroll: {
    flex: 1,
  },
});
